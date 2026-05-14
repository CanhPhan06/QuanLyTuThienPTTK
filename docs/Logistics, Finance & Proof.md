ĐẶC TẢ CHI TIẾT CỤM 3: HẬU CẦN, TÀI CHÍNH & MINH CHỨNG (LOGISTICS, FINANCE & PROOF)
1. TỔNG QUAN CỤM CHỨC NĂNG
Cụm 3 đóng vai trò là "hệ thống đối soát trung tâm", đảm bảo mọi nguồn lực (tiền bạc, vật tư) và kết quả đóng góp của tình nguyện viên (TNV) được ghi nhận chính xác, minh bạch.

Mục tiêu: Quản lý dòng tiền (Inbound/Outbound), quản lý kho vật phẩm và số hóa minh chứng.

Đối tượng tương tác: Ban quản lý (BQL - Phê duyệt), Ban điều hành (BDH - Đề xuất/Quản lý), Tình nguyện viên (TNV - Thực hiện/Nộp minh chứng).

2. MÔ TẢ CHI TIẾT CÁC TÍNH NĂNG & LUỒNG SỰ KIỆN
2.1. Quản lý Tài chính & Ngân quỹ Chiến dịch
Mô tả: Quản lý việc tiếp nhận quyên góp và chi tiêu cho từng chiến dịch cụ thể, đảm bảo không chi vượt định mức ngân quỹ.

Luồng sự kiện từ đầu tới cuối:

Tiếp nhận (Inbound): BQL/Nhà hảo tâm thực hiện quyên góp qua SP_QUYENGOP_TIEN.

Hệ thống ghi nhận vào bảng QuyenGopTien.

Trạng thái thanh toán được cập nhật vào bảng ThanhToan.

Tiền được cộng dồn vào QuyChung.

Đề xuất Chi (Outbound): BDH lập phiếu chi tiêu cho chiến dịch.

Hệ thống tự động gọi SF: Sử dụng hàm SF_TINH_NGAN_QUY_CD(MaChienDich) để tính toán số dư hiện có của chiến dịch đó.

Kiểm tra điều kiện: Nếu SoTienChi > Số dư khả dụng, hệ thống từ chối tạo phiếu và báo lỗi "Ngân quỹ không đủ".

Thực thi Chi: Sau khi BQL phê duyệt, hệ thống gọi SP_THEM_CHITIEU để ghi nhận khoản chi chính thức.

Minh chứng tài chính: BDH/BQL đính kèm hóa đơn/biên lai vào bảng MinhChungChiTieu để hoàn tất hồ sơ.

2.2. Quản lý Hậu cần & Kho Vật phẩm
Mô tả: Quản lý vòng đời của vật phẩm từ lúc nhập kho (được tài trợ/mua mới) đến lúc xuất kho cho TNV sử dụng.

Luồng sự kiện từ đầu tới cuối:

Nhập kho: Tiếp nhận vật phẩm tài trợ (PhieuQuyenGopVP) hoặc mua mới.

Gọi SP_NHAPKHO_VATPHAM.

Hệ thống cập nhật số lượng tồn kho trong bảng LoaiVatPham.

Yêu cầu vật tư: BDH lập phiếu xuất kho (PhieuXuatVatPham) cho các hoạt động của chiến dịch.

Logic ràng buộc: Hệ thống kiểm tra SoLuong trong LoaiVatPham. Nếu không đủ, phiếu xuất không được tạo.

Xuất kho thực tế: Gọi SP_XUATKHO_VATPHAM.

Hệ thống trừ số lượng tồn kho và ghi log chi tiết vào ChiTietXuatVP.

Trạng thái vật phẩm chuyển sang "Đã xuất".

2.3. Hệ thống Minh chứng hoạt động (Digital Proof)
Mô tả: TNV cung cấp bằng chứng số (ảnh, tài liệu) để chứng minh nhiệm vụ đã hoàn thành.

Luồng sự kiện từ đầu tới cuối:

