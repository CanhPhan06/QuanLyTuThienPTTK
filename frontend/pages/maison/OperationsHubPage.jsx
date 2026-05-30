import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { formatMoney, loadMaisonData, nextId, saveMaisonData, statusLabels, today } from "./maisonData";
import "./MaisonWorkflow.css";

const roleLabels = {
  AdminKeToan: "Admin / Kế toán",
  NhanVien: "Nhân viên",
  BanDieuHanh: "Ban điều hành",
  TinhNguyenVien: "Tình nguyện viên",
  NhaTaiTro: "Nhà tài trợ",
  BanQuanLy: "Admin / Kế toán"
};

const detailTitles = {
  case: "Chi tiết hồ sơ",
  expense: "Chi tiết phiếu chi",
  donor: "Chi tiết nhà tài trợ",
  donation: "Chi tiết đóng góp",
  volunteer: "Chi tiết tình nguyện viên",
  assignment: "Chi tiết phân công",
  material: "Chi tiết tồn kho",
  reminder: "Chi tiết nhắc việc",
  bankLine: "Chi tiết đối soát"
};

const workspaceTabs = [
  { id: "requests", label: "Yêu cầu chờ xử lý" },
  { id: "cases", label: "Hồ sơ" },
  { id: "expenses", label: "Phiếu chi" },
  { id: "donations", label: "Quyên góp" },
  { id: "assignments", label: "Tình nguyện viên" },
  { id: "operations", label: "Kho & đối soát" }
];

const statusClass = (status = "") => {
  if (["ChinhThuc", "DaPheDuyet", "DaXacNhan", "DaXacNhanTNV", "DaGhiSo", "Khop"].some((item) => status.includes(item)) || status.includes("Da ")) return "good";
  if (["TuChoi", "TuChoiChi", "TuChoiTNV", "TuChoiDongGop", "Chenh"].some((item) => status.includes(item)) || status.includes("Tu choi")) return "bad";
  return "warn";
};

const displayStatus = (status) => statusLabels[status] || status || "Chưa cập nhật";

const appendHistory = (item, message) => ({
  ...item,
  history: [message, ...(item.history || [])]
});

const buildValidationMessage = (errors) => errors.map((error) => `- ${error}`).join("\n");

const validateExpensePayload = (expense) => {
  const errors = [];
  if (!expense.content?.trim()) errors.push("Thiếu nội dung chi.");
  if (!expense.requester?.trim()) errors.push("Thiếu người đề nghị.");
  if (!expense.department?.trim()) errors.push("Thiếu bộ phận phát sinh chi phí.");
  if (!Number.isFinite(Number(expense.amount)) || Number(expense.amount) <= 0) errors.push("Số tiền phải lớn hơn 0.");
  if (Number(expense.amount) > 50000000) errors.push("Số tiền vượt hạn mức kiểm tra nhanh 50.000.000 VND, cần tách hồ sơ hoặc trình bổ sung.");
  if ((!expense.evidence?.trim() || expense.evidence.trim().length < 6) && !expense.evidenceImage) errors.push("Chứng từ/giải trình chưa đủ để kế toán kiểm tra.");
  return errors;
};

const validateExpenseSubmitPayload = (expense) => {
  const errors = [];
  if (!expense.content?.trim()) errors.push("Thiếu nội dung chi.");
  if (!expense.department?.trim()) errors.push("Thiếu bộ phận phát sinh chi phí.");
  if (!Number.isFinite(Number(expense.amount)) || Number(expense.amount) <= 0) errors.push("Số tiền phải lớn hơn 0.");
  return errors;
};

const validateCasePayload = (record) => {
  const errors = [];
  const docs = (record.documents || []).join(" ").toLowerCase();
  if (!record.name?.trim()) errors.push("Thiếu họ tên đối tượng.");
  if (!record.identifier?.trim()) errors.push("Thiếu số định danh hồ sơ.");
  if (!record.family?.trim()) errors.push("Thiếu hoàn cảnh gia đình.");
  if (!record.visitResult?.trim()) errors.push("Thiếu kết quả vãng gia.");
  if (!docs.includes("vang") && !docs.includes("vãng")) errors.push("Thiếu biên bản vãng gia.");
  if (!docs.includes("khai sinh") && !docs.includes("xac nhan") && !docs.includes("xác nhận")) {
    errors.push("Thiếu giấy tờ pháp lý cốt lõi như khai sinh hoặc xác nhận khuyết tật.");
  }
  return errors;
};

const validateDonationPayload = (donation) => {
  const errors = [];
  if (!donation.donorName?.trim()) errors.push("Thiếu tên nhà tài trợ.");
  if (!donation.project?.trim()) errors.push("Thiếu dự án hoặc hạng mục nhận hỗ trợ.");
  if (!Number.isFinite(Number(donation.amount)) || Number(donation.amount) <= 0) errors.push("Giá trị quy đổi phải lớn hơn 0.");
  if (donation.kind === "Hien vat" && (!donation.itemName?.trim() || !donation.quantity?.trim())) {
    errors.push("Đóng góp hiện vật phải có tên hiện vật và số lượng.");
  }
  if (donation.kind !== "Hien vat" && Number(donation.amount) < 10000) errors.push("Khoản tiền quá nhỏ hoặc nhập sai, cần kiểm tra lại.");
  return errors;
};

const reviewChecklistByType = (type, item) => {
  if (type === "expense") {
    const errors = validateExpensePayload(item || {});
    return {
      title: "Checklist kiểm tra phiếu chi",
      errors,
      items: [
        "Đọc lý do phát sinh chi phí và xác định bộ phận chịu trách nhiệm.",
        "Đối chiếu chứng từ/hóa đơn/báo giá với nội dung đề nghị.",
        "Kiểm tra số tiền với hạn mức ngân sách và ưu tiên hoạt động.",
        "Xác định phiếu có đủ điều kiện ghi vào sổ chi hay phải trả về bổ sung."
      ]
    };
  }
  if (type === "donation") {
    const errors = validateDonationPayload(item || {});
    return {
      title: "Checklist kiểm tra yêu cầu quyên góp",
      errors,
      items: [
        "Xác minh danh tính/liên hệ nhà tài trợ và lĩnh vực họ muốn hỗ trợ.",
        "Kiểm tra giá trị quy đổi, hình thức đóng góp và chứng từ chuyển khoản/hiện vật.",
        "Đối chiếu dự án nhận hỗ trợ với nhu cầu thực tế của trung tâm.",
        "Chỉ ghi sổ vàng sau khi thông tin hợp lệ và có thể đối soát."
      ]
    };
  }
  if (type === "case") {
    const errors = validateCasePayload(item || {});
    return {
      title: "Checklist kiểm tra hồ sơ xã hội",
      errors,
      items: [
        "Đọc hoàn cảnh, địa chỉ và kết quả vãng gia của nhân viên xã hội.",
        "Kiểm tra giấy tờ pháp lý, minh chứng thực địa và ghi chú y tế.",
        "Đánh giá hồ sơ có phù hợp tiêu chí hỗ trợ của Maison Chance hay không.",
        "Chỉ duyệt chính thức khi đủ giấy tờ cốt lõi và kết quả xác minh rõ ràng."
      ]
    };
  }
  if (type === "assignment") {
    return {
      title: "Checklist kiểm tra lịch phân công",
      errors: [],
      items: [
        "Xem công việc, thời gian và kỹ năng yêu cầu.",
        "Đối chiếu lịch rảnh và khả năng tham gia của tình nguyện viên.",
        "Xác nhận nếu có thể tham gia; từ chối nếu lịch hoặc kỹ năng không phù hợp."
      ]
    };
  }
  return null;
};

const requestReasonByType = (type, item) => {
  if (type === "expense") {
    return item.requestReason || `Bộ phận ${item.department || "liên quan"} phát sinh nhu cầu: ${item.content}. Người đề nghị cần kế toán kiểm tra chứng từ trước khi ghi sổ.`;
  }
  if (type === "donation") {
    return item.requestReason || `${item.donorName} muốn đóng góp cho ${item.project}. Kế toán cần xác minh thông tin trước khi ghi sổ vàng.`;
  }
  if (type === "case") {
    return item.requestReason || `Nhân viên xã hội đã vãng gia và đề xuất hội đồng xem xét hồ sơ ${item.name}.`;
  }
  if (type === "assignment") {
    return item.requestReason || `${item.requester || "Nhân viên"} phân công tình nguyện viên vì công việc cần kỹ năng ${item.skill}.`;
  }
  return "Yêu cầu cần được kiểm tra trước khi xử lý.";
};

