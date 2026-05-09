// ============================================================
//  commands/campaign_cmd.rs — Tauri Commands cho Chiến Dịch
// ============================================================
//
//  Đây là tầng BLL (Business Logic Layer):
//  1. Nhận request từ React (qua invoke())
//  2. Validate input
//  3. Kiểm tra điều kiện nghiệp vụ
//  4. Gọi DAL (db::procedures)
//  5. Trả kết quả JSON về React
//
//  Quy tắc:
//  - Mỗi hàm phải có #[tauri::command]
//  - Return type: Result<T, String> (T phải impl Serialize)
//  - KHÔNG viết SQL ở đây — gọi procedures module
//

use crate::db::procedures;
use crate::models::Campaign;

/// Lấy danh sách tất cả chiến dịch
///
/// Frontend gọi: invoke("get_danh_sach_chien_dich")
#[tauri::command]
pub fn get_danh_sach_chien_dich() -> Result<Vec<Campaign>, String> {
    procedures::call_sp_get_all_campaigns()
        .map_err(|e| format!("Lỗi truy vấn danh sách chiến dịch: {}", e))
}

/// Lấy chi tiết 1 chiến dịch
///
/// Frontend gọi: invoke("get_chi_tiet_chien_dich", { maCd: "CD001" })
#[tauri::command]
pub fn get_chi_tiet_chien_dich(ma_cd: String) -> Result<Campaign, String> {
    // TODO: Implement khi có SP chi tiết
    Err("Chưa implement".into())
}

/// Đăng ký tình nguyện viên vào chiến dịch
///
/// Frontend gọi: invoke("dang_ky_chien_dich", { maSv: "SV001", maCd: "CD001" })
#[tauri::command]
pub fn dang_ky_chien_dich(ma_sv: String, ma_cd: String) -> Result<String, String> {
    // 1. Validate input
    if ma_sv.trim().is_empty() {
        return Err("Mã sinh viên không được để trống".into());
    }
    if ma_cd.trim().is_empty() {
        return Err("Mã chiến dịch không được để trống".into());
    }

    // 2. Gọi Stored Procedure qua DAL
    procedures::call_sp_dangky_cd(&ma_sv, &ma_cd)
        .map(|_| "Đăng ký chiến dịch thành công".into())
        .map_err(|e| format!("Lỗi đăng ký chiến dịch: {}", e))
}
