Dưới đây là nội dung file **LIST_FEAT.MD** đã được hiệu chỉnh để loại bỏ các xung đột về phân quyền, tách bạch rõ ràng giữa vai trò **Thực hiện (BDH)** và **Phê duyệt (BQL)** theo các đánh giá khắt khe về mặt nghiệp vụ.

---

📋 **LIST_FEAT.MD - DANH SÁCH TÍNH NĂNG CHI TIẾT**
Tài liệu này phân rã các yêu cầu nghiệp vụ thành các User Story và Feature cụ thể, tương ứng với 3 phân quyền hệ thống.

**1. MODULE DÙNG CHUNG (COMMON FEATURES)**
Dành cho tất cả tài khoản, tập trung vào xác thực và cá nhân hóa.

* **[F1.1] Đăng nhập hệ thống:** Xác thực tài khoản qua Oracle SP, nhận diện Role_ID để điều hướng UI.
* **[F1.2] Quản lý hồ sơ (Profile):** Cập nhật thông tin cá nhân (Họ tên, Khoa, Email, SĐT, Ảnh đại diện).
* **[F1.3] Đổi mật khẩu:** Xác thực mật khẩu cũ và cập nhật mật khẩu mới (có Hash tại Node.js).
* **[F1.4] Hệ thống thông báo (Notification):** Hiển thị các thông báo quan trọng từ BQL hoặc nhắc nhở lịch trình chiến dịch.

---

## 2.1. Danh sách toàn bộ yêu cầu phần mềm và mô tả chi tiết

