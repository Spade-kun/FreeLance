# Activity Logs Implementation

## Overview
Implemented a comprehensive Activity Logs system for tracking user activities across the MERN LMS platform. The system captures login/logout events, user actions, and system interactions for Admin, Instructor, and Student roles.

## Features Implemented

### 1. Backend Services

#### Logs Service (Port 1010)
- **Location**: `server/logs-service/`
- **Database Model**: MongoDB schema for storing activity logs
- **Key Features**:
  - Login/Logout tracking with timestamps
  - Action tracking (CREATE, UPDATE, DELETE, VIEW, EXPORT)
  - User role tracking (admin, instructor, student)
  - Resource tracking (authentication, course, module, payment, etc.)
  - Status tracking (success, failed, pending)
  - IP address and user agent logging
  - Metadata storage for additional context

#### Log Model Fields
```javascript
{
  userId: ObjectId,
  userEmail: String,
  userName: String,
  userRole: String (admin/instructor/student),
  action: String,
  actionType: String (LOGIN/LOGOUT/CREATE/UPDATE/DELETE/VIEW/EXPORT/OTHER),
  resource: String,
  resourceId: String,
  details: String,
  ipAddress: String,
  userAgent: String,
  status: String (success/failed/pending),
  metadata: Mixed,
  createdAt: Date (automatic),
  updatedAt: Date (automatic)
}
```

#### Logging Utilities
Created reusable logging utilities in multiple services:
- `server/logs-service/utils/logActivity.js` - Core logging functions
- `server/auth-service/utils/logActivity.js` - Auth-specific logging
- `server/payment-service/utils/logActivity.js` - Payment logging

### 2. API Gateway Integration
- **Route**: `/api/logs`
- **Proxy**: Routes forwarded to logs-service (localhost:1010)
- **Endpoints**:
  - `GET /api/logs` - Get all logs with filters
  - `GET /api/logs/stats` - Get log statistics
  - `GET /api/logs/user/:userId` - Get logs by user
  - `GET /api/logs/action/:actionType` - Get logs by action type
  - `GET /api/logs/:id` - Get single log
  - `POST /api/logs` - Create log entry
  - `DELETE /api/logs/:id` - Delete single log
  - `POST /api/logs/bulk-delete` - Bulk delete logs

### 3. Service Integration

#### Auth Service
Integrated logging for:
- ✅ Successful login (standard & Google OAuth)
- ✅ Failed login attempts
- ✅ User logout
- Captures IP address and user agent

#### Payment Service
Integrated logging for:
- ✅ Payment creation
- ✅ Payment status (success/pending/failed)
- Includes payment details (amount, currency, course info)

### 4. Frontend Admin Dashboard

#### Activity Logs Page
**Location**: `client/src/components/admin/ActivityLogsPage.jsx`

**Features**:
- 📊 Statistics dashboard showing total activities and last 24h activity
- 🔍 Advanced filtering:
  - Filter by user role (admin/instructor/student)
  - Filter by action type (LOGIN, CREATE, UPDATE, DELETE, etc.)
  - Filter by resource (authentication, course, payment, etc.)
  - Filter by status (success/failed/pending)
  - Date range filtering
- 📋 Comprehensive table displaying:
  - Timestamp (formatted)
  - User name and email
  - User role with color-coded badges
  - Action description
  - Action type with color-coded badges
  - Resource type
  - Status with color-coded badges
  - Additional details
- 📄 Pagination support (50 records per page)
- 🔄 Refresh functionality
- 🎨 Clean, professional UI matching admin dashboard style

#### Navigation
- Added "Activity Logs" menu item in admin sidebar
- Route: `/admin/logs`
- Icon: 📋

### 5. API Service Methods
Added to `client/src/services/api.js`:
```javascript
- getLogs(filters) - Get all logs with optional filters
- getLogById(id) - Get single log by ID
- getLogsByUser(userId, filters) - Get logs for specific user
- getLogsByAction(actionType, filters) - Get logs by action type
- getLogStats(filters) - Get log statistics
- deleteLog(id) - Delete single log
- bulkDeleteLogs(data) - Bulk delete logs
- createLog(logData) - Create log entry
```

## Database

### MongoDB Collection: `logs`
The logs-service uses its own MongoDB database connection to store activity logs separately from other services. This ensures:
- Isolated log storage
- Better performance
- Easy log retention management

