import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { getVolunteersByCampaign, evaluateVolunteer } from "../../services/evaluation";
import { useAuth } from "../../context/AuthContext";
import "./EvaluationPage.css";

const EvaluationPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const [evaluateModal, setEvaluateModal] = useState({ isOpen: false, volunteer: null });
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchVolunteers(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      // Filter for active or completed campaigns (assuming BDH can evaluate at end)
      setCampaigns(data);
      if (data.length > 0) setSelectedCampaign(data[0].MaChienDich || data[0].MACHIENDICH);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVolunteers = async (maCD) => {
    try {
      setLoading(true);
      const data = await getVolunteersByCampaign(maCD);
      setVolunteers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEvaluate = (volunteer) => {
    setEvaluateModal({ isOpen: true, volunteer });
    setScore(volunteer.DIEMDANHGIA || volunteer.DiemDanhGia || "");
    setComment(""); // Optionally fetch existing comment if DB supports it, but currently SP_DANHGIA_TNV just updates score, NhanXet is passed but DB might not store it if no column. Wait, ThamGiaTNV has no NhanXet column in default schema, but SP takes it.
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    try {
      const maThamGia = evaluateModal.volunteer.MATHAMGIA || evaluateModal.volunteer.MaThamGia;
      await evaluateVolunteer(maThamGia, Number(score), comment);
      setModal({ isOpen: true, title: "Thành công", message: "Đã đánh giá Tình nguyện viên.", type: "success" });
      setEvaluateModal({ isOpen: false, volunteer: null });
      fetchVolunteers(selectedCampaign); // Refresh to get updated badge
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  const getBadgeClass = (xepLoai) => {
    if (!xepLoai) return "badge-none";
    switch(xepLoai.toLowerCase()) {
      case 'xuatsac': return 'badge-gold';
      case 'tot': return 'badge-green';
      case 'kha': return 'badge-orange';
      default: return 'badge-gray';
    }
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
  }

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      {evaluateModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h2>Đánh giá Tình Nguyện Viên</h2>
            <p>TNV: {evaluateModal.volunteer.HOTEN || evaluateModal.volunteer.HoTen}</p>
            <p>Tổng giờ: {evaluateModal.volunteer.TONGGIO || evaluateModal.volunteer.TongGio} giờ</p>
            <form onSubmit={handleEvaluateSubmit}>
              <div className="form-group">
                <label>Điểm Đánh Giá (0-100)</label>
                <input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nhận Xét</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows="3"></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEvaluateModal({isOpen: false, volunteer: null})} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn">Lưu Đánh Giá</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="evaluation-page-container">
        <div className="page-header">
          <h1>Đánh giá & Xếp loại TNV</h1>
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

        <GlassCard title="Danh sách Sinh viên Tình nguyện">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TNV / MSSV</th>
                  <th>Tổng Giờ</th>
                  <th>Điểm Đánh Giá</th>
                  <th>Xếp Loại</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.MATHAMGIA || v.MaThamGia}>
                    <td>
                      <div className="tnv-name">{v.HOTEN || v.HoTen}</div>
                      <div className="tnv-phone">{v.MASOSINHVIEN || v.MaSoSinhVien}</div>
                    </td>
                    <td><span className="hour-badge">{v.TONGGIO || v.TongGio} giờ</span></td>
                    <td>{v.DIEMDANHGIA !== null ? v.DIEMDANHGIA : (v.DiemDanhGia !== null ? v.DiemDanhGia : 'Chưa chấm')}</td>
                    <td>
                      <span className={`eval-badge ${getBadgeClass(v.XEPLOAI || v.XepLoai)}`}>
                        {getBadgeName(v.XEPLOAI || v.XepLoai)}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn eval-btn" onClick={() => openEvaluate(v)}>
                        Chấm Điểm
                      </button>
                    </td>
                  </tr>
                ))}
                {volunteers.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="empty-state">Không có tình nguyện viên nào trong chiến dịch này.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </MainLayout>
  );
};

export default EvaluationPage;
