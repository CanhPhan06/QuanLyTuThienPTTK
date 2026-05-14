-- ============================================================
-- FILE: 05_triggers_business.sql
-- MUC DICH: Implement 9 Triggers theo yeu cau
-- ============================================================

-- 1. TRG_KIEMTRA_SOLUONG_DANGKY
CREATE OR REPLACE TRIGGER TRG_KIEMTRA_SOLUONG_DANGKY
BEFORE INSERT ON ThamGiaTNV
FOR EACH ROW
DECLARE
    v_SoLuongToiDa NUMBER;
    v_SoLuongHienTai NUMBER;
BEGIN
    SELECT SoLuongTNVToiDa, SoLuongHienTai INTO v_SoLuongToiDa, v_SoLuongHienTai
    FROM ChienDich WHERE MaChienDich = :NEW.MaChienDich;
    
    IF v_SoLuongHienTai >= v_SoLuongToiDa THEN
        RAISE_APPLICATION_ERROR(-20002, 'Chiến dịch đã đủ số lượng tình nguyện viên.');
    END IF;
END;
/

-- 2. TRG_CAPNHAT_SOLUONG_TNV
CREATE OR REPLACE TRIGGER TRG_CAPNHAT_SOLUONG_TNV
AFTER INSERT OR DELETE ON ThamGiaTNV
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE ChienDich SET SoLuongHienTai = NVL(SoLuongHienTai, 0) + 1
        WHERE MaChienDich = :NEW.MaChienDich;
    ELSIF DELETING THEN
        UPDATE ChienDich SET SoLuongHienTai = NVL(SoLuongHienTai, 0) - 1
        WHERE MaChienDich = :OLD.MaChienDich;
    END IF;
END;
/

-- 3. TRG_KIEMTRA_TRUNG_LICH
CREATE OR REPLACE TRIGGER TRG_KIEMTRA_TRUNG_LICH
BEFORE INSERT ON ThamGiaTNV
FOR EACH ROW
DECLARE
    v_NgayBatDauMoi DATE;
    v_NgayKetThucMoi DATE;
    v_Count NUMBER;
BEGIN
    SELECT NgayBatDau, NVL(NgayKetThuc, NgayBatDau) INTO v_NgayBatDauMoi, v_NgayKetThucMoi
    FROM ChienDich WHERE MaChienDich = :NEW.MaChienDich;

    SELECT COUNT(*) INTO v_Count
    FROM ThamGiaTNV tg
    JOIN ChienDich cd ON tg.MaChienDich = cd.MaChienDich
    WHERE tg.MaTaiKhoan = :NEW.MaTaiKhoan
      AND tg.TrangThaiDuyet IN ('ChoDuyet', 'DaDuyet')
      AND (
          (v_NgayBatDauMoi BETWEEN cd.NgayBatDau AND NVL(cd.NgayKetThuc, cd.NgayBatDau)) OR
          (v_NgayKetThucMoi BETWEEN cd.NgayBatDau AND NVL(cd.NgayKetThuc, cd.NgayBatDau)) OR
          (cd.NgayBatDau BETWEEN v_NgayBatDauMoi AND v_NgayKetThucMoi)
      );

    IF v_Count > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Trùng lịch với chiến dịch khác đang tham gia hoặc chờ duyệt.');
    END IF;
END;
/

-- 4. TRG_TINHDIEM_THUONG
CREATE OR REPLACE TRIGGER TRG_TINHDIEM_THUONG
AFTER UPDATE OF TrangThaiDuyet ON ThamGiaTNV
FOR EACH ROW
WHEN (NEW.TrangThaiDuyet = 'HoanThanh' AND OLD.TrangThaiDuyet != 'HoanThanh')
DECLARE
    v_DiemThuong NUMBER;
BEGIN
    SELECT NVL(DiemThuong, 0) INTO v_DiemThuong
    FROM ChienDich WHERE MaChienDich = :NEW.MaChienDich;

    UPDATE HoSoSinhVien
    SET TongDiem = NVL(TongDiem, 0) + v_DiemThuong
    WHERE MaTaiKhoan = :NEW.MaTaiKhoan;
