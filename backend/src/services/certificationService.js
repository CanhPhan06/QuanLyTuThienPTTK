import { executeQuery } from '../db.js';

export const issueCertificates = async (campaignId) => {
  const sql = `
    BEGIN
      SP_CAP_CHUNGNHAN_CD(:campaignId);
    END;
  `;
  await executeQuery(sql, { campaignId }, true);
  return { success: true };
};

export const getEligibleVolunteers = async (campaignId) => {
   const sql = `
    SELECT tg.MaThamGia, tk.HoTen, hs.MaSoSinhVien, tg.TrangThaiDuyet, SF_GET_XEP_LOAI(tg.MaThamGia) AS XepLoai,
           (SELECT NVL(SUM(SoGioGhiNhan), 0) FROM DiemDanh dd WHERE dd.MaThamGia = tg.MaThamGia) AS TongGio
    FROM ThamGiaTNV tg
    JOIN TaiKhoan tk ON tg.MaTaiKhoan = tk.MaTaiKhoan
    LEFT JOIN HoSoSinhVien hs ON tk.MaTaiKhoan = hs.MaTaiKhoan
    WHERE tg.MaChienDich = :campaignId AND tg.TrangThaiDuyet = 'HoanThanh'
  `;
  const result = await executeQuery(sql, { campaignId });
  return result.rows;
};

export const getCertificatesByCampaign = async (campaignId) => {
  const sql = `
    SELECT g.MaChungNhan, g.MaThamGia, g.NgayCap, g.XepLoai, tk.HoTen, hs.MaSoSinhVien
    FROM GiayChungNhan g
    JOIN ThamGiaTNV tg ON g.MaThamGia = tg.MaThamGia
    JOIN TaiKhoan tk ON tg.MaTaiKhoan = tk.MaTaiKhoan
    LEFT JOIN HoSoSinhVien hs ON tk.MaTaiKhoan = hs.MaTaiKhoan
    WHERE tg.MaChienDich = :campaignId
  `;
  const result = await executeQuery(sql, { campaignId });
  return result.rows;
};

export const getMyCertificates = async (username) => {
  const sql = `
    SELECT g.MaChungNhan, g.NgayCap, g.XepLoai, cd.TenChienDich, cd.NgayBatDau, cd.NgayKetThuc, tk.HoTen, hs.MaSoSinhVien
    FROM GiayChungNhan g
    JOIN ThamGiaTNV tg ON g.MaThamGia = tg.MaThamGia
    JOIN ChienDich cd ON tg.MaChienDich = cd.MaChienDich
    JOIN TaiKhoan tk ON tg.MaTaiKhoan = tk.MaTaiKhoan
    LEFT JOIN HoSoSinhVien hs ON tk.MaTaiKhoan = hs.MaTaiKhoan
    WHERE tg.MaTaiKhoan = :username
  `;
  const result = await executeQuery(sql, { username });
  return result.rows;
};
