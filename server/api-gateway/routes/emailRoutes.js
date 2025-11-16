import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const EMAIL_SERVICE_URL = 'http://localhost:1008';

// Send new activity notification
router.post('/send-activity-notification', (req, res) => 
  proxyRequest(`${EMAIL_SERVICE_URL}/api/email/send-activity-notification`, req, res, 'POST')
);

// Get email logs
router.get('/logs', (req, res) => 
  proxyRequest(`${EMAIL_SERVICE_URL}/api/email/logs`, req, res, 'GET')
);

// Test email
router.post('/test', (req, res) => 
  proxyRequest(`${EMAIL_SERVICE_URL}/api/email/test`, req, res, 'POST')
);

export default router;
