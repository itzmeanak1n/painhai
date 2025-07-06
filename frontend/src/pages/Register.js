import React, { useState } from 'react';
import { Container, Typography, Box, Button, Grid, TextField, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [riderForm, setRiderForm] = useState({
    riderId: '',
    riderFirstname: '',
    riderLastname: '',
    riderEmail: '',
    riderPass: '',
    riderTel: '',
    riderAddress: '',
    studentId: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleRiderSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!riderForm.riderId || !riderForm.riderFirstname || !riderForm.riderLastname || 
        !riderForm.riderEmail || !riderForm.riderPass || !riderForm.riderTel || 
        !riderForm.riderAddress || !riderForm.studentId) {
      setSnackbar({
        open: true,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        severity: 'error'
      });
      return;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(riderForm.riderEmail)) {
      setSnackbar({
        open: true,
        message: 'รูปแบบอีเมลไม่ถูกต้อง',
        severity: 'error'
      });
      return;
    }

    // ตรวจสอบรหัสผ่าน
    if (riderForm.riderPass.length < 6) {
      setSnackbar({
        open: true,
        message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
        severity: 'error'
      });
      return;
    }

    // ตรวจสอบเบอร์โทรศัพท์
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(riderForm.riderTel)) {
      setSnackbar({
        open: true,
        message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
        severity: 'error'
      });
      return;
    }

    try {
      console.log('Sending rider data:', riderForm);
      const response = await authService.registerRider(riderForm);
      console.log('Registration response:', response);
      
      setSnackbar({
        open: true,
        message: 'ลงทะเบียนเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ',
        severity: 'success'
      });
      
      // รีเซ็ตฟอร์ม
      setRiderForm({
        riderId: '',
        riderFirstname: '',
        riderLastname: '',
        riderEmail: '',
        riderPass: '',
        riderTel: '',
        riderAddress: '',
        studentId: ''
      });
      
      // เปลี่ยนกลับไปหน้า login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          ลงทะเบียนผู้ใช้
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          กรุณาเลือกประเภทผู้ใช้ที่ต้องการลงทะเบียน
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register/student')}
              sx={{ minWidth: 200 }}
            >
              นักศึกษา
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register/rider')}
              sx={{ minWidth: 200 }}
            >
              ผู้ขับรถ
            </Button>
          </Grid>
        </Grid>
        <Box component="form" onSubmit={handleRiderSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="รหัสนักศึกษา"
                name="studentId"
                value={riderForm.studentId}
                onChange={(e) => setRiderForm({ ...riderForm, studentId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="รหัสบัตรประชาชน"
                name="riderId"
                value={riderForm.riderId}
                onChange={(e) => setRiderForm({ ...riderForm, riderId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ชื่อ"
                name="riderFirstname"
                value={riderForm.riderFirstname}
                onChange={(e) => setRiderForm({ ...riderForm, riderFirstname: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="นามสกุล"
                name="riderLastname"
                value={riderForm.riderLastname}
                onChange={(e) => setRiderForm({ ...riderForm, riderLastname: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="อีเมล"
                name="riderEmail"
                type="email"
                value={riderForm.riderEmail}
                onChange={(e) => setRiderForm({ ...riderForm, riderEmail: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="รหัสผ่าน"
                name="riderPass"
                type="password"
                value={riderForm.riderPass}
                onChange={(e) => setRiderForm({ ...riderForm, riderPass: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                name="riderTel"
                value={riderForm.riderTel}
                onChange={(e) => setRiderForm({ ...riderForm, riderTel: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ที่อยู่"
                name="riderAddress"
                multiline
                rows={3}
                value={riderForm.riderAddress}
                onChange={(e) => setRiderForm({ ...riderForm, riderAddress: e.target.value })}
                required
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ลงทะเบียน
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register; 