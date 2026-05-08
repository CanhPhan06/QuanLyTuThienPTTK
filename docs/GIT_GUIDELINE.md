# 🚩 Quy Tắc Git & Workflow Làm Việc

## 1. Cấu Trúc Nhánh (Git Branch)

Sử dụng mô hình **Git Flow**:

| Nhánh | Mục đích | Merge từ |
|:---|:---|:---|
| **`main`** | Code ổn định, đã kiểm thử. Chỉ merge khi hoàn tất tính năng lớn. | `dev` |
| **`dev`** | Nhánh phát triển chính. Tổng hợp các feature đã hoàn thành. | `feature/*` |
| **`feature/<tên>`** | Nhánh riêng để phát triển từng tính năng. | Tách từ `dev` |
| **`fix/<tên-lỗi>`** | Sửa bug phát sinh trong quá trình merge trên `dev`. | Tách từ `dev` |

**Ví dụ đặt tên nhánh:**
- `feature/login-auth` — Xây dựng chức năng đăng nhập
- `feature/seed-data` — Viết dữ liệu mẫu
- `fix/trigger-conflict` — Sửa xung đột trigger

---

## 2. Quy Trình Làm Việc (Workflow)

### Bước 1: Cập nhật code mới nhất
```bash
git checkout dev
git pull origin dev
```

### Bước 2: Tạo nhánh tính năng
```bash
git checkout -b feature/ten-tinh-nang
```

### Bước 3: Lập trình & Commit
- Code và commit theo [Quy tắc Commit](GIT_COMMIT.md).
- Commit thường xuyên, mỗi commit là một đơn vị công việc nhỏ.

### Bước 4: Đẩy code lên
```bash
git push origin feature/ten-tinh-nang
```

### Bước 5: Tạo Pull Request (PR)
- Lên GitHub tạo PR để merge từ `feature/...` vào `dev`.
- Gán thành viên khác review code.
- Sau khi được **Approve** thì mới merge.

### Bước 6: Dọn dẹp
- Xóa nhánh feature sau khi merge thành công để tránh rác repository.

---

## 3. Quy Tắc Cho Database Scripts

Khi thay đổi các file trong thư mục `database/`:
1. **Luôn chạy test** trên Oracle local trước khi commit.
2. **Cập nhật changelog** trong [Database_Progress.md](Database_Progress.md).
3. **Tái tạo `00_DB_Script.sql`** nếu thay đổi bất kỳ file `01` → `08`.
4. **Commit type:** Sử dụng prefix `DB:` cho tất cả thay đổi liên quan database.

---

## 4. Quy Tắc Viết Commit

Chi tiết: [GIT_COMMIT.md](GIT_COMMIT.md)
