import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { getCampaignEfficiency, getTopContributors, getParameters, updateParameter } from "../../services/statistics";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./AnalyticsDashboard.css";

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [efficiency, setEfficiency] = useState({ TongThu: 0, TongChi: 0 });
  const [contributors, setContributors] = useState([]);
  const [parameters, setParameters] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });
  
  const [editParamModal, setEditParamModal] = useState({ isOpen: false, param: null, newValue: "" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchEfficiency(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [camps, tops, params] = await Promise.all([
        getCampaigns(),
        getTopContributors(),
        getParameters()
      ]);
      setCampaigns(camps);
      if (camps.length > 0) setSelectedCampaign(camps[0].MaChienDich || camps[0].MACHIENDICH);
      setContributors(tops);
      setParameters(params);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEfficiency = async (maCD) => {
    try {
      const data = await getCampaignEfficiency(maCD);
      setEfficiency(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenEditParam = (p) => {
    setEditParamModal({ isOpen: true, param: p, newValue: p.GIATRI || p.GiaTri });
  };

  const handleUpdateParam = async (e) => {
    e.preventDefault();
    try {
      const maTS = editParamModal.param.MATHAMSO || editParamModal.param.MaThamSo;
      await updateParameter(maTS, editParamModal.newValue);
      setModal({ isOpen: true, title: "Thành công", message: "Cập nhật tham số thành công.", type: "success" });
      setEditParamModal({ isOpen: false, param: null, newValue: "" });
      
      const newParams = await getParameters();
      setParameters(newParams);
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
    }
  };

  // Prepare data for chart
  const chartData = [
    {
      name: 'Tài Chính',
      'Tổng Thu': efficiency.TONGTHU || efficiency.TongThu || 0,
      'Tổng Chi': efficiency.TONGCHI || efficiency.TongChi || 0,
    }
  ];

  return (
    <MainLayout>
      <SystemModal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      {editParamModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h2>Cập nhật Tham Số</h2>
            <p>{editParamModal.param.TENTHAMSO || editParamModal.param.TenThamSo}</p>
            <p className="param-desc">{editParamModal.param.MOTA || editParamModal.param.MoTa}</p>
            <form onSubmit={handleUpdateParam}>
              <div className="form-group">
                <label>Giá Trị Mới</label>
                <input type="text" value={editParamModal.newValue} onChange={e => setEditParamModal({ ...editParamModal, newValue: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditParamModal({isOpen: false, param: null, newValue: ""})} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="analytics-page-container">
        <div className="page-header">
          <h1>Báo Cáo & Thống Kê</h1>
        </div>

        <div className="analytics-grid">
          <GlassCard title="Hiệu Quả Chiến Dịch">
            <div className="campaign-selector" style={{ marginBottom: '20px' }}>
              <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)} style={{ width: '100%' }}>
                {campaigns.map(c => (
                  <option key={c.MaChienDich || c.MACHIENDICH} value={c.MaChienDich || c.MACHIENDICH}>
                    {c.TenChienDich || c.TENCHIENDICH}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                  <Legend />
                  <Bar dataKey="Tổng Thu" fill="#4CAF50" />
                  <Bar dataKey="Tổng Chi" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard title="Bảng Vàng Tình Nguyện Viên">
            <div className="leaderboard">
              {contributors.map((c, index) => (
                <div key={c.MATAIKHOAN || c.MaTaiKhoan} className={`leader-item rank-${index + 1}`}>
                  <div className="rank-badge">{index + 1}</div>
                  <div className="leader-info">
                    <h4>{c.HOTEN || c.HoTen}</h4>
                    <p>{c.KHOA || c.Khoa}</p>
                  </div>
                  <div className="leader-score">
                    {c.TONGGIO || c.TongGio} giờ
                  </div>
                </div>
              ))}
              {contributors.length === 0 && <div className="empty-state">Chưa có dữ liệu.</div>}
            </div>
          </GlassCard>
        </div>

        <GlassCard title="Cấu Hình Hệ Thống">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Mã Tham Số</th>
                  <th>Tên Tham Số</th>
                  <th>Giá Trị</th>
                  <th>Mô Tả</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map(p => (
                  <tr key={p.MATHAMSO || p.MaThamSo}>
                    <td>{p.MATHAMSO || p.MaThamSo}</td>
                    <td><strong>{p.TENTHAMSO || p.TenThamSo}</strong></td>
                    <td><span className="param-value-badge">{p.GIATRI || p.GiaTri}</span></td>
                    <td className="param-desc-cell">{p.MOTA || p.MoTa}</td>
                    <td>
                      <button className="action-btn eval-btn" onClick={() => handleOpenEditParam(p)}>Sửa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </MainLayout>
  );
};

export default AnalyticsDashboard;
