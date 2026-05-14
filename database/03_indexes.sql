-- ============================================================
-- FILE: 03_indexes.sql
-- MUC DICH: Tao tat ca INDEXES de toi uu hieu nang truy van
-- CHAY SAU: 02_tables.sql
-- ============================================================

-- Indexes cho TaiKhoan
CREATE INDEX IDX_TK_VaiTro          ON TaiKhoan(VaiTro);
CREATE INDEX IDX_TK_TrangThai        ON TaiKhoan(TrangThai);

-- Indexes cho HoSoSinhVien
CREATE INDEX IDX_HSSV_TK             ON HoSoSinhVien(MaTaiKhoan);
CREATE INDEX IDX_HSSV_SoDT           ON HoSoSinhVien(SoDienThoai);

-- Indexes cho NhatKyHeThong
CREATE INDEX IDX_NhatKy_TK           ON NhatKyHeThong(MaTaiKhoan);
CREATE INDEX IDX_NhatKy_ThoiGian     ON NhatKyHeThong(ThoiGian);

-- Indexes cho ChienDich
CREATE INDEX IDX_CD_TrangThai        ON ChienDich(TrangThai);
CREATE INDEX IDX_CD_NguoiTao         ON ChienDich(MaNguoiTao);
CREATE INDEX IDX_CD_NgayBD           ON ChienDich(NgayBatDau);

-- Indexes cho DuyetChienDich
CREATE INDEX IDX_Duyet_CD            ON DuyetChienDich(MaChienDich);
CREATE INDEX IDX_Duyet_ND            ON DuyetChienDich(MaNguoiDuyet);

-- Indexes cho TinTuc
CREATE INDEX IDX_TT_CD               ON TinTuc(MaChienDich);
CREATE INDEX IDX_TT_TacGia           ON TinTuc(MaNguoiDang);
CREATE INDEX IDX_TT_NgayDang         ON TinTuc(NgayDang);

-- Indexes cho BinhLuan
CREATE INDEX IDX_BL_TinTuc           ON BinhLuan(MaTinTuc);
CREATE INDEX IDX_BL_TK               ON BinhLuan(MaTaiKhoan);

-- Indexes cho ThamGiaTNV
CREATE INDEX IDX_TG_CD               ON ThamGiaTNV(MaChienDich);
CREATE INDEX IDX_TG_TK               ON ThamGiaTNV(MaTaiKhoan);
CREATE INDEX IDX_TG_TrangThai        ON ThamGiaTNV(TrangThaiDuyet);

-- Indexes cho CongViec
CREATE INDEX IDX_CV_CD               ON CongViec(MaChienDich);

-- Indexes cho PhanCong
CREATE INDEX IDX_PC_ThamGia          ON PhanCong(MaThamGia);
CREATE INDEX IDX_PC_CongViec         ON PhanCong(MaCongViec);

-- Indexes cho DiemDanh
CREATE INDEX IDX_DD_ThamGia          ON DiemDanh(MaThamGia);
CREATE INDEX IDX_DD_Ngay             ON DiemDanh(NgayDiemDanh);

-- Indexes cho MinhChungTNV
CREATE INDEX IDX_MCTNV_TG            ON MinhChungTNV(MaThamGia);

-- Indexes cho GiayChungNhan
CREATE INDEX IDX_GCN_TG              ON GiayChungNhan(MaThamGia);
CREATE INDEX IDX_GCN_NgayCap         ON GiayChungNhan(NgayCap);

-- Indexes cho QuyenGopTien
CREATE INDEX IDX_QGT_CD              ON QuyenGopTien(MaChienDich);
CREATE INDEX IDX_QGT_TK              ON QuyenGopTien(MaTaiKhoan);
CREATE INDEX IDX_QGT_Ngay            ON QuyenGopTien(NgayGiaoDich);

-- Indexes cho ThanhToan
CREATE INDEX IDX_TT_QGop             ON ThanhToan(MaQuyenGop);

-- Indexes cho ChiTieu
CREATE INDEX IDX_CT_CD               ON ChiTieu(MaChienDich);
CREATE INDEX IDX_CT_NgayChi          ON ChiTieu(NgayChi);

-- Indexes cho TaiTro
CREATE INDEX IDX_TaiTro_DT           ON TaiTro(MaDoiTac);
CREATE INDEX IDX_TaiTro_CD           ON TaiTro(MaChienDich);

-- Indexes cho PhieuQuyenGopVP
CREATE INDEX IDX_PQGVP_TK            ON PhieuQuyenGopVP(MaTaiKhoan);
CREATE INDEX IDX_PQGVP_CD            ON PhieuQuyenGopVP(MaChienDich);

-- Indexes cho PhieuXuatVatPham
CREATE INDEX IDX_PXVP_CD             ON PhieuXuatVatPham(MaChienDich);
CREATE INDEX IDX_PXVP_NgayXuat       ON PhieuXuatVatPham(NgayXuat);

-- Indexes cho ThongBao
CREATE INDEX IDX_TB_TK               ON ThongBao(MaTaiKhoan);
CREATE INDEX IDX_TB_TrangThai        ON ThongBao(TrangThai);

-- Indexes cho TheoDoi
CREATE INDEX IDX_TD_CD               ON TheoDoi(MaChienDich);

COMMIT;
PROMPT >> 03_indexes.sql: Da tao xong tat ca INDEXES.
