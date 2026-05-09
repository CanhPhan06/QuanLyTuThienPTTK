// ============================================================
//  db/procedures.rs — Gọi Stored Procedures Oracle
// ============================================================
//
//  Quy tắc:
//  - Mỗi SP/SF có 1 hàm tương ứng tại đây
//  - KHÔNG viết logic nghiệp vụ — chỉ gọi SP và map kết quả
//  - Tất cả hàm trả Result<T, oracle::Error>
//  - Commands (BLL) chịu trách nhiệm convert error thành String
//
//  Danh sách 32 Stored Procedures cần implement:
//  (Xem chi tiết tại database/06_stored_procedures.sql)
//

use super::get_connection;
use crate::models::Campaign;

// ============================================================
//  CHIẾN DỊCH (Campaign)
// ============================================================

/// Gọi SP để lấy danh sách tất cả chiến dịch
///
/// Tương ứng: SELECT * FROM ChienDich (hoặc SP tùy chỉnh)
pub fn call_sp_get_all_campaigns() -> Result<Vec<Campaign>, oracle::Error> {
    let conn = get_connection().map_err(|e| {
        // TODO: Cần handle lỗi connection tốt hơn
        oracle::Error::InternalError(e)
    })?;

    let mut stmt = conn.statement("SELECT MaCD, TenCD, MoTa, NgayBD, NgayKT, TrangThai FROM ChienDich").build()?;
    let rows = stmt.query(&[])?;

    let mut campaigns = Vec::new();
    for row_result in rows {
        let row = row_result?;
        campaigns.push(Campaign {
            ma_cd: row.get("MaCD")?,
            ten_cd: row.get("TenCD")?,
            mo_ta: row.get("MoTa").unwrap_or_default(),
            ngay_bd: row.get("NgayBD").unwrap_or_default(),
            ngay_kt: row.get("NgayKT").unwrap_or_default(),
            trang_thai: row.get("TrangThai").unwrap_or_default(),
        });
    }

    Ok(campaigns)
}

/// Gọi SP_DANGKY_CD — Đăng ký tình nguyện viên vào chiến dịch
///
/// Params: MaSV, MaCD
pub fn call_sp_dangky_cd(ma_sv: &str, ma_cd: &str) -> Result<(), oracle::Error> {
    let conn = get_connection().map_err(|e| {
        oracle::Error::InternalError(e)
    })?;

    conn.execute("CALL SP_DANGKY_CD(:1, :2)", &[&ma_sv, &ma_cd])?;
    conn.commit()?;

    Ok(())
}

// ============================================================
//  ĐIỂM DANH (Attendance) — TODO
// ============================================================

// pub fn call_sp_diem_danh(...) -> Result<(), oracle::Error> { ... }

// ============================================================
//  PHÂN CÔNG (Assignment) — TODO
// ============================================================

// pub fn call_sp_phan_cong(...) -> Result<(), oracle::Error> { ... }

// ============================================================
//  CHỨNG NHẬN (Certificate) — TODO
// ============================================================

// pub fn call_sp_cap_chungnhan_cd(...) -> Result<(), oracle::Error> { ... }
