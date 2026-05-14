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

  // Define sidebar menus based on role
  const menus = {
    BanQuanLy: [
      { label: "Duyệt tài khoản TNV", path: "/admin/approve-volunteer" },
      { label: "Tạo chiến dịch", path: "/admin/create-campaign" },
      { label: "Tài chính & Ngân quỹ", path: "/admin/finance" },
      { label: "Quản lý hậu cần", path: "/executive/logistics" },
      { label: "Cấp chứng nhận", path: "/admin/certification" },
      { label: "Báo cáo thống kê", path: "/admin/analytics" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
    BanDieuHanh: [
      { label: "Duyệt tham gia CD", path: "/executive/approve-participation" },
      { label: "Đối soát & Điểm danh", path: "/executive/proof-review" },
      { label: "Đánh giá TNV", path: "/executive/evaluation" },
      { label: "Quản lý hậu cần", path: "/executive/logistics" },
      { label: "Tài chính & Ngân quỹ", path: "/admin/finance" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
    TinhNguyenVien: [
      { label: "Đăng ký chiến dịch", path: "/volunteer/campaigns" },
      { label: "Lịch sử hoạt động", path: "/volunteer/history" },
      { label: "Nộp minh chứng", path: "/volunteer/proof-upload" },
      { label: "Chứng nhận của tôi", path: "/volunteer/certificates" },
      { label: "Hồ sơ cá nhân", path: "/profile" },
    ],
  };

  const currentMenu = user && user.VaiTro ? menus[user.VaiTro] : [];

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HQTCSDL</h2>
          <p>{user?.HoTen || user?.TenDangNhap || "Người dùng"}</p>
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
          <div className="top-header-right">
            <ThongBaoDropdown />
          </div>
        </header>
        <div className="page-wrapper">
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
