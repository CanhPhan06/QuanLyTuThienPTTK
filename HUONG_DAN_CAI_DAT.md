# Huong dan tai code va chay Desktop App

Repo GitHub: https://github.com/CanhPhan06/QuanLyTuThienPTTK

## 1. Cai phan mem can co

May Windows can cai truoc:

- Git: https://git-scm.com/download/win
- Node.js ban LTS: https://nodejs.org
- Oracle Database/XE neu muon dung day du backend Oracle.

Kiem tra sau khi cai:

```bash
git --version
node -v
npm -v
```

## 2. Tai code ve may

Mo PowerShell/CMD tai thu muc muon luu du an, chay:

```bash
git clone https://github.com/CanhPhan06/QuanLyTuThienPTTK.git
cd QuanLyTuThienPTTK
```

Neu khong muon dung Git, co the vao trang GitHub, bam `Code` > `Download ZIP`, giai nen file ZIP, roi mo terminal trong thu muc vua giai nen.

## 3. Cai thu vien

Cai thu vien cho app Electron/React:

```bash
npm install
```

Cai thu vien cho backend Node.js:

```bash
cd backend
npm install
cd ..
```

## 4. Cau hinh database

Backend hien ket noi Oracle theo thong tin trong `backend/src/db.js`:

```text
user: hqtcsdldb
password: hqtcsdl123
connectString: localhost:1522/XE
```

Neu may ban dung Oracle khac service/port, sua lai `connectString` trong file tren.

Nap database bang cac script trong thu muc `database/` theo huong dan trong README, hoac dung file setup SQL co san neu da duoc cung cap trong thu muc database.

Luu y: cac tai khoan demo Maison Chance ben duoi co the dang nhap ma khong can du lieu Oracle day du.

## 5. Chay Desktop App

Chay ca backend, frontend va Electron:

```bash
npm run dev:desktop
```

Neu muon chay tung phan rieng:

Terminal 1:

```bash
cd backend
npm start
```

Terminal 2:

```bash
npm run dev
```

Terminal 3:

```bash
npx electron . --dev
```

## 6. Build ban production

Build frontend:

```bash
npm run build
```

Sau khi build, Electron se doc giao dien tu thu muc `dist/` khi app chay o che do packaged/production.

Du an hien chua cau hinh tao file cai dat `.exe`. De tao installer Windows, can them `electron-builder` hoac `electron-forge`.

## 7. Tai khoan demo

| Vai tro | Ten dang nhap | Mat khau |
|---|---|---|
| Admin / Ke toan | `admin` | `admin123` |
| Nhan vien | `nhanvien` | `nhanvien123` |
| Ban dieu hanh | `dieuhanh` | `dieuhanh123` |
| Tinh nguyen vien | `tnv` | `tnv123` |
| Nha tai tro | `donor` | `donor123` |

## 8. Luong nghiep vu chinh

- Nhan vien lap ho so, phieu chi, phan cong tinh nguyen vien.
- Nha tai tro gui yeu cau quyen gop.
- Admin/Ke toan xem yeu cau, mo cua so chi tiet, kiem tra minh chung, phe duyet hoac tu choi.
- Ban dieu hanh xem cac yeu cau can duyet cuoi va ra quyet dinh.
- Khi bam vao dong danh sach, app mo cua so chi tiet de xem ly do, minh chung, anh dinh kem va lich su xu ly.
