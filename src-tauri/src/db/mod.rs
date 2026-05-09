// ============================================================
//  db/mod.rs — Module kết nối Oracle Database
// ============================================================
//
//  Quy tắc:
//  - Sử dụng connection pool (OnceCell) — tạo 1 lần, dùng lại
//  - KHÔNG tạo connection mới mỗi lần gọi SP
//  - Cấu hình kết nối lấy từ environment variables hoặc config
//

pub mod procedures;

use once_cell::sync::OnceCell;
use oracle::Connection;

/// Connection pool toàn cục (singleton)
static DB_CONNECTION: OnceCell<Connection> = OnceCell::new();

/// Thông tin kết nối Oracle — CẦN CẬP NHẬT theo môi trường thực tế
const DB_USERNAME: &str = "hqtcsdldb";
const DB_PASSWORD: &str = "hqtcsdl123";
const DB_CONNECT_STRING: &str = "//localhost:1521/orcl";

/// Lấy hoặc khởi tạo kết nối Oracle
///
/// # Returns
/// - `Ok(&Connection)` nếu kết nối thành công
/// - `Err(String)` nếu không thể kết nối
///
/// # Ví dụ
/// ```rust
/// let conn = db::get_connection()?;
/// conn.execute("CALL SP_XXX(:1)", &[&param])?;
/// ```
pub fn get_connection() -> Result<&'static Connection, String> {
    DB_CONNECTION.get_or_try_init(|| {
        Connection::connect(DB_USERNAME, DB_PASSWORD, DB_CONNECT_STRING)
            .map_err(|e| format!("Không thể kết nối Oracle DB: {}", e))
    })
}
