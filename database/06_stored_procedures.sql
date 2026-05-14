-- ============================================================
-- FILE: 06_stored_procedures.sql
-- MUC DICH: Implement 31 SPs
-- ============================================================

-- 1. SP_DANGKYTAIKHOAN_TNV
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
/

-- 2. SP_CAPNHAT_HOSO_TNV
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_HOSO_TNV (
    p_MaTK IN VARCHAR2,
    p_HoTen IN NVARCHAR2,
    p_SDT IN VARCHAR2,
    p_Khoa IN NVARCHAR2
)
AS
BEGIN
    UPDATE HoSoSinhVien
    SET HoTen = p_HoTen, SoDienThoai = p_SDT, Khoa = p_Khoa
    WHERE MaTaiKhoan = p_MaTK;
END;
/

-- 3. SP_CAPNHAT_VAITRO
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_VAITRO (
    p_MaTK IN VARCHAR2,
    p_VaiTroMoi IN VARCHAR2,
    p_MaCD IN VARCHAR2 DEFAULT NULL
)
AS
BEGIN
    UPDATE TaiKhoan
    SET VaiTro = p_VaiTroMoi
    WHERE MaTaiKhoan = p_MaTK;
    
    IF p_VaiTroMoi = 'BanDieuHanh' THEN
        IF p_MaCD IS NULL THEN
            RAISE_APPLICATION_ERROR(-20001, 'Cap nhat BanDieuHanh yeu cau MaChienDich');
        END IF;
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM BanDieuHanh WHERE MaTaiKhoan = p_MaTK;
            IF v_count = 0 THEN
                INSERT INTO BanDieuHanh(MaTaiKhoan, MaChienDich) VALUES (p_MaTK, p_MaCD);
            ELSE
                UPDATE BanDieuHanh SET MaChienDich = p_MaCD WHERE MaTaiKhoan = p_MaTK;
            END IF;
        END;
    ELSE
        DELETE FROM BanDieuHanh WHERE MaTaiKhoan = p_MaTK;
    END IF;
END;
/

-- 4. SP_KIEMTRA_QUYEN
CREATE OR REPLACE PROCEDURE SP_KIEMTRA_QUYEN (
    p_MaTK IN VARCHAR2,
    p_HanhDong IN NVARCHAR2,
    p_Allowed OUT NUMBER
)
AS
    v_VaiTro VARCHAR2(20);
BEGIN
    p_Allowed := 0;
    SELECT VaiTro INTO v_VaiTro FROM TaiKhoan WHERE MaTaiKhoan = p_MaTK;
    IF v_VaiTro IN ('QuanTriVien', 'BanQuanLy', 'BanDieuHanh') THEN
        p_Allowed := 1;
    ELSIF v_VaiTro = 'TinhNguyenVien' AND p_HanhDong = 'DangKy' THEN
        p_Allowed := 1;
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN p_Allowed := 0;
END;
/

-- 5. SP_LOG_ACTION
CREATE OR REPLACE PROCEDURE SP_LOG_ACTION (
    p_MaTK IN VARCHAR2,
    p_HanhDong IN NVARCHAR2,
    p_ChiTiet IN CLOB
)
AS
BEGIN
    INSERT INTO NhatKyHeThong(MaNhatKy, MaTaiKhoan, HanhDong, ChiTiet)
    VALUES (NULL, p_MaTK, p_HanhDong, p_ChiTiet);
END;
/

-- 6. SP_THEM_CHIENDICH_MOI
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
/

-- 7. SP_CAPNHAT_CHIENDICH
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_CHIENDICH (
    p_MaCD IN VARCHAR2,
    p_MoTa IN CLOB,
    p_ThoiGian IN DATE
)
AS
BEGIN
    UPDATE ChienDich
    SET MoTa = p_MoTa, NgayBatDau = p_ThoiGian
    WHERE MaChienDich = p_MaCD;
END;
/

-- 8. SP_XOA_CHIENDICH
CREATE OR REPLACE PROCEDURE SP_XOA_CHIENDICH (
    p_MaCD IN VARCHAR2
)
AS
BEGIN
    DELETE FROM ChienDich WHERE MaChienDich = p_MaCD;
END;
/

-- 9. SP_MO_DANGKY_CD
CREATE OR REPLACE PROCEDURE SP_MO_DANGKY_CD (
    p_MaCD IN VARCHAR2
)
AS
BEGIN
    UPDATE ChienDich SET TrangThai = 'DangHoatDong' WHERE MaChienDich = p_MaCD;
END;
/

