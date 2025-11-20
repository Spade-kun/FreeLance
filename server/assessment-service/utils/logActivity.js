import axios from 'axios';

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010';

/**
 * Log assessment activity (activities, grading)
 */
export const logAssessmentAction = async (user, actionType, resourceType, resourceId, details) => {
  try {
    const actionMap = {
      CREATE: `Created ${resourceType.toLowerCase()}`,
      UPDATE: `Updated ${resourceType.toLowerCase()}`,
      DELETE: `Deleted ${resourceType.toLowerCase()}`
    };

    await axios.post(`${LOGS_SERVICE_URL}/api/logs`, {
      userId: user._id || user.userId,
      userEmail: user.email,
      userName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      userRole: user.role,
      action: actionMap[actionType] || `${actionType} ${resourceType.toLowerCase()}`,
      actionType: actionType,
      resource: resourceType,
      resourceId: resourceId,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      status: 'success'
    });
  } catch (error) {
    // Don't throw error, just log it - logging should not break the main flow
    console.error('Failed to log activity:', error.message);
  }
};

export default { logAssessmentAction };
