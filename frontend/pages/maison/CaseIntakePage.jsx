import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { loadMaisonData, nextId, saveMaisonData, statusLabels, today } from "./maisonData";
import "./MaisonWorkflow.css";

const documentOptions = [
  "Giay khai sinh",
  "Giay xac nhan khuyet tat",
  "Bien ban vang gia",
  "Anh minh chung",
  "Hop dong nuoi duong"
];

const CaseIntakePage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [selectedId, setSelectedId] = useState(data.cases[0]?.id || "");
  const [form, setForm] = useState({
    name: "",
    type: "Tre em mo coi",
    birthDate: "",
    identifier: "",
    disability: "Khong",
    family: "",
    location: "",
    visitDate: today(),
    visitResult: "",
    documents: ["Bien ban vang gia"]
  });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const selectedCase = useMemo(
    () => data.cases.find((item) => item.id === selectedId) || data.cases[0],
    [data.cases, selectedId]
  );

  const persist = (nextData) => {
    setData(nextData);
    saveMaisonData(nextData);
  };

  const toggleDocument = (doc) => {
    setForm((current) => ({
      ...current,
      documents: current.documents.includes(doc)
        ? current.documents.filter((item) => item !== doc)
        : [...current.documents, doc]
    }));
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const requiredDocs = ["Bien ban vang gia"];
    const missing = requiredDocs.filter((doc) => !form.documents.includes(doc));
    const newCase = {
      ...form,
      id: nextId("HS", data.cases),
      status: missing.length > 0 ? "CanBoSung" : "ChoHoiDong",
      votesFor: 0,
      votesTotal: 5,
      note: missing.length > 0 ? `Thieu: ${missing.join(", ")}` : "Da chuyen hoi dong xet duyet"
    };
    const nextData = { ...data, cases: [newCase, ...data.cases] };
    persist(nextData);
    setSelectedId(newCase.id);
    setModal({
      isOpen: true,
      title: "Đã tiếp nhận hồ sơ",
      message: missing.length > 0
        ? "Hồ sơ đã lưu nhưng cần bổ sung giấy tờ trước khi trình hội đồng."
        : "Hồ sơ đã đủ điều kiện sơ tuyển và chuyển sang hội đồng xét duyệt.",
      type: missing.length > 0 ? "warning" : "success"
    });
  };

  const updateSelectedStatus = (status, note) => {
    const nextCases = data.cases.map((item) =>
      item.id === selectedCase.id ? { ...item, status, note } : item
    );
    persist({ ...data, cases: nextCases });
    setModal({ isOpen: true, title: "Đã cập nhật hồ sơ", message: note, type: "success" });
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC1 - Nhân viên xã hội</span>
            <h1>Tiếp nhận hồ sơ & vãng gia</h1>
            <p>Nhập hồ sơ người khuyết tật/trẻ em, ghi nhận vãng gia, kiểm tra giấy tờ và chuyển hội đồng.</p>
          </div>
          <div className="mc-role-card">
            <span>Tài khoản sử dụng</span>
            <strong>{user?.TenDangNhap || "bdh01"} - Nhân viên xã hội</strong>
          </div>
        </header>

        <section className="mc-kpi-grid">
          <div className="mc-kpi"><strong>{data.cases.length}</strong><span>Tổng hồ sơ</span></div>
          <div className="mc-kpi"><strong>{data.cases.filter((item) => item.status === "ChoHoiDong").length}</strong><span>Chờ hội đồng</span></div>
          <div className="mc-kpi"><strong>{data.cases.filter((item) => item.status === "CanBoSung").length}</strong><span>Cần bổ sung</span></div>
          <div className="mc-kpi"><strong>{data.cases.filter((item) => item.status === "ChinhThuc").length}</strong><span>Thành viên chính thức</span></div>
        </section>

        <section className="mc-grid wide-left">
          <div className="mc-card">
            <h2>Biểu mẫu tiếp nhận</h2>
            <form className="mc-form" onSubmit={handleCreate}>
              <label>Họ tên đối tượng<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Loại hồ sơ<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Tre em mo coi</option><option>Nguoi khuyet tat</option></select></label>
              <label>Ngày sinh<input type="date" required value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
              <label>Số định danh<input required value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="VD: MC-TE-003" /></label>
              <label>Tình trạng khuyết tật<input value={form.disability} onChange={(e) => setForm({ ...form, disability: e.target.value })} /></label>
              <label>Ngày vãng gia<input type="date" required value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} /></label>
              <label className="mc-full">Hoàn cảnh gia đình<textarea required value={form.family} onChange={(e) => setForm({ ...form, family: e.target.value })} /></label>
              <label className="mc-full">Địa chỉ vãng gia<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
              <label className="mc-full">Kết quả vãng gia<textarea required value={form.visitResult} onChange={(e) => setForm({ ...form, visitResult: e.target.value })} /></label>
              <div className="mc-full">
                <h3>Giấy tờ pháp lý</h3>
                <div className="mc-checklist">
                  {documentOptions.map((doc) => (
                    <label key={doc}><input type="checkbox" checked={form.documents.includes(doc)} onChange={() => toggleDocument(doc)} /> {doc}</label>
                  ))}
                </div>
              </div>
              <div className="mc-actions mc-full">
                <button className="mc-btn" type="submit">Lưu hồ sơ & chuyển xử lý</button>
              </div>
            </form>
          </div>

          <div className="mc-card">
            <h2>Danh sách hồ sơ</h2>
            <table className="mc-table">
              <thead><tr><th>Mã</th><th>Họ tên</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {data.cases.map((item) => (
                  <tr className="clickable" key={item.id} onClick={() => setSelectedId(item.id)}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td><span className={`mc-tag ${item.status === "CanBoSung" ? "warn" : item.status === "ChinhThuc" ? "good" : ""}`}>{statusLabels[item.status] || item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedCase && (
              <div className="mc-list-item" style={{ marginTop: "1rem" }}>
                <strong>{selectedCase.id} - {selectedCase.name}</strong>
                <p>{selectedCase.family}</p>
                <p><b>Vãng gia:</b> {selectedCase.visitResult}</p>
                <p><b>Giấy tờ:</b> {selectedCase.documents.join(", ") || "Chưa có"}</p>
                <div className="mc-actions">
                  <button className="mc-btn" onClick={() => updateSelectedStatus("ChoHoiDong", "Hồ sơ đã được chuyển sang hội đồng xét duyệt.")}>Chuyển hội đồng</button>
                  <button className="mc-btn secondary" onClick={() => updateSelectedStatus("CanBoSung", "Hồ sơ cần bổ sung giấy tờ trước khi xét duyệt.")}>Yêu cầu bổ sung</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default CaseIntakePage;
