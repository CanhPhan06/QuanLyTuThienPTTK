import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import "./ConcurrencyDemoPage.css";

const API = "http://localhost:3000/api/concurrency-demo";

const scenarios = [
  {
    id: "lost",
    title: "Lost Update",
    desc: "Hai phiên cùng đọc số dư chiến dịch. Phiên sau ghi lại dựa trên dữ liệu cũ nên làm mất kết quả của phiên trước.",
    steps: [
      ["Reset dữ liệu", "POST", "/reset"],
      ["S1 bắt đầu", "POST", "/begin/s1"],
      ["S2 bắt đầu", "POST", "/begin/s2"],
      ["S1 đọc số dư", "POST", "/lost-update/read/s1"],
      ["S2 đọc số dư", "POST", "/lost-update/read/s2"],
      ["S1 cộng 50", "POST", "/lost-update/write/s1", { delta: 50 }],
      ["S1 commit", "POST", "/commit/s1"],
      ["S2 trừ 30 theo dữ liệu cũ", "POST", "/lost-update/write/s2", { delta: -30 }],
      ["S2 commit", "POST", "/commit/s2"],
    ],
  },
  {
    id: "non-repeat",
    title: "Non-repeatable Read",
    desc: "Phiên 1 đọc một quy định. Phiên 2 sửa và commit. Phiên 1 đọc lại thấy giá trị thay đổi.",
    steps: [
      ["Reset dữ liệu", "POST", "/reset"],
      ["S1 bắt đầu", "POST", "/begin/s1"],
      ["S2 bắt đầu", "POST", "/begin/s2"],
      ["S1 đọc lần 1", "POST", "/non-repeatable/read/s1"],
      ["S2 sửa quy định thành 30", "POST", "/non-repeatable/update/s2", { value: 30 }],
      ["S2 commit", "POST", "/commit/s2"],
      ["S1 đọc lần 2", "POST", "/non-repeatable/read/s1"],
      ["S1 rollback", "POST", "/rollback/s1"],
    ],
  },
  {
    id: "phantom",
    title: "Phantom Read",
    desc: "Phiên 1 đếm số TNV trong chiến dịch. Phiên 2 thêm TNV mới và commit. Phiên 1 đếm lại thấy xuất hiện dòng mới.",
    steps: [
      ["Reset dữ liệu", "POST", "/reset"],
      ["S1 bắt đầu", "POST", "/begin/s1"],
      ["S2 bắt đầu", "POST", "/begin/s2"],
      ["S1 đếm lần 1", "POST", "/phantom/count/s1"],
      ["S2 thêm TNV", "POST", "/phantom/insert/s2"],
      ["S2 commit", "POST", "/commit/s2"],
      ["S1 đếm lần 2", "POST", "/phantom/count/s1"],
      ["S1 rollback", "POST", "/rollback/s1"],
    ],
  },
  {
    id: "deadlock",
    title: "Deadlock",
    desc: "Hai phiên khóa hai dòng theo thứ tự ngược nhau. Khi mỗi phiên chờ dòng còn lại, Oracle phát hiện deadlock.",
    steps: [
      ["Reset dữ liệu", "POST", "/reset"],
      ["Chạy deadlock", "POST", "/deadlock/run"],
    ],
  },
];

function ConcurrencyDemoPage() {
  const [active, setActive] = useState(scenarios[0].id);
  const [log, setLog] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenario = scenarios.find((item) => item.id === active);

  const appendLog = (text, type = "info") => {
    setLog((prev) => [
      { time: new Date().toLocaleTimeString("vi-VN"), text, type },
      ...prev,
    ]);
  };

  const callStep = async (label, method, path, body) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Thao tác thất bại.");
      appendLog(`${label}: ${data.message}`, "success");
      if (data.details) {
        data.details.forEach((item) => appendLog(item, item.includes("ORA-") ? "warning" : "info"));
      }
      if (data.snapshot) setSnapshot(data.snapshot);
    } catch (err) {
      appendLog(`${label}: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshot = async () => {
    try {
      const response = await fetch(`${API}/snapshot`);
      const data = await response.json();
      if (data.snapshot) setSnapshot(data.snapshot);
    } catch {
      appendLog("Không tải được dữ liệu demo. Kiểm tra backend và Oracle.", "error");
    }
  };

  useEffect(() => {
    loadSnapshot();
  }, []);

  return (
    <MainLayout>
      <div className="concurrency-page">
        <div className="concurrency-header">
          <div>
            <h1>Demo giao tác đồng thời</h1>
            <p>Minh họa Lost Update, Non-repeatable Read, Phantom Read và Deadlock trên giao diện.</p>
          </div>
          <button
            className="primary-action"
            disabled={loading}
            onClick={() => callStep("Reset dữ liệu", "POST", "/reset")}
          >
            Reset dữ liệu demo
          </button>
        </div>

        <div className="scenario-tabs">
          {scenarios.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => {
                setActive(item.id);
                setLog([]);
              }}
            >
              {item.title}
            </button>
          ))}
        </div>

        <section className="scenario-panel">
          <div className="scenario-info">
            <h2>{scenario.title}</h2>
            <p>{scenario.desc}</p>
          </div>
          <div className="step-grid">
            {scenario.steps.map(([label, method, path, body], index) => (
              <button
                key={`${scenario.id}-${path}-${index}`}
                disabled={loading}
                onClick={() => callStep(label, method, path, body)}
              >
                <span>{index + 1}</span>
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="demo-content-grid">
          <section className="snapshot-panel">
            <div className="panel-heading">
              <h2>Dữ liệu hiện tại</h2>
              <button disabled={loading} onClick={loadSnapshot}>Tải lại</button>
            </div>
            <div className="metric-row">
              <div>
                <span>Số TNV active</span>
                <strong>{snapshot?.activeMembers ?? "-"}</strong>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên dữ liệu</th>
                  <th>Giá trị</th>
                  <th>Nhóm</th>
                </tr>
              </thead>
              <tbody>
                {(snapshot?.items || []).map((item) => (
                  <tr key={item.ID}>
                    <td>{item.ID}</td>
                    <td>{item.TEN}</td>
                    <td>{item.GIA_TRI}</td>
                    <td>{item.NHOM}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="log-panel">
            <div className="panel-heading">
              <h2>Nhật ký xử lý</h2>
              <button onClick={() => setLog([])}>Xóa log</button>
            </div>
            <div className="log-list">
              {log.length === 0 ? (
                <p className="empty-log">Chưa có thao tác.</p>
              ) : (
                log.map((item, index) => (
                  <div className={`log-item ${item.type}`} key={`${item.time}-${index}`}>
                    <span>{item.time}</span>
                    <p>{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

export default ConcurrencyDemoPage;
