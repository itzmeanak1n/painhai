const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { pool } = require('../utils/db');
const bcrypt = require('bcrypt');
const upload = require('../middleware/upload');

// Get all students
router.get('/students', auth, isAdmin, async (req, res) => {
  try {
    const [students] = await pool.query(
      'SELECT studentId, nationalId, userFirstname, userLastname, userEmail, userTel, userAddress, userRate FROM tb_user WHERE role = "student"'
    );
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา' });
  }
});

// Get student by ID
router.get('/students/:id', auth, isAdmin, async (req, res) => {
  try {
    const [students] = await pool.query(
      'SELECT * FROM tb_user WHERE studentId = ? AND role = "student"',
      [req.params.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    }

    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา' });
  }
});

// Create new student
router.post('/students', auth, isAdmin, async (req, res) => {
  const {
    studentId,
    nationalId,
    userFirstname,
    userLastname,
    userEmail,
    userPass,
    userTel,
    userAddress,
  } = req.body;

  try {
    // Check if email already exists
    const [existingUser] = await pool.query(
      'SELECT * FROM tb_user WHERE userEmail = ?',
      [userEmail]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPass, 10);

    // Insert student data
    const [result] = await pool.query(
      'INSERT INTO tb_user (studentId, nationalId, userFirstname, userLastname, userEmail, userPass, userTel, userAddress, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "student")',
      [studentId, nationalId, userFirstname, userLastname, userEmail, hashedPassword, userTel, userAddress]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลนักศึกษาสำเร็จ',
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักศึกษา' });
  }
});

// Update student
router.put('/students/:id', auth, isAdmin, async (req, res) => {
  const {
    nationalId,
    userFirstname,
    userLastname,
    userEmail,
    userTel,
    userAddress,
  } = req.body;

  try {
    // Check if email is already used by another user
    const [existingUser] = await pool.query(
      'SELECT * FROM tb_user WHERE userEmail = ? AND studentId != ?',
      [userEmail, req.params.id]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Update student data
    await pool.query(
      `UPDATE tb_user 
       SET nationalId = ?, userFirstname = ?, userLastname = ?, 
           userEmail = ?, userTel = ?, userAddress = ?
       WHERE studentId = ? AND role = "student"`,
      [nationalId, userFirstname, userLastname, userEmail, userTel, userAddress, req.params.id]
    );

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลนักศึกษาสำเร็จ',
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลนักศึกษา' });
  }
});

// Delete student
router.delete('/students/:id', auth, isAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tb_user WHERE studentId = ? AND role = "student"',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    }

    res.json({
      success: true,
      message: 'ลบข้อมูลนักศึกษาสำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลนักศึกษา' });
  }
});

// Get all riders
router.get('/riders', auth, isAdmin, async (req, res) => {
  try {
    const [riders] = await pool.query(
      'SELECT * FROM riders'
    );
    res.json(riders);
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไรเดอร์' });
  }
});

// Get rider by ID
router.get('/riders/:id', auth, isAdmin, async (req, res) => {
  try {
    const [riders] = await pool.query(
      'SELECT * FROM riders WHERE riderId = ?',
      [req.params.id]
    );

    if (riders.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลไรเดอร์' });
    }

    res.json(riders[0]);
  } catch (error) {
    console.error('Error fetching rider:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไรเดอร์' });
  }
});

// Create new rider (Simplified: requires password, other fields optional for now)
router.post('/riders', auth, isAdmin, async (req, res) => {
  const {
    riderNationalId,
    riderFirstname,
    riderLastname,
    riderEmail,
    riderPass, // Admin needs to provide a temporary password
    riderTel,
    riderAddress,
    riderLicense, // Assuming path or identifier
    status = 'pending' // Default to pending unless specified
  } = req.body;

  if (!riderEmail || !riderPass || !riderFirstname || !riderLastname || !riderNationalId) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็น (National ID, Firstname, Lastname, Email, Password)' });
  }

  try {
    // Check if email already exists
    const [existingRider] = await pool.query(
      'SELECT * FROM riders WHERE riderEmail = ?',
      [riderEmail]
    );

    if (existingRider.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(riderPass, 10);

    // Insert rider data
    const [result] = await pool.query(
      'INSERT INTO riders (riderNationalId, riderFirstname, riderLastname, riderEmail, riderPass, riderTel, riderAddress, riderLicense, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [riderNationalId, riderFirstname, riderLastname, riderEmail, hashedPassword, riderTel, riderAddress, riderLicense, status]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลไรเดอร์สำเร็จ',
      riderId: result.insertId
    });
  } catch (error) {
    console.error('Error creating rider:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลไรเดอร์' });
  }
});

