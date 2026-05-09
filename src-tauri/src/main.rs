// ============================================================
//  main.rs — Entry point của ứng dụng Tauri
// ============================================================
//
//  Quy tắc:
//  - Đăng ký TẤT CẢ commands tại generate_handler![]
//  - Khởi tạo DB connection pool trước khi chạy app
//  - KHÔNG viết logic nghiệp vụ ở đây
//

mod commands;
mod db;
mod models;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // === Chiến dịch ===
            commands::campaign_cmd::get_danh_sach_chien_dich,
            commands::campaign_cmd::get_chi_tiet_chien_dich,
            commands::campaign_cmd::dang_ky_chien_dich,
            // === Điểm danh ===
            // TODO: Thêm commands điểm danh khi implement
            // commands::attendance_cmd::get_danh_sach_diem_danh,
            // commands::attendance_cmd::diem_danh,
        ])
        .run(tauri::generate_context!())
        .expect("Lỗi khởi tạo ứng dụng Tauri");
}
