# Changelog - Module Ban Điều Hành (BDH)

Tài liệu này ghi lại các thay đổi, cập nhật mã nguồn liên quan đến phân quyền Ban Điều Hành.

---

## [Unreleased]
- Khởi tạo tệp changelog.

---

## [2026-05-14] - Cụm 4: Đánh Giá & Xếp Loại TNV

### FEAT: Trang đánh giá và xếp loại tình nguyện viên (EvaluationPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 20:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/executive/EvaluationPage.jsx` — [NEW] Trang chấm điểm TNV theo chiến dịch
  - `frontend/pages/executive/EvaluationPage.css` — [NEW] CSS White Panel cho trang đánh giá
  - `frontend/services/evaluation.js` — [NEW] API service gọi endpoint `/api/evaluation`
- **Mô tả:**
  - Hiển thị danh sách TNV đã được duyệt/hoàn thành theo từng chiến dịch.
  - BDH nhập `DiemDanhGia` (0–100) và nhận xét rồi gọi `SP_DANHGIA_TNV`.
  - Huy hiệu xếp loại (Xuất Sắc/Tốt/Khá/Trung Bình) được tính động qua `SF_GET_XEP_LOAI` — **không hard-code ngưỡng**.
  - Thiết kế Solid White Panel nhất quán với các trang cũ.

---

## [2026-05-13] - Cụm 3: Hậu Cần, Điểm Danh & Minh Chứng

### FEAT: Trang đối soát & điểm danh TNV (ProofReviewPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 16:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/executive/ProofReviewPage.jsx` — [NEW] Trang xem minh chứng và điểm danh
  - `frontend/pages/executive/ProofReviewPage.css` — [NEW]
- **Mô tả:**
  - Hiển thị gallery minh chứng do TNV nộp (ảnh + loại minh chứng).
  - BDH chọn nhiệm vụ cụ thể và trạng thái (CoMat/VangMat/CoPhep) rồi gọi `SP_DIEMDANH_TNV` để ghi nhận giờ công.
  - Chỉ cho phép điểm danh một lần per minh chứng (badge "Đã Điểm Danh").

### FEAT: Trang quản lý hậu cần & kho vật phẩm (LogisticsPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 17:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/executive/LogisticsPage.jsx` — [NEW]
  - `frontend/pages/executive/LogisticsPage.css` — [NEW]
- **Mô tả:**
  - BDH xem danh sách vật phẩm tồn kho, lập phiếu xuất kho qua `SP_XUATKHO_VATPHAM`.
  - Cảnh báo tồn kho thấp lấy ngưỡng động từ `THAMSO.NGUONG_TON_KHO_CANH_BAO`.

### FEAT: Trang duyệt tham gia chiến dịch (ApproveParticipationPage)
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 15:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/pages/executive/ApproveParticipationPage.jsx` — [NEW]
  - `frontend/pages/executive/ApproveParticipationPage.css` — [NEW]
- **Mô tả:**
  - BDH duyệt/từ chối đơn đăng ký TNV cho từng chiến dịch qua `SP_DUYET_DANGKY_TNV`.
  - Phân công nhiệm vụ cơ bản (`SP_TAO_NHIEMVU_MACDINH`) cho TNV ngay sau khi duyệt.

### FIX: Sửa lỗi phân công nhiệm vụ vi phạm FK_CV_CD
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-13 15:30 (ICT)
- **Files ảnh hưởng:**
  - `backend/src/services/executiveService.js`
- **Mô tả:**
  - Lỗi `ORA-02291: integrity constraint (HQTCSDLDB.FK_CV_CD) violated` khi tạo nhiệm vụ mặc định.
  - Sửa lại logic: phải đảm bảo `MaChienDich` tồn tại trong bảng `CongViec` trước khi gọi `SP_PHANCONG_TNV`.

### UI: Chuyển đổi giao diện từ Glassmorphism sang Solid White Panel
- **Tác giả:** Trần Nhụy Tam Tử Phục
- **Thời gian:** 2026-05-14 12:00 (ICT)
- **Files ảnh hưởng:**
  - `frontend/components/common/GlassCard.css` — Rewrite từ dark glass sang white panel
  - `frontend/pages/executive/LogisticsPage.css` — Sửa màu badge tồn kho về dark tone
  - `frontend/pages/executive/ProofReviewPage.css` — Sửa màu tên TNV và ngày về dark tone
- **Mô tả:**
  - Phản hồi từ người dùng: chữ và nội dung bị ẩn trên nền Glassmorphism tối.
  - Chuyển toàn bộ `.sys-glass-card` về white background (`#ffffff`), chữ về `#0D1B2A`.
