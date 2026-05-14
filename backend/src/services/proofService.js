import { getConnection } from '../db.js';
import oracledb from 'oracledb';

export async function uploadProof(maThamGia, hinhAnhUrl, loai) {
  let connection;
  try {
    connection = await getConnection();
    
    await connection.execute(
      `BEGIN SP_CAPNHAT_MINHCHUNG(:p_MaThamGia, :p_LinkAnh, :p_Loai); END;`,
      { p_MaThamGia: maThamGia, p_LinkAnh: hinhAnhUrl, p_Loai: loai }
    );
    
    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export async function getCampaignProofs(maCD) {
  let connection;
  try {
    connection = await getConnection();
    
    // Get all proofs for the campaign
    // We join with ThamGiaTNV to filter by campaign
    // Join with HoSoSinhVien to get the name
    // Left Join with DiemDanh to see if it was verified already
    const result = await connection.execute(
      `SELECT m.MaMinhChung, m.MaThamGia, m.HinhAnh_URL, m.LoaiMinhChung, m.NgayCapNhat,
              h.HoTen, h.MSSV, t.MaTaiKhoan,
              (SELECT COUNT(*) FROM DiemDanh d WHERE d.MaThamGia = m.MaThamGia) as IsVerified
       FROM MinhChungTNV m
       JOIN ThamGiaTNV t ON m.MaThamGia = t.MaThamGia
       JOIN HoSoSinhVien h ON t.MaTaiKhoan = h.MaTaiKhoan
       WHERE t.MaChienDich = :maCD
       ORDER BY m.NgayCapNhat DESC`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export async function verifyProof(maPhanCong, trangThai) {
  let connection;
  try {
    connection = await getConnection();
    
    await connection.execute(
      `BEGIN SP_DIEMDANH_TNV(:p_MaPhanCong, SYSDATE, :p_TrangThai); END;`,
      { p_MaPhanCong: maPhanCong, p_TrangThai: trangThai }
    );
    
    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export async function getParticipantTasks(maThamGia) {
  let connection;
  try {
    connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT p.MaPhanCong, p.MaCongViec, p.VaiTroCuThe, c.TenCongViec 
       FROM PhanCong p
       JOIN CongViec c ON p.MaCongViec = c.MaCongViec
       WHERE p.MaThamGia = :maThamGia`,
      { maThamGia },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}
