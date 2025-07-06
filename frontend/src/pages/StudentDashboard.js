import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/api';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Tooltip,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function StudentDashboard() {
  const { user, profile, logout, studentTrips, updateStudentTrips } = useAuth();
  const [openCreateTrip, setOpenCreateTrip] = useState(false);
  const [places, setPlaces] = useState([]);
  const [tripFormData, setTripFormData] = useState({
    carType: '',
    placeIdPickUp: '',
    placeIdDestination: '',
    date: dayjs(),
    isRoundTrip: false
  });
  const [tripError, setTripError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    userFirstname: '',
    userLastname: '',
    userEmail: '',
    userTel: '',
    userAddress: '',
  });
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    fetchPlaces();
    updateStudentTrips();
  }, []);

  useEffect(() => {
    console.log('Initial tripFormData.isRoundTrip:', tripFormData.isRoundTrip);
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await studentService.getPlaces();
      setPlaces(response.data);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('ไม่สามารถโหลดข้อมูลสถานที่ได้');
    }
  };

  const handleCreateTripClick = () => {
    setTripFormData({
      carType: '',
      placeIdPickUp: '',
      placeIdDestination: '',
      date: dayjs(),
      isRoundTrip: false,
    });
    setTripError('');
    setOpenCreateTrip(true);
  };

  const handleTripFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTripFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    console.log('Trip form data updated:', { name, value: type === 'checkbox' ? checked : value });
  };

  const handleDateChange = (newValue) => {
    setTripFormData(prev => ({
      ...prev,
      date: newValue
    }));
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    setTripError('');

    // ตรวจสอบข้อมูล
    if (!tripFormData.carType) {
      setTripError('กรุณาเลือกประเภทรถ');
      return;
    }
    if (!tripFormData.placeIdPickUp) {
      setTripError('กรุณาเลือกสถานที่ต้นทาง');
      return;
    }
    if (!tripFormData.placeIdDestination) {
      setTripError('กรุณาเลือกสถานที่ปลายทาง');
      return;
    }
    if (tripFormData.placeIdPickUp === tripFormData.placeIdDestination) {
      setTripError('สถานที่ต้นทางและปลายทางต้องไม่เหมือนกัน');
      return;
    }
    if (!tripFormData.date) {
      setTripError('กรุณาเลือกเวลาที่ต้องการเดินทาง');
      return;
    }

    try {
      const tripData = {
        carType: tripFormData.carType,
        placeIdPickUp: tripFormData.placeIdPickUp,
        placeIdDestination: tripFormData.placeIdDestination,
        date: tripFormData.date.toISOString(),
        isRoundTrip: tripFormData.isRoundTrip // เพิ่มการส่งข้อมูล isRoundTrip
      };
      console.log('Submitting trip data:', tripData);
      await studentService.createTrip(tripData);
      setOpenCreateTrip(false);
      await updateStudentTrips();
    } catch (err) {
      setTripError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างรายการเดินทาง');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenProfileEditDialog = () => {
    setProfileError('');
    setProfileFormData({
      userFirstname: profile?.userFirstname || '',
      userLastname: profile?.userLastname || '',
      userEmail: profile?.userEmail || '',
      userTel: profile?.userTel || '',
      userAddress: profile?.userAddress || '',
    });
    setOpenProfileDialog(true);
  };

  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
    setProfileError('');
  };

  const handleProfileFormChange = (e) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    try {
      await studentService.updateProfile(profileFormData);
      handleCloseProfileDialog();
    } catch (err) {
      setProfileError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleString('th-TH', options);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {profile?.userFirstname?.[0]}{profile?.userLastname?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                สวัสดี, {profile?.userFirstname} {profile?.userLastname}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                รหัสนักศึกษา: {profile?.studentId}
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

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" gutterBottom>
                      ข้อมูลส่วนตัว
                    </Typography>
                    <Tooltip title="แก้ไขโปรไฟล์">
                      <IconButton 
                        color="primary" 
                        onClick={handleOpenProfileEditDialog}
                        sx={{ ml: 2 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography color="text.secondary">
                    อีเมล: {profile?.userEmail}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    เบอร์โทรศัพท์
                  </Typography>
                  <Typography variant="body1">
                    {profile?.userTel || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    ที่อยู่
                  </Typography>
                  <Typography variant="body1">
                    {profile?.userAddress || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">รายการเดินทาง</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateTripClick}
                  >
                    สร้างรายการเดินทาง
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              รายการเดินทางของฉัน
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>วันที่</TableCell>
                    <TableCell>ประเภทรถ</TableCell>
                    <TableCell>ต้นทาง</TableCell>
                    <TableCell>ปลายทาง</TableCell>
                    <TableCell>ประเภท</TableCell>
                    <TableCell>สถานะ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">กำลังโหลด...</TableCell>
                    </TableRow>
                  ) : studentTrips.length > 0 ? (
                    studentTrips.map((trip) => (
                      <TableRow key={trip._id}>
                        <TableCell>{formatDate(trip.date)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={trip.carType === 'motorcycle' ? 'มอเตอร์ไซค์' : 'รถยนต์'}
                            color={trip.carType === 'motorcycle' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{trip.pickUpName}</TableCell>
                        <TableCell>{trip.destinationName}</TableCell>
                        <TableCell>
                          {trip.isRoundTrip ? 'ไป-กลับ' : 'เที่ยวเดียว'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={trip.status}
                            color={
                              trip.status === 'pending' ? 'warning' :
                              trip.status === 'accepted' ? 'success' :
                              trip.status === 'completed' ? 'info' :
                              'error'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        ไม่มีรายการเดินทาง
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Dialog open={openProfileDialog} onClose={handleCloseProfileDialog} maxWidth="sm" fullWidth>
          <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
          <form onSubmit={handleProfileSubmit}>
            <DialogContent>
              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
              <TextField
                autoFocus
                margin="dense"
                name="userFirstname"
                label="ชื่อ"
                type="text"
                fullWidth
                variant="outlined"
                value={profileFormData.userFirstname}
                onChange={handleProfileFormChange}
                required
              />
              <TextField
                margin="dense"
                name="userLastname"
                label="นามสกุล"
                type="text"
                fullWidth
                variant="outlined"
                value={profileFormData.userLastname}
                onChange={handleProfileFormChange}
                required
              />
              
              <TextField
                margin="dense"
                name="userTel"
                label="เบอร์โทรศัพท์"
                type="text"
                fullWidth
                variant="outlined"
                value={profileFormData.userTel}
                onChange={handleProfileFormChange}
                required
              />
              <TextField
                margin="dense"
                name="userEmail"
                label="อีเมล"
                type="email"
                fullWidth
                variant="outlined"
                value={profileFormData.userEmail}
                onChange={handleProfileFormChange}
                required
              />
              <TextField
                margin="dense"
                name="userAddress"
                label="ที่อยู่"
                type="text"
                fullWidth
                variant="outlined"
                value={profileFormData.userAddress}
                onChange={handleProfileFormChange}
                required
                multiline
                rows={3}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseProfileDialog}>ยกเลิก</Button>
              <Button type="submit" variant="contained">บันทึก</Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={openCreateTrip} onClose={() => setOpenCreateTrip(false)} maxWidth="sm" fullWidth>
          <DialogTitle>สร้างรายการเดินทาง</DialogTitle>
          <form onSubmit={handleTripSubmit}>
            <DialogContent>
              {tripError && <Alert severity="error" sx={{ mb: 2 }}>{tripError}</Alert>}
              
              <FormControl fullWidth margin="normal">
                <InputLabel>ประเภทรถ</InputLabel>
                <Select
                  name="carType"
                  value={tripFormData.carType}
                  onChange={handleTripFormChange}
                  label="ประเภทรถ"
                  required
                >
                  <MenuItem value="motorcycle">มอเตอร์ไซค์</MenuItem>
                  <MenuItem value="car">รถยนต์</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>สถานที่ต้นทาง</InputLabel>
                <Select
                  name="placeIdPickUp"
                  value={tripFormData.placeIdPickUp}
                  onChange={handleTripFormChange}
                  label="สถานที่ต้นทาง"
                  required
                >
                  {places.map((place) => (
                    <MenuItem key={place.placeId} value={place.placeId}>
                      {place.placeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>สถานที่ปลายทาง</InputLabel>
                <Select
                  name="placeIdDestination"
                  value={tripFormData.placeIdDestination}
                  onChange={handleTripFormChange}
                  label="สถานที่ปลายทาง"
                  required
                >
                  {places.map((place) => (
                    <MenuItem key={place.placeId} value={place.placeId}>
                      {place.placeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="เวลาที่ต้องการเดินทาง"
                  value={tripFormData.date}
                  onChange={handleDateChange}
                  sx={{ mt: 2, width: '100%' }}
                  minDateTime={dayjs()}
                  format="DD/MM/YYYY HH:mm"
                />
              </LocalizationProvider>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(tripFormData.isRoundTrip)}
                    onChange={handleTripFormChange}
                    name="isRoundTrip"
                  />
                }
                label="ไป-กลับ"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCreateTrip(false)}>ยกเลิก</Button>
              <Button type="submit" variant="contained">ยืนยัน</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
}

export default StudentDashboard; 