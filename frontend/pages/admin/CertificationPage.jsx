import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { issueCertificates, issueSingleCertificate, getEligibleVolunteers, getCertificatesByCampaign } from "../../services/certification";
import { useAuth } from "../../context/AuthContext";
import "./CertificationPage.css";

const CertificationPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });
  
  const [previewCert, setPreviewCert] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, volunteer: null });
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [issuingId, setIssuingId] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchData(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
      if (data.length > 0) setSelectedCampaign(data[0].MaChienDich || data[0].MACHIENDICH);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async (maCD) => {
    try {
      setLoading(true);
      const [vols, certs] = await Promise.all([
        getEligibleVolunteers(maCD),
        getCertificatesByCampaign(maCD)
      ]);
      setVolunteers(vols);
      setCertificates(certs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSingle = async () => {
    const v = confirmModal.volunteer;
    if (!v) return;
    
    const maThamGia = v.MATHAMGIA || v.MaThamGia;
    setIssuingId(maThamGia);
    try {
      await issueSingleCertificate(maThamGia);
      setModal({ isOpen: true, title: "Thành công", message: `Đã cấp chứng nhận cho ${v.HOTEN || v.HoTen}.`, type: "success" });
      setConfirmModal({ isOpen: false, volunteer: null });
      fetchData(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    } finally {
      setIssuingId(null);
    }
  };

  const handleIssueBulk = async () => {
    try {
      setConfirmBulk(false);
      await issueCertificates(selectedCampaign);
      setModal({ isOpen: true, title: "Thành công", message: `Đã cấp chứng nhận hàng loạt cho ${volunteers.length} TNV đủ điều kiện.`, type: "success" });
      fetchData(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  const handlePreview = (cert) => {
    setPreviewCert(cert);
  };

  const getCampaignName = () => {
    const campaign = campaigns.find(c => (c.MaChienDich || c.MACHIENDICH) === selectedCampaign);
    return campaign ? (campaign.TenChienDich || campaign.TENCHIENDICH) : '';
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

  const getBadgeClass = (xepLoai) => {
    if (!xepLoai) return 'xl-trungbinh';
    switch(xepLoai.toLowerCase()) {
      case 'xuatsac': return 'xl-xuatsac';
      case 'tot': return 'xl-tot';
      case 'kha': return 'xl-kha';
      default: return 'xl-trungbinh';
    }
  };

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      {confirmModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal glassmorphism">
            <h2>Xác nhận Cấp chứng nhận</h2>
            <p>Bạn có chắc chắn muốn cấp chứng nhận cho:</p>
            <div className="confirm-info-block">
              <div className="confirm-name">{confirmModal.volunteer.HOTEN || confirmModal.volunteer.HoTen}</div>
              <div className="confirm-detail">
                MSSV: {confirmModal.volunteer.MSSV || confirmModal.volunteer.MASOSINHVIEN || '---'}
              </div>
              <div className="confirm-detail">
                Tổng giờ tích lũy: <strong>{formatHours(confirmModal.volunteer.TONGGIO || confirmModal.volunteer.TongGio)}</strong>
              </div>
              <div className="confirm-detail">
                Xếp loại: <span className={`xep-loai-badge ${getBadgeClass(confirmModal.volunteer.XEPLOAI || confirmModal.volunteer.XepLoai)}`}>
                  {getBadgeName(confirmModal.volunteer.XEPLOAI || confirmModal.volunteer.XepLoai)}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setConfirmModal({isOpen: false, volunteer: null})} className="cancel-btn">Hủy</button>
              <button onClick={handleIssueSingle} className="approve-btn-final" disabled={issuingId}>
                {issuingId ? 'Đang xử lý...' : 'Xác Nhận Cấp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmBulk && (
        <div className="custom-modal-overlay">
          <div className="custom-modal glassmorphism">
            <h2>Xác nhận Cấp hàng loạt</h2>
            <p>Bạn sẽ cấp chứng nhận cho <strong>{volunteers.length}</strong> TNV trong danh sách.</p>
            <div className="modal-actions">
              <button onClick={() => setConfirmBulk(false)} className="cancel-btn">Hủy</button>
              <button onClick={handleIssueBulk} className="approve-btn-final">Xác Nhận Cấp Tất Cả</button>
            </div>
          </div>
        </div>
      )}

      {previewCert && (
        <div className="custom-modal-overlay" onClick={() => setPreviewCert(null)}>
          <div className="certificate-modal" onClick={e => e.stopPropagation()}>
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
                  <div className="campaign-name">"{previewCert.TENCHIENDICH || previewCert.TenChienDich || getCampaignName()}"</div>
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
            <button className="close-cert-btn" onClick={() => setPreviewCert(null)}>✕</button>
          </div>
        </div>
      )}

      <div className="certification-page-container">
        <div className="page-header">
          <h1>Cấp Giấy Chứng Nhận</h1>
          <div className="campaign-selector">
            <label>Chọn chiến dịch: </label>
            <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
              {campaigns.map(c => (
                <option key={c.MaChienDich || c.MACHIENDICH} value={c.MaChienDich || c.MACHIENDICH}>
                  {c.TenChienDich || c.TENCHIENDICH}
                </option>
              ))}
            </select>
            <button className="action-btn eval-btn bulk-btn" onClick={() => volunteers.length > 0 && setConfirmBulk(true)}>Cấp Hàng Loạt</button>
          </div>
        </div>

        <div className="cert-grid">
          <GlassCard title="Danh sách hoàn thành">
             <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>Họ Tên</th>
                    <th className="text-center">Tổng Giờ</th>
                    <th className="text-center">Xếp Loại</th>
                    <th className="text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(v => (
                    <tr key={v.MATHAMGIA || v.MaThamGia} className="cert-row-animate">
                      <td><span className="mssv-tag">{v.MSSV || v.MASOSINHVIEN || '---'}</span></td>
                      <td><div className="tnv-name-cell">{v.HOTEN || v.HoTen}</div></td>
                      <td className="text-center">
                        <span className="hour-badge-dynamic">{formatHours(v.TONGGIO || v.TongGio)}</span>
                      </td>
                      <td className="text-center">
                        <span className={`xep-loai-badge ${getBadgeClass(v.XEPLOAI || v.XepLoai)}`}>
                          {getBadgeName(v.XEPLOAI || v.XepLoai)}
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="btn-cap-cn" onClick={() => setConfirmModal({ isOpen: true, volunteer: v })}>Cấp CN</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </GlassCard>

          <GlassCard title="Chứng nhận đã cấp">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>Họ Tên</th>
                    <th className="text-center">Tổng Giờ</th>
                    <th className="text-center">Xếp Loại</th>
                    <th className="text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map(c => (
                    <tr key={c.MACHUNGNHAN || c.MaChungNhan} className="cert-issued-row">
                      <td><span className="mssv-tag">{c.MSSV || c.MASOSINHVIEN || '---'}</span></td>
                      <td><div className="tnv-name-cell">{c.HOTEN || c.HoTen}</div></td>
                      <td className="text-center">
                        <span className="hour-badge-dynamic">{formatHours(c.TONGGIO || c.TongGio)}</span>
                      </td>
                      <td className="text-center">
                        <span className={`xep-loai-badge ${getBadgeClass(c.XEPLOAI || c.XepLoai)}`}>
                          {getBadgeName(c.XEPLOAI || c.XepLoai)}
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="action-btn view-btn" onClick={() => handlePreview(c)}>Xem CN</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </GlassCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default CertificationPage;
