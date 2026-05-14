import { getConnection } from '../db.js';
import oracledb from 'oracledb';

export async function getInventory() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM LoaiVatPham ORDER BY TenLoai ASC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export async function stockIn(maCD, maLoai, soLuong) {
  let connection;
  try {
    connection = await getConnection();
    
    // Gọi SP Nhập kho
    await connection.execute(
      `BEGIN SP_NHAPKHO_VATPHAM(:p_MaCD, :p_MaLoai, :p_SL); END;`,
      { p_MaCD: maCD, p_MaLoai: maLoai, p_SL: soLuong }
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

export async function stockOut(maCD, maLoai, soLuong, nguoiNhan) {
  let connection;
  try {
    connection = await getConnection();
    
    // 1. Kiểm tra tồn kho
    const tonKhoResult = await connection.execute(
      `SELECT SoLuongTon, TenLoai FROM LoaiVatPham WHERE MaLoai = :maLoai`,
      { maLoai },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (tonKhoResult.rows.length === 0) {
      throw new Error('Vật phẩm không tồn tại.');
    }
    
    const tonKho = tonKhoResult.rows[0].SOLUONGTON || tonKhoResult.rows[0].SoLuongTon;
    const tenLoai = tonKhoResult.rows[0].TENLOAI || tonKhoResult.rows[0].TenLoai;
    
    if (soLuong > tonKho) {
      throw new Error(`Kho không đủ vật phẩm '${tenLoai}'. Hiện chỉ còn ${tonKho}.`);
    }
    
    // 2. Thực hiện xuất kho
    await connection.execute(
      `BEGIN SP_XUATKHO_VATPHAM(:p_MaCD, :p_MaLoai, :p_SL, :p_NguoiNhan); END;`,
      { p_MaCD: maCD, p_MaLoai: maLoai, p_SL: soLuong, p_NguoiNhan: nguoiNhan }
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

export async function getCampaignLogistics(maCD) {
  let connection;
  try {
    connection = await getConnection();
    
    const imports = await connection.execute(
      `SELECT p.MaPhieuQG as MaPhieu, p.NgayNhan as Ngay, 'Nhap' as LoaiPhieu, c.SoLuong, l.TenLoai
       FROM PhieuQuyenGopVP p
       JOIN ChiTietQuyenGopVP c ON p.MaPhieuQG = c.MaPhieuQG
       JOIN LoaiVatPham l ON c.MaLoai = l.MaLoai
       WHERE p.MaChienDich = :maCD
       ORDER BY p.NgayNhan DESC`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const exports = await connection.execute(
      `SELECT p.MaPhieuXuat as MaPhieu, p.NgayXuat as Ngay, 'Xuat' as LoaiPhieu, c.SoLuong, l.TenLoai, p.NguoiNhan
       FROM PhieuXuatVatPham p
       JOIN ChiTietXuatVP c ON p.MaPhieuXuat = c.MaPhieuXuat
       JOIN LoaiVatPham l ON c.MaLoai = l.MaLoai
       WHERE p.MaChienDich = :maCD
       ORDER BY p.NgayXuat DESC`,
      { maCD },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    return {
      imports: imports.rows,
      exports: exports.rows
    };
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}
