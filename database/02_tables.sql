-- ============================================================
-- FILE: 02_tables.sql
-- MUC DICH: Tao tat ca BANG DU LIEU cho he thong quan ly hoat dong tinh nguyen
-- CHAY SAU: 01_sequences.sql
-- ============================================================

-- Xoa cac bang cu theo thu tu nguoc (tranh vi pham FK)
BEGIN
    FOR t IN (SELECT table_name FROM user_tables 
              WHERE UPPER(table_name) IN (
                UPPER('ChiTietXuatVP'), UPPER('PhieuXuatVatPham'),
                UPPER('ChiTietQuyenGopVP'), UPPER('PhieuQuyenGopVP'),
                UPPER('TheoDoi'), UPPER('ThongBao'),
                UPPER('ThamSo'), UPPER('ChiTieu'), UPPER('MinhChungChiTieu'),
                UPPER('ThanhToan'), UPPER('QuyenGopTien'),
                UPPER('GiayChungNhan'), UPPER('MinhChungTNV'),
                UPPER('DiemDanh'), UPPER('PhanCong'), UPPER('CongViec'),
                UPPER('ThamGiaTNV'), UPPER('BinhLuan'), UPPER('TinTuc'),
                UPPER('DuyetChienDich'), UPPER('BanDieuHanh'), UPPER('ChienDich'),
                UPPER('TaiTro'), UPPER('DoiTac'), UPPER('LoaiVatPham'),
                UPPER('NhatKyHeThong'), UPPER('HoSoSinhVien'), UPPER('TaiKhoan')
              )) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END;
/

-- ============================================================
-- 1. TAIKHOAN
-- ============================================================
CREATE TABLE TaiKhoan (
    MaTaiKhoan  VARCHAR2(10)          NOT NULL,
    TenDangNhap VARCHAR2(50)    NOT NULL,
    MatKhau     VARCHAR2(255)   NOT NULL,
    Email       VARCHAR2(100)   NOT NULL,
    VaiTro      VARCHAR2(20)    NOT NULL,
    TrangThai   VARCHAR2(20)    DEFAULT 'ChoXacNhan' NOT NULL,
    NgayTao     DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_TaiKhoan      PRIMARY KEY (MaTaiKhoan),
    CONSTRAINT UQ_TK_TenDN      UNIQUE (TenDangNhap),
    CONSTRAINT UQ_TK_Email      UNIQUE (Email),
    CONSTRAINT CHK_TK_VaiTro    CHECK (VaiTro IN ('QuanTriVien','BanQuanLy','BanDieuHanh','TinhNguyenVien')),
    CONSTRAINT CHK_TK_TrangThai CHECK (TrangThai IN ('HoatDong','Khoa','ChoXacNhan'))
);

-- ============================================================
-- 2. HOSOSINHVIEN
-- ============================================================
CREATE TABLE HoSoSinhVien (
    MaHoSo      VARCHAR2(10)          NOT NULL,
    MaTaiKhoan  VARCHAR2(10)          NOT NULL,
    HoTen       NVARCHAR2(100)  NOT NULL,
    MSSV        VARCHAR2(20)    NOT NULL,
    NgaySinh    DATE            NOT NULL,
    GioiTinh    NVARCHAR2(10)   NOT NULL,
    Khoa        NVARCHAR2(100)  NOT NULL,
    Lop         VARCHAR2(20)    NOT NULL,
    SoDienThoai VARCHAR2(15)    NOT NULL,
    TongDiem    NUMBER(5,1)     DEFAULT 0,
    DiaChi      NVARCHAR2(200)  NOT NULL,
    CONSTRAINT PK_HoSo          PRIMARY KEY (MaHoSo),
    CONSTRAINT UQ_HoSo_TK       UNIQUE (MaTaiKhoan),
    CONSTRAINT UQ_HoSo_MSSV     UNIQUE (MSSV),
    CONSTRAINT FK_HoSo_TK       FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE,
    CONSTRAINT CHK_HoSo_GT      CHECK (GioiTinh IN (N'Nam', N'Nu', N'Khac'))
);

