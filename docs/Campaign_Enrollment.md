# Tài liệu Đặc tả Chức năng & Luồng Nghiệp vụ - Cụm 2: Quản lý Chiến dịch & Đăng ký tham gia

## 1. Tổng quan Cụm 2
Cụm này điều phối mối quan hệ giữa **Ban Quản lý (BQL)** - người tạo ra cơ hội, **Tình nguyện viên (TNV)** - người cung cấp sức lao động, và **Ban Điều hành (BDH)** - người quản lý và phân phối nguồn lực.

---

## 2. Mô tả chi tiết chức năng

### 2.1. Tạo mới Chiến dịch tình nguyện (Dành cho BQL)
- **Mô tả:** Khởi tạo các đợt hoạt động mới trong hệ thống.
- **Dữ liệu đầu vào:** Tên chiến dịch, Mô tả, Ngày bắt đầu, Ngày kết thúc, Địa điểm, Số lượng TNV tối đa, BDH phụ trách (User_ID của thành viên BDH).
- **Luồng xử lý:**
    1. BQL điền form thông tin.
    2. Hệ thống kiểm tra: `Ngày bắt đầu < Ngày kết thúc`.
    3. Ghi dữ liệu vào bảng `CHIEN_DICH`.
- **Đầu ra:** Bản ghi chiến dịch mới với trạng thái `OPENING`.

### 2.2. Đăng ký tham gia chiến dịch (Dành cho TNV)
- **Mô tả:** TNV lựa chọn và ứng tuyển vào các chiến dịch đang mở.
- **Điều kiện tiên quyết:** Tài khoản TNV phải có trạng thái `ACTIVE` và chưa hết hạn đăng ký.
- **Luồng xử lý:**
    1. TNV xem danh sách chiến dịch.
    2. Hệ thống kiểm tra trùng lịch: Gọi Stored Procedure để so sánh khung thời gian của chiến dịch này với các chiến dịch TNV đã được duyệt trước đó.
    3. Ghi dữ liệu vào bảng `DANG_KY_THAM_GIA` với trạng thái `PENDING`.
- **Đầu ra:** Đơn đăng ký chờ duyệt.

### 2.3. Duyệt tham gia & Phân công nhiệm vụ (Dành cho BDH)
- **Mô tả:** BDH chọn lọc TNV và gán vai trò cụ thể trong chiến dịch.
- **Dữ liệu đầu vào:** Mã đơn đăng ký, Quyết định (Duyệt/Từ chối), Vai trò (Trưởng nhóm/Thành viên/Hậu cần...), Mô tả nhiệm vụ.
- **Luồng xử lý:**
    1. BDH xem danh sách TNV đăng ký cho chiến dịch mình phụ trách.
    2. Nếu "Duyệt": Cập nhật trạng thái trong `DANG_KY_THAM_GIA` thành `APPROVED`.
    3. Gán mã vai trò vào bảng `PHAN_CONG_NHIEM_VU`.
- **Đầu ra:** Danh sách nhân sự chính thức của chiến dịch.

---

## 3. Luồng xử lý liên thông hệ thống (Sequence Flow)

1. **BQL** -> `INSERT CHIEN_DICH` -> Trạng thái: `OPENING`.
2. **Hệ thống** -> Hiển thị chiến dịch lên Dashboard của **TNV**.
3. **TNV** -> `INSERT DANG_KY_THAM_GIA` -> Chạy Trigger kiểm tra (Trạng thái tài khoản & Trùng lịch).
4. **BDH** -> `UPDATE DANG_KY_THAM_GIA` -> Chuyển trạng thái sang `APPROVED`.
5. **Hệ thống** -> Cập nhật số lượng TNV hiện tại của chiến dịch. Nếu đủ chỉ tiêu -> `UPDATE CHIEN_DICH` -> Trạng thái: `FULL`.

---

## 4. Đặc tả Cơ sở dữ liệu (Backend Logic)

### 4.1. Stored Procedure: `SP_DANG_KY_CHIEN_DICH`
- **Tham số:** `p_MaTNV`, `p_MaChienDich`.
- **Logic:**
    - Check 1: `SELECT TrangThai FROM TAI_KHOAN WHERE MaTNV = p_MaTNV` (Phải là 'ACTIVE').
    - Check 2: `SELECT COUNT(*)` từ các chiến dịch đã duyệt của TNV này xem có trùng `StartDate` và `EndDate` không.
    - Check 3: Kiểm tra `CurrentDate < StartDate` của chiến dịch.

### 4.2. Trigger: `TRG_UPDATE_SOLUONG_TNV`
- **Sự kiện:** `AFTER UPDATE` trên bảng `DANG_KY_THAM_GIA` khi `TrangThai = 'APPROVED'`.
- **Hành động:** Tăng `SoLuongHienTai` trong bảng `CHIEN_DICH`.

---

## 5. Tham khảo UI/UX & Luồng sự kiện
- **Màn hình TNV:** Sử dụng Layout Card (giống Eventbrite). Mỗi Card có nút "Đăng ký" và Progress Bar thể hiện độ lấp đầy (Số lượng đã duyệt / Chỉ tiêu).
- **Màn hình BDH:** Sử dụng Data Table tích hợp Filter (Lọc theo chiến dịch, lọc theo kỹ năng). Có nút hành động nhanh (Duyệt nhanh hàng loạt).
- **Tham khảo:** Module "Volunteer Management" của Salesforce hoặc các template Dashboard trên Dribbble với từ khóa "Campaign Management".

---