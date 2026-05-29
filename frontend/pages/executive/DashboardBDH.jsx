import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import TimetableGrid from '../../components/dashboard/common/TimetableGrid';
import RegistrationBox from '../../components/dashboard/bdh/RegistrationBox';
import EvidenceBox from '../../components/dashboard/bdh/EvidenceBox';
import CampaignNotificationBox from '../../components/dashboard/bdh/CampaignNotificationBox';
import TaskDetailView from '../../components/dashboard/bdh/TaskDetailView';
import './DashboardBDH.css';

const DashboardBDH = () => {
  const { user } = useAuth();
  const [context, setContext] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/bdh/context/${user.MaTaiKhoan}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi tải dữ liệu');
      setContext(data);
      const maCD = data.campaign.MaChienDich || data.campaign.MACHIENDICH;

      const [tasksRes, regRes, evidenceRes, notifRes] = await Promise.all([
        fetch(`http://localhost:3000/api/bdh/tasks/${maCD}`),
        fetch(`http://localhost:3000/api/bdh/registrations/${maCD}`),
        fetch(`http://localhost:3000/api/bdh/evidence/${maCD}`),
        fetch(`http://localhost:3000/api/bdh/notifications/${maCD}`)
      ]);

      const [tasksData, regData, evidenceData, notifData] = await Promise.all([
        tasksRes.json(),
        regRes.json(),
        evidenceRes.json(),
        notifRes.json()
      ]);

      setTasks(tasksData);
      setRegistrations(regData);
      setEvidence(evidenceData);
      setNotifications(notifData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.MaTaiKhoan) fetchData();
  }, [user]);

  const handleAddNotification = async (noiDung, tieuDe) => {
    try {
      const maCD = context.campaign.MaChienDich || context.campaign.MACHIENDICH;
      const res = await fetch('http://localhost:3000/api/bdh/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maCD, maTK: user.MaTaiKhoan, noiDung, tieuDe })
      });
      if (res.ok) fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleApproveRegistration = async (maThamGia) => {
    try {
      const res = await fetch(`http://localhost:3000/api/executive/enrollments/${maThamGia}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DaDuyet' })
      });
      if (res.ok) fetchData();
      else { const d = await res.json(); alert(d.error || 'Lỗi duyệt'); }
    } catch (err) { alert(err.message); }
  };

  const handleRejectRegistration = async (maThamGia) => {
    try {
      const res = await fetch(`http://localhost:3000/api/executive/enrollments/${maThamGia}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'TuChoi' })
      });
      if (res.ok) fetchData();
      else { const d = await res.json(); alert(d.error || 'Lỗi từ chối'); }
    } catch (err) { alert(err.message); }
  };

  const handleBulkApproveEvidence = async () => {
    try {
      const unapproved = evidence.filter(e => (e.ISATTENDED || e.IsAttended || 0) === 0);
      if (unapproved.length === 0) return;
      const res = await fetch('http://localhost:3000/api/bdh/proof/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofs: unapproved })
      });
      if (res.ok) fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleVerifyProof = async (item, status) => {
    try {
      const res = await fetch('http://localhost:3000/api/bdh/proof/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          maThamGia: item.MATHAMGIA || item.MaThamGia, 
          maMinhChung: item.MAMINHCHUNG || item.MaMinhChung, 
          trangThai: status === 'Approve' ? 'HopLe' : 'KhongHopLe' 
        })
      });
      if (res.ok) {
        setSelectedEvidence(null);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'Lỗi xử lý minh chứng');
      }
    } catch (err) { alert(err.message); }
  };

  const [newTask, setNewTask] = useState({ 
    name: '', 
    desc: '', 
    startTime: '', 
    endTime: '',
    soLuongTNVCan: 5,
    session: 'Morning' 
  });
  
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const campEnd = new Date(context.campaign.NgayKetThuc || context.campaign.NGAYKETTHUC);
      const taskStart = new Date(newTask.startTime);
      const taskEnd = new Date(newTask.endTime);

      if (taskStart >= taskEnd) {
        alert('Lỗi: Thời gian bắt đầu phải trước thời gian kết thúc!');
        return;
      }

      if (taskEnd > campEnd) {
        alert('Lỗi: Thời gian công việc không được vượt quá thời gian kết thúc chiến dịch!');
        return;
      }

      const res = await fetch('http://localhost:3000/api/bdh/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maCD: context.campaign.MaChienDich || context.campaign.MACHIENDICH,
          tenCV: newTask.name,
          moTa: newTask.desc,
          thoiGianBatDau: newTask.startTime,
          thoiGianKetThuc: newTask.endTime,
          soLuongTNVCan: newTask.soLuongTNVCan
        })
      });
      if (res.ok) {
        setShowTaskForm(false);
        setNewTask({ name: '', desc: '', startTime: '', endTime: '', soLuongTNVCan: 5, session: 'Morning' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) { alert(err.message); }
  };

  if (loading) return (
    <MainLayout>
      <div className="global-loading-container">
        <div className="spinner"></div>
        <p>Đang tải bảng điều khiển...</p>
      </div>
    </MainLayout>
  );

  if (error) return <MainLayout><div className="error-state">{error}</div></MainLayout>;

  return (
    <MainLayout>
      <div className="dashboard-bdh-container">
        <div className="central-workspace">
          <div className="dashboard-header">
            <h1>Điều phối Maison Chance: {context.campaign.TenChienDich || context.campaign.TENCHIENDICH}</h1>
          </div>

          <div className="action-bar">
            <button className="add-task-btn" onClick={() => setShowTaskForm(true)}>+ Thêm công việc hỗ trợ</button>
          </div>

          <div className="glass-panel">
            <TimetableGrid 
              tasks={tasks} 
              campaign={context.campaign} 
              onTaskClick={(task) => setSelectedTask(task)}
            />
          </div>
        </div>

        <div className="right-panel">
          <RegistrationBox 
            registrations={registrations} 
            onApprove={handleApproveRegistration} 
            onReject={handleRejectRegistration} 
            personnelCount={context.personnel}
          />
          <CampaignNotificationBox 
            notifications={notifications}
            onAddNotification={handleAddNotification}
          />
          <EvidenceBox 
            evidence={evidence} 
            onViewDetails={setSelectedEvidence} 
            onBulkApprove={handleBulkApproveEvidence} 
          />
        </div>

        {/* Evidence Review Modal */}
        {selectedEvidence && (
          <div className="custom-modal-overlay">
            <div className="custom-modal evidence-modal">
              <div className="evidence-viewer">
                <img src={selectedEvidence.HINHANH_URL || selectedEvidence.HinhAnh_URL} alt="Proof" className="full-evidence-img" />
                <div className="evidence-details">
                  <h3>Chi tiết minh chứng</h3>
                  <p><strong>Tình nguyện viên:</strong> {selectedEvidence.HOTEN || selectedEvidence.HoTen}</p>
                  <p><strong>Loại hoạt động:</strong> {selectedEvidence.LOAIMINHCHUNG || selectedEvidence.LoaiMinhChung}</p>
                  <p><strong>Thời gian nộp:</strong> {selectedEvidence.NGAYCAPNHAT ? new Date(selectedEvidence.NGAYCAPNHAT).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
                <div className="modal-actions">
                  <button className="btn-close" onClick={() => setSelectedEvidence(null)}>Đóng</button>
                  <button className="btn-reject" onClick={() => handleVerifyProof(selectedEvidence, 'Reject')}>Từ chối</button>
                  <button className="btn-approve" onClick={() => handleVerifyProof(selectedEvidence, 'Approve')}>Duyệt điểm danh</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showTaskForm && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <h3>Thêm công việc mới</h3>
              <form onSubmit={handleAddTask}>
                <div className="form-group">
                  <label>Tên công việc</label>
                  <input required value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea value={newTask.desc} onChange={e => setNewTask({...newTask, desc: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Thời gian bắt đầu</label>
                  <input type="datetime-local" required value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc</label>
                  <input type="datetime-local" required value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Số lượng TNV cần</label>
                  <input type="number" min="1" required value={newTask.soLuongTNVCan} onChange={e => setNewTask({...newTask, soLuongTNVCan: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-close" onClick={() => setShowTaskForm(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Lưu công việc</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailView 
            task={selectedTask}
            campaign={context.campaign}
            onClose={() => setSelectedTask(null)}
            onRefresh={fetchData}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardBDH;
