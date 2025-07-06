const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { pool } = require('../utils/db');

// Get all places
router.get('/places', auth, async (req, res) => {
  try {
    const [places] = await pool.query('SELECT * FROM places ORDER BY placeName');
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่' });
  }
});

// Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [students] = await pool.query(
      'SELECT * FROM tb_user WHERE studentId = ?',
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    }

    const student = students[0];
    delete student.userPass; // ไม่ส่งรหัสผ่านกลับไป

    res.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' });
  }
});

// Update student profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { userFirstname, userLastname, userEmail, userTel, userAddress } = req.body;
    const studentId = req.user.id;

    // Check if email is already used by another user
    const [existingUsers] = await pool.query(
      'SELECT studentId FROM tb_user WHERE userEmail = ? AND studentId != ?',
      [userEmail, studentId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Update profile
    await pool.query(
      'UPDATE tb_user SET userFirstname = ?, userLastname = ?, userEmail = ?, userTel = ?, userAddress = ? WHERE studentId = ?',
      [userFirstname, userLastname, userEmail, userTel, userAddress, studentId]
    );

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
});

// Create new trip
router.post('/trips', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { carType, placeIdPickUp, placeIdDestination, date, isRoundTrip } = req.body;

    // ตรวจสอบข้อมูล
    if (!carType || !placeIdPickUp || !placeIdDestination || !date) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบว่าสถานที่มีอยู่จริง
    const [places] = await pool.query(
      'SELECT placeId FROM places WHERE placeId IN (?, ?)',
      [placeIdPickUp, placeIdDestination]
    );

    if (places.length !== 2) {
      return res.status(400).json({ message: 'สถานที่ไม่ถูกต้อง' });
    }

    // สร้างรายการเดินทาง
   
const [result] = await pool.query(
  'INSERT INTO trips (studentId, carType, placeIdPickUp, placeIdDestination, date, status, is_round_trip) VALUES (?, ?, ?, ?, ?, ?, ?)',
  [studentId, carType, placeIdPickUp, placeIdDestination, date, 'pending', isRoundTrip || false]
);

// ดึงข้อมูล trip ที่สร้างใหม่

const [newTrip] = await pool.query(
  'SELECT t.*, t.is_round_trip as isRoundTrip, p1.placeName as pickUpName, p2.placeName as destinationName ' +
  'FROM trips t ' +
  'JOIN places p1 ON t.placeIdPickUp = p1.placeId ' +
  'JOIN places p2 ON t.placeIdDestination = p2.placeId ' +
  'WHERE t.tripId = ?',
  [result.insertId]
);
    res.status(201).json({
      success: true,
      message: 'สร้างรายการเดินทางสำเร็จ',
      trip: newTrip[0]
    });

  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างรายการเดินทาง' });
  }
});

// Get student trips
router.get('/trips', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const [trips] = await pool.query(`
      SELECT t.*, 
             p1.placeName as pickUpName,
             p2.placeName as destinationName,
             t.is_round_trip as isRoundTrip,
             CASE 
               WHEN t.status = 'pending' THEN 'รอการตอบรับ'
               WHEN t.status = 'accepted' THEN 'ได้รับการตอบรับแล้ว'
               WHEN t.status = 'in_progress' THEN 'กำลังเดินทาง'
               WHEN t.status = 'completed' THEN 'เสร็จสิ้น'
               WHEN t.status = 'cancelled' THEN 'ยกเลิก'
               ELSE t.status
             END as statusText
      FROM trips t
      LEFT JOIN places p1 ON t.placeIdPickUp = p1.placeId
      LEFT JOIN places p2 ON t.placeIdDestination = p2.placeId
      WHERE t.studentId = ?
      ORDER BY t.date DESC
    `, [studentId]);

    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเดินทาง' });
  }
});

module.exports = router; 