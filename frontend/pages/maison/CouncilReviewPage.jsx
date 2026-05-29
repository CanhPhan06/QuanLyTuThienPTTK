import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { loadMaisonData, saveMaisonData, statusLabels } from "./maisonData";
import "./MaisonWorkflow.css";

const CouncilReviewPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const reviewable = data.cases.filter((item) => ["ChoHoiDong", "CanBoSung"].includes(item.status));
  const [selectedId, setSelectedId] = useState(reviewable[0]?.id || data.cases[0]?.id || "");
  const [votesFor, setVotesFor] = useState(4);
  const [votesTotal, setVotesTotal] = useState(5);
  const [minutes, setMinutes] = useState("Hội đồng đã xem xét hồ sơ, biên bản vãng gia và điều kiện hỗ trợ.");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const selectedCase = useMemo(
    () => data.cases.find((item) => item.id === selectedId) || data.cases[0],
    [data.cases, selectedId]
  );

  const persistCases = (cases) => {
    const nextData = { ...data, cases };
    setData(nextData);
    saveMaisonData(nextData);
  };

  const decide = (decision) => {
    if (!selectedCase) return;
    if (!minutes.trim()) {
      setModal({ isOpen: true, title: "Thiếu biên bản", message: "Cần nhập biên bản họp trước khi lưu kết quả.", type: "error" });
      return;
    }

    const nextStatus = decision === "approve" ? "ChinhThuc" : decision === "reject" ? "TuChoi" : "CanBoSung";
    const nextNote = decision === "approve"
      ? `Đạt ${votesFor}/${votesTotal} phiếu đồng thuận, chuyển thành thành viên chính thức.`
      : decision === "reject"
        ? `Không đạt biểu quyết hoặc không phù hợp tiêu chí: ${minutes}`
        : `Hội đồng yêu cầu bổ sung: ${minutes}`;

    persistCases(data.cases.map((item) =>
      item.id === selectedCase.id
        ? { ...item, status: nextStatus, votesFor, votesTotal, note: nextNote, councilMinutes: minutes }
        : item
    ));
    setModal({ isOpen: true, title: "Đã lưu kết quả hội đồng", message: nextNote, type: decision === "approve" ? "success" : "warning" });
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC2 - Hội đồng / Ban giám đốc</span>
            <h1>Xét duyệt trạng thái thành viên</h1>
            <p>Kiểm tra hồ sơ vãng gia, nhập biểu quyết và ra quyết định chính thức.</p>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "admin"} - Ban giám đốc</strong></div>
        </header>

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Hồ sơ chờ hội đồng</h2>
            <table className="mc-table">
              <thead><tr><th>Mã hồ sơ</th><th>Đối tượng</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
              <tbody>
                {data.cases.map((item) => (
                  <tr className="clickable" key={item.id} onClick={() => setSelectedId(item.id)}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td><span className={`mc-tag ${item.status === "ChinhThuc" ? "good" : item.status === "TuChoi" ? "bad" : item.status === "CanBoSung" ? "warn" : ""}`}>{statusLabels[item.status] || item.status}</span></td>
                    <td>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mc-card">
            <h2>Biểu quyết hội đồng</h2>
            {selectedCase ? (
              <>
                <div className="mc-alert">
                  <b>{selectedCase.id} - {selectedCase.name}</b><br />
                  {selectedCase.visitResult}
                </div>
                <div className="mc-form">
                  <label>Số phiếu đồng ý<input type="number" min="0" value={votesFor} onChange={(e) => setVotesFor(Number(e.target.value))} /></label>
                  <label>Tổng số phiếu<input type="number" min="1" value={votesTotal} onChange={(e) => setVotesTotal(Number(e.target.value))} /></label>
                  <label className="mc-full">Biên bản họp<textarea value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
                </div>
                <div className="mc-list">
                  <div className="mc-list-item"><strong>Giấy tờ pháp lý</strong><p>{selectedCase.documents.join(", ") || "Chưa có giấy tờ"}</p></div>
                  <div className="mc-list-item"><strong>Quy tắc duyệt</strong><p>Đạt khi số phiếu đồng ý từ 50% trở lên và hồ sơ không thiếu giấy tờ cốt lõi.</p></div>
                </div>
                <div className="mc-actions">
                  <button className="mc-btn success" onClick={() => decide("approve")}>Phê duyệt chính thức</button>
                  <button className="mc-btn secondary" onClick={() => decide("supplement")}>Yêu cầu bổ sung</button>
                  <button className="mc-btn danger" onClick={() => decide("reject")}>Từ chối</button>
                </div>
              </>
            ) : <p>Không có hồ sơ.</p>}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default CouncilReviewPage;