-- ============================================================
-- 3. NHATKYHETONG
-- ============================================================
CREATE TABLE NhatKyHeThong (
    MaNhatKy    VARCHAR2(10)          NOT NULL,
    MaTaiKhoan  VARCHAR2(10)          NOT NULL,
    HanhDong    NVARCHAR2(255)  NOT NULL,
    ThoiGian    DATE            DEFAULT SYSDATE NOT NULL,
    ChiTiet     CLOB,
    CONSTRAINT PK_NhatKy        PRIMARY KEY (MaNhatKy),
    CONSTRAINT FK_NhatKy_TK     FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE
);

-- ============================================================
-- 4. DOITAC
-- ============================================================
CREATE TABLE DoiTac (
    MaDoiTac        VARCHAR2(10)          NOT NULL,
    TenDoiTac       NVARCHAR2(200)  NOT NULL,
    LinhVuc         NVARCHAR2(100),
    SoDienThoai     VARCHAR2(15),
    Email           VARCHAR2(100),
    DiaChi          NVARCHAR2(255),
    NguoiDaiDien    NVARCHAR2(100),
    CONSTRAINT PK_DoiTac        PRIMARY KEY (MaDoiTac),
    CONSTRAINT UQ_DT_Email      UNIQUE (Email)
);

-- ============================================================
-- 5. LOAIVATPHAM
-- ============================================================
CREATE TABLE LoaiVatPham (
    MaLoai      VARCHAR2(10)          NOT NULL,
    TenLoai     NVARCHAR2(100)  NOT NULL,
    DonViTinh   NVARCHAR2(50)   NOT NULL,
    SoLuongTon  NUMBER          DEFAULT 0 NOT NULL,
    MoTa        NVARCHAR2(500),
    CONSTRAINT PK_LoaiVatPham   PRIMARY KEY (MaLoai),
    CONSTRAINT UQ_LVP_TenLoai   UNIQUE (TenLoai),
    CONSTRAINT CHK_LVP_SL       CHECK (SoLuongTon >= 0)
);

-- ============================================================
-- 6. THAMSO
-- ============================================================
CREATE TABLE ThamSo (
    MaThamSo    VARCHAR2(10)          NOT NULL,
    TenThamSo   VARCHAR2(100)   NOT NULL,
    GiaTri      VARCHAR2(500)   NOT NULL,
    GhiChu      NVARCHAR2(500),
    NgayCapNhat DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_ThamSo        PRIMARY KEY (MaThamSo),
    CONSTRAINT UQ_TS_Ten        UNIQUE (TenThamSo)
);

-- ============================================================
-- 7. CHIENDICH
-- ============================================================
CREATE TABLE ChienDich (
    MaChienDich     VARCHAR2(10)          NOT NULL,
    TenChienDich    NVARCHAR2(255)  NOT NULL,
    MoTa            CLOB,
    NgayBatDau      DATE            NOT NULL,
    NgayKetThuc     DATE,
    DiaDiem         NVARCHAR2(200),
    SoLuongTNVToiDa NUMBER          DEFAULT 100 NOT NULL,
    SoLuongHienTai  NUMBER          DEFAULT 0,
    DiemThuong      NUMBER(3,1)     DEFAULT 0,
    MucTieuTien     NUMBER(18,2)    DEFAULT 0,
    GioToiThieuCN   NUMBER,
    TrangThai       VARCHAR2(20)    DEFAULT 'ChoDuyet' NOT NULL,
    MaNguoiTao      VARCHAR2(10)          NOT NULL,
    CONSTRAINT PK_ChienDich     PRIMARY KEY (MaChienDich),
    CONSTRAINT FK_CD_NguoiTao   FOREIGN KEY (MaNguoiTao) REFERENCES TaiKhoan(MaTaiKhoan),
    CONSTRAINT CHK_CD_SoLuong   CHECK (SoLuongTNVToiDa > 0),
    CONSTRAINT CHK_CD_MucTieu   CHECK (MucTieuTien >= 0),
    CONSTRAINT CHK_CD_TrangThai CHECK (TrangThai IN ('ChoDuyet','DangHoatDong','DaTamDung','DaKetThuc','BiTuChoi','Huy')),
    CONSTRAINT CHK_CD_Ngay      CHECK (NgayKetThuc IS NULL OR NgayKetThuc >= NgayBatDau)
);

