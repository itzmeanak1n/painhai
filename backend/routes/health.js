const express = require('express');
const router = express.Router();
const { checkConnection, getPoolStatus } = require('../utils/db');

// ตรวจสอบการเชื่อมต่อฐานข้อมูล
router.get('/db', async (req, res) => {
  try {
    const connectionStatus = await checkConnection();
    const poolStatus = await getPoolStatus();
    
    res.json({
      database: connectionStatus,
      pool: poolStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบระบบ',
      error: error.message
    });
  }
});

// ตรวจสอบสถานะของเซิร์ฟเวอร์
router.get('/server', (req, res) => {
  res.json({
    success: true,
    message: 'เซิร์ฟเวอร์ทำงานปกติ',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router; 