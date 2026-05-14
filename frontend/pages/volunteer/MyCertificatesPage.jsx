import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import { getMyCertificates } from "../../services/certification";
import { useAuth } from "../../context/AuthContext";
import "./MyCertificatesPage.css";

const MyCertificatesPage = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    fetchMyCertificates();
  }, []);

  const fetchMyCertificates = async () => {
    try {
      const data = await getMyCertificates(user.MaTaiKhoan);
      setCertificates(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {previewCert && (
        <div className="custom-modal-overlay" onClick={() => setPreviewCert(null)}>
          <div className="certificate-modal" onClick={e => e.stopPropagation()}>
            <div className="cert-header">
              <h2>GIẤY CHỨNG NHẬN</h2>
              <p>HOẠT ĐỘNG TÌNH NGUYỆN</p>
            </div>
            <div className="cert-body">
              <p>Chứng nhận sinh viên:</p>
              <h3>{previewCert.HOTEN || previewCert.HoTen}</h3>
              <p>MSSV: {previewCert.MASOSINHVIEN || previewCert.MaSoSinhVien}</p>
              <br/>
              <p>Đã tham gia tích cực chiến dịch <strong>{previewCert.TENCHIENDICH || previewCert.TenChienDich}</strong> và đạt xếp loại:</p>
              <h2 className="cert-rating">{previewCert.XEPLOAI || previewCert.XepLoai}</h2>
            </div>
            <div className="cert-footer">
              <div className="qr-placeholder">
                Mã xác thực: {previewCert.MACHUNGNHAN || previewCert.MaChungNhan}
              </div>
              <div className="signature">
                <p>Ngày cấp: {new Date(previewCert.NGAYCAP || previewCert.NgayCap).toLocaleDateString('vi-VN')}</p>
                <p><strong>Ban Quản Lý</strong></p>
              </div>
            </div>
            <button className="close-cert-btn" onClick={() => setPreviewCert(null)}>Đóng</button>
          </div>
        </div>
      )}

      <div className="my-certificates-container">
        <div className="page-header">
          <h1>Chứng Nhận Tình Nguyện</h1>
          <p>Danh sách các giấy chứng nhận điện tử bạn đã đạt được.</p>
        </div>

        {loading ? (
          <div className="empty-state">Đang tải...</div>
        ) : (
          <div className="cert-gallery">
            {certificates.map(c => (
              <GlassCard key={c.MACHUNGNHAN || c.MaChungNhan} className="my-cert-card">
                <div className="cert-thumbnail">
                  <div className="cert-thumb-badge">{c.XEPLOAI || c.XepLoai}</div>
                </div>
                <div className="cert-info">
                  <h3>{c.TENCHIENDICH || c.TenChienDich}</h3>
                  <p>Ngày cấp: {new Date(c.NGAYCAP || c.NgayCap).toLocaleDateString('vi-VN')}</p>
                  <button className="action-btn eval-btn" onClick={() => setPreviewCert(c)}>
                    Xem Chi Tiết
                  </button>
                </div>
              </GlassCard>
            ))}
            {certificates.length === 0 && (
              <div className="empty-state w-full text-center">Bạn chưa có chứng nhận nào. Tham gia và hoàn thành xuất sắc các chiến dịch để nhận chứng nhận nhé!</div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyCertificatesPage;
