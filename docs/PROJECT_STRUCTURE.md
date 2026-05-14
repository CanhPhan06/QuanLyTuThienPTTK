# Cấu Trúc Dự Án

## Tổng Quan

Hệ thống Quản Lý Hoạt Động Tình Nguyện Sinh Viên — một ứng dụng **Desktop App** được xây dựng trên nền tảng **Electron**, kết hợp:

- **Frontend (UI Layer):** React 18 + Vite
- **Backend (Server Layer):** Node.js + Express
- **Database:** Oracle 19c

---

## Tech Stack

| Thành phần | Công nghệ | Phiên bản | Mục đích |
|:---|:---|:---|:---|
| **Framework Desktop** | Electron | 30.x+ | Đóng gói React + Node.js thành native app |
| **Frontend** | React | 18.x | Giao diện người dùng (SPA) |
| **Build Tool** | Vite | 5.x | Dev server & bundler cho React |
| **Backend** | Node.js (Express) | 20.x+ | Xử lý nghiệp vụ, API RESTful |
| **Database** | Oracle | 19c (Non-CDB) | Lưu trữ dữ liệu, SP/SF/Trigger |
| **Oracle Client** | Thin Mode | N/A | Driver Node.js (`oracledb`) kết nối Oracle không cần Instant Client |
| **Package Manager** | npm | 10.x | Quản lý dependencies |

### Thư viện Backend chính (`backend/package.json`)

| Package | Mục đích |
|:---|:---|
| `express` | Framework xây dựng REST API |
| `oracledb` | Kết nối Oracle DB (chế độ Thin Mode) |
| `bcryptjs` | Hash và kiểm tra mật khẩu |
| `cors` | Quản lý CORS policies |
| `dotenv` | Quản lý biến môi trường |

### Thư viện Frontend chính (`package.json`)

| Package | Mục đích |
|:---|:---|
| `react-router-dom` | Routing giữa các trang |
| `react` / `react-dom` | Core UI framework |
| `axios` / `fetch` | Giao tiếp với Backend API |

---

## Kiến Trúc 3 Lớp

```
┌─────────────────────────────────────────────────────────┐
│                 ELECTRON DESKTOP APP                    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │           UI LAYER (React + Vite)                 │  │
│  │  frontend/pages/      → Các trang chính           │  │
│  │  frontend/components/ → UI components tái sử dụng │  │
│  │  frontend/services/   → Gọi REST API (Axios/Fetch)│  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ HTTP GET/POST/PUT/DELETE      │
│                         │ (localhost:3000/api/...)      │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │        BUSINESS LOGIC LAYER (Node.js/Express)     │  │
│  │  backend/src/controllers/ → Điều hướng request    │  │
│  │  backend/src/services/    → Logic nghiệp vụ       │  │
│  │  backend/src/models/      → Schema/DTO mapping    │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ oracledb Thin Mode            │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │       DATA ACCESS LAYER (Node.js → Oracle)        │  │
│  │  backend/src/db.js        → Connection pool       │  │
│  │  - Gọi Stored Procedures (CALL SP_XXX)            │  │
│  │  - Gọi Stored Functions (SELECT SF_XXX FROM DUAL) │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ TCP/IP                        │
└─────────────────────────┼───────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   ORACLE DATABASE     │
              │   19c (Non-CDB)       │
              │                       │
              │   28 Tables           │
              │   32 Stored Procs     │
              │   6  Stored Funcs     │
              │   33 Triggers         │
              │   87 Indexes          │
              └───────────────────────┘
```

---

## Cấu Trúc Thư Mục

