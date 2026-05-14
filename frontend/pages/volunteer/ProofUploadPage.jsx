import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getMyEnrollments } from "../../services/campaigns";
import { getParticipantTasks, uploadProof } from "../../services/proof";
import { useAuth } from "../../context/AuthContext";
import "./ProofUploadPage.css";

const ProofUploadPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedThamGia, setSelectedThamGia] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });

  const [proofData, setProofData] = useState({ hinhAnhUrl: "", loai: "HoatDong" });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (selectedThamGia) {
      fetchTasks(selectedThamGia);
    }
  }, [selectedThamGia]);

  const fetchEnrollments = async () => {
    try {
      const data = await getMyEnrollments(user.MaTaiKhoan);
      const activeEnrollments = data.filter(e => (e.TRANGTHAIDUYET || e.TrangThaiDuyet) === 'DaDuyet');
      setEnrollments(activeEnrollments);
      if (activeEnrollments.length > 0) {
        setSelectedThamGia(activeEnrollments[0].MATHAMGIA || activeEnrollments[0].MaThamGia);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (maThamGia) => {
    try {
      const data = await getParticipantTasks(maThamGia);
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await uploadProof(selectedThamGia, proofData.hinhAnhUrl, proofData.loai);
      setModal({ isOpen: true, title: "Thành công", message: "Đã nộp minh chứng thành công. Vui lòng chờ BDH duyệt.", type: "success" });
      setProofData({ hinhAnhUrl: "", loai: "HoatDong" });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      <div className="proof-page-container">
        <div className="page-header">
          <h1>Nộp Minh Chứng Hoạt Động</h1>
          <p>Tải lên hình ảnh xác nhận bạn đã hoàn thành nhiệm vụ để được điểm danh.</p>
        </div>

        {!loading && (
          <div className="proof-content-grid">
            <GlassCard title="1. Chọn Chiến Dịch Đang Tham Gia">
              <div className="form-group">
                <select value={selectedThamGia} onChange={(e) => setSelectedThamGia(e.target.value)} className="proof-select">
                  {enrollments.map(e => (
                    <option key={e.MATHAMGIA || e.MaThamGia} value={e.MATHAMGIA || e.MaThamGia}>
                      {e.TENCHIENDICH || e.TenChienDich}
                    </option>
                  ))}
                  {enrollments.length === 0 && <option value="">Không có chiến dịch nào đang hoạt động</option>}
                </select>
              </div>

              {tasks.length > 0 && (
                <div className="task-list mt-24">
                  <h4>Nhiệm vụ của bạn:</h4>
                  <ul>
                    {tasks.map(t => (
                      <li key={t.MAPHANCONG || t.MaPhanCong}>
                        <span className="task-name">{t.TENCONGVIEC || t.TenCongViec}</span> - <span className="task-role">{t.VAITROCUTHE || t.VaiTroCuThe}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </GlassCard>

            <GlassCard title="2. Tải Lên Minh Chứng">
              <form onSubmit={handleSubmit} className="finance-form">
                <div className="form-group">
                  <label>Loại Minh Chứng</label>
                  <select value={proofData.loai} onChange={e => setProofData({...proofData, loai: e.target.value})}>
                    <option value="HoatDong">Ảnh Hoạt Động</option>
                    <option value="KetQua">Ảnh Kết Quả Sản Phẩm</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>URL Hình Ảnh Minh Chứng</label>
                  <input type="url" value={proofData.hinhAnhUrl} onChange={e => setProofData({...proofData, hinhAnhUrl: e.target.value})} required placeholder="Ví dụ: https://imgur.com/..."/>
                </div>
                <button type="submit" className="action-btn success-btn" disabled={!selectedThamGia}>Nộp Minh Chứng</button>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProofUploadPage;
