import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { formatMoney, loadMaisonData, nextId, saveMaisonData, today } from "./maisonData";
import "./MaisonWorkflow.css";

const ReconciliationReportPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [bankLine, setBankLine] = useState({ sender: "", amount: 1000000, date: today() });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const report = useMemo(() => {
    const income = data.donations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const approvedExpense = data.expenses.filter((item) => item.status === "DaPheDuyet").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const mismatches = data.bankLines.filter((item) => item.status !== "Khop").length;
    return { income, approvedExpense, balance: income - approvedExpense, mismatches };
  }, [data]);

  const persist = (nextData) => {
    setData(nextData);
    saveMaisonData(nextData);
  };

  const addBankLine = (event) => {
    event.preventDefault();
    const matched = data.donations.find((item) => Number(item.amount) === Number(bankLine.amount) && bankLine.sender.toLowerCase().includes(item.donorName.toLowerCase().split(" ")[0]));
    const line = {
      id: nextId("BK", data.bankLines),
      ...bankLine,
      amount: Number(bankLine.amount),
      status: matched ? "Khop" : "Cho xac minh",
      donationId: matched?.id || ""
    };
    persist({ ...data, bankLines: [line, ...data.bankLines] });
    setModal({ isOpen: true, title: "Đã nhập sao kê", message: matched ? "Giao dịch đã khớp với sổ vàng." : "Giao dịch chưa khớp, cần kế toán xác minh.", type: matched ? "success" : "warning" });
  };

  const markMatched = (id) => {
    persist({ ...data, bankLines: data.bankLines.map((item) => item.id === id ? { ...item, status: "Khop" } : item) });
  };

  const exportReport = () => {
    const lines = [
      "Bao cao quan tri Maison Chance",
      `Tong thu,${report.income}`,
      `Tong chi da phe duyet,${report.approvedExpense}`,
      `So du,${report.balance}`,
      `Giao dich chen lech,${report.mismatches}`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-maison-chance.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC8 - Kế toán / Ban giám đốc</span>
            <h1>Đối soát tài chính & xuất báo cáo quản trị</h1>
            <p>Nhập sao kê, so khớp sổ vàng, đánh dấu chênh lệch và xuất báo cáo thu chi.</p>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "admin"} - Kế toán/BGĐ</strong></div>
        </header>

        <section className="mc-kpi-grid">
          <div className="mc-kpi"><strong>{formatMoney(report.income)}</strong><span>Tổng thu ghi sổ</span></div>
          <div className="mc-kpi"><strong>{formatMoney(report.approvedExpense)}</strong><span>Tổng chi đã duyệt</span></div>
          <div className="mc-kpi"><strong>{formatMoney(report.balance)}</strong><span>Số dư</span></div>
          <div className="mc-kpi"><strong>{report.mismatches}</strong><span>Chênh lệch</span></div>
        </section>

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Nhập sao kê ngân hàng</h2>
            <form className="mc-form" onSubmit={addBankLine}>
              <label>Người gửi / Nội dung<input required value={bankLine.sender} onChange={(e) => setBankLine({ ...bankLine, sender: e.target.value })} /></label>
              <label>Số tiền<input type="number" min="1" value={bankLine.amount} onChange={(e) => setBankLine({ ...bankLine, amount: e.target.value })} /></label>
              <label>Ngày giao dịch<input type="date" value={bankLine.date} onChange={(e) => setBankLine({ ...bankLine, date: e.target.value })} /></label>
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Đối soát giao dịch</button><button className="mc-btn secondary" type="button" onClick={exportReport}>Xuất Excel/CSV</button></div>
            </form>
          </div>

          <div className="mc-card">
            <h2>Báo cáo quản trị</h2>
            <div className="mc-list">
              <div className="mc-list-item"><strong>Minh bạch nguồn thu</strong><p>Mỗi khoản đóng góp được nối với phiếu sổ vàng và nhà hảo tâm.</p></div>
              <div className="mc-list-item"><strong>Kiểm soát chi</strong><p>Chỉ khoản chi đã qua phê duyệt mới xuất hiện trong báo cáo chi.</p></div>
              <div className="mc-list-item"><strong>Chênh lệch</strong><p>Giao dịch chưa khớp được giữ trạng thái chờ xác minh.</p></div>
            </div>
          </div>
        </section>

        <section className="mc-card">
          <h2>Kết quả đối soát</h2>
          <table className="mc-table">
            <thead><tr><th>Mã</th><th>Người gửi</th><th>Số tiền</th><th>Ngày</th><th>Khớp phiếu</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {data.bankLines.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.sender}</td><td>{formatMoney(item.amount)}</td><td>{item.date}</td><td>{item.donationId || "Chưa xác định"}</td>
                  <td><span className={`mc-tag ${item.status === "Khop" ? "good" : "warn"}`}>{item.status}</span></td>
                  <td>{item.status !== "Khop" && <button className="mc-btn secondary" onClick={() => markMatched(item.id)}>Xác nhận khớp</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </MainLayout>
  );
};

export default ReconciliationReportPage;
