# MVCC (Multi-Version Concurrency Control) Implementation

## Overview

This document describes the MVCC implementation in the Assessment Service for handling concurrent submissions with data integrity and high performance.

## What is MVCC?

MVCC (Multi-Version Concurrency Control) is a concurrency control method that allows multiple transactions to access the same data simultaneously without blocking each other. Instead of locking records, MVCC creates multiple versions and detects conflicts at commit time.

## Implementation Details

### Files Modified/Created

1. **Models** (with version fields):
   - `models/Activity.js` - Added `__version`, `totalSubmissions`, `maxAttempts`
   - `models/Submission.js` - Added `__version`, `attemptNumber`

2. **Services** (MVCC logic):
   - `services/mvccService.js` - Core MVCC implementation with retry logic

3. **Controllers** (using MVCC):
   - `controllers/assessmentController.js` - Updated `createSubmission` to use MVCC
   - Added `getMVCCStats` and `resetMVCCStats` endpoints

4. **Routes**:
   - `routes/assessmentRoutes.js` - Added MVCC monitoring routes

5. **Tests**:
   - `test-mvcc.js` - Comprehensive Node.js test suite
   - `test-mvcc.sh` - Shell script for testing

## How It Works

### 1. Version Tracking

Each document has a `__version` field that increments on every update:

```javascript
{
  _id: "activity123",
  title: "Final Exam",
  totalSubmissions: 50,
  __version: 15  // Increments on each update
}
```

### 2. Submission Flow

When a student submits an assessment:

1. **Read** current activity state with version number
2. **Validate** business rules (max attempts, deadline, etc.)
3. **Attempt Update** with version check:
   ```javascript
   findOneAndUpdate(
     { _id: activityId, __version: currentVersion },  // Check version
     { $inc: { __version: 1, totalSubmissions: 1 } }
   )
   ```
4. **Conflict Detection**: If version changed, another submission occurred
5. **Retry Logic**: Automatically retry up to 3 times with backoff
6. **Success/Failure**: Return result to client

### 3. Retry Strategy

- **Max Retries**: 3 attempts
- **Backoff Delays**: 50ms, 100ms, 200ms
- **Exponential backoff** prevents thundering herd problem

## Benefits

### For Students
- ✅ No duplicate submissions
- ✅ Fast response even during deadline rush
- ✅ Fair first-come-first-served processing
- ✅ Accurate attempt tracking

### For Instructors
- ✅ Reliable submission counts
- ✅ Accurate grading data
- ✅ No data loss or corruption

### For System
- ✅ High concurrency support (100+ simultaneous users)
- ✅ No database deadlocks
- ✅ Horizontal scalability
- ✅ Monitoring and metrics

## API Endpoints

### Create Submission (with MVCC)
```
POST /api/assessments/activities/:activityId/submissions
```

**Request Body:**
```json
{
  "studentId": "student123",
  "content": "My submission text",
  "attachments": []
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "submission123",
    "studentId": "student123",
    "activityId": "activity123",
    "attemptNumber": 1,
    "__version": 1
  },
  "mvccInfo": {
    "activityVersion": 16,
    "attemptNumber": 1,
    "totalSubmissions": 51,
    "retriesUsed": 0
  }
}
```

**Conflict Response (after retries):**
```json
{
  "success": false,
  "message": "Unable to submit after multiple attempts. Please try again.",
  "code": "VERSION_CONFLICT"
}
```

**Max Attempts Response:**
```json
{
  "success": false,
  "message": "Maximum attempts (3) reached for this activity",
  "code": "MAX_ATTEMPTS_EXCEEDED"
}
```

### Get MVCC Statistics
```
GET /api/assessments/mvcc/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAttempts": 150,
    "successfulSubmissions": 145,
    "conflicts": 8,
    "retriesSucceeded": 7,
    "retriesFailed": 1,
    "conflictRate": "5.33%",
    "retrySuccessRate": "87.50%"
  }
}
```

### Reset Statistics
```
POST /api/assessments/mvcc/reset-stats
```

## Testing

### Run Node.js Test Suite

```bash
cd server/assessment-service
node test-mvcc.js
```

### Run Shell Script Tests