1. **Tiếp nhận đăng ký tài khoản tình nguyện viên:** Hồ sơ đăng ký phải được nhập đầy đủ các thông tin bắt buộc gồm Họ và tên, Ngày sinh, Giới tính, Số điện thoại, Email và Mật khẩu. Email và số điện thoại phải hợp lệ, đúng định dạng và không được trùng lặp trong hệ thống. Mật khẩu phải có độ dài tối thiểu 6 ký tự và thông tin cá nhân phải được bảo mật.
2. **Duyệt hồ sơ tình nguyện viên:** Phân định rõ hai cấp độ duyệt. Ban quản lý duyệt tiếp nhận tài khoản mới vào hệ thống. Ban điều hành duyệt danh sách tham gia vào từng chiến dịch cụ thể. Trạng thái xét duyệt bao gồm "Đã duyệt", "Từ chối" hoặc "Chờ duyệt". Mỗi hồ sơ chỉ được duyệt một lần và hệ thống phải lưu lại thông tin người duyệt để phục vụ kiểm tra.
3. **Tạo mới chiến dịch tình nguyện:** Yêu cầu nhập đầy đủ tên chiến dịch, thời gian và địa điểm. Tên chiến dịch không được phép trùng lặp, ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu và mỗi chiến dịch phải được gắn với một người phụ trách chính thuộc Ban điều hành.
4. **Đăng ký tham gia chiến dịch:** Tình nguyện viên chỉ được đăng ký tham gia khi tài khoản đã được duyệt hợp lệ bởi Ban quản lý. Không được phép đăng ký trùng cùng một chiến dịch. Ngày đăng ký phải hợp lệ và nằm trước ngày bắt đầu chiến dịch, đồng thời vai trò đăng ký phải tồn tại trong hệ thống.
5. **Quản lý đối tác và ký kết tài trợ:** Quản lý thông tin đơn vị tài trợ phải đầy đủ và chính xác. Tên đơn vị không được để trống, các thông tin liên lạc như email và số điện thoại phải hợp lệ.
6. **Điểm danh tình nguyện viên:** Chỉ áp dụng điểm danh cho các tình nguyện viên đã đăng ký tham gia hợp lệ. Mỗi người chỉ được điểm danh một lần trong mỗi buổi hoạt động, với các trạng thái điểm danh xác định rõ ràng (có mặt, vắng mặt).
7. **Cập nhật minh chứng hoạt động:** Các minh chứng được cập nhật phải liên quan trực tiếp đến hoạt động đã tham gia. Tệp đính kèm (ảnh hoặc tài liệu) phải đúng định dạng, nội dung phải rõ ràng và không vi phạm các quy định chung của hệ thống.
8. **Đánh giá, xếp loại tình nguyện viên:** Điểm đánh giá phải nằm trong khoảng được hệ thống quy định (ví dụ 0-10). Mỗi tình nguyện viên chỉ được đánh giá một lần cho mỗi chiến dịch. Nhận xét phải đảm bảo tính khách quan và phù hợp.
9. **Quản lý kho vật dụng/nhu yếu phẩm:** Số lượng vật phẩm trong kho luôn phải lớn hơn hoặc bằng 0. Mỗi vật phẩm phải có đơn vị tính cụ thể, rõ ràng và không được phép nhập trùng tên vật phẩm. Ban điều hành lập phiếu xuất/nhập, Ban quản lý thực hiện phê duyệt.
10. **Ghi nhận đóng góp tài chính:** Số tiền đóng góp ghi nhận phải lớn hơn 0. Giao dịch phải xác định rõ tên nhà tài trợ và ngày đóng góp. Toàn bộ thông tin phải được lưu trữ chính xác để phục vụ cho các nghiệp vụ thống kê tài chính.
11. **Lập phiếu chi tiêu chiến dịch:** Ban điều hành thực hiện lập phiếu trên hệ thống cho mọi khoản xuất quỹ kèm theo lý do cụ thể và minh chứng (hóa đơn/biên lai) hợp lệ. Ban quản lý thực hiện phê duyệt phiếu chi. Hệ thống sẽ tự động đối soát số tiền xuất quỹ với tổng ngân sách hiện có để ngăn chặn tình trạng vượt hạn mức chi.
12. **Cấp giấy chứng nhận điện tử:** Giấy chứng nhận điện tử được cấp tự động hoặc do Ban quản lý duyệt cho những cá nhân đã tham gia đầy đủ, hoàn thành nhiệm vụ và đạt tiêu chuẩn dựa trên xác nhận của Ban điều hành. Giấy phải có đủ chữ ký số hoặc mã xác thực của tổ chức.
13. **Thống kê số lượng chiến dịch và hiệu quả:** Cho phép xuất báo cáo thống kê định kỳ để tổng hợp chính xác dữ liệu về mức độ hiệu quả, bao gồm tổng số lượng chiến dịch đã triển khai, tổng lượt sinh viên tham gia và tổng ngân sách đã giải ngân.
14. **Tra cứu lịch sử hoạt động cá nhân:** Cho phép tình nguyện viên tra cứu lại toàn bộ lịch sử tham gia của cá nhân, hiển thị đầy đủ thông tin các chiến dịch, thời gian tham gia, số giờ công tác xã hội tích lũy và điểm đánh giá.
15. **Quản lý tin tức và thông báo:** Cung cấp tính năng tạo, chỉnh sửa, gỡ bỏ các bài đăng tin tức, thông báo trên hệ thống. Ban quản lý quản lý thông báo toàn hệ thống; Ban điều hành quản lý thông báo trong phạm vi chiến dịch phụ trách.
16. **Phân công nhiệm vụ/vai trò cho TNV:** Ban điều hành thực hiện phân công cụ thể vai trò và nhiệm vụ cho cá nhân trước khi hoạt động diễn ra. Ban quản lý giám sát và phê duyệt sơ đồ phân công tổng thể để đảm bảo tiến độ.
17. **Thay đổi quy định:** Thao tác thay đổi, cập nhật hoặc thiết lập các quy định, tham số chỉ được thực hiện bởi cấp quản lý cao nhất (Ban quản lý). Hệ thống tự động ghi vết (log) mọi thao tác này bao gồm người thực hiện, thời gian và nội dung trước/sau khi đổi để đối soát.

---

