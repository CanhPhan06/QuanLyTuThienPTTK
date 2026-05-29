import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DEMO_USERS, login as loginApi } from "../../services/auth";
import SystemModal from "../../components/common/SystemModal";
import AuthLayout from "../../components/layout/AuthLayout";
import { EyeOpen, EyeClosed } from "../../components/common/EyeIcon";

const roleHome = {
  AdminKeToan: "/operations",
  NhanVien: "/operations",
  BanDieuHanh: "/operations",
  TinhNguyenVien: "/operations",
  NhaTaiTro: "/operations",
  BanQuanLy: "/operations"
};

const LoginPage = () => {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginApi(tenDangNhap, matKhau);
      login(user);
      navigate(roleHome[user.VaiTro] || "/operations");
    } catch (error) {
      setModal({ isOpen: true, message: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout wide>
      <SystemModal
        isOpen={modal.isOpen}
        title="Lỗi Đăng Nhập"
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <h1>Đăng Nhập</h1>
      <form onSubmit={handleLogin}>
        <div className="auth-form-group">
          <label className="auth-label">Tên đăng nhập</label>
          <input
            type="text"
            className="auth-input"
            value={tenDangNhap}
            onChange={(e) => setTenDangNhap(e.target.value)}
            required
            placeholder="Nhập tên đăng nhập..."
          />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Mật khẩu</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
              placeholder="Nhập mật khẩu..."
            />
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOpen /> : <EyeClosed />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="gradient-btn">
          {loading ? "Đang xử lý..." : "Đăng Nhập"}
        </button>
        <div className="demo-login-panel">
          <span>Tài khoản demo theo 5 vai trò</span>
          <div className="demo-login-grid">
            {DEMO_USERS.map((account) => (
              <button
                type="button"
                key={account.username}
                onClick={() => {
                  setTenDangNhap(account.username);
                  setMatKhau(account.password);
                }}
              >
                <strong>{account.ChucVu}</strong>
                <small>{account.username} / {account.password}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="auth-links">
          <Link to="/register" className="auth-link">Chưa có tài khoản?</Link>
          <Link to="/forgot-password" className="auth-link">Quên mật khẩu?</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
