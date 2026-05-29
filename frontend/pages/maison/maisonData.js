const STORAGE_KEY = "maison-chance-operations-v5";

export const initialMaisonData = {
  cases: [
    {
      id: "HS-001",
      name: "Nguyen Minh Anh",
      type: "Tre em mo coi",
      birthDate: "2015-08-12",
      identifier: "MC-TE-001",
      disability: "Khong",
      family: "Me mat, dang song voi ba ngoai",
      location: "Binh Tan, TP.HCM",
      visitDate: "2026-05-30",
      visitResult: "Hoan canh kho khan, can ho tro hoc tap va dinh duong.",
      documents: ["Giay khai sinh", "Bien ban vang gia", "Anh minh chung"],
      status: "ChoHoiDong",
      votesFor: 0,
      votesTotal: 5,
      note: "Da du ho so cot loi",
      owner: "Lê Thu Hằng",
      healthNote: "Theo dõi dinh dưỡng và lịch tiêm chủng",
      requestReason: "Nhân viên xã hội đề xuất hội đồng xét duyệt vì trẻ em cần hỗ trợ học tập và dinh dưỡng sau vãng gia.",
      history: ["Nhân viên xã hội tiếp nhận hồ sơ và lập biên bản vãng gia."]
    },
    {
      id: "HS-002",
      name: "Tran Van Binh",
      type: "Nguoi khuyet tat",
      birthDate: "2008-02-04",
      identifier: "MC-NKT-002",
      disability: "Van dong",
      family: "Gia dinh thu nhap thap, can xe lan va hoc nghe",
      location: "Dak Nong",
      visitDate: "2026-06-02",
      visitResult: "Can bo sung giay xac nhan khuyet tat.",
      documents: ["Bien ban vang gia"],
      status: "CanBoSung",
      votesFor: 0,
      votesTotal: 5,
      note: "Thieu giay xac nhan khuyet tat",
      owner: "Lê Thu Hằng",
      healthNote: "Cần xác nhận mức độ khuyết tật vận động",
      requestReason: "Nhân viên xã hội cần hội đồng xem xét nhưng hồ sơ còn thiếu giấy xác nhận khuyết tật.",
      history: ["Hồ sơ được lưu sau vãng gia, đang chờ bổ sung giấy xác nhận."]
    }
  ],
  courses: [
    {
      id: "KH-MAY",
      name: "Lop may can ban",
      teacher: "Co Huong",
      duration: "6 thang",
      learners: [
        { memberId: "HS-002", memberName: "Tran Van Binh", progress: 45, milestone: "Thang 3", score: 7.5, comment: "Nam thao tac co ban, can luyen duong may thang." }
      ]
    },
    {
      id: "KH-TIN",
      name: "Tin hoc van phong",
      teacher: "Thay Nam",
      duration: "9 thang",
      learners: [
        { memberId: "HS-001", memberName: "Nguyen Minh Anh", progress: 30, milestone: "Thang 1", score: 8, comment: "Tiep thu tot, can ho tro may tinh luyen tap." }
      ]
    }
  ],
  inventory: {
    materials: [
      { id: "NL-VA", name: "Vai cotton", unit: "cuon", stock: 18, minStock: 25 },
      { id: "NL-CHI", name: "Chi may", unit: "cuon", stock: 55, minStock: 30 },
      { id: "NL-MAU", name: "Mau ve", unit: "hop", stock: 12, minStock: 20 }
    ],
    products: [
      { serial: "MC-BAG-2026-001", name: "Tui vai Maison Chance", maker: "Tran Van Binh", createdAt: "2026-05-26", status: "Trong kho" }
    ],
    logs: [
      { id: "PX-001", type: "Xuat", materialId: "NL-VA", quantity: 4, purpose: "Lop may can ban", date: "2026-05-27" }
    ]
  },
  donors: [
    { id: "NHT-001", name: "Cong ty ABC", type: "To chuc", phone: "0900000001", interest: "Dao tao nghe", total: 5000000, lastDonation: "2026-05-24", username: "donor", contactEmail: "donor@maisonchance.vn" },
    { id: "NHT-002", name: "Nhom Ban Tre", type: "Ca nhan", phone: "0900000002", interest: "Dinh duong", total: 1200000, lastDonation: "2026-05-25" }
  ],
  donations: [
    { id: "DG-001", donorId: "NHT-001", donorName: "Cong ty ABC", donorType: "To chuc", phone: "0900000001", interest: "Dao tao nghe", kind: "Chuyen khoan", amount: 5000000, itemName: "", quantity: "", project: "Lop may can ban", status: "DaGhiSo", date: "2026-05-24", requestReason: "Nhà tài trợ muốn hỗ trợ chi phí lớp may căn bản trong tháng 5.", accountantNote: "Đã đối chiếu sao kê ngân hàng.", recordedAt: "2026-05-24", history: ["Kế toán kiểm tra hợp lệ và ghi vào sổ vàng."] },
    { id: "DG-002", donorId: "NHT-002", donorName: "Nhom Ban Tre", donorType: "Ca nhan", phone: "0900000002", interest: "Dinh duong", kind: "Hien vat", amount: 1200000, itemName: "Sua hop", quantity: "20 thung", project: "Dinh duong tre em", status: "ChoNhapKho", date: "2026-05-25", requestReason: "Nhà tài trợ gửi sữa hộp để bổ sung dinh dưỡng cho trẻ em tại trung tâm.", accountantNote: "Hiện vật hợp lệ, chờ kho xác nhận nhập.", recordedAt: "2026-05-25", history: ["Kế toán phân loại hiện vật và chuyển kho tiếp nhận."] },
    { id: "DG-003", donorId: "", donorName: "Quy Ban Mai", donorType: "To chuc", phone: "0909123456", interest: "Y te", kind: "Chuyen khoan", amount: 2500000, itemName: "", quantity: "", project: "Tai kham dinh ky", status: "ChoKeToanXacNhan", date: "2026-05-30", isRecorded: false, requestReason: "Nhà tài trợ thông báo đã chuyển khoản hỗ trợ tái khám, kế toán cần kiểm tra sao kê trước khi ghi sổ.", accountantNote: "", history: ["Nhà tài trợ gửi yêu cầu quyên góp, chờ kế toán kiểm tra."] }
  ],
  volunteers: [
    { id: "TNV-001", name: "Pham Thi Kim Dung", skill: "Su pham", phone: "0911000001", availability: "Thu 7", status: "San sang" },
    { id: "TNV-002", name: "Le Hoang Nam", skill: "Y te", phone: "0911000002", availability: "Chu nhat", status: "San sang", username: "tnv" },
    { id: "TNV-003", name: "Nguyen Quang Vinh", skill: "Hau can", phone: "0911000003", availability: "Ca tuan", status: "Dang ban" }
  ],
  assignments: [
    { id: "PC-001", volunteerId: "TNV-002", volunteerName: "Le Hoang Nam", task: "Ho tro tai kham dinh ky", skill: "Y te", time: "2026-06-01T08:00", status: "Cho xac nhan", requester: "Lê Thu Hằng", requestReason: "Lịch tái khám cần người có kỹ năng y tế đi cùng thành viên.", history: ["Nhân viên phân công tình nguyện viên theo kỹ năng y tế."] }
  ],
  expenses: [
    { id: "CT-001", content: "Mua vai cho lop may", amount: 3200000, requester: "Co Huong", department: "Đào tạo nghề", evidence: "Hoa don vai VAT 000128", status: "ChoKeToan", requestReason: "Lớp may căn bản thiếu vải cotton cho học viên thực hành tuần tới.", accountantNote: "", directorNote: "", isRecorded: false, history: ["Nhân viên lập phiếu và gửi kế toán kiểm tra."] },
    { id: "CT-002", content: "Chi phi tai kham", amount: 850000, requester: "Nhan vien xa hoi", department: "Y tế", evidence: "Phieu hen + bao gia phong kham", status: "ChoBGD", requestReason: "Thành viên cần tái khám đúng hẹn, kế toán đã kiểm chứng phiếu hẹn và báo giá.", accountantNote: "Chứng từ hợp lệ, đã ghi nhận vào sổ chi chờ phê duyệt.", directorNote: "", isRecorded: true, recordedAt: "2026-05-26", history: ["Kế toán kiểm tra hợp lệ, ghi nhận vào sổ chi và chuyển Ban điều hành."] }
  ],
  bankLines: [
    { id: "BK-001", sender: "Cong ty ABC", amount: 5000000, date: "2026-05-24", status: "Khop", donationId: "DG-001" },
    { id: "BK-002", sender: "Khong ro nguoi gui", amount: 1200000, date: "2026-05-27", status: "Cho xac minh", donationId: "" }
  ],
  reminders: [
    { id: "NV-001", type: "Tai kham", title: "Tai kham cho Tran Van Binh", owner: "Le Hoang Nam", dueAt: "2026-06-01T08:00", channel: "Thong bao he thong", status: "Sap den han" },
    { id: "NV-002", type: "Kho", title: "Bo sung mau ve", owner: "Thu kho", dueAt: "2026-05-31T16:00", channel: "Thong bao he thong", status: "Khan cap" }
  ]
};

