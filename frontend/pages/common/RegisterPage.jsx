import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../../services/auth";
import SystemModal from "../../components/common/SystemModal";
import AuthLayout from "../../components/layout/AuthLayout";
import { EyeOpen, EyeClosed } from "../../components/common/EyeIcon";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tenDangNhap: "",
    matKhau: "",
    email: "",
    hoTen: "",
    mssv: "",
    ngaySinh: "",
    gioiTinh: "Nam",
    khoa: "",
    lop: "",
    sdt: "",
    diaChi: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(formData);
      setModal({
        isOpen: true,
        title: "Thành công",
        message: "Đăng ký thành công! Vui lòng chờ Ban Quản Lý phê duyệt.",
        type: "success"
      });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi Đăng Ký", message: error, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === "success") {
      navigate("/login");
    }
  };

  return (
    <AuthLayout wide={true}>
      <SystemModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={closeModal}
      />
      <h1>Đăng Ký Tài Khoản</h1>
      <form onSubmit={handleRegister} className="auth-grid">
        
        <div className="auth-form-group auth-grid-full">
          <label className="auth-label">Tên đăng nhập</label>
          <input type="text" name="tenDangNhap" className="auth-input" value={formData.tenDangNhap} onChange={handleChange} required />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Mật khẩu</label>
          <div className="password-input-wrapper">
            <input type={showPassword ? "text" : "password"} name="matKhau" className="auth-input" value={formData.matKhau} onChange={handleChange} required minLength="6" />
            <button 
              type="button" 
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOpen /> : <EyeClosed />}
            </button>
          </div>
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Email</label>
          <input type="email" name="email" className="auth-input" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="auth-form-group auth-grid-full">
          <label className="auth-label">Họ và tên</label>
          <input type="text" name="hoTen" className="auth-input" value={formData.hoTen} onChange={handleChange} required />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">MSSV</label>
          <input type="text" name="mssv" className="auth-input" value={formData.mssv} onChange={handleChange} required />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Ngày sinh</label>
          <input type="date" name="ngaySinh" className="auth-input" value={formData.ngaySinh} onChange={handleChange} required />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Giới tính</label>
          <select name="gioiTinh" className="auth-input" value={formData.gioiTinh} onChange={handleChange}>
            <option value="Nam">Nam</option>
            <option value="Nu">Nữ</option>
            <option value="Khac">Khác</option>
          </select>
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Số điện thoại</label>
          <input type="text" name="sdt" className="auth-input" value={formData.sdt} onChange={handleChange} required />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Khoa</label>
          <input type="text" name="khoa" className="auth-input" value={formData.khoa} onChange={handleChange} required />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Lớp</label>
          <input type="text" name="lop" className="auth-input" value={formData.lop} onChange={handleChange} required />
        </div>
        <div className="auth-form-group auth-grid-full">
          <label className="auth-label">Địa chỉ</label>
          <input type="text" name="diaChi" className="auth-input" value={formData.diaChi} onChange={handleChange} required />
        </div>

        <button type="submit" disabled={loading} className="gradient-btn auth-grid-full">
          {loading ? "Đang xử lý..." : "Đăng Ký"}
        </button>
        
        <div className="auth-grid-full auth-link-center">
          <Link to="/login" className="auth-link">Đã có tài khoản? Đăng nhập ngay</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
