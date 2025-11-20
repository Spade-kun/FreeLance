const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// Create audit log
router.post('/', auditController.createLog);

// Get all logs with filtering
router.get('/', auditController.getLogs);

// Get log statistics
router.get('/stats', auditController.getLogStats);

// Get user activity logs
router.get('/user/:userId', auditController.getUserLogs);

// Get log by ID
router.get('/:id', auditController.getLogById);

// Delete old logs (cleanup)
router.delete('/cleanup', auditController.deleteOldLogs);

module.exports = router;
