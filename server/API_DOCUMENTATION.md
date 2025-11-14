# API Design Documentation

## Service Communication

The microservices communicate through:
1. **Synchronous**: HTTP REST calls via API Gateway
2. **Authentication**: JWT tokens passed in Authorization header

## Request Flow

```
Client -> API Gateway (1001) -> Microservice (1002-1007) -> Database
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Authentication Flow

1. User sends login credentials to `/api/auth/login`
2. Auth service validates credentials and returns:
   - Access Token (JWT, expires in 7 days)
   - Refresh Token (expires in 30 days)
3. Client includes Access Token in subsequent requests:
   ```
   Authorization: Bearer <access_token>
   ```
4. When Access Token expires, use Refresh Token to get new Access Token

## Data Models

### User (Auth Service)
```javascript
{
  email: String,
  password: String (hashed),
  role: String (admin|instructor|student),
  userId: ObjectId (reference to role-specific user),
  isActive: Boolean,
  lastLogin: Date,
  refreshTokens: Array,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

### Admin/Instructor/Student (User Service)
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  profilePicture: String,
  dateOfBirth: Date,
  address: Object,
  // Role-specific fields
  isActive: Boolean
}
```

### Course (Course Service)
```javascript
{
  courseCode: String,
  courseName: String,
  description: String,
  credits: Number,
  department: String,
  level: String,
  duration: Object,
  prerequisites: [ObjectId],
  thumbnail: String,
  isActive: Boolean
}
```

### Section (Course Service)
```javascript
{
  courseId: ObjectId,
  sectionName: String,
  instructorId: ObjectId,
  capacity: Number,
  enrolled: Number,
  room: String,
  schedule: Array,
  startDate: Date,
  endDate: Date,
  isActive: Boolean
}
```

### Enrollment (Course Service)
```javascript
{
  studentId: ObjectId,
  courseId: ObjectId,
  sectionId: ObjectId,
  enrollmentDate: Date,
  status: String,
  grade: String,
  finalScore: Number
}
```

### Announcement (Content Service)
```javascript
{
  title: String,
  content: String,
  authorId: ObjectId,
  authorRole: String,
  targetAudience: String,
  courseId: ObjectId,
  priority: String,
  attachments: Array,
  isActive: Boolean,
  publishDate: Date,
  expiryDate: Date
}
```

### Module (Content Service)
```javascript
{
  courseId: ObjectId,
  title: String,
  description: String,
  order: Number,
  isPublished: Boolean
}
```

### Lesson (Content Service)
```javascript
{
  moduleId: ObjectId,
  title: String,
  description: String,
  contentType: String,
  content: String,
  videoUrl: String,
  materials: Array,
  order: Number,
  duration: Number,
  isPublished: Boolean
}
```

### Activity (Assessment Service)
```javascript
{
  courseId: ObjectId,
  sectionId: ObjectId,
  instructorId: ObjectId,
  title: String,
  description: String,
  type: String,
  instructions: String,
  totalPoints: Number,
  dueDate: Date,
  availableFrom: Date,
  allowLateSubmission: Boolean,
  latePenalty: Number,
  attachments: Array,
  isPublished: Boolean
}
```

### Submission (Assessment Service)
```javascript
{
  activityId: ObjectId,
  studentId: ObjectId,
  content: String,
  attachments: Array,
  submittedAt: Date,
  isLate: Boolean,
  status: String,
  score: Number,
  feedback: String,
  gradedBy: ObjectId,
  gradedAt: Date
}
```

### Attendance (Report Service)
```javascript
{
  courseId: ObjectId,
  sectionId: ObjectId,
  studentId: ObjectId,
  date: Date,
  status: String (present|absent|late|excused),
  remarks: String,
  recordedBy: ObjectId
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

API Gateway implements rate limiting:
- 100 requests per 15 minutes per IP address
- Returns 429 (Too Many Requests) when exceeded
