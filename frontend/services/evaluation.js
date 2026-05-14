const API_URL = 'http://localhost:3000/api/evaluation';

export const getVolunteersByCampaign = async (campaignId) => {
  const response = await fetch(`${API_URL}/campaigns/${campaignId}/volunteers`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi khi tải danh sách tình nguyện viên');
  }
  return await response.json();
};

export const evaluateVolunteer = async (maThamGia, diem, nhanXet) => {
  const response = await fetch(`${API_URL}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maThamGia, diem, nhanXet })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Lỗi khi đánh giá');
  }
  return await response.json();
};
