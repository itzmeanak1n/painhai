import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>กำลังโหลด...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    // Redirect to appropriate dashboard if user doesn't have permission
    switch (user.userType) {
      case 'student':
        return <Navigate to="/dashboard/student" />;
      case 'rider':
        return <Navigate to="/dashboard/rider" />;
      case 'admin':
        return <Navigate to="/dashboard/admin" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default PrivateRoute; 