import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { formatMoney, loadMaisonData, nextId, saveMaisonData, statusLabels } from "./maisonData";
import "./MaisonWorkflow.css";

const validateExpense = (expense) => {
  const errors = [];
  if (!expense.content?.trim()) errors.push("Thiếu nội dung chi.");
  if (!expense.requester?.trim()) errors.push("Thiếu người đề nghị.");
  if (!Number.isFinite(Number(expense.amount)) || Number(expense.amount) <= 0) errors.push("Số tiền phải lớn hơn 0.");
  if ((!expense.evidence?.trim() || expense.evidence.trim().length < 6) && !expense.evidenceImage) errors.push("Chứng từ/giải trình chưa đủ để ghi sổ.");
  return errors;
};

const validateExpenseSubmit = (expense) => {
  const errors = [];
  if (!expense.content?.trim()) errors.push("Thiếu nội dung chi.");
  if (!Number.isFinite(Number(expense.amount)) || Number(expense.amount) <= 0) errors.push("Số tiền phải lớn hơn 0.");
  return errors;
};

const evidenceLabel = (item) => {
  const text = item.evidence?.trim();
  const imageName = item.evidenceImageName?.trim();
  if (text && imageName) return `${text} (${imageName})`;
  return text || imageName || "Chưa gửi minh chứng";
};

const ExpenseApprovalPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [form, setForm] = useState({ content: "", amount: 500000, requester: user?.HoTen || "", evidence: "", evidenceImage: "", evidenceImageName: "", status: "ChoKeToan" });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });
  const isAdmin = ["AdminKeToan", "BanQuanLy"].includes(user?.VaiTro);
  const isExecutive = user?.VaiTro === "BanDieuHanh";
  const isStaff = user?.VaiTro === "NhanVien" || !user?.VaiTro;

  const totals = useMemo(() => ({
    pending: data.expenses.filter((item) => item.status !== "DaPheDuyet" && item.status !== "TuChoiChi").length,
    approved: data.expenses.filter((item) => item.status === "DaPheDuyet").reduce((sum, item) => sum + Number(item.amount || 0), 0)
  }), [data.expenses]);

  const persist = (nextData) => {
    setData(nextData);
    saveMaisonData(nextData);
  };

  const attachEvidenceImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, evidenceImage: String(reader.result || ""), evidenceImageName: file.name }));
    reader.readAsDataURL(file);
  };

  const createExpense = (event) => {
    event.preventDefault();
    const requester = form.requester?.trim() || user?.HoTen || "Nhan vien";
    const expense = { id: nextId("CT", data.expenses), ...form, requester, amount: Number(form.amount), accountantNote: "", directorNote: "", isRecorded: false, history: [`${requester} gui yeu cau chi cho ke toan kiem tra.`] };
    const errors = validateExpenseSubmit(expense);
    if (errors.length > 0) {
      setModal({ isOpen: true, title: "Chưa đủ thông tin tối thiểu", message: errors.join("\n"), type: "warning" });
      return;
    }
    persist({ ...data, expenses: [expense, ...data.expenses] });
    setSelectedExpense(expense);
    setActiveForm(null);
    setModal({ isOpen: true, title: "Đã gửi yêu cầu chi", message: "Phiếu mới nằm ở hàng chờ, chưa ghi vào sổ chi cho đến khi kế toán kiểm tra hợp lệ.", type: "success" });
  };

  const updateStatus = (id, patch, note) => {
    const nextExpenses = data.expenses.map((item) => item.id === id ? { ...item, ...patch, history: [note, ...(item.history || [])] } : item);
    persist({
      ...data,
      expenses: nextExpenses
    });
    setSelectedExpense(nextExpenses.find((item) => item.id === id) || selectedExpense);
  };

  const recordExpense = (item) => {
    const errors = validateExpense(item);
    if (errors.length > 0) {
      setModal({ isOpen: true, title: "Không thể ghi sổ", message: errors.join("\n"), type: "warning" });
      return;
    }
    updateStatus(item.id, {
      status: "ChoBGD",
      accountantNote: "Chứng từ hợp lệ, đã ghi nhận vào sổ chi chờ phê duyệt.",
      isRecorded: true,
      recordedAt: new Date().toISOString().slice(0, 10)
    }, "Kế toán kiểm tra hợp lệ và ghi vào sổ chi.");
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      {activeForm === "expense" && (
        <div className="mc-detail-overlay" role="dialog" aria-modal="true" onClick={() => setActiveForm(null)}>
          <section className="mc-detail-panel mc-detail-dialog mc-form-dialog" onClick={(event) => event.stopPropagation()}>
            <button className="mc-modal-close" type="button" onClick={() => setActiveForm(null)} aria-label="Đóng cửa sổ nhập">×</button>
            <h2>Lập yêu cầu đề nghị chi</h2>
            <form className="mc-form" onSubmit={createExpense}>
              <label className="mc-full">Nội dung chi<input required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
              <label>Số tiền<input type="number" min="1000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
              <label>Người đề nghị<input value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} /></label>
              <label className="mc-full">Minh chứng<textarea value={form.evidence} placeholder="Nhập hóa đơn, báo giá, lý do hoặc ghi chú kiểm tra." onChange={(e) => setForm({ ...form, evidence: e.target.value })} /></label>
              <label>Ảnh minh chứng<input type="file" accept="image/*" onChange={attachEvidenceImage} /></label>
              {form.evidenceImageName && <div className="mc-file-chip">{form.evidenceImageName}</div>}
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi yêu cầu cho kế toán</button></div>
            </form>
          </section>
        </div>
      )}
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">Maison Chance</span>
            <h1>Phiếu chi chờ xử lý</h1>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "admin"} - Kế toán/BGĐ</strong></div>
        </header>

        <section className="mc-kpi-grid">
          <div className="mc-kpi"><strong>{data.expenses.length}</strong><span>Phiếu chi</span></div>
          <div className="mc-kpi"><strong>{totals.pending}</strong><span>Đang chờ xử lý</span></div>
          <div className="mc-kpi"><strong>{formatMoney(totals.approved)}</strong><span>Đã phê duyệt</span></div>
          <div className="mc-kpi"><strong>2 cấp</strong><span>Kế toán + BGĐ</span></div>
        </section>

        <section className="mc-grid">
          <div className="mc-card">
            <div className="mc-section-title">
              <h2>Lập yêu cầu đề nghị chi</h2>
              {isStaff && <button className="mc-btn" type="button" onClick={() => setActiveForm("expense")}>Lập phiếu chi</button>}
            </div>
            {false && isStaff && <form className="mc-form" onSubmit={createExpense}>
              <label className="mc-full">Nội dung chi<input required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
              <label>Số tiền<input type="number" min="1000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
              <label>Người đề nghị<input value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} /></label>
              <label className="mc-full">Minh chứng<textarea value={form.evidence} placeholder="Nhập hóa đơn, báo giá, lý do hoặc ghi chú kiểm tra." onChange={(e) => setForm({ ...form, evidence: e.target.value })} /></label>
              <label>Ảnh minh chứng<input type="file" accept="image/*" onChange={attachEvidenceImage} /></label>
              {form.evidenceImageName && <div className="mc-file-chip">{form.evidenceImageName}</div>}
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi yêu cầu cho kế toán</button></div>
            </form>}
            {!isStaff && <div className="mc-alert">Tài khoản kế toán/ban điều hành chỉ kiểm tra và xử lý yêu cầu đã gửi, không nhập thẳng khoản chi vào sổ.</div>}
          </div>
        </section>

        <section className="mc-card mc-list-panel">
          <h2>Danh sách phiếu chi</h2>
          <table className="mc-table">
            <thead><tr><th>Mã</th><th>Nội dung</th><th>Số tiền</th><th>Người đề nghị</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
            <tbody>
              {data.expenses.map((item) => (
                <tr key={item.id} className="clickable" onClick={() => setSelectedExpense(item)}>
                  <td>{item.id}</td><td>{item.content}<br /><small>{evidenceLabel(item)}</small></td><td>{formatMoney(item.amount)}</td><td>{item.requester}</td>
                  <td><span className={`mc-tag ${item.status === "DaPheDuyet" ? "good" : item.status === "TuChoiChi" ? "bad" : "warn"}`}>{statusLabels[item.status] || item.status}</span></td>
                  <td className="mc-two-actions" onClick={(event) => event.stopPropagation()}>
                    {isAdmin && item.status === "ChoKeToan" && <button className="mc-btn secondary" onClick={() => recordExpense(item)}>Kiểm tra hợp lệ & ghi sổ</button>}
                    {isAdmin && item.status === "ChoKeToan" && <button className="mc-btn danger" onClick={() => updateStatus(item.id, { status: "CanChinhSua", accountantNote: "Dữ liệu chưa hợp lệ, chưa ghi sổ.", isRecorded: false }, "Kế toán yêu cầu bổ sung chứng từ.")}>Không hợp lệ</button>}
                    {isExecutive && item.status === "ChoBGD" && <button className="mc-btn success" onClick={() => updateStatus(item.id, { status: "DaPheDuyet", directorNote: "BGĐ đã phê duyệt" }, "Ban điều hành phê duyệt phiếu chi.")}>Phê duyệt</button>}
                    {isExecutive && item.status === "ChoBGD" && <button className="mc-btn danger" onClick={() => updateStatus(item.id, { status: "TuChoiChi", directorNote: "Không đủ điều kiện xử lý" }, "Ban điều hành từ chối phiếu chi.")}>Từ chối</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {selectedExpense && (
          <div className="mc-detail-overlay" role="dialog" aria-modal="true" onClick={() => setSelectedExpense(null)}>
          <section className="mc-detail-panel mc-detail-dialog" onClick={(event) => event.stopPropagation()}>
            <button className="mc-modal-close" type="button" onClick={() => setSelectedExpense(null)} aria-label="Đóng cửa sổ chi tiết">×</button>
            <h2>Chi tiết yêu cầu</h2>
            <div className={selectedExpense.history?.length > 0 ? "mc-detail-split" : "mc-detail-single"}>
            <div className="mc-detail-main">
            <div className="mc-detail-list">
              <div><span>Mã phiếu</span><strong>{selectedExpense.id}</strong></div>
              <div><span>Nội dung chi</span><strong>{selectedExpense.content}</strong></div>
              <div><span>Số tiền</span><strong>{formatMoney(selectedExpense.amount)}</strong></div>
              <div><span>Người đề nghị</span><strong>{selectedExpense.requester}</strong></div>
              <div><span>Minh chứng</span><strong>{evidenceLabel(selectedExpense)}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabels[selectedExpense.status] || selectedExpense.status}</strong></div>
              <div><span>Ý kiến kế toán</span><strong>{selectedExpense.accountantNote || "Chưa xử lý"}</strong></div>
              <div><span>Ý kiến Ban điều hành</span><strong>{selectedExpense.directorNote || "Chưa xử lý"}</strong></div>
            </div>
            {selectedExpense.evidenceImage && (
              <div className="mc-evidence-preview">
                <span>Ảnh minh chứng</span>
                <img src={selectedExpense.evidenceImage} alt={selectedExpense.evidenceImageName || "Ảnh minh chứng"} />
                {selectedExpense.evidenceImageName && <strong>{selectedExpense.evidenceImageName}</strong>}
              </div>
            )}
            </div>
            {selectedExpense.history?.length > 0 && (
              <div className="mc-history mc-history-panel">
                <h3>Lưu vết xử lý</h3>
                {selectedExpense.history.map((entry, index) => <p key={`${entry}-${index}`}>{entry}</p>)}
              </div>
            )}
            </div>
          </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExpenseApprovalPage;
