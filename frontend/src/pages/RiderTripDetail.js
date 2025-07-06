import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
} from '@mui/material';
import { riderService } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigationIcon from '@mui/icons-material/Navigation';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RiderTripDetail = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await riderService.getTripDetails(tripId);
        console.log('Trip details:', data);
        setTrip(data);
      } catch (err) {
        console.error('Error fetching trip details:', err);
        setError(err.message || 'ไม่สามารถดึงข้อมูลการเดินทางได้');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleCompleteTrip = async () => {
    try {
      setLoading(true);
      const response = await riderService.completeTrip(tripId);
      if (response.success) {
        // อัพเดทข้อมูลทริปในหน้าจอ
        const updatedTrip = { ...trip, status: 'success' };
        setTrip(updatedTrip);
      }
    } catch (err) {
      setError(err.message || 'ไม่สามารถจบงานได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/rider')}
        >
          กลับไปหน้าหลัก
        </Button>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">ไม่พบข้อมูลการเดินทาง</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/rider')}
          sx={{ mt: 2 }}
        >
          กลับไปหน้าหลัก
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard/rider')}
        sx={{ mb: 2 }}
      >
        กลับไปหน้าหลัก
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          รายละเอียดการเดินทาง
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              วันที่และเวลา
            </Typography>
            <Typography variant="body1">
              {formatDate(trip.date)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              ประเภทการเดินทาง
            </Typography>
            <Typography variant="body1">
              {trip.tripType === 'round' ? 'ไป-กลับ' : 'เที่ยวเดียว'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              ต้นทาง
            </Typography>
            <Typography variant="body1">
              {trip.pickUpName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              ปลายทาง
            </Typography>
            <Typography variant="body1">
              {trip.destinationName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              ชื่อ-นามสกุล ผู้โดยสาร
            </Typography>
            <Typography variant="body1">
              {trip.studentName || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              เบอร์โทรศัพท์
            </Typography>
            <Typography variant="body1">
              {trip.studentTel || '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              สถานะ
            </Typography>
            <Typography variant="body1" color={
              trip.status === 'pending' ? 'warning.main' :
              trip.status === 'accepted' ? 'success.main' :
              'text.primary'
            }>
              {trip.status === 'pending' ? 'รอการตอบรับ' :
               trip.status === 'accepted' ? 'รับงานแล้ว' :
               trip.status}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {trip.pickUpLink && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<NavigationIcon />}
              onClick={() => window.open(trip.pickUpLink, '_blank')}
            >
              นำทางไปยังต้นทาง
            </Button>
          )}

          {trip.destinationLink && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<NavigationIcon />}
              onClick={() => window.open(trip.destinationLink, '_blank')}
            >
              นำทางไปยังปลายทาง
            </Button>
          )}

          {trip.riderQRscan && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<QrCode2Icon />}
              onClick={() => setShowQR(true)}
            >
              แสดง QR Code ชำระเงิน
            </Button>
          )}

          {trip.status === 'accepted' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleCompleteTrip}
            >
              จบงาน
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={showQR} onClose={() => setShowQR(false)}>
        <DialogContent>
          {trip?.riderQRscan ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src={trip.riderQRscan}
                alt="QR Code ชำระเงิน"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
                onError={(e) => {
                  console.error('Error loading QR code:', e);
                  console.log('QR code path:', trip.riderQRscan);
                  e.target.style.display = 'none';
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                QR Code สำหรับชำระเงิน
              </Typography>
            </Box>
          ) : (
            <Typography>ไม่พบ QR Code</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default RiderTripDetail; 