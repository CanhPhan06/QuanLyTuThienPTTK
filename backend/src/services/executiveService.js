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

export async function approveEnrollmentWithCheck(maThamGia, status, expectedCount) {
  let connection;
  try {
    connection = await getConnection();

    const info = await connection.execute(
      `SELECT MaChienDich, TrangThaiDuyet FROM ThamGiaTNV WHERE MaThamGia = :maThamGia`,
      { maThamGia },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (info.rows.length === 0) {
      const error = new Error('Đơn đăng ký không còn tồn tại. Vui lòng tải lại danh sách.');
      error.status = 409;
      throw error;
    }

    const row = info.rows[0];
    const maCD = row.MACHIENDICH || row.MaChienDich;
    const currentStatus = row.TRANGTHAIDUYET || row.TrangThaiDuyet;

    if (currentStatus !== 'ChoDuyet') {
      const error = new Error('Đơn đăng ký đã được người dùng khác xử lý. Vui lòng tải lại danh sách.');
      error.status = 409;
      throw error;
    }

    if (expectedCount !== undefined && expectedCount !== null) {
      const countResult = await connection.execute(
        `SELECT COUNT(*) AS CNT FROM ThamGiaTNV WHERE MaChienDich = :maCD`,
        { maCD },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const currentCount = Number(countResult.rows[0]?.CNT || 0);
      if (currentCount !== Number(expectedCount)) {
        const error = new Error('Danh sách đăng ký đã thay đổi do người dùng khác thêm/xử lý dữ liệu. Vui lòng tải lại trước khi thao tác.');
        error.status = 409;
        throw error;
      }
    }

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

    await connection.execute(
      `SELECT MaThamGia FROM ThamGiaTNV WHERE MaThamGia = :maThamGia FOR UPDATE NOWAIT`,
      { maThamGia },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));
    
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
    if (error.message?.includes('ORA-00054')) {
      const lockError = new Error('Dữ liệu đang được người dùng khác thao tác. Hệ thống đã hủy phân công để tránh xung đột, vui lòng thử lại sau.');
      lockError.status = 409;
      throw lockError;
    }
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
