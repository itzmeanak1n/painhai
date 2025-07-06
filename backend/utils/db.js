const mysql = require('mysql2/promise');
require('dotenv').config();

// สร้าง connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'believe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// ฟังก์ชันตรวจสอบการเชื่อมต่อ
const checkConnection = async () => {
  try {
    // ทดสอบการเชื่อมต่อ
    const connection = await pool.getConnection();
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
    
    // ทดสอบการ query
    const [result] = await connection.query('SELECT 1');
    console.log('ทดสอบ query สำเร็จ');
    
    // คืน connection กลับไปที่ pool
    connection.release();
    
    return {
      success: true,
      message: 'เชื่อมต่อฐานข้อมูลสำเร็จ'
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
      error: error.message
    };
  }
};

// ฟังก์ชันตรวจสอบสถานะของ connection pool
const getPoolStatus = async () => {
  try {
    const [rows] = await pool.query('SHOW STATUS WHERE Variable_name LIKE "Threads_%"');
    return {
      success: true,
      status: rows
    };
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงสถานะ pool:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถานะ pool',
      error: error.message
    };
  }
};

module.exports = {
  pool,
  checkConnection,
  getPoolStatus
}; 