import axios from 'axios';

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010/api/logs';

/**
 * Log user action to the audit log service
 */
export const logAction = async (logData, req = null) => {
  try {
    const payload = {
      ...logData,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress) : null,
      userAgent: req ? req.get('User-Agent') : null,
      timestamp: new Date().toISOString()
    };

    // Send to logs service (fire and forget)
    axios.post(LOGS_SERVICE_URL, payload).catch(err => {
      console.error('Failed to send log to audit service:', err.message);
    });

    // Also log to console
    console.log(`📝 [${logData.actionType}] ${logData.userName} (${logData.userRole}): ${logData.action}`);
  } catch (error) {
    console.error('Error in logAction:', error.message);
  }
};
