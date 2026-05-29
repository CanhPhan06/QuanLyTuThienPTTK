// frontend/services/executive.js
const API_URL = "http://localhost:3000/api";

export const getEnrollmentsForBDH = async (maTK) => {
  const response = await fetch(`${API_URL}/executive/enrollments/${maTK}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Không thể tải danh sách đăng ký");
  }
  return response.json();
};

export const approveEnrollment = async (maThamGia, status, expectedCount) => {
  const response = await fetch(`${API_URL}/executive/enrollments/${maThamGia}/approve`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, expectedCount })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Cập nhật trạng thái thất bại");
  }
  return data;
};

export const assignTask = async (assignmentData) => {
  const response = await fetch(`${API_URL}/executive/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assignmentData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Phân công nhiệm vụ thất bại");
  }
  return data;
};

const BDH_URL = "http://localhost:3000/api/bdh";

export const getEvaluationList = async (maCD) => {
  const response = await fetch(`${BDH_URL}/evaluation/list/${maCD}`);
  return await response.json();
};

export const approveEvaluation = async (id, diem) => {
  const response = await fetch(`${BDH_URL}/evaluation/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maThamGia: id, diem }),
  });
  return await response.json();
};

export const rejectEvaluation = async (maThamGia, lyDo, proofUrl) => {
  const response = await fetch(`${BDH_URL}/evaluation/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maThamGia, lyDo, proofUrl })
  });
  return await response.json();
};

export const getAssignedCampaign = async (maTK) => {
  const response = await fetch(`${BDH_URL}/assigned-campaign/${maTK}`);
  if (!response.ok) throw new Error("Không thể lấy chiến dịch được giao");
  return await response.json();
};
