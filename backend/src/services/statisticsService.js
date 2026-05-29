import { executeQuery, getConnection } from '../db.js';
import oracledb from 'oracledb';

export const getCampaignEfficiency = async (campaignId) => {
  const sql = `
    BEGIN
      SP_BAOCAO_HIEUQUA_CD(:campaignId, :cursor);
    END;
  `;
  const binds = {
    campaignId,
    cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
  };
  
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, binds);
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();
    await resultSet.close();
    
    if (rows.length > 0) {
      return {
         TongThu: rows[0][0] || 0,
         TongChi: rows[0][1] || 0
      };
    }
    return { TongThu: 0, TongChi: 0 };
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) {}
    }
  }
};

export async function getCampaignStats(maCD) {
  let connection;
  try {
    connection = await getConnection();
    
    // Get campaign dates to calculate weeks
    const campaignRes = await connection.execute(
      `SELECT NgayBatDau, NVL(NgayKetThuc, SYSDATE) as NgayKetThuc FROM ChienDich WHERE MaChienDich = :maCD`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (campaignRes.rows.length === 0) return { income: 0, expense: 0, weekly: [] };
    
    const start = campaignRes.rows[0].NGAYBATDAU || campaignRes.rows[0].NgayBatDau;
    const end = campaignRes.rows[0].NGAYKETTHUC || campaignRes.rows[0].NgayKetThuc;
    const totalDays = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    const numWeeks = Math.ceil(totalDays / 7) || 1;

    // Weekly breakdown query using CTE
    const weeklySql = `
      WITH DateRanges AS (
        SELECT 
          LEVEL as WeekNum,
          TO_DATE(:startStr, 'YYYY-MM-DD') + (LEVEL - 1) * 7 as WStart,
          TO_DATE(:startStr, 'YYYY-MM-DD') + LEVEL * 7 as WEnd
        FROM DUAL
        CONNECT BY LEVEL <= :numWeeks
      )
      SELECT 
        dr.WeekNum,
        (
          SELECT NVL(SUM(GiaTriTaiTro), 0) FROM TaiTro 
          WHERE MaChienDich = :maCD AND NgayTaiTro >= dr.WStart AND NgayTaiTro < dr.WEnd
        ) + (
          SELECT NVL(SUM(SoTien), 0) FROM QuyenGopTien qg
          JOIN ThanhToan tt ON qg.MaQuyenGop = tt.MaQuyenGop
          WHERE qg.MaChienDich = :maCD AND tt.TrangThaiThanhToan = 'ThanhCong'
            AND qg.NgayGiaoDich >= dr.WStart AND qg.NgayGiaoDich < dr.WEnd
        ) as Income,
        (
          SELECT NVL(SUM(SoTienChi), 0) FROM ChiTieu 
          WHERE MaChienDich = :maCD AND NgayChi >= dr.WStart AND NgayChi < dr.WEnd
        ) as Expense
      FROM DateRanges dr
      ORDER BY dr.WeekNum
    `;

    const startStr = new Date(start).toISOString().split('T')[0];
    const weeklyRes = await connection.execute(weeklySql, { maCD, startStr, numWeeks }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const weeklyData = weeklyRes.rows.map(row => ({
      week: `Tuần ${row.WEEKNUM || row.WeekNum}`,
      income: row.INCOME || row.Income || 0,
      expense: row.EXPENSE || row.Expense || 0
    }));

    const totalIncome = weeklyData.reduce((sum, w) => sum + w.income, 0);
    const totalExpense = weeklyData.reduce((sum, w) => sum + w.expense, 0);

    return {
      income: totalIncome,
      expense: totalExpense,
      weekly: weeklyData
    };
  } finally {
    if (connection) await connection.close();
  }
}

export async function getCampaignTopVolunteers(maCD) {
  let connection;
  try {
    connection = await getConnection();
    const sql = `
      SELECT * FROM (
        SELECT 
          hs.HoTen, 
          hs.MaTaiKhoan,
          (
            SELECT NVL(SUM((cv.ThoiGianKetThuc - cv.ThoiGianBatDau) * 24), 0)
            FROM PhanCong pc
            JOIN CongViec cv ON pc.MaCongViec = cv.MaCongViec
            WHERE pc.MaThamGia = t.MaThamGia AND pc.TrangThai != 'HuyBo'
          ) as TongGio,
          t.DiemDanhGia,
          SF_GET_XEP_LOAI(t.MaThamGia) as XepLoai
        FROM ThamGiaTNV t
        JOIN HoSoSinhVien hs ON t.MaTaiKhoan = hs.MaTaiKhoan
        WHERE t.MaChienDich = :maCD
        ORDER BY TongGio DESC, t.DiemDanhGia DESC
      ) WHERE ROWNUM <= 5
    `;
    const res = await connection.execute(sql, { maCD }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return res.rows;
  } finally {
    if (connection) await connection.close();
  }
}

export const getTopContributors = async () => {
  const sql = `
    SELECT tk.MaTaiKhoan, tk.HoTen, hs.Khoa, SF_TINH_TONG_GIO_TNV(tk.MaTaiKhoan) as TongGio
    FROM TaiKhoan tk
    LEFT JOIN HoSoSinhVien hs ON tk.MaTaiKhoan = hs.MaTaiKhoan
    WHERE tk.VaiTro = 'TinhNguyenVien'
    ORDER BY TongGio DESC
    FETCH FIRST 5 ROWS ONLY
  `;
  const result = await executeQuery(sql);
  return result.rows;
};

export const getParameters = async () => {
  const sql = `SELECT MaThamSo, TenThamSo, GiaTri, GhiChu FROM ThamSo ORDER BY MaThamSo`;
  const result = await executeQuery(sql);
  return result.rows;
};

export const updateParameter = async (maTS, giaTriMoi, giaTriCu) => {
  if (giaTriCu !== undefined && giaTriCu !== null) {
    const current = await executeQuery(
      `SELECT GiaTri FROM ThamSo WHERE MaThamSo = :maTS`,
      { maTS }
    );
    const currentValue = String(current.rows[0]?.GIATRI ?? current.rows[0]?.GiaTri ?? '');
    if (currentValue !== String(giaTriCu)) {
      const error = new Error('Dữ liệu đã được người dùng khác cập nhật. Vui lòng tải lại trước khi chỉnh sửa.');
      error.status = 409;
      throw error;
    }
  }

  const sql = `
    BEGIN
      SP_THAYDOI_THAMSO(:maTS, :giaTriMoi);
    END;
  `;
  await executeQuery(sql, { maTS, giaTriMoi }, true);
  return { success: true };
};
