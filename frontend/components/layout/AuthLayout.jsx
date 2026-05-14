import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ children, wide = false }) => {
  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      
      <div className="auth-content-wrapper">
        <div className="auth-branding">
          <h1 className="auth-title">Hệ Thống Quản Lý Hoạt Động Tình Nguyện</h1>
        </div>
        
        <div className={`glass-card ${wide ? 'wide' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
