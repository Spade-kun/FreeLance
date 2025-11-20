# Activity Logs - Quick Setup Guide

## Prerequisites
- MongoDB running on localhost:27017
- Node.js installed

## Setup Steps

### 1. Install Dependencies for Logs Service
```bash
cd server/logs-service
npm install
```

### 2. Configure Environment Variables

Create or update `server/logs-service/.env`:
```bash
PORT=1010
MONGODB_URI=mongodb://localhost:27017/lms_logs
NODE_ENV=development
```

### 3. Add Logs Service URL to Other Services

Add to `server/auth-service/.env`:
```bash
LOGS_SERVICE_URL=http://localhost:1010
```

Add to `server/payment-service/.env`:
```bash
LOGS_SERVICE_URL=http://localhost:1010
```

Add to `server/api-gateway/.env`:
```bash
LOGS_SERVICE_URL=http://localhost:1010
```

### 4. Start Services

#### Terminal 1: Start Logs Service
```bash
cd server/logs-service
npm start
```

#### Terminal 2: Start API Gateway
```bash
cd server/api-gateway
npm start
```

#### Terminal 3: Start Auth Service
```bash
cd server/auth-service
npm start
```

#### Terminal 4: Start Payment Service (Optional)
```bash
cd server/payment-service
npm start
```

#### Terminal 5: Start Client
```bash
cd client
npm run dev
```

### 5. Verify Setup

1. **Check Logs Service Health**:
   ```bash
   curl http://localhost:1010/health
   ```
   Should return: `{"status":"OK","service":"Logs Service","timestamp":"..."}`

2. **Check API Gateway Logs Route**:
   ```bash
   curl http://localhost:1001/api/logs/health
   ```

3. **Login to Application**:
   - Open browser: http://localhost:5173
   - Login as admin/instructor/student
   - Navigate to Admin > Activity Logs
   - You should see your login entry!

## Testing the Activity Logs

### Test 1: Login Tracking
1. Login as admin
2. Go to Admin Dashboard > Activity Logs
3. You should see a "User logged in" entry with:
   - ✅ Your email
   - ✅ Your role (admin)
   - ✅ Action type: LOGIN
   - ✅ Status: success
   - ✅ Timestamp

### Test 2: Failed Login Tracking
1. Logout
2. Try to login with wrong password
3. Login as admin again
4. Check Activity Logs
5. You should see a "Login attempt failed" entry with:
   - ✅ Action type: LOGIN_FAILED
   - ✅ Status: failed

### Test 3: Logout Tracking
1. Logout from admin dashboard
2. Login as admin again
3. Check Activity Logs
4. You should see a "User logged out" entry with:
   - ✅ Action type: LOGOUT
   - ✅ Status: success

### Test 4: Payment Tracking (if payment system is set up)
1. Login as student
2. Make a payment for a course
3. Login as admin
4. Check Activity Logs
5. You should see a payment entry

### Test 5: Filtering
1. Go to Activity Logs page
2. Try filtering by:
   - **User Role**: Select "admin" - should show only admin activities
   - **Action Type**: Select "LOGIN" - should show only login events
   - **Status**: Select "success" - should show only successful actions
   - **Date Range**: Set dates - should show logs within range

## Troubleshooting

### Issue: No logs appearing
**Solution**:
1. Check if logs-service is running: `curl http://localhost:1010/health`
2. Check MongoDB connection
3. Check browser console for errors
4. Check server logs for errors

### Issue: "Failed to load activity logs"
**Solution**:
1. Verify API Gateway is routing to logs-service
2. Check `LOGS_SERVICE_URL` in API Gateway `.env`
3. Restart API Gateway after environment changes

### Issue: Login not being logged
**Solution**:
1. Check auth-service has `LOGS_SERVICE_URL` configured
2. Restart auth-service
3. Check auth-service console for logging errors (should be silent if working)

### Issue: Axios errors in services
**Solution**:
```bash
# Auth service
cd server/auth-service
npm install axios

# Payment service
cd server/payment-service
npm install axios

# Logs service
cd server/logs-service
npm install axios
```

## Database Verification

### Check if logs are being stored:
```bash
# Connect to MongoDB
mongosh

# Switch to logs database
use lms_logs

# Count logs
db.logs.countDocuments()

# View recent logs
db.logs.find().sort({createdAt: -1}).limit(10).pretty()

# View logs by action type
db.logs.find({actionType: "LOGIN"}).pretty()

# View logs by user role
db.logs.find({userRole: "admin"}).pretty()
```

## API Testing with curl

### Get all logs:
```bash
curl http://localhost:1001/api/logs
```

### Get logs with filters:
```bash
curl "http://localhost:1001/api/logs?userRole=admin&actionType=LOGIN&page=1&limit=10"
```

### Get log statistics:
```bash
curl http://localhost:1001/api/logs/stats
```

### Create a test log (for testing):
```bash
curl -X POST http://localhost:1001/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "userEmail": "test@example.com",
    "userName": "Test User",
    "userRole": "admin",
    "action": "Test action",
    "actionType": "OTHER",
    "resource": "test",
    "status": "success"
  }'
```

## Performance Tips

### For Large Log Collections:
1. **Implement log rotation**: Delete old logs periodically
2. **Add pagination**: Already implemented (50 per page)
3. **Add indexes**: Already implemented in model
4. **Archive old logs**: Move to separate archive database

### Example: Delete logs older than 90 days
```javascript
// In MongoDB shell
use lms_logs
db.logs.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})
```

## Next Steps

1. ✅ System is now tracking all login/logout events
2. ✅ System is tracking payment events
3. 📝 Add logging for course/module operations (future enhancement)
4. 📝 Add logging for user management operations (future enhancement)
5. 📝 Implement log export feature (future enhancement)
6. 📝 Add real-time log viewing (future enhancement)

## Support

If you encounter any issues:
1. Check all services are running
2. Verify MongoDB is accessible
3. Check environment variables are set correctly
4. Review server console logs for errors
5. Check browser console for frontend errors

## Summary

The Activity Logs system is now ready to use! Admin users can:
- 📊 View all user activities
- 🔍 Filter by role, action, resource, status, and date
- 📋 See detailed information about each activity
- 🔄 Refresh data in real-time
- 📄 Navigate through paginated results

The system automatically logs:
- ✅ User logins (success and failed attempts)
- ✅ User logouts
- ✅ Payment transactions
- ✅ (Future) Course/module/content operations
- ✅ (Future) User management operations