END;
/

-- 5. TRG_CHANXOA_CHIENDICH
CREATE OR REPLACE TRIGGER TRG_CHANXOA_CHIENDICH
BEFORE DELETE ON ChienDich
FOR EACH ROW
DECLARE
    v_Count NUMBER;
BEGIN
    IF :OLD.TrangThai = 'DangHoatDong' THEN
        RAISE_APPLICATION_ERROR(-20005, 'Không thể xóa chiến dịch đang hoạt động. Hãy đổi trạng thái sang Hủy.');
    END IF;

    SELECT COUNT(*) INTO v_Count FROM ThamGiaTNV WHERE MaChienDich = :OLD.MaChienDich;
    IF v_Count > 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Không thể xóa chiến dịch đã có người đăng ký. Hãy đổi trạng thái sang Hủy.');
    END IF;
END;
/

-- 6. TRG_KIEMTRA_TUOI_TNV
CREATE OR REPLACE TRIGGER TRG_KIEMTRA_TUOI_TNV
BEFORE INSERT OR UPDATE ON HoSoSinhVien
FOR EACH ROW
DECLARE
    v_TuoiToiThieu NUMBER;
BEGIN
    SELECT TO_NUMBER(GiaTri) INTO v_TuoiToiThieu FROM ThamSo WHERE TenThamSo = 'TUOI_TOI_THIEU';
    IF MONTHS_BETWEEN(SYSDATE, :NEW.NgaySinh) / 12 < v_TuoiToiThieu THEN
        RAISE_APPLICATION_ERROR(-20007, 'Tình nguyện viên phải từ đủ ' || v_TuoiToiThieu || ' tuổi trở lên.');
    END IF;
END;
/

-- 7. TRG_HUY_CHIENDICH_DONGLOAT
CREATE OR REPLACE TRIGGER TRG_HUY_CHIENDICH_DONGLOAT
AFTER UPDATE OF TrangThai ON ChienDich
FOR EACH ROW
WHEN (NEW.TrangThai = 'Huy')
BEGIN
    UPDATE ThamGiaTNV
    SET TrangThaiDuyet = 'Huy'
    WHERE MaChienDich = :NEW.MaChienDich;
END;
/

-- 8. TRG_KIEMTRA_THOIGIAN
CREATE OR REPLACE TRIGGER TRG_KIEMTRA_THOIGIAN
BEFORE INSERT OR UPDATE ON ChienDich
FOR EACH ROW
BEGIN
    IF INSERTING OR (UPDATING AND :NEW.NgayBatDau != :OLD.NgayBatDau) THEN
        IF :NEW.NgayBatDau < TRUNC(SYSDATE) THEN
            RAISE_APPLICATION_ERROR(-20008, 'Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại.');
        END IF;
    END IF;
    
    IF :NEW.NgayKetThuc IS NOT NULL AND :NEW.NgayKetThuc < :NEW.NgayBatDau THEN
        RAISE_APPLICATION_ERROR(-20009, 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.');
    END IF;
END;
/

-- 9. TRG_GIOIHAN_NHIEMVU
CREATE OR REPLACE TRIGGER TRG_GIOIHAN_NHIEMVU
BEFORE INSERT ON PhanCong
FOR EACH ROW
DECLARE
    v_Count NUMBER;
    v_MaxTasks VARCHAR2(10);
BEGIN
    SELECT TO_NUMBER(GiaTri) INTO v_MaxTasks FROM ThamSo WHERE TenThamSo = 'SO_NHIEM_VU_TOI_DA';
    
    SELECT COUNT(*) INTO v_Count
    FROM PhanCong
    WHERE MaThamGia = :NEW.MaThamGia
      AND TrangThai IN ('ChuaBatDau', 'DangThucHien');
      
    IF v_Count >= v_MaxTasks THEN
        RAISE_APPLICATION_ERROR(-20010, 'Tình nguyện viên chỉ được nhận tối đa ' || v_MaxTasks || ' nhiệm vụ đang chờ hoặc đang xử lý cùng lúc.');
    END IF;
END;
/
