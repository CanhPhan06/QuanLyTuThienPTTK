import fs from 'fs';
import oracledb from 'oracledb';
import { getConnection } from './src/db.js';

async function run() {
  let conn;
  try {
    conn = await getConnection();
    console.log("Connected to DB. Cleaning up old data...");

    const tablesResult = await conn.execute("SELECT table_name FROM user_tables");
    const allTables = tablesResult.rows.map(r => r[0] || r.TABLE_NAME);

    console.log("Disabling all FK constraints and triggers...");
    await conn.execute(`
      BEGIN
        FOR c IN (SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type = 'R') LOOP
          EXECUTE IMMEDIATE 'ALTER TABLE "' || c.table_name || '" DISABLE CONSTRAINT "' || c.constraint_name || '"';
        END LOOP;
      END;
    `);

    for (const table of allTables) {
      try {
        await conn.execute(`ALTER TABLE "${table}" DISABLE ALL TRIGGERS`);
      } catch(e) {}
    }

    console.log("Deleting all data...");
    for (const table of allTables) {
      try {
        await conn.execute(`DELETE FROM "${table}"`);
      } catch (e) {
        console.log(`Error clearing table ${table}: ${e.message}`);
      }
    }
    await conn.commit();
    console.log("Tables cleared.");

    console.log("Enabling all FK constraints and triggers...");
    for (const table of allTables) {
      try {
        await conn.execute(`ALTER TABLE "${table}" ENABLE ALL TRIGGERS`);
      } catch(e) {}
    }

    await conn.execute(`
      BEGIN
        FOR c IN (SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type = 'R') LOOP
          EXECUTE IMMEDIATE 'ALTER TABLE "' || c.table_name || '" ENABLE CONSTRAINT "' || c.constraint_name || '"';
        END LOOP;
      END;
    `);

    console.log("Resetting sequences...");
    const seqs = [
      's_taikhoan_id','s_hoso_id','s_nhatky_id','s_chiendich_id',
      's_duyet_id','s_tintuc_id','s_binhluan_id','s_thamgia_id',
      's_congviec_id','s_phancong_id','s_diemdanh_id',
      's_minhchungtnv_id','s_minhchungct_id','s_giaychungnhan_id',
      's_quyengop_id','s_thanhtoan_id','s_chitieu_id',
      's_doitac_id','s_taitro_id','s_loaivp_id',
      's_phieuqgvp_id','s_phieuxuat_id','s_thongbao_id','s_thamso_id'
    ];
    for (const seq of seqs) {
      try {
        await conn.execute(`DROP SEQUENCE ${seq}`);
      } catch(e) {}
      try {
        await conn.execute(`CREATE SEQUENCE ${seq} START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE`);
      } catch(e) {}
    }

    // 2. Read and execute seed data block
    const seedSql = fs.readFileSync('../database/08_SeedData.sql', 'utf8');
    // Extract the PL/SQL block: starts with DECLARE or BEGIN, ends with END;
    const match = seedSql.match(/(DECLARE[\s\S]*?END;)/i);
    if (match) {
      console.log("Executing seed block...");
      await conn.execute(match[1]);
      await conn.commit();
      console.log("Seed data applied successfully!");
    } else {
      console.log("Could not find DECLARE...END block in seed file.");
    }



    // 4. Apply updated Procedure SP_DANGKYTAIKHOAN_TNV
    const procsSql = fs.readFileSync('../database/06_stored_procedures.sql', 'utf8');
    const procMatch = procsSql.match(/CREATE OR REPLACE PROCEDURE SP_DANGKYTAIKHOAN_TNV[\s\S]*?END;/i);
    if (procMatch) {
      await conn.execute(procMatch[0]);
      console.log("Procedure SP_DANGKYTAIKHOAN_TNV updated successfully.");
    }
    
    // Also update other procedures from previous turns just in case they were lost
    // (SP_THEM_CHIENDICH_MOI, SP_TNV_DANGKY_THAMGIA, SP_TAO_NHIEMVU_MACDINH, SP_PHANCONG_TNV)
    const procMatch2 = procsSql.match(/CREATE OR REPLACE PROCEDURE SP_THEM_CHIENDICH_MOI[\s\S]*?END;/i);
    if (procMatch2) await conn.execute(procMatch2[0]);
    
    const procMatch3 = procsSql.match(/CREATE OR REPLACE PROCEDURE SP_TNV_DANGKY_THAMGIA[\s\S]*?END;/i);
    if (procMatch3) await conn.execute(procMatch3[0]);
    
    const procMatch4 = procsSql.match(/CREATE OR REPLACE PROCEDURE SP_TAO_NHIEMVU_MACDINH[\s\S]*?END;/i);
    if (procMatch4) await conn.execute(procMatch4[0]);
    
    const procMatch5 = procsSql.match(/CREATE OR REPLACE PROCEDURE SP_PHANCONG_TNV[\s\S]*?END;/i);
    if (procMatch5) await conn.execute(procMatch5[0]);
    console.log("Other procedures updated successfully.");

  } catch (error) {
    console.error("Error during DB update:", error);
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
    process.exit(0);
  }
}

run();
