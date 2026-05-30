# Huong dan tai code va chay Desktop App

Repo GitHub: https://github.com/CanhPhan06/QuanLyTuThienPTTK

## Tai code

```bash
git clone https://github.com/CanhPhan06/QuanLyTuThienPTTK.git
cd QuanLyTuThienPTTK
```

Hoac vao GitHub, bam `Code` > `Download ZIP`, giai nen file ZIP.

## Cai dat

Can cai truoc:

- Git
- Node.js LTS
- Oracle Database/XE neu muon dung backend day du

Cai thu vien:

```bash
npm install
cd backend
npm install
cd ..
```

## Chay app desktop

```bash
npm run dev:desktop
```

Lenh nay se chay backend, frontend va cua so Electron.

## Database

Backend dang ket noi Oracle theo `backend/src/db.js`:

```text
user: hqtcsdldb
password: hqtcsdl123
connectString: localhost:1522/XE
```

Neu may ban dung Oracle khac port/service, sua lai `connectString`.

## Tai khoan demo

| Vai tro | Ten dang nhap | Mat khau |
|---|---|---|
| Admin / Ke toan | `admin` | `admin123` |
| Nhan vien | `nhanvien` | `nhanvien123` |
| Ban dieu hanh | `dieuhanh` | `dieuhanh123` |
| Tinh nguyen vien | `tnv` | `tnv123` |
| Nha tai tro | `donor` | `donor123` |

## Build

```bash
npm run build
```

Du an hien la app desktop Electron chay tu source. Chua cau hinh dong goi thanh file cai dat `.exe`; neu can installer Windows thi them `electron-builder` hoac `electron-forge`.
