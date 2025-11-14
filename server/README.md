# LMS Backend Microservices

A comprehensive Learning Management System (LMS) backend built with microservices architecture using Node.js, Express, and MongoDB.

## 💻 Platform Support

✅ **Linux/Mac** - Use `.sh` scripts  
✅ **Windows** - Use `.bat` or `.ps1` scripts (See [WINDOWS_SETUP.md](WINDOWS_SETUP.md))

## 🏗️ Architecture

This project follows a microservices architecture with the following services:

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 1001 | Main entry point, routes requests to microservices |
| **Auth Service** | 1002 | Authentication, authorization, JWT management |
| **User Service** | 1003 | User management (Admin, Instructor, Student) |
| **Course Service** | 1004 | Course, section, and enrollment management |
| **Content Service** | 1005 | Learning materials, modules, lessons, announcements |
| **Assessment Service** | 1006 | Activities, submissions, and grading |
| **Report Service** | 1007 | Reports, analytics, and attendance |

## 📋 Features

### Admin Features
- Login/Logout
- Dashboard with system overview
- Manage accounts (Create, Update, Delete instructors and students)
- Manage courses and enrollments
- Post announcements
- Monitor reports (course, instructor, student reports)
- System maintenance

### Instructor Features
- Login/Logout
- Dashboard with courses overview
- Profile management
- Manage courses and sections
- Add modules and lessons
- Create activities and manage submissions
- Grade student work
- Manage attendance
- View student reports

### Student Features
- Login/Logout
- Dashboard with announcements and enrolled courses
- Profile management
- View courses, sections, and schedules
- Access learning materials
- Submit assignments
- View grades and progress
- Check attendance

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
```

2. **Install dependencies for each service**

```bash
# API Gateway
cd api-gateway && npm install && cd ..

# Auth Service
cd auth-service && npm install && cd ..

# User Service
cd user-service && npm install && cd ..

# Course Service
cd course-service && npm install && cd ..

# Content Service
cd content-service && npm install && cd ..

# Assessment Service
cd assessment-service && npm install && cd ..

# Report Service
cd report-service && npm install && cd ..
```

3. **Set up environment variables**

Copy `.env.example` to `.env` in each service directory and configure:

```bash
# For each service
cd api-gateway && cp .env.example .env && cd ..
cd auth-service && cp .env.example .env && cd ..
cd user-service && cp .env.example .env && cd ..
cd course-service && cp .env.example .env && cd ..
cd content-service && cp .env.example .env && cd ..
cd assessment-service && cp .env.example .env && cd ..
cd report-service && cp .env.example .env && cd ..
```

4. **Start MongoDB**

Make sure MongoDB is running on your system:

```bash
# For Linux
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Start all services**

Open separate terminal windows for each service:

```bash
# Terminal 1 - API Gateway
cd api-gateway && npm run dev

# Terminal 2 - Auth Service
cd auth-service && npm run dev

# Terminal 3 - User Service
cd user-service && npm run dev

# Terminal 4 - Course Service
cd course-service && npm run dev

# Terminal 5 - Content Service
cd content-service && npm run dev

# Terminal 6 - Assessment Service
cd assessment-service && npm run dev

# Terminal 7 - Report Service
cd report-service && npm run dev
```

## 📡 API Endpoints

All requests go through the **API Gateway** at `http://localhost:1001`

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/admins` - Get all admins
- `POST /api/users/admins` - Create admin
- `GET /api/users/instructors` - Get all instructors
- `POST /api/users/instructors` - Create instructor
- `GET /api/users/students` - Get all students
- `POST /api/users/students` - Create student
- `GET /api/users/profile/:id` - Get profile
- `PUT /api/users/profile/:id` - Update profile

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id/sections` - Get course sections
- `POST /api/courses/enrollments` - Enroll student
- `GET /api/courses/student/:studentId/enrollments` - Get student enrollments

### Content
- `GET /api/content/announcements` - Get announcements
- `POST /api/content/announcements` - Create announcement
- `GET /api/content/courses/:courseId/modules` - Get course modules
- `POST /api/content/courses/:courseId/modules` - Create module
- `GET /api/content/modules/:moduleId/lessons` - Get module lessons
- `POST /api/content/modules/:moduleId/lessons` - Create lesson

### Assessments
- `GET /api/assessments/courses/:courseId/activities` - Get course activities
- `POST /api/assessments/courses/:courseId/activities` - Create activity
- `POST /api/assessments/activities/:activityId/submissions` - Submit activity
- `POST /api/assessments/submissions/:submissionId/grade` - Grade submission
- `GET /api/assessments/student/:studentId/grades` - Get student grades

### Reports
- `GET /api/reports/students/:studentId/progress` - Get student progress
- `GET /api/reports/students/:studentId/grades` - Get student grades
- `GET /api/reports/students/:studentId/attendance` - Get student attendance
- `GET /api/reports/instructors/:instructorId/performance` - Get instructor performance
- `GET /api/reports/courses/:courseId/statistics` - Get course statistics
- `POST /api/reports/courses/:courseId/attendance` - Record attendance
- `GET /api/reports/dashboard/overview` - Get admin dashboard overview

## 🗄️ Database Structure

Each service has its own MongoDB database:

- `lms_auth` - Authentication data
- `lms_users` - User profiles
- `lms_courses` - Courses and enrollments
- `lms_content` - Learning materials
- `lms_assessments` - Activities and submissions
- `lms_reports` - Attendance records

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (Admin, Instructor, Student)
- Password hashing with bcrypt
- Rate limiting on API Gateway
- CORS configuration
- Helmet.js security headers

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, cors
- **Validation**: express-validator
- **HTTP Client**: axios (for inter-service communication)
- **Email**: nodemailer (for password reset)

## 📝 Environment Variables

Key environment variables for each service:

```env
PORT=<service_port>
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/<database_name>
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Additional for Auth Service:
```env
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d
```

## 🧪 Testing

Health check endpoints are available for all services:

```bash
# API Gateway
curl http://localhost:1001/health

# Auth Service
curl http://localhost:1002/health

# User Service
curl http://localhost:1003/health

# Course Service
curl http://localhost:1004/health

# Content Service
curl http://localhost:1005/health

# Assessment Service
curl http://localhost:1006/health

# Report Service
curl http://localhost:1007/health
```

## 📚 Development

### Running in Development Mode

All services support hot-reload with nodemon:

```bash
npm run dev
```

### Running in Production Mode

```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, please contact the development team or open an issue in the repository.

---

**Note**: Make sure MongoDB is running and all environment variables are properly configured before starting the services.
