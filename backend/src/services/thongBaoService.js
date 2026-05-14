import { getConnection } from '../db.js';

export const getNotifications = async (username) => {
  let conn;
  try {
    conn = await getConnection();
    const selectSql = `SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = :1`;
    const resultTk = await conn.execute(selectSql, [username]);
    if (resultTk.rows.length === 0) throw new Error('User not found');
    const maTaiKhoan = resultTk.rows[0].MATAIKHOAN;

    const sql = `
      SELECT MaThongBao, TieuDe, NoiDung, TO_CHAR(NgayGui, 'YYYY-MM-DD HH24:MI:SS') as NgayGui, TrangThai, LoaiThongBao
      FROM ThongBao
      WHERE MaTaiKhoan = :1
      ORDER BY NgayGui DESC
    `;
    const result = await conn.execute(sql, [maTaiKhoan]);
    
    return result.rows.map(row => ({
      id: row.MATHONGBAO,
      title: row.TIEUDE,
      content: row.NOIDUNG,
      date: row.NGAYGUI,
      status: row.TRANGTHAI,
      category: row.LOAITHONGBAO
    }));
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};

export const markAsRead = async (username, notificationId) => {
  let conn;
  try {
    conn = await getConnection();
    
    const selectSql = `SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = :1`;
    const resultTk = await conn.execute(selectSql, [username]);
    if (resultTk.rows.length === 0) throw new Error('User not found');
    const maTaiKhoan = resultTk.rows[0].MATAIKHOAN;

    const sql = `
      UPDATE ThongBao 
      SET TrangThai = 'DaDoc' 
      WHERE MaThongBao = :1 AND MaTaiKhoan = :2
    `;
    await conn.execute(sql, [notificationId, maTaiKhoan], { autoCommit: true });
    return true;
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};