```
VolunteerManagementSystem/
├── database/                        # ===== LỚP DỮ LIỆU GỐC (Oracle) =====
│   ├── 00_DB_Script.sql             # File tổng hợp (concat 01→08), deploy nhanh
│   ├── 01_sequences.sql             # 24 Sequences cho auto-increment PK
│   ├── 02_tables.sql                # 28 Bảng với FK, CHECK, UNIQUE constraints
│   ├── 03_indexes.sql               # 87 Indexes tối ưu hiệu năng truy vấn
│   ├── 04_triggers_auto_pk.sql      # 24 Triggers tự động sinh PK
│   ├── 05_triggers_business.sql     # 9 Triggers kiểm tra nghiệp vụ
│   ├── 06_stored_procedures.sql     # 32 Stored Procedures
│   ├── 07_stored_functions.sql      # 6 Stored Functions
│   └── 08_SeedData.sql              # Dữ liệu mẫu: 966+ records / 21 bảng
│
├── docs/                            # ===== TÀI LIỆU DỰ ÁN =====
│   ├── changelog/                   # Changelog phát triển các module
│   ├── design.md                    # Quy tắc thiết kế
│   ├── List_Feat.md                 # Danh sách các tính năng của ứng dụng
│   ├── Database_Progress.md         # Tracker tiến độ & Changelog database
│   ├── PROJECT_STRUCTURE.md         # Giải thích cấu trúc dự án
│   ├── GIT_GUIDELINE.md             # Quy trình Git Flow & branching
│   ├── GIT_COMMIT.md                # Quy tắc đặt tên commit
│   └── COMPLETE_Template.docx       # Template tài liệu đồ án
│
├── frontend/                        # ===== TẦNG GIAO DIỆN (React + Vite) =====
│   ├── assets/                      # Hình ảnh, logo, icon hệ thống
│   ├── components/                  # Các thành phần UI chuyên nghiệp
│   │   ├── common/                  # UI Kit dùng chung (Atom components)
│   │   ├── layout/                  # Thành phần cấu trúc khung
│   │   └── tables/                  # Các bảng dữ liệu đặc thù
│   ├── styles/                      # style thiết kế chung 
│   │   ├── theme.css                # Biến CSS (Primary: Cam, Accent: Xanh đen)
│   │   └── global.css               # Reset CSS và các style toàn cục
│   ├── pages/                       # Phân cấp 3 bộ UI khác biệt
│   │   ├── admin/                   # ----- UI BAN QUẢN LÝ (BQL) -----
│   │   ├── executive/               # ----- UI BAN ĐIỀU HÀNH (BDH) -----
│   │   └── volunteer/               # ----- UI TÌNH NGUYỆN VIÊN (TNV) -----
│   ├── services/                    # Logic giao tiếp với Backend
│   │   └── api.js                   # Cấu hình Axios/Fetch gọi tới Node.js
│   ├── App.jsx                      # Cấu hình Routes (BQL, BDH, TNV)
│   ├── main.jsx                     # Entry point React
│   └── index.css                    # Global styles
│
├── backend/                         # ===== TẦNG XỬ LÝ (Node.js/Express) =====
│   ├── src/
│   │   ├── controllers/             # Điều hướng request và gọi service (vd: authController.js)
│   │   ├── services/                # Logic nghiệp vụ & Gọi Oracle (vd: authService.js)
│   │   ├── models/                  # Định nghĩa Schema/DTO cho Oracle
│   │   ├── db.js                    # Cấu hình Oracle connection pool
│   │   └── index.js                 # Entry point cho Express server
│   └── package.json                 # Dependencies: express, oracledb, dotenv...
│
├── main.js                          # Entry point cho Electron (Quản lý Window)
├── index.html                       # HTML entry point cho Vite
├── package.json                     # Scripts để chạy cả Electron và Vite
├── vite.config.js                   # Cấu hình Vite
└── .env                             # Lưu DB_USER, DB_PASSWORD, DB_CONNECTION_STRING
```

---

## Môi Trường Phát Triển

| Thành phần | Phiên bản | Ghi chú |
|:---|:---|:---|
| **Database** | Oracle 19c (Non-CDB) | SID: `orcl` |
| **Node.js** | 20.x LTS | Cho Backend và React dev server |
| **OS** | Windows 10/11 | |

### Cài Đặt Môi Trường Phát Triển

```bash
# 1. Cài Frontend dependencies
npm install

# 2. Cài Backend dependencies
cd backend
npm install
cd ..

# 3. Chạy ứng dụng đồng thời cả Frontend, Backend và Electron
npm run dev:desktop
```

## Luồng Dữ Liệu End-to-End

```
User click "Đăng nhập"
       │
       ▼
[React] LoginPage.jsx
       │ gọi axios.post('/api/auth/login', payload)
       ▼
[Express Controller] authController.js
       │ gọi authService.loginUser(username, password)
       ▼
[Express Service] authService.js
       │ conn.execute("SELECT ... FROM TaiKhoan WHERE TenDangNhap = :1")
       ▼
[Oracle] Database
       │ Trả kết quả query
       ▼
Result trả ngược về Controller → React → Điều hướng user
```
