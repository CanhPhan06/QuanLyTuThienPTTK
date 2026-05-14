import { executeQuery } from '../db.js';

export const getVolunteersByCampaign = async (campaignId) => {
  const sql = `
    SELECT tg.MaThamGia, tk.HoTen, hs.MaSoSinhVien, tg.DiemDanhGia,
           SF_GET_XEP_LOAI(tg.MaThamGia) AS XepLoai,
           (SELECT NVL(SUM(SoGioGhiNhan), 0) FROM DiemDanh dd WHERE dd.MaThamGia = tg.MaThamGia) AS TongGio
    FROM ThamGiaTNV tg
    JOIN TaiKhoan tk ON tg.MaTaiKhoan = tk.MaTaiKhoan
    LEFT JOIN HoSoSinhVien hs ON tk.MaTaiKhoan = hs.MaTaiKhoan
    WHERE tg.MaChienDich = :campaignId
      AND tg.TrangThaiDuyet IN ('DaDuyet', 'HoanThanh')
  `;
  const result = await executeQuery(sql, { campaignId });
  return result.rows;
};

export const evaluateVolunteer = async (maThamGia, diem, nhanXet) => {
  const sql = `
    BEGIN
      SP_DANHGIA_TNV(:maThamGia, :diem, :nhanXet);
    END;
  `;
  await executeQuery(sql, { maThamGia, diem, nhanXet }, true);
  return { success: true };
};