export const statusLabels = {
  ChoVangGia: "Cho vang gia",
  CanBoSung: "Can bo sung",
  ChoHoiDong: "Cho hoi dong",
  ChinhThuc: "Thanh vien chinh thuc",
  TuChoi: "Tu choi",
  ChoKeToan: "Yeu cau moi - cho ke toan kiem tra",
  ChoBGD: "Da ghi nhan - cho Ban dieu hanh duyet",
  DaPheDuyet: "Da phe duyet",
  TuChoiChi: "Tu choi",
  CanChinhSua: "Can chinh sua",
  ChoKeToanXacNhan: "Yeu cau moi - cho ke toan kiem tra",
  DaGhiSo: "Da ghi so chinh thuc",
  TuChoiDongGop: "Tu choi dong gop",
  ChoNhapKho: "Da ghi so - cho kho nhap hien vat",
  ChoXacNhan: "Cho xac nhan",
  DaXacNhan: "Da xac nhan",
  DaXacNhanTNV: "Da xac nhan",
  TuChoiTNV: "Tu choi"
};

export const loadMaisonData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMaisonData));
      return initialMaisonData;
    }
    return { ...initialMaisonData, ...JSON.parse(raw) };
  } catch {
    return initialMaisonData;
  }
};

export const saveMaisonData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("maison-data-updated"));
};

export const nextId = (prefix, collection, field = "id") => {
  const max = collection.reduce((value, item) => {
    const id = String(item[field] || "");
    const numeric = Number(id.replace(`${prefix}-`, ""));
    return Number.isFinite(numeric) ? Math.max(value, numeric) : value;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
};

export const today = () => new Date().toISOString().slice(0, 10);

export const formatMoney = (amount) =>
  Number(amount || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
