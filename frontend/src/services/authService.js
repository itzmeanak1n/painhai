import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const authService = {
  registerStudent: (data) => axios.post(`${API_URL}/auth/register/student`, data),
  registerRider: (data) => {
    console.log('Sending data to backend:', data);
    return axios.post(`${API_URL}/auth/register/rider`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  registerAdmin: (data) => axios.post(`${API_URL}/auth/register/admin`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
}; 