-- ============================================================
-- 8. BANDIEUHANH
-- ============================================================
CREATE TABLE BanDieuHanh (
    MaTaiKhoan  VARCHAR2(10)          NOT NULL,
    MaChienDich VARCHAR2(10)          NOT NULL,
    NgayPhanCong DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_BanDieuHanh   PRIMARY KEY (MaTaiKhoan),
    CONSTRAINT FK_BDH_TK        FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE,
    CONSTRAINT FK_BDH_CD        FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich) ON DELETE CASCADE,
    CONSTRAINT UQ_BDH_CD        UNIQUE (MaChienDich)
);

-- ============================================================
-- 9. DUYETCHIENDICH
-- ============================================================
CREATE TABLE DuyetChienDich (
    MaDuyet         VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    MaNguoiDuyet    VARCHAR2(10)          NOT NULL,
    TrangThai       VARCHAR2(20)    DEFAULT 'ChoDuyet' NOT NULL,
    NgayDuyet       DATE,
    GhiChu          NVARCHAR2(500),
    CONSTRAINT PK_DuyetCD       PRIMARY KEY (MaDuyet),
    CONSTRAINT FK_Duyet_CD      FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich) ON DELETE CASCADE,
    CONSTRAINT FK_Duyet_ND      FOREIGN KEY (MaNguoiDuyet) REFERENCES TaiKhoan(MaTaiKhoan),
    CONSTRAINT CHK_Duyet_TS    CHECK (TrangThai IN ('ChoDuyet','DaDuyet','TuChoi','HoanThanh','Huy'))
);

-- ============================================================
-- 10. TINTUC
-- ============================================================
CREATE TABLE TinTuc (
    MaTinTuc        VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    TieuDe          NVARCHAR2(500)  NOT NULL,
    NoiDung         CLOB            NOT NULL,
    HinhAnh         VARCHAR2(500),
    NgayDang        DATE            DEFAULT SYSDATE NOT NULL,
    MaNguoiDang     VARCHAR2(10)          NOT NULL,
    CONSTRAINT PK_TinTuc        PRIMARY KEY (MaTinTuc),
    CONSTRAINT FK_TT_CD         FOREIGN KEY (MaChienDich)  REFERENCES ChienDich(MaChienDich) ON DELETE CASCADE,
    CONSTRAINT FK_TT_TacGia     FOREIGN KEY (MaNguoiDang)  REFERENCES TaiKhoan(MaTaiKhoan)
);

-- ============================================================
-- 11. BINHLUAN
-- ============================================================
CREATE TABLE BinhLuan (
    MaBinhLuan      VARCHAR2(10)          NOT NULL,
    MaTinTuc        VARCHAR2(10)          NOT NULL,
    MaTaiKhoan      VARCHAR2(10)          NOT NULL,
    NoiDung         CLOB            NOT NULL,
    ThoiGian        DATE            DEFAULT SYSDATE NOT NULL,
    TrangThai       VARCHAR2(20)    DEFAULT 'HienThi' NOT NULL,
    CONSTRAINT PK_BinhLuan      PRIMARY KEY (MaBinhLuan),
    CONSTRAINT FK_BL_TinTuc     FOREIGN KEY (MaTinTuc)    REFERENCES TinTuc(MaTinTuc) ON DELETE CASCADE,
    CONSTRAINT FK_BL_TK         FOREIGN KEY (MaTaiKhoan)  REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE,
    CONSTRAINT CHK_BL_TS        CHECK (TrangThai IN ('HienThi','AnDi','ChoKiemDuyet'))
);

