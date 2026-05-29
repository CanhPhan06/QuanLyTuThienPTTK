import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SystemModal from "../../components/common/SystemModal";
import { useAuth } from "../../context/AuthContext";
import { formatMoney, loadMaisonData, nextId, saveMaisonData, today } from "./maisonData";
import "./MaisonWorkflow.css";

const validateDonation = (donation) => {
  const errors = [];
  if (!donation.donorName?.trim()) errors.push("Thiếu tên nhà tài trợ.");
  if (!donation.project?.trim()) errors.push("Thiếu dự án/hạng mục nhận hỗ trợ.");
  if (!Number.isFinite(Number(donation.amount)) || Number(donation.amount) <= 0) errors.push("Giá trị quy đổi phải lớn hơn 0.");
  if (donation.kind === "Hien vat" && (!donation.itemName?.trim() || !donation.quantity?.trim())) {
    errors.push("Đóng góp hiện vật phải có tên hiện vật và số lượng.");
  }
  return errors;
};

const DonorLedgerPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(loadMaisonData);
  const [form, setForm] = useState({
    donorName: "",
    donorType: "Ca nhan",
    phone: "",
    interest: "Dao tao nghe",
    kind: "Chuyen khoan",
    amount: 1000000,
    itemName: "",
    quantity: "",
    project: "Lop may can ban"
  });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "success" });
  const isAdmin = ["AdminKeToan", "BanQuanLy"].includes(user?.VaiTro);

  const totalDonations = useMemo(
    () => data.donations.filter((item) => ["DaGhiSo", "ChoNhapKho", "Da xac nhan"].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [data.donations]
  );

  const persist = (nextData) => {
    setData(nextData);
    saveMaisonData(nextData);
  };

  const saveDonation = (event) => {
    event.preventDefault();
    const donorName = form.donorName.trim();
    if (!donorName) return;
    const existing = data.donors.find((item) => item.name.toLowerCase() === donorName.toLowerCase());
    const donation = {
      id: nextId("DG", data.donations),
      donorId: existing?.id || "",
      donorName,
      donorType: form.donorType,
      phone: form.phone,
      interest: form.interest,
      kind: form.kind,
      amount: Number(form.amount || 0),
      itemName: form.itemName,
      quantity: form.quantity,
      project: form.project,
      status: "ChoKeToanXacNhan",
      date: today(),
      isRecorded: false,
      accountantNote: "",
      history: [`${user?.HoTen || "Nhà tài trợ"} gửi yêu cầu đóng góp, chờ kế toán kiểm tra.`]
    };
    const errors = validateDonation(donation);
    if (errors.length > 0) {
      setModal({ isOpen: true, title: "Yêu cầu đóng góp chưa hợp lệ", message: errors.join("\n"), type: "warning" });
      return;
    }

    persist({ ...data, donations: [donation, ...data.donations] });
    setModal({ isOpen: true, title: "Đã tạo yêu cầu đóng góp", message: `Phiếu ${donation.id} đang chờ kế toán kiểm tra. Sổ vàng chưa thay đổi.`, type: "success" });
  };

  const confirmDonation = (id) => {
    const donation = data.donations.find((item) => item.id === id);
    const errors = validateDonation(donation || {});
    if (errors.length > 0) {
      setModal({ isOpen: true, title: "Không thể ghi sổ vàng", message: errors.join("\n"), type: "warning" });
      return;
    }
    const existing = data.donors.find((item) => item.id === donation.donorId || item.name.toLowerCase() === donation.donorName.toLowerCase());
    const donorId = existing?.id || nextId("NHT", data.donors);
    const donors = existing
      ? data.donors.map((item) => item.id === donorId ? { ...item, total: Number(item.total || 0) + Number(donation.amount || 0), lastDonation: today(), interest: donation.interest || item.interest } : item)
      : [{ id: donorId, name: donation.donorName, type: donation.donorType || "Ca nhan", phone: donation.phone || "", interest: donation.interest || "Chưa phân loại", total: Number(donation.amount || 0), lastDonation: today() }, ...data.donors];
    const donations = data.donations.map((item) => item.id === id ? {
      ...item,
      donorId,
      status: item.kind === "Hien vat" ? "ChoNhapKho" : "DaGhiSo",
      isRecorded: true,
      recordedAt: today(),
      accountantNote: "Kế toán đã kiểm tra hợp lệ và ghi sổ vàng.",
      history: ["Kế toán xác nhận hợp lệ và ghi sổ vàng.", ...(item.history || [])]
    } : item);
    persist({ ...data, donors, donations });
    setModal({ isOpen: true, title: "Đã ghi sổ vàng", message: "Khoản đóng góp đã được kiểm tra hợp lệ, lúc này mới lưu chính thức vào hệ thống.", type: "success" });
  };

  const rejectDonation = (id) => {
    persist({
      ...data,
      donations: data.donations.map((item) => item.id === id ? {
        ...item,
        status: "TuChoiDongGop",
        isRecorded: false,
        accountantNote: "Kế toán từ chối vì thông tin chưa hợp lệ.",
        history: ["Kế toán từ chối ghi sổ, yêu cầu nhà tài trợ/nhân viên bổ sung.", ...(item.history || [])]
      } : item)
    });
    setModal({ isOpen: true, title: "Đã từ chối yêu cầu", message: "Khoản này chưa được ghi vào sổ vàng.", type: "warning" });
  };

  return (
    <MainLayout>
      <SystemModal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      <div className="mc-page">
        <header className="mc-header">
          <div>
            <span className="mc-eyebrow">UC5 - Kế toán / Nhà hảo tâm</span>
            <h1>Sổ vàng nhà hảo tâm & tiếp nhận đóng góp</h1>
            <p>Lưu hồ sơ nhà hảo tâm, ghi nhận tiền/hiện vật và xuất phiếu xác nhận đóng góp.</p>
          </div>
          <div className="mc-role-card"><span>Tài khoản sử dụng</span><strong>{user?.TenDangNhap || "admin"} - Kế toán/Ban quản lý</strong></div>
        </header>

        <section className="mc-kpi-grid">
          <div className="mc-kpi"><strong>{data.donors.length}</strong><span>Nhà hảo tâm</span></div>
          <div className="mc-kpi"><strong>{data.donations.length}</strong><span>Lượt đóng góp</span></div>
          <div className="mc-kpi"><strong>{formatMoney(totalDonations)}</strong><span>Tổng giá trị</span></div>
          <div className="mc-kpi"><strong>{data.donations.filter((item) => item.status !== "Da xac nhan").length}</strong><span>Chờ xử lý</span></div>
        </section>

        <section className="mc-grid wide-left">
          <div className="mc-card">
            <h2>Tiếp nhận yêu cầu đóng góp</h2>
            <form className="mc-form" onSubmit={saveDonation}>
              <label>Nhà hảo tâm<input required value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} /></label>
              <label>Loại nhà hảo tâm<select value={form.donorType} onChange={(e) => setForm({ ...form, donorType: e.target.value })}><option>Ca nhan</option><option>To chuc</option></select></label>
              <label>Số điện thoại<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label>Lĩnh vực quan tâm<select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}><option>Dao tao nghe</option><option>Y te</option><option>Dinh duong</option><option>Nha o</option></select></label>
              <label>Hình thức<select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}><option>Chuyen khoan</option><option>Tien mat</option><option>Hien vat</option></select></label>
              <label>Giá trị quy đổi<input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
              <label>Tên hiện vật<input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="Nếu có" /></label>
              <label>Số lượng hiện vật<input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="VD: 20 thùng" /></label>
              <label className="mc-full">Dự án/hoạt động nhận hỗ trợ<input value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} /></label>
              <div className="mc-actions mc-full"><button className="mc-btn" type="submit">Gửi yêu cầu cho kế toán</button></div>
            </form>
          </div>

          <div className="mc-card">
            <h2>Hồ sơ nhà hảo tâm</h2>
            <div className="mc-list">
              {data.donors.map((donor) => (
                <div className="mc-list-item" key={donor.id}>
                  <strong>{donor.name}</strong>
                  <p>{donor.type} - Quan tâm: {donor.interest}</p>
                  <p>Tổng đóng góp: {formatMoney(donor.total)} - Lần gần nhất: {donor.lastDonation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mc-card">
          <h2>Lịch sử đóng góp</h2>
          <table className="mc-table">
            <thead><tr><th>Mã phiếu</th><th>Nhà hảo tâm</th><th>Hình thức</th><th>Giá trị</th><th>Dự án</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {data.donations.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.donorName}</td><td>{item.kind}</td><td>{formatMoney(item.amount)}</td><td>{item.project}</td>
                  <td><span className={`mc-tag ${["DaGhiSo", "Da xac nhan"].includes(item.status) ? "good" : item.status === "TuChoiDongGop" ? "bad" : "warn"}`}>{item.status}</span></td>
                  <td className="mc-two-actions">
                    {isAdmin && item.status === "ChoKeToanXacNhan" && <button className="mc-btn secondary" onClick={() => confirmDonation(item.id)}>Kiểm tra hợp lệ & ghi sổ</button>}
                    {isAdmin && item.status === "ChoKeToanXacNhan" && <button className="mc-btn danger" onClick={() => rejectDonation(item.id)}>Không hợp lệ</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </MainLayout>
  );
};

export default DonorLedgerPage;
