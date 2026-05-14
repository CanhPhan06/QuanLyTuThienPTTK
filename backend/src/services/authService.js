import bcrypt from 'bcryptjs';
import { getConnection } from '../db.js';

export const loginUser = async (username, password) => {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT t.MaTaiKhoan, t.TenDangNhap, t.MatKhau, t.Email, t.VaiTro, t.TrangThai, 
             h.HoTen, h.MSSV 
      FROM TaiKhoan t
      LEFT JOIN HoSoSinhVien h ON t.MaTaiKhoan = h.MaTaiKhoan
      WHERE t.TenDangNhap = :1
    `;
    const result = await conn.execute(sql, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      if (user.TRANGTHAI !== 'HoatDong') {
        throw new Error('Tài khoản đang chờ duyệt hoặc đã bị khóa.');
      }

      // Check password (supports bcrypt hash or legacy plaintext for V1 seed data)
      const dbHash = user.MATKHAU;
      let isValid = false;

      // Check if it's a bcrypt hash (starts with $2)
      if (dbHash.startsWith('$2')) {
        isValid = await bcrypt.compare(password, dbHash);
      } else {
        isValid = (password === dbHash);
      }

      if (isValid) {
        return {
          MaTaiKhoan: user.MATAIKHOAN,
          TenDangNhap: user.TENDANGNHAP,
          VaiTro: user.VAITRO,
          Email: user.EMAIL,
          HoTen: user.HOTEN,
          MSSV: user.MSSV
        };
      } else {
        throw new Error('Mật khẩu không chính xác.');
      }
    } else {
      throw new Error('Tên đăng nhập không tồn tại.');
    }
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};

export const registerUser = async (data) => {
  let conn;
  try {
    conn = await getConnection();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.matKhau, salt);

    const sql = `
      BEGIN
        SP_DANGKYTAIKHOAN_TNV(
            :p_TenDangNhap, :p_MatKhau, :p_Email,
            :p_HoTen, :p_MSSV, TO_DATE(:p_NgaySinh, 'YYYY-MM-DD'),
            :p_GioiTinh, :p_Khoa, :p_Lop, :p_SoDienThoai, :p_DiaChi
        );
      END;
    `;

    await conn.execute(sql, {
      p_TenDangNhap: data.tenDangNhap,
      p_MatKhau: hashedPassword,
      p_Email: data.email,
      p_HoTen: data.hoTen,
      p_MSSV: data.mssv,
      p_NgaySinh: data.ngaySinh,
      p_GioiTinh: data.gioiTinh,
      p_Khoa: data.khoa,
      p_Lop: data.lop,
      p_SoDienThoai: data.sdt,
      p_DiaChi: data.diaChi
    }, { autoCommit: true });

    return true;
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};

export const verifyUser = async (username, email) => {
  let conn;
  try {
    conn = await getConnection();
    const sql = `SELECT 1 FROM TaiKhoan WHERE TenDangNhap = :1 AND Email = :2`;
    const result = await conn.execute(sql, [username, email]);
    
    if (result.rows.length > 0) {
      return true;
    }
    throw new Error('Tài khoản hoặc email không tồn tại trong hệ thống.');
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};

export const resetPassword = async (username, newPassword) => {
  let conn;
  try {
    conn = await getConnection();
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const sql = `
      BEGIN
        SP_DOI_MAT_KHAU(:p_TenDangNhap, :p_MatKhauMoi);
      END;
    `;

    await conn.execute(sql, {
      p_TenDangNhap: username,
      p_MatKhauMoi: hashedPassword
    }, { autoCommit: true });

    return true;
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};

export const getProfile = async (username) => {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT t.MaTaiKhoan, t.TenDangNhap, t.Email, t.VaiTro, 
             h.HoTen, h.MSSV, TO_CHAR(h.NgaySinh, 'YYYY-MM-DD') as NgaySinh, h.GioiTinh, 
             h.Khoa, h.Lop, h.SoDienThoai, h.DiaChi

      FROM TaiKhoan t
      LEFT JOIN HoSoSinhVien h ON t.MaTaiKhoan = h.MaTaiKhoan
      WHERE t.TenDangNhap = :1
    `;
    const result = await conn.execute(sql, [username]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        MaTaiKhoan: row.MATAIKHOAN,
        TenDangNhap: row.TENDANGNHAP,
        Email: row.EMAIL,
        VaiTro: row.VAITRO,
        HoTen: row.HOTEN,
        MSSV: row.MSSV,
        NgaySinh: row.NGAYSINH,
        GioiTinh: row.GIOITINH,
        Khoa: row.KHOA,
        Lop: row.LOP,
        SoDienThoai: row.SODIENTHOAI,
        DiaChi: row.DIACHI,
        success: true
      };
    }
    throw new Error('Không tìm thấy thông tin hồ sơ.');
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};

export const updateProfile = async (username, data) => {
  let conn;
  try {
    conn = await getConnection();
    
    const selectSql = `SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = :1`;
    const result = await conn.execute(selectSql, [username]);
    if (result.rows.length === 0) throw new Error('User not found');
    const maTaiKhoan = result.rows[0].MATAIKHOAN;

    const sql = `
      BEGIN
        SP_CAPNHAT_HOSO_NANGCAO(
          :p_MaTK, :p_HoTen, :p_GioiTinh, TO_DATE(:p_NgaySinh, 'YYYY-MM-DD'),
          :p_SDT, :p_Khoa, :p_Lop, :p_Nganh, :p_CCCD, :p_DiaChiTamTru,
          :p_LienHeKhanCap, :p_NgheNghiepVoChong, :p_ThongTinAnhChiEm
        );
      END;
    `;

    await conn.execute(sql, {
      p_MaTK: maTaiKhoan,
      p_HoTen: data.HoTen || '',
      p_GioiTinh: data.GioiTinh || 'Khac',
      p_NgaySinh: data.NgaySinh || '2000-01-01',
      p_SDT: data.SoDienThoai || '',
      p_Khoa: data.Khoa || '',
      p_Lop: data.Lop || '',
      p_Nganh: data.Nganh || '',
      p_CCCD: data.CCCD || '',
      p_DiaChiTamTru: data.DiaChiTamTru || '',
      p_LienHeKhanCap: data.LienHeKhanCap || '',
      p_NgheNghiepVoChong: data.NgheNghiepVoChong || '',
      p_ThongTinAnhChiEm: data.ThongTinAnhChiEm || ''
    }, { autoCommit: true });

    return true;
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
};
