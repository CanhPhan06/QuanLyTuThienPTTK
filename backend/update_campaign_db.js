import { getConnection } from './src/db.js';

async function runUpdate() {
  let connection;

  try {
    connection = await getConnection();
    console.log('Connected to Oracle Database');

    // 1. Update SP_THEM_CHIENDICH_MOI
    const spThemChienDich = `
      CREATE OR REPLACE PROCEDURE SP_THEM_CHIENDICH_MOI (
          p_TenCD IN NVARCHAR2,
          p_NgayBD IN DATE,
          p_NgayKT IN DATE,
          p_MoTa IN CLOB,
          p_MaNguoiTao IN VARCHAR2,
          p_DiaDiem IN NVARCHAR2,
          p_SoLuongTNVToiDa IN NUMBER,
          p_MaCD_Out OUT VARCHAR2
      )
      AS
      BEGIN
          INSERT INTO ChienDich(MaChienDich, TenChienDich, NgayBatDau, NgayKetThuc, MoTa, DiaDiem, SoLuongTNVToiDa, MaNguoiTao, TrangThai)
          VALUES (NULL, p_TenCD, p_NgayBD, p_NgayKT, p_MoTa, p_DiaDiem, p_SoLuongTNVToiDa, p_MaNguoiTao, 'DangHoatDong')
          RETURNING MaChienDich INTO p_MaCD_Out;
      END;
    `;

    await connection.execute(spThemChienDich);
    console.log('Successfully updated SP_THEM_CHIENDICH_MOI');

    // 2. Update SP_TNV_DANGKY_THAMGIA
    const spTnvDangKy = `
      CREATE OR REPLACE PROCEDURE SP_TNV_DANGKY_THAMGIA (
          p_MaTK IN VARCHAR2,
          p_MaCD IN VARCHAR2
      )
      AS
          v_TrangThaiTK VARCHAR2(20);
      BEGIN
          -- Check 1: Must be ACTIVE (HoatDong)
          SELECT TrangThai INTO v_TrangThaiTK FROM TaiKhoan WHERE MaTaiKhoan = p_MaTK;
          IF v_TrangThaiTK != 'HoatDong' THEN
              RAISE_APPLICATION_ERROR(-20011, 'Tài khoản chưa được kích hoạt hoặc bị khóa.');
          END IF;
          
          INSERT INTO ThamGiaTNV(MaThamGia, MaTaiKhoan, MaChienDich, TrangThaiDuyet)
          VALUES (NULL, p_MaTK, p_MaCD, 'ChoDuyet');
      END;
    `;

    await connection.execute(spTnvDangKy);
    console.log('Successfully updated SP_TNV_DANGKY_THAMGIA');

    // 3. Create SP_TAO_NHIEMVU_MACDINH
    const spTaoNhiemVu = `
      CREATE OR REPLACE PROCEDURE SP_TAO_NHIEMVU_MACDINH (
          p_MaCD IN VARCHAR2,
          p_TenCV IN NVARCHAR2,
          p_MaCV_Out OUT VARCHAR2
      )
      AS
          v_Count NUMBER;
      BEGIN
          SELECT COUNT(*) INTO v_Count FROM CongViec WHERE MaChienDich = p_MaCD AND TenCongViec = p_TenCV;
          IF v_Count = 0 THEN
              INSERT INTO CongViec(MaCongViec, MaChienDich, TenCongViec, SoLuongTNVCan)
              VALUES (NULL, p_MaCD, p_TenCV, 100)
              RETURNING MaCongViec INTO p_MaCV_Out;
          ELSE
              SELECT MaCongViec INTO p_MaCV_Out FROM CongViec WHERE MaChienDich = p_MaCD AND TenCongViec = p_TenCV FETCH FIRST 1 ROWS ONLY;
          END IF;
      END;
    `;

    await connection.execute(spTaoNhiemVu);
    console.log('Successfully created SP_TAO_NHIEMVU_MACDINH');
    
    // 4. Update SP_PHANCONG_TNV
    const spPhanCongTNV = `
      CREATE OR REPLACE PROCEDURE SP_PHANCONG_TNV (
          p_MaThamGia IN VARCHAR2,
          p_MaCongViec IN VARCHAR2,
          p_VaiTroCuThe IN NVARCHAR2
      )
      AS
      BEGIN
          INSERT INTO PhanCong(MaPhanCong, MaThamGia, MaCongViec, VaiTroCuThe, TrangThai, NgayGiao)
          VALUES (NULL, p_MaThamGia, p_MaCongViec, p_VaiTroCuThe, 'ChuaBatDau', SYSDATE);
      END;
    `;

    await connection.execute(spPhanCongTNV);
    console.log('Successfully updated SP_PHANCONG_TNV');

    await connection.commit();
    console.log('Database changes committed.');

  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

runUpdate();
