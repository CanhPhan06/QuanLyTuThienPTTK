const API_URL = "http://localhost:3000/api/finance";

export const recordDonation = async (maTK, maCD, soTien, phuongThuc) => {
  const response = await fetch(`${API_URL}/donate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maTK, maCD, soTien, phuongThuc }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to record donation");
  return data;
};

export const requestExpense = async (maCD, tenKhoanChi, soTien, mucDich, maNguoiChi) => {
  const response = await fetch(`${API_URL}/expense`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maCD, tenKhoanChi, soTien, mucDich, maNguoiChi }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to request expense");
  return data;
};

export const getCampaignFinanceSummary = async (maCD) => {
  const response = await fetch(`${API_URL}/campaign/${maCD}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch finance summary");
  return data;
};

export const attachExpenseProof = async (maChiTieu, hinhAnhUrl, loaiMinhChung, ghiChu) => {
  const response = await fetch(`${API_URL}/expense-proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maChiTieu, hinhAnhUrl, loaiMinhChung, ghiChu }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to attach expense proof");
  return data;
};
