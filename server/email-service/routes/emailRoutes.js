const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Send new activity notification to enrolled students
router.post('/send-activity-notification', emailController.sendNewActivityNotification);

// Send welcome email to new user
router.post('/send-welcome-email', emailController.sendWelcomeEmail);

// Get email logs
router.get('/logs', emailController.getEmailLogs);

// Test email configuration
router.post('/test', emailController.testEmail);

module.exports = router;
