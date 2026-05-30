import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SystemModal from "../common/SystemModal";
import ThongBaoDropdown from "./ThongBaoDropdown";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabels = {
    AdminKeToan: "Admin / Kế toán",
    NhanVien: "Nhân viên",
    BanDieuHanh: "Ban điều hành",
    TinhNguyenVien: "Tình nguyện viên",
    NhaTaiTro: "Nhà tài trợ",
    BanQuanLy: "Admin / Kế toán"
  };

  const menus = {
    AdminKeToan: [
      { label: "Bảng vận hành", path: "/operations" },
      { label: "Tài khoản & phân quyền", path: "/admin/approve-volunteer" },
      { label: "Quy định & cảnh báo", path: "/admin/config" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
    NhanVien: [
      { label: "Bảng vận hành", path: "/operations" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
    BanDieuHanh: [
      { label: "Bảng vận hành", path: "/operations" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
    TinhNguyenVien: [
      { label: "Bảng vận hành", path: "/operations" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
    NhaTaiTro: [
      { label: "Bảng vận hành", path: "/operations" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
    BanQuanLy: [
      { label: "Bảng vận hành", path: "/operations" },
      { label: "Tài khoản & phân quyền", path: "/admin/approve-volunteer" },
      { label: "Quy định & cảnh báo", path: "/admin/config" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
  };

  const currentMenu = user && user.VaiTro ? menus[user.VaiTro] : [];

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Maison Chance</h2>
          <p>{user?.HoTen || user?.TenDangNhap || "Người dùng"}</p>
          <span className="sidebar-role">{roleLabels[user?.VaiTro] || user?.VaiTro}</span>
        </div>
        <nav className="sidebar-nav">
          {currentMenu.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogoutClick}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <strong>{roleLabels[user?.VaiTro] || "Người dùng"}</strong>
            <span>Luồng nghiệp vụ Maison Chance</span>
          </div>
          <div className="top-header-right">
            <ThongBaoDropdown />
          </div>
        </header>
        <div className="page-wrapper page-transition">
          {children}
        </div>
      </main>
      <SystemModal
        isOpen={showLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất không?"
        type="confirm"
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default MainLayout;