-- 10. SP_DONG_CHIENDICH
CREATE OR REPLACE PROCEDURE SP_DONG_CHIENDICH (
    p_MaCD IN VARCHAR2
)
AS
BEGIN
    UPDATE ChienDich SET TrangThai = 'DaKetThuc' WHERE MaChienDich = p_MaCD;
END;
/

-- 11. SP_THEM_CONGVIEC
CREATE OR REPLACE PROCEDURE SP_THEM_CONGVIEC (
    p_MaCD IN VARCHAR2,
    p_TenCV IN NVARCHAR2,
    p_SoLuongCan IN NUMBER
)
AS
BEGIN
    INSERT INTO CongViec(MaCongViec, MaChienDich, TenCongViec, SoLuongTNVCan)
    VALUES (NULL, p_MaCD, p_TenCV, p_SoLuongCan);
END;
/

-- 12. SP_PHANCONG_TNV
CREATE OR REPLACE PROCEDURE SP_PHANCONG_TNV (
    p_MaThamGia IN VARCHAR2,
    p_MaCongViec IN VARCHAR2
)
AS
BEGIN
    INSERT INTO PhanCong(MaPhanCong, MaThamGia, MaCongViec, TrangThai)
    VALUES (NULL, p_MaThamGia, p_MaCongViec, 'ChuaBatDau');
END;
/

-- 13. SP_TNV_DANGKY_THAMGIA
CREATE OR REPLACE PROCEDURE SP_TNV_DANGKY_THAMGIA (
    p_MaTK IN VARCHAR2,
    p_MaCD IN VARCHAR2
)
AS
BEGIN
    INSERT INTO ThamGiaTNV(MaThamGia, MaTaiKhoan, MaChienDich, TrangThaiDuyet)
    VALUES (NULL, p_MaTK, p_MaCD, 'ChoDuyet');
END;
/

-- 14. SP_DUYET_DANGKY_TNV
CREATE OR REPLACE PROCEDURE SP_DUYET_DANGKY_TNV (
    p_MaThamGia IN VARCHAR2,
    p_TrangThaiMoi IN VARCHAR2
)
AS
BEGIN
    UPDATE ThamGiaTNV SET TrangThaiDuyet = p_TrangThaiMoi WHERE MaThamGia = p_MaThamGia;
END;
/

-- 15. SP_DIEMDANH_TNV
CREATE OR REPLACE PROCEDURE SP_DIEMDANH_TNV (
    p_MaPhanCong IN VARCHAR2,
    p_Ngay IN DATE,
    p_TrangThai IN VARCHAR2
)
AS
    v_MaThamGia VARCHAR2(10);
BEGIN
    SELECT MaThamGia INTO v_MaThamGia FROM PhanCong WHERE MaPhanCong = p_MaPhanCong;
    INSERT INTO DiemDanh(MaDiemDanh, MaThamGia, NgayDiemDanh, TrangThai)
    VALUES (NULL, v_MaThamGia, p_Ngay, p_TrangThai);
END;
/

-- 16. SP_CAPNHAT_MINHCHUNG
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_MINHCHUNG (
    p_MaThamGia IN VARCHAR2,
    p_LinkAnh IN VARCHAR2,
    p_Loai IN NVARCHAR2
)
AS
BEGIN
    INSERT INTO MinhChungTNV(MaMinhChung, MaThamGia, HinhAnh_URL, LoaiMinhChung)
    VALUES (NULL, p_MaThamGia, p_LinkAnh, p_Loai);
END;
/

-- 17. SP_DANHGIA_TNV
CREATE OR REPLACE PROCEDURE SP_DANHGIA_TNV (
    p_MaThamGia IN VARCHAR2,
    p_Diem IN NUMBER,
    p_NhanXet IN CLOB
)
AS
BEGIN
    UPDATE ThamGiaTNV SET DiemDanhGia = p_Diem WHERE MaThamGia = p_MaThamGia;
END;
/

-- 18. SP_CAP_CHUNGNHAN_CD
CREATE OR REPLACE PROCEDURE SP_CAP_CHUNGNHAN_CD (
    p_MaCD IN VARCHAR2
)
AS
    v_GioToiThieu NUMBER;
