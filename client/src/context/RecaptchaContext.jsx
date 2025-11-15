import React, { createContext, useContext } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RecaptchaContext = createContext();

/**
 * Hook to use reCAPTCHA in components
 */
export const useRecaptcha = () => {
  const context = useContext(RecaptchaContext);
  if (!context) {
    throw new Error('useRecaptcha must be used within RecaptchaProvider');
  }
  return context;
};

/**
 * Inner component that has access to reCAPTCHA
 */
const RecaptchaContextProvider = ({ children }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  /**
   * Execute reCAPTCHA and get token
   * @param {string} action - The action name (e.g., 'login', 'signup')
   * @returns {Promise<string>} - The reCAPTCHA token
   */
  const getRecaptchaToken = async (action) => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not ready yet');
      return null;
    }

    try {
      const token = await executeRecaptcha(action);
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      return null;
    }
  };

  return (
    <RecaptchaContext.Provider value={{ getRecaptchaToken }}>
      {children}
    </RecaptchaContext.Provider>
  );
};

/**
 * Main reCAPTCHA Provider
 * Wraps app with Google reCAPTCHA v3 provider
 */
export const RecaptchaProvider = ({ children }) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // If no site key configured, render without reCAPTCHA
  if (!siteKey) {
    console.warn('⚠️ reCAPTCHA site key not configured');
    return (
      <RecaptchaContext.Provider value={{ getRecaptchaToken: async () => null }}>
        {children}
      </RecaptchaContext.Provider>
    );
  }

  return (
    <GoogleReCaptchaProvider 
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <RecaptchaContextProvider>
        {children}
      </RecaptchaContextProvider>
    </GoogleReCaptchaProvider>
  );
};

export default RecaptchaProvider;