**Indexes**:
- `userId` (indexed)
- `userEmail` (indexed)
- `userRole` (indexed)
- `actionType` (indexed)
- `resource` (indexed)
- `createdAt` (indexed, descending)
- `status` (indexed)

## Cleanup

### Removed Duplicate Service
- ❌ Deleted `server/log-service/` (incomplete duplicate)
- ✅ Kept `server/logs-service/` (complete implementation)

## Configuration

### Environment Variables
Add to each service's `.env` file:
```bash
LOGS_SERVICE_URL=http://localhost:1010
```

### Logs Service `.env`
```bash
PORT=1010
MONGODB_URI=mongodb://localhost:27017/lms_logs
```

## Usage Examples

### Logging a User Action
```javascript
import { logActivity } from '../utils/logActivity.js';

await logActivity({
  userId: user._id,
  userEmail: user.email,
  userName: user.name,
  userRole: user.role,
  action: 'Created new course',
  actionType: 'CREATE',
  resource: 'course',
  resourceId: course._id,
  details: `Course: ${course.title}`,
  status: 'success',
  metadata: { courseId: course._id }
});
```

### Filtering Logs in Admin UI
Admins can filter logs by:
1. Selecting filters (role, action type, resource, status, date range)
2. Clicking "Apply Filters"
3. Viewing paginated results
4. Resetting filters to view all logs

## Testing

### Manual Testing Steps
1. **Start Services**:
   ```bash
   cd server/logs-service && npm start
   cd server/api-gateway && npm start
   cd server/auth-service && npm start
   cd client && npm run dev
   ```

2. **Test Login Logging**:
   - Login as admin/instructor/student
   - Check Activity Logs page for login entry

3. **Test Failed Login**:
   - Attempt login with wrong password
   - Check for LOGIN_FAILED entry

4. **Test Payment Logging**:
   - Make a payment as student
   - Check for payment CREATE entry

5. **Test Filters**:
   - Filter by role (e.g., only admin)
   - Filter by action type (e.g., only LOGIN)
   - Filter by date range

## Future Enhancements

### Potential Additions
1. ✨ Add logging for course/module/content operations
2. ✨ Add logging for user management operations (create/update/delete users)
3. ✨ Add logging for assessment submissions
4. ✨ Export logs to CSV/PDF
5. ✨ Real-time log viewing with WebSocket
6. ✨ Log retention policy (auto-delete old logs)
7. ✨ Advanced analytics and charts
8. ✨ Email alerts for critical events (failed logins, security events)
9. ✨ Audit trail with before/after data for updates

## Security Considerations

### Access Control
- ✅ Only admins can view activity logs
- ✅ Logs are stored separately from application data
- ✅ IP addresses and user agents are captured for security auditing

### Data Privacy
- ⚠️ Consider GDPR compliance for log retention
- ⚠️ Implement log anonymization if required
- ⚠️ Add log encryption for sensitive data

## Maintenance

### Log Cleanup
To prevent database bloat, consider implementing:
```javascript
// Delete logs older than 90 days
await bulkDeleteLogs({ 
  olderThan: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
});
```

### Monitoring
- Monitor logs-service health endpoint: `http://localhost:1010/health`
- Check log collection size regularly
- Set up alerts for service failures

## API Endpoints Reference

### Get All Logs
```
GET /api/logs?userRole=admin&actionType=LOGIN&page=1&limit=50
```

### Get Log Statistics
```
GET /api/logs/stats?startDate=2025-01-01&endDate=2025-12-31
```

### Get User Logs
```
GET /api/logs/user/:userId?page=1&limit=50
```

### Create Log
```
POST /api/logs
Content-Type: application/json

{
  "userId": "123",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "userRole": "admin",
  "action": "Logged in",
  "actionType": "LOGIN",
  "resource": "authentication",
  "status": "success"
}
```

## Summary

The Activity Logs system is now fully functional and integrated into the MERN LMS platform. It provides comprehensive tracking of user activities with a professional admin interface for monitoring and analysis. The system is designed to be:

- **Scalable**: Separate microservice architecture
- **Flexible**: Supports various action types and resources
- **Secure**: Access-controlled and audit-ready
- **User-friendly**: Intuitive filtering and viewing interface
- **Maintainable**: Clean code structure with reusable utilities

All admin, instructor, and student login/logout activities are now being tracked with timestamps, and the admin can view and filter these logs through the Activity Logs page in the admin dashboard.
