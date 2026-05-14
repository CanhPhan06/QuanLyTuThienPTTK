import oracledb from 'oracledb';

// Force thin mode (pure JS, no C++)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [ oracledb.CLOB ];

const dbConfig = {
  user: 'hqtcsdldb',
  password: 'hqtcsdl123',
  connectString: 'localhost:1521/orcl' // Tweak as necessary
};

export async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error("Lỗi kết nối Oracle DB:", err);
    throw err;
  }
}

export async function executeQuery(sql, binds = {}, autoCommit = false) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: autoCommit
    });
    return result;
  } catch (err) {
    console.error("Lỗi executeQuery:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export default {
  getConnection,
  executeQuery
};
