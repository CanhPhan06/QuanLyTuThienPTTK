const API_URL = 'http://localhost:3000/api/statistics';

export const getCampaignEfficiency = async (campaignId) => {
  const response = await fetch(`${API_URL}/campaign/${campaignId}/efficiency`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi tải báo cáo hiệu quả');
  }
  return await response.json();
};

export const getTopContributors = async () => {
  const response = await fetch(`${API_URL}/top-contributors`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi tải bảng xếp hạng');
  }
  return await response.json();
};

export const getParameters = async () => {
  const response = await fetch(`${API_URL}/parameters`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi tải tham số');
  }
  return await response.json();
};

export const updateParameter = async (maTS, giaTriMoi) => {
  const response = await fetch(`${API_URL}/parameters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maTS, giaTriMoi })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi cập nhật tham số');
  }
  return await response.json();
};
