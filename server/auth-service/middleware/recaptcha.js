import axios from 'axios';

/**
 * Middleware to verify Google reCAPTCHA v3 token
 * @param {string} action - The action name to verify (e.g., 'login', 'signup')
 * @param {number} minScore - Minimum score threshold (0.0 to 1.0, default 0.5)
 */
export const verifyRecaptcha = (action = 'submit', minScore = 0.5) => {
  return async (req, res, next) => {
    try {
      const { recaptchaToken } = req.body;

      // Skip verification if reCAPTCHA is not configured
      if (!process.env.RECAPTCHA_SECRET_KEY) {
        console.warn('⚠️ reCAPTCHA secret key not configured, skipping verification');
        return next();
      }

      // Check if token is provided
      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA token is required'
        });
      }

      // Verify token with Google
      const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const response = await axios.post(verificationUrl, null, {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
          remoteip: req.ip || req.connection.remoteAddress
        }
      });

      const { success, score, action: responseAction, 'error-codes': errorCodes } = response.data;

      // Check if verification was successful
      if (!success) {
        console.error('reCAPTCHA verification failed:', errorCodes);
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA verification failed',
          errors: errorCodes
        });
      }

      // Verify action matches
      if (responseAction !== action) {
        console.warn(`reCAPTCHA action mismatch: expected ${action}, got ${responseAction}`);
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA action mismatch'
        });
      }

      // Check score threshold
      if (score < minScore) {
        console.warn(`reCAPTCHA score too low: ${score} < ${minScore}`);
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA verification failed: suspicious activity detected',
          score
        });
      }

      // Store score in request for logging
      req.recaptchaScore = score;

      console.log(`✅ reCAPTCHA verified: action=${action}, score=${score}`);
      next();

    } catch (error) {
      console.error('reCAPTCHA verification error:', error.message);
      
      // In development, allow requests to pass through even if reCAPTCHA fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ reCAPTCHA error in development, allowing request');
        return next();
      }

      return res.status(500).json({
        success: false,
        message: 'Error verifying reCAPTCHA'
      });
    }
  };
};

/**
 * Middleware to verify reCAPTCHA for login action
 */
export const verifyRecaptchaLogin = verifyRecaptcha('login', 0.5);

/**
 * Middleware to verify reCAPTCHA for signup action
 */
export const verifyRecaptchaSignup = verifyRecaptcha('signup', 0.5);

export default verifyRecaptcha;
