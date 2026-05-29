import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns, enrollCampaign, getMyEnrollments } from "../../services/campaigns";
import { useAuth } from "../../context/AuthContext";
import "./CampaignsPage.css";

const CampaignsPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignData, enrollmentsData] = await Promise.all([
        getCampaigns(),
        getMyEnrollments(user.MaTaiKhoan)
      ]);
      setCampaigns(campaignData);
      setMyEnrollments(enrollmentsData.map(e => e.MACHIENDICH || e.MaChienDich));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (campaignId) => {
    setEnrollLoading(true);
    try {
      const res = await enrollCampaign(campaignId, user.MaTaiKhoan);
      setModal({ isOpen: true, title: "Thành công", message: res.message, type: "success" });
      fetchData(); // Refresh to update numbers and button status
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi Đăng Ký", message: error.message, type: "error" });
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <MainLayout>
      <SystemModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <div className="campaigns-page-container">
        <div className="campaigns-header">
          <h1>Hoạt động tình nguyện Maison Chance</h1>
          <p>Đăng ký hỗ trợ các chương trình y tế, giáo dục, kho vận và chăm sóc thành viên.</p>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải danh sách hoạt động...</div>
        ) : (
          <div className="campaign-grid">
            {campaigns.map(cd => {
              const hienTai = cd.SOLUONGHIENTAI || cd.SoLuongHienTai || 0;
              const toiDa = cd.SOLUONGTNVTOIDA || cd.SoLuongTNVToiDa || 100;
              const percent = Math.min((hienTai / toiDa) * 100, 100);
              const startDate = new Date(cd.NGAYBATDAU || cd.NgayBatDau).toLocaleDateString("vi-VN");
              const endDate = new Date(cd.NGAYKETTHUC || cd.NgayKetThuc).toLocaleDateString("vi-VN");

              const isEnrolled = myEnrollments.includes(cd.MACHIENDICH || cd.MaChienDich);

              return (
                <div className="campaign-card glass-panel" key={cd.MACHIENDICH || cd.MaChienDich}>
                  <div className="campaign-card-header">
                    <h2>{cd.TENCHIENDICH || cd.TenChienDich}</h2>
                    <span className="status-badge">{cd.TRANGTHAI || cd.TrangThai}</span>
                  </div>
                  <div className="campaign-card-body">
                    <p className="campaign-desc">{cd.MOTA || cd.MoTa}</p>
                    <div className="campaign-meta">
                      <span>Địa điểm: {cd.DIADIEM || cd.DiaDiem || "Chưa cập nhật"}</span>
                      <span>Thời gian: {startDate} - {endDate}</span>
                    </div>
                    
                    <div className="progress-section">
                      <div className="progress-labels">
                        <span>Tiến độ tuyển tình nguyện viên</span>
                        <span>{hienTai} / {toiDa}</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="campaign-card-footer">
                    <button 
                      className="enroll-btn"
                      onClick={() => handleEnroll(cd.MACHIENDICH || cd.MaChienDich)}
                      disabled={enrollLoading || percent >= 100 || (cd.TRANGTHAI || cd.TrangThai) !== 'DangHoatDong' || isEnrolled}
                    >
                      {isEnrolled ? "Đã Đăng Ký" : (percent >= 100 ? "Đã Đầy" : "Đăng Ký Tham Gia")}
                    </button>
                  </div>
                </div>
              );
            })}
            
            {campaigns.length === 0 && (
              <div className="empty-state">Hiện chưa có hoạt động nào đang mở.</div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CampaignsPage;
