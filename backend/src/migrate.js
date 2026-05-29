import oracledb from 'oracledb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  user: 'hqtcsdldb',
  password: 'hqtcsdl123',
  connectString: 'localhost:1522/XE'
};

async function migrate(fileName) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log("Connected to Oracle DB");

    const sqlPath = path.join(__dirname, '..', '..', 'database', fileName);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by ';' and execute each command
    const commands = sql.split(';').filter(cmd => cmd.trim() !== '');

    for (const cmd of commands) {
      console.log("Executing:", cmd.trim());
      await connection.execute(cmd.trim());
    }

    await connection.commit();
    console.log(`Migration successful: ${fileName}`);

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    if (connection) await connection.close();
  }
}

const file = process.argv[2] || '13_migration_sponsorship_status.sql';
migrate(file);
