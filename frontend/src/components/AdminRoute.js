import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute; 