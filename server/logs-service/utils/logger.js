const axios = require('axios');

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010/api/logs';

/**
 * Log user action to the audit log service
 * @param {Object} logData - Log data object
 * @param {string} logData.userId - User ID
 * @param {string} logData.userEmail - User email
 * @param {string} logData.userName - User name
 * @param {string} logData.userRole - User role (admin, instructor, student)
 * @param {string} logData.action - Description of action
 * @param {string} logData.actionType - Type of action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)
 * @param {string} logData.resource - Resource type (User, Course, Assignment, etc.)
 * @param {string} logData.resourceId - ID of affected resource
 * @param {string} logData.details - Additional details
 * @param {Object} logData.metadata - Additional metadata
 * @param {string} logData.status - Status (success, failed, pending)
 * @param {string} logData.errorMessage - Error message if failed
 */
const logAction = async (logData, req = null) => {
  try {
    const payload = {
      ...logData,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress) : null,
      userAgent: req ? req.get('User-Agent') : null,
      timestamp: new Date().toISOString()
    };

    // Send to logs service (fire and forget, don't wait for response)
    axios.post(LOGS_SERVICE_URL, payload).catch(err => {
      console.error('Failed to send log to audit service:', err.message);
    });

    // Also log to console for immediate visibility
    console.log(`📝 [${logData.actionType}] ${logData.userName} (${logData.userRole}): ${logData.action}`);
  } catch (error) {
    console.error('Error in logAction:', error.message);
  }
};

/**
 * Middleware to automatically log all requests
 */
const requestLogger = (serviceName) => {
  return (req, res, next) => {
    const user = req.user || req.body.user || null;
    
    if (user && user.userId) {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusCategory = Math.floor(res.statusCode / 100);
        
        logAction({
          userId: user.userId,
          userEmail: user.email || 'N/A',
          userName: user.name || user.userName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          userRole: user.role,
          action: `${req.method} ${req.originalUrl}`,
          actionType: 'VIEW',
          resource: serviceName,
          details: `Response: ${res.statusCode} (${duration}ms)`,
          status: statusCategory === 2 ? 'success' : 'failed',
          metadata: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`
          }
        }, req);
      });
    }
    
    next();
  };
};

module.exports = {
  logAction,
  requestLogger
};