BEGIN
    -- Logic Hierarchy: Check ChienDich first, fallback to ThamSo
    SELECT NVL(GioToiThieuCN, (SELECT TO_NUMBER(GiaTri) FROM ThamSo WHERE TenThamSo = 'GIO_CONG_MAC_DINH'))
    INTO v_GioToiThieu
    FROM ChienDich
    WHERE MaChienDich = p_MaCD;

    -- Issue certificate only if accumulated hours >= v_GioToiThieu
    INSERT INTO GiayChungNhan(MaChungNhan, MaThamGia, NgayCap, XepLoai)
    SELECT NULL, tg.MaThamGia, SYSDATE, SF_GET_XEP_LOAI(tg.MaThamGia)
    FROM ThamGiaTNV tg
    WHERE tg.MaChienDich = p_MaCD 
      AND tg.TrangThaiDuyet = 'HoanThanh'
      AND (SELECT NVL(SUM(SoGioGhiNhan), 0) FROM DiemDanh dd WHERE dd.MaThamGia = tg.MaThamGia) >= v_GioToiThieu;
END;
/

-- 19. SP_GHI_NHAN_QUYENGOP
CREATE OR REPLACE PROCEDURE SP_GHI_NHAN_QUYENGOP (
    p_MaTK IN VARCHAR2,
    p_MaCD IN VARCHAR2,
    p_SoTien IN NUMBER
)
AS
BEGIN
    INSERT INTO QuyenGopTien(MaQuyenGop, MaTaiKhoan, MaChienDich, SoTien, PhuongThuc)
    VALUES (NULL, p_MaTK, p_MaCD, p_SoTien, 'ChuyenKhoan');
END;
/

-- 20. SP_THEM_PHIEU_CHI
CREATE OR REPLACE PROCEDURE SP_THEM_PHIEU_CHI (
    p_MaCD IN VARCHAR2,
    p_SoTien IN NUMBER,
    p_MucDich IN NVARCHAR2
)
AS
BEGIN
    INSERT INTO ChiTieu(MaChiTieu, MaChienDich, TenKhoanChi, SoTienChi, NgayChi, MucDich)
    VALUES (NULL, p_MaCD, p_MucDich, p_SoTien, SYSDATE, p_MucDich);
END;
/

-- 21. SP_THEM_DOITAC
CREATE OR REPLACE PROCEDURE SP_THEM_DOITAC (
    p_TenDoiTac IN NVARCHAR2,
    p_SDT IN VARCHAR2,
    p_Email IN VARCHAR2
)
AS
BEGIN
    INSERT INTO DoiTac(MaDoiTac, TenDoiTac, SoDienThoai, Email)
    VALUES (NULL, p_TenDoiTac, p_SDT, p_Email);
END;
/

-- 22. SP_NHAPKHO_VATPHAM
CREATE OR REPLACE PROCEDURE SP_NHAPKHO_VATPHAM (
    p_MaCD IN VARCHAR2,
    p_MaLoai IN VARCHAR2,
    p_SL IN NUMBER
)
AS
    v_MaPhieu VARCHAR2(10);
BEGIN
    INSERT INTO PhieuQuyenGopVP(MaPhieuQG, MaTaiKhoan, MaChienDich, NguoiNhan)
    VALUES (NULL, (SELECT MIN(MaTaiKhoan) FROM TaiKhoan WHERE VaiTro = 'BanQuanLy'), p_MaCD, 'Admin')
    RETURNING MaPhieuQG INTO v_MaPhieu;
    
    INSERT INTO ChiTietQuyenGopVP(MaPhieuQG, MaLoai, SoLuong)
    VALUES (v_MaPhieu, p_MaLoai, p_SL);
    
    UPDATE LoaiVatPham SET SoLuongTon = SoLuongTon + p_SL WHERE MaLoai = p_MaLoai;
END;
/

-- 23. SP_XUATKHO_VATPHAM
CREATE OR REPLACE PROCEDURE SP_XUATKHO_VATPHAM (
    p_MaCD IN VARCHAR2,
    p_MaLoai IN VARCHAR2,
    p_SL IN NUMBER,
    p_NguoiNhan IN NVARCHAR2
)
AS
    v_MaPhieu VARCHAR2(10);
BEGIN
    INSERT INTO PhieuXuatVatPham(MaPhieuXuat, MaChienDich, NgayXuat, NguoiXuat, NguoiNhan)
    VALUES (NULL, p_MaCD, SYSDATE, 'Admin', p_NguoiNhan)
    RETURNING MaPhieuXuat INTO v_MaPhieu;
    
    INSERT INTO ChiTietXuatVP(MaPhieuXuat, MaLoai, SoLuong)
    VALUES (v_MaPhieu, p_MaLoai, p_SL);
    
    UPDATE LoaiVatPham SET SoLuongTon = SoLuongTon - p_SL WHERE MaLoai = p_MaLoai;
