import { getConnection } from './src/db.js';

const run = async () => {
  let conn;
  try {
    conn = await getConnection();
    console.log("Connected to DB.");

    const spDangKy = `
CREATE OR REPLACE PROCEDURE SP_DANGKYTAIKHOAN_TNV (
    p_TenDN IN VARCHAR2,
    p_MK IN VARCHAR2,
    p_Email IN VARCHAR2,
    p_HoTen IN NVARCHAR2,
    p_MSSV IN VARCHAR2,
    p_NgaySinh IN DATE,
    p_GioiTinh IN NVARCHAR2,
    p_Khoa IN NVARCHAR2,
    p_Lop IN NVARCHAR2,
    p_SDT IN VARCHAR2,
    p_DiaChi IN NVARCHAR2
)
AS
    v_MaTK VARCHAR2(10);
BEGIN
    INSERT INTO TaiKhoan(MaTaiKhoan, TenDangNhap, MatKhau, Email, VaiTro, TrangThai)
    VALUES (NULL, p_TenDN, p_MK, p_Email, 'TinhNguyenVien', 'HoatDong')
    RETURNING MaTaiKhoan INTO v_MaTK;
    
    INSERT INTO HoSoSinhVien(MaHoSo, MaTaiKhoan, HoTen, MSSV, NgaySinh, GioiTinh, Khoa, Lop, SoDienThoai, DiaChi)
    VALUES (NULL, v_MaTK, p_HoTen, p_MSSV, p_NgaySinh, p_GioiTinh, p_Khoa, p_Lop, p_SDT, p_DiaChi);
END;
`;

    const spDoiMatKhau = `
CREATE OR REPLACE PROCEDURE SP_DOI_MAT_KHAU (
    p_TenDN IN VARCHAR2,
    p_MKMoi IN VARCHAR2
)
AS
BEGIN
    UPDATE TaiKhoan SET MatKhau = p_MKMoi WHERE TenDangNhap = p_TenDN;
END;
`;

    await conn.execute(spDangKy);
    console.log("Created/Updated SP_DANGKYTAIKHOAN_TNV successfully.");

    await conn.execute(spDoiMatKhau);
    console.log("Created/Updated SP_DOI_MAT_KHAU successfully.");

  } catch (err) {
    console.error("Error executing DB script:", err);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

run();
