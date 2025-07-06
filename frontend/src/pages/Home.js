import React from 'react';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          ยินดีต้อนรับสู่ระบบขนส่งไปไหน ไปไหน
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          ระบบขนส่งสำหรับนักศึกษาที่ต้องการความสะดวกสบายในการเดินทาง
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register/student')}
            >
              สมัครสมาชิกสำหรับนักศึกษา
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register/rider')}
            >
              สมัครสมาชิกสำหรับไรเดอร์
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
            >
              เข้าสู่ระบบ
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Home; 