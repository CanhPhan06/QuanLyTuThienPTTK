import { getConnection } from '../db.js';
import oracledb from 'oracledb';

export async function getEnrollmentsForBDH(maTK) {
  let connection;
  try {
    connection = await getConnection();
    
    // First, find the campaign the BDH is assigned to
    const bdhResult = await connection.execute(
      `SELECT MaChienDich FROM BanDieuHanh WHERE MaTaiKhoan = :maTK`,
      { maTK },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (bdhResult.rows.length === 0) {
      return []; // Not assigned to any campaign
    }
    
    const maCD = bdhResult.rows[0].MACHIENDICH || bdhResult.rows[0].MaChienDich;
    
    const result = await connection.execute(
      `SELECT t.MaThamGia, t.MaChienDich, t.MaTaiKhoan, t.NgayDangKy, t.TrangThaiDuyet,
              h.HoTen, h.MSSV, h.Khoa, h.Lop, h.SoDienThoai
       FROM ThamGiaTNV t
       JOIN HoSoSinhVien h ON t.MaTaiKhoan = h.MaTaiKhoan
       WHERE t.MaChienDich = :maCD
       ORDER BY t.NgayDangKy DESC`,
      { maCD },
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

export async function approveEnrollment(maThamGia, status) {
  let connection;
  try {
    connection = await getConnection();
    
    await connection.execute(
      `BEGIN SP_DUYET_DANGKY_TNV(:p_MaThamGia, :p_TrangThaiMoi); END;`,
      { p_MaThamGia: maThamGia, p_TrangThaiMoi: status }
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

export async function assignTask(maThamGia, maChienDich, tenNhiemVu, vaiTro) {
  let connection;
  try {
    connection = await getConnection();
    
    // 1. Create or get task
    const taskResult = await connection.execute(
      `BEGIN SP_TAO_NHIEMVU_MACDINH(:p_MaCD, :p_TenCV, :p_MaCV_Out); END;`,
      { 
        p_MaCD: maChienDich, 
        p_TenCV: tenNhiemVu,
        p_MaCV_Out: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      }
    );
    
    const maCongViec = taskResult.outBinds.p_MaCV_Out;
    
    // 2. Assign role
    await connection.execute(
      `BEGIN SP_PHANCONG_TNV(:p_MaThamGia, :p_MaCongViec, :p_VaiTro); END;`,
      { 
        p_MaThamGia: maThamGia,
        p_MaCongViec: maCongViec,
        p_VaiTro: vaiTro
      }
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
