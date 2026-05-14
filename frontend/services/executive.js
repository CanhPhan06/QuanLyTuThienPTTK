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

export const approveEnrollment = async (maThamGia, status) => {
  const response = await fetch(`${API_URL}/executive/enrollments/${maThamGia}/approve`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
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
