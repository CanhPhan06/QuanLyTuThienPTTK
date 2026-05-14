import { getConnection } from '../db.js';
import oracledb from 'oracledb';

export async function getAllCampaigns() {
  let connection;
  try {
    connection = await getConnection();
    // Use the stored procedure or just query the table since we just want to list campaigns
    const result = await connection.execute(
      `SELECT MaChienDich, TenChienDich, NgayBatDau, NgayKetThuc, DiaDiem, 
              SoLuongTNVToiDa, SoLuongHienTai, TrangThai, MoTa 
       FROM ChienDich
       ORDER BY NgayBatDau DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function createCampaign(data) {
  let connection;
  try {
    connection = await getConnection();
    
    // We need to call SP_THEM_CHIENDICH_MOI and then SP_THIET_LAP_BDH
    const binds = {
      p_TenCD: data.tenChienDich,
      p_NgayBD: new Date(data.ngayBatDau),
      p_NgayKT: new Date(data.ngayKetThuc),
      p_MoTa: data.moTa,
      p_MaNguoiTao: data.maBQL || 'TK00000001',
      p_DiaDiem: data.diaDiem,
      p_SoLuongTNVToiDa: parseInt(data.soLuongMax),
      p_MaCD_Out: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
    };

    const result = await connection.execute(
      `BEGIN SP_THEM_CHIENDICH_MOI(:p_TenCD, :p_NgayBD, :p_NgayKT, :p_MoTa, :p_MaNguoiTao, :p_DiaDiem, :p_SoLuongTNVToiDa, :p_MaCD_Out); END;`,
      binds
    );

    const newCampaignId = result.outBinds.p_MaCD_Out;

    if (data.maBDH) {
      await connection.execute(
        `BEGIN SP_THIET_LAP_BDH(:p_MaTK, :p_MaCD); END;`,
        { p_MaTK: data.maBDH, p_MaCD: newCampaignId }
      );
    }

    await connection.commit();
    return newCampaignId;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function enrollCampaign(maTK, maCD) {
  let connection;
  try {
    connection = await getConnection();
    
    await connection.execute(
      `BEGIN SP_TNV_DANGKY_THAMGIA(:p_MaTK, :p_MaCD); END;`,
      { p_MaTK: maTK, p_MaCD: maCD }
    );

    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function getMyEnrollments(maTK) {
  let connection;
  try {
    connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT t.MaThamGia, t.MaChienDich, c.TenChienDich, t.NgayDangKy, t.TrangThaiDuyet, c.NgayBatDau, c.NgayKetThuc 
       FROM ThamGiaTNV t
       JOIN ChienDich c ON t.MaChienDich = c.MaChienDich
       WHERE t.MaTaiKhoan = :maTK
       ORDER BY t.NgayDangKy DESC`,
      { maTK },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
