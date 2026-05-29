import React, { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { getEnrollmentsForBDH, approveEnrollment, assignTask } from "../../services/executive";
import { useAuth } from "../../context/AuthContext";
import "./ApproveParticipationPage.css";

const ApproveParticipationPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "error" });
  
  // Assign modal state
  const [assignModal, setAssignModal] = useState({ isOpen: false, participant: null });
  const [assignData, setAssignData] = useState({ tenNhiemVu: "", vaiTro: "Thành viên" });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await getEnrollmentsForBDH(user.MaTaiKhoan);
      setEnrollments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await approveEnrollment(id, status, enrollments.length);
      fetchEnrollments();
      setModal({ isOpen: true, title: "Thành công", message: `Đã ${status === 'DaDuyet' ? 'duyệt' : 'từ chối'} đơn đăng ký.`, type: "success" });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      fetchEnrollments();
    }
  };

  const openAssignModal = (participant) => {
    setAssignModal({ isOpen: true, participant });
    setAssignData({ tenNhiemVu: "", vaiTro: "Thành viên" });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignTask({
        maThamGia: assignModal.participant.MATHAMGIA || assignModal.participant.MaThamGia,
        maChienDich: assignModal.participant.MACHIENDICH || assignModal.participant.MaChienDich,
        tenNhiemVu: assignData.tenNhiemVu,
        vaiTro: assignData.vaiTro
      });
      setModal({ isOpen: true, title: "Thành công", message: "Đã phân công nhiệm vụ.", type: "success" });
      setAssignModal({ isOpen: false, participant: null });
    } catch (error) {
      setModal({ isOpen: true, title: "Lỗi Phân Công", message: error.message, type: "error" });
      fetchEnrollments();
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

      {assignModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h2>Phân công nhiệm vụ</h2>
            <p>Cho TNV: {assignModal.participant.HOTEN || assignModal.participant.HoTen}</p>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label>Tên nhiệm vụ / Đội nhóm</label>
                <input 
                  type="text" 
                  value={assignData.tenNhiemVu} 
                  onChange={(e) => setAssignData({...assignData, tenNhiemVu: e.target.value})} 
                  required 
                  placeholder="VD: Đội Hậu Cần, Đội Truyền Thông..."
                />
              </div>
              <div className="form-group">
                <label>Vai trò cụ thể</label>
                <select 
                  value={assignData.vaiTro} 
                  onChange={(e) => setAssignData({...assignData, vaiTro: e.target.value})}
                >
                  <option value="Trưởng nhóm">Trưởng nhóm</option>
                  <option value="Thành viên">Thành viên</option>
                  <option value="Hậu cần">Hậu cần</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setAssignModal({isOpen: false, participant: null})} className="cancel-btn">Hủy</button>
                <button type="submit" className="submit-btn">Phân công</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="approve-page-container">
        <div className="approve-header">
          <h1>Duyệt Đăng Ký & Phân Công</h1>
          <p>Quản lý nhân sự và phân công nhiệm vụ cho các chiến dịch bạn đang điều hành.</p>
        </div>

        <div className="glass-table-container">
          {loading ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TNV</th>
                  <th>MSSV</th>
                  <th>Khoa / Lớp</th>
                  <th>Ngày Đăng Ký</th>
                  <th>Trạng Thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(en => (
                  <tr key={en.MATHAMGIA || en.MaThamGia}>
                    <td>
                      <div className="tnv-name">{en.HOTEN || en.HoTen}</div>
                      <div className="tnv-phone">{en.SODIENTHOAI || en.SoDienThoai}</div>
                    </td>
                    <td>{en.MSSV}</td>
                    <td>{en.KHOA || en.Khoa} <br/> {en.LOP || en.Lop}</td>
                    <td>{new Date(en.NGAYDANGKY || en.NgayDangKy).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <span className={`status-badge ${(en.TRANGTHAIDUYET || en.TrangThaiDuyet).toLowerCase()}`}>
                        {en.TRANGTHAIDUYET || en.TrangThaiDuyet}
                      </span>
                    </td>
                    <td className="action-cells">
                      {(en.TRANGTHAIDUYET || en.TrangThaiDuyet) === 'ChoDuyet' && (
                        <>
                          <button className="btn-approve" onClick={() => handleApprove(en.MATHAMGIA || en.MaThamGia, 'DaDuyet')}>Duyệt</button>
                          <button className="btn-reject" onClick={() => handleApprove(en.MATHAMGIA || en.MaThamGia, 'TuChoi')}>Từ Chối</button>
                        </>
                      )}
                      {(en.TRANGTHAIDUYET || en.TrangThaiDuyet) === 'DaDuyet' && (
                        <button className="btn-assign" onClick={() => openAssignModal(en)}>Phân Công</button>
                      )}
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">Chưa có đơn đăng ký nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ApproveParticipationPage;
