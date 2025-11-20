import axios from 'axios';

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010';

/**
 * Log user activity to the logs service
 * @param {Object} logData - The log data
 */
export const logActivity = async (logData) => {
  try {
    await axios.post(`${LOGS_SERVICE_URL}/api/logs`, {
      userId: logData.userId,
      userEmail: logData.userEmail,
      userName: logData.userName,
      userRole: logData.userRole,
      action: logData.action,
      actionType: logData.actionType,
      resource: logData.resource,
      resourceId: logData.resourceId || null,
      details: logData.details || null,
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
      status: logData.status || 'success',
      metadata: logData.metadata || null
    });
  } catch (error) {
    // Don't throw error, just log it - logging should not break the main flow
    console.error('Failed to log activity:', error.message);
  }
};

/**
 * Log login activity
 */
export const logLogin = async (user, ipAddress, userAgent, status = 'success') => {
  let userName = user.email; // Default to email
  
  // Try to get the user's name in various formats
  if (user.name) {
    userName = user.name;
  } else if (user.firstName || user.lastName) {
    userName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  
  await logActivity({
    userId: user._id || user.userId,
    userEmail: user.email,
    userName: userName,
    userRole: user.role,
    action: status === 'success' ? 'User logged in' : 'Login attempt failed',
    actionType: status === 'success' ? 'LOGIN' : 'LOGIN_FAILED',
    resource: 'authentication',
    ipAddress,
    userAgent,
    status
  });
};

/**
 * Log logout activity
 */
export const logLogout = async (user, ipAddress, userAgent) => {
  let userName = user.email; // Default to email
  
  // Try to get the user's name in various formats
  if (user.name) {
    userName = user.name;
  } else if (user.firstName || user.lastName) {
    userName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  
  await logActivity({
    userId: user._id || user.userId,
    userEmail: user.email,
    userName: userName,
    userRole: user.role,
    action: 'User logged out',
    actionType: 'LOGOUT',
    resource: 'authentication',
    ipAddress,
    userAgent,
    status: 'success'
  });
};

export default {
  logActivity,
  logLogin,
  logLogout
};
