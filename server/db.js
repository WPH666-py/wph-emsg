const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: '118.190.201.228',
  user: 'sql-emsg',
  password: 'aHNsSb7F7WYXmCzT',
  database: 'sql-emsg',
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      username VARCHAR(50) DEFAULT '',
      gender VARCHAR(10) DEFAULT '',
      province VARCHAR(50) DEFAULT ''
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS emails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_phone VARCHAR(20) NOT NULL,
      receiver_phone VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      attachment VARCHAR(500) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      text TEXT NOT NULL,
      link VARCHAR(500) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      password_hash VARCHAR(255) NOT NULL
    )
  `);
  const [rows] = await pool.execute('SELECT COUNT(*) AS cnt FROM admin');
  if (rows[0].cnt === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.execute('INSERT INTO admin (password_hash) VALUES (?)', [hash]);
  }
  console.log('Database initialized');
}

module.exports = { pool, initDB };
