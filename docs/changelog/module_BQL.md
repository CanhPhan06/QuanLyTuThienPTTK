# Changelog - Module Ban Quản Lý (BQL)

Tài liệu này ghi lại các thay đổi, cập nhật mã nguồn liên quan đến phân quyền Ban Quản Lý.

---

## [Unreleased]
- Khởi tạo tệp changelog.

---

## [2026-05-14] - Cụm 4: Cấp Chứng Nhận & Báo Cáo Thống Kê

### FEAT: Trang cấp giấy chứng nhận hàng loạt (CertificationPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 20:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/admin/CertificationPage.jsx` — [NEW] Trang cấp chứng nhận cho chiến dịch
  - `frontend/pages/admin/CertificationPage.css` — [NEW] CSS bao gồm modal preview chứng nhận
  - `frontend/services/certification.js` — [NEW] API service gọi endpoint `/api/certification`
- **Mô tả:**
  - BQL chọn chiến dịch, xem danh sách TNV đủ điều kiện (trạng thái `HoanThanh`).
  - Nhấn "Cấp Hàng Loạt" gọi `SP_CAP_CHUNGNHAN_CD(p_MaCD)`.
  - SP tự áp dụng `GioToiThieuCN` từ chiến dịch (fallback về `THAMSO.GIO_CONG_MAC_DINH`) để lọc đủ điều kiện.
  - Modal preview hiển thị template giấy chứng nhận điện tử (tên, xếp loại, mã xác thực, ngày cấp).

### FEAT: Dashboard báo cáo và thống kê (AnalyticsDashboard)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 20:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/admin/AnalyticsDashboard.jsx` — [NEW] Trang báo cáo tổng hợp
  - `frontend/pages/admin/AnalyticsDashboard.css` — [NEW]
  - `frontend/services/statistics.js` — [NEW] API service gọi endpoint `/api/statistics`
- **Mô tả:**
  - Biểu đồ Bar Chart (Recharts) so sánh `TongThu` vs `TongChi` per chiến dịch, dữ liệu từ `SP_BAOCAO_HIEUQUA_CD`.
  - Bảng Vàng Top 5 tình nguyện viên cống hiến nhiều giờ nhất, dữ liệu từ `SF_TINH_TONG_GIO_TNV`.
  - Bảng cấu hình tham số hệ thống (THAMSO) — BQL xem và sửa trực tiếp qua `SP_THAYDOI_THAMSO`.

### FEAT: Trang quản lý tài chính ngân quỹ (FinancePage + BudgetTracker)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 18:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/admin/FinancePage.jsx` — [NEW] Trang ghi nhận quyên góp và chi tiêu
  - `frontend/pages/admin/FinancePage.css` — [NEW]
  - `frontend/components/finance/BudgetTracker.jsx` — [NEW] Component hiển thị tóm tắt ngân quỹ
  - `frontend/components/finance/BudgetTracker.css` — [NEW]
- **Mô tả:**
  - Ghi nhận quyên góp qua `SP_GHI_NHAN_QUYENGOP`; kiểm tra ngân quỹ thời gian thực qua `SF_TINH_NGAN_QUY_CD`.
  - Tạo phiếu chi qua `SP_THEM_PHIEU_CHI`, tự động từ chối khi số tiền chi vượt số dư.
  - `BudgetTracker` hiển thị thanh tiến độ tỉ lệ giải ngân, số liệu màu ngữ nghĩa (xanh/đỏ/cam).

### FEAT: Trang tạo chiến dịch mới (CreateCampaignPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 14:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/admin/CreateCampaignPage.jsx` — [NEW]
  - `frontend/pages/admin/CreateCampaignPage.css` — [NEW]
- **Mô tả:**
  - Form tạo chiến dịch mới gọi `SP_THEM_CHIENDICH_MOI`.
  - Xác thực: ngày kết thúc ≥ ngày bắt đầu, tên không trùng lặp.

### FEAT: Trang duyệt tài khoản tình nguyện viên (ApproveVolunteerPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 13:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/admin/ApproveVolunteerPage.jsx` — [NEW]
  - `frontend/pages/admin/ApproveVolunteerPage.css` — [NEW]
- **Mô tả:**
  - Hiển thị danh sách tài khoản TNV đang chờ duyệt.
  - BQL xét duyệt/từ chối tài khoản qua `SP_CAPNHAT_VAITRO`.

### UI: Sửa màu panel BudgetTracker để nội dung rõ ràng trên nền trắng
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 13:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/components/finance/BudgetTracker.css` — Rewrite hoàn toàn
  - `frontend/pages/admin/FinancePage.css` — Sửa màu nhãn về dark gray
- **Mô tả:**
  - Phản hồi người dùng: số liệu tài chính và thanh tiến độ bị ẩn do màu CSS xung đột với nền trắng.
  - Rewrite CSS toàn bộ BudgetTracker về light-mode: background `#f9fafb`, chữ số liệu màu ngữ nghĩa đậm.
  - Phục hồi thanh tiến độ tỉ lệ giải ngân bị mất hiển thị.

---

## [2026-05-13] - Kiến Trúc Lại Dự Án (Electron + Node.js)

### REFACTOR: Di chuyển kiến trúc từ Rust/Tauri sang Electron/Node.js
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 07:00 (ICT)
- **Files ảnh hưởng:**
  - `backend/src/index.js` — [NEW] Express server thay thế Rust binary
  - `backend/src/db.js` — [NEW] Oracle DB connector dùng `oracledb` thin mode
  - `electron/main.js` — [NEW] Electron main process tích hợp backend Node.js
  - `package.json` (root) — Cập nhật scripts `dev:desktop`, `build:desktop`
- **Mô tả:**
  - Loại bỏ phụ thuộc Rust/C++ build tools gây lỗi biên dịch môi trường.
  - Backend Node.js/Express chạy song song trong Electron main process.
  - Oracle DB kết nối qua `oracledb` thin mode (pure JS), không cần Oracle Client cài sẵn.
  - Frontend React giao tiếp với backend qua REST API (`http://localhost:3000`).
