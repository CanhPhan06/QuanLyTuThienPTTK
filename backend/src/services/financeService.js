import { getConnection } from '../db.js';
import oracledb from 'oracledb';
import fs from 'fs';
import path from 'path';

export async function recordDonation(maTK, maCD, soTien, phuongThuc) {
  let connection;
  try {
    connection = await getConnection();

    const nextId = async (tableName, columnName, prefix) => {
      const result = await connection.execute(
        `SELECT NVL(MAX(TO_NUMBER(REGEXP_SUBSTR(${columnName}, '[0-9]+$'))), 0) + 1 AS NEXT_ID
         FROM ${tableName}
         WHERE REGEXP_LIKE(${columnName}, '^${prefix}[0-9]+$')`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return `${prefix}${String(result.rows[0].NEXT_ID).padStart(8, '0')}`;
    };

    const maQuyenGop = await nextId('QuyenGopTien', 'MaQuyenGop', 'QG');
    const maThanhToan = await nextId('ThanhToan', 'MaThanhToan', 'TT');
    const maGiaoDich = `TXN${Date.now()}`;

    const campaignResult = await connection.execute(
      `SELECT NgayBatDau, NgayKetThuc FROM ChienDich WHERE MaChienDich = :maCD`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (campaignResult.rows.length === 0) {
      throw new Error('Không tìm thấy chiến dịch để ghi nhận quyên góp.');
    }
    const campaign = campaignResult.rows[0];
    const startDate = campaign.NGAYBATDAU || campaign.NgayBatDau;
    const endDate = campaign.NGAYKETTHUC || campaign.NgayKetThuc;
    const now = new Date();
    const ngayBaoCao = endDate && now > new Date(endDate) ? endDate : startDate;

    await connection.execute(
      `INSERT INTO QuyenGopTien(MaQuyenGop, MaTaiKhoan, MaChienDich, SoTien, NgayGiaoDich, PhuongThuc, LoiNhan)
       VALUES (:maQuyenGop, :maTK, :maCD, :soTien, :ngayBaoCao, :phuongThuc, 'Ghi nhận từ màn hình tài trợ')`,
      { maQuyenGop, maTK, maCD, soTien, ngayBaoCao, phuongThuc: phuongThuc || 'ChuyenKhoan' }
    );

    await connection.execute(
      `INSERT INTO ThanhToan(MaThanhToan, MaQuyenGop, TrangThaiThanhToan, MaGiaoDichNganHang, NgayThanhToan)
       VALUES (:maThanhToan, :maQuyenGop, 'ThanhCong', :maGiaoDich, :ngayBaoCao)`,
      { maThanhToan, maQuyenGop, maGiaoDich, ngayBaoCao }
    );

    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}
export async function requestExpense(maCD, tenKhoanChi, soTien, mucDich, maNguoiChi, hinhAnhUrl) {
  let connection;
  try {
    connection = await getConnection();
    
    // 1. Kiểm tra ngân quỹ khả dụng bằng SF_TINH_NGAN_QUY_CD
    const checkResult = await connection.execute(
      `BEGIN :ret := SF_TINH_NGAN_QUY_CD(:p_MaCD); END;`,
      {
        ret: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        p_MaCD: maCD
      }
    );
    
    const remainingBudget = checkResult.outBinds.ret;
    
    // 2. Validate Budget
    if (soTien > remainingBudget) {
      throw new Error(`Ngân quỹ không đủ. Số dư khả dụng hiện tại là: ${remainingBudget.toLocaleString()} VNĐ`);
    }
    
    // 3. Thực hiện tạo khoản chi
    await connection.execute(
      `BEGIN SP_THEM_PHIEU_CHI(:p_MaCD, :p_SoTien, :p_MucDich); END;`,
      { p_MaCD: maCD, p_SoTien: soTien, p_MucDich: mucDich }
    );
    
    // 4. Cập nhật thêm thông tin chi tiết
    const ctResult = await connection.execute(
      `SELECT MaChiTieu FROM ChiTieu 
       WHERE MaChienDich = :maCD AND SoTienChi = :soTien 
       ORDER BY MaChiTieu DESC FETCH FIRST 1 ROWS ONLY`,
      { maCD, soTien },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (ctResult.rows.length > 0) {
      const maChiTieu = ctResult.rows[0].MACHITIEU || ctResult.rows[0].MaChiTieu;
      
      // 5. Tạo minh chứng ngay lập tức
      const mcResult = await connection.execute(
        `INSERT INTO MinhChungChiTieu(MaMinhChung, HinhAnh_URL, LoaiMinhChung, NgayCapNhat, GhiChu)
         VALUES ('MC' || LPAD(s_minhchungct_id.NEXTVAL, 8, '0'), :hinhAnhUrl, 'HoaDon', SYSDATE, :ghiChu)
         RETURNING MaMinhChung INTO :maMinhChungOut`,
        { 
          hinhAnhUrl, 
          ghiChu: `Tự động tạo từ yêu cầu chi: ${tenKhoanChi}`,
          maMinhChungOut: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        }
      );
      const maMinhChung = mcResult.outBinds.maMinhChungOut[0];

      // 6. Cập nhật khoản chi và người chi
      await connection.execute(
        `UPDATE ChiTieu SET TenKhoanChi = :tenKhoanChi, MaNguoiChi = :maNguoiChi, MaMinhChung = :maMinhChung WHERE MaChiTieu = :maChiTieu`,
        { tenKhoanChi, maNguoiChi, maMinhChung, maChiTieu }
      );

      // 7. Ghi Log Audit (Truy vết)
      try {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const logFile = path.join(logDir, 'finance_audit.log');
        const logEntry = `[${new Date().toLocaleString('vi-VN')}] | USER: ${maNguoiChi} | ACTION: REQUEST_EXPENSE | CD: ${maCD} | AMOUNT: ${soTien.toLocaleString()} | NAME: ${tenKhoanChi} | PROOF: ${hinhAnhUrl}\n`;
        fs.appendFileSync(logFile, logEntry);
      } catch (logErr) {
        console.error('Failed to write audit log:', logErr);
      }
    }
    
    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export async function getCampaignFinanceSummary(maCD) {
  let connection;
  try {
    connection = await getConnection();
    
    const budgetResult = await connection.execute(
      `BEGIN :ret := SF_TINH_NGAN_QUY_CD(:p_MaCD); END;`,
      {
        ret: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        p_MaCD: maCD
      }
    );
    
    const totalDonationsResult = await connection.execute(
      `SELECT SUM(SoTien) as Total FROM QuyenGopTien WHERE MaChienDich = :maCD`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const totalExpensesResult = await connection.execute(
      `SELECT SUM(SoTienChi) as Total FROM ChiTieu WHERE MaChienDich = :maCD`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const expensesList = await connection.execute(
      `SELECT c.*, m.HinhAnh_URL, m.GhiChu as MinhChungGhiChu 
       FROM ChiTieu c 
       LEFT JOIN MinhChungChiTieu m ON c.MaMinhChung = m.MaMinhChung
       WHERE c.MaChienDich = :maCD ORDER BY c.NgayChi DESC`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const totalDonations = totalDonationsResult.rows[0].TOTAL || totalDonationsResult.rows[0].Total || 0;
    const totalExpenses = totalExpensesResult.rows[0].TOTAL || totalExpensesResult.rows[0].Total || 0;
    
    return {
      remainingBudget: budgetResult.outBinds.ret || 0,
      totalDonations,
      totalExpenses,
      expensesList: expensesList.rows
    };
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export async function attachExpenseProof(maChiTieu, hinhAnhUrl, loaiMinhChung, ghiChu) {
  let connection;
  try {
    connection = await getConnection();
    
    // 1. Tạo minh chứng
    const result = await connection.execute(
      `INSERT INTO MinhChungChiTieu(MaMinhChung, HinhAnh_URL, LoaiMinhChung, NgayCapNhat, GhiChu)
       VALUES ('MC' || LPAD(s_minhchungct_id.NEXTVAL, 8, '0'), :hinhAnhUrl, :loaiMinhChung, SYSDATE, :ghiChu)
       RETURNING MaMinhChung INTO :maMinhChungOut`,
      { 
        hinhAnhUrl, loaiMinhChung, ghiChu,
        maMinhChungOut: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      }
    );
    
    const maMinhChung = result.outBinds.maMinhChungOut[0];
    
    // 2. Cập nhật khoản chi
    await connection.execute(
      `UPDATE ChiTieu SET MaMinhChung = :maMinhChung WHERE MaChiTieu = :maChiTieu`,
      { maMinhChung, maChiTieu }
    );
    
    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}
