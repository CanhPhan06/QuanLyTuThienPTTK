# Cấu Trúc Dự Án

## Tổng Quan

```
HQTCSDL_DB/
├── README.md                           # Giới thiệu dự án
│
├── database/                           # ===== LAYER DATABASE (Oracle) =====
│   ├── 00_DB_Script.sql                # File tổng hợp (concat 01→08), dùng để deploy nhanh
│   ├── 01_sequences.sql                # 24 Sequences cho auto-increment PK
│   ├── 02_tables.sql                   # 28 Bảng với FK, CHECK, UNIQUE constraints
│   ├── 03_indexes.sql                  # 87 Indexes tối ưu hiệu năng truy vấn
│   ├── 04_triggers_auto_pk.sql         # 24 Triggers tự động sinh PK (PREFIX + LPAD)
│   ├── 05_triggers_business.sql        # 9 Triggers kiểm tra nghiệp vụ
│   ├── 06_stored_procedures.sql        # 32 Stored Procedures
│   ├── 07_stored_functions.sql         # 6 Stored Functions
│   └── 08_SeedData.sql                 # Dữ liệu mẫu: 966+ records trên 21 bảng
│
└── docs/                               # ===== TÀI LIỆU DỰ ÁN =====
    ├── Database_Progress.md            # Tracker tiến độ + Changelog database
    ├── PROJECT_STRUCTURE.md            # Giải thích cấu trúc dự án (file này)
    ├── GIT_GUIDELINE.md               # Quy trình Git Flow & branching
    ├── GIT_COMMIT.md                  # Quy tắc đặt tên commit
    └── COMPLETE_Template.docx          # Template tài liệu đồ án
```

---

## Thứ Tự Chạy Database Scripts

Các file SQL phải được chạy **theo đúng thứ tự** do dependency giữa các thành phần:

```
01_sequences.sql          Sequences (không phụ thuộc gì)
       ↓
02_tables.sql             Tables + FK constraints (phụ thuộc sequences qua triggers)
       ↓
03_indexes.sql            Indexes (phụ thuộc tables)
       ↓
04_triggers_auto_pk.sql   Auto PK Triggers (phụ thuộc tables + sequences)
       ↓
05_triggers_business.sql  Business Triggers (phụ thuộc tables)
       ↓
06_stored_procedures.sql  Stored Procedures (phụ thuộc tables)
       ↓
07_stored_functions.sql   Stored Functions (phụ thuộc tables)
       ↓
[Recompile nếu cần]      ALTER PROCEDURE SP_CAP_CHUNGNHAN_CD COMPILE;
       ↓
08_SeedData.sql           Seed Data (phụ thuộc tất cả ở trên)
```

> **Lưu ý:** `06_stored_procedures.sql` chứa `SP_CAP_CHUNGNHAN_CD` tham chiếu `SF_GET_XEP_LOAI` trong `07_stored_functions.sql`. Vì vậy sau khi chạy xong cả 2 file, cần recompile procedure này.

---

## Mô Hình Dữ Liệu

Hệ thống quản lý **20 chiến dịch tình nguyện** với 3 vai trò chính:

| Vai trò | Mô tả | Số lượng mẫu |
|:---|:---|:---|
| **BanQuanLy** | Quản trị hệ thống, duyệt chiến dịch | 2 |
| **BanDieuHanh** | Quản lý vận hành từng chiến dịch (1:1 với ChienDich) | 20 |
| **TinhNguyenVien** | Tham gia, điểm danh, nhận chứng nhận | 50 |

### Luồng Nghiệp Vụ Chính

```
TaiKhoan → HoSoSinhVien → ThamGiaTNV → PhanCong → DiemDanh → GiayChungNhan
                              ↑
                          ChienDich → CongViec
                              ↑
                        BanDieuHanh (Class Table Inheritance)
                              ↑
                      DuyetChienDich ← BanQuanLy
```

---

## Môi Trường Phát Triển

| Thành phần | Phiên bản |
|:---|:---|
| **Database** | Oracle 19c (Non-CDB) |
| **User** | `hqtcsdldb` / `hqtcsdl123` @ SID `orcl` |
| **Client** | SQL*Plus 19.3 / SQL Developer |
