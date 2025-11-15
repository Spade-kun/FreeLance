import React, { createContext, useContext } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GoogleAuthContext = createContext();

export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
  }
  return context;
};

/**
 * Google OAuth Provider Component
 * Wraps app with Google OAuth functionality
 */
export const GoogleAuthProvider = ({ children }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.warn('⚠️ Google OAuth client ID not configured');
    return children;
  }

  /**
   * Handle Google Sign-In
   * Redirects to Google OAuth (no popup)
   */
  const handleGoogleSignIn = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:1001/api';
    const googleAuthUrl = `${apiUrl}/auth/google`;
    
    // Redirect to Google OAuth in same window
    window.location.href = googleAuthUrl;
  };

  const value = {
    handleGoogleSignIn,
    clientId
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleAuthContext.Provider value={value}>
        {children}
      </GoogleAuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthProvider;
