Tài liệu Đặc tả Chức năng & Luồng Nghiệp vụ - Cụm 4: Evaluation, Certification & Statistics
1. Tổng quan Cụm 4
Cụm 4 là giai đoạn kết thúc và nghiệm thu (Closure Phase) của một chiến dịch. Mục tiêu là định lượng hóa đóng góp của Tình nguyện viên (TNV) thông qua điểm số, giờ công, từ đó cấp chứng nhận và xuất báo cáo hiệu quả hệ thống.

2. Thành phần Dữ liệu & Quy tắc Nghiệp vụ (Core Business Rules)
2.1. Bản đồ dữ liệu (Database Mapping)
Antigravity phải thực hiện truy vấn và xử lý trên các thực thể sau:

Đánh giá: DiemDanh, ThamGiaTNV (cột DiemDanhGia).

Chứng nhận: GiayChungNhan (MaGCN, MaThamGia, NgayCap, MaXacThuc).

Quy định: ThamSo (Lưu các mốc điểm/giờ để xếp loại).

Thống kê: ChienDich, QuyenGopTien, ChiTieu.

2.2. Logic Xếp loại Tự động (Dynamic Classification)
Hệ thống không được fix cứng logic xếp loại trong code. Antigravity phải gọi hàm SF_GET_XEP_LOAI(p_MaThamGia).

Hàm này tự động đọc các mốc DIEM_XUAT_SAC, GIO_XUAT_SAC, DIEM_TOT,... từ bảng ThamSo.

Kết quả trả về: 'Xuất sắc', 'Tốt', 'Khá', 'Trung bình', 'Không đạt'.

3. Luồng xử lý chi tiết (Detailed Process Flow)
3.1. Luồng Điểm danh & Đánh giá (Evaluation Flow)
BDH: Truy cập danh sách TNV trong chiến dịch.

Hệ thống: Hiển thị nút "Điểm danh" và "Chấm điểm".

Thực thi: - Gọi SP_DIEM_DANH để ghi nhận ngày công và SoGioGhiNhan.

Cập nhật trực tiếp vào trường DiemDanhGia trong bảng ThamGiaTNV.

Kết quả: Hệ thống hiển thị nhãn (Badge) xếp loại thời gian thực bằng cách gọi hàm SF_GET_XEP_LOAI.

3.2. Luồng Cấp Giấy chứng nhận (Certification Flow)
BQL: Mở module "Quản lý Chứng nhận".

Hệ thống: Lọc danh sách TNV có trạng thái chiến dịch là HoanThanh và xếp loại >= 'Khá'.

BQL: Nhấn "Cấp chứng nhận hàng loạt" hoặc cấp lẻ.

Thực thi Backend: - Gọi SP_CAP_GIAY_CHUNG_NHAN(p_MaThamGia, p_MaNguoiKy).

Hệ thống sinh mã MaXacThuc (Unique) và lưu vào bảng GiayChungNhan.

Output UI: Render giao diện Giấy chứng nhận (Glassmorphism style) gồm: Tên TNV, Tên chiến dịch, Xếp loại và QR Code chứa link xác thực mã.

3.3. Luồng Thống kê & Dashboard (Analytics Flow)
Dashboard BQL: Gọi hàm SF_TINH_TONG_GIO_TNV để hiển thị Top 5 TNV tiêu biểu.

Báo cáo Chiến dịch: Gọi SP_BAOCAO_HIEUQUA_CD.

Trả về SYS_REFCURSOR gồm TongThu và TongChi.

Antigravity chuyển dữ liệu này thành biểu đồ cột (Bar Chart) so sánh.

Quản trị hệ thống: BQL thay đổi các mốc xếp loại qua SP_THAYDOI_THAMSO.

4. Tương tác liên chức năng (Cross-functional Relationships)
Với Cụm 1 (Profile): Chứng nhận sau khi cấp phải xuất hiện trong mục "Achievement/Thành tích" trên trang cá nhân của TNV.

Với Cụm 3 (Logistics): Báo cáo hiệu quả chỉ chính xác khi dữ liệu ChiTieu và QuyenGopTien đã được đối soát hoàn tất.

Với Hệ thống Thông báo: Ngay khi SP_CAP_GIAY_CHUNG_NHAN chạy thành công, hệ thống phải tự động tạo một bản ghi vào bảng ThongBao để báo cho TNV.

5. Hướng dẫn Triển khai Mã nguồn (Implementation Specs for Antigravity)
Backend (Node.js/Express)
Service: EvaluationService.js chịu trách nhiệm tổng hợp dữ liệu từ SF và SP.

Controller: ReportController.js xử lý việc xuất file PDF chứng nhận và dữ liệu JSON cho biểu đồ.

Frontend (React + Glassmorphism)
Component ClassificationBadge.jsx: Màu sắc thay đổi theo kết quả của SF_GET_XEP_LOAI (Xuất sắc: Vàng Gold, Tốt: Xanh lá, Khá: Cam).

Component AnalyticsDashboard.jsx: Sử dụng thư viện Chart.js hoặc Recharts. Background phải dùng backdrop-filter: blur(15px) và viền #F58220 mảnh.

Component CertificateTemplate.jsx: Thiết kế mẫu chứng nhận sang trọng trên nền Navy (#0D1B2A), chữ trắng và họa tiết cam.

6. Danh sách SP/SF trọng tâm cần sử dụng
SF_GET_XEP_LOAI: Lấy xếp loại dựa trên điểm và giờ.

SF_TINH_TONG_GIO_TNV: Tính tổng cống hiến của 1 cá nhân.

SP_CAP_GIAY_CHUNG_NHAN: Lưu trữ dữ liệu chứng nhận chính thức.

SP_BAOCAO_HIEUQUA_CD: Lấy dữ liệu tài chính cho báo cáo.

SP_THAYDOI_THAMSO: Cập nhật quy định hệ thống.

Ghi chú cho Antigravity: Luôn kiểm tra trạng thái chiến dịch trước khi thực hiện đánh giá. Chỉ những chiến dịch có trạng thái 'HoatDong' hoặc 'HoanThanh' mới được phép thực hiện các thao tác trong cụm này. Đảm bảo tính bảo mật: Chỉ BQL và BDH phụ trách chiến dịch mới có quyền chấm điểm.