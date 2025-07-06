import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const createApiClient = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });
};

// Authentication services
export const authService = {
  login: (data) => createApiClient().post('/api/login', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  registerStudent: (data) => createApiClient().post('/api/register/student', data),
  registerRider: (data) => createApiClient().post('/api/register/rider', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  registerAdmin: (data) => createApiClient().post('/api/register/admin', data),
  getProfile: (userType) => createApiClient().get(`/api/${userType}/profile`),
};

// Student services
export const studentService = {
  getProfile: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/students/profile');
  },
  updateProfile: (data) => createApiClient().put('/api/students/profile', data),
  getPlaces: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/students/places');
  },
  createTrip: async (tripData) => {
    const apiClient = createApiClient();
    return await apiClient.post('/api/students/trips', tripData);
  },
  getTrips: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/students/trips');
  },
};

// Rider services
export const riderService = {
  getProfile: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/riders/profile');
  },
  updateProfile: (data) => createApiClient().put('/api/riders/profile', data),

  // Vehicle Management
  getVehicles: () => createApiClient().get('/api/riders/vehicles'),

  addVehicle: (vehicleData) => {
    console.log('Calling POST /api/riders/vehicles');
    return createApiClient().post('/api/riders/vehicles', vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateVehicle: (carId, vehicleData) => {
    const url = `/api/riders/vehicles/${carId}`;
    console.log('Calling PUT:', url);
    return createApiClient().put(url, vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteVehicle: (carId) => {
    const url = `/api/riders/vehicles/${carId}`;
    console.log(`Calling DELETE ${url}`);
    return createApiClient().delete(url);
  },

  // getTrips: () => createApiClient().get('/riders/trips'),

  // Admin services
  getStatus: () => createApiClient().get('/api/riders/status'),
  updateStatus: (status) => createApiClient().put('/api/riders/status', { status }),

  // เพิ่ม API สำหรับดึงงานที่รอรับและจัดการงาน
  getPendingTrips: async () => {
    try {
      const response = await createApiClient().get('/api/riders/pending-trips');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getTripDetails: async (tripId) => {
    try {
      console.log('Fetching trip details for ID:', tripId);
      const apiClient = createApiClient();
      const response = await apiClient.get(`/api/riders/trips/${tripId}`);
      console.log('Trip details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getTripDetails:', error);
      return null;
    }
  },
  acceptTrip: async (tripId, riderId) => {
    try {
      console.log('Accepting trip:', { tripId, riderId });
      const apiClient = createApiClient();

      const response = await apiClient.put(`/api/riders/trips/${tripId}/accept`, {
        riderId: riderId.toString() // แปลงเป็น string เพื่อให้ตรงกับ type ในฐานข้อมูล
      });
      console.log('Accept trip response:', response.data);

      // ถ้าสำเร็จ ให้อัพเดทรายการงานที่รอการตอบรับและงานที่กำลังดำเนินการ
      if (response.data.success) {
        try {
          // รอให้ backend อัพเดทข้อมูลก่อน
          await new Promise(resolve => setTimeout(resolve, 1000));

          // ดึงรายการงานที่รอการตอบรับใหม่
          const pendingTrips = await apiClient.get('/api/riders/pending-trips');
          console.log('Updated pending trips:', pendingTrips.data);

          // ดึงรายการงานที่กำลังดำเนินการใหม่
          const activeTrips = await apiClient.get('/api/riders/active-trips');
          console.log('Updated active trips:', activeTrips.data);
        } catch (updateError) {
          console.error('Error updating trip lists:', updateError);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error in acceptTrip:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'ไม่สามารถรับงานได้');
    }
  },
  rejectTrip: async (tripId) => {
    try {
      const response = await createApiClient().put(`/api/riders/trips/${tripId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getActiveTrips: async () => {
    try {
      const response = await createApiClient().get('/api/riders/active-trips');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  completeTrip: async (tripId) => {
    try {
      console.log('Completing trip:', tripId);
      const apiClient = createApiClient();
      const response = await apiClient.put(`/api/riders/trips/${tripId}/complete`);
      console.log('Complete trip response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in completeTrip:', error);
      throw error;
    }
  },
};

// Admin services
export const adminService = {
  // Student management
  getStudents: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/admin/students');
  },
  getStudent: (id) => createApiClient().get(`/api/admin/students/${id}`),
  createStudent: (data) => createApiClient().post('/api/admin/students', data),
  updateStudent: (id, data) => createApiClient().put(`/api/admin/students/${id}`, data),
  deleteStudent: (id) => createApiClient().delete(`/api/admin/students/${id}`),

  // Rider management
  getRiders: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/admin/riders');
  },
  getRiderById: (riderId) => createApiClient().get(`/api/admin/riders/${riderId}`),
  createRider: async (riderData) => {
    const apiClient = createApiClient();
    return await apiClient.post('/api/admin/riders', riderData);
  },
  updateRider: async (riderId, data) => {
    const apiClient = createApiClient();
    return await apiClient.put(`/api/admin/riders/${riderId}`, data);
  },
  deleteRider: async (riderId) => {
    try {
      const apiClient = createApiClient();
      const response = await apiClient.delete(`/api/admin/riders/${riderId}`);
      return response;
    } catch (error) {
      console.error('Delete rider error:', error.response?.data);
      throw error;
    }
  },
  approveRider: async (riderId) => {
    const apiClient = createApiClient();
    return await apiClient.put(`/api/admin/riders/${riderId}/approve`);
  },

  // Vehicle management (Admin)
  getRiderVehicles: (riderId) => createApiClient().get(`/api/admin/riders/${riderId}/vehicles`),
  addRiderVehicle: (riderId, data) => createApiClient().post(`/api/admin/riders/${riderId}/vehicles`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateRiderVehicle: (carId, data) => createApiClient().put(`/api/admin/vehicles/${carId}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteRiderVehicle: (carId) => createApiClient().delete(`/api/admin/vehicles/${carId}`),

  // Place management
  getPlaces: async () => {
    const apiClient = createApiClient();
    return await apiClient.get('/api/admin/places');
  },
  addPlace: async (formData) => {
    const apiClient = createApiClient();
    return await apiClient.post('/api/admin/places', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updatePlace: async (placeId, formData) => {
    const apiClient = createApiClient();
    return await apiClient.put(`/api/admin/places/${placeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePlace: async (placeId) => {
    const apiClient = createApiClient();
    return await apiClient.delete(`/api/admin/places/${placeId}`);
  },
};

// Export default instance if needed, otherwise remove
// export default createApiClient();