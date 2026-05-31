import React, { useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { formatMoney, loadMaisonData, nextId, saveMaisonData, statusLabels, today } from "./maisonData";
import "./MaisonWorkflow.css";

const PIE_COLORS = ["#0d6b68", "#f58220", "#2f80ed", "#9b51e0", "#27ae60", "#dc3545", "#64748b"];

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const isRecordedDonation = (item) => ["DaGhiSo", "ChoNhapKho"].includes(item.status) || item.isRecorded;
const isApprovedExpense = (item) => item.status === "DaPheDuyet";

const statusCount = (items, status) => items.filter((item) => item.status === status).length;
const sumAmount = (items) => items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

const chartMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;
const displayStatus = (status) => statusLabels[status] || status || "Chưa cập nhật";

const groupBy = (items, getKey, getValue = () => 1) => Object.values(items.reduce((map, item) => {
  const key = getKey(item) || "Chưa phân loại";
  map[key] = map[key] || { name: key, value: 0 };
  map[key].value += Number(getValue(item) || 0);
  return map;
}, {}));

const findExpenseProject = (expense) => {
  const text = `${expense.content || ""} ${expense.department || ""}`.toLowerCase();
  if (text.includes("may") || text.includes("vải") || text.includes("vai")) return "Lop may can ban";
  if (text.includes("khám") || text.includes("kham") || text.includes("y tế") || text.includes("y te")) return "Tai kham dinh ky";
  if (text.includes("dinh duong") || text.includes("dinh dưỡng")) return "Dinh duong tre em";
  return expense.department || "Vận hành chung";
};

const makeBarData = (labels, datasets) => ({ labels, datasets });

const makePieData = (items) => ({
  labels: items.map((item) => item.name),
  datasets: [{
    data: items.map((item) => item.value),
    backgroundColor: items.map((item, index) => PIE_COLORS[index % PIE_COLORS.length])
  }]
});

const ReconciliationReportPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [bankLine, setBankLine] = useState({ sender: "", amount: 1000000, date: today() });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

  const role = user?.VaiTro || "NhanVien";
  const canManageFinance = ["AdminKeToan", "BanQuanLy"].includes(role);
  const canSeeFullReport = ["AdminKeToan", "BanQuanLy", "BanDieuHanh"].includes(role);

  const report = useMemo(() => {
    const recordedDonations = data.donations.filter(isRecordedDonation);
    const pendingDonations = data.donations.filter((item) => item.status === "ChoKeToanXacNhan");
    const approvedExpenses = data.expenses.filter(isApprovedExpense);
    const accountingExpenses = data.expenses.filter((item) => item.status === "ChoKeToan");
    const executiveExpenses = data.expenses.filter((item) => item.status === "ChoBGD");
    const waitingCases = data.cases.filter((item) => item.status === "ChoHoiDong");
    const officialCases = data.cases.filter((item) => item.status === "ChinhThuc");
    const waitingAssignments = data.assignments.filter((item) => item.status === "Cho xac nhan");
    const confirmedAssignments = data.assignments.filter((item) => item.status === "Da xac nhan");
    const lowStock = data.inventory.materials.filter((item) => Number(item.stock) < Number(item.minStock));
    const bankMismatches = data.bankLines.filter((item) => item.status !== "Khop");

    const income = sumAmount(recordedDonations);
    const committedDonation = sumAmount(data.donations);
    const approvedExpense = sumAmount(approvedExpenses);
    const pendingExpenseValue = sumAmount([...accountingExpenses, ...executiveExpenses]);

    return {
      income,
      committedDonation,
      approvedExpense,
      pendingExpenseValue,
      balance: income - approvedExpense,
      recordedDonations,
      pendingDonations,
      approvedExpenses,
      accountingExpenses,
      executiveExpenses,
      waitingCases,
      officialCases,
      waitingAssignments,
      confirmedAssignments,
      lowStock,
      bankMismatches
    };
  }, [data]);

  const financialChart = [
    { name: "Đóng góp đã ghi sổ", value: report.income },
    { name: "Cam kết quyên góp", value: report.committedDonation },
    { name: "Chi đã phê duyệt", value: report.approvedExpense },
    { name: "Chi đang chờ", value: report.pendingExpenseValue },
    { name: "Số dư", value: report.balance }
  ];

  const workflowChart = [
    { actor: "Nhân viên", choXuLy: report.waitingCases.length + statusCount(data.expenses, "CanChinhSua"), hoanTat: data.cases.length - report.waitingCases.length },
    { actor: "Kế toán", choXuLy: report.accountingExpenses.length + report.pendingDonations.length + report.bankMismatches.length, hoanTat: report.recordedDonations.length },
    { actor: "Ban điều hành", choXuLy: report.executiveExpenses.length + report.waitingCases.length, hoanTat: statusCount(data.expenses, "DaPheDuyet") + report.officialCases.length },
    { actor: "TNV", choXuLy: report.waitingAssignments.length, hoanTat: report.confirmedAssignments.length },
    { actor: "Nhà tài trợ", choXuLy: report.pendingDonations.length, hoanTat: report.recordedDonations.length }
  ];

  const donationMix = Object.values(data.donations.reduce((map, item) => {
    const key = item.kind || "Khác";
    map[key] = map[key] || { name: key, value: 0 };
    map[key].value += Number(item.amount || 0);
    return map;
  }, {}));

  const monthlySeries = data.donations.reduce((map, item) => {
    const month = String(item.date || today()).slice(0, 7);
    map[month] = map[month] || { month, income: 0, expense: 0 };
    map[month].income += isRecordedDonation(item) ? Number(item.amount || 0) : 0;
    return map;
  }, {});

  data.expenses.forEach((item) => {
    const month = String(item.recordedAt || today()).slice(0, 7);
    monthlySeries[month] = monthlySeries[month] || { month, income: 0, expense: 0 };
    monthlySeries[month].expense += isApprovedExpense(item) ? Number(item.amount || 0) : 0;
  });

  const monthlyChart = Object.values(monthlySeries).sort((a, b) => a.month.localeCompare(b.month));

  const projectMap = {};
  data.donations.forEach((item) => {
    const key = item.project || "Chưa phân loại";
    projectMap[key] = projectMap[key] || { name: key, income: 0, expense: 0, donors: new Set(), records: 0 };
    projectMap[key].income += Number(item.amount || 0);
    projectMap[key].donors.add(item.donorName || item.donorId || "Ẩn danh");
    projectMap[key].records += 1;
  });
  data.expenses.forEach((item) => {
    const key = findExpenseProject(item);
    projectMap[key] = projectMap[key] || { name: key, income: 0, expense: 0, donors: new Set(), records: 0 };
    projectMap[key].expense += Number(item.amount || 0);
  });
  const projectStats = Object.values(projectMap)
    .map((item) => ({
      ...item,
      donorCount: item.donors.size,
      balance: item.income - item.expense
    }))
    .sort((a, b) => b.income - a.income);

  const donorStats = data.donors.map((donor) => {
    const donationTotal = data.donations
      .filter((item) => item.donorId === donor.id || item.donorName === donor.name)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      name: donor.name,
      value: Math.max(Number(donor.total || 0), donationTotal),
      donationCount: data.donations.filter((item) => item.donorId === donor.id || item.donorName === donor.name).length,
      interest: donor.interest || "Chưa phân loại"
    };
  }).sort((a, b) => b.value - a.value);

  const volunteerSkillStats = groupBy(data.volunteers, (item) => item.skill || "Chưa cập nhật");
  const volunteerAvailabilityStats = groupBy(data.volunteers, (item) => item.availability || "Chưa cập nhật");
  const assignmentStatusStats = groupBy(data.assignments, (item) => displayStatus(item.status));
  const caseStatusStats = groupBy(data.cases, (item) => displayStatus(item.status));
  const expenseStatusStats = groupBy(data.expenses, (item) => displayStatus(item.status), (item) => Number(item.amount || 0));
  const donationStatusStats = groupBy(data.donations, (item) => displayStatus(item.status), (item) => Number(item.amount || 0));
  const bankStatusStats = groupBy(data.bankLines, (item) => displayStatus(item.status));
  const inventoryRiskStats = data.inventory.materials.map((item) => ({
    name: item.name,
    stock: Number(item.stock || 0),
    minStock: Number(item.minStock || 0),
    shortage: Math.max(0, Number(item.minStock || 0) - Number(item.stock || 0))
  }));

  const objectCoverageStats = [
    { name: "Chiến dịch/Dự án", value: projectStats.length },
    { name: "Hồ sơ", value: data.cases.length },
    { name: "Nhà tài trợ", value: data.donors.length },
    { name: "Quyên góp", value: data.donations.length },
    { name: "Phiếu chi", value: data.expenses.length },
    { name: "TNV", value: data.volunteers.length },
    { name: "Kho", value: data.inventory.materials.length },
    { name: "Sao kê", value: data.bankLines.length }
  ];

  const moneyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label || context.label}: ${formatMoney(context.parsed?.y ?? context.parsed ?? context.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: chartMoney }
      }
    }
  };

  const countChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  const horizontalCountOptions = {
    ...countChartOptions,
    indexAxis: "y"
  };

  const horizontalMoneyOptions = {
    ...moneyChartOptions,
    indexAxis: "y",
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label || context.label}: ${formatMoney(context.parsed?.x ?? context.raw)}`
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatMoney(context.parsed)}`
        }
      }
    }
  };

  const countPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}`
        }
      }
    }
  };

  const financialBarData = {
    labels: financialChart.map((item) => item.name),
    datasets: [{
      label: "Giá trị",
      data: financialChart.map((item) => item.value),
      backgroundColor: financialChart.map((item, index) => PIE_COLORS[index % PIE_COLORS.length]),
      borderRadius: 6
    }]
  };

  const workflowBarData = {
    labels: workflowChart.map((item) => item.actor),
    datasets: [
      {
        label: "Chờ xử lý",
        data: workflowChart.map((item) => item.choXuLy),
        backgroundColor: "#f58220",
        borderRadius: 6
      },
      {
        label: "Hoàn tất / ghi nhận",
        data: workflowChart.map((item) => item.hoanTat),
        backgroundColor: "#0d6b68",
        borderRadius: 6
      }
    ]
  };

  const monthlyLineData = {
    labels: monthlyChart.map((item) => item.month),
    datasets: [
      {
        label: "Thu ghi sổ",
        data: monthlyChart.map((item) => item.income),
        borderColor: "#0d6b68",
        backgroundColor: "rgba(13, 107, 104, 0.12)",
        tension: 0.35
      },
      {
        label: "Chi đã duyệt",
        data: monthlyChart.map((item) => item.expense),
        borderColor: "#dc3545",
        backgroundColor: "rgba(220, 53, 69, 0.12)",
        tension: 0.35
      }
    ]
  };

  const donationPieData = {
    labels: donationMix.map((item) => item.name),
    datasets: [{
      data: donationMix.map((item) => item.value),
      backgroundColor: donationMix.map((item, index) => PIE_COLORS[index % PIE_COLORS.length])
    }]
  };

  const projectPerformanceData = makeBarData(projectStats.map((item) => item.name), [
    {
      label: "Quyên góp",
      data: projectStats.map((item) => item.income),
      backgroundColor: "#0d6b68",
      borderRadius: 6
    },
    {
      label: "Chi phí",
      data: projectStats.map((item) => item.expense),
      backgroundColor: "#dc3545",
      borderRadius: 6
    }
  ]);

  const donorRankingData = makeBarData(donorStats.slice(0, 6).map((item) => item.name), [{
    label: "Tổng đóng góp",
    data: donorStats.slice(0, 6).map((item) => item.value),
    backgroundColor: "#2f80ed",
    borderRadius: 6
  }]);

  const volunteerSkillData = makeBarData(volunteerSkillStats.map((item) => item.name), [{
    label: "Số tình nguyện viên",
    data: volunteerSkillStats.map((item) => item.value),
    backgroundColor: "#9b51e0",
    borderRadius: 6
  }]);

  const volunteerAvailabilityData = makePieData(volunteerAvailabilityStats);
  const assignmentStatusData = makePieData(assignmentStatusStats);
  const caseStatusData = makePieData(caseStatusStats);
  const expenseStatusData = makePieData(expenseStatusStats);
  const donationStatusData = makePieData(donationStatusStats);
  const bankStatusData = makePieData(bankStatusStats);
  const objectCoverageData = makeBarData(objectCoverageStats.map((item) => item.name), [{
    label: "Số bản ghi",
    data: objectCoverageStats.map((item) => item.value),
    backgroundColor: objectCoverageStats.map((item, index) => PIE_COLORS[index % PIE_COLORS.length]),
    borderRadius: 6
  }]);

  const inventoryRiskData = makeBarData(inventoryRiskStats.map((item) => item.name), [
    {
      label: "Tồn kho",
      data: inventoryRiskStats.map((item) => item.stock),
      backgroundColor: "#0d6b68",
      borderRadius: 6
    },
    {
      label: "Định mức tối thiểu",
      data: inventoryRiskStats.map((item) => item.minStock),
      backgroundColor: "#f58220",
      borderRadius: 6
    },
    {
      label: "Thiếu hụt",
      data: inventoryRiskStats.map((item) => item.shortage),
      backgroundColor: "#dc3545",
      borderRadius: 6
    }
  ]);

  const actorCards = [
    {
      actor: "Admin / Kế toán",
      count: report.accountingExpenses.length + report.pendingDonations.length + report.bankMismatches.length,
      label: "yêu cầu cần kiểm tra",
      detail: "Kiểm tra phiếu chi, xác minh quyên góp, đối soát sao kê và chỉ ghi sổ khi dữ liệu hợp lệ."
    },
    {
      actor: "Nhân viên",
      count: data.cases.length + data.expenses.filter((item) => item.requester === user?.HoTen || canSeeFullReport).length,
      label: "hồ sơ / phiếu liên quan",
      detail: "Theo dõi hồ sơ vãng gia, đề nghị chi, bổ sung minh chứng khi kế toán hoặc hội đồng trả về."
    },
    {
      actor: "Ban điều hành",
      count: report.executiveExpenses.length + report.waitingCases.length,
      label: "quyết định chờ duyệt",
      detail: "Xem xét hồ sơ xã hội và phiếu chi đã qua kế toán trước khi phê duyệt chính thức."
    },
    {
      actor: "Tình nguyện viên",
      count: data.assignments.length,
      label: "lịch phân công",
      detail: "Theo dõi phân công theo kỹ năng, trạng thái xác nhận và lịch sử hỗ trợ."
    },
    {
      actor: "Nhà tài trợ",
      count: data.donations.length,
      label: "khoản đóng góp",
      detail: "Theo dõi khoản đã ghi sổ, khoản đang chờ kế toán kiểm tra và minh bạch nguồn hỗ trợ."
    }
  ];

  const persist = (nextData) => {
    const saved = saveMaisonData(nextData);
    setData(saved);
  };

  const addBankLine = (event) => {
    event.preventDefault();
    if (!canManageFinance) {
      setModal({ isOpen: true, title: "Không có quyền", message: "Chỉ Admin/Kế toán được nhập và xác nhận sao kê.", type: "warning" });
      return;
    }

    const matched = data.donations.find((item) => (
      Number(item.amount) === Number(bankLine.amount)
      && bankLine.sender.toLowerCase().includes(item.donorName.toLowerCase().split(" ")[0])
    ));

    const line = {
      id: nextId("BK", data.bankLines),
      ...bankLine,
      amount: Number(bankLine.amount),
      status: matched ? "Khop" : "Cho xac minh",
      donationId: matched?.id || ""
    };
    persist({ ...data, bankLines: [line, ...data.bankLines] });
    setBankLine({ sender: "", amount: 1000000, date: today() });
    setModal({
      isOpen: true,
      title: "Đã nhập sao kê",
      message: matched ? "Giao dịch đã khớp với sổ vàng." : "Giao dịch chưa khớp, cần kế toán xác minh.",
      type: matched ? "success" : "warning"
    });
  };

  const markMatched = (id) => {
    if (!canManageFinance) return;
    persist({ ...data, bankLines: data.bankLines.map((item) => item.id === id ? { ...item, status: "Khop" } : item) });
  };

  const exportReport = () => {
    const lines = [
      "Bao cao thong ke Maison Chance",
      `Ngay xuat,${today()}`,
      `Tong dong gop da ghi so,${report.income}`,
      `Tong cam ket quyen gop,${report.committedDonation}`,
      `Tong chi da phe duyet,${report.approvedExpense}`,
      `Chi dang cho xu ly,${report.pendingExpenseValue}`,
      `So du,${report.balance}`,
      `Ho so cho hoi dong,${report.waitingCases.length}`,
      `Yeu cau quyen gop cho ke toan,${report.pendingDonations.length}`,
      `Giao dich chenh lech,${report.bankMismatches.length}`,
      "",
      "Du an,Quyen gop,Chi phi,So du,Nha tai tro",
      ...projectStats.map((item) => `${item.name},${item.income},${item.expense},${item.balance},${item.donorCount}`),
      "",
      "Nha tai tro,Linh vuc,So khoan,Tong dong gop",
      ...donorStats.map((item) => `${item.name},${item.interest},${item.donationCount},${item.value}`),
      "",
      "Ma,Loai,Ten,So tien,Trang thai",
      ...data.donations.map((item) => `${item.id},Quyen gop,${item.donorName},${item.amount},${item.status}`),
      ...data.expenses.map((item) => `${item.id},Phieu chi,${item.content},${item.amount},${item.status}`)
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-thong-ke-maison-chance.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">Thống kê & báo cáo</span>
            <h1>Dashboard minh bạch vận hành Maison Chance</h1>
            <p>Theo dõi đầy đủ thu chi, hồ sơ, quyên góp, tình nguyện viên, kho và đối soát theo từng actor.</p>
          </div>
          <div className="mc-role-card">
            <span>Tài khoản xem báo cáo</span>
            <strong>{user?.HoTen || user?.TenDangNhap || "Người dùng"}</strong>
          </div>
        </header>

        <section className="mc-kpi-grid report-kpi-grid">
          <div className="mc-kpi"><strong>{formatMoney(report.income)}</strong><span>Đóng góp đã ghi sổ</span></div>
          <div className="mc-kpi"><strong>{formatMoney(report.approvedExpense)}</strong><span>Chi đã phê duyệt</span></div>
          <div className="mc-kpi"><strong>{formatMoney(report.balance)}</strong><span>Số dư minh bạch</span></div>
          <div className="mc-kpi"><strong>{report.bankMismatches.length}</strong><span>Giao dịch cần xác minh</span></div>
        </section>

        <section className="report-actor-grid">
          {actorCards.map((item) => (
            <article className="report-actor-card" key={item.actor}>
              <span>{item.actor}</span>
              <strong>{item.count}</strong>
              <small>{item.label}</small>
              <p>{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="report-chart-grid">
          <div className="mc-card report-chart-card">
            <h2>Tài chính tổng hợp</h2>
            <div className="report-chart-canvas">
              <Bar data={financialBarData} options={moneyChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Khối lượng theo actor</h2>
            <div className="report-chart-canvas">
              <Bar data={workflowBarData} options={countChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Thu chi theo tháng</h2>
            <div className="report-chart-canvas compact">
              <Line data={monthlyLineData} options={moneyChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Cơ cấu đóng góp</h2>
            <div className="report-chart-canvas compact">
              <Pie data={donationPieData} options={pieChartOptions} />
            </div>
          </div>
        </section>

        <section className="report-section-heading">
          <span>Đối tượng vận hành</span>
          <h2>Thống kê theo chiến dịch, nhà tài trợ, tình nguyện viên và hồ sơ</h2>
        </section>

        <section className="report-chart-grid report-chart-grid-wide">
          <div className="mc-card report-chart-card">
            <h2>Hiệu quả chiến dịch / dự án</h2>
            <div className="report-chart-canvas">
              <Bar data={projectPerformanceData} options={moneyChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Top nhà tài trợ</h2>
            <div className="report-chart-canvas">
              <Bar data={donorRankingData} options={horizontalMoneyOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Tình nguyện viên theo kỹ năng</h2>
            <div className="report-chart-canvas compact">
              <Bar data={volunteerSkillData} options={countChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Lịch rảnh tình nguyện viên</h2>
            <div className="report-chart-canvas compact">
              <Pie data={volunteerAvailabilityData} options={countPieOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Trạng thái hồ sơ xã hội</h2>
            <div className="report-chart-canvas compact">
              <Pie data={caseStatusData} options={countPieOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Trạng thái phân công TNV</h2>
            <div className="report-chart-canvas compact">
              <Pie data={assignmentStatusData} options={countPieOptions} />
            </div>
          </div>
        </section>

        <section className="report-section-heading">
          <span>Kiểm soát tài chính và rủi ro</span>
          <h2>Quyên góp, phiếu chi, sao kê, kho và độ phủ dữ liệu</h2>
        </section>

        <section className="report-chart-grid report-chart-grid-wide">
          <div className="mc-card report-chart-card">
            <h2>Quyên góp theo trạng thái</h2>
            <div className="report-chart-canvas compact">
              <Pie data={donationStatusData} options={pieChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Phiếu chi theo trạng thái</h2>
            <div className="report-chart-canvas compact">
              <Pie data={expenseStatusData} options={pieChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Sao kê đối soát</h2>
            <div className="report-chart-canvas compact">
              <Pie data={bankStatusData} options={countPieOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card">
            <h2>Rủi ro tồn kho</h2>
            <div className="report-chart-canvas compact">
              <Bar data={inventoryRiskData} options={countChartOptions} />
            </div>
          </div>

          <div className="mc-card report-chart-card report-span-2">
            <h2>Độ phủ dữ liệu toàn hệ thống</h2>
            <div className="report-chart-canvas compact">
              <Bar data={objectCoverageData} options={horizontalCountOptions} />
            </div>
          </div>
        </section>

        <section className="mc-card report-flow-card">
          <div className="mc-section-title">
            <div>
              <h2>Sơ đồ luồng báo cáo theo nghiệp vụ</h2>
            </div>
            <button className="mc-btn secondary" type="button" onClick={exportReport}>Xuất báo cáo CSV</button>
          </div>
          <div className="report-flow">
            <div><strong>Nhân viên</strong><span>Lập hồ sơ / phiếu chi</span></div>
            <i>→</i>
            <div><strong>Kế toán</strong><span>Kiểm tra chứng từ / ghi sổ</span></div>
            <i>→</i>
            <div><strong>Ban điều hành</strong><span>Duyệt hồ sơ / giải ngân</span></div>
            <i>→</i>
            <div><strong>Báo cáo</strong><span>Minh bạch thu chi, đối soát, lưu vết</span></div>
          </div>
          <div className="report-flow secondary-flow">
            <div><strong>Nhà tài trợ</strong><span>Gửi quyên góp + minh chứng</span></div>
            <i>→</i>
            <div><strong>Kế toán</strong><span>Xác minh sao kê / hiện vật</span></div>
            <i>→</i>
            <div><strong>Sổ vàng</strong><span>Cập nhật đóng góp chính thức</span></div>
            <i>→</i>
            <div><strong>Nhà tài trợ</strong><span>Xem minh bạch sử dụng nguồn lực</span></div>
          </div>
        </section>

        <section className="mc-grid wide-left">
          <div className="mc-card">
            <h2>Nhập sao kê ngân hàng</h2>
            {canManageFinance ? (
              <form className="mc-form" onSubmit={addBankLine}>
                <label>Người gửi / Nội dung<input required value={bankLine.sender} onChange={(e) => setBankLine({ ...bankLine, sender: e.target.value })} /></label>
                <label>Số tiền<input type="number" min="1" value={bankLine.amount} onChange={(e) => setBankLine({ ...bankLine, amount: e.target.value })} /></label>
                <label>Ngày giao dịch<input type="date" value={bankLine.date} onChange={(e) => setBankLine({ ...bankLine, date: e.target.value })} /></label>
                <div className="mc-actions mc-full">
                  <button className="mc-btn" type="submit">Đối soát giao dịch</button>
                  <button className="mc-btn secondary" type="button" onClick={exportReport}>Xuất báo cáo</button>
                </div>
              </form>
            ) : (
              <div className="mc-alert">Tài khoản này được xem báo cáo minh bạch, không được nhập hoặc xác nhận sao kê.</div>
            )}
          </div>

          <div className="mc-card">
            <h2>Cảnh báo quản trị</h2>
            <div className="mc-list">
              <div className="mc-list-item"><strong>{report.pendingDonations.length} khoản quyên góp chờ kế toán</strong><p>Chỉ ghi sổ vàng khi đã kiểm tra minh chứng và đối soát được.</p></div>
              <div className="mc-list-item"><strong>{report.accountingExpenses.length + report.executiveExpenses.length} phiếu chi chưa hoàn tất</strong><p>Phiếu chi phải qua kế toán trước khi Ban điều hành phê duyệt.</p></div>
              <div className="mc-list-item"><strong>{report.lowStock.length} nguyên liệu dưới định mức</strong><p>Kho cần theo dõi để không ảnh hưởng lớp học nghề và sản xuất.</p></div>
            </div>
          </div>
        </section>

        <section className="mc-card">
          <h2>Kết quả đối soát sao kê</h2>
          <table className="mc-table">
            <thead><tr><th>Mã</th><th>Người gửi</th><th>Số tiền</th><th>Ngày</th><th>Khớp phiếu</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {data.bankLines.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.sender}</td><td>{formatMoney(item.amount)}</td><td>{item.date}</td><td>{item.donationId || "Chưa xác định"}</td>
                  <td><span className={`mc-tag ${item.status === "Khop" ? "good" : "warn"}`}>{item.status}</span></td>
                  <td>{canManageFinance && item.status !== "Khop" && <button className="mc-btn secondary" onClick={() => markMatched(item.id)}>Xác nhận khớp</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Bảng hiệu quả chiến dịch / dự án</h2>
            <table className="mc-table">
              <thead><tr><th>Dự án</th><th>Quyên góp</th><th>Chi phí</th><th>Số dư</th><th>Nhà tài trợ</th></tr></thead>
              <tbody>
                {projectStats.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{formatMoney(item.income)}</td>
                    <td>{formatMoney(item.expense)}</td>
                    <td>{formatMoney(item.balance)}</td>
                    <td>{item.donorCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mc-card">
            <h2>Bảng nhà tài trợ</h2>
            <table className="mc-table">
              <thead><tr><th>Nhà tài trợ</th><th>Lĩnh vực</th><th>Số khoản</th><th>Tổng đóng góp</th></tr></thead>
              <tbody>
                {donorStats.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.interest}</td>
                    <td>{item.donationCount}</td>
                    <td>{formatMoney(item.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mc-grid">
          <div className="mc-card">
            <h2>Bảng thu quyên góp</h2>
            <table className="mc-table">
              <thead><tr><th>Phiếu</th><th>Nhà tài trợ</th><th>Hình thức</th><th>Giá trị</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {data.donations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td><td>{item.donorName}</td><td>{item.kind}</td><td>{formatMoney(item.amount)}</td><td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mc-card">
            <h2>Bảng chi phí</h2>
            <table className="mc-table">
              <thead><tr><th>Phiếu</th><th>Nội dung</th><th>Người đề nghị</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {data.expenses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td><td>{item.content}</td><td>{item.requester}</td><td>{formatMoney(item.amount)}</td><td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ReconciliationReportPage;
