import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { adminService } from '../services/api';

function AdminStudentManagement() {
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminService.getStudents();
      console.log('Students data:', response.data);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      showSnackbar('เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา', 'error');
    }
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        studentId: student.studentId,
        nationalId: student.nationalId,
        userFirstname: student.userFirstname,
        userLastname: student.userLastname,
        userEmail: student.userEmail,
        userTel: student.userTel,
        userAddress: student.userAddress,
      });
    } else {
      setSelectedStudent(null);
      setFormData({
        studentId: '',
        nationalId: '',
        userFirstname: '',
        userLastname: '',
        userEmail: '',
        userPass: '',
        userTel: '',
        userAddress: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStudent) {
        await adminService.updateStudent(selectedStudent.studentId, formData);
        showSnackbar('อัปเดตข้อมูลนักศึกษาสำเร็จ');
      } else {
        await adminService.createStudent(formData);
        showSnackbar('เพิ่มข้อมูลนักศึกษาสำเร็จ');
      }
      handleCloseDialog();
      fetchStudents();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('คุณต้องการลบข้อมูลนักศึกษานี้ใช่หรือไม่?')) {
      try {
        await adminService.deleteStudent(studentId);
        showSnackbar('ลบข้อมูลนักศึกษาสำเร็จ');
        fetchStudents();
      } catch (error) {
        showSnackbar('เกิดข้อผิดพลาดในการลบข้อมูลนักศึกษา', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom>
          จัดการข้อมูลนักศึกษา
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2, alignSelf: 'flex-end' }}
        >
          เพิ่มนักศึกษา
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>รหัสนักศึกษา</TableCell>
                <TableCell>ชื่อ-นามสกุล</TableCell>
                <TableCell>อีเมล</TableCell>
                <TableCell>เบอร์โทร</TableCell>
                <TableCell>ที่อยู่</TableCell>
                <TableCell>จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{`${student.userFirstname} ${student.userLastname}`}</TableCell>
                  <TableCell>{student.userEmail}</TableCell>
                  <TableCell>{student.userTel}</TableCell>
                  <TableCell>{student.userAddress}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(student)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(student.studentId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedStudent ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มข้อมูลนักศึกษา'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="รหัสนักศึกษา"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              margin="normal"
              required
              disabled={!!selectedStudent}
            />
            <TextField
              fullWidth
              label="เลขบัตรประชาชน"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="ชื่อ"
              name="userFirstname"
              value={formData.userFirstname}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="นามสกุล"
              name="userLastname"
              value={formData.userLastname}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="อีเมล"
              name="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            {!selectedStudent && (
              <TextField
                fullWidth
                label="รหัสผ่าน"
                name="userPass"
                type="password"
                value={formData.userPass}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            )}
            <TextField
              fullWidth
              label="เบอร์โทร"
              name="userTel"
              value={formData.userTel}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="ที่อยู่"
              name="userAddress"
              value={formData.userAddress}
              onChange={handleInputChange}
              margin="normal"
              required
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>ยกเลิก</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedStudent ? 'บันทึก' : 'เพิ่ม'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
}

export default AdminStudentManagement; 