// Update rider
router.put('/riders/:id', auth, isAdmin, async (req, res) => {
  const riderId = req.params.id;
  const {
    riderNationalId,
    riderFirstname,
    riderLastname,
    riderEmail,
    riderTel,
    riderAddress,
    riderLicense,
    status
  } = req.body;

  try {
    // Check if email is already used by another rider
    const [existingRider] = await pool.query(
      'SELECT * FROM riders WHERE riderEmail = ? AND riderId != ?',
      [riderEmail, riderId]
    );

    if (existingRider.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานโดยไรเดอร์คนอื่นแล้ว' });
    }

    // Update rider data
    // Note: Password update is handled separately or not allowed here for simplicity
    await pool.query(
      `UPDATE riders 
       SET riderNationalId = ?, riderFirstname = ?, riderLastname = ?, 
           riderEmail = ?, riderTel = ?, riderAddress = ?, riderLicense = ?, status = ?
       WHERE riderId = ?`,
      [riderNationalId, riderFirstname, riderLastname, riderEmail, riderTel, riderAddress, riderLicense, status, riderId]
    );

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลไรเดอร์สำเร็จ',
    });
  } catch (error) {
    console.error('Error updating rider:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลไรเดอร์' });
  }
});

// Delete rider
router.delete('/riders/:id', auth, isAdmin, async (req, res) => {
  try {
    // Consider related data (e.g., ridervehical, tripMatched) before deleting
    // For simplicity, we delete directly here. Add foreign key constraints or handle related data deletion.
    const [result] = await pool.query(
      'DELETE FROM riders WHERE riderId = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลไรเดอร์' });
    }

    res.json({
      success: true,
      message: 'ลบข้อมูลไรเดอร์สำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting rider:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลไรเดอร์' });
  }
});

// Get all trips
router.get('/trips', auth, isAdmin, async (req, res) => {
  try {
    const [trips] = await pool.query(`
      SELECT t.*, 
             u.userFirstname, u.userLastname,
             r.riderFirstname, r.riderLastname,
             p1.placeName as pickUpName,
             p2.placeName as destinationName
      FROM trips t
      LEFT JOIN tb_user u ON t.studentId = u.studentId
      LEFT JOIN tripMatched tm ON t.tripId = tm.tripId
      LEFT JOIN riders r ON tm.riderId = r.riderId
      LEFT JOIN places p1 ON t.placeIdPickUp = p1.placeId
      LEFT JOIN places p2 ON t.placeIdDestination = p2.placeId
      ORDER BY t.date DESC
    `);
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเดินทาง' });
  }
});

// Approve rider
router.put('/riders/:riderId/approve', auth, isAdmin, async (req, res) => {
  try {
    const { riderId } = req.params;

    await pool.query(
      'UPDATE riders SET status = ? WHERE riderId = ?',
      ['approved', riderId]
    );

    res.json({ message: 'อนุมัติไรเดอร์เรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error approving rider:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอนุมัติไรเดอร์' });
  }
});

// Place management
router.get('/places', auth, isAdmin, async (req, res) => {
  try {
    const [places] = await pool.query('SELECT * FROM places ORDER BY placeName');
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่' });
  }
});

router.post('/places', auth, isAdmin, upload.single('pics'), async (req, res) => {
  try {
    const { placeName, link } = req.body;
    const pics = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      'INSERT INTO places (placeName, link, pics) VALUES (?, ?, ?)',
      [placeName, link, pics]
    );

    res.status(201).json({ 
      message: 'เพิ่มสถานที่สำเร็จ',
      placeId: result.insertId 
    });
  } catch (error) {
    console.error('Error adding place:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มสถานที่' });
  }
});

router.put('/places/:placeId', auth, isAdmin, upload.single('pics'), async (req, res) => {
  try {
    const { placeId } = req.params;
    const { placeName, link } = req.body;
    const pics = req.file ? req.file.filename : undefined;

    let query = 'UPDATE places SET placeName = ?, link = ?';
    let params = [placeName, link];

    if (pics) {
      query += ', pics = ?';
      params.push(pics);
    }

    query += ' WHERE placeId = ?';
    params.push(placeId);

    await pool.query(query, params);
    res.json({ message: 'อัพเดทสถานที่สำเร็จ' });
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานที่' });
  }
});

router.delete('/places/:placeId', auth, isAdmin, async (req, res) => {
  try {
    const { placeId } = req.params;
    await pool.query('DELETE FROM places WHERE placeId = ?', [placeId]);
    res.json({ message: 'ลบสถานที่สำเร็จ' });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบสถานที่' });
  }
});

module.exports = router; 