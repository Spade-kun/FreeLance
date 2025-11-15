import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Google Sign-In Button Component
 * Handles Google OAuth authentication flow
 */
const GoogleSignInButton = ({ onSuccess, onError, text = "signin_with" }) => {
  const handleSuccess = (credentialResponse) => {
    console.log('Google login success:', credentialResponse);
    if (onSuccess) {
      onSuccess(credentialResponse);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    if (onError) {
      onError();
    }
  };

  return (
    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={text}
        shape="rectangular"
        theme="outline"
        size="large"
        width="100%"
      />
    </div>
  );
};

export default GoogleSignInButton;
