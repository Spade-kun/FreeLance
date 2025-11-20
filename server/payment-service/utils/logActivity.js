import axios from 'axios';

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010';

/**
 * Log user activity to the logs service
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
    console.error('Failed to log activity:', error.message);
  }
};

/**
 * Log payment activity
 */
export const logPayment = async (user, paymentData, status = 'success') => {
  await logActivity({
    userId: user._id || user.userId || user.id,
    userEmail: user.email || user.userEmail,
    userName: user.name || user.userName || `${user.firstName} ${user.lastName}` || user.email,
    userRole: user.role || user.userRole || 'student',
    action: `Payment ${status === 'success' ? 'completed' : 'failed'} - $${paymentData.amount}`,
    actionType: 'CREATE',
    resource: 'payment',
    resourceId: paymentData.paymentId || paymentData._id,
    details: `Payment for ${paymentData.courseName || paymentData.courseTitle || 'course'}`,
    status,
    metadata: {
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      courseId: paymentData.courseId
    }
  });
};

export default {
  logActivity,
  logPayment
};
