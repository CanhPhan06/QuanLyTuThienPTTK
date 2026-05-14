const fs = require('fs');
const path = require('path');
const content = `

export const getProfile = async (username) => {
  let conn;
  try {
    conn = await getConnection();
    const sql = \`
      SELECT t.MaTaiKhoan, t.TenDangNhap, t.Email, t.VaiTro, 
             h.HoTen, h.MSSV, TO_CHAR(h.NgaySinh, 'YYYY-MM-DD') as NgaySinh, h.GioiTinh, 
             h.Khoa, h.Lop, h.SoDienThoai, h.DiaChi,
             h.CCCD, h.Nganh, h.DiaChiTamTru, h.LienHeKhanCap, h.NgheNghiepVoChong, h.ThongTinAnhChiEm
      FROM TaiKhoan t
      LEFT JOIN HoSoSinhVien h ON t.MaTaiKhoan = h.MaTaiKhoan
      WHERE t.TenDangNhap = :1
    \`;
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
        CCCD: row.CCCD,
        Nganh: row.NGANH,
        DiaChiTamTru: row.DIACHITAMTRU,
        LienHeKhanCap: row.LIENHEKHANCAP,
        NgheNghiepVoChong: row.NGHENGHIEPVOCHONG,
        ThongTinAnhChiEm: row.THONGTINANHCHIEM
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
    
    const selectSql = \`SELECT MaTaiKhoan FROM TaiKhoan WHERE TenDangNhap = :1\`;
    const result = await conn.execute(selectSql, [username]);
    if (result.rows.length === 0) throw new Error('User not found');
    const maTaiKhoan = result.rows[0].MATAIKHOAN;

    const sql = \`
      BEGIN
        SP_CAPNHAT_HOSO_NANGCAO(
          :p_MaTK, :p_HoTen, :p_GioiTinh, TO_DATE(:p_NgaySinh, 'YYYY-MM-DD'),
          :p_SDT, :p_Khoa, :p_Lop, :p_Nganh, :p_CCCD, :p_DiaChiTamTru,
          :p_LienHeKhanCap, :p_NgheNghiepVoChong, :p_ThongTinAnhChiEm
        );
      END;
    \`;

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
`;
fs.appendFileSync(path.join(__dirname, 'src', 'services', 'authService.js'), content);
