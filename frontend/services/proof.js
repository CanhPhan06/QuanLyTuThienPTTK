const API_URL = "http://localhost:3000/api/proof";

export const uploadProof = async (maThamGia, hinhAnhUrl, loai) => {
  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maThamGia, hinhAnhUrl, loai }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to upload proof");
  return data;
};

export const getCampaignProofs = async (maCD) => {
  const response = await fetch(`${API_URL}/campaign/${maCD}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch proofs");
  return data;
};

export const getParticipantTasks = async (maThamGia) => {
  const response = await fetch(`${API_URL}/tasks/${maThamGia}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch participant tasks");
  return data;
};

export const verifyProof = async (maPhanCong, trangThai) => {
  const response = await fetch(`${API_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maPhanCong, trangThai }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to verify proof");
  return data;
};
