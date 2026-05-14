const API_URL = 'http://localhost:3000/api/certification';

export const issueCertificates = async (campaignId) => {
  const response = await fetch(`${API_URL}/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaignId })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi khi cấp chứng nhận');
  }
  return await response.json();
};

export const getEligibleVolunteers = async (campaignId) => {
  const response = await fetch(`${API_URL}/eligible/${campaignId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi tải danh sách đủ điều kiện');
  }
  return await response.json();
};

export const getCertificatesByCampaign = async (campaignId) => {
  const response = await fetch(`${API_URL}/campaign/${campaignId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi tải danh sách chứng nhận');
  }
  return await response.json();
};

export const getMyCertificates = async (username) => {
  const response = await fetch(`${API_URL}/my-certificates?username=${username}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi tải chứng nhận của bạn');
  }
  return await response.json();
};
