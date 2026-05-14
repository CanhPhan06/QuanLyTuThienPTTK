import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { issueCertificates, getEligibleVolunteers, getCertificatesByCampaign } from "../../services/certification";
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

  const handleIssue = async () => {
    try {
      await issueCertificates(selectedCampaign);
      setModal({ isOpen: true, title: "Thành công", message: "Đã cấp chứng nhận hàng loạt cho TNV đủ điều kiện.", type: "success" });
      fetchData(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  const handlePreview = (cert) => {
    setPreviewCert(cert);
  };

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
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
              <p>Đã tham gia tích cực chiến dịch và đạt xếp loại:</p>
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
            <button className="action-btn eval-btn" onClick={handleIssue}>
              Cấp Hàng Loạt
            </button>
          </div>
        </div>

        <div className="cert-grid">
          <GlassCard title="Danh sách hoàn thành">
             <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>TNV</th>
                    <th>Tổng Giờ</th>
                    <th>Xếp Loại Dự Kiến</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(v => (
                    <tr key={v.MATHAMGIA || v.MaThamGia}>
                      <td>{v.HOTEN || v.HoTen}</td>
                      <td>{v.TONGGIO || v.TongGio}</td>
                      <td>{v.XEPLOAI || v.XepLoai}</td>
                    </tr>
                  ))}
                  {volunteers.length === 0 && !loading && (
                    <tr><td colSpan="3" className="empty-state">Không có sinh viên nào.</td></tr>
                  )}
                </tbody>
              </table>
             </div>
          </GlassCard>

          <GlassCard title="Chứng nhận đã cấp">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>TNV</th>
                    <th>Xếp Loại</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map(c => (
                    <tr key={c.MACHUNGNHAN || c.MaChungNhan}>
                      <td>{c.HOTEN || c.HoTen}</td>
                      <td>{c.XEPLOAI || c.XepLoai}</td>
                      <td>
                        <button className="action-btn view-btn" onClick={() => handlePreview(c)}>Xem PDF</button>
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && !loading && (
                    <tr><td colSpan="3" className="empty-state">Chưa cấp chứng nhận nào.</td></tr>
                  )}
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
