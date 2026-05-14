const API_URL = "http://localhost:3000/api/logistics";

export const getInventory = async () => {
  const response = await fetch(`${API_URL}/inventory`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch inventory");
  return data;
};

export const stockIn = async (maCD, maLoai, soLuong) => {
  const response = await fetch(`${API_URL}/stock-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maCD, maLoai, soLuong }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to stock in");
  return data;
};

export const stockOut = async (maCD, maLoai, soLuong, nguoiNhan) => {
  const response = await fetch(`${API_URL}/stock-out`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maCD, maLoai, soLuong, nguoiNhan }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to stock out");
  return data;
};

export const getCampaignLogistics = async (maCD) => {
  const response = await fetch(`${API_URL}/campaign/${maCD}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch campaign logistics");
  return data;
};
