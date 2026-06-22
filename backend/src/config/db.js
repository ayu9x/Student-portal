const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'talenttrack',
  password: process.env.DB_PASSWORD || 'talenttrack_pass',
  database: process.env.DB_NAME || 'talenttrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Retry logic for container startup ordering
async function waitForDB(retries = 30, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return true;
    } catch (err) {
      console.log(`⏳ Waiting for database... attempt ${i + 1}/${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('❌ Could not connect to the database after multiple attempts');
}

module.exports = { pool, waitForDB };
