import React, {
  useState,
  useEffect,
  useContext,
  memo,
  useCallback,
} from "react";
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
  Switch,
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
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { riderService } from "../services/api";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';

function RiderDashboard(
  {
    /* props หากมีจาก parent */
  }
) {
  const {
    user,
    profile,
    logout,
    updateProfileInContext,
    riderPendingTrips,
    updateRiderPendingTrips,
  } = useAuth();
  console.log("Profile data from context:", profile);
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    carType: "",
    plate: "",
    brand: "",
    model: "",
  });
  const [vehicleFiles, setVehicleFiles] = useState({
    insurancePhoto: null,
    carPhoto: null,
  });
  const [vehicleError, setVehicleError] = useState("");
  const navigate = useNavigate();
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    riderFirstname: "",
    riderLastname: "",
    riderTel: "",
    riderAddress: "",
    riderEmail: "",
    riderNationalId: "",
  });
  const [profileError, setProfileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTrips, setActiveTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(true);
  const [profileFiles, setProfileFiles] = useState({
    RiderProfilePic: null,
    RiderStudentCard: null,
    QRscan: null,
    riderLicense: null
  });
  const [success, setSuccess] = useState("");
  const [cachedData, setCachedData] = useState({
    vehicles: null,
    activeTrips: null,
    pendingTrips: null
  });
  const [debounceTimer, setDebounceTimer] = useState(null);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('th-TH', options);
  };

  const fetchActiveTrips = useCallback(async () => {
    try {
      if (cachedData.activeTrips) {
        setActiveTrips(cachedData.activeTrips);
        return;
      }

      console.log('Fetching active trips...');
      const response = await riderService.getActiveTrips();
      console.log('Active trips raw response:', response);
      
      let tripsData = [];
      if (Array.isArray(response)) {
        tripsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        tripsData = response.data;
      }

      setActiveTrips(tripsData);
      setCachedData(prev => ({ ...prev, activeTrips: tripsData }));
      
      if (tripsData.length > 0) {
        setActiveTab('active');
      }
    } catch (error) {
      console.error('Error fetching active trips:', error);
      setActiveTrips([]);
    }
  }, [cachedData.activeTrips]);

  const handleAcceptTrip = useCallback(async (tripId) => {
    console.log('=== Start handleAcceptTrip ===');
    console.log('tripId:', tripId);
    console.log('user:', user);
    console.log('profile:', profile);

    if (!tripId) {
      console.error('No trip ID provided');
      setError('ไม่พบรหัสการเดินทาง');
      return;
    }

    if (!user || !profile) {
      console.error('No user or profile data');
      setError('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    try {
      console.log('Sending request to acceptTrip with:', { tripId, riderId: user.id });
      const response = await riderService.acceptTrip(tripId, user.id);
      console.log('Accept trip response:', response);

      if (response.success) {
        // อัพเดทรายการงานที่รอการตอบรับ
        await updateRiderPendingTrips();
        // อัพเดทรายการงานที่กำลังดำเนินการ
        await fetchActiveTrips();
        // เปลี่ยนแท็บไปที่งานที่กำลังดำเนินการ
        setActiveTab('active');
        setError(null);
      } else {
        setError(response.message || 'ไม่สามารถรับงานได้');
      }
    } catch (error) {
      console.error('Error in handleAcceptTrip:', error);
      setError(error.message || 'ไม่สามารถรับงานได้');
    }
    console.log('=== End handleAcceptTrip ===');
  }, [user, profile, updateRiderPendingTrips, fetchActiveTrips]);

  const fetchVehicles = useCallback(async () => {
    if (!user?.id) return;
    
    if (cachedData.vehicles) {
      setVehicles(cachedData.vehicles);
      return;
    }

    setIsLoadingVehicles(true);
    setVehicleError("");
    try {
      const response = await riderService.getVehicles();
      const vehiclesData = response.data || [];
      setVehicles(vehiclesData);
      setCachedData(prev => ({ ...prev, vehicles: vehiclesData }));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicleError("ไม่สามารถโหลดข้อมูลยานพาหนะได้");
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [user?.id, cachedData.vehicles]);

  const handleVehicleSubmit = useCallback(async () => {
    try {
      const formData = new FormData();
      Object.keys(vehicleFormData).forEach((key) => {
        if (vehicleFormData[key]) {
          formData.append(key, vehicleFormData[key]);
        }
      });
      if (vehicleFiles.insurancePhoto) {
        formData.append("insurancePhoto", vehicleFiles.insurancePhoto);
      }
      if (vehicleFiles.carPhoto) {
        formData.append("carPhoto", vehicleFiles.carPhoto);
      }

      if (currentVehicle) {
        console.log(
          "Attempting to update vehicle with carId:",
          currentVehicle.carId
        );
        await riderService.updateVehicle(currentVehicle.carId, formData);
      } else {
        console.log("Attempting to add new vehicle");
        await riderService.addVehicle(formData);
      }
      setOpenVehicleDialog(false);
      fetchVehicles();
    } catch (err) {
      console.error("Error submitting vehicle:", err);
      setVehicleError(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    }
  }, [
    currentVehicle,
    fetchVehicles,
    riderService,
    vehicleFormData,
    vehicleFiles,
  ]);

  const handleDeleteVehicle = useCallback(
    async (carId) => {
      if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบยานพาหนะนี้?")) {
        setVehicleError("");
        try {
          await riderService.deleteVehicle(carId);
          fetchVehicles();
        } catch (err) {
          console.error("Error deleting vehicle:", err);
          setVehicleError(
            err.response?.data?.message || "เกิดข้อผิดพลาดในการลบข้อมูล"
          );
        }
      }
    },
    [fetchVehicles, riderService]
  );

  const handleFileChange = useCallback(
    (e, field) => {
      setVehicleFiles({
        ...vehicleFiles,
        [field]: e.target.files[0],
      });
    },
    [vehicleFiles]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  const handleOpenVehicleDialog = useCallback(
    (vehicle) => {
      setCurrentVehicle(vehicle);
      setOpenVehicleDialog(true);
      if (vehicle) {
        setVehicleFormData({
          carType: vehicle.carType,
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
        });
        setVehicleFiles({
          insurancePhoto: vehicle.insurancePhoto,
          carPhoto: vehicle.carPhoto,
        });
      } else {
        setVehicleFormData({
          carType: "",
          plate: "",
          brand: "",
          model: "",
        });
        setVehicleFiles({
          insurancePhoto: null,
          carPhoto: null,
        });
      }
      setVehicleError(""); // Clear any previous errors when opening the dialog
    },
    [
      setOpenVehicleDialog,
      setCurrentVehicle,
      setVehicleFormData,
      setVehicleFiles,
    ]
  );

  const handleOpenProfileEditDialog = useCallback(() => {
    setProfileError("");
    setProfileFormData({
      riderFirstname: profile?.riderFirstname || "",
      riderLastname: profile?.riderLastname || "",
      riderTel: profile?.riderTel || "",
      riderAddress: profile?.riderAddress || "",
      riderEmail: profile?.riderEmail || "",
      riderNationalId: profile?.riderNationalId || "",
    });
    setOpenProfileDialog(true);
  }, [profile, setOpenProfileDialog, setProfileFormData]);

  const handleCloseProfileDialog = useCallback(() => {
    setOpenProfileDialog(false);
    setProfileError("");
  }, [setOpenProfileDialog]);

  const handleProfileFormChange = useCallback(
    (e) => {
      setProfileFormData({
        ...profileFormData,
        [e.target.name]: e.target.value,
      });
    },
    [profileFormData]
  );

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formDataToSend = new FormData();
      
      // เพิ่มข้อมูลทั่วไป
      Object.keys(profileFormData).forEach(key => {
        if (profileFormData[key] !== null && profileFormData[key] !== undefined) {
          formDataToSend.append(key, profileFormData[key]);
        }
      });

      // เพิ่มไฟล์รูปภาพ
      Object.keys(profileFiles).forEach(key => {
        if (profileFiles[key]) {
          formDataToSend.append(key, profileFiles[key]);
        }
      });

      // เพิ่มข้อมูลที่จำเป็น
      if (profile) {
        formDataToSend.append('riderId', profile.riderId);
      }

      console.log('Sending profile update with data:', {
        formData: Object.fromEntries(formDataToSend.entries()),
        files: profileFiles
      });

      const response = await axios.put(
        `http://localhost:5000/api/riders/profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        }
      );

      if (response.data.success) {
        setSuccess('อัพเดทข้อมูลสำเร็จ');
        
        // อัพเดทข้อมูลใน context
        updateProfileInContext(response.data.rider);
        
        // รีเซ็ตไฟล์
        setProfileFiles({
          RiderProfilePic: null,
          RiderStudentCard: null,
          QRscan: null,
          riderLicense: null
        });
        
        // ปิด modal
        handleCloseProfileDialog();
        
        // รีโหลดข้อมูล
        window.location.reload();
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    }
  };

  // เพิ่มฟังก์ชันสำหรับจัดการการเปลี่ยนไฟล์
  const handleProfileFileChange = useCallback((e, field) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`เลือกไฟล์ ${field}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
      setProfileFiles(prev => ({
        ...prev,
        [field]: file
      }));
    }
  }, []);

  // อัพเดท state เริ่มต้นของ profileFormData
  useEffect(() => {
    if (profile) {
      setProfileFormData({
        riderFirstname: profile.riderFirstname || "",
        riderLastname: profile.riderLastname || "",
        riderTel: profile.riderTel || "",
        riderAddress: profile.riderAddress || "",
        riderEmail: profile.riderEmail || "",
        riderNationalId: profile.riderNationalId || ""
      });
    }
  }, [profile]);

  const handleRejectTrip = useCallback(
    async (tripId) => {
      try {
        setError(null);
        await riderService.rejectTrip(tripId);
        await updateRiderPendingTrips();
      } catch (err) {
        setError(err.toString());
      }
    },
    [riderService, updateRiderPendingTrips, setError]
  );

  const renderVehicleTable = useCallback(
    () => (
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">ยานพาหนะของฉัน</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenVehicleDialog(null)} // Pass null for adding new vehicle
          >
            เพิ่มยานพาหนะ
          </Button>
        </Box>
        {vehicleError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {vehicleError}
          </Alert>
        )}
        {isLoadingVehicles ? (
          <Typography>กำลังโหลดยานพาหนะ...</Typography>
        ) : vehicles.length === 0 ? (
          <Typography>คุณยังไม่มียานพาหนะ</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>ป้ายทะเบียน</TableCell>
                  <TableCell>ยี่ห้อ</TableCell>
                  <TableCell>รุ่น</TableCell>
                  <TableCell>รูปภาพ</TableCell>
                  <TableCell align="right">การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.carId}>
                    <TableCell>{vehicle.carType}</TableCell>
                    <TableCell>{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.brand}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>
                      <img
                        src={getVehicleImageUrl(vehicle.carPhoto)}
                        alt="รูปรถ"
                        style={{
                          height: 40,
                          width: "auto",
                          objectFit: "contain"
                        }}
                        onError={(e) => handleImageError(e, 'car photo')}
                      />
                      {vehicle.insurancePhoto && (
                        <img
                          src={getVehicleImageUrl(vehicle.insurancePhoto)}
                          alt="รูปประกัน"
                          style={{
                            height: 40,
                            width: "auto",
                            marginLeft: 5,
                            objectFit: "contain"
                          }}
                          onError={(e) => handleImageError(e, 'insurance photo')}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="แก้ไข">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenVehicleDialog(vehicle)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteVehicle(vehicle.carId)}
                        >
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
    ),
    [
      vehicles,
      isLoadingVehicles,
      vehicleError,
      handleOpenVehicleDialog,
      handleDeleteVehicle,
    ]
  );

  const fetchPlaces = useCallback(async () => {
    // ลบฟังก์ชันนี้เนื่องจากไม่มีใน API
  }, []);

  const updateRiderPendingTripsEffect = useCallback(() => {
    updateRiderPendingTrips();
  }, [updateRiderPendingTrips]);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!user?.id) {
        console.log('No user ID, skipping initial data fetch');
        return;
      }
      
      try {
        console.log('Starting initial data fetch...');
        setIsLoading(true);
        
        const [pendingTrips, activeTrips, vehicles] = await Promise.all([
          updateRiderPendingTrips(),
          riderService.getActiveTrips(),
          riderService.getVehicles()
        ]);

        if (isMounted) {
          setCachedData({
            vehicles: vehicles.data || [],
            activeTrips: Array.isArray(activeTrips) ? activeTrips : (activeTrips?.data || []),
            pendingTrips: Array.isArray(pendingTrips) ? pendingTrips : (pendingTrips?.data || [])
          });

          setVehicles(vehicles.data || []);
          setActiveTrips(Array.isArray(activeTrips) ? activeTrips : (activeTrips?.data || []));
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const updateTrips = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        timeoutId = setTimeout(async () => {
          if (activeTab === 'pending') {
            const pendingTrips = await updateRiderPendingTrips();
            if (isMounted) {
              setCachedData(prev => ({ ...prev, pendingTrips }));
            }
          } else if (activeTab === 'active') {
            const activeTrips = await riderService.getActiveTrips();
            if (isMounted) {
              const tripsData = Array.isArray(activeTrips) ? activeTrips : (activeTrips?.data || []);
              setCachedData(prev => ({ ...prev, activeTrips: tripsData }));
              setActiveTrips(tripsData);
            }
          }
          if (isMounted) {
            setIsLoading(false);
          }
        }, 300);

        setDebounceTimer(timeoutId);
      } catch (error) {
        console.error('Error updating trips:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    updateTrips();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [activeTab, user?.id]);

  useEffect(() => {
    console.log('Active trips updated:', activeTrips);
  }, [activeTrips]);

  useEffect(() => {
    console.log('Component state updated:', {
      activeTab,
      isLoading,
      activeTripsLength: activeTrips?.length,
      activeTrips,
      error
    });
  }, [activeTab, isLoading, activeTrips, error]);

  const getPlaceName = useCallback((placeId) => {
    const place = places.find(p => p.placeId === placeId);
    return place ? place.placeName : 'ไม่พบสถานที่';
  }, [places]);

  const renderActiveTrips = useCallback((trip) => (
    <TableRow key={trip.tripId}>
      <TableCell>{formatDate(trip.date)}</TableCell>
      <TableCell>{trip.studentName || `${trip.studentFirstname} ${trip.studentLastname}`}</TableCell>
      <TableCell>{trip.studentTel}</TableCell>
      <TableCell>{trip.pickUpName}</TableCell>
      <TableCell>{trip.destinationName}</TableCell>
      <TableCell>{trip.isRoundTrip ? 'ไป-กลับ' : 'เที่ยวเดียว'}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="ดูรายละเอียด">
            <IconButton
              color="primary"
              onClick={() => {
                console.log('Viewing trip details:', trip);
                navigate(`/rider/trips/${trip.tripId}`);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  ), [formatDate, navigate]);
  const handleImageError = useCallback((e, imageType) => {
    console.log(`Error loading ${imageType}:`, {
      src: e.target.src,
      error: e,
      profile: profile,
      vehicle: imageType.includes('car') || imageType.includes('insurance') ? vehicles.find(v => v.carPhoto === e.target.src.split('/').pop() || v.insurancePhoto === e.target.src.split('/').pop()) : null
    });

    if (imageType === 'profile picture') {
      e.target.src = defaultAvatar;
    } else if (imageType === 'QR code') {
      const currentSrc = e.target.src;
      setTimeout(() => {
        if (e.target) {
          const retryUrl = currentSrc.includes('/uploads/') 
            ? currentSrc 
            : `http://localhost:5000/${profile.QRscan}`;
          e.target.src = retryUrl;
        }
      }, 1000);
    } else {
      e.target.style.display = 'none';
    }
  }, [profile, vehicles]);

  const getImageUrl = useCallback((filename) => {
    if (!filename) return defaultAvatar;
    
    if (filename.startsWith('http')) {
      return filename;
    }
    // ถ้าไม่มี uploads/ นำหน้า ให้เพิ่มเข้าไป
    if (!filename.startsWith('uploads/')) {
      return `http://localhost:5000/uploads/${filename}`;
    }
    return `http://localhost:5000/${filename}`;
  }, []);

  const getVehicleImageUrl = useCallback((filename) => {
    if (!filename) return defaultAvatar;
    
    if (filename.startsWith('http')) {
      return filename;
    }
    // ถ้าไม่มี uploads/vehicles นำหน้า ให้เพิ่มเข้าไป
    if (!filename.startsWith('uploads/vehicles/')) {
      return `http://localhost:5000/uploads/vehicles/${filename}`;
    }
    return `http://localhost:5000/${filename}`;
  }, []);

  // แสดงข้อมูล profile เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (profile) {
      console.log('Raw profile image data:', {
        RiderProfilePic: profile.RiderProfilePic,
        RiderStudentCard: profile.RiderStudentCard,
        QRscan: profile.QRscan,
        riderLicense: profile.riderLicense
      });
    }
  }, [profile]);

  // แสดงข้อมูล vehicles เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (vehicles.length > 0) {
      console.log('Raw vehicle image data:', vehicles.map(v => ({
        carId: v.carId,
        carPhoto: v.carPhoto,
        insurancePhoto: v.insurancePhoto
      })));
    }
  }, [vehicles]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar 
    sx={{ bgcolor: "secondary.main", width: 56, height: 56 }}
    src={getImageUrl(profile?.RiderProfilePic)}
  >
    {!profile?.RiderProfilePic && (
      <>{profile?.riderFirstname?.[0]}{profile?.riderLastname?.[0]}</>
    )}
  </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                สวัสดี, {profile?.riderFirstname} {profile?.riderLastname}
                <Tooltip title="แก้ไขโปรไฟล์">
                  <IconButton
                    onClick={handleOpenProfileEditDialog}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Box>
          </Box>
          <Tooltip title="ออกจากระบบ">
            <IconButton
              color="error"
              onClick={handleLogout}
              sx={{
                bgcolor: "error.light",
                "&:hover": { bgcolor: "error.main" },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {renderVehicleTable()}

      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  {activeTab === 'pending' ? 'งานที่รอการตอบรับ' : 'งานที่กำลังดำเนินการ'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={activeTab === 'pending' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('pending')}
                  >
                    งานที่รอการตอบรับ
                  </Button>
                  <Button
                    variant={activeTab === 'active' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('active')}
                  >
                    งานที่กำลังดำเนินการ
                  </Button>
                </Box>
              </Box>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {activeTab === 'pending' ? (
                        <>
                          <TableCell>วันที่</TableCell>
                          <TableCell>ประเภทรถ</TableCell>
                          <TableCell>ต้นทาง</TableCell>
                          <TableCell>ปลายทาง</TableCell>
                          <TableCell>ประเภท</TableCell>
                          <TableCell>สถานะ</TableCell>
                          <TableCell>การจัดการ</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>วันที่</TableCell>
                          <TableCell>ชื่อ-นามสกุล</TableCell>
                          <TableCell>เบอร์โทรศัพท์</TableCell>
                          <TableCell>ต้นทาง</TableCell>
                          <TableCell>ปลายทาง</TableCell>
                          <TableCell>ประเภท</TableCell>
                          <TableCell>การจัดการ</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : activeTab === 'pending' ? (
                      riderPendingTrips.length > 0 ? (
                        riderPendingTrips.map((trip) => (
                          <TableRow key={trip.tripId}>
                            <TableCell>{formatDate(trip.date)}</TableCell><TableCell>{trip.vehicleType}</TableCell><TableCell>{trip.pickUpName}</TableCell><TableCell>{trip.destinationName}</TableCell><TableCell>{trip.isRoundTrip ? 'ไป-กลับ' : 'เที่ยวเดียว'}</TableCell><TableCell>
                              <Chip 
                                label={trip.status}
                                color={trip.status === 'pending' ? 'warning' : 'default'}
                              />
                            </TableCell><TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="รับงาน">
                                  <IconButton
                                    color="success"
                                    onClick={() => {
                                      console.log("Trip data:", trip);
                                      if (trip && trip.tripId) {
                                        handleAcceptTrip(trip.tripId);
                                      } else {
                                        console.error("Invalid trip data:", trip);
                                        setError("ไม่พบข้อมูลการเดินทาง");
                                      }
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            ไม่มีงานที่รอการตอบรับ
                          </TableCell>
                        </TableRow>
                      )
                    ) : activeTrips.length > 0 ? (
                      activeTrips.map((trip) => renderActiveTrips(trip))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          ไม่มีงานที่กำลังดำเนินการ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={openProfileDialog}
        onClose={handleCloseProfileDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>แก้ไขโปรไฟล์</DialogTitle>
        <form onSubmit={handleProfileSubmit}>
          <DialogContent>
            {profileError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {profileError}
              </Alert>
            )}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                รูปโปรไฟล์
              </Typography>
              {profile?.RiderProfilePic && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={getImageUrl(profile?.RiderProfilePic)}
                    alt="รูปโปรไฟล์"
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ccc'
                    }}
                    onError={(e) => handleImageError(e, 'profile picture')}
                  />
                </Box>
              )}
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleProfileFileChange(e, 'RiderProfilePic')}
                style={{ marginTop: '10px' }}
              />
            </Box>
            <TextField
              autoFocus
              margin="dense"
              name="riderFirstname"
              label="ชื่อ"
              type="text"
              fullWidth
              variant="outlined"
              value={profileFormData.riderFirstname}
              onChange={handleProfileFormChange}
              required
            />
            <TextField
              margin="dense"
              name="riderLastname"
              label="นามสกุล"
              type="text"
              fullWidth
              variant="outlined"
              value={profileFormData.riderLastname}
              onChange={handleProfileFormChange}
              required
            />
            <TextField
              margin="dense"
              name="riderTel"
              label="เบอร์โทรศัพท์"
              type="text"
              fullWidth
              variant="outlined"
              value={profileFormData.riderTel}
              onChange={handleProfileFormChange}
              required
            />
            <TextField
              margin="dense"
              name="riderAddress"
              label="ที่อยู่"
              type="text"
              fullWidth
              variant="outlined"
              value={profileFormData.riderAddress}
              onChange={handleProfileFormChange}
              required
              multiline
              rows={3}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                รูปบัตรนักศึกษา
              </Typography>
              {profile?.RiderStudentCard && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={getImageUrl(profile?.RiderStudentCard)}
                    alt="บัตรนักศึกษา"
                    style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                    onError={(e) => handleImageError(e, 'student card')}
                  />
                </Box>
              )}
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleProfileFileChange(e, 'RiderStudentCard')}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                QR Code
              </Typography>
              {profile?.QRscan && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={getImageUrl(profile.QRscan)}
                    alt="QR Code"
                    style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                    onError={(e) => {
                      console.log('QR Code error, retrying with full path:', {
                        original: e.target.src,
                        profile: profile
                      });
                      // ถ้าไม่มี uploads/ ให้เพิ่มเข้าไป
                      const retryUrl = e.target.src.includes('uploads/') 
                        ? e.target.src 
                        : `http://localhost:5000/uploads/${profile.QRscan}`;
                      e.target.src = retryUrl;
                    }}
                  />
                </Box>
              )}
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleProfileFileChange(e, 'QRscan')}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ใบขับขี่
              </Typography>
              {profile?.riderLicense && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={getImageUrl(profile?.riderLicense)}
                    alt="ใบขับขี่"
                    style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                    onError={(e) => handleImageError(e, 'license')}
                  />
                </Box>
              )}
              <input
                accept="image/*"
                type="file"
                onChange={(e) => handleProfileFileChange(e, 'riderLicense')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProfileDialog}>ยกเลิก</Button>
            <Button type="submit" variant="contained">
              บันทึก
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={openVehicleDialog}
        onClose={() => setOpenVehicleDialog(false)}
      >
        <DialogTitle>
          {currentVehicle ? "แก้ไข" : "เพิ่ม"}ข้อมูลยานพาหนะ
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="ประเภทรถ"
            value={vehicleFormData.carType}
            onChange={(e) =>
              setVehicleFormData({
                ...vehicleFormData,
                carType: e.target.value,
              })
            }
            margin="normal"
          >
            <MenuItem value="motorcycle">มอเตอร์ไซค์</MenuItem>
            <MenuItem value="car">รถยนต์</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="ทะเบียนรถ"
            value={vehicleFormData.plate}
            onChange={(e) =>
              setVehicleFormData({ ...vehicleFormData, plate: e.target.value })
            }
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="ยี่ห้อ"
            value={vehicleFormData.brand}
            onChange={(e) =>
              setVehicleFormData({ ...vehicleFormData, brand: e.target.value })
            }
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
            onChange={(e) =>
              setVehicleFormData({ ...vehicleFormData, model: e.target.value })
            }
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
    </Container>
  );
}

export default memo(RiderDashboard);
