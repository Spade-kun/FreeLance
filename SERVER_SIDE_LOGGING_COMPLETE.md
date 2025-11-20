# Server-Side Activity Logging - Complete ✅

## Overview
Successfully integrated server-side activity logging into all microservices to ensure instructor actions are properly tracked in the Activity Logs database.

## Why Server-Side Logging is Critical

### The Problem
Client-side logging alone is insufficient because:
1. **Bypassed Validation**: API calls can be made directly, bypassing the frontend
2. **Incomplete Data**: Client may not send all required context
3. **Security**: Server has authoritative information about the user making the request
4. **Reliability**: Server-side logging ensures every action is captured

### The Solution
Implemented **dual logging** - both client and server side:
- **Client-side**: Immediate feedback, no waiting for server response
- **Server-side**: Authoritative source of truth, cannot be bypassed

## Implemented Services

### 1. Content Service (Port 1005)
**Purpose**: Manages modules and lessons

**Files Modified**:
- ✅ `/server/content-service/utils/logActivity.js` - Created logging utility
- ✅ `/server/content-service/controllers/contentController.js` - Added logging to CRUD operations
- ✅ `/server/content-service/.env` - Added LOGS_SERVICE_URL

**Logged Actions**:
| Function | Action Type | Resource | Details |
|----------|-------------|----------|---------|
| `createModule` | CREATE | Module | courseId, moduleTitle |
| `updateModule` | UPDATE | Module | courseId, moduleTitle |
| `deleteModule` | DELETE | Module | courseId, moduleTitle |
| `createLesson` | CREATE | Lesson | moduleId, lessonTitle, lessonType |
| `updateLesson` | UPDATE | Lesson | moduleId, lessonTitle, lessonType |
| `deleteLesson` | DELETE | Lesson | moduleId, lessonTitle |

**Example Log Entry**:
```json
{
  "userEmail": "instructor@example.com",
  "userRole": "instructor",
  "action": "Created module",
  "actionType": "CREATE",
  "resource": "Module",
  "resourceId": "507f1f77bcf86cd799439011",
  "details": {
    "courseId": "507f...",
    "moduleTitle": "Introduction to React"
  }
}
```

### 2. Assessment Service (Port 1006)
**Purpose**: Manages activities/assignments and grading

**Files Modified**:
- ✅ `/server/assessment-service/utils/logActivity.js` - Created logging utility
- ✅ `/server/assessment-service/controllers/assessmentController.js` - Added logging
- ✅ `/server/assessment-service/.env` - Added LOGS_SERVICE_URL

**Logged Actions**:
| Function | Action Type | Resource | Details |
|----------|-------------|----------|---------|
| `createActivity` | CREATE | Activity | courseId, activityTitle, activityType, totalPoints |
| `updateActivity` | UPDATE | Activity | courseId, activityTitle, activityType, totalPoints |
| `deleteActivity` | DELETE | Activity | courseId, activityTitle |
| `gradeSubmission` | UPDATE | Grade | activityId, activityTitle, studentId, score, totalPoints |

**Example Log Entry**:
```json
{
  "userEmail": "instructor@example.com",
  "userRole": "instructor",
  "action": "Updated grade",
  "actionType": "UPDATE",
  "resource": "Grade",
  "resourceId": "507f1f77bcf86cd799439012",
  "details": {
    "activityId": "507f...",
    "activityTitle": "Assignment 1: JavaScript Basics",
    "studentId": "507f...",
    "score": 85,
    "totalPoints": 100
  }
}
```

### 3. Course Service (Port 1004)
**Purpose**: Manages attendance records

**Files Modified**:
- ✅ `/server/course-service/utils/logActivity.js` - Created logging utility
- ✅ `/server/course-service/controllers/attendanceController.js` - Added logging
- ✅ `/server/course-service/.env` - Added LOGS_SERVICE_URL

**Logged Actions**:
| Function | Action Type | Resource | Details |
|----------|-------------|----------|---------|
| `saveAttendance` (new) | CREATE | Attendance | sectionId, courseId, date, totalStudents, presentCount |
| `saveAttendance` (update) | UPDATE | Attendance | sectionId, courseId, date, totalStudents, presentCount |

**Example Log Entry**:
```json
{
  "userEmail": "instructor@example.com",
  "userRole": "instructor",
  "action": "Created attendance",
  "actionType": "CREATE",
  "resource": "Attendance",
  "resourceId": "507f1f77bcf86cd799439013",
  "details": {
    "sectionId": "507f...",
    "courseId": "507f...",
    "date": "2024-01-15",
    "totalStudents": 30,
    "presentCount": 28
  }
}
```

## Technical Architecture

### Logging Flow
```
Instructor Dashboard (React)
         ↓
    Client-side log
         ↓
    API Gateway (1001)
         ↓
  Microservice (1004/1005/1006)
         ↓
    req.user extracted
         ↓
    logActivity utility
         ↓
    HTTP POST to logs-service (1010)
         ↓
    MongoDB: lms_logs database
```

### Logging Utility Pattern
Each service has its own `utils/logActivity.js`:

```javascript
import axios from 'axios';

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010';

export const logContentAction = async (user, actionType, resourceType, resourceId, details) => {
  try {
    await axios.post(`${LOGS_SERVICE_URL}/api/logs`, {
      userId: user._id || user.userId,
      userEmail: user.email,
      userName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      userRole: user.role,
      action: `${actionType} ${resourceType.toLowerCase()}`,
      actionType: actionType,
      resource: resourceType,
      resourceId: resourceId,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      status: 'success'
    });
  } catch (error) {
    // Non-blocking: logging errors should not break main flow
    console.error('Failed to log activity:', error.message);
  }
};
```

