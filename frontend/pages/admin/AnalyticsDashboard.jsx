import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../components/layout/MainLayout";
import GlassCard from "../../components/common/GlassCard";
import SystemModal from "../../components/common/SystemModal";
import { getCampaigns } from "../../services/campaigns";
import { getCampaignStats, getTopVolunteers } from "../../services/statistics";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "./AnalyticsDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [stats, setStats] = useState({ income: 0, expense: 0, weekly: [] });
  const [topTNV, setTopTNV] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState("");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" });
  const dataVersionRef = useRef("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignData(selectedCampaign);
    }
  }, [selectedCampaign]);

  useEffect(() => {
    if (!selectedCampaign) return;

    const intervalId = setInterval(() => {
      fetchCampaignData(selectedCampaign, true);
    }, 5000);

    const handleFocus = () => {
      fetchCampaignData(selectedCampaign, true);
    };
    const handleFinanceUpdate = (event) => {
      if (event.key !== "finance-updated" || !event.newValue) return;
      const payload = JSON.parse(event.newValue);
      if (payload.campaignId === selectedCampaign) {
        fetchCampaignData(selectedCampaign, true);
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleFinanceUpdate);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleFinanceUpdate);
    };
  }, [selectedCampaign]);

  const fetchInitialData = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0].MaChienDich || data[0].MACHIENDICH);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignData = async (id, silent = false) => {
    try {
      const [s, top] = await Promise.all([
        getCampaignStats(id),
        getTopVolunteers(id)
      ]);
      const nextVersion = JSON.stringify({ s, top });
      if (dataVersionRef.current && nextVersion !== dataVersionRef.current && !silent) {
        setModal({
          isOpen: true,
          title: "Dữ liệu đã thay đổi",
          message: "Số liệu thống kê đã được người dùng khác cập nhật. Hệ thống đã tải lại dữ liệu mới để tránh sử dụng số liệu cũ.",
          type: "warning"
        });
      }
      if (dataVersionRef.current && nextVersion !== dataVersionRef.current && silent) {
        setModal({
          isOpen: true,
          title: "Dữ liệu đã tự động cập nhật",
          message: "Báo cáo thống kê vừa được đồng bộ với dữ liệu thu chi mới nhất.",
          type: "success"
        });
      }
      dataVersionRef.current = nextVersion;
      setDataVersion(nextVersion);
      setStats(s || { income: 0, expense: 0, weekly: [] });
      setTopTNV(top || []);
    } catch (error) {
      console.error(error);
    }
  };

  const chartData = {
    labels: stats.weekly && stats.weekly.length > 0 ? stats.weekly.map(w => w.week) : ['Tài chính (VNĐ)'],
    datasets: [
      {
        label: 'Tổng Thu (Tài trợ & Quyên góp)',
        data: stats.weekly && stats.weekly.length > 0 ? stats.weekly.map(w => w.income) : [stats.income],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Tổng Chi (Kế hoạch & Phát sinh)',
        data: stats.weekly && stats.weekly.length > 0 ? stats.weekly.map(w => w.expense) : [stats.expense],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ],
  };

  const formatHours = (hours) => {
    if (!hours && hours !== 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}p`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
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
      <div className="analytics-container">
        <header className="analytics-header">
          <div className="header-info">
            <h1>Đối soát & Báo cáo Maison Chance</h1>
            <p>Theo dõi thu chi, số dư hoạt động và đóng góp của tình nguyện viên</p>
          </div>
          <div className="campaign-selector">
            <label>Chọn hoạt động/dự án:</label>
            <select value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
              {campaigns.map(c => (
                <option key={c.MaChienDich || c.MACHIENDICH} value={c.MaChienDich || c.MACHIENDICH}>
                  {c.TenChienDich || c.TENCHIENDICH}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => fetchCampaignData(selectedCampaign)}>
              Tải lại
            </button>
          </div>
        </header>

        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : (
          <div className="analytics-grid">
            {/* Chart Section */}
            <GlassCard title="Hiệu quả tài chính" className="chart-card">
              <div className="chart-wrapper">
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="finance-summary">
                <div className="summary-item">
                  <span className="label">Số dư hiện tại:</span>
                  <span className={`value ${(stats.income - stats.expense) >= 0 ? 'plus' : 'minus'}`}>
                    {(stats.income - stats.expense).toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Hall of Fame */}
            <GlassCard title="Tình nguyện viên nổi bật" className="hall-of-fame">
              <div className="top-tnv-list">
                {topTNV.length > 0 ? (
                  topTNV.map((tnv, index) => (
                    <div key={tnv.MaTaiKhoan || tnv.MATAIKHOAN} className="tnv-rank-item">
                      <div className="rank-badge">{index + 1}</div>
                      <div className="tnv-info">
                        <span className="tnv-name">{tnv.HoTen || tnv.HOTEN}</span>
                        <span className="tnv-stats">
                          {formatHours(tnv.TongGio || tnv.TONGGIO || 0)} • {tnv.DiemDanhGia || tnv.DIEMDANHGIA || 0}đ • {tnv.XepLoai || tnv.XEPLOAI}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Chưa có dữ liệu đánh giá cho chiến dịch này.</div>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnalyticsDashboard;
