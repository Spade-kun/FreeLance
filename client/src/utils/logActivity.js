import api from '../services/api';

/**
 * Log admin action to the activity logs
 * @param {string} action - Description of the action
 * @param {string} actionType - Type of action (CREATE, UPDATE, DELETE, VIEW, EXPORT)
 * @param {string} resource - Resource type (user, course, module, payment, etc.)
 * @param {string} resourceId - ID of the resource (optional)
 * @param {string} details - Additional details (optional)
 * @param {object} metadata - Additional metadata (optional)
 */
export const logAdminAction = async (action, actionType, resource, resourceId = null, details = null, metadata = null) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.email) {
      console.warn('No user found in localStorage, skipping log');
      return;
    }

    await api.createLog({
      userId: user.id,
      userEmail: user.email,
      userName: user.email, // Will use email as name
      userRole: user.role,
      action,
      actionType,
      resource,
      resourceId,
      details,
      status: 'success',
      metadata
    });
  } catch (error) {
    // Don't throw error - logging should not break the main flow
    console.error('Failed to log admin action:', error.message);
  }
};

/**
 * Log user management actions
 */
export const logUserAction = async (action, actionType, targetUser, details = null) => {
  await logAdminAction(
    action,
    actionType,
    'user',
    targetUser._id || targetUser.id,
    details,
    {
      targetUserEmail: targetUser.email,
      targetUserRole: targetUser.role
    }
  );
};

/**
 * Log course management actions
 */
export const logCourseAction = async (action, actionType, course, details = null) => {
  await logAdminAction(
    action,
    actionType,
    'course',
    course._id || course.id,
    details,
    {
      courseTitle: course.title || course.courseTitle
    }
  );
};

/**
 * Log content management actions
 */
export const logContentAction = async (action, actionType, content, contentType, details = null) => {
  await logAdminAction(
    action,
    actionType,
    contentType, // 'module', 'lesson', 'announcement'
    content._id || content.id,
    details,
    {
      contentTitle: content.title
    }
  );
};

/**
 * Log payment actions
 */
export const logPaymentAction = async (action, actionType, payment, details = null) => {
  await logAdminAction(
    action,
    actionType,
    'payment',
    payment._id || payment.id,
    details,
    {
      amount: payment.amount,
      studentEmail: payment.studentEmail
    }
  );
};

/**
 * Log report/export actions
 */
export const logReportAction = async (action, reportType, details = null) => {
  await logAdminAction(
    action,
    'EXPORT',
    'report',
    null,
    details,
    {
      reportType
    }
  );
};

/**
 * Log view actions (when admin views a page or specific resource)
 */
export const logViewAction = async (resource, resourceId = null, details = null) => {
  await logAdminAction(
    `Viewed ${resource}`,
    'VIEW',
    resource,
    resourceId,
    details
  );
};

export default {
  logAdminAction,
  logUserAction,
  logCourseAction,
  logContentAction,
  logPaymentAction,
  logReportAction,
  logViewAction
};