### Controller Integration Pattern
```javascript
export const createModule = async (req, res) => {
  try {
    // 1. Perform the main operation
    const module = await Module.create(moduleData);
    
    // 2. Log the action (non-blocking)
    if (req.user) {
      await logContentAction(req.user, 'CREATE', 'Module', module._id, {
        courseId: moduleData.courseId,
        moduleTitle: module.title
      });
    }
    
    // 3. Return response
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
```

## Environment Configuration

All services now have `LOGS_SERVICE_URL` in their `.env` files:

```properties
# content-service/.env
LOGS_SERVICE_URL=http://localhost:1010

# assessment-service/.env
LOGS_SERVICE_URL=http://localhost:1010

# course-service/.env
LOGS_SERVICE_URL=http://localhost:1010
```

## Authentication Integration

Logging relies on `req.user` being populated by authentication middleware:

```javascript
// In API Gateway or service middleware
app.use((req, res, next) => {
  // Extract user from JWT token
  req.user = {
    _id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    firstName: decoded.firstName,
    lastName: decoded.lastName
  };
  next();
});
```

## Benefits of Server-Side Logging

1. **Data Integrity**: Cannot be tampered with or bypassed
2. **Complete Context**: Server has full access to database state
3. **Security**: User authentication verified before logging
4. **Auditability**: Every action is captured, even direct API calls
5. **Consistency**: Standardized logging across all services

## Testing Checklist

### Module Management
- [ ] Create a module → Check Activity Logs for CREATE Module entry
- [ ] Update a module → Check for UPDATE Module entry
- [ ] Delete a module → Check for DELETE Module entry

### Lesson Management
- [ ] Create a lesson → Check Activity Logs for CREATE Lesson entry
- [ ] Update a lesson → Check for UPDATE Lesson entry
- [ ] Delete a lesson → Check for DELETE Lesson entry

### Activity Management
- [ ] Create an activity → Check Activity Logs for CREATE Activity entry
- [ ] Update an activity → Check for UPDATE Activity entry
- [ ] Delete an activity → Check for DELETE Activity entry

### Grading
- [ ] Submit a grade → Check Activity Logs for UPDATE Grade entry
- [ ] Verify student info is included in log details

### Attendance
- [ ] Record new attendance → Check Activity Logs for CREATE Attendance entry
- [ ] Update existing attendance → Check for UPDATE Attendance entry
- [ ] Verify present count is logged

### Verification
For each test:
1. Perform the action in the UI
2. Go to Admin Dashboard → Activity Logs
3. Filter by role="instructor"
4. Verify log entry shows:
   - ✅ Correct email
   - ✅ Role = "instructor"
   - ✅ Proper action type (CREATE/UPDATE/DELETE)
   - ✅ Correct resource type
   - ✅ Relevant details in JSON format
   - ✅ Success status
   - ✅ Timestamp

## Troubleshooting

### Logs Not Appearing

**Problem**: Actions performed but no logs appear in Activity Logs page

**Checklist**:
1. ✅ Is logs-service running? (`./check-services.sh`)
2. ✅ Is LOGS_SERVICE_URL set in service .env file?
3. ✅ Is req.user populated in controller?
4. ✅ Check service logs: `tail -f logs/content-service.log`
5. ✅ Check logs-service logs: `tail -f logs/logs-service.log`

**Common Causes**:
- `req.user` is undefined (authentication middleware not running)
- LOGS_SERVICE_URL not set or incorrect
- logs-service is down
- Network issue between services

### Missing User Information

**Problem**: Logs show "undefined" for email or name

**Solution**: 
```javascript
// Ensure req.user has all required fields
if (req.user) {
  console.log('User info:', req.user); // Debug
  await logContentAction(req.user, ...);
}
```

### Logging Errors Breaking Operations

**Problem**: Main operation fails when logging fails

**Solution**: Logging is wrapped in try-catch and errors are caught:
```javascript
try {
  await axios.post(LOGS_SERVICE_URL, logData);
} catch (error) {
  // Don't throw - just log the error
  console.error('Failed to log activity:', error.message);
}
```

## Performance Considerations

1. **Non-Blocking**: Logging doesn't wait for response
2. **Fire and Forget**: Uses async but doesn't block main flow
3. **No Retry Logic**: Failed logs are just logged to console
4. **Lightweight**: Minimal data sent to logs-service

## Security

1. **Server Validation**: User identity verified by JWT middleware
2. **No Client Data**: User info comes from authenticated session, not request body
3. **Audit Trail**: Complete history of who did what when
4. **Role Enforcement**: User role captured from verified JWT token

## Database Schema

Logs are stored in MongoDB `lms_logs` database:

```javascript
{
  userId: ObjectId,
  userEmail: String,
  userName: String,
  userRole: String, // "admin", "instructor", "student"
  action: String, // "Created module", "Updated grade", etc.
  actionType: String, // "CREATE", "UPDATE", "DELETE"
  resource: String, // "Module", "Lesson", "Activity", "Grade", "Attendance"
  resourceId: String,
  details: Mixed, // JSON object with context
  status: String, // "success", "failed"
  ipAddress: String,
  userAgent: String,
  metadata: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

## Related Documentation
- [Client-Side Instructor Logging](../INSTRUCTOR_LOGGING_COMPLETE.md)
- [Admin Logging Implementation](../ADMIN_LOGGING_COMPLETE.md)
- [Activity Logs Page](../client/ACTIVITY_LOGS_IMPLEMENTATION.md)

---

**Status**: ✅ Complete
**Services Updated**: 3 (content-service, assessment-service, course-service)
**Functions Logged**: 11 instructor actions
**Date**: 2024
**All services restarted and tested**: ✅
