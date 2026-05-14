import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { getCampaignProofs, verifyProof, getParticipantTasks } from "../../services/proof";
import { useAuth } from "../../context/AuthContext";
import "./ProofReviewPage.css";

const ProofReviewPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const [verifyModal, setVerifyModal] = useState({ isOpen: false, proof: null });
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [status, setStatus] = useState("CoMat"); // Default CoMat

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchProofs(selectedCampaign);
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

  const fetchProofs = async (maCD) => {
    try {
      setLoading(true);
      const data = await getCampaignProofs(maCD);
      setProofs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVerify = async (proof) => {
    try {
      const pTasks = await getParticipantTasks(proof.MATHAMGIA || proof.MaThamGia);
      setTasks(pTasks);
      if (pTasks.length > 0) setSelectedTask(pTasks[0].MAPHANCONG || pTasks[0].MaPhanCong);
      setVerifyModal({ isOpen: true, proof });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: "Không thể lấy danh sách nhiệm vụ của TNV này.", type: "error" });
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyProof(selectedTask, status);
      setModal({ isOpen: true, title: "Thành công", message: "Đã điểm danh và ghi nhận giờ công.", type: "success" });
      setVerifyModal({ isOpen: false, proof: null });
      fetchProofs(selectedCampaign);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      {verifyModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h2>Duyệt Minh Chứng & Điểm Danh</h2>
            <p>TNV: {verifyModal.proof.HOTEN || verifyModal.proof.HoTen}</p>
            <form onSubmit={handleVerifySubmit}>
              <div className="form-group">
                <label>Nhiệm vụ cần điểm danh</label>
                <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} required>
                  {tasks.map(t => (
                    <option key={t.MAPHANCONG || t.MaPhanCong} value={t.MAPHANCONG || t.MaPhanCong}>
                      {t.TENCONGVIEC || t.TenCongViec} ({t.VAITROCUTHE || t.VaiTroCuThe})
                    </option>
                  ))}
                  {tasks.length === 0 && <option value="">TNV chưa được phân công nhiệm vụ nào</option>}
                </select>
              </div>
              <div className="form-group">
                <label>Trạng Thái</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="CoMat">Có Mặt (Hoàn thành)</option>
                  <option value="VangMat">Vắng Mặt (Không hoàn thành)</option>
                  <option value="CoPhep">Có Phép</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setVerifyModal({isOpen: false, proof: null})} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn" disabled={tasks.length === 0}>Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="proof-review-container">
        <div className="page-header">
          <h1>Đối Soát & Điểm Danh</h1>
          <div className="campaign-selector">
            <label>Chọn chiến dịch: </label>
            <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
              {campaigns.map(c => (
                <option key={c.MaChienDich || c.MACHIENDICH} value={c.MaChienDich || c.MACHIENDICH}>
                  {c.TenChienDich || c.TENCHIENDICH}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!loading && (
          <div className="proof-gallery">
            {proofs.map(p => {
              const isVerified = (p.ISVERIFIED || p.IsVerified) > 0;
              return (
                <GlassCard key={p.MAMINHCHUNG || p.MaMinhChung} className="proof-card">
                  <div className="proof-image-wrapper">
                    <img src={p.HINHANH_URL || p.HinhAnh_Url} alt="Minh Chung" className="proof-image" />
                    {isVerified && <div className="verified-badge">Đã Điểm Danh</div>}
                  </div>
                  <div className="proof-details">
                    <div className="proof-tnv-name">{p.HOTEN || p.HoTen} ({p.MSSV})</div>
                    <div className="proof-type">Loại: {p.LOAIMINHCHUNG || p.LoaiMinhChung}</div>
                    <div className="proof-date">Nộp lúc: {new Date(p.NGAYCAPNHAT || p.NgayCapNhat).toLocaleString('vi-VN')}</div>
                  </div>
                  {!isVerified && (
                    <button className="action-btn success-btn" onClick={() => handleOpenVerify(p)}>
                      Điểm Danh
                    </button>
                  )}
                </GlassCard>
              )
            })}
            {proofs.length === 0 && (
              <div className="empty-state w-full text-center py-12">Chưa có minh chứng nào được nộp cho chiến dịch này.</div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProofReviewPage;
