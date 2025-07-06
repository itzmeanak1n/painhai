import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Select,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Card,
  CardMedia,
  CardContent,
  CardActions
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';

function AdminDashboard() {
  const { user, profile, logout, auth } = useAuth();
  const [tab, setTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [openRiderDialog, setOpenRiderDialog] = useState(false);
  const [openRiderFormDialog, setOpenRiderFormDialog] = useState(false);
  const [currentRiderFormData, setCurrentRiderFormData] = useState(null);
  const [riderFormError, setRiderFormError] = useState('');
  const [initialRiderFormState, setInitialRiderFormState] = useState({
    riderNationalId: '',
    riderFirstname: '',
    riderLastname: '',
    riderEmail: '',
    riderPass: '',
    riderTel: '',
    riderAddress: '',
    riderLicense: '',
    status: 'pending',
  });
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState('');
  const [openPlaceDialog, setOpenPlaceDialog] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [placeFormData, setPlaceFormData] = useState({
    placeName: '',
    link: '',
  });
  const [placeFile, setPlaceFile] = useState(null);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    carType: '',
    plate: '',
    brand: '',
    model: '',
    insurancePhoto: null,
    carPhoto: null
  });
  const navigate = useNavigate();

  const getImageUrl = useCallback((filename) => {
    if (!filename) return defaultAvatar;
    
    // ถ้าเป็น URL เต็มให้ใช้เลย
    if (filename.startsWith('http')) {
      return filename;
    }

    // แปลง \ เป็น /
    const normalizedPath = filename.replace(/\\/g, '/');

    // ถ้าไม่มี uploads/ นำหน้า ให้เพิ่มเข้าไป
    if (!normalizedPath.startsWith('uploads/')) {
      return `http://localhost:5000/uploads/${normalizedPath}`;
    }
    return `http://localhost:5000/${normalizedPath}`;
  }, []);

  const getVehicleImageUrl = useCallback((filename) => {
    if (!filename) return defaultAvatar;
    
    // ถ้าเป็น URL เต็มให้ใช้เลย
    if (filename.startsWith('http')) {
      return filename;
    }

    // แปลง \ เป็น /
    const normalizedPath = filename.replace(/\\/g, '/');

    // ถ้าไม่มี uploads/vehicles/ นำหน้า ให้เพิ่มเข้าไป
    if (!normalizedPath.startsWith('uploads/vehicles/')) {
      return `http://localhost:5000/uploads/vehicles/${normalizedPath}`;
    }
    return `http://localhost:5000/${normalizedPath}`;
  }, []);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    if (tab === 0) {
      fetchStudents();
    } else if (tab === 1) {
      fetchRiders();
    } else if (tab === 2) {
      fetchPlaces();
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsRes = await adminService.getStudents();
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchRiders = async () => {
    try {
      const ridersRes = await adminService.getRiders();
      setRiders(ridersRes.data);
    } catch (error) {
      console.error('Error fetching riders:', error);
    }
  };

  const fetchPlaces = async () => {
    setIsLoadingPlaces(true);
    setPlacesError('');
    try {
      const response = await adminService.getPlaces();
      setPlaces(response.data);
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlacesError('ไม่สามารถโหลดข้อมูลสถานที่ได้');
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handleApproveRider = async (riderId) => {
    try {
      await adminService.approveRider(riderId);
      fetchData();
    } catch (error) {
      console.error('Error approving rider:', error);
    }
  };

  const handleViewRider = (rider) => {
    setSelectedRider(rider);
    setOpenRiderDialog(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenRiderFormDialog = (rider = null) => {
    setRiderFormError('');
    if (rider) {
      setCurrentRiderFormData({
        riderId: rider.riderId,
        riderNationalId: rider.riderNationalId || '',
        riderFirstname: rider.riderFirstname || '',
        riderLastname: rider.riderLastname || '',
        riderEmail: rider.riderEmail || '',
        riderPass: '',
        riderTel: rider.riderTel || '',
        riderAddress: rider.riderAddress || '',
        riderLicense: rider.riderLicense || '',
        status: rider.status || 'pending',
      });
    } else {
      setCurrentRiderFormData(initialRiderFormState);
    }
    setOpenRiderFormDialog(true);
  };

  const handleCloseRiderFormDialog = () => {
    setOpenRiderFormDialog(false);
    setCurrentRiderFormData(null);
    setRiderFormError('');
  };

  const handleRiderFormChange = (e) => {
    setCurrentRiderFormData({
      ...currentRiderFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRiderFormSubmit = async (e) => {
    e.preventDefault();
    setRiderFormError('');
    const riderData = { ...currentRiderFormData };

    const { riderId, ...dataToSend } = riderData;

    if (currentRiderFormData.riderId && !dataToSend.riderPass) {
      delete dataToSend.riderPass;
    }

    try {
      if (currentRiderFormData.riderId) {
        await adminService.updateRider(currentRiderFormData.riderId, dataToSend);
      } else {
        if (!dataToSend.riderPass) {
          setRiderFormError('กรุณากำหนดรหัสผ่านสำหรับไรเดอร์ใหม่');
          return;
        }
        await adminService.createRider(dataToSend);
      }
      handleCloseRiderFormDialog();
      fetchData();
    } catch (err) {
      console.error('Error submitting rider form:', err);
      setRiderFormError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteRider = async (riderId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบไรเดอร์นี้? (ข้อมูลที่เกี่ยวข้องอาจได้รับผลกระทบ)')) {
      try {
        // แปลง riderId เป็น string ก่อนส่ง
        const response = await adminService.deleteRider(riderId.toString());
        console.log('Delete response:', response);
        
        // สำเร็จ
        console.log('Rider deleted successfully');
        fetchData(); // รีเฟรชข้อมูล
      } catch (err) {
        console.error('Error deleting rider:', err);
        const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการลบไรเดอร์';
        alert(errorMessage);
      }
    }
  };

  // State สำหรับจัดการฟอร์มนักศึกษา
  const [openStudentFormDialog, setOpenStudentFormDialog] = useState(false);
  const [currentStudentFormData, setCurrentStudentFormData] = useState(null);
  const [studentFormError, setStudentFormError] = useState('');
  const initialStudentFormState = {
    studentId: '',
    userFirstname: '',
    userLastname: '',
    userEmail: '',
    userPass: '',
    userTel: '',
  };

  // ฟังก์ชันสำหรับจัดการฟอร์มนักศึกษา
  const handleOpenStudentFormDialog = (student = null) => {
    setStudentFormError('');
    if (student) {
      setCurrentStudentFormData({
        studentId: student.studentId,
        userFirstname: student.userFirstname || '',
        userLastname: student.userLastname || '',
        userEmail: student.userEmail || '',
        userTel: student.userTel || '',
      });
    } else {
      setCurrentStudentFormData(initialStudentFormState);
    }
    setOpenStudentFormDialog(true);
  };

  const handleCloseStudentFormDialog = () => {
    setOpenStudentFormDialog(false);
    setCurrentStudentFormData(null);
    setStudentFormError('');
  };

  const handleStudentFormChange = (e) => {
    setCurrentStudentFormData({
      ...currentStudentFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStudentFormSubmit = async (e) => {
    e.preventDefault();
    setStudentFormError('');
    const studentData = { ...currentStudentFormData };

    try {
      if (studentData.studentId && !studentData.userPass) {
        delete studentData.userPass; // ไม่ต้องส่งรหัสผ่านถ้าเป็นการแก้ไข
      }

      if (currentStudentFormData.studentId) {
        // แก้ไขข้อมูล
        await adminService.updateStudent(currentStudentFormData.studentId, studentData);
      } else {
        // เพิ่มข้อมูลใหม่
        if (!studentData.userPass) {
          setStudentFormError('กรุณากำหนดรหัสผ่านสำหรับนักศึกษาใหม่');
          return;
        }
        await adminService.createStudent(studentData);
      }
      handleCloseStudentFormDialog();
      fetchData();
    } catch (err) {
      console.error('Error submitting student form:', err);
      setStudentFormError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบนักศึกษาคนนี้?')) {
      try {
        await adminService.deleteStudent(studentId.toString());
        fetchData();
      } catch (err) {
        console.error('Error deleting student:', err);
        alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบนักศึกษา');
      }
    }
  };

  const renderStudentsTable = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">จัดการนักศึกษา</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenStudentFormDialog()}
        >
          เพิ่มนักศึกษา
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>รหัสนักศึกษา</TableCell>
              <TableCell>ชื่อ-นามสกุล</TableCell>
              <TableCell>อีเมล</TableCell>
              <TableCell>เบอร์โทร</TableCell>
              <TableCell>คะแนน</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.studentId}>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>
                  {student.userFirstname} {student.userLastname}
                </TableCell>
                <TableCell>{student.userEmail}</TableCell>
                <TableCell>{student.userTel}</TableCell>
                <TableCell>{student.userRate || '-'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="แก้ไข">
                    <IconButton size="small" onClick={() => handleOpenStudentFormDialog(student)} sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="ลบ">
                    <IconButton size="small" color="error" onClick={() => handleDeleteStudent(student.studentId)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog สำหรับเพิ่ม/แก้ไขนักศึกษา */}
      <Dialog open={openStudentFormDialog} onClose={handleCloseStudentFormDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentStudentFormData?.studentId ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}
        </DialogTitle>
        <form onSubmit={handleStudentFormSubmit}>
          <DialogContent>
            {studentFormError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {studentFormError}
              </Alert>
            )}
            <TextField
              name="studentId"
              label="รหัสนักศึกษา"
              fullWidth
              value={currentStudentFormData?.studentId || ''}
              onChange={handleStudentFormChange}
              margin="normal"
              required
            />
            <TextField
              name="userFirstname"
              label="ชื่อ"
              fullWidth
              value={currentStudentFormData?.userFirstname || ''}
              onChange={handleStudentFormChange}
              margin="normal"
              required
            />
            <TextField
              name="userLastname"
              label="นามสกุล"
              fullWidth
              value={currentStudentFormData?.userLastname || ''}
              onChange={handleStudentFormChange}
              margin="normal"
              required
            />
            <TextField
              name="userEmail"
              label="อีเมล"
              type="email"
              fullWidth
              value={currentStudentFormData?.userEmail || ''}
              onChange={handleStudentFormChange}
              margin="normal"
              required
            />
            {!currentStudentFormData?.studentId && (
              <TextField
                name="userPass"
                label="รหัสผ่าน"
                type="password"
                fullWidth
                value={currentStudentFormData?.userPass || ''}
                onChange={handleStudentFormChange}
                margin="normal"
                required
              />
            )}
            <TextField
              name="userTel"
              label="เบอร์โทรศัพท์"
              fullWidth
              value={currentStudentFormData?.userTel || ''}
              onChange={handleStudentFormChange}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStudentFormDialog}>ยกเลิก</Button>
            <Button type="submit" variant="contained">
              บันทึก
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );

  const renderRidersTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>รหัสไรเดอร์</TableCell>
            <TableCell>ชื่อ-นามสกุล</TableCell>
            <TableCell>อีเมล</TableCell>
            <TableCell>เบอร์โทร</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell align="right">จัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {riders.map((rider) => (
            <TableRow key={rider.riderId}>
              <TableCell>{rider.riderId}</TableCell>
              <TableCell>{rider.riderFirstname} {rider.riderLastname}</TableCell>
              <TableCell>{rider.riderEmail}</TableCell>
              <TableCell>{rider.riderTel}</TableCell>
              <TableCell>{rider.status}</TableCell>
              <TableCell align="right">
                <Tooltip title="ดูข้อมูล">
                  <IconButton size="small" onClick={() => handleViewRider(rider)} sx={{ mr: 1 }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="แก้ไข">
                  <IconButton size="small" onClick={() => handleOpenRiderFormDialog(rider)} sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ลบ">
                  <IconButton size="small" color="error" onClick={() => handleDeleteRider(rider.riderId)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderPlacesTable = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">จัดการสถานที่</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenPlaceDialog()}
        >
          เพิ่มสถานที่
        </Button>
      </Box>
      {placesError && <Alert severity="error" sx={{ mb: 2 }}>{placesError}</Alert>}
      {isLoadingPlaces ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : places.length === 0 ? (
        <Typography>ยังไม่มีข้อมูลสถานที่</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '10%' }}>รูปภาพ</TableCell>
                <TableCell sx={{ width: '30%' }}>ชื่อสถานที่</TableCell>
                <TableCell sx={{ width: '40%' }}>ลิงก์ Google Maps</TableCell>
                <TableCell sx={{ width: '20%' }} align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.placeId}>
                  <TableCell>
                    {place.pics ? (
                      <img
                        src={getImageUrl(place.pics)}
                        alt={place.placeName}
                        style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                      />
                    ) : (
                      <Box sx={{ height: 40, width: 40, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Typography variant="caption" color="text.secondary">ไม่มีรูป</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{place.placeName}</TableCell>
                  <TableCell>
                    {place.link ? (
                      <MuiLink href={place.link} target="_blank" rel="noopener noreferrer">
                        {place.link}
                      </MuiLink>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="แก้ไข">
                      <IconButton size="small" onClick={() => handleOpenPlaceDialog(place)} sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                      <IconButton size="small" color="error" onClick={() => handleDeletePlace(place.placeId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  const handleOpenPlaceDialog = (place = null) => {
    setPlacesError('');
    setCurrentPlace(place);
    if (place) {
      setPlaceFormData({
        placeName: place.placeName || '',
        link: place.link || '',
      });
    } else {
      setPlaceFormData({ placeName: '', link: '' });
    }
    setPlaceFile(null);
    setOpenPlaceDialog(true);
  };

  const handleClosePlaceDialog = () => {
    setOpenPlaceDialog(false);
    setCurrentPlace(null);
    setPlaceFormData({ placeName: '', link: '' });
    setPlaceFile(null);
    setPlacesError('');
  };

  const handlePlaceFormChange = (e) => {
    setPlaceFormData({ ...placeFormData, [e.target.name]: e.target.value });
  };

  const handlePlaceFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPlaceFile(e.target.files[0]);
    }
  };

  const handlePlaceSubmit = async (e) => {
    e.preventDefault();
    setPlacesError('');

    // ตรวจสอบข้อมูล
    if (!placeFormData.placeName.trim()) {
      setPlacesError('กรุณากรอกชื่อสถานที่');
      return;
    }

    const formData = new FormData();
    formData.append('placeName', placeFormData.placeName.trim());
    formData.append('link', placeFormData.link.trim() || '');
    
    // ตรวจสอบและเพิ่มรูปภาพ
    if (placeFile) {
      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      if (placeFile.size > 5 * 1024 * 1024) {
        setPlacesError('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB');
        return;
      }
      // ตรวจสอบประเภทไฟล์
      if (!placeFile.type.startsWith('image/')) {
        setPlacesError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      formData.append('pics', placeFile);
    }

    try {
      if (currentPlace) {
        await adminService.updatePlace(currentPlace.placeId, formData);
      } else {
        await adminService.addPlace(formData);
      }
      handleClosePlaceDialog();
      fetchPlaces();
    } catch (error) {
      console.error('Error submitting place:', error);
      setPlacesError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสถานที่');
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('คุณต้องการลบสถานที่นี้ใช่หรือไม่? การลบจะไม่สามารถกู้คืนได้')) {
      setPlacesError('');
      try {
        await adminService.deletePlace(placeId);
        fetchPlaces();
      } catch (error) {
        console.error('Error deleting place:', error);
        setPlacesError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูลสถานที่');
      }
    }
  };

  const handleEditVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setVehicleFormData({
      carType: vehicle.carType,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model
    });
    setOpenVehicleDialog(true);
  };

  const handleAddVehicle = () => {
    setCurrentVehicle(null);
    setVehicleFormData({
      carType: '',
      plate: '',
      brand: '',
      model: '',
      insurancePhoto: null,
      carPhoto: null
    });
    setOpenVehicleDialog(true);
  };

  const handleFileChange = (e, field) => {
    setVehicleFormData({
      ...vehicleFormData,
      [field]: e.target.files[0]
    });
  };

  const fetchRiderDetails = async (riderId) => {
    try {
      const response = await adminService.getRiderById(riderId);
      setSelectedRider(response.data);
    } catch (error) {
      console.error('Error fetching rider details:', error);
    }
  };

  const handleVehicleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.keys(vehicleFormData).forEach(key => {
        if (vehicleFormData[key]) {
          formData.append(key, vehicleFormData[key]);
        }
      });

      if (currentVehicle) {
        // อัพเดทยานพาหนะ
        await axios.put(`http://localhost:5000/api/riders/vehicles/${currentVehicle.carId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${auth.token}`
          }
        });
      } else {
        // เพิ่มยานพาหนะใหม่
        formData.append('riderId', selectedRider.riderId);
        await axios.post(`http://localhost:5000/api/riders/vehicles`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${auth.token}`
          }
        });
      }

      // รีเฟรชข้อมูล
      fetchRiderDetails(selectedRider.riderId);
      setOpenVehicleDialog(false);
      
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      // จัดการ error ตามความเหมาะสม
    }
  };

  const handleDeleteVehicle = async (carId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบยานพาหนะนี้?')) {
      try {
        await axios.delete(`http://localhost:5000/api/riders/vehicles/${carId}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });
        // รีเฟรชข้อมูล
        fetchRiderDetails(selectedRider.riderId);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        // จัดการ error ตามความเหมาะสม
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                สวัสดี, {profile?.firstName} {profile?.lastName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                ผู้ดูแลระบบ
              </Typography>
            </Box>
          </Box>
          <Tooltip title="ออกจากระบบ">
            <IconButton 
              color="error" 
              onClick={handleLogout}
              sx={{ 
                bgcolor: 'error.light',
                '&:hover': { bgcolor: 'error.main' }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ my: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  ระบบจัดการ
                </Typography>
                <Typography color="text.secondary">
                  ผู้ดูแลระบบ: {user?.email}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ width: '100%' }}>
                <Tabs
                  value={tab}
                  onChange={(e, newValue) => setTab(newValue)}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab label="นักศึกษา" />
                  <Tab label="ไรเดอร์" />
                  <Tab label="สถานที่" />
                </Tabs>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              {tab === 0 && renderStudentsTable()}
              {tab === 1 && renderRidersTable()}
              {tab === 2 && renderPlacesTable()}
            </Grid>
          </Grid>
        </Box>

        <Dialog
          open={openRiderDialog}
          onClose={() => setOpenRiderDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>ข้อมูลไรเดอร์</DialogTitle>
          <DialogContent>
            {selectedRider && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    ข้อมูลส่วนตัว
                  </Typography>
                  <Typography>
                    ชื่อ-นามสกุล: {selectedRider.riderFirstname}{' '}
                    {selectedRider.riderLastname}
                  </Typography>
                  <Typography>อีเมล: {selectedRider.riderEmail}</Typography>
                  <Typography>เบอร์โทร: {selectedRider.riderTel}</Typography>
                  <Typography>ที่อยู่: {selectedRider.riderAddress}</Typography>
                  <Typography>
                    เลขใบขับขี่: {selectedRider.riderLicense}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    เอกสารและรูปภาพ
                  </Typography>
                  {selectedRider.RiderStudentCard && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        บัตรนักศึกษา
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.RiderStudentCard)}
                        alt="บัตรนักศึกษา"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                  {selectedRider.QRscan && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        QR Code พร้อมเพย์
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.QRscan)}
                        alt="QR Code"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                  {selectedRider.riderLicense && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        ใบขับขี่
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.riderLicense)}
                        alt="ใบขับขี่"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                  {selectedRider.riderProfilePic && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        รูปโปรไฟล์
                      </Typography>
                      <img
                        src={getImageUrl(selectedRider.riderProfilePic)}
                        alt="รูปโปรไฟล์"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRiderDialog(false)}>ปิด</Button>
            {selectedRider?.status === 'pending' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleApproveRider(selectedRider.riderId);
                  setOpenRiderDialog(false);
                }}
              >
                อนุมัติ
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog open={openRiderFormDialog} onClose={handleCloseRiderFormDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{currentRiderFormData?.riderId ? 'แก้ไขข้อมูล Rider' : 'สร้าง Rider ใหม่'}</DialogTitle>
          <form onSubmit={handleRiderFormSubmit}>
            <DialogContent>
              {riderFormError && <Alert severity="error" sx={{ mb: 2 }}>{riderFormError}</Alert>}
              <TextField
                margin="dense"
                name="riderNationalId"
                label="เลขบัตรประชาชน"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderNationalId || ''}
                onChange={handleRiderFormChange}
                required
              />
              <TextField
                margin="dense"
                name="riderFirstname"
                label="ชื่อ"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderFirstname || ''}
                onChange={handleRiderFormChange}
                required
              />
              <TextField
                margin="dense"
                name="riderLastname"
                label="นามสกุล"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderLastname || ''}
                onChange={handleRiderFormChange}
                required
              />
              <TextField
                margin="dense"
                name="riderEmail"
                label="อีเมล"
                type="email"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderEmail || ''}
                onChange={handleRiderFormChange}
                required
              />
              <TextField
                margin="dense"
                name="riderPass"
                label={currentRiderFormData?.riderId ? "รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)" : "รหัสผ่าน"}
                type="password"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderPass || ''}
                onChange={handleRiderFormChange}
                required={!currentRiderFormData?.riderId}
              />
              <TextField
                margin="dense"
                name="riderTel"
                label="เบอร์โทรศัพท์"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderTel || ''}
                onChange={handleRiderFormChange}
              />
              <TextField
                margin="dense"
                name="riderAddress"
                label="ที่อยู่"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderAddress || ''}
                onChange={handleRiderFormChange}
                multiline
                rows={2}
              />
              <TextField
                margin="dense"
                name="riderLicense"
                label="เลขใบขับขี่/Path รูปภาพ"
                type="text"
                fullWidth
                variant="outlined"
                value={currentRiderFormData?.riderLicense || ''}
                onChange={handleRiderFormChange}
                helperText="ระบุ Path รูปภาพที่อัปโหลด หรือเลขใบขับขี่"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel id="rider-status-select-label">สถานะ</InputLabel>
                <Select
                  labelId="rider-status-select-label"
                  name="status"
                  value={currentRiderFormData?.status || 'pending'}
                  label="สถานะ"
                  onChange={handleRiderFormChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRiderFormDialog}>ยกเลิก</Button>
              <Button type="submit" variant="contained">บันทึก</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={openPlaceDialog} onClose={handleClosePlaceDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{currentPlace ? 'แก้ไข' : 'เพิ่ม'}สถานที่</DialogTitle>
          <form onSubmit={handlePlaceSubmit}>
            <DialogContent>
              {placesError && <Alert severity="error" sx={{ mb: 2 }}>{placesError}</Alert>}
              <TextField
                autoFocus
                margin="dense"
                name="placeName"
                label="ชื่อสถานที่"
                type="text"
                fullWidth
                variant="outlined"
                value={placeFormData.placeName}
                onChange={handlePlaceFormChange}
                required
                error={!!placesError && !placeFormData.placeName.trim()}
                helperText={!!placesError && !placeFormData.placeName.trim() ? 'กรุณากรอกชื่อสถานที่' : ''}
              />
              <TextField
                margin="dense"
                name="link"
                label="ลิงก์ Google Maps"
                type="url"
                fullWidth
                variant="outlined"
                value={placeFormData.link}
                onChange={handlePlaceFormChange}
                helperText="ตัวอย่าง: https://www.google.com/maps/place/..."
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  รูปภาพสถานที่
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handlePlaceFileChange}
                  id="place-picture-upload"
                />
                {placeFile && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">ไฟล์ที่เลือก: {placeFile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ขนาดไฟล์: {(placeFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}
                {!placeFile && currentPlace?.pics && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={getImageUrl(currentPlace.pics)}
                      alt={currentPlace.placeName}
                      style={{ height: 100, width: 'auto', objectFit: 'contain' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      รูปภาพปัจจุบัน
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePlaceDialog}>ยกเลิก</Button>
              <Button type="submit" variant="contained">บันทึก</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={openVehicleDialog} onClose={() => setOpenVehicleDialog(false)}>
          <DialogTitle>
            {currentVehicle ? "แก้ไข" : "เพิ่ม"}ข้อมูลยานพาหนะ
          </DialogTitle>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="ประเภทรถ"
              value={vehicleFormData.carType}
              onChange={(e) => setVehicleFormData({...vehicleFormData, carType: e.target.value})}
              margin="normal"
            >
              <MenuItem value="motorcycle">มอเตอร์ไซค์</MenuItem>
              <MenuItem value="car">รถยนต์</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="ทะเบียนรถ"
              value={vehicleFormData.plate}
              onChange={(e) => setVehicleFormData({...vehicleFormData, plate: e.target.value})}
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="ยี่ห้อ"
              value={vehicleFormData.brand}
              onChange={(e) => setVehicleFormData({...vehicleFormData, brand: e.target.value})}
              margin="normal"
            >
              <MenuItem value="Honda">Honda</MenuItem>
              <MenuItem value="Yamaha">Yamaha</MenuItem>
              <MenuItem value="Suzuki">Suzuki</MenuItem>
              <MenuItem value="Kawasaki">Kawasaki</MenuItem>
              <MenuItem value="Other">อื่นๆ</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="รุ่น"
              value={vehicleFormData.model}
              onChange={(e) => setVehicleFormData({...vehicleFormData, model: e.target.value})}
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                รูปกรมธรรม์
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleFileChange(e, "insurancePhoto")}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                รูปยานพาหนะ
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleFileChange(e, "carPhoto")}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenVehicleDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleVehicleSubmit} variant="contained">
              บันทึก
            </Button>
          </DialogActions>
        </Dialog>


      </Box>
    </Container>
  );
}

export default AdminDashboard; 