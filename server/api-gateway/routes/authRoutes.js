import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:1002';

// Standard authentication routes
router.post('/register', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/register`));
router.post('/login', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/login`));
router.post('/logout', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/logout`));
router.post('/refresh-token', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/refresh-token`));
router.post('/verify-token', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/verify-token`));
router.post('/change-password', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/change-password`));
router.post('/forgot-password', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/forgot-password`));
router.post('/reset-password', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/reset-password`));

// Google OAuth routes - redirect to auth service directly
router.get('/google', (req, res) => {
  // Redirect to auth service for Google OAuth
  res.redirect(`${AUTH_SERVICE}/api/auth/google`);
});

router.get('/google/callback', (req, res) => {
  // Proxy the callback to auth service
  const queryString = new URLSearchParams(req.query).toString();
  res.redirect(`${AUTH_SERVICE}/api/auth/google/callback?${queryString}`);
});

router.post('/google/complete', (req, res) => proxyRequest(req, res, `${AUTH_SERVICE}/api/auth/google/complete`));

export default router;