-- ============================================================
-- 12. THAMGIATNV
-- ============================================================
CREATE TABLE ThamGiaTNV (
    MaThamGia       VARCHAR2(10)          NOT NULL,
    MaTaiKhoan      VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    NgayDangKy      DATE            DEFAULT SYSDATE NOT NULL,
    TrangThaiDuyet  VARCHAR2(20)    DEFAULT 'ChoDuyet' NOT NULL,
    TrangThai       VARCHAR2(20),
    DiemDanhGia     NUMBER(3,1),
    CONSTRAINT PK_ThamGiaTNV    PRIMARY KEY (MaThamGia),
    CONSTRAINT UQ_TG_TK_CD      UNIQUE (MaTaiKhoan, MaChienDich),
    CONSTRAINT FK_TG_TK         FOREIGN KEY (MaTaiKhoan)  REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE,
    CONSTRAINT FK_TG_CD         FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich) ON DELETE CASCADE,
    CONSTRAINT CHK_TG_TS        CHECK (TrangThaiDuyet IN ('ChoDuyet','DaDuyet','TuChoi','HoanThanh','Huy')),
    CONSTRAINT CHK_TG_Diem      CHECK (DiemDanhGia IS NULL OR (DiemDanhGia >= 0 AND DiemDanhGia <= 10))
);

-- ============================================================
-- 13. CONGVIEC
-- ============================================================
CREATE TABLE CongViec (
    MaCongViec      VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    TenCongViec     NVARCHAR2(255)  NOT NULL,
    MoTa            CLOB,
    SoLuongTNVCan   NUMBER          DEFAULT 1 NOT NULL,
    ThoiGianBatDau  DATE,
    CONSTRAINT PK_CongViec      PRIMARY KEY (MaCongViec),
    CONSTRAINT FK_CV_CD         FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich) ON DELETE CASCADE,
    CONSTRAINT CHK_CV_SL        CHECK (SoLuongTNVCan > 0)
);

-- ============================================================
-- 14. PHANCONG
-- ============================================================
CREATE TABLE PhanCong (
    MaPhanCong      VARCHAR2(10)          NOT NULL,
    MaThamGia       VARCHAR2(10)          NOT NULL,
    MaCongViec      VARCHAR2(10)          NOT NULL,
    VaiTroCuThe     NVARCHAR2(255),
    NgayGiao        DATE,
    TrangThai       VARCHAR2(20)    DEFAULT 'ChuaBatDau' NOT NULL,
    CONSTRAINT PK_PhanCong      PRIMARY KEY (MaPhanCong),
    CONSTRAINT UQ_PC_TG_CV      UNIQUE (MaThamGia, MaCongViec),
    CONSTRAINT FK_PC_ThamGia    FOREIGN KEY (MaThamGia)  REFERENCES ThamGiaTNV(MaThamGia) ON DELETE CASCADE,
    CONSTRAINT FK_PC_CongViec   FOREIGN KEY (MaCongViec) REFERENCES CongViec(MaCongViec) ON DELETE CASCADE,
    CONSTRAINT CHK_PC_TS        CHECK (TrangThai IN ('ChuaBatDau','DangThucHien','HoanThanh','HuyBo'))
);

-- ============================================================
-- 15. DIEMDANH
-- ============================================================
CREATE TABLE DiemDanh (
    MaDiemDanh      VARCHAR2(10)          NOT NULL,
    MaThamGia       VARCHAR2(10)          NOT NULL,
    NgayDiemDanh    DATE            NOT NULL,
    TrangThai       VARCHAR2(20)    DEFAULT 'CoMat' NOT NULL,
    SoGioGhiNhan    NUMBER(4,1)     DEFAULT 0,
    CONSTRAINT PK_DiemDanh      PRIMARY KEY (MaDiemDanh),
    CONSTRAINT UQ_DD_TG_Ngay    UNIQUE (MaThamGia, NgayDiemDanh),
    CONSTRAINT FK_DD_ThamGia    FOREIGN KEY (MaThamGia) REFERENCES ThamGiaTNV(MaThamGia) ON DELETE CASCADE,
    CONSTRAINT CHK_DD_TS        CHECK (TrangThai IN ('CoMat','VangMat','CoPhep')),
    CONSTRAINT CHK_DD_SoGio     CHECK (SoGioGhiNhan >= 0)
);

