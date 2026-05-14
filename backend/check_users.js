import { getConnection } from './src/db.js';

async function checkUsers() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT MaTaiKhoan, TenDangNhap, VaiTro FROM TaiKhoan ORDER BY MaTaiKhoan ASC`
    );
    console.log(result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) await connection.close();
  }
}
checkUsers();
