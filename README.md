# ระบบขนส่งไปไหน ไปไหน

ระบบขนส่งสำหรับนักศึกษาที่ต้องการความสะดวกสบายในการเดินทาง

## การติดตั้ง

### ความต้องการของระบบ
- Node.js
- MySQL
- XAMPP หรือ phpMyAdmin

### ขั้นตอนการติดตั้ง

1. Clone โปรเจค
```bash
git clone <repository-url>
cd <project-folder>
```

2. ติดตั้ง Dependencies สำหรับ Backend
```bash
cd backend
npm install
```

3. ติดตั้ง Dependencies สำหรับ Frontend
```bash
cd ../frontend
npm install
```

4. สร้างฐานข้อมูล
- เปิด phpMyAdmin
- นำเข้าไฟล์ `backend/database.sql`

5. ตั้งค่าไฟล์ .env ใน backend
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=transport_db
JWT_SECRET=your-secret-key
```

6. สร้างโฟลเดอร์ uploads ใน backend
```bash
cd backend
mkdir uploads
```

### การเริ่มต้นใช้งาน

1. เริ่ม Backend Server
```bash
cd backend
nodemon .\server.js
```

2. เริ่ม Frontend Server
```bash
cd frontend
npm start
```

เว็บไซต์จะทำงานที่ http://localhost:3000

## ผู้ใช้ระบบ

1. นักศึกษา
- สามารถลงทะเบียนและเข้าสู่ระบบ
- สร้างการเดินทาง
- ดูประวัติการเดินทาง
- ให้คะแนนไรเดอร์

2. ไรเดอร์
- สามารถลงทะเบียนและเข้าสู่ระบบ
- อัปเดตสถานะการทำงาน
- รับงานขนส่ง
- ดูประวัติการขนส่ง
- ได้รับคะแนนจากผู้ใช้

3. แอดมิน
- เข้าสู่ระบบด้วย:
  - Email: admin@admin.com
  - Password: admin123
- จัดการข้อมูลผู้ใช้
- อนุมัติไรเดอร์
- ดูรายงานต่างๆ

## โครงสร้างโปรเจค

```
project/
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── server.js
│   └── database.sql
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── public/
└── README.md
``` 