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

  const handlePrint = () => {
    window.print();
  };

  const formatHours = (hours) => {
    if (!hours && hours !== 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}p`;
  };

  const getBadgeName = (xepLoai) => {
    if (!xepLoai) return "Chưa có";
    switch(xepLoai.toLowerCase()) {
      case 'xuatsac': return 'Xuất Sắc';
      case 'tot': return 'Tốt';
      case 'kha': return 'Khá';
      case 'trungbinh': return 'Trung Bình';
      default: return xepLoai;
    }
  };

  return (
    <MainLayout>
      {previewCert && (
        <div className="custom-modal-overlay" onClick={() => setPreviewCert(null)}>
          <div className="certificate-modal printable-area" onClick={e => e.stopPropagation()}>
            <div className="cert-border-decor">
              <div className="cert-header">
                <div className="cert-logos">
                  <span className="logo-dt">MAISON CHANCE</span>
                </div>
                <h2>GIẤY CHỨNG NHẬN</h2>
                <p className="cert-subtitle">ELECTRONIC CERTIFICATE</p>
              </div>
              <div className="cert-body">
                <p>Maison Chance chứng nhận tình nguyện viên:</p>
                <h3 className="student-name">{previewCert.HOTEN || previewCert.HoTen}</h3>
                <p className="student-info">MSSV: {previewCert.MSSV || previewCert.MASOSINHVIEN}</p>
                
                <div className="cert-main-text">
                  Đã tham gia tích cực và đóng góp <strong>{formatHours(previewCert.TONGGIO || previewCert.TongGio)}</strong> hoạt động trong chương trình:
                  <div className="campaign-name">"{previewCert.TENCHIENDICH || previewCert.TenChienDich}"</div>
                  đạt xếp loại:
                </div>
                <h2 className="cert-rating">{getBadgeName(previewCert.XEPLOAI || previewCert.XepLoai)}</h2>
              </div>
              <div className="cert-footer">
                <div className="cert-id">Mã xác thực: {previewCert.MACHUNGNHAN || previewCert.MaChungNhan}</div>
                <div className="cert-sig">
                  <p>Ngày cấp: {new Date(previewCert.NGAYCAP || previewCert.NgayCap).toLocaleDateString('vi-VN')}</p>
                  <p><strong>BAN QUẢN LÝ</strong></p>
                  <div className="signature-placeholder">(Đã ký)</div>
                </div>
              </div>
            </div>
            <div className="modal-actions no-print">
              <button className="print-btn" onClick={handlePrint}>In Chứng nhận</button>
              <button className="close-cert-btn" onClick={() => setPreviewCert(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <div className="my-certificates-container">
        <div className="page-header">
          <h1>Chứng nhận Maison Chance</h1>
          <p>Danh sách giấy chứng nhận điện tử sau khi hoàn thành hoạt động hỗ trợ.</p>
        </div>

        {loading ? (
          <div className="empty-state">Đang tải...</div>
        ) : (
          <div className="cert-gallery">
            {certificates.map(c => (
              <GlassCard key={c.MACHUNGNHAN || c.MaChunNhan} className="my-cert-card">
                <div className="cert-preview-img" onClick={() => setPreviewCert(c)}>
                  <div className="cert-preview-content">
                    <span className="dt-label">VMS</span>
                    <div className="preview-title">CHỨNG NHẬN</div>
                    <div className="preview-name">{c.HOTEN || c.HoTen}</div>
                    <div className="preview-camp">{c.TENCHIENDICH || c.TenChienDich}</div>
                    <div className="preview-hours">{formatHours(c.TONGGIO || c.TongGio)}</div>
                    <div className="preview-rating">{getBadgeName(c.XEPLOAI || c.XepLoai)}</div>
                  </div>
                </div>
                <div className="cert-info">
                  <h3>{c.TENCHIENDICH || c.TenChienDich}</h3>
                  <div className="cert-actions">
                    <button className="action-btn eval-btn" onClick={() => setPreviewCert(c)}>
                      Xem Chi Tiết
                    </button>
                    <button className="print-action-btn" onClick={() => { setPreviewCert(c); setTimeout(handlePrint, 500); }}>
                      <i className="fas fa-print"></i> In Chứng nhận
                    </button>
                  </div>
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
