# Changelog - Module Tình Nguyện Viên (TNV)

Tài liệu này ghi lại các thay đổi, cập nhật mã nguồn liên quan đến phân quyền Tình Nguyện Viên.

---

## [Unreleased]
- Khởi tạo tệp changelog.

---

## [2026-05-14] - Cụm 4: Tra Cứu Chứng Nhận Cá Nhân

### FEAT: Trang xem chứng nhận tình nguyện của TNV (MyCertificatesPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 20:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/volunteer/MyCertificatesPage.jsx` — [NEW] Trang gallery chứng nhận cá nhân
  - `frontend/pages/volunteer/MyCertificatesPage.css` — [NEW] CSS card thumbnail chứng nhận
  - `frontend/services/certification.js` — [NEW] Hàm `getMyCertificates(username)` gọi `/api/certification/my-certificates`
- **Mô tả:**
  - TNV xem toàn bộ chứng nhận điện tử đã đạt được theo từng chiến dịch.
  - Gallery dạng card, mỗi card hiển thị thumbnail (nền navy + pattern chấm cam) và xếp loại nổi bật.
  - Nhấn "Xem Chi Tiết" mở modal preview giấy chứng nhận đầy đủ (tên, MSSV, chiến dịch, xếp loại, mã xác thực, ngày cấp).

---

## [2026-05-13] - Cụm 3: Nộp Minh Chứng Hoạt Động

### FEAT: Trang nộp minh chứng hoạt động (ProofUploadPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 17:30 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/volunteer/ProofUploadPage.jsx` — [NEW] Trang upload ảnh minh chứng
  - `frontend/pages/volunteer/ProofUploadPage.css` — [NEW]
- **Mô tả:**
  - TNV chọn chiến dịch đã đăng ký, xem danh sách nhiệm vụ được phân công.
  - Nhập URL ảnh minh chứng và gọi `SP_CAPNHAT_MINHCHUNG` để lưu vào DB.
  - Chỉ cho phép nộp minh chứng cho các nhiệm vụ trong chiến dịch TNV tham gia.

### UI: Sửa màu nền task list ProofUploadPage về light-mode
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 12:30 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/volunteer/ProofUploadPage.css`
- **Mô tả:**
  - Phản hồi người dùng: danh sách nhiệm vụ bị tối màu, chữ khó đọc.
  - Cập nhật background task list về `#f9fafb`, chữ về `#1e293b`.

---

## [2026-05-13] - Cụm 2: Đăng Ký & Theo Dõi Chiến Dịch

### FEAT: Trang đăng ký chiến dịch (CampaignsPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 13:30 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/volunteer/CampaignsPage.jsx` — [NEW]
  - `frontend/pages/volunteer/CampaignsPage.css` — [NEW]
- **Mô tả:**
  - Hiển thị danh sách chiến dịch đang mở (`SP_LAY_DS_CHIENDICH_MO`).
  - TNV nhấn "Đăng ký" gọi `SP_TNV_DANGKY_THAMGIA`; hệ thống kiểm tra `SF_CHECK_DK_THAMGIA` trước khi cho phép.

### FEAT: Trang lịch sử hoạt động cá nhân (HistoryPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 14:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/volunteer/HistoryPage.jsx` — [NEW]
  - `frontend/pages/volunteer/HistoryPage.css` — [NEW]
- **Mô tả:**
  - Hiển thị toàn bộ lịch sử tham gia chiến dịch, trạng thái duyệt, tổng giờ tích lũy từ `SF_TINH_TONG_GIO_TNV`.
  - Thông tin điểm thưởng và xếp loại hiện tại.
