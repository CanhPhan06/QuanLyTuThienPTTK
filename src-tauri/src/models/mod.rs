// ============================================================
//  models/mod.rs — Struct DTOs ánh xạ bảng Oracle
// ============================================================
//
//  Quy tắc:
//  - Mỗi struct tương ứng với 1 bảng (hoặc 1 view) trong Oracle
//  - Phải derive Serialize để trả JSON về React
//  - Phải derive Deserialize nếu nhận dữ liệu từ React
//  - Field names dùng snake_case (Rust convention)
//  - Serde rename nếu cần map sang tên khác cho JSON
//
//  Khi thêm bảng mới:
//  1. Tạo struct tại đây
//  2. Cập nhật db/procedures.rs để map rows → struct
//

use serde::{Deserialize, Serialize};

/// Chiến dịch tình nguyện
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campaign {
    pub ma_cd: String,
    pub ten_cd: String,
    pub mo_ta: String,
    pub ngay_bd: String,
    pub ngay_kt: String,
    pub trang_thai: String,
}

/// Hồ sơ sinh viên
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Student {
    pub ma_sv: String,
    pub ho_ten: String,
    pub ngay_sinh: String,
    pub gioi_tinh: String,
    pub email: String,
    pub sdt: String,
}

/// Bản ghi điểm danh
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceRecord {
    pub ma_dd: String,
    pub ma_sv: String,
    pub ma_cd: String,
    pub ngay_diem_danh: String,
    pub trang_thai: String,
}

/// Giấy chứng nhận
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Certificate {
    pub ma_gcn: String,
    pub ma_sv: String,
    pub ma_cd: String,
    pub ngay_cap: String,
    pub xep_loai: String,
}

// TODO: Thêm các struct khác khi cần
// - Assignment (PhanCong)
// - Task (CongViec)
// - Sponsor (NhaTaiTro)
// - Supply (VatPham)
