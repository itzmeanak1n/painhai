import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student', // student, rider, admin
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginData = {
        ...formData,
        role: formData.userType // เพิ่ม role field
      };
      await login(loginData);
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            เข้าสู่ระบบ
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>ประเภทผู้ใช้</InputLabel>
              <Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                label="ประเภทผู้ใช้"
              >
                <MenuItem value="student">นักศึกษา</MenuItem>
                <MenuItem value="rider">ไรเดอร์</MenuItem>
                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="อีเมล"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="รหัสผ่าน"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
            >
              เข้าสู่ระบบ
            </Button>
          </form>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="text"
              onClick={() => navigate('/register/student')}
            >
              ลงทะเบียนสำหรับนักศึกษา
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/register/rider')}
            >
              ลงทะเบียนสำหรับไรเดอร์
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login; 