Thực hiện: TNV hoàn thành công việc được giao trong ThamGiaTNV.

Nộp minh chứng: TNV upload ảnh/file qua giao diện.

Hệ thống gọi SP_CAPNHAT_MINHCHUNG để insert dữ liệu vào bảng MinhChungTNV.

Dữ liệu được liên kết trực tiếp với mã tham gia (MaThamGia).

Đối soát: BDH kiểm tra minh chứng trên Dashboard.

Nếu minh chứng hợp lệ -> BDH thực hiện điểm danh (SP_DIEM_DANH).

Nếu minh chứng không đạt -> Yêu cầu nộp lại hoặc từ chối ghi nhận giờ công.

3. CÁC LUỒNG LIÊN QUAN & TƯƠNG TÁC HỆ THỐNG
3.1. Liên quan giữa Tài chính và Hậu cần
Khi BQL mua vật tư bằng ngân quỹ chiến dịch: Luồng chi tiền (ChiTieu) sẽ kích hoạt luồng nhập kho (SP_NHAPKHO_VATPHAM) tương ứng.

Mọi phiếu xuất kho vật tư phải được đối chiếu với mã chiến dịch để đảm bảo vật tư dùng đúng mục đích.

3.2. Liên quan tới Cụm 2 (Quản lý Chiến dịch)
Điều kiện khởi chạy: Một chiến dịch chỉ có thể thực hiện chi tiêu hoặc xuất kho khi trạng thái chiến dịch là HoatDong.

Ràng buộc nhân sự: Chỉ những TNV có tên trong danh sách ThamGiaTNV của chiến dịch đó mới được phép nhận vật tư hoặc nộp minh chứng cho chiến dịch đó.

3.3. Liên quan tới Cụm 4 (Đánh giá & Chứng nhận)
Đầu vào đánh giá: Dữ liệu từ MinhChungTNV là căn cứ pháp lý để BDH nhập điểm đánh giá (DiemDanhGia) trong bảng ThamGiaTNV.

Điều kiện cấp chứng nhận: Hệ thống kiểm tra tổng số giờ công (tính từ bảng DiemDanh - vốn được xác thực qua minh chứng) để quyết định TNV có đủ điều kiện nhận giấy chứng nhận điện tử (GiayChungNhan) hay không.

4. LOGIC NGHIỆP VỤ ĐẶC THÙ (DATABASE CONSTRAINTS)
Để đảm bảo hệ thống vận hành trơn tru và không lỗi, Antigravity cần tuân thủ các ràng buộc sau:

Tính toàn vẹn (Integrity): Không được xóa loại vật phẩm nếu vẫn còn tồn kho hoặc có phiếu xuất liên quan.

Trigger tự động: * TRG_CAPNHAT_SOLUONG_KHO: Tự động cập nhật số lượng trong LoaiVatPham ngay khi có phiếu nhập/xuất thành công.

TRG_KIEMTRA_NGAN_SACH: Ngăn chặn mọi hành vi insert vào bảng ChiTieu nếu giá trị trả về của SF_TINH_NGAN_QUY_CD < 0.

Trạng thái liên thông: Khi một chiến dịch bị Huy (Trigger TRG_HUY_CHIENDICH_DONGLOAT), mọi phiếu chi tiêu chưa thanh toán và phiếu xuất kho chưa thực hiện của chiến dịch đó phải tự động chuyển sang trạng thái Huy.

Đầu ra mong muốn cho Antigravity: - Một bộ mã nguồn đồng nhất, nơi giao diện (React) phản ánh chính xác trạng thái thực của Database.

Các hàm API trung gian xử lý lỗi Oracle (Exception Handling) một cách chuyên nghiệp, không làm treo ứng dụng khi gặp lỗi logic (như hết kho, hết tiền).

Tổ chức mã nguồn theo thư mục riêng biệt cho Finance, Logistics, và Proof để dễ dàng bảo trì và mở rộng.