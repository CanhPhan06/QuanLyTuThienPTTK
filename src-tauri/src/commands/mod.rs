// ============================================================
//  commands/mod.rs — Khai báo & re-export tất cả Tauri commands
// ============================================================
//
//  Quy tắc:
//  - Mỗi nhóm chức năng = 1 file riêng (campaign_cmd, attendance_cmd, ...)
//  - Khai báo pub mod tại đây để main.rs có thể truy cập
//  - Mỗi command = 1 hàm #[tauri::command] pub fn
//

pub mod campaign_cmd;

// TODO: Uncomment khi implement
// pub mod attendance_cmd;
// pub mod student_cmd;
// pub mod certificate_cmd;