```bash
cd server/assessment-service
chmod +x test-mvcc.sh
./test-mvcc.sh
```

### Test Scenarios

1. **Sequential Submissions**: No conflicts expected
2. **Concurrent Same Student**: Only first submission succeeds
3. **Max Attempts**: Enforces attempt limits correctly
4. **High Concurrency**: 10+ students submitting simultaneously
5. **Version Conflict**: Automatic retry and recovery

## Monitoring

### Key Metrics

- **Conflict Rate**: Percentage of submissions that encountered conflicts
- **Retry Success Rate**: Percentage of conflicts resolved by retries
- **Total Attempts**: Total submission attempts
- **Failed Submissions**: Submissions that failed after all retries

### Expected Performance

- **Conflict Rate**: < 5% under normal load
- **Retry Success Rate**: > 90%
- **Response Time**: < 1 second even under high load

### Alert Thresholds

- ⚠️ Alert if conflict rate > 10%
- ⚠️ Alert if retry failure rate > 5%
- ⚠️ Alert if response time > 2 seconds

## Configuration

### MVCC Service Settings

In `services/mvccService.js`:

```javascript
this.MAX_RETRIES = 3;           // Maximum retry attempts
this.BACKOFF_DELAYS = [50, 100, 200];  // Delays between retries (ms)
```

### Activity Settings

When creating an activity:

```javascript
{
  maxAttempts: 3,        // How many times a student can submit
  allowLateSubmission: false,
  isPublished: true      // Must be true for submissions
}
```

## Error Handling

### Client-Side

```javascript
try {
  const response = await axios.post('/api/assessments/activities/123/submissions', data);
  console.log('Submission successful:', response.data);
} catch (error) {
  if (error.response?.data.code === 'MAX_ATTEMPTS_EXCEEDED') {
    alert('You have used all your attempts for this activity');
  } else if (error.response?.data.code === 'VERSION_CONFLICT') {
    alert('Unable to submit. Please try again.');
  } else {
    alert('Submission failed: ' + error.response?.data.message);
  }
}
```

### Server-Side

All errors are caught and formatted with appropriate status codes:
- `400`: Business rule violations
- `404`: Resource not found
- `409`: Version conflict (after retries)

## Performance Optimization

### Database Indexes

Indexes created for fast version queries:

```javascript
// Submission model
submissionSchema.index({ activityId: 1, studentId: 1, __version: 1 });

// Activity model (implicit on _id and __version)
```

### Caching Considerations

- Activity data can be cached (rarely changes)
- Submission counts must always be fresh (don't cache)
- Version numbers must never be cached

## Troubleshooting

### High Conflict Rate

**Symptom**: Conflict rate > 10%

**Solutions**:
1. Increase retry delays
2. Add more retry attempts
3. Scale database (read replicas)
4. Optimize indexes

### Failed Retries

**Symptom**: Many submissions fail after retries

**Solutions**:
1. Check database performance
2. Verify network latency
3. Review application logs
4. Consider queue-based submissions for extreme concurrency

### Slow Submissions

**Symptom**: Response time > 2 seconds

**Solutions**:
1. Check database query performance
2. Add database indexes
3. Reduce retry delays
4. Scale horizontally (more service instances)

## Best Practices

### Do's ✅
- Always use the MVCC service for submissions
- Monitor statistics regularly
- Set appropriate `maxAttempts` per activity
- Test with concurrent load before deployment

### Don'ts ❌
- Don't bypass MVCC for submissions
- Don't cache version numbers
- Don't disable retry logic
- Don't ignore conflict statistics

## Future Enhancements

Potential improvements:
1. Adaptive retry delays based on load
2. Queue-based submission processing
3. Real-time conflict monitoring dashboard
4. Automated scaling based on conflict rate
5. Machine learning for conflict prediction

## References

- MongoDB MVCC: https://docs.mongodb.com/manual/core/transactions/
- Concurrency Control: https://en.wikipedia.org/wiki/Concurrency_control
- Optimistic Locking: https://en.wikipedia.org/wiki/Optimistic_concurrency_control

---

**Last Updated**: November 17, 2025
**Version**: 1.0
**Maintained by**: Assessment Service Team