const evidenceLabel = (item) => {
  const text = item.evidence?.trim();
  const imageName = item.evidenceImageName?.trim();
  if (text && imageName) return `${text} (${imageName})`;
  return text || imageName || "Chưa gửi minh chứng";
};

const DetailPanel = ({ detail, permissions, actions, onClose }) => {
  if (!detail?.item) {
    return null;
  }

  const { type, item } = detail;
  const checklist = reviewChecklistByType(type, item);
  const canReviewExpenseByAccounting = permissions.isAdmin && type === "expense" && item.status === "ChoKeToan";
  const canReviewExpenseByExecutive = permissions.isExecutive && type === "expense" && item.status === "ChoBGD";
  const canReviewDonation = permissions.isAdmin && type === "donation" && item.status === "ChoKeToanXacNhan";
  const canReviewCase = permissions.isExecutive && type === "case" && ["ChoHoiDong", "CanBoSung"].includes(item.status);
  const canRespondAssignment = permissions.isVolunteer && type === "assignment" && item.status === "Cho xac nhan";
  const canAct = canReviewExpenseByAccounting || canReviewExpenseByExecutive || canReviewDonation || canReviewCase || canRespondAssignment;
  const rowsByType = {
    case: [
      ["Mã hồ sơ", item.id],
      ["Loại đối tượng", item.type],
      ["Ngày sinh", item.birthDate],
      ["Địa chỉ vãng gia", item.location],
      ["Người phụ trách", item.owner || "Nhân viên xã hội"],
      ["Trạng thái", displayStatus(item.status)],
      ["Hoàn cảnh", item.family],
      ["Kết quả vãng gia", item.visitResult],
      ["Giấy tờ", (item.documents || []).join(", ")],
      ["Ghi chú y tế", item.healthNote || "Chưa cập nhật"],
      ["Ghi chú xử lý", item.note]
    ],
    expense: [
      ["Mã phiếu", item.id],
      ["Nội dung", item.content],
      ["Lý do phát sinh", requestReasonByType(type, item)],
      ["Số tiền", formatMoney(item.amount)],
      ["Người đề nghị", item.requester],
      ["Bộ phận", item.department || "Chưa phân loại"],
      ["Minh chứng", evidenceLabel(item)],
      ["Đã ghi sổ kế toán", item.isRecorded ? "Có" : "Chưa"],
      ["Ngày ghi nhận", item.recordedAt || "Chưa ghi nhận"],
      ["Trạng thái", displayStatus(item.status)],
      ["Ý kiến kế toán", item.accountantNote || "Chưa xử lý"],
      ["Ý kiến Ban điều hành", item.directorNote || "Chưa xử lý"]
    ],
    donor: [
      ["Mã nhà tài trợ", item.id],
      ["Tên", item.name],
      ["Loại", item.type],
      ["Điện thoại", item.phone],
      ["Email", item.contactEmail || "Chưa cập nhật"],
      ["Lĩnh vực quan tâm", item.interest],
      ["Tổng đóng góp", formatMoney(item.total)],
      ["Lần gần nhất", item.lastDonation]
    ],
    donation: [
      ["Mã phiếu", item.id],
      ["Nhà tài trợ", item.donorName],
      ["Lý do quyên góp", requestReasonByType(type, item)],
      ["Hình thức", item.kind],
      ["Giá trị quy đổi", formatMoney(item.amount)],
      ["Hiện vật", item.itemName || "Không có"],
      ["Số lượng", item.quantity || "Không có"],
      ["Dự án nhận hỗ trợ", item.project],
      ["Minh chứng", evidenceLabel(item)],
      ["Ngày ghi nhận", item.date],
      ["Đã ghi sổ vàng", item.isRecorded || ["DaGhiSo", "ChoNhapKho"].includes(item.status) ? "Có" : "Chưa"],
      ["Ý kiến kế toán", item.accountantNote || "Chưa kiểm tra"],
      ["Trạng thái", displayStatus(item.status)]
    ],
    volunteer: [
      ["Mã tình nguyện viên", item.id],
      ["Họ tên", item.name],
      ["Kỹ năng", item.skill],
      ["Điện thoại", item.phone],
      ["Lịch rảnh", item.availability],
      ["Trạng thái", item.status]
    ],
    assignment: [
      ["Mã phân công", item.id],
      ["Tình nguyện viên", item.volunteerName],
      ["Công việc", item.task],
      ["Kỹ năng yêu cầu", item.skill],
      ["Thời gian", item.time],
      ["Người phân công", item.requester || "Nhân viên điều phối"],
      ["Lý do phân công", requestReasonByType(type, item)],
      ["Trạng thái", displayStatus(item.status)]
    ],
    material: [
      ["Mã nguyên liệu", item.id],
      ["Tên", item.name],
      ["Tồn kho", `${item.stock} ${item.unit}`],
      ["Định mức tối thiểu", `${item.minStock} ${item.unit}`],
      ["Trạng thái", Number(item.stock) < Number(item.minStock) ? "Cần bổ sung" : "Đạt định mức"]
    ],
    reminder: [
      ["Mã nhắc việc", item.id],
      ["Loại", item.type],
      ["Tiêu đề", item.title],
      ["Người phụ trách", item.owner],
      ["Hạn xử lý", item.dueAt],
      ["Kênh", item.channel],
      ["Trạng thái", item.status]
    ],
    bankLine: [
      ["Mã giao dịch", item.id],
      ["Người gửi", item.sender],
      ["Số tiền", formatMoney(item.amount)],
      ["Ngày", item.date],
      ["Liên kết phiếu đóng góp", item.donationId || "Chưa xác định"],
      ["Trạng thái", item.status]
    ]
  };

  return (
    <div className="mc-detail-overlay" role="dialog" aria-modal="true" onClick={onClose}>
    <aside className="mc-detail-panel mc-detail-dialog" onClick={(event) => event.stopPropagation()}>
      <button className="mc-modal-close" type="button" onClick={onClose} aria-label="Đóng cửa sổ chi tiết">×</button>
      <span className="mc-eyebrow">Chi tiết yêu cầu</span>
      <h2>{detailTitles[type] || "Thông tin chi tiết"}</h2>
      <div className={item.history?.length > 0 ? "mc-detail-split" : "mc-detail-single"}>
        <div className="mc-detail-main">
      <div className="mc-review-reason">
        <span>Lý do cần xử lý</span>
        <p>{requestReasonByType(type, item)}</p>
      </div>
      <div className="mc-detail-list">
        {(rowsByType[type] || []).map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value || "Chưa cập nhật"}</strong>
          </div>
        ))}
      </div>
      {item.evidenceImage && (
        <div className="mc-evidence-preview">
          <span>Ảnh minh chứng</span>
          <img src={item.evidenceImage} alt={item.evidenceImageName || "Ảnh minh chứng"} />
          {item.evidenceImageName && <strong>{item.evidenceImageName}</strong>}
        </div>
      )}
      {checklist && (
        <div className="mc-review-box">
          <h3>{checklist.title}</h3>
          <ul>
            {checklist.items.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
          <div className={`mc-validation ${checklist.errors.length > 0 ? "bad" : "good"}`}>
            <strong>{checklist.errors.length > 0 ? "Chưa đủ điều kiện xử lý" : "Đủ điều kiện kiểm tra bước tiếp theo"}</strong>
            {checklist.errors.length > 0
              ? checklist.errors.map((error) => <p key={error}>{error}</p>)
              : <p>Không phát hiện lỗi bắt buộc theo dữ liệu hiện có. Người duyệt vẫn cần đọc kỹ thông tin trước khi quyết định.</p>}
          </div>
        </div>
      )}
      {canAct && (
        <div className="mc-review-actions">
          <h3>Quyết định xử lý</h3>
          {canReviewExpenseByAccounting && (
            <>
              <button className="mc-btn success" onClick={() => actions.recordExpense(item.id)}>Phê duyệt hợp lệ & ghi sổ chi</button>
              <button className="mc-btn danger" onClick={() => actions.rejectExpense(item.id)}>Từ chối / yêu cầu bổ sung</button>
            </>
          )}
          {canReviewExpenseByExecutive && (
            <>
              <button className="mc-btn success" onClick={() => actions.approveExpense(item.id)}>Phê duyệt giải ngân</button>
              <button className="mc-btn danger" onClick={() => actions.rejectExpenseExecutive(item.id)}>Từ chối giải ngân</button>
            </>
          )}
          {canReviewDonation && (
            <>
              <button className="mc-btn success" onClick={() => actions.confirmDonation(item.id)}>Phê duyệt hợp lệ & ghi sổ vàng</button>
              <button className="mc-btn danger" onClick={() => actions.rejectDonation(item.id)}>Từ chối yêu cầu quyên góp</button>
            </>
          )}
          {canReviewCase && (
            <>
              <button className="mc-btn success" onClick={() => actions.approveCase(item.id)}>Phê duyệt thành viên chính thức</button>
              <button className="mc-btn secondary" onClick={() => actions.requestCaseSupplement(item.id)}>Yêu cầu bổ sung hồ sơ</button>
              <button className="mc-btn danger" onClick={() => actions.rejectCase(item.id)}>Từ chối hồ sơ</button>
            </>
          )}
          {canRespondAssignment && (
            <>
              <button className="mc-btn success" onClick={() => actions.acceptAssignment(item.id)}>Xác nhận tham gia</button>
              <button className="mc-btn danger" onClick={() => actions.rejectAssignment(item.id)}>Từ chối lịch này</button>
            </>
          )}
        </div>
      )}
        </div>
      {item.history?.length > 0 && (
        <div className="mc-history mc-history-panel">
          <h3>Lưu vết xử lý</h3>
          {item.history.map((entry, index) => <p key={`${entry}-${index}`}>{entry}</p>)}
        </div>
      )}
      </div>
    </aside>
    </div>
  );
};

const OperationsHubPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [detail, setDetail] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState("requests");
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });
  const [caseForm, setCaseForm] = useState({
    name: "",
    type: "Trẻ em mồ côi",
    birthDate: "",
    identifier: "",
    disability: "Không",
    family: "",
    location: "",
    visitDate: today(),
    visitResult: "",
    documents: "Biên bản vãng gia, Ảnh minh chứng",
    requestReason: ""
  });
  const [expenseForm, setExpenseForm] = useState({
    content: "",
    amount: 1200000,
    department: user?.department || "Công tác xã hội",
    evidence: "",
    evidenceImage: "",
    evidenceImageName: "",
    requestReason: ""
  });
  const [donationForm, setDonationForm] = useState({
    donorName: user?.VaiTro === "NhaTaiTro" ? user.HoTen : "",
    kind: "Chuyen khoan",
    amount: 1000000,
    itemName: "",
    quantity: "",
    project: "Lớp may căn bản",
    interest: "Đào tạo nghề",
    evidence: "",
    evidenceImage: "",
    evidenceImageName: "",
    requestReason: ""
  });
  const [assignmentForm, setAssignmentForm] = useState({
    volunteerId: "TNV-002",
    skill: "Y te",
    task: "Hỗ trợ tái khám định kỳ",
    time: "2026-06-01T08:00",
    requestReason: ""
  });

  const role = user?.VaiTro || "NhanVien";
  const isAdmin = ["AdminKeToan", "BanQuanLy"].includes(role);
  const isStaff = role === "NhanVien";
  const isExecutive = role === "BanDieuHanh";
  const isVolunteer = role === "TinhNguyenVien";
  const isDonor = role === "NhaTaiTro";
  const currentVolunteerId = user?.linkedVolunteerId || data.volunteers.find((item) => item.username === user?.TenDangNhap)?.id;
  const currentDonorId = user?.linkedDonorId || data.donors.find((item) => item.username === user?.TenDangNhap || item.name === user?.HoTen)?.id;

  const visibleAssignments = useMemo(
    () => isVolunteer ? data.assignments.filter((item) => item.volunteerId === currentVolunteerId) : data.assignments,
    [currentVolunteerId, data.assignments, isVolunteer]
  );

  const visibleDonations = useMemo(
    () => isDonor ? data.donations.filter((item) => item.donorId === currentDonorId || item.donorName === user?.HoTen) : data.donations,
    [currentDonorId, data.donations, isDonor, user?.HoTen]
  );

  const kpis = useMemo(() => ({
    waitingCases: data.cases.filter((item) => item.status === "ChoHoiDong").length,
    waitingAccounting: data.expenses.filter((item) => item.status === "ChoKeToan").length,
    waitingExecutive: data.expenses.filter((item) => item.status === "ChoBGD").length,
    waitingDonations: data.donations.filter((item) => item.status === "ChoKeToanXacNhan").length,
    lowStock: data.inventory.materials.filter((item) => Number(item.stock) < Number(item.minStock)).length
  }), [data]);

  const pendingRequests = useMemo(() => {
    const items = [];
    if (isAdmin) {
      data.expenses.filter((item) => item.status === "ChoKeToan").forEach((item) => {
        items.push({
          type: "expense",
          item,
          title: `Phiếu chi ${item.id}`,
          subtitle: item.content,
          waitingFor: "Kế toán kiểm tra chứng từ",
          reason: requestReasonByType("expense", item)
        });
      });
      data.donations.filter((item) => item.status === "ChoKeToanXacNhan").forEach((item) => {
        items.push({
          type: "donation",
          item,
          title: `Yêu cầu quyên góp ${item.id}`,
          subtitle: `${item.donorName} - ${formatMoney(item.amount)}`,
          waitingFor: "Kế toán xác minh và ghi sổ vàng",
          reason: requestReasonByType("donation", item)
        });
      });
    }
    if (isExecutive) {
      data.cases.filter((item) => item.status === "ChoHoiDong").forEach((item) => {
        items.push({
          type: "case",
          item,
          title: `Hồ sơ xét duyệt ${item.id}`,
          subtitle: item.name,
          waitingFor: "Ban điều hành/hội đồng xem xét",
          reason: requestReasonByType("case", item)
        });
      });
      data.expenses.filter((item) => item.status === "ChoBGD").forEach((item) => {
        items.push({
          type: "expense",
          item,
          title: `Phiếu chi chờ duyệt ${item.id}`,
          subtitle: item.content,
          waitingFor: "Ban điều hành phê duyệt giải ngân",
          reason: requestReasonByType("expense", item)
        });
      });
    }
    if (isVolunteer) {
      visibleAssignments.filter((item) => item.status === "Cho xac nhan").forEach((item) => {
        items.push({
          type: "assignment",
          item,
          title: `Lịch phân công ${item.id}`,
          subtitle: item.task,
          waitingFor: "Tình nguyện viên xác nhận tham gia",
          reason: requestReasonByType("assignment", item)
        });
      });
    }
    if (isStaff) {
      data.expenses.filter((item) => item.requester === user?.HoTen && item.status === "CanChinhSua").forEach((item) => {
        items.push({
          type: "expense",
          item,
          title: `Phiếu cần bổ sung ${item.id}`,
          subtitle: item.content,
          waitingFor: "Nhân viên bổ sung chứng từ",
          reason: item.accountantNote || requestReasonByType("expense", item)
        });
      });
      data.cases.filter((item) => item.owner === user?.HoTen && item.status === "CanBoSung").forEach((item) => {
        items.push({
          type: "case",
          item,
          title: `Hồ sơ cần bổ sung ${item.id}`,
          subtitle: item.name,
          waitingFor: "Nhân viên bổ sung hồ sơ",
          reason: item.note || requestReasonByType("case", item)
        });
      });
    }
    if (isDonor) {
      visibleDonations.filter((item) => ["ChoKeToanXacNhan", "TuChoiDongGop"].includes(item.status)).forEach((item) => {
        items.push({
          type: "donation",
          item,
          title: `Yêu cầu quyên góp ${item.id}`,
          subtitle: item.project,
          waitingFor: item.status === "ChoKeToanXacNhan" ? "Kế toán đang kiểm tra" : "Nhà tài trợ cần bổ sung thông tin",
          reason: item.accountantNote || requestReasonByType("donation", item)
        });
      });
    }
    return items;
  }, [data, isAdmin, isDonor, isExecutive, isStaff, isVolunteer, user?.HoTen, visibleAssignments, visibleDonations]);

  const persist = (nextData, nextDetail) => {
    setData(nextData);
    saveMaisonData(nextData);
    if (nextDetail) setDetail(nextDetail);
  };

  const showDone = (title, message, type = "success") => {
    setModal({ isOpen: true, title, message, type });
  };

  const openDetail = (type, item) => {
    setDetail({ type, item });
  };

  const openDetailByKeyboard = (event, type, item) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail(type, item);
    }
  };

  const attachEvidenceImage = (event, setForm) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        evidenceImage: String(reader.result || ""),
        evidenceImageName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const createCase = (event) => {
    event.preventDefault();
    const documents = caseForm.documents.split(",").map((item) => item.trim()).filter(Boolean);
    const newCase = {
      ...caseForm,
      documents,
      id: nextId("HS", data.cases),
      owner: user?.HoTen || "Nhân viên xã hội",
      status: documents.includes("Biên bản vãng gia") ? "ChoHoiDong" : "CanBoSung",
      votesFor: 0,
      votesTotal: 5,
      note: "Nhân viên đã tiếp nhận và chuyển luồng hội đồng.",
      requestReason: caseForm.requestReason || `Nhân viên xã hội đề xuất xét duyệt sau khi vãng gia: ${caseForm.visitResult}`,
      history: [`${user?.HoTen || "Nhân viên"} tiếp nhận hồ sơ, lập biên bản vãng gia và gửi Ban điều hành.`]
    };
    persist({ ...data, cases: [newCase, ...data.cases] }, { type: "case", item: newCase });
    setActiveForm(null);
    showDone("Đã gửi hồ sơ", "Hồ sơ mới đã chuyển sang trạng thái chờ hội đồng xét duyệt.");
  };

  const processCase = (caseId, status, message) => {
    const currentCase = data.cases.find((item) => item.id === caseId);
    if (status === "ChinhThuc") {
      const errors = validateCasePayload(currentCase || {});
      if (errors.length > 0) {
        showDone("Không thể duyệt chính thức", `Hội đồng phát hiện hồ sơ chưa hợp lệ:\n${buildValidationMessage(errors)}`, "warning");
        return;
      }
    }
    const nextCases = data.cases.map((item) => item.id === caseId
      ? appendHistory({ ...item, status, note: message }, `${user?.HoTen || "Ban điều hành"} xử lý: ${message}`)
      : item);
    const updated = nextCases.find((item) => item.id === caseId);
    persist({ ...data, cases: nextCases }, { type: "case", item: updated });
    showDone("Đã cập nhật hồ sơ", message, status === "ChinhThuc" ? "success" : "warning");
  };

  const createExpense = (event) => {
    event.preventDefault();
    const expense = {
      id: nextId("CT", data.expenses),
      content: expenseForm.content,
      amount: Number(expenseForm.amount),
      requester: user?.HoTen || "Nhân viên",
      department: expenseForm.department,
      evidence: expenseForm.evidence,
      evidenceImage: expenseForm.evidenceImage,
      evidenceImageName: expenseForm.evidenceImageName,
      status: "ChoKeToan",
      accountantNote: "",
      directorNote: "",
      isRecorded: false,
      requestReason: expenseForm.requestReason || `Bộ phận ${expenseForm.department} phát sinh nhu cầu chi: ${expenseForm.content}.`,
      history: [`${user?.HoTen || "Nhân viên"} lập phiếu và gửi Admin/Kế toán kiểm tra.`]
    };
    const errors = validateExpenseSubmitPayload(expense);
    if (errors.length > 0) {
      showDone("Chưa đủ thông tin tối thiểu", buildValidationMessage(errors), "warning");
      return;
    }
    persist({ ...data, expenses: [expense, ...data.expenses] }, { type: "expense", item: expense });
    setActiveForm(null);
    showDone("Đã gửi yêu cầu chi", "Phiếu mới chỉ nằm ở hàng chờ. Chưa ghi vào sổ chi cho đến khi Admin/Kế toán kiểm tra hợp lệ.");
  };

  const updateExpense = (expenseId, patch, message, type = "success") => {
    const nextExpenses = data.expenses.map((item) => item.id === expenseId
      ? appendHistory({ ...item, ...patch }, `${user?.HoTen || roleLabels[role]}: ${message}`)
      : item);
    const updated = nextExpenses.find((item) => item.id === expenseId);
    persist({ ...data, expenses: nextExpenses }, { type: "expense", item: updated });
    showDone("Đã xử lý phiếu chi", message, type);
  };

  const recordExpenseAfterAccounting = (expenseId) => {
    const expense = data.expenses.find((item) => item.id === expenseId);
    const errors = validateExpensePayload(expense || {});
    if (errors.length > 0) {
      showDone("Không thể ghi nhận phiếu chi", `Kế toán phát hiện dữ liệu chưa hợp lệ:\n${buildValidationMessage(errors)}`, "warning");
      return;
    }
    updateExpense(
      expenseId,
      {
        status: "ChoBGD",
        accountantNote: "Chứng từ hợp lệ, đúng định mức ngân sách, đã ghi nhận vào sổ chi chờ phê duyệt.",
        isRecorded: true,
        recordedAt: today()
      },
      "Kế toán kiểm tra hợp lệ, ghi vào sổ chi và chuyển Ban điều hành phê duyệt."
    );
  };

  const rejectExpenseAtAccounting = (expenseId) => {
    updateExpense(
      expenseId,
      {
        status: "CanChinhSua",
        accountantNote: "Dữ liệu chưa hợp lệ hoặc thiếu chứng từ, chưa được ghi vào sổ chi.",
        isRecorded: false
      },
      "Kế toán trả về để nhân viên bổ sung. Phiếu chưa được lưu chính thức.",
      "warning"
    );
  };

  const createDonation = (event) => {
    event.preventDefault();
    const existingDonor = data.donors.find((item) => item.id === currentDonorId || item.name.toLowerCase() === donationForm.donorName.toLowerCase());
    const donation = {
      id: nextId("DG", data.donations),
      donorId: existingDonor?.id || "",
      donorName: donationForm.donorName,
      donorType: existingDonor?.type || "Ca nhan",
      phone: existingDonor?.phone || "",
      interest: donationForm.interest,
      kind: donationForm.kind,
      amount: Number(donationForm.amount || 0),
      itemName: donationForm.itemName,
      quantity: donationForm.quantity,
      project: donationForm.project,
      evidence: donationForm.evidence,
      evidenceImage: donationForm.evidenceImage,
      evidenceImageName: donationForm.evidenceImageName,
      status: "ChoKeToanXacNhan",
      date: today(),
      isRecorded: false,
      accountantNote: "",
      requestReason: donationForm.requestReason || `${donationForm.donorName} muốn đóng góp cho ${donationForm.project}.`,
      history: [`${user?.HoTen || "Nhà tài trợ"} gửi thông tin đóng góp, chờ kế toán xác nhận.`]
    };
    const errors = validateDonationPayload(donation);
    if (errors.length > 0) {
      showDone("Thông tin đóng góp chưa hợp lệ", buildValidationMessage(errors), "warning");
      return;
    }
    persist({ ...data, donations: [donation, ...data.donations] }, { type: "donation", item: donation });
    setActiveForm(null);
    showDone("Đã gửi yêu cầu đóng góp", "Khoản này mới nằm ở hàng chờ. Sổ vàng và tổng đóng góp chưa thay đổi cho đến khi kế toán kiểm tra hợp lệ.");
  };

  const confirmDonation = (donationId) => {
    const donation = data.donations.find((item) => item.id === donationId);
    const errors = validateDonationPayload(donation || {});
    if (errors.length > 0) {
      showDone("Không thể ghi sổ vàng", `Kế toán phát hiện dữ liệu chưa hợp lệ:\n${buildValidationMessage(errors)}`, "warning");
      return;
    }
    const existingDonor = data.donors.find((item) => item.id === donation.donorId || item.name.toLowerCase() === donation.donorName.toLowerCase());
    const donorId = existingDonor?.id || nextId("NHT", data.donors);
    const nextDonors = existingDonor
      ? data.donors.map((item) => item.id === donorId ? { ...item, total: Number(item.total || 0) + Number(donation.amount || 0), lastDonation: today(), interest: donation.interest || item.interest } : item)
      : [{
        id: donorId,
        name: donation.donorName,
        type: donation.donorType || "Ca nhan",
        phone: donation.phone || "",
        interest: donation.interest || "Chưa phân loại",
        total: Number(donation.amount || 0),
        lastDonation: today(),
        username: donation.donorName === user?.HoTen ? user?.TenDangNhap : undefined
      }, ...data.donors];
    const nextDonations = data.donations.map((item) => item.id === donationId
      ? appendHistory({
        ...item,
        donorId,
        status: item.kind === "Hien vat" ? "ChoNhapKho" : "DaGhiSo",
        isRecorded: true,
        recordedAt: today(),
        accountantNote: "Kế toán đã kiểm tra thông tin, phân loại và ghi sổ vàng chính thức."
      }, `${user?.HoTen || "Kế toán"} kiểm tra hợp lệ và ghi vào sổ vàng.`)
      : item);
    const updated = nextDonations.find((item) => item.id === donationId);
    persist({ ...data, donors: nextDonors, donations: nextDonations }, { type: "donation", item: updated });
    showDone("Đã ghi sổ vàng", "Kế toán đã xác nhận hợp lệ. Lúc này hệ thống mới cập nhật hồ sơ nhà tài trợ và lịch sử đóng góp chính thức.");
  };

  const rejectDonation = (donationId) => {
    const nextDonations = data.donations.map((item) => item.id === donationId
      ? appendHistory({
        ...item,
        status: "TuChoiDongGop",
        isRecorded: false,
        accountantNote: "Thông tin đóng góp chưa hợp lệ, chưa ghi vào sổ vàng."
      }, `${user?.HoTen || "Kế toán"} từ chối ghi sổ vì dữ liệu chưa hợp lệ.`)
      : item);
    const updated = nextDonations.find((item) => item.id === donationId);
    persist({ ...data, donations: nextDonations }, { type: "donation", item: updated });
    showDone("Đã từ chối yêu cầu", "Khoản đóng góp chưa được lưu vào sổ vàng.", "warning");
  };

  const createAssignment = (event) => {
    event?.preventDefault();
    const volunteer = data.volunteers.find((item) => item.id === assignmentForm.volunteerId);
    if (!volunteer || volunteer.skill !== assignmentForm.skill) {
      showDone("Chưa đúng kỹ năng", "Cần chọn tình nguyện viên có kỹ năng phù hợp với công việc.", "warning");
      return;
    }
    const assignment = {
      id: nextId("PC", data.assignments),
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      task: assignmentForm.task,
      skill: assignmentForm.skill,
      time: assignmentForm.time,
      requester: user?.HoTen || "Nhân viên",
      status: "Cho xac nhan",
      requestReason: assignmentForm.requestReason || `Công việc cần tình nguyện viên có kỹ năng ${assignmentForm.skill}.`,
      history: [`${user?.HoTen || "Nhân viên"} gửi lịch trình đến tình nguyện viên.`]
    };
    persist({ ...data, assignments: [assignment, ...data.assignments] }, { type: "assignment", item: assignment });
    setActiveForm(null);
    showDone("Đã gửi lịch phân công", `${volunteer.name} sẽ thấy lịch này trong tài khoản tình nguyện viên.`);
  };

  const respondAssignment = (assignmentId, accepted) => {
    const status = accepted ? "Da xac nhan" : "Tu choi";
    const message = accepted ? "Tình nguyện viên xác nhận tham gia lịch trình." : "Tình nguyện viên từ chối, nhân viên cần phân công lại.";
    const nextAssignments = data.assignments.map((item) => item.id === assignmentId
      ? appendHistory({ ...item, status }, `${user?.HoTen || "Tình nguyện viên"} phản hồi: ${message}`)
      : item);
    const updated = nextAssignments.find((item) => item.id === assignmentId);
    persist({ ...data, assignments: nextAssignments }, { type: "assignment", item: updated });
    showDone("Đã phản hồi phân công", message, accepted ? "success" : "warning");
  };

  const updateReminder = (reminderId) => {
    const nextReminders = data.reminders.map((item) => item.id === reminderId ? { ...item, status: "Đã xử lý" } : item);
    const updated = nextReminders.find((item) => item.id === reminderId);
    persist({ ...data, reminders: nextReminders }, { type: "reminder", item: updated });
  };

  const setBankLineStatus = (lineId, status) => {
    const nextBankLines = data.bankLines.map((item) => item.id === lineId ? { ...item, status } : item);
    const updated = nextBankLines.find((item) => item.id === lineId);
    persist({ ...data, bankLines: nextBankLines }, { type: "bankLine", item: updated });
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      {activeForm === "case" && (
        <div className="mc-detail-overlay" role="dialog" aria-modal="true" onClick={() => setActiveForm(null)}>
          <section className="mc-detail-panel mc-detail-dialog mc-form-dialog" onClick={(event) => event.stopPropagation()}>
            <button className="mc-modal-close" type="button" onClick={() => setActiveForm(null)} aria-label="Đóng cửa sổ nhập">×</button>
            <h2>Thêm hồ sơ</h2>
            <form className="mc-form" onSubmit={createCase}>
              <label>Họ tên đối tượng<input required value={caseForm.name} onChange={(e) => setCaseForm({ ...caseForm, name: e.target.value })} /></label>
              <label>Loại hồ sơ<select value={caseForm.type} onChange={(e) => setCaseForm({ ...caseForm, type: e.target.value })}><option>Trẻ em mồ côi</option><option>Người khuyết tật</option></select></label>
              <label>Ngày sinh<input type="date" required value={caseForm.birthDate} onChange={(e) => setCaseForm({ ...caseForm, birthDate: e.target.value })} /></label>
              <label>Số định danh<input required value={caseForm.identifier} onChange={(e) => setCaseForm({ ...caseForm, identifier: e.target.value })} /></label>
              <label className="mc-full">Hoàn cảnh gia đình<textarea required value={caseForm.family} onChange={(e) => setCaseForm({ ...caseForm, family: e.target.value })} /></label>
              <label>Địa chỉ vãng gia<input required value={caseForm.location} onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })} /></label>
              <label>Ngày vãng gia<input type="date" value={caseForm.visitDate} onChange={(e) => setCaseForm({ ...caseForm, visitDate: e.target.value })} /></label>
              <label className="mc-full">Lý do đề nghị xét duyệt<textarea required value={caseForm.requestReason} onChange={(e) => setCaseForm({ ...caseForm, requestReason: e.target.value })} /></label>
              <label className="mc-full">Kết quả vãng gia<textarea required value={caseForm.visitResult} onChange={(e) => setCaseForm({ ...caseForm, visitResult: e.target.value })} /></label>
              <label className="mc-full">Giấy tờ, minh chứng<input value={caseForm.documents} onChange={(e) => setCaseForm({ ...caseForm, documents: e.target.value })} /></label>
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi hội đồng xét duyệt</button></div>
            </form>
          </section>
        </div>
      )}
      {activeForm === "expense" && (
        <div className="mc-detail-overlay" role="dialog" aria-modal="true" onClick={() => setActiveForm(null)}>
          <section className="mc-detail-panel mc-detail-dialog mc-form-dialog" onClick={(event) => event.stopPropagation()}>
            <button className="mc-modal-close" type="button" onClick={() => setActiveForm(null)} aria-label="Đóng cửa sổ nhập">×</button>
            <h2>Lập phiếu chi</h2>
            <form className="mc-form" onSubmit={createExpense}>
              <label className="mc-full">Nội dung chi<input required value={expenseForm.content} onChange={(e) => setExpenseForm({ ...expenseForm, content: e.target.value })} /></label>
              <label>Số tiền<input type="number" min="1000" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></label>
              <label>Bộ phận<input value={expenseForm.department} onChange={(e) => setExpenseForm({ ...expenseForm, department: e.target.value })} /></label>
              <label className="mc-full">Lý do đề nghị chi<textarea required value={expenseForm.requestReason} onChange={(e) => setExpenseForm({ ...expenseForm, requestReason: e.target.value })} /></label>
              <label className="mc-full">Minh chứng<textarea value={expenseForm.evidence} placeholder="Nhập hóa đơn, báo giá, lý do hoặc ghi chú kiểm tra." onChange={(e) => setExpenseForm({ ...expenseForm, evidence: e.target.value })} /></label>
              <label>Ảnh minh chứng<input type="file" accept="image/*" onChange={(e) => attachEvidenceImage(e, setExpenseForm)} /></label>
              {expenseForm.evidenceImageName && <div className="mc-file-chip">{expenseForm.evidenceImageName}</div>}
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi yêu cầu cho kế toán</button></div>
            </form>
          </section>
        </div>
      )}
      {activeForm === "donation" && (
        <div className="mc-detail-overlay" role="dialog" aria-modal="true" onClick={() => setActiveForm(null)}>
          <section className="mc-detail-panel mc-detail-dialog mc-form-dialog" onClick={(event) => event.stopPropagation()}>
            <button className="mc-modal-close" type="button" onClick={() => setActiveForm(null)} aria-label="Đóng cửa sổ nhập">×</button>
            <h2>Gửi quyên góp</h2>
            <form className="mc-form" onSubmit={createDonation}>
              <label>Nhà tài trợ<input required value={donationForm.donorName} onChange={(e) => setDonationForm({ ...donationForm, donorName: e.target.value })} /></label>
              <label>Lĩnh vực quan tâm<input value={donationForm.interest} onChange={(e) => setDonationForm({ ...donationForm, interest: e.target.value })} /></label>
              <label>Hình thức<select value={donationForm.kind} onChange={(e) => setDonationForm({ ...donationForm, kind: e.target.value })}><option>Chuyen khoan</option><option>Tien mat</option><option>Hien vat</option></select></label>
              <label>Giá trị quy đổi<input type="number" min="0" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })} /></label>
              <label>Tên hiện vật<input value={donationForm.itemName} onChange={(e) => setDonationForm({ ...donationForm, itemName: e.target.value })} /></label>
              <label>Số lượng<input value={donationForm.quantity} onChange={(e) => setDonationForm({ ...donationForm, quantity: e.target.value })} /></label>
              <label className="mc-full">Dự án muốn hỗ trợ<input value={donationForm.project} onChange={(e) => setDonationForm({ ...donationForm, project: e.target.value })} /></label>
              <label className="mc-full">Lý do / ghi chú quyên góp<textarea required value={donationForm.requestReason} onChange={(e) => setDonationForm({ ...donationForm, requestReason: e.target.value })} /></label>
              <label className="mc-full">Minh chứng<textarea value={donationForm.evidence} onChange={(e) => setDonationForm({ ...donationForm, evidence: e.target.value })} placeholder="Nhập mã giao dịch, nội dung chuyển khoản hoặc ghi chú hiện vật." /></label>
              <label>Ảnh minh chứng<input type="file" accept="image/*" onChange={(e) => attachEvidenceImage(e, setDonationForm)} /></label>
              {donationForm.evidenceImageName && <div className="mc-file-chip">{donationForm.evidenceImageName}</div>}
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi yêu cầu quyên góp</button></div>
            </form>
          </section>
        </div>
      )}
      {activeForm === "assignment" && (
        <div className="mc-detail-overlay" role="dialog" aria-modal="true" onClick={() => setActiveForm(null)}>
          <section className="mc-detail-panel mc-detail-dialog mc-form-dialog" onClick={(event) => event.stopPropagation()}>
            <button className="mc-modal-close" type="button" onClick={() => setActiveForm(null)} aria-label="Đóng cửa sổ nhập">×</button>
            <h2>Phân công tình nguyện viên</h2>
            <form className="mc-form" onSubmit={createAssignment}>
              <label>Kỹ năng cần tìm<select value={assignmentForm.skill} onChange={(e) => setAssignmentForm({ ...assignmentForm, skill: e.target.value })}><option>Y te</option><option>Su pham</option><option>Hau can</option><option>Truyen thong</option></select></label>
              <label>Tình nguyện viên<select value={assignmentForm.volunteerId} onChange={(e) => setAssignmentForm({ ...assignmentForm, volunteerId: e.target.value })}>{data.volunteers.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.skill}</option>)}</select></label>
              <label className="mc-full">Công việc<input value={assignmentForm.task} onChange={(e) => setAssignmentForm({ ...assignmentForm, task: e.target.value })} /></label>
              <label>Thời gian<input type="datetime-local" value={assignmentForm.time} onChange={(e) => setAssignmentForm({ ...assignmentForm, time: e.target.value })} /></label>
              <label className="mc-full">Lý do phân công<textarea value={assignmentForm.requestReason} onChange={(e) => setAssignmentForm({ ...assignmentForm, requestReason: e.target.value })} /></label>
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi lịch phân công</button></div>
            </form>
          </section>
        </div>
      )}
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">Maison Chance</span>
            <h1>Bảng xử lý yêu cầu</h1>
          </div>
          <div className="mc-role-card">
            <span>Đang đăng nhập</span>
            <strong>{user?.HoTen || "Người dùng"} - {roleLabels[role] || role}</strong>
          </div>
        </header>

        <nav className="mc-workspace-tabs" aria-label="Phân hệ quản lý">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.id}
              className={activeWorkspace === tab.id ? "active" : ""}
              type="button"
              onClick={() => setActiveWorkspace(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="mc-card mc-request-inbox mc-list-panel" hidden={activeWorkspace !== "requests"}>
          <div className="mc-section-title">
            <div>
              <h2>Hộp yêu cầu chờ xử lý</h2>
            </div>
          </div>
          {pendingRequests.length === 0 ? (
            <div className="mc-alert">Tài khoản này hiện chưa có yêu cầu nào cần xử lý.</div>
          ) : (
            <div className="mc-request-grid">
              {pendingRequests.map((request) => (
                <article
                  key={`${request.type}-${request.item.id}`}
                  className="mc-request-card clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(request.type, request.item)}
                  onKeyDown={(event) => openDetailByKeyboard(event, request.type, request.item)}
                >
                  <span>{request.waitingFor}</span>
                  <h3>{request.title}</h3>
                  <strong>{request.subtitle}</strong>
                  <p>{request.reason}</p>
                  <span className="mc-open-detail">Xem chi tiết</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mc-ops-layout">
          <div className="mc-ops-main">
            <section className="mc-card" hidden={activeWorkspace !== "cases"}>
              <div className="mc-section-title">
                <div>
                  <h2>Tiếp nhận, vãng gia và xét duyệt hồ sơ</h2>
                </div>
                {isStaff && <button className="mc-btn" type="button" onClick={() => setActiveForm("case")}>Thêm hồ sơ</button>}
              </div>
              {false && isStaff && (
                <form className="mc-form mc-inline-form" onSubmit={createCase}>
                  <label>Họ tên đối tượng<input required value={caseForm.name} onChange={(e) => setCaseForm({ ...caseForm, name: e.target.value })} /></label>
                  <label>Loại hồ sơ<select value={caseForm.type} onChange={(e) => setCaseForm({ ...caseForm, type: e.target.value })}><option>Trẻ em mồ côi</option><option>Người khuyết tật</option></select></label>
                  <label>Ngày sinh<input type="date" required value={caseForm.birthDate} onChange={(e) => setCaseForm({ ...caseForm, birthDate: e.target.value })} /></label>
                  <label>Số định danh<input required value={caseForm.identifier} onChange={(e) => setCaseForm({ ...caseForm, identifier: e.target.value })} /></label>
                  <label className="mc-full">Hoàn cảnh gia đình<textarea required value={caseForm.family} onChange={(e) => setCaseForm({ ...caseForm, family: e.target.value })} /></label>
                  <label>Địa chỉ vãng gia<input required value={caseForm.location} onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })} /></label>
                  <label>Ngày vãng gia<input type="date" value={caseForm.visitDate} onChange={(e) => setCaseForm({ ...caseForm, visitDate: e.target.value })} /></label>
                  <label className="mc-full">Lý do đề nghị xét duyệt<textarea required value={caseForm.requestReason} onChange={(e) => setCaseForm({ ...caseForm, requestReason: e.target.value })} placeholder="Vì sao hồ sơ này cần hội đồng xem xét?" /></label>
                  <label className="mc-full">Kết quả vãng gia<textarea required value={caseForm.visitResult} onChange={(e) => setCaseForm({ ...caseForm, visitResult: e.target.value })} /></label>
                  <label className="mc-full">Giấy tờ, minh chứng<input value={caseForm.documents} onChange={(e) => setCaseForm({ ...caseForm, documents: e.target.value })} /></label>
                  <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi hội đồng xét duyệt</button></div>
                </form>
              )}
              <table className="mc-table">
                <thead><tr><th>Hồ sơ</th><th>Người phụ trách</th><th>Trạng thái</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {data.cases.map((item) => (
                    <tr key={item.id} className="clickable" onClick={() => openDetail("case", item)}>
                      <td><button className="mc-link" onClick={() => openDetail("case", item)}>{item.name}</button><small>{item.id}</small></td>
                      <td>{item.owner || "Nhân viên xã hội"}</td>
                      <td><span className={`mc-tag ${statusClass(item.status)}`}>{displayStatus(item.status)}</span></td>
                      <td>{item.note}</td>
                      <td className="mc-two-actions" onClick={(event) => event.stopPropagation()}>
                        {isExecutive && item.status === "ChoHoiDong" && <button className="mc-btn success" onClick={() => processCase(item.id, "ChinhThuc", "Hội đồng đạt đa số phiếu, chuyển thành viên chính thức.")}>Duyệt</button>}
                        {isExecutive && ["ChoHoiDong", "CanBoSung"].includes(item.status) && <button className="mc-btn secondary" onClick={() => processCase(item.id, "CanBoSung", "Hội đồng yêu cầu nhân viên bổ sung hồ sơ.")}>Bổ sung</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mc-card" hidden={activeWorkspace !== "expenses"}>
              <div className="mc-section-title">
                <div>
                  <h2>Phiếu đề nghị chi và phê duyệt chi phí</h2>
                </div>
                {isStaff && <button className="mc-btn" type="button" onClick={() => setActiveForm("expense")}>Lập phiếu chi</button>}
              </div>
              {false && isStaff && (
                <form className="mc-form mc-inline-form" onSubmit={createExpense}>
                  <label className="mc-full">Nội dung chi<input required value={expenseForm.content} onChange={(e) => setExpenseForm({ ...expenseForm, content: e.target.value })} /></label>
                  <label>Số tiền<input type="number" min="1000" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></label>
                  <label>Bộ phận<input value={expenseForm.department} onChange={(e) => setExpenseForm({ ...expenseForm, department: e.target.value })} /></label>
                  <label className="mc-full">Lý do đề nghị chi<textarea required value={expenseForm.requestReason} onChange={(e) => setExpenseForm({ ...expenseForm, requestReason: e.target.value })} placeholder="Vì sao cần khoản chi này, tình hình thực tế là gì?" /></label>
                  <label className="mc-full">Minh chứng<textarea value={expenseForm.evidence} placeholder="Nhập hóa đơn, báo giá, lý do hoặc ghi chú kiểm tra." onChange={(e) => setExpenseForm({ ...expenseForm, evidence: e.target.value })} /></label>
                  <label>Ảnh minh chứng<input type="file" accept="image/*" onChange={(e) => attachEvidenceImage(e, setExpenseForm)} /></label>
                  {expenseForm.evidenceImageName && <div className="mc-file-chip">{expenseForm.evidenceImageName}</div>}
                  <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi yêu cầu cho kế toán</button></div>
                </form>
              )}
              <table className="mc-table">
                <thead><tr><th>Phiếu</th><th>Người đề nghị</th><th>Số tiền</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>
                  {data.expenses.map((item) => (
                    <tr key={item.id} className="clickable" onClick={() => openDetail("expense", item)}>
                      <td><button className="mc-link" onClick={() => openDetail("expense", item)}>{item.content}</button><small>{item.id} - {evidenceLabel(item)}</small></td>
                      <td>{item.requester}</td>
                      <td>{formatMoney(item.amount)}</td>
                      <td><span className={`mc-tag ${statusClass(item.status)}`}>{displayStatus(item.status)}</span></td>
                      <td className="mc-two-actions" onClick={(event) => event.stopPropagation()}>
                        {isAdmin && item.status === "ChoKeToan" && <button className="mc-btn secondary" onClick={() => recordExpenseAfterAccounting(item.id)}>Kiểm tra hợp lệ & ghi sổ</button>}
                        {isAdmin && item.status === "ChoKeToan" && <button className="mc-btn danger" onClick={() => rejectExpenseAtAccounting(item.id)}>Không hợp lệ</button>}
                        {isExecutive && item.status === "ChoBGD" && <button className="mc-btn success" onClick={() => updateExpense(item.id, { status: "DaPheDuyet", directorNote: "Ban điều hành phê duyệt giải ngân." }, "Ban điều hành đã phê duyệt phiếu chi.")}>Phê duyệt</button>}
                        {isExecutive && item.status === "ChoBGD" && <button className="mc-btn danger" onClick={() => updateExpense(item.id, { status: "TuChoiChi", directorNote: "Không phù hợp ưu tiên ngân sách hiện tại." }, "Ban điều hành từ chối phiếu chi.", "warning")}>Từ chối</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mc-card" hidden={activeWorkspace !== "donations"}>
              <div className="mc-section-title">
                <div>
                  <h2>Nhà tài trợ và sổ vàng đóng góp</h2>
                </div>
                {isDonor && <button className="mc-btn" type="button" onClick={() => setActiveForm("donation")}>Gửi quyên góp</button>}
              </div>
              {false && isDonor && (
                <form className="mc-form mc-inline-form" onSubmit={createDonation}>
                  <label>Nhà tài trợ<input required value={donationForm.donorName} onChange={(e) => setDonationForm({ ...donationForm, donorName: e.target.value })} /></label>
                  <label>Lĩnh vực quan tâm<input value={donationForm.interest} onChange={(e) => setDonationForm({ ...donationForm, interest: e.target.value })} /></label>
                  <label>Hình thức<select value={donationForm.kind} onChange={(e) => setDonationForm({ ...donationForm, kind: e.target.value })}><option>Chuyen khoan</option><option>Tien mat</option><option>Hien vat</option></select></label>
                  <label>Giá trị quy đổi<input type="number" min="0" value={donationForm.amount} onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })} /></label>
                  <label>Tên hiện vật<input value={donationForm.itemName} onChange={(e) => setDonationForm({ ...donationForm, itemName: e.target.value })} /></label>
                  <label>Số lượng<input value={donationForm.quantity} onChange={(e) => setDonationForm({ ...donationForm, quantity: e.target.value })} /></label>
                  <label className="mc-full">Dự án muốn hỗ trợ<input value={donationForm.project} onChange={(e) => setDonationForm({ ...donationForm, project: e.target.value })} /></label>
                  <label className="mc-full">Lý do / ghi chú quyên góp<textarea required value={donationForm.requestReason} onChange={(e) => setDonationForm({ ...donationForm, requestReason: e.target.value })} placeholder="Nhà tài trợ muốn hỗ trợ việc gì, có thông tin chuyển khoản/hiện vật gì cần kiểm tra?" /></label>
                  <label className="mc-full">Minh chứng<textarea value={donationForm.evidence} onChange={(e) => setDonationForm({ ...donationForm, evidence: e.target.value })} placeholder="Nhập mã giao dịch, nội dung chuyển khoản hoặc ghi chú hiện vật." /></label>
                  <label>Ảnh minh chứng<input type="file" accept="image/*" onChange={(e) => attachEvidenceImage(e, setDonationForm)} /></label>
                  {donationForm.evidenceImageName && <div className="mc-file-chip">{donationForm.evidenceImageName}</div>}
                  <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi yêu cầu quyên góp</button></div>
                </form>
              )}
              <table className="mc-table">
                <thead><tr><th>Nhà tài trợ</th><th>Phiếu đóng góp</th><th>Giá trị</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {visibleDonations.map((item) => (
                    <tr key={item.id} className="clickable" onClick={() => openDetail("donation", item)}>
                      <td><button className="mc-link" onClick={(event) => {
                        event.stopPropagation();
                        const donor = data.donors.find((entry) => entry.id === item.donorId);
                        openDetail(donor ? "donor" : "donation", donor || item);
                      }}>{item.donorName}</button></td>
                      <td><button className="mc-link" onClick={() => openDetail("donation", item)}>{item.id} - {item.project}</button><small>{item.kind}</small></td>
                      <td>{formatMoney(item.amount)}</td>
                      <td><span className={`mc-tag ${statusClass(item.status)}`}>{displayStatus(item.status)}</span></td>
                      <td className="mc-two-actions" onClick={(event) => event.stopPropagation()}>
                        {isAdmin && item.status === "ChoKeToanXacNhan" && <button className="mc-btn secondary" onClick={() => confirmDonation(item.id)}>Kiểm tra hợp lệ & ghi sổ</button>}
                        {isAdmin && item.status === "ChoKeToanXacNhan" && <button className="mc-btn danger" onClick={() => rejectDonation(item.id)}>Không hợp lệ</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mc-card" hidden={activeWorkspace !== "assignments"}>
              <div className="mc-section-title">
                <div>
                  <h2>Điều phối tình nguyện viên</h2>
                </div>
                {(isStaff || isExecutive) && <button className="mc-btn" type="button" onClick={() => setActiveForm("assignment")}>Phân công</button>}
              </div>
              {false && (isStaff || isExecutive) && (
                <div className="mc-form mc-inline-form">
                  <label>Kỹ năng cần tìm<select value={assignmentForm.skill} onChange={(e) => setAssignmentForm({ ...assignmentForm, skill: e.target.value })}><option>Y te</option><option>Su pham</option><option>Hau can</option><option>Truyen thong</option></select></label>
                  <label>Tình nguyện viên<select value={assignmentForm.volunteerId} onChange={(e) => setAssignmentForm({ ...assignmentForm, volunteerId: e.target.value })}>{data.volunteers.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.skill}</option>)}</select></label>
                  <label className="mc-full">Công việc<input value={assignmentForm.task} onChange={(e) => setAssignmentForm({ ...assignmentForm, task: e.target.value })} /></label>
                  <label>Thời gian<input type="datetime-local" value={assignmentForm.time} onChange={(e) => setAssignmentForm({ ...assignmentForm, time: e.target.value })} /></label>
                  <label className="mc-full">Lý do phân công<textarea value={assignmentForm.requestReason} onChange={(e) => setAssignmentForm({ ...assignmentForm, requestReason: e.target.value })} placeholder="Vì sao cần tình nguyện viên này tham gia?" /></label>
                  <div className="mc-actions"><button className="mc-btn" type="button" onClick={createAssignment}>Gửi lịch phân công</button></div>
                </div>
              )}
              <table className="mc-table">
                <thead><tr><th>Tình nguyện viên</th><th>Công việc</th><th>Thời gian</th><th>Trạng thái</th><th>Phản hồi</th></tr></thead>
                <tbody>
                  {visibleAssignments.map((item) => (
                    <tr key={item.id} className="clickable" onClick={() => openDetail("assignment", item)}>
                      <td><button className="mc-link" onClick={(event) => {
                        event.stopPropagation();
                        openDetail("volunteer", data.volunteers.find((volunteer) => volunteer.id === item.volunteerId));
                      }}>{item.volunteerName}</button></td>
                      <td><button className="mc-link" onClick={() => openDetail("assignment", item)}>{item.task}</button><small>{item.skill}</small></td>
                      <td>{item.time}</td>
                      <td><span className={`mc-tag ${statusClass(item.status)}`}>{displayStatus(item.status)}</span></td>
                      <td className="mc-two-actions" onClick={(event) => event.stopPropagation()}>
                        {isVolunteer && item.status === "Cho xac nhan" && <button className="mc-btn success" onClick={() => respondAssignment(item.id, true)}>Xác nhận</button>}
                        {isVolunteer && item.status === "Cho xac nhan" && <button className="mc-btn danger" onClick={() => respondAssignment(item.id, false)}>Từ chối</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mc-grid" hidden={activeWorkspace !== "operations"}>
              <div className="mc-card">
                <div className="mc-section-title">
                  <div>
                    <h2>Đào tạo, kho và cảnh báo</h2>
                  </div>
                </div>
                <div className="mc-list">
                  {data.inventory.materials.map((item) => (
                    <button className="mc-list-item mc-list-button" key={item.id} onClick={() => setDetail({ type: "material", item })}>
                      <strong>{item.name}</strong>
                      <p>Tồn {item.stock} {item.unit}, định mức {item.minStock} {item.unit}</p>
                    </button>
                  ))}
                  {data.reminders.map((item) => (
                    <div className="mc-list-item" key={item.id}>
                      <button className="mc-link" onClick={() => setDetail({ type: "reminder", item })}>{item.title}</button>
                      <p>{item.owner} - {item.dueAt} - {item.status}</p>
                      {(isStaff || isExecutive || isAdmin) && <button className="mc-btn secondary" onClick={() => updateReminder(item.id)}>Đánh dấu xử lý</button>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mc-card">
                <div className="mc-section-title">
                  <div>
                    <h2>Đối soát tài chính</h2>
                  </div>
                </div>
                <div className="mc-list">
                  {data.bankLines.map((item) => (
                    <div className="mc-list-item" key={item.id}>
                      <button className="mc-link" onClick={() => setDetail({ type: "bankLine", item })}>{item.sender}</button>
                      <p>{formatMoney(item.amount)} - {item.date} - {item.status}</p>
                      {isAdmin && (
                        <div className="mc-actions">
                          <button className="mc-btn secondary" onClick={() => setBankLineStatus(item.id, "Khop")}>Đánh dấu khớp</button>
                          <button className="mc-btn danger" onClick={() => setBankLineStatus(item.id, "Cho xac minh")}>Chờ xác minh</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <DetailPanel
            detail={detail}
            permissions={{ isAdmin, isExecutive, isVolunteer }}
            onClose={() => setDetail(null)}
            actions={{
              recordExpense: recordExpenseAfterAccounting,
              rejectExpense: rejectExpenseAtAccounting,
              approveExpense: (id) => updateExpense(id, { status: "DaPheDuyet", directorNote: "Ban điều hành phê duyệt giải ngân." }, "Ban điều hành đã đọc hồ sơ và phê duyệt giải ngân."),
              rejectExpenseExecutive: (id) => updateExpense(id, { status: "TuChoiChi", directorNote: "Không phù hợp ưu tiên ngân sách hiện tại." }, "Ban điều hành đã đọc hồ sơ và từ chối giải ngân.", "warning"),
              confirmDonation,
              rejectDonation,
              approveCase: (id) => processCase(id, "ChinhThuc", "Hội đồng đã kiểm tra hồ sơ, xác minh phù hợp và phê duyệt thành viên chính thức."),
              requestCaseSupplement: (id) => processCase(id, "CanBoSung", "Hội đồng đã kiểm tra và yêu cầu nhân viên bổ sung hồ sơ trước khi duyệt."),
              rejectCase: (id) => processCase(id, "TuChoi", "Hội đồng đã kiểm tra và từ chối hồ sơ vì chưa phù hợp tiêu chí hỗ trợ."),
              acceptAssignment: (id) => respondAssignment(id, true),
              rejectAssignment: (id) => respondAssignment(id, false)
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default OperationsHubPage;
