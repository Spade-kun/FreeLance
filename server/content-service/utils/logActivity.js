import axios from 'axios';

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010';

/**
 * Create an activity log entry
 */
export const logActivity = async (logData) => {
  try {
    await axios.post(`${LOGS_SERVICE_URL}/api/logs`, logData, {
      timeout: 5000
    });
  } catch (error) {
    console.error('Failed to create activity log:', error.message);
  }
};

/**
 * Log content-related actions (announcements, modules, lessons, quizzes)
 */
export const logContentAction = async ({
  userId,
  userEmail,
  userName,
  userRole = 'instructor',
  action, // CREATE, UPDATE, DELETE
  resource, // announcement, module, lesson, quiz
  resourceId,
  details = {},
  ipAddress,
  userAgent,
  status = 'success'
}) => {
  const logData = {
    userId,
    userEmail,
    userName,
    userRole,
    action,
    actionType: action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
    status,
    metadata: {
      service: 'content-service',
      ...details
    }
  };

  await logActivity(logData);
};

export default {
  logActivity,
  logContentAction
};
