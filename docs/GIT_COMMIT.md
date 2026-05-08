# Quy Tắc Đặt Tên Commit

Toàn bộ thành viên thống nhất áp dụng quy chuẩn **Conventional Commits**.

## 1. Cấu Trúc

```
<TYPE>: <Mô tả ngắn gọn bằng tiếng Việt>
```

**Ví dụ:** `FEAT: Thêm chức năng đăng ký tình nguyện viên`

---

## 2. Các Loại Commit

| Type | Ý nghĩa | Khi nào dùng? |
|:---|:---|:---|
| **FEAT** | Tính năng mới | Thêm một chức năng mới hoàn chỉnh |
| **FIX** | Sửa lỗi | Sửa bug logic, giao diện, hoặc runtime error |
| **DB** | Database | Thay đổi script SQL trong `database/` (tables, triggers, procedures, seed data) |
| **UI** | Giao diện | Thay đổi UI: màu sắc, font, layout, icon (không đổi logic) |
| **DOCS** | Tài liệu | Thay đổi README, docs, comment (không ảnh hưởng code) |
| **REFACTOR** | Tái cấu trúc | Đổi cấu trúc code mà không thay đổi logic chính |
| **PERF** | Hiệu suất | Tối ưu performance, thêm index, cải thiện query |
| **TEST** | Kiểm thử | Viết hoặc sửa test case |
| **CHORE** | Việc vặt | Cập nhật dependencies, config, `.gitignore` |
| **OTHER** | Khác | Tất cả những gì không thuộc các loại trên |

---

## 3. Ví Dụ Thực Tế Cho Dự Án

```
DB: Thêm seed data cho 20 chiến dịch tình nguyện 2024-2025
FIX: Sửa lỗi hard-code MaTaiKhoan trong SP_NHAPKHO_VATPHAM
FEAT: Thêm stored procedure SP_CAP_CHUNGNHAN_CD
REFACTOR: Đổi kiểu ID từ NUMBER sang VARCHAR2(10)
DOCS: Cập nhật changelog trong Database_Progress.md
```

---

## 4. Lưu Ý

1. **Dấu cách:** Luôn có dấu cách sau dấu hai chấm `:`
   - ✅ `FEAT: Thêm tính năng mới`
   - ❌ `FEAT:Thêm tính năng mới`

2. **Commit thường xuyên:** Mỗi commit là một đơn vị công việc nhỏ, không gộp quá nhiều thay đổi.

3. **Nhiều thay đổi trong 1 lần:**
   - **Cách 1 (khuyến nghị):** Chia nhỏ commit
     ```bash
     git add database/08_SeedData.sql
     git commit -m "DB: Thêm ThamSo seed data"
     git add database/06_stored_procedures.sql
     git commit -m "FIX: Sửa SP_NHAPKHO_VATPHAM hard-code MaTaiKhoan"
     ```
   - **Cách 2:** Gộp chung với multi-line message
     ```bash
     git commit -m "DB: Sửa lỗi critical trước khi deploy
     FIX: Hard-code MaTaiKhoan trong SP_NHAPKHO_VATPHAM
     FIX: Xóa cột GioQuyDinh không tồn tại trong CongViec"
     ```
