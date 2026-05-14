# Changelog - Module Dùng Chung (Common)

Tài liệu này ghi lại các thay đổi, cập nhật mã nguồn liên quan đến các tính năng dùng chung cho mọi phân quyền (Đăng nhập, Quản lý hồ sơ, Đổi mật khẩu, Thông báo).

---

## [Unreleased]
- Khởi tạo tệp changelog.

---

## [2026-05-14] - Backend Infrastructure & Fix

### FEAT: Bổ sung helper `executeQuery` vào db.js
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 21:00 (ICT)
- **Files ảnh hưởng:**
  - `backend/src/db.js`
- **Mô tả:**
  - Thêm hàm `executeQuery(sql, binds, autoCommit)` làm wrapper chuẩn để các service mới dùng, thay vì phải tự quản lý vòng đời connection.
  - Export kèm theo `getConnection` để backward compatible với các service cũ (financeService, proofService,...).

### FIX: Sửa lỗi `ERR_MODULE_NOT_FOUND` khi khởi động backend
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 21:00 (ICT)
- **Files ảnh hưởng:**
  - `backend/src/services/evaluationService.js`
  - `backend/src/services/certificationService.js`
  - `backend/src/services/statisticsService.js`
- **Mô tả:**
  - Lỗi: `Cannot find module '…/config/database.js'` khi Node.js ESM resolve import.
  - Nguyên nhân: các service mới dùng đường dẫn cũ `../config/database.js` không tồn tại trong cấu trúc dự án (file đúng là `../db.js`).
  - Sửa: đổi tất cả import về `import { executeQuery } from '../db.js'`.
  - Backend khởi động thành công sau khi sửa.

### FEAT: Đăng ký các route Cụm 4 vào Express server
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 20:00 (ICT)
- **Files ảnh hưởng:**
  - `backend/src/index.js`
  - `backend/src/controllers/evaluationController.js` — [NEW]
  - `backend/src/controllers/certificationController.js` — [NEW]
  - `backend/src/controllers/statisticsController.js` — [NEW]
  - `backend/src/services/evaluationService.js` — [NEW]
  - `backend/src/services/certificationService.js` — [NEW]
  - `backend/src/services/statisticsService.js` — [NEW]
- **Mô tả:**
  - Mount 3 nhóm route mới: `/api/evaluation`, `/api/certification`, `/api/statistics`.
  - Mỗi controller tích hợp Router ESM (theo mẫu của các controller cũ như `financeController.js`).
  - `statisticsService` dùng `oracledb.CURSOR` để xử lý `REF CURSOR` trả về từ `SP_BAOCAO_HIEUQUA_CD`.

---

## [2026-05-14] - Tích Hợp Frontend (App & Sidebar)

### FEAT: Đăng ký route và sidebar cho các trang Cụm 4
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 20:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/App.jsx` — Thêm 4 route mới
  - `frontend/components/layout/MainLayout.jsx` — Cập nhật menu sidebar theo role
- **Mô tả:**
  - Thêm route `/executive/evaluation` (BDH), `/admin/certification` (BQL), `/admin/analytics` (BQL), `/volunteer/certificates` (TNV).
  - Cập nhật `menus` object trong `MainLayout.jsx` với các mục sidebar tương ứng từng role, có RBAC qua `ProtectedRoute`.

---

## [2026-05-13] - Kiến Trúc Lại Dự Án

### REFACTOR: Tái cấu trúc toàn bộ dự án từ Rust/Tauri sang Electron/Node.js
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 07:00 (ICT)
- **Files ảnh hưởng:**
  - `backend/` — [NEW] Toàn bộ thư mục backend Node.js/Express
  - `electron/` — [NEW] Electron main process
  - `frontend/` — Giữ nguyên React, cập nhật API calls về `http://localhost:3000`
  - `package.json` (root) — Scripts `dev:desktop`, `build:desktop` mới
  - `docs/PROJECT_STRUCTURE.md` — Cập nhật cấu trúc thư mục mới
- **Mô tả:**
  - Loại bỏ Rust/Tauri để tránh lỗi biên dịch C++ trên môi trường Windows không có build tools.
  - Electron wrapper khởi động Express server trong main process, load React frontend qua Vite dev server (hoặc static build).
  - Oracle DB kết nối qua `node-oracledb` thin mode, không yêu cầu Oracle Instant Client.

### FEAT: Hệ thống xác thực & phân quyền (Authentication + RBAC)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 08:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/common/LoginPage.jsx` — [NEW]
  - `frontend/pages/common/RegisterPage.jsx` — [NEW]
  - `frontend/pages/common/ForgotPasswordPage.jsx` — [NEW]
  - `frontend/context/AuthContext.jsx` — [NEW] Global auth state
  - `frontend/components/layout/MainLayout.jsx` — [NEW] Sidebar phân quyền theo VaiTro
  - `backend/src/controllers/authController.js` — [NEW] Route đăng nhập/đăng ký
- **Mô tả:**
  - Đăng nhập xác thực qua `SP_KIEMTRA_QUYEN`, trả về thông tin user và VaiTro.
  - `AuthContext` lưu trạng thái đăng nhập, `ProtectedRoute` chặn truy cập trái phép.
  - Sidebar render linh động menu dựa theo `user.VaiTro` (BanQuanLy / BanDieuHanh / TinhNguyenVien).

### FEAT: Trang quản lý hồ sơ cá nhân (ProfilePage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 10:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/common/ProfilePage.jsx` — [NEW]
  - `frontend/pages/common/ProfilePage.css` — [NEW]
- **Mô tả:**
  - Hiển thị và cập nhật thông tin cá nhân TNV qua `SP_CAPNHAT_HOSO_TNV`.
  - Đổi mật khẩu với xác thực mật khẩu cũ, hash tại Node.js trước khi lưu DB.

### FEAT: Hệ thống thông báo real-time (ThongBaoDropdown)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 11:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/components/layout/ThongBaoDropdown.jsx` — [NEW]
  - `frontend/pages/common/ThongBaoList.jsx` — [NEW]
  - `backend/src/controllers/thongBaoController.js` — [NEW]
- **Mô tả:**
  - Dropdown thông báo trên thanh header hiển thị số thông báo chưa đọc.
  - Đánh dấu đã đọc khi nhấn vào từng thông báo.