-- ============================================================
-- 16. MINHCHUNGTNV
-- ============================================================
CREATE TABLE MinhChungTNV (
    MaMinhChung     VARCHAR2(10)          NOT NULL,
    MaThamGia       VARCHAR2(10)          NOT NULL,
    HinhAnh_URL     VARCHAR2(500)   NOT NULL,
    LoaiMinhChung   NVARCHAR2(100)  NOT NULL,
    NgayCapNhat     DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_MinhChungTNV  PRIMARY KEY (MaMinhChung),
    CONSTRAINT FK_MCTNV_TG      FOREIGN KEY (MaThamGia) REFERENCES ThamGiaTNV(MaThamGia) ON DELETE CASCADE
);

-- ============================================================
-- 17. GIAYCHUNGNHAN
-- ============================================================
CREATE TABLE GiayChungNhan (
    MaChungNhan     VARCHAR2(10)          NOT NULL,
    MaThamGia       VARCHAR2(10)          NOT NULL,
    NgayCap         DATE            NOT NULL,
    LinkFile_URL    VARCHAR2(500),
    XepLoai         VARCHAR2(20)    NOT NULL,
    CONSTRAINT PK_GiayChungNhan PRIMARY KEY (MaChungNhan),
    CONSTRAINT UQ_GCN_ThamGia   UNIQUE (MaThamGia),
    CONSTRAINT FK_GCN_ThamGia   FOREIGN KEY (MaThamGia) REFERENCES ThamGiaTNV(MaThamGia) ON DELETE CASCADE,
    CONSTRAINT CHK_GCN_XepLoai  CHECK (XepLoai IN ('XuatSac','Tot','Kha','TrungBinh'))
);

-- ============================================================
-- 18. QUYENGOPTIEN
-- ============================================================
CREATE TABLE QuyenGopTien (
    MaQuyenGop          VARCHAR2(10)          NOT NULL,
    MaTaiKhoan          VARCHAR2(10)          NOT NULL,
    MaChienDich         VARCHAR2(10)          NOT NULL,
    SoTien              NUMBER(18,2)    NOT NULL,
    NgayGiaoDich        DATE            DEFAULT SYSDATE NOT NULL,
    PhuongThuc          VARCHAR2(20)    NOT NULL,
    LoiNhan             NVARCHAR2(500),
    CONSTRAINT PK_QuyenGopTien  PRIMARY KEY (MaQuyenGop),
    CONSTRAINT FK_QGT_TK        FOREIGN KEY (MaTaiKhoan)  REFERENCES TaiKhoan(MaTaiKhoan),
    CONSTRAINT FK_QGT_CD        FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich),
    CONSTRAINT CHK_QGT_SoTien   CHECK (SoTien > 0),
    CONSTRAINT CHK_QGT_PT       CHECK (PhuongThuc IN ('ChuyenKhoan','TienMat','MoMo','VNPay','ZaloPay'))
);

-- ============================================================
-- 19. THANHTOAN
-- ============================================================
CREATE TABLE ThanhToan (
    MaThanhToan         VARCHAR2(10)          NOT NULL,
    MaQuyenGop          VARCHAR2(10)          NOT NULL,
    TrangThaiThanhToan  VARCHAR2(20)    DEFAULT 'DangXuLy' NOT NULL,
    MaGiaoDichNganHang  VARCHAR2(100),
    NgayThanhToan       DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_ThanhToan     PRIMARY KEY (MaThanhToan),
    CONSTRAINT UQ_TT_QuyenGop   UNIQUE (MaQuyenGop),
    CONSTRAINT UQ_TT_MaGD       UNIQUE (MaGiaoDichNganHang),
    CONSTRAINT FK_TT_QuyenGop   FOREIGN KEY (MaQuyenGop) REFERENCES QuyenGopTien(MaQuyenGop) ON DELETE CASCADE,
    CONSTRAINT CHK_TT_TS        CHECK (TrangThaiThanhToan IN ('DangXuLy','ThanhCong','ThatBai','HoanTien'))
);

