import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 * Optionally checks for specific role
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  // Check if user is authenticated
  if (!token || !userStr) {
    console.log('No token or user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If role is required, check if user has the correct role
  if (requiredRole) {
    try {
      const user = JSON.parse(userStr);
      if (user.role !== requiredRole) {
        console.log(`User role ${user.role} doesn't match required role ${requiredRole}`);
        // Redirect to appropriate dashboard based on their actual role
        switch(user.role) {
          case 'admin':
            return <Navigate to="/admin/dashboard" replace />;
          case 'instructor':
            return <Navigate to="/instructor" replace />;
          case 'student':
            return <Navigate to="/student" replace />;
          default:
            return <Navigate to="/login" replace />;
        }
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated and has correct role, render children
  return children;
};

export default ProtectedRoute;
