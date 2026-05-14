// frontend/services/campaigns.js
const API_URL = "http://localhost:3000/api";

export const getCampaigns = async () => {
  const response = await fetch(`${API_URL}/campaigns`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Không thể tải danh sách chiến dịch");
  }
  return response.json();
};

export const createCampaign = async (campaignData) => {
  const response = await fetch(`${API_URL}/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaignData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Tạo chiến dịch thất bại");
  }
  return data;
};

export const enrollCampaign = async (campaignId, maTK) => {
  const response = await fetch(`${API_URL}/campaigns/${campaignId}/enroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maTK })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Đăng ký thất bại");
  }
  return data;
};

export const getMyEnrollments = async (maTK) => {
  const response = await fetch(`${API_URL}/campaigns/my-enrollments/${maTK}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Không thể tải lịch sử đăng ký");
  }
  return response.json();
};