-- ============================================================
-- 20. MINHCHUNGCHITIEU
-- ============================================================
CREATE TABLE MinhChungChiTieu (
    MaMinhChung     VARCHAR2(10)          NOT NULL,
    HinhAnh_URL     VARCHAR2(500)   NOT NULL,
    LoaiMinhChung   NVARCHAR2(100)  NOT NULL,
    NgayCapNhat     DATE            DEFAULT SYSDATE NOT NULL,
    GhiChu          NVARCHAR2(500),
    CONSTRAINT PK_MinhChungCT   PRIMARY KEY (MaMinhChung)
);

-- ============================================================
-- 21. CHITIEU
-- ============================================================
CREATE TABLE ChiTieu (
    MaChiTieu       VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    TenKhoanChi     NVARCHAR2(200)  NOT NULL,
    SoTienChi       NUMBER(18,2)    NOT NULL,
    NgayChi         DATE            NOT NULL,
    MucDich         NVARCHAR2(500)  NOT NULL,
    MaMinhChung     VARCHAR2(10),
    MaNguoiChi      VARCHAR2(10),
    CONSTRAINT PK_ChiTieu       PRIMARY KEY (MaChiTieu),
    CONSTRAINT FK_CT_CD         FOREIGN KEY (MaChienDich)  REFERENCES ChienDich(MaChienDich),
    CONSTRAINT FK_CT_MinhChung  FOREIGN KEY (MaMinhChung)  REFERENCES MinhChungChiTieu(MaMinhChung),
    CONSTRAINT FK_CT_NguoiChi   FOREIGN KEY (MaNguoiChi)   REFERENCES TaiKhoan(MaTaiKhoan),
    CONSTRAINT CHK_CT_SoTien    CHECK (SoTienChi > 0)
);

-- ============================================================
-- 22. TAITRO
-- ============================================================
CREATE TABLE TaiTro (
    MaTaiTro        VARCHAR2(10)          NOT NULL,
    MaDoiTac        VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    LoaiTaiTro      NVARCHAR2(50),
    GiaTriTaiTro    NUMBER(18,2)    NOT NULL,
    NgayTaiTro      DATE            NOT NULL,
    CONSTRAINT PK_TaiTro        PRIMARY KEY (MaTaiTro),
    CONSTRAINT FK_TaiTro_DT     FOREIGN KEY (MaDoiTac)    REFERENCES DoiTac(MaDoiTac),
    CONSTRAINT FK_TaiTro_CD     FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich),
    CONSTRAINT CHK_TaiTro_GT   CHECK (GiaTriTaiTro > 0)
);

-- ============================================================
-- 23. PHIEUQUYENGOPVP
-- ============================================================
CREATE TABLE PhieuQuyenGopVP (
    MaPhieuQG       VARCHAR2(10)          NOT NULL,
    MaTaiKhoan      VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    NgayTiepNhan    DATE            DEFAULT SYSDATE NOT NULL,
    NguoiNhan       NVARCHAR2(150)  NOT NULL,
    CONSTRAINT PK_PhieuQGVP     PRIMARY KEY (MaPhieuQG),
    CONSTRAINT FK_PQGVP_TK      FOREIGN KEY (MaTaiKhoan)  REFERENCES TaiKhoan(MaTaiKhoan),
    CONSTRAINT FK_PQGVP_CD      FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich)
);

