# 🎨 LMS Frontend - React Client

React frontend application for the Learning Management System using Vite.

## 🔌 API Integration

### API Service (`src/services/api.js`)

The frontend connects to the backend microservices through the **API Gateway** at `http://localhost:1001/api`.

All API calls are centralized in the `api.js` service which provides methods for:
- Authentication (login, logout, register)
- User management (admins, instructors, students)
- Courses (courses, sections, enrollments)
- Content (announcements, modules, lessons)
- Assessments (activities, submissions, grading)
- Reports (progress, grades, attendance, statistics)

### Environment Configuration

Create a `.env` file in the client root directory:

```env
VITE_API_URL=http://localhost:1001/api
```

For production, update to your deployed API URL:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env if needed (default is http://localhost:1001/api)
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on http://localhost:5173

### 4. Make sure Backend is Running

```bash
cd ../server
./start-all.sh  # Linux/Mac
.\start-all.ps1 # Windows PowerShell
```

## 📖 Using the API Service

### Basic Usage

```jsx
import api from './services/api';

// Login
const handleLogin = async () => {
  try {
    const response = await api.login('admin@lms.com', 'Admin@123');
    console.log('Logged in:', response.data.user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Get all courses
const fetchCourses = async () => {
  try {
    const response = await api.getCourses();
    console.log('Courses:', response.data);
  } catch (error) {
    console.error('Failed to fetch courses:', error.message);
  }
};

// Create a student
const createStudent = async () => {
  try {
    const studentData = {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan@student.lms.com',
      phone: '09123456789',
      studentId: '2024-00001'
    };
    const response = await api.createStudent(studentData);
    console.log('Student created:', response.data);
  } catch (error) {
    console.error('Failed to create student:', error.message);
  }
};
```

### Using Custom Hooks

```jsx
import { useAPI, useAPIMutation } from './hooks/useAPI';
import api from './services/api';

function CoursesPage() {
  // Fetch data with loading and error states
  const { data: courses, loading, error, refetch } = useAPI(() => api.getCourses(), []);

  // For mutations (POST, PUT, DELETE)
  const { mutate, loading: saving } = useAPIMutation();

  const handleCreateCourse = async (courseData) => {
    await mutate(
      () => api.createCourse(courseData),
      (response) => {
        alert('Course created successfully!');
        refetch(); // Refresh course list
      },
      (error) => {
        alert('Failed to create course: ' + error.message);
      }
    );
  };

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Courses</h1>
      {courses?.map(course => (
        <div key={course._id}>{course.courseName}</div>
      ))}
    </div>
  );
}
```

### Authentication Context

```jsx
import { useAuth } from './context/AuthContext';

function App() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

## 📚 API Methods Reference

### Authentication
- `api.login(email, password)`
- `api.register(email, password, role, userId)`
- `api.logout()`
- `api.changePassword(currentPassword, newPassword)`

### Users - Admins
- `api.getAdmins()`
- `api.getAdminById(id)`
- `api.createAdmin(data)`
- `api.updateAdmin(id, data)`
- `api.deleteAdmin(id)`

### Users - Instructors
- `api.getInstructors()`
- `api.getInstructorById(id)`
- `api.createInstructor(data)`
- `api.updateInstructor(id, data)`
- `api.deleteInstructor(id)`

### Users - Students
- `api.getStudents()`
- `api.getStudentById(id)`
- `api.createStudent(data)`
- `api.updateStudent(id, data)`
- `api.deleteStudent(id)`

### Courses
- `api.getCourses()`
- `api.getCourseById(id)`
- `api.createCourse(data)`
- `api.updateCourse(id, data)`
- `api.deleteCourse(id)`

### Sections
- `api.getCourseSections(courseId)`
- `api.createSection(courseId, data)`
- `api.updateSection(courseId, sectionId, data)`
- `api.deleteSection(courseId, sectionId)`

### Enrollments
- `api.getEnrollments()`
- `api.getStudentEnrollments(studentId)`
- `api.enrollStudent(data)`
- `api.updateEnrollment(id, data)`
- `api.deleteEnrollment(id)`

### Content - Announcements
- `api.getAnnouncements(filters)`
- `api.createAnnouncement(data)`
- `api.updateAnnouncement(id, data)`
- `api.deleteAnnouncement(id)`

### Content - Modules & Lessons
- `api.getCourseModules(courseId)`
- `api.createModule(data)`
- `api.getModuleLessons(moduleId)`
- `api.createLesson(data)`

### Assessments
- `api.getCourseActivities(courseId)`
- `api.createActivity(data)`
- `api.getActivitySubmissions(activityId)`
- `api.createSubmission(data)`
- `api.gradeSubmission(id, data)`

### Reports
- `api.getStudentProgress(studentId)`
- `api.getStudentGrades(studentId, courseId)`
- `api.getInstructorPerformance(instructorId)`
- `api.getCourseStatistics(courseId)`
- `api.getDashboardOverview()`
- `api.recordAttendance(data)`

## 🧪 Testing the Connection

### Test Login

1. Make sure backend is running (`http://localhost:1001`)
2. Open browser console (F12)
3. In the login page, enter:
   - **Email**: `admin@lms.com`
   - **Password**: `Admin@123`
4. Check console for API responses

### Test API Calls in Console

```javascript
// In browser console
import('http://localhost:5173/src/services/api.js').then(({ default: api }) => {
  // Login
  api.login('admin@lms.com', 'Admin@123').then(console.log);
  
  // Get courses
  api.getCourses().then(console.log);
  
  // Get students
  api.getStudents().then(console.log);
});
```

## 🔐 Default Test Credentials

After running the backend test script, use these credentials:

- **Admin**
  - Email: `admin@lms.com`
  - Password: `Admin@123`

- **Student**
  - Email: `juan.delacruz@student.lms.com`
  - Password: `Student@123`

- **Instructor** (if created)
  - Email: `maria.santos@lms.com`
  - Password: `Instructor@123`

## 🛠️ Development

### File Structure

```
client/
├── src/
│   ├── services/
│   │   └── api.js           # API service (all backend calls)
│   ├── hooks/
│   │   └── useAPI.js        # Custom hooks for API calls
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── components/
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── instructor/      # Instructor dashboard pages
│   │   ├── student/         # Student dashboard pages
│   │   └── LoginSignup/     # Login/Signup page
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
└── package.json
```

## 🚨 Troubleshooting

### CORS Errors

If you see CORS errors in the browser console, make sure:
1. Backend is running on port 1001
2. `.env` file has correct API URL
3. Backend `.env` files have `ALLOWED_ORIGINS=http://localhost:5173`

### Network Errors

- Check if backend services are running: `./check-services.sh`
- Verify API URL in `.env` file
- Check browser console for error messages
- Test API directly: `curl http://localhost:1001/health`

### Authentication Issues

- Make sure you created users in the backend first
- Use exact email addresses (case-sensitive)
- Check that JWT tokens are being stored in localStorage
- Clear localStorage and try again: `localStorage.clear()`

## 📦 Build for Production

```bash
npm run build
```

Built files will be in `dist/` directory.

### Update API URL for Production

Before building, update `.env`:
```env
VITE_API_URL=https://your-production-api.com/api
```

## 🔗 Related Documentation

- Backend API Documentation: `../server/API_DOCUMENTATION.md`
- Backend Setup: `../server/README.md`
- Testing Guide: `../server/TESTING.md`

## 📝 Next Steps

1. ✅ Backend services running
2. ✅ Frontend configured with API service
3. 🔄 Update dashboard pages to use real API
4. 🔄 Implement proper loading states
5. 🔄 Add error handling and notifications
6. 🔄 Add form validation
7. 🔄 Implement file uploads for assignments
8. 🔄 Add real-time notifications