## 2.2. Danh sách yêu cầu phần mềm dành cho Tình nguyện viên

1. **Tiếp nhận đăng ký tài khoản tình nguyện viên:** Tình nguyện viên thực hiện đăng ký bằng cách cung cấp thông tin cá nhân bắt buộc (Họ tên, Ngày sinh, Giới tính, SĐT, Email, Mật khẩu). Email và SĐT không được trùng lặp, mật khẩu tối thiểu 6 ký tự để hệ thống xác thực tài khoản an toàn.
2. **Đăng ký tham gia chiến dịch:** Tình nguyện viên sử dụng chức năng này để đăng ký các chiến dịch đang mở. Yêu cầu tài khoản phải ở trạng thái đã được duyệt bởi Ban quản lý, thời gian đăng ký phải trước ngày bắt đầu chiến dịch.
3. **Cập nhật minh chứng hoạt động:** Sau hoặc trong quá trình tham gia, tình nguyện viên nộp minh chứng (tệp ảnh/tài liệu) để xác thực các hoạt động đóng góp. Nội dung nộp lên phải đúng định dạng và tuân thủ quy định hệ thống.
4. **Tra cứu lịch sử hoạt động cá nhân:** Cung cấp giao diện để tình nguyện viên theo dõi tiến độ của bản thân, xem lại toàn bộ các chiến dịch đã tham gia, số giờ xã hội tích lũy và kết quả, chứng nhận đã được cấp.
5. **Quản lý tin tức và thông báo:** Tình nguyện viên sử dụng hệ thống để tiếp cận và nắm bắt các tin tức, thông báo mới nhất liên quan đến nhiệm vụ và các chiến dịch một cách kịp thời.

---

## 2.3. Danh sách yêu cầu phần mềm dành cho Ban điều hành

1. **Duyệt tham gia chiến dịch:** Ban điều hành kiểm tra đơn đăng ký của tình nguyện viên cho chiến dịch cụ thể để đưa ra quyết định "Đã duyệt" hoặc "Từ chối". Thao tác chỉ thực hiện với TNV đã có tài khoản hợp lệ.
2. **Điểm danh tình nguyện viên:** Ban điều hành điểm danh những cá nhân đã đăng ký tham gia hợp lệ. Thao tác ghi nhận tính trạng thái cụ thể (có mặt, vắng mặt) và mỗi tình nguyện viên chỉ được hệ thống ghi nhận điểm danh một lần trong mỗi buổi.
3. **Đánh giá, xếp loại tình nguyện viên:** Ban điều hành trực tiếp nhận xét và nhập điểm đánh giá (trong khung điểm quy định) cho từng cá nhân dựa trên quá trình tham gia thực tế.
4. **Quản lý tin tức và thông báo chiến dịch:** Có quyền hạn để tạo mới, chỉnh sửa hoặc gỡ bỏ các thông báo, tin tức trong phạm vi chiến dịch được phân công để điều hướng thông tin kịp thời cho TNV.
5. **Phân công nhiệm vụ chi tiết:** Chịu trách nhiệm chính trong việc thiết lập các nhiệm vụ, vai trò cụ thể cho các tình nguyện viên. Đây là cơ sở trực tiếp cho việc điểm danh và đánh giá sau này.
6. **Lập đề xuất phiếu thu/chi và nhập/xuất kho:** Thực hiện lập các yêu cầu về tài chính và vật tư phục vụ chiến dịch để trình Ban quản lý phê duyệt.

---

## 2.4. Danh sách yêu cầu phần mềm dành cho Ban quản lý