-- ============================================================
-- 24. CHITIETQUYENGOPVP
-- ============================================================
CREATE TABLE ChiTietQuyenGopVP (
    MaPhieuQG       VARCHAR2(10)          NOT NULL,
    MaLoai          VARCHAR2(10)          NOT NULL,
    SoLuong         NUMBER          NOT NULL,
    TinhTrang       NVARCHAR2(100),
    CONSTRAINT PK_ChiTietQGVP   PRIMARY KEY (MaPhieuQG, MaLoai),
    CONSTRAINT FK_CTQGVP_Phieu  FOREIGN KEY (MaPhieuQG) REFERENCES PhieuQuyenGopVP(MaPhieuQG) ON DELETE CASCADE,
    CONSTRAINT FK_CTQGVP_Loai   FOREIGN KEY (MaLoai)    REFERENCES LoaiVatPham(MaLoai),
    CONSTRAINT CHK_CTQGVP_SL    CHECK (SoLuong > 0)
);

-- ============================================================
-- 25. PHIEUXUATVP
-- ============================================================
CREATE TABLE PhieuXuatVatPham (
    MaPhieuXuat     VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    NgayXuat        DATE            NOT NULL,
    NguoiXuat       NVARCHAR2(150)  NOT NULL,
    NguoiNhan       NVARCHAR2(150)  NOT NULL,
    CONSTRAINT PK_PhieuXuatVP   PRIMARY KEY (MaPhieuXuat),
    CONSTRAINT FK_PXVP_CD       FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich)
);

-- ============================================================
-- 26. CHITIETXUATVP
-- ============================================================
CREATE TABLE ChiTietXuatVP (
    MaPhieuXuat     VARCHAR2(10)          NOT NULL,
    MaLoai          VARCHAR2(10)          NOT NULL,
    SoLuong         NUMBER          NOT NULL,
    CONSTRAINT PK_ChiTietXuatVP PRIMARY KEY (MaPhieuXuat, MaLoai),
    CONSTRAINT FK_CTXVP_Phieu   FOREIGN KEY (MaPhieuXuat) REFERENCES PhieuXuatVatPham(MaPhieuXuat) ON DELETE CASCADE,
    CONSTRAINT FK_CTXVP_Loai    FOREIGN KEY (MaLoai)      REFERENCES LoaiVatPham(MaLoai),
    CONSTRAINT CHK_CTXVP_SL     CHECK (SoLuong > 0)
);

-- ============================================================
-- 27. THONGBAO
-- ============================================================
CREATE TABLE ThongBao (
    MaThongBao      VARCHAR2(10)          NOT NULL,
    MaTaiKhoan      VARCHAR2(10)          NOT NULL,
    TieuDe          NVARCHAR2(255)  NOT NULL,
    NoiDung         CLOB            NOT NULL,
    NgayGui         DATE            DEFAULT SYSDATE NOT NULL,
    TrangThai       VARCHAR2(20)    DEFAULT 'ChuaDoc' NOT NULL,
    CONSTRAINT PK_ThongBao      PRIMARY KEY (MaThongBao),
    CONSTRAINT FK_TB_TK         FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE,
    CONSTRAINT CHK_TB_TS        CHECK (TrangThai IN ('ChuaDoc','DaDoc'))
);

-- ============================================================
-- 28. THEODOI
-- ============================================================
CREATE TABLE TheoDoi (
    MaTaiKhoan      VARCHAR2(10)          NOT NULL,
    MaChienDich     VARCHAR2(10)          NOT NULL,
    NgayTheoDoi     DATE            DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_TheoDoi       PRIMARY KEY (MaTaiKhoan, MaChienDich),
    CONSTRAINT FK_TD_TK         FOREIGN KEY (MaTaiKhoan)  REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE,
    CONSTRAINT FK_TD_CD         FOREIGN KEY (MaChienDich) REFERENCES ChienDich(MaChienDich) ON DELETE CASCADE
);

COMMIT;
PROMPT >> 02_tables.sql: Da tao xong tat ca BANG DU LIEU voi RANG BUOC.