END;
/

-- 24. SP_CAPNHAT_VATPHAM
CREATE OR REPLACE PROCEDURE SP_CAPNHAT_VATPHAM (
    p_MaLoai IN VARCHAR2,
    p_TenMoi IN NVARCHAR2,
    p_DonVi IN NVARCHAR2
)
AS
BEGIN
    UPDATE LoaiVatPham SET TenLoai = p_TenMoi, DonViTinh = p_DonVi WHERE MaLoai = p_MaLoai;
END;
/

-- 25. SP_LAY_DS_CHIENDICH_MO
CREATE OR REPLACE PROCEDURE SP_LAY_DS_CHIENDICH_MO (
    p_Cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_Cursor FOR
    SELECT * FROM ChienDich WHERE TrangThai = 'DangHoatDong';
END;
/

-- 26. SP_LAY_TNV_THEO_CD
CREATE OR REPLACE PROCEDURE SP_LAY_TNV_THEO_CD (
    p_MaCD IN VARCHAR2,
    p_Cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_Cursor FOR
    SELECT * FROM ThamGiaTNV WHERE MaChienDich = p_MaCD;
END;
/

-- 27. SP_LAY_LICHSU_TNV
CREATE OR REPLACE PROCEDURE SP_LAY_LICHSU_TNV (
    p_MaTK IN VARCHAR2,
    p_Cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_Cursor FOR
    SELECT * FROM ThamGiaTNV WHERE MaTaiKhoan = p_MaTK;
END;
/

-- 28. SP_LAY_VP_TONKHO_THAP
CREATE OR REPLACE PROCEDURE SP_LAY_VP_TONKHO_THAP (
    p_Cursor OUT SYS_REFCURSOR
)
AS
    v_Nguong NUMBER;
BEGIN
    SELECT TO_NUMBER(GiaTri) INTO v_Nguong FROM ThamSo WHERE TenThamSo = 'NGUONG_TON_KHO_CANH_BAO';
    OPEN p_Cursor FOR
    SELECT * FROM LoaiVatPham WHERE SoLuongTon < v_Nguong;
END;
/

-- 29. SP_LAY_DS_TINTUC
CREATE OR REPLACE PROCEDURE SP_LAY_DS_TINTUC (
    p_MaCD IN VARCHAR2,
    p_Cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_Cursor FOR
    SELECT * FROM TinTuc WHERE MaChienDich = p_MaCD;
END;
/

-- 30. SP_THAYDOI_THAMSO
CREATE OR REPLACE PROCEDURE SP_THAYDOI_THAMSO (
    p_MaTS IN VARCHAR2,
    p_GiaTriMoi IN VARCHAR2
)
AS
BEGIN
    UPDATE ThamSo SET GiaTri = p_GiaTriMoi WHERE MaThamSo = p_MaTS;
END;
/

-- 31. SP_BAOCAO_HIEUQUA_CD
CREATE OR REPLACE PROCEDURE SP_BAOCAO_HIEUQUA_CD (
    p_MaCD IN VARCHAR2,
    p_Cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_Cursor FOR
    SELECT 
        (SELECT NVL(SUM(SoTien), 0) FROM QuyenGopTien WHERE MaChienDich = p_MaCD) AS TongThu,
        (SELECT NVL(SUM(SoTienChi), 0) FROM ChiTieu WHERE MaChienDich = p_MaCD) AS TongChi
    FROM DUAL;
END;
/

-- 32. SP_THIET_LAP_BDH
CREATE OR REPLACE PROCEDURE SP_THIET_LAP_BDH (
    p_MaTK IN VARCHAR2,
    p_MaCD IN VARCHAR2
)
AS
    v_VaiTro VARCHAR2(20);
BEGIN
    SELECT VaiTro INTO v_VaiTro FROM TaiKhoan WHERE MaTaiKhoan = p_MaTK;
    IF v_VaiTro != 'BanDieuHanh' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Tai khoan khong co vai tro BanDieuHanh');
    END IF;
    
    -- Insert hoac update neu da ton tai (xu ly Unique/PK constraint)
    DECLARE
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM BanDieuHanh WHERE MaTaiKhoan = p_MaTK;
        IF v_count = 0 THEN
            INSERT INTO BanDieuHanh(MaTaiKhoan, MaChienDich) VALUES (p_MaTK, p_MaCD);
        ELSE
            UPDATE BanDieuHanh SET MaChienDich = p_MaCD WHERE MaTaiKhoan = p_MaTK;
        END IF;
    END;
END;
/