1. **Duyệt tiếp nhận tài khoản TNV:** Kiểm tra và phê duyệt yêu cầu đăng ký tài khoản mới của sinh viên vào hệ thống, đảm bảo tính pháp lý của người dùng.
2. **Tạo mới chiến dịch tình nguyện:** Khởi tạo chiến dịch mới, xác định mục tiêu và chỉ định nhân sự thuộc Ban điều hành chịu trách nhiệm phụ trách chính.
3. **Quản lý đối tác và ký kết tài trợ:** Lưu trữ hồ sơ đối tác, kiểm soát các hợp đồng tài trợ và thông tin liên lạc để hỗ trợ nguồn lực cho toàn hệ thống.
4. **Phê duyệt quản lý kho vật dụng:** Thực hiện xét duyệt các phiếu nhập/xuất kho từ Ban điều hành gửi lên, đảm bảo số lượng tồn kho luôn >= 0 và minh bạch.
5. **Ghi nhận đóng góp tài chính:** Cập nhật nguồn thu từ các nhà hảo tâm vào quỹ chung của hệ thống. Đảm bảo tính chính xác về số tiền và thông tin nhà tài trợ.
6. **Phê duyệt phiếu chi tiêu:** Kiểm tra minh chứng và phê duyệt các khoản xuất quỹ từ đề xuất của Ban điều hành, đảm bảo tổng chi không vượt quá ngân sách chiến dịch.
7. **Cấp giấy chứng nhận điện tử:** Duyệt cấp chứng nhận hàng loạt cho những cá nhân đạt đủ điều kiện sau khi chiến dịch kết thúc, sử dụng mã xác thực nhằm nâng cao tính pháp lý.
8. **Thống kê và báo cáo hiệu quả:** Truy xuất báo cáo tổng thể về nhân sự, chiến dịch và tài chính để báo cáo cấp trên hoặc đánh giá năng lực hoạt động định kỳ.
9. **Giám sát phân công và thay đổi quy định:** Phê duyệt sơ đồ phân công nhiệm vụ tổng thể của BDH và thực hiện các thay đổi về tham số hệ thống (log ghi vết toàn bộ).

Chào bạn, việc phân cụm chức năng (Functional Clustering) là bước cực kỳ quan trọng để "Antigravity" có thể lập trình logic liên thông dữ liệu thay vì chỉ code các trang web rời rạc.

Dựa trên danh sách yêu cầu bạn cung cấp, tôi đề xuất phân chia thành 4 Cụm nghiệp vụ chính. Dưới đây là mô tả chi tiết, luồng xử lý liên thông và các nguồn tham khảo cho từng cụm:

Cụm 1: Quản trị Tài khoản & Tiếp nhận Nhân sự (User Lifecycle)
Bao gồm các chức năng: Đăng ký TNV, Duyệt tài khoản (BQL), Quản lý Profile.

Mô tả chi tiết: Đây là "cửa ngõ" vào hệ thống. Luồng này đảm bảo mọi dữ liệu cá nhân của sinh viên được chuẩn hóa và xác thực trước khi họ tham gia bất kỳ hoạt động nào.

Luồng xử lý liên thông:

TNV nộp đơn đăng ký -> Dữ liệu lưu vào bảng TAI_KHOAN với trạng thái PENDING.

BQL nhận thông báo, vào màn hình duyệt. Hệ thống tự động kiểm tra trùng lặp Email/SĐT bằng Oracle Constraint.

BQL nhấn "Duyệt" -> Trạng thái đổi thành ACTIVE. Hệ thống tự động gửi thông báo chào mừng cho TNV.

Luồng hoạt động: Đăng ký (Form) -> Xác thực OTP (Mock) -> Chờ duyệt (Status Dashboard) -> Duyệt (Admin List).

Đầu ra: Bản ghi tài khoản hợp lệ trong Database, mã số tình nguyện viên.

Tham khảo UI/UX: Cổng thông tin sinh viên UIT (Phần lý lịch), giao diện Onboarding của Microsoft for Nonprofits.

Cụm 2: Quản lý Chiến dịch & Đăng ký tham gia (Campaign & Enrollment)
Bao gồm: Tạo chiến dịch (BQL), Đăng ký (TNV), Duyệt tham gia (BDH), Phân công (BDH).

