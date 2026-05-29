import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { loadMaisonData, nextId, saveMaisonData } from "./maisonData";
import "./MaisonWorkflow.css";

const AlertsReminderPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [form, setForm] = useState({
    type: "Tai kham",
    title: "",
    owner: "",
    dueAt: "2026-06-01T08:00",
    channel: "Thong bao he thong"
  });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const urgentCount = useMemo(() => data.reminders.filter((item) => item.status === "Khan cap" || item.status === "Sap den han").length, [data.reminders]);

  const persist = (nextData) => {
    setData(nextData);
    saveMaisonData(nextData);
  };

  const createReminder = (event) => {
    event.preventDefault();
    if (new Date(form.dueAt) < new Date()) {
      setModal({ isOpen: true, title: "Mốc thời gian không hợp lệ", message: "Không thể tạo nhắc việc ở thời điểm trong quá khứ.", type: "error" });
      return;
    }
    const reminder = { id: nextId("NV", data.reminders), ...form, status: "Sap den han" };
    persist({ ...data, reminders: [reminder, ...data.reminders] });
    setModal({ isOpen: true, title: "Đã tạo nhắc việc", message: "Hệ thống sẽ đưa sự kiện vào danh sách quét cảnh báo.", type: "success" });
  };

  const updateReminder = (id, status) => {
    persist({ ...data, reminders: data.reminders.map((item) => item.id === id ? { ...item, status } : item) });
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC10 - Nhân viên xã hội / Quản lý</span>
            <h1>Cảnh báo & nhắc việc tự động</h1>
            <p>Tạo nhắc tái khám, tiêm chủng, vãng gia, báo cáo định kỳ và cảnh báo tồn kho thấp.</p>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "admin/bdh01"} - Người phụ trách</strong></div>
        </header>

        <section className="mc-kpi-grid">
          <div className="mc-kpi"><strong>{data.reminders.length}</strong><span>Lịch nhắc</span></div>
          <div className="mc-kpi"><strong>{urgentCount}</strong><span>Sắp đến hạn</span></div>
          <div className="mc-kpi"><strong>{data.inventory.materials.filter((item) => item.stock <= item.minStock).length}</strong><span>Cảnh báo kho</span></div>
          <div className="mc-kpi"><strong>5 phút</strong><span>Ngưỡng trễ tối đa</span></div>
        </section>

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Thiết lập nhắc việc</h2>
            <form className="mc-form" onSubmit={createReminder}>
              <label>Loại nhắc việc<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Tai kham</option><option>Tiem chung</option><option>Vang gia</option><option>Bao cao</option><option>Kho</option></select></label>
              <label>Người phụ trách<input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></label>
              <label className="mc-full">Nội dung<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <label>Thời gian nhắc<input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></label>
              <label>Kênh thông báo<select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option>Thong bao he thong</option><option>Email</option><option>SMS</option></select></label>
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Tạo nhắc việc</button></div>
            </form>
          </div>

          <div className="mc-card">
            <h2>Cảnh báo hệ thống</h2>
            <div className="mc-list">
              {data.inventory.materials.filter((item) => item.stock <= item.minStock).map((item) => (
                <div className="mc-list-item" key={item.id}>
                  <strong>Tồn kho thấp: {item.name}</strong>
                  <p>Còn {item.stock}/{item.minStock} {item.unit}. Bộ phận thu mua cần bổ sung.</p>
                </div>
              ))}
              {data.inventory.materials.every((item) => item.stock > item.minStock) && <div className="mc-list-item"><strong>Kho ổn định</strong><p>Không có nguyên liệu dưới định mức.</p></div>}
            </div>
          </div>
        </section>

        <section className="mc-card">
          <h2>Danh sách nhắc việc</h2>
          <table className="mc-table">
            <thead><tr><th>Mã</th><th>Loại</th><th>Nội dung</th><th>Người phụ trách</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {data.reminders.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.type}</td><td>{item.title}</td><td>{item.owner}</td><td>{item.dueAt}</td>
                  <td><span className={`mc-tag ${item.status === "Da gui" ? "good" : item.status === "Da huy" ? "bad" : "warn"}`}>{item.status}</span></td>
                  <td className="mc-two-actions"><button className="mc-btn secondary" onClick={() => updateReminder(item.id, "Da gui")}>Đánh dấu đã gửi</button><button className="mc-btn danger" onClick={() => updateReminder(item.id, "Da huy")}>Hủy lịch</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </MainLayout>
  );
};

export default AlertsReminderPage;
