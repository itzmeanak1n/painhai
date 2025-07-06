const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // รับ token จาก header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }

    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // เพิ่มข้อมูล user ลงใน request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
  }
};

module.exports = {
  auth,
  isAdmin,
}; 