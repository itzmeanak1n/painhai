const multer = require('multer');
const path = require('path');

// กำหนดที่เก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ต้องสร้างโฟลเดอร์ uploads ก่อน
  },
  filename: function (req, file, cb) {
    // สร้างชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// ตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('ไม่รองรับไฟล์ประเภทนี้ กรุณาอัพโหลดรูปภาพเท่านั้น'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // จำกัดขนาดไฟล์ที่ 5MB
  }
});

module.exports = upload; 