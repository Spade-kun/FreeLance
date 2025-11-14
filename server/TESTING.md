# 🧪 API Testing Guide

## Quick Start

### Option 1: Using Thunder Client (VS Code Extension)

1. **Install Thunder Client** extension in VS Code
2. Open Thunder Client panel (lightning icon in sidebar)
3. Import collection: `thunder-tests/thunder-collection_LMS_API.json`
4. Start testing!

### Option 2: Using the Test Script

```bash
./test-api.sh
```

This will automatically create sample data.

### Option 3: Using curl

#### 1. Create Admin
```bash
curl -X POST http://localhost:1001/api/users/admins \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Admin",
    "email": "admin@lms.com",
    "phone": "09123456789",
    "permissions": ["manage_users", "manage_courses", "view_reports"]
  }'
```

**Response:** Admin created with default password `Admin@123`

#### 2. Create Instructor
```bash
curl -X POST http://localhost:1001/api/users/instructors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "maria@lms.com",
    "phone": "09234567890",
    "specialization": "Computer Science",
    "qualifications": [
      {
        "degree": "PhD",
        "field": "Computer Science",
        "institution": "University of the Philippines",
        "year": 2020
      }
    ],
    "bio": "Experienced educator"
  }'
```

**Response:** Instructor created with default password `Instructor@123`

#### 3. Create Student
```bash
curl -X POST http://localhost:1001/api/users/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan@student.lms.com",
    "phone": "09345678901",
    "studentId": "2024-00001",
    "guardianName": "Pedro Dela Cruz",
    "guardianContact": "09456789012"
  }'
```

**Response:** Student created with default password `Student@123`

#### 4. Login
```bash
curl -X POST http://localhost:1001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.com",
    "password": "Admin@123"
  }'
```

**Response:** Returns JWT access token and refresh token

#### 5. Create Course
```bash
curl -X POST http://localhost:1001/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CS101",
    "courseName": "Introduction to Programming",
    "description": "Learn programming fundamentals",
    "credits": 3,
    "level": "beginner",
    "prerequisites": []
  }'
```

#### 6. Get All Courses
```bash
curl http://localhost:1001/api/courses
```

#### 7. Create Announcement
```bash
curl -X POST http://localhost:1001/api/content/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to LMS!",
    "content": "Check your courses and schedules.",
    "authorId": "YOUR_ADMIN_ID_HERE",
    "authorRole": "admin",
    "targetAudience": "all",
    "priority": "high"
  }'
```

## 📊 Check Your Data

After creating data, check your MongoDB Atlas:
- Database: `lms_mern`
- Collections: `admins`, `instructors`, `students`, `users`, `courses`, `announcements`, etc.

## 🔐 Default Passwords

- **Admin**: `Admin@123`
- **Instructor**: `Instructor@123`
- **Student**: `Student@123`

## 📝 Valid Values

### Course Levels
- `beginner`
- `intermediate`
- `advanced`

### Announcement Priority
- `low`
- `medium`
- `high`
- `urgent`

### Announcement Target Audience
- `all`
- `students`
- `instructors`
- `admins`

### Activity Types
- `assignment`
- `quiz`
- `exam`
- `project`

## 🌐 Service URLs

- API Gateway: http://localhost:1001/api
- Auth Service: http://localhost:1002
- User Service: http://localhost:1003
- Course Service: http://localhost:1004
- Content Service: http://localhost:1005
- Assessment Service: http://localhost:1006
- Report Service: http://localhost:1007

## 📚 Full API Documentation

See `API_DOCUMENTATION.md` for complete API reference.
