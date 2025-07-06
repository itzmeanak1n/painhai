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
import { authService } from '../services/api';

function AdminRegister() {
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
    adminKey: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authService.registerAdmin(formData);
      setSuccess('ลงทะเบียนแอดมินสำเร็จ');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            ลงทะเบียนแอดมิน
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

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
            />

            <TextField
              fullWidth
              label="รหัสยืนยันแอดมิน"
              name="adminKey"
              type="password"
              value={formData.adminKey}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
            >
              ลงทะเบียน
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminRegister; 