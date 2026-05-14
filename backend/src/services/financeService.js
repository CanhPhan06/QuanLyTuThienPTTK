import { getConnection } from '../db.js';
import oracledb from 'oracledb';

export async function recordDonation(maTK, maCD, soTien, phuongThuc) {
  let connection;
  try {
    connection = await getConnection();
    
    // 1. Ghi nhận quyên góp qua Stored Procedure
    await connection.execute(
      `BEGIN SP_GHI_NHAN_QUYENGOP(:p_MaTK, :p_MaCD, :p_SoTien); END;`,
      { p_MaTK: maTK, p_MaCD: maCD, p_SoTien: soTien }
    );
    
    // 2. Lấy lại mã quyên góp vừa tạo
    const qgResult = await connection.execute(
      `SELECT MaQuyenGop FROM QuyenGopTien 
       WHERE MaTaiKhoan = :maTK AND MaChienDich = :maCD AND SoTien = :soTien 
       ORDER BY MaQuyenGop DESC FETCH FIRST 1 ROWS ONLY`,
      { maTK, maCD, soTien },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (qgResult.rows.length > 0) {
      const maQuyenGop = qgResult.rows[0].MAQUYENGOP || qgResult.rows[0].MaQuyenGop;
      
      // 3. Cập nhật phương thức nếu cần (SP hardcode ChuyenKhoan)
      if (phuongThuc && phuongThuc !== 'ChuyenKhoan') {
        await connection.execute(
          `UPDATE QuyenGopTien SET PhuongThuc = :phuongThuc WHERE MaQuyenGop = :maQuyenGop`,
          { phuongThuc, maQuyenGop }
        );
      }
      
      // 4. Tạo record thanh toán
      await connection.execute(
        `INSERT INTO ThanhToan(MaThanhToan, MaQuyenGop, TrangThaiThanhToan, MaGiaoDichNganHang, NgayThanhToan)
         VALUES ('TT' || LPAD(s_thanhtoan_id.NEXTVAL, 8, '0'), :maQuyenGop, 'ThanhCong', 'TXN' || ROUND(DBMS_RANDOM.VALUE(100000, 999999)), SYSDATE)`,
        { maQuyenGop }
      );
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

export async function requestExpense(maCD, tenKhoanChi, soTien, mucDich, maNguoiChi) {
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
      await connection.execute(
        `UPDATE ChiTieu SET TenKhoanChi = :tenKhoanChi, MaNguoiChi = :maNguoiChi WHERE MaChiTieu = :maChiTieu`,
        { tenKhoanChi, maNguoiChi, maChiTieu }
      );
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
