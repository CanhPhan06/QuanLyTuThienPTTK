📜 DESIGN.MD - HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG TÌNH NGUYỆN SINH VIÊN
1. THÔNG SỐ KỸ THUẬT & NỀN TẢNG
Tech Stack: React 18 (Vite) + Node.js (Express) + Electron + Oracle 19c.

Target Device: Asus Zenbook 14 OLED.

Resolution: Cố định Full Screen (16:10 - 2880 x 1800 hoặc 1920 x 1200 tùy cấu hình máy). Giao diện phải được tối ưu để hiển thị hoàn hảo trên tấm nền OLED (độ tương phản cao).

2. QUY TẮC THỊ GIÁC (VISUAL IDENTITY)
Dựa trên cảm hứng từ slide image_57cb2f.png:

Màu chủ đạo (Primary): Cam (#F58220) - Đại diện cho sự năng động của sinh viên.

Màu nhấn (Accent): Xanh Đen (#0D1B2A) - Sử dụng cho Sidebar hoặc các Header quan trọng để tạo sự vững chãi.

Màu nền (Background): Trắng (#FFFFFF) và Xám nhạt (#F8F9FA).

Chế độ: Mặc định Light Mode.

Phong cách: Modern UI. Sử dụng các thẻ (Cards) có đổ bóng nhẹ (Soft shadows) và bo góc (Border radius: 12px-16px).

3. CẤU TRÚC ĐIỀU HƯỚNG & PHÂN QUYỀN
Navigation: Left Sidebar cố định. Sidebar có thể thu nhỏ (Mini-sidebar) để tối ưu không gian cho nội dung chính.

UI theo phân quyền:

BQL (Ban Quản Lý): Tập trung vào Dashboard tổng quan, quản lý danh mục và phê duyệt cấp cao.

BDH (Ban Điều Hành): Tập trung vào quản lý chi tiết chiến dịch, nhập xuất kho và báo cáo tài chính.

TNV (Tình Nguyện Viên): Tập trung vào đăng ký hoạt động, xem lịch sử giờ công và tải chứng nhận.

4. QUY TẮC TƯƠNG TÁC (INTERACTION RULES)
Phản hồi hệ thống: Mọi thông báo (Thành công, Lỗi từ Oracle) phải sử dụng Modal Dialog nằm giữa màn hình, yêu cầu người dùng bấm "OK" để xác nhận.

Validation: Thực hiện Client-side validation một lần duy nhất khi người dùng nhấn nút Gửi (Submit). Không báo lỗi khi đang nhập liệu để tránh gây phiền nhiễu.

Dữ liệu: Tuyệt đối chỉ hiển thị dữ liệu đã được ghi nhận trong Database Oracle.

5. TIÊU CHUẨN DỮ LIỆU & XUẤT BẢN
Data Tables: Phải tích hợp bộ thư viện có khả năng:

Xuất dữ liệu: PDF (cho Chứng nhận), Excel/Word (cho Báo cáo tài chính, Danh sách vật phẩm).

Tính năng: Tìm kiếm nhanh, sắp xếp cột.

Ngôn ngữ: 100% Tiếng Việt thuần túy. Chỉ giữ Tiếng Anh cho các thuật ngữ kỹ thuật không thể thay thế (ví dụ: Onboarding, Dashboard, Profile...).