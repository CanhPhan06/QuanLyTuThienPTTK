import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { loadMaisonData, nextId, saveMaisonData } from "./maisonData";
import "./MaisonWorkflow.css";

const VolunteerAssignmentPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [skill, setSkill] = useState("Y te");
  const [volunteerId, setVolunteerId] = useState(data.volunteers[0]?.id || "");
  const [task, setTask] = useState("Ho tro tai kham dinh ky");
  const [time, setTime] = useState("2026-06-01T08:00");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const suggested = useMemo(
    () => data.volunteers.filter((item) => item.skill === skill && item.status === "San sang"),
    [data.volunteers, skill]
  );

  const assign = () => {
    const volunteer = data.volunteers.find((item) => item.id === volunteerId) || suggested[0];
    if (!volunteer) {
      setModal({ isOpen: true, title: "Không có TNV phù hợp", message: "Hệ thống chưa tìm thấy tình nguyện viên đúng kỹ năng và sẵn sàng.", type: "warning" });
      return;
    }
    if (volunteer.skill !== skill) {
      setModal({ isOpen: true, title: "Sai kỹ năng", message: "Công việc phải phù hợp với kỹ năng của tình nguyện viên.", type: "error" });
      return;
    }
    const assignment = { id: nextId("PC", data.assignments), volunteerId: volunteer.id, volunteerName: volunteer.name, task, skill, time, status: "Cho xac nhan" };
    const nextData = { ...data, assignments: [assignment, ...data.assignments] };
    setData(nextData);
    saveMaisonData(nextData);
    setModal({ isOpen: true, title: "Đã gửi lịch trình", message: `${volunteer.name} đã nhận phân công và chờ xác nhận.`, type: "success" });
  };

  const updateAssignment = (id, status) => {
    const nextData = { ...data, assignments: data.assignments.map((item) => item.id === id ? { ...item, status } : item) };
    setData(nextData);
    saveMaisonData(nextData);
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC6 - Nhân sự / Điều phối</span>
            <h1>Quản lý tình nguyện viên & phân công công việc</h1>
            <p>Lọc tình nguyện viên theo kỹ năng, phân công lịch trình và theo dõi xác nhận tham gia.</p>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "bdh01"} - Điều phối viên</strong></div>
        </header>

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Danh sách tình nguyện viên</h2>
            <table className="mc-table">
              <thead><tr><th>Mã</th><th>Họ tên</th><th>Kỹ năng</th><th>Lịch rảnh</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {data.volunteers.map((item) => (
                  <tr className="clickable" key={item.id} onClick={() => setVolunteerId(item.id)}>
                    <td>{item.id}</td><td>{item.name}</td><td>{item.skill}</td><td>{item.availability}</td>
                    <td><span className={`mc-tag ${item.status === "San sang" ? "good" : "warn"}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mc-card">
            <h2>Phân công theo kỹ năng</h2>
            <div className="mc-form">
              <label>Kỹ năng cần tìm<select value={skill} onChange={(e) => setSkill(e.target.value)}><option>Y te</option><option>Su pham</option><option>Hau can</option><option>Truyen thong</option></select></label>
              <label>TNV đề xuất<select value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)}>{data.volunteers.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.skill}</option>)}</select></label>
              <label className="mc-full">Công việc<input value={task} onChange={(e) => setTask(e.target.value)} /></label>
              <label className="mc-full">Thời gian<input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} /></label>
            </div>
            <div className="mc-alert" style={{ marginTop: "1rem" }}>
              Gợi ý phù hợp: {suggested.length > 0 ? suggested.map((item) => item.name).join(", ") : "Chưa có TNV đúng kỹ năng đang sẵn sàng"}
            </div>
            <div className="mc-actions"><button className="mc-btn" onClick={assign}>Gửi lịch phân công</button></div>
          </div>
        </section>

        <section className="mc-card">
          <h2>Lịch phân công</h2>
          <table className="mc-table">
            <thead><tr><th>Mã</th><th>Tình nguyện viên</th><th>Công việc</th><th>Kỹ năng</th><th>Thời gian</th><th>Trạng thái</th><th>Demo phản hồi</th></tr></thead>
            <tbody>
              {data.assignments.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.volunteerName}</td><td>{item.task}</td><td>{item.skill}</td><td>{item.time}</td>
                  <td><span className={`mc-tag ${item.status === "Da xac nhan" ? "good" : item.status === "Tu choi" ? "bad" : "warn"}`}>{item.status}</span></td>
                  <td className="mc-two-actions"><button className="mc-btn secondary" onClick={() => updateAssignment(item.id, "Da xac nhan")}>Xác nhận</button><button className="mc-btn danger" onClick={() => updateAssignment(item.id, "Tu choi")}>Từ chối</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </MainLayout>
  );
};

export default VolunteerAssignmentPage;
