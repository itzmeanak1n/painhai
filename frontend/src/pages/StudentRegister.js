import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    nationalId: '',
    userFirstname: '',
    userLastname: '',
    userEmail: '',
    userPass: '',
    userTel: '',
    userAddress: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/register/student', formData);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            ลงทะเบียนสำหรับนักศึกษา
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="รหัสนักศึกษา"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="เลขบัตรประชาชน"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="ชื่อ"
              name="userFirstname"
              value={formData.userFirstname}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="นามสกุล"
              name="userLastname"
              value={formData.userLastname}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="อีเมล"
              name="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="userPass"
              type="password"
              value={formData.userPass}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              name="userTel"
              value={formData.userTel}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="ที่อยู่"
              name="userAddress"
              value={formData.userAddress}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={3}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
            >
              ลงทะเบียน
            </Button>
          </form>
          <Button
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
            fullWidth
          >
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default StudentRegister; 