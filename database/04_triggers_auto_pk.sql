-- ============================================================
-- FILE: 04_triggers_auto_pk.sql
-- MUC DICH: Tao TRIGGERS tu dong gan Khoa Chinh tu SEQUENCES khi INSERT
-- CHAY SAU: 03_indexes.sql
-- ============================================================

-- Trigger auto PK cho TaiKhoan
CREATE OR REPLACE TRIGGER trg_bi_TaiKhoan
BEFORE INSERT ON TaiKhoan FOR EACH ROW
BEGIN
    IF :NEW.MaTaiKhoan IS NULL THEN
        :NEW.MaTaiKhoan := 'TK' || LPAD(s_taikhoan_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho HoSoSinhVien
CREATE OR REPLACE TRIGGER trg_bi_HoSoSinhVien
BEFORE INSERT ON HoSoSinhVien FOR EACH ROW
BEGIN
    IF :NEW.MaHoSo IS NULL THEN
        :NEW.MaHoSo := 'HS' || LPAD(s_hoso_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho NhatKyHeThong
CREATE OR REPLACE TRIGGER trg_bi_NhatKyHeThong
BEFORE INSERT ON NhatKyHeThong FOR EACH ROW
BEGIN
    IF :NEW.MaNhatKy IS NULL THEN
        :NEW.MaNhatKy := 'NK' || LPAD(s_nhatky_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho DoiTac
CREATE OR REPLACE TRIGGER trg_bi_DoiTac
BEFORE INSERT ON DoiTac FOR EACH ROW
BEGIN
    IF :NEW.MaDoiTac IS NULL THEN
        :NEW.MaDoiTac := 'DT' || LPAD(s_doitac_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho LoaiVatPham
CREATE OR REPLACE TRIGGER trg_bi_LoaiVatPham
BEFORE INSERT ON LoaiVatPham FOR EACH ROW
BEGIN
    IF :NEW.MaLoai IS NULL THEN
        :NEW.MaLoai := 'VP' || LPAD(s_loaivp_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho ThamSo
CREATE OR REPLACE TRIGGER trg_bi_ThamSo
BEFORE INSERT ON ThamSo FOR EACH ROW
BEGIN
    IF :NEW.MaThamSo IS NULL THEN
        :NEW.MaThamSo := 'TS' || LPAD(s_thamso_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho ChienDich
CREATE OR REPLACE TRIGGER trg_bi_ChienDich
BEFORE INSERT ON ChienDich FOR EACH ROW
BEGIN
    IF :NEW.MaChienDich IS NULL THEN
        :NEW.MaChienDich := 'CD' || LPAD(s_chiendich_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho DuyetChienDich
CREATE OR REPLACE TRIGGER trg_bi_DuyetChienDich
BEFORE INSERT ON DuyetChienDich FOR EACH ROW
BEGIN
    IF :NEW.MaDuyet IS NULL THEN
        :NEW.MaDuyet := 'DC' || LPAD(s_duyet_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho TinTuc
CREATE OR REPLACE TRIGGER trg_bi_TinTuc
BEFORE INSERT ON TinTuc FOR EACH ROW
BEGIN
    IF :NEW.MaTinTuc IS NULL THEN
        :NEW.MaTinTuc := 'TT' || LPAD(s_tintuc_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho BinhLuan
CREATE OR REPLACE TRIGGER trg_bi_BinhLuan
BEFORE INSERT ON BinhLuan FOR EACH ROW
BEGIN
    IF :NEW.MaBinhLuan IS NULL THEN
        :NEW.MaBinhLuan := 'BL' || LPAD(s_binhluan_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho ThamGiaTNV
CREATE OR REPLACE TRIGGER trg_bi_ThamGiaTNV
BEFORE INSERT ON ThamGiaTNV FOR EACH ROW
BEGIN
    IF :NEW.MaThamGia IS NULL THEN
        :NEW.MaThamGia := 'TG' || LPAD(s_thamgia_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho CongViec
CREATE OR REPLACE TRIGGER trg_bi_CongViec
BEFORE INSERT ON CongViec FOR EACH ROW
BEGIN
    IF :NEW.MaCongViec IS NULL THEN
        :NEW.MaCongViec := 'CV' || LPAD(s_congviec_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho PhanCong
CREATE OR REPLACE TRIGGER trg_bi_PhanCong
BEFORE INSERT ON PhanCong FOR EACH ROW
BEGIN
    IF :NEW.MaPhanCong IS NULL THEN
        :NEW.MaPhanCong := 'PC' || LPAD(s_phancong_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho DiemDanh
CREATE OR REPLACE TRIGGER trg_bi_DiemDanh
BEFORE INSERT ON DiemDanh FOR EACH ROW
BEGIN
    IF :NEW.MaDiemDanh IS NULL THEN
        :NEW.MaDiemDanh := 'DD' || LPAD(s_diemdanh_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho MinhChungTNV
CREATE OR REPLACE TRIGGER trg_bi_MinhChungTNV
BEFORE INSERT ON MinhChungTNV FOR EACH ROW
BEGIN
    IF :NEW.MaMinhChung IS NULL THEN
        :NEW.MaMinhChung := 'MC' || LPAD(s_minhchungtnv_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho GiayChungNhan
CREATE OR REPLACE TRIGGER trg_bi_GiayChungNhan
BEFORE INSERT ON GiayChungNhan FOR EACH ROW
BEGIN
    IF :NEW.MaChungNhan IS NULL THEN
        :NEW.MaChungNhan := 'GC' || LPAD(s_giaychungnhan_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho QuyenGopTien
CREATE OR REPLACE TRIGGER trg_bi_QuyenGopTien
BEFORE INSERT ON QuyenGopTien FOR EACH ROW
BEGIN
    IF :NEW.MaQuyenGop IS NULL THEN
        :NEW.MaQuyenGop := 'QG' || LPAD(s_quyengop_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho ThanhToan
CREATE OR REPLACE TRIGGER trg_bi_ThanhToan
BEFORE INSERT ON ThanhToan FOR EACH ROW
BEGIN
    IF :NEW.MaThanhToan IS NULL THEN
        :NEW.MaThanhToan := 'HD' || LPAD(s_thanhtoan_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho MinhChungChiTieu
CREATE OR REPLACE TRIGGER trg_bi_MinhChungChiTieu
BEFORE INSERT ON MinhChungChiTieu FOR EACH ROW
BEGIN
    IF :NEW.MaMinhChung IS NULL THEN
        :NEW.MaMinhChung := 'MZ' || LPAD(s_minhchungct_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho ChiTieu
CREATE OR REPLACE TRIGGER trg_bi_ChiTieu
BEFORE INSERT ON ChiTieu FOR EACH ROW
BEGIN
    IF :NEW.MaChiTieu IS NULL THEN
        :NEW.MaChiTieu := 'CT' || LPAD(s_chitieu_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho TaiTro
CREATE OR REPLACE TRIGGER trg_bi_TaiTro
BEFORE INSERT ON TaiTro FOR EACH ROW
BEGIN
    IF :NEW.MaTaiTro IS NULL THEN
        :NEW.MaTaiTro := 'TR' || LPAD(s_taitro_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho PhieuQuyenGopVP
CREATE OR REPLACE TRIGGER trg_bi_PhieuQuyenGopVP
BEFORE INSERT ON PhieuQuyenGopVP FOR EACH ROW
BEGIN
    IF :NEW.MaPhieuQG IS NULL THEN
        :NEW.MaPhieuQG := 'PQ' || LPAD(s_phieuqgvp_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho PhieuXuatVatPham
CREATE OR REPLACE TRIGGER trg_bi_PhieuXuatVatPham
BEFORE INSERT ON PhieuXuatVatPham FOR EACH ROW
BEGIN
    IF :NEW.MaPhieuXuat IS NULL THEN
        :NEW.MaPhieuXuat := 'PX' || LPAD(s_phieuxuat_id.NEXTVAL, 8, '0');
    END IF;
END;
/

-- Trigger auto PK cho ThongBao
CREATE OR REPLACE TRIGGER trg_bi_ThongBao
BEFORE INSERT ON ThongBao FOR EACH ROW
BEGIN
    IF :NEW.MaThongBao IS NULL THEN
        :NEW.MaThongBao := 'TB' || LPAD(s_thongbao_id.NEXTVAL, 8, '0');
    END IF;
END;
/

COMMIT;
PROMPT >> 04_triggers_auto_pk.sql: Da tao xong tat ca TRIGGERS tu dong gan PK.