Mô tả chi tiết: Luồng này xử lý việc "cung - cầu" sức lao động tình nguyện. BQL tạo việc, TNV chọn việc và BDH sắp xếp nhân sự.

Luồng xử lý liên thông:

BQL tạo chiến dịch và chỉ định BDH phụ trách -> Lưu bảng CHIEN_DICH.

TNV thấy chiến dịch "Mở", nhấn đăng ký -> Hệ thống gọi Stored Procedure kiểm tra tư cách (tài khoản đã được duyệt chưa, có bị trùng lịch không).

BDH xem danh sách đăng ký, chọn TNV phù hợp và thực hiện Phân công nhiệm vụ (Role/Task).

Luồng hoạt động: Tạo (Form) -> Hiển thị (Cards) -> Đăng ký (Action) -> Duyệt/Phân công (Table management).

Đầu ra: Danh sách nhân sự chính thức của chiến dịch, sơ đồ nhiệm vụ.

Tham khảo UI/UX: Trang sự kiện trên Facebook, VolunteerManagementSystem (Dribbble) với giao diện Kanban để phân công task.

Cụm 3: Hậu cần, Tài chính & Minh chứng (Logistics, Finance & Proof)
Bao gồm: Quản lý đối tác, Ghi nhận đóng góp, Đề xuất thu/chi/kho (BDH), Duyệt thu/chi/kho (BQL), Cập nhật minh chứng (TNV).

Mô tả chi tiết: Đây là cụm phức tạp nhất, đảm bảo tính minh bạch. Mọi giao dịch tiền và hàng đều phải qua 2 lớp: BDH đề xuất và BQL phê duyệt.

Luồng xử lý liên thông:

BQL cập nhật nguồn thu từ đối tác (Tiền/Vật dụng) -> Tăng số dư quỹ/kho.

BDH lập phiếu chi/xuất kho phục vụ chiến dịch. Hệ thống gọi Trigger Oracle để kiểm tra: "Tổng chi < Tổng thu hiện tại".

BQL xem minh chứng và "Duyệt" phiếu -> Dữ liệu thực tế được cập nhật.

TNV tải ảnh/tài liệu minh chứng kết quả công việc lên hệ thống.

Luồng hoạt động: Nhập kho/quỹ (Form) -> Đề xuất (Request form) -> Duyệt (Modal confirmation) -> Đối soát (Balance sheet).

Đầu ra: Phiếu thu/chi, Báo cáo tồn kho, Minh chứng hình ảnh.

Tham khảo UI/UX: App Quản lý kho (Inventory management) hoặc module tài chính trên AdminLTE.

Cụm 4: Đánh giá, Chứng nhận & Hệ thống (Evaluation & Achievement)
Bao gồm: Điểm danh (BDH), Đánh giá (BDH), Cấp chứng nhận (BQL), Tra cứu lịch sử (TNV), Thống kê (BQL), Thay đổi quy định.

Mô tả chi tiết: Kết thúc vòng đời chiến dịch, ghi nhận đóng góp của TNV và báo cáo hiệu quả.

Luồng xử lý liên thông:

BDH điểm danh hằng buổi và nhập điểm đánh giá cuối kỳ dựa trên thái độ/minh chứng của TNV.

BQL dựa trên dữ liệu đạt chuẩn, nhấn "Cấp chứng nhận hàng loạt" -> Hệ thống sinh PDF Certificate có mã QR xác thực.

TNV vào lịch sử để xem tổng giờ công và tải chứng nhận.

BQL xem thống kê tổng quát để báo cáo nhà trường.

Luồng hoạt động: Điểm danh (Checkbox list) -> Đánh giá (Stars/Rating) -> Xuất PDF (Print) -> Thống kê (Charts).

Đầu ra: File PDF Giấy chứng nhận, Biểu đồ Dashboard hiệu quả, Nhật ký giờ công.

Tham khảo UI/UX: Hệ thống LinkedIn Certificates, Dashboard thống kê của Apex Charts.