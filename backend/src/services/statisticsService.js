import { executeQuery } from '../db.js';
import oracledb from 'oracledb';

export const getCampaignEfficiency = async (campaignId) => {
  const sql = `
    BEGIN
      SP_BAOCAO_HIEUQUA_CD(:campaignId, :cursor);
    END;
  `;
  const binds = {
    campaignId,
    cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
  };
  
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, binds);
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();
    await resultSet.close();
    
    if (rows.length > 0) {
      return {
         TongThu: rows[0][0] || 0,
         TongChi: rows[0][1] || 0
      };
    }
    return { TongThu: 0, TongChi: 0 };
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) {}
    }
  }
};

export const getTopContributors = async () => {
  const sql = `
    SELECT tk.MaTaiKhoan, tk.HoTen, hs.Khoa, SF_TINH_TONG_GIO_TNV(tk.MaTaiKhoan) as TongGio
    FROM TaiKhoan tk
    LEFT JOIN HoSoSinhVien hs ON tk.MaTaiKhoan = hs.MaTaiKhoan
    WHERE tk.VaiTro = 'TinhNguyenVien'
    ORDER BY TongGio DESC
    FETCH FIRST 5 ROWS ONLY
  `;
  const result = await executeQuery(sql);
  return result.rows;
};

export const getParameters = async () => {
  const sql = `SELECT MaThamSo, TenThamSo, GiaTri, MoTa FROM ThamSo ORDER BY MaThamSo`;
  const result = await executeQuery(sql);
  return result.rows;
};

export const updateParameter = async (maTS, giaTriMoi) => {
  const sql = `
    BEGIN
      SP_THAYDOI_THAMSO(:maTS, :giaTriMoi);
    END;
  `;
  await executeQuery(sql, { maTS, giaTriMoi }, true);
  return { success: true };
};
