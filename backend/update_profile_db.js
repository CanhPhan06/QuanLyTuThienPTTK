import { getConnection } from './src/db.js';

const run = async () => {
  let conn;
  try {
    conn = await getConnection();
    console.log("Connected to DB. Running Alter Tables...");

    // Add columns to HoSoSinhVien
    const alterHoSo = [
      "ALTER TABLE HoSoSinhVien ADD CCCD VARCHAR2(20)",
      "ALTER TABLE HoSoSinhVien ADD Nganh NVARCHAR2(100)",
      "ALTER TABLE HoSoSinhVien ADD DiaChiTamTru NVARCHAR2(255)",
      "ALTER TABLE HoSoSinhVien ADD LienHeKhanCap NVARCHAR2(255)",
      "ALTER TABLE HoSoSinhVien ADD NgheNghiepVoChong NVARCHAR2(100)",
      "ALTER TABLE HoSoSinhVien ADD ThongTinAnhChiEm CLOB"
    ];

    for (let query of alterHoSo) {
      try {
        await conn.execute(query);
        console.log("Executed: ", query);
      } catch (e) {
        if (e.errorNum === 1430) {
          console.log("Column already exists, skipping: ", query);
        } else {
          console.error("Error on ", query, e);
        }
      }
    }

    // Add column to ThongBao
    try {
      await conn.execute("ALTER TABLE ThongBao ADD LoaiThongBao VARCHAR2(50) DEFAULT 'HeThong'");
      console.log("Added LoaiThongBao to ThongBao.");
    } catch (e) {
      if (e.errorNum === 1430) {
        console.log("Column LoaiThongBao already exists.");
      } else {
        console.error("Error adding LoaiThongBao: ", e);
      }
    }

    // Create SP_CAPNHAT_HOSO_NANGCAO
    const spCapNhatHoSo = `
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_HOSO_NANGCAO (
    p_MaTK IN VARCHAR2,
    p_HoTen IN NVARCHAR2,
    p_GioiTinh IN NVARCHAR2,
    p_NgaySinh IN DATE,
    p_SDT IN VARCHAR2,
    p_Khoa IN NVARCHAR2,
    p_Lop IN NVARCHAR2,
    p_Nganh IN NVARCHAR2,
    p_CCCD IN VARCHAR2,
    p_DiaChiTamTru IN NVARCHAR2,
    p_LienHeKhanCap IN NVARCHAR2,
    p_NgheNghiepVoChong IN NVARCHAR2,
    p_ThongTinAnhChiEm IN CLOB
)
AS
BEGIN
    UPDATE HoSoSinhVien
    SET HoTen = p_HoTen,
        GioiTinh = p_GioiTinh,
        NgaySinh = p_NgaySinh,
        SoDienThoai = p_SDT,
        Khoa = p_Khoa,
        Lop = p_Lop,
        Nganh = p_Nganh,
        CCCD = p_CCCD,
        DiaChiTamTru = p_DiaChiTamTru,
        LienHeKhanCap = p_LienHeKhanCap,
        NgheNghiepVoChong = p_NgheNghiepVoChong,
        ThongTinAnhChiEm = p_ThongTinAnhChiEm
    WHERE MaTaiKhoan = p_MaTK;
END;
`;
    await conn.execute(spCapNhatHoSo);
    console.log("Created/Updated SP_CAPNHAT_HOSO_NANGCAO successfully.");

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
