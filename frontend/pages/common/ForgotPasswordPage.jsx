import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import SystemModal from "../../components/common/SystemModal";
import { verifyUser, resetPassword } from "../../services/auth";
import { EyeOpen, EyeClosed } from "../../components/common/EyeIcon";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'reset'
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!username || !email) {
      setModal({ isOpen: true, title: "Lỗi", message: "Vui lòng nhập đầy đủ Username và Email.", type: "error" });
      return;
    }
    
    setLoading(true);
    try {
      await verifyUser(username, email);
      setModal({
        isOpen: true,
        title: "Xác thực thành công",
        message: "Mã OTP của bạn là: 01020304",
        type: "success"
      });
      setStep('otp');
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi Xác Thực", message: error, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === "01020304") {
      setStep('reset');
    } else {
      setModal({ isOpen: true, title: "Lỗi OTP", message: "Mã OTP không chính xác. Vui lòng thử lại.", type: "error" });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setModal({ isOpen: true, title: "Lỗi", message: "Mật khẩu xác nhận không khớp.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setModal({ isOpen: true, title: "Lỗi", message: "Mật khẩu phải có ít nhất 6 ký tự.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(username, newPassword);
      setModal({
        isOpen: true,
        title: "Thành công",
        message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
        type: "success"
      });
      setStep('done'); // to prevent further actions until modal closes
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    if (step === 'done' && modal.type === "success") {
      navigate('/login');
    }
  };

  return (
    <AuthLayout>
      <SystemModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={closeModal}
      />
      <h1>Quên Mật Khẩu</h1>

      {step === 'input' && (
        <form onSubmit={handleVerify}>
          <div className="auth-form-group">
            <label className="auth-label">Tên đăng nhập</label>
            <input
              type="text"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập tên đăng nhập..."
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email đã đăng ký..."
            />
          </div>
          <button type="submit" disabled={loading} className="gradient-btn">
            {loading ? "Đang xử lý..." : "Tiếp tục"}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#0D1B2A' }}>
            Vui lòng nhập mã OTP đã được gửi đến email của bạn.
          </p>
          <div className="auth-form-group">
            <label className="auth-label">Mã OTP</label>
            <input
              type="text"
              className="auth-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Nhập mã OTP (VD: 01020304)"
            />
          </div>
          <button type="submit" className="gradient-btn">
            Xác nhận OTP
          </button>
        </form>
      )}

      {(step === 'reset' || step === 'done') && (
        <form onSubmit={handleResetPassword}>
          <div className="auth-form-group">
            <label className="auth-label">Mật khẩu mới</label>
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                className="auth-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu mới..."
                minLength="6"
              />
              <button 
                type="button" 
                className="eye-icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Xác nhận mật khẩu mới</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Nhập lại mật khẩu mới..."
                minLength="6"
              />
              <button 
                type="button" 
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading || step === 'done'} className="gradient-btn">
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      )}

      <div className="auth-links" style={{ justifyContent: 'center', marginTop: '2rem' }}>
        <Link to="/login" className="auth-link">Quay lại Đăng nhập</Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
