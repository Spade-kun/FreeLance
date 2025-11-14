import express from 'express';
import passport from 'passport';
import { 
  register,
  login, 
  logout, 
  refreshToken, 
  verifyToken,
  changePassword,
  forgotPassword,
  resetPassword,
  googleCallback,
  completeGoogleRegistration
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin, validateChangePassword, validateResetPassword } from '../middleware/validator.js';
import { verifyRecaptchaLogin, verifyRecaptchaSignup } from '../middleware/recaptcha.js';

const router = express.Router();

// Standard authentication routes
router.post('/register', verifyRecaptchaSignup, validateRegister, register);
router.post('/login', verifyRecaptchaLogin, validateLogin, login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-token', authenticate, verifyToken);
router.post('/change-password', authenticate, validateChangePassword, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  googleCallback
);

router.post('/google/complete', completeGoogleRegistration);

export default router;
