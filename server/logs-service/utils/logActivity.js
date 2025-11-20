import axios from 'axios';

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010';

/**
 * Log user activity to the logs service
 * @param {Object} logData - The log data
 * @param {string} logData.userId - User ID
 * @param {string} logData.userEmail - User email
 * @param {string} logData.userName - User name
 * @param {string} logData.userRole - User role (admin, instructor, student)
 * @param {string} logData.action - Action description
 * @param {string} logData.actionType - Action type (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, EXPORT, OTHER)
 * @param {string} logData.resource - Resource type
 * @param {string} [logData.resourceId] - Resource ID (optional)
 * @param {string} [logData.details] - Additional details (optional)
 * @param {string} [logData.ipAddress] - IP address (optional)
 * @param {string} [logData.userAgent] - User agent (optional)
 * @param {string} [logData.status='success'] - Status (success, failed, pending)
 * @param {Object} [logData.metadata] - Additional metadata (optional)
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
  await logActivity({
    userId: user._id || user.userId,
    userEmail: user.email,
    userName: user.name || user.firstName + ' ' + user.lastName || user.email,
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
  await logActivity({
    userId: user._id || user.userId,
    userEmail: user.email,
    userName: user.name || user.firstName + ' ' + user.lastName || user.email,
    userRole: user.role,
    action: 'User logged out',
    actionType: 'LOGOUT',
    resource: 'authentication',
    ipAddress,
    userAgent,
    status: 'success'
  });
};

/**
 * Log payment activity
 */
export const logPayment = async (user, paymentData, status = 'success') => {
  await logActivity({
    userId: user._id || user.userId,
    userEmail: user.email,
    userName: user.name || user.firstName + ' ' + user.lastName || user.email,
    userRole: user.role,
    action: `Payment ${status === 'success' ? 'completed' : 'failed'} - ${paymentData.amount}`,
    actionType: 'CREATE',
    resource: 'payment',
    resourceId: paymentData.paymentId,
    details: `Payment for ${paymentData.courseName || 'course'}`,
    status,
    metadata: paymentData
  });
};

/**
 * Log course/module activity
 */
export const logCourseAction = async (user, action, actionType, resourceType, resourceId, details, metadata) => {
  await logActivity({
    userId: user._id || user.userId,
    userEmail: user.email,
    userName: user.name || user.firstName + ' ' + user.lastName || user.email,
    userRole: user.role,
    action,
    actionType,
    resource: resourceType,
    resourceId,
    details,
    metadata,
    status: 'success'
  });
};

/**
 * Log content activity
 */
export const logContentAction = async (user, action, actionType, resourceType, resourceId, details, metadata) => {
  await logActivity({
    userId: user._id || user.userId,
    userEmail: user.email,
    userName: user.name || user.firstName + ' ' + user.lastName || user.email,
    userRole: user.role,
    action,
    actionType,
    resource: resourceType,
    resourceId,
    details,
    metadata,
    status: 'success'
  });
};

/**
 * Log user management activity
 */
export const logUserAction = async (actingUser, action, actionType, targetUser, details) => {
  await logActivity({
    userId: actingUser._id || actingUser.userId,
    userEmail: actingUser.email,
    userName: actingUser.name || actingUser.firstName + ' ' + actingUser.lastName || actingUser.email,
    userRole: actingUser.role,
    action,
    actionType,
    resource: 'user',
    resourceId: targetUser._id || targetUser.userId,
    details,
    metadata: { targetUserEmail: targetUser.email, targetUserRole: targetUser.role },
    status: 'success'
  });
};

export default {
  logActivity,
  logLogin,
  logLogout,
  logPayment,
  logCourseAction,
  logContentAction,
  logUserAction
};
