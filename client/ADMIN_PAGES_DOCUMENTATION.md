# Admin Pages - Complete CRUD Implementation

## Overview
All Admin pages have been refactored to use microservices architecture for full CRUD operations. The implementation connects the client-side React components with the backend microservices through the API Gateway.

## Architecture

```
Client (React) → API Service → API Gateway (Port 1001) → Microservices (Ports 1002-1007)
```

### Microservices Used:
1. **User Service (Port 1004)** - Manages students, instructors, and admins
2. **Course Service (Port 1003)** - Handles courses, sections, and enrollments
3. **Content Service (Port 1005)** - Manages announcements, modules, and lessons
4. **Report Service (Port 1007)** - Handles attendance and reporting
5. **Auth Service (Port 1002)** - Authentication and authorization

## Admin Pages Implementation

### 1. AdminDashboard.jsx
**Purpose**: Display real-time statistics from all microservices

**Features**:
- Total students, instructors, courses, enrollments
- Active announcements count
- Colorful statistics cards
- Auto-refresh capability
- Error handling with retry option

**API Calls**:
```javascript
api.getStudents()
api.getInstructors()
api.getCourses()
api.getEnrollments()
api.getAnnouncements({ isActive: true })
```

**State Management**:
- `stats` - Dashboard statistics
- `loading` - Loading state
- `error` - Error messages

---

### 2. AccountsPage.jsx
**Purpose**: Complete user management (CRUD for students, instructors, admins)

**Features**:
- Create new users with role selection
- Update existing user information
- Delete users with confirmation
- Filter by role (tabs for all, students, instructors, admins)
- Status indicators (active/inactive)
- Form validation

**API Calls**:
```javascript
// Fetch
api.getStudents()
api.getInstructors()
api.getAdmins()

// Create
api.createStudent(userData)
api.createInstructor(userData)
api.createAdmin(userData)

// Update
api.updateStudent(id, userData)
api.updateInstructor(id, userData)
api.updateAdmin(id, userData)

// Delete
api.deleteStudent(id)
api.deleteInstructor(id)
api.deleteAdmin(id)
```

**Form Fields**:
- First Name (required)
- Last Name (required)
- Email (required)
- Phone Number (optional)
- Password (required for new users)
- Role (student/instructor/admin)

**State Management**:
- `users` - Combined list of all users
- `editingUser` - Current user being edited
- `activeTab` - Current filter tab
- Form states for each field

---

### 3. CoursesPage.jsx
**Purpose**: Manage courses, sections, and student enrollments

**Features**:
- **Courses Management**:
  - Create/update/delete courses
  - Course code, name, description, credits, department
  - View all courses with their sections
  
- **Sections Management**:
  - Add sections to courses
  - Assign instructors to sections
  - Set capacity and room information
  - Track enrolled count
  - Delete sections
  
- **Enrollments Management**:
  - Enroll students in courses
  - Select specific sections
  - View all enrollments in table format
  - Remove enrollments
  - Track enrollment status and dates

**API Calls**:
```javascript
// Courses
api.getCourses()
api.createCourse(courseData)
api.updateCourse(id, courseData)
api.deleteCourse(id)

// Sections
api.getCourseSections(courseId)
api.createSection(courseId, sectionData)
api.deleteSection(courseId, sectionId)

// Enrollments
api.getEnrollments()
api.enrollStudent(enrollmentData)
api.deleteEnrollment(id)
```

**Views**:
1. **Courses View** - List of all courses with nested sections
2. **Enrollments View** - Table of all student enrollments

**Modal Forms**:
- Section creation modal
- Enrollment form (can be toggled)

---

### 4. ContentsPage.jsx
**Purpose**: Manage course content (announcements, modules, lessons)

**Features**:
- **Announcements**:
  - Create/update/delete announcements
  - Set priority levels (low, normal, high, urgent)
  - Target specific audiences (all, students, instructors)
  - Attach to specific courses or all courses
  
- **Modules**:
  - Create/update/delete course modules
  - Set module order
  - Add descriptions
  - Organize by course
  
- **Lessons**:
  - Add lessons to modules
  - Support multiple content types (text, video, document, quiz)
  - Set lesson order
  - Add descriptions and content

**API Calls**:
```javascript
// Announcements
api.getAnnouncements()
api.createAnnouncement(data)
api.updateAnnouncement(id, data)
api.deleteAnnouncement(id)

// Modules
api.getCourseModules(courseId)
api.createModule(data)
api.updateModule(id, data)
api.deleteModule(id)

// Lessons
api.getModuleLessons(moduleId)
api.createLesson(data)
api.deleteLesson(id)
```

**Tabs**:
1. **Announcements Tab** - System-wide and course-specific announcements
2. **Modules Tab** - Course modules with nested lessons

**Modal Forms**:
- Lesson creation modal for adding lessons to modules

---

### 5. ReportsPage.jsx
**Purpose**: Generate reports and manage attendance

**Features**:
- **Enrollment Reports**:
  - View all enrollments in table format
  - Filter by status (enrolled, completed, dropped)
  - Export to CSV
  - Statistics cards showing totals
  
- **Attendance Tracking**:
  - Record attendance for students
  - Select course, section, and student
  - Set attendance status (present, absent, late, excused)
  - Add remarks
  - Export attendance records

**API Calls**:
```javascript
// Enrollments
api.getEnrollments()
api.getStudents()
api.getCourses()

// Attendance
api.recordAttendance(data)
api.getCourseAttendance(courseId, sectionId)
api.getStudentAttendance(studentId, courseId)
```

**Export Features**:
- CSV export for enrollments
- CSV export for attendance records
- Formatted with headers and proper data structure

**Statistics Cards**:
- Total enrollments
- Active enrollments
- Completed enrollments
- Dropped enrollments

---

### 6. PaymentsPage.jsx
**Purpose**: Process payments (placeholder implementation)

**Note**: This page currently has a mock implementation. It needs to be integrated with a payment gateway service in the future.

**Planned Features**:
- Payment processing
- Transaction history
- Receipt generation
- Payment status tracking

---

## Custom Hooks

### useAdmin.js
A collection of custom hooks for managing admin operations with proper loading and error handling.

#### Available Hooks:

1. **useAdmin()**
   - Base hook providing loading, error states, and operation execution
   - Used by other specialized hooks

2. **useUserManagement()**
   - Manages all user CRUD operations
   - Combines students, instructors, and admins
   - Methods: `fetchAllUsers`, `createUser`, `updateUser`, `deleteUser`

3. **useCourseManagement()**
   - Handles courses, sections, and enrollments
   - Methods: `fetchAllCourses`, `createCourse`, `updateCourse`, `deleteCourse`, `createSection`, `deleteSection`, `enrollStudent`, `deleteEnrollment`

4. **useContentManagement()**
   - Manages announcements, modules, and lessons
   - Methods: `fetchAllContent`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`, `createModule`, `updateModule`, `deleteModule`, `createLesson`, `deleteLesson`

5. **useDashboardStats()**
   - Fetches dashboard statistics
   - Methods: `fetchDashboardStats`

6. **useReports()**
   - Handles reporting and attendance
   - Methods: `fetchEnrollments`, `recordAttendance`, `fetchCourseAttendance`

---

## Common Features Across All Pages

### Error Handling
All pages include:
- Try-catch blocks for API calls
- Error state management
- User-friendly error messages
- Retry buttons for failed operations
- Console logging for debugging

### Loading States
- Loading indicators during API calls
- Disabled forms during submission
- Loading messages

### Form Validation
- Required field validation
- Email format validation
- Confirmation dialogs for destructive actions
- Success/error alerts

### Responsive Design
- Mobile-friendly layouts
- Overflow handling for tables
- Flexible grid systems
- Responsive form layouts

---

## API Integration

### API Service Structure
Located in `/client/src/services/api.js`

All API calls follow this pattern:
```javascript
async methodName(params) {
  return this.request(endpoint, options);
}
```

### Authentication
All requests include JWT token in headers:
```javascript
Authorization: Bearer <access_token>
```

### Response Format
All responses follow this structure:
```javascript
{
  success: boolean,
  data: any,
  message?: string
}
```

---

## Environment Setup

### Required Environment Variables

**Client** (`.env`):
```env
VITE_API_URL=http://localhost:1001/api
```

**Server** (each service has `.env`):
```env
PORT=<service_port>
MONGODB_URI=mongodb://localhost:27017/<db_name>
JWT_SECRET=<your_secret>
JWT_EXPIRES_IN=7d
```

---

## Running the Application

### 1. Start All Microservices
```bash
cd server
./start-all.sh  # Linux/Mac
# or
start-all.bat   # Windows
```

### 2. Start Client
```bash
cd client
npm run dev
```

### 3. Access Admin Panel
```
http://localhost:5173
```

Login with admin credentials:
- Email: admin@example.com
- Password: (as configured in your database)

---

## Testing Checklist

### AccountsPage
- [ ] Create student account
- [ ] Create instructor account
- [ ] Create admin account
- [ ] Edit user information
- [ ] Delete user
- [ ] Filter by role tabs
- [ ] Form validation works

### CoursesPage
- [ ] Create new course
- [ ] Update course details
- [ ] Delete course
- [ ] Add section to course
- [ ] Delete section
- [ ] Enroll student in course
- [ ] Remove enrollment
- [ ] Switch between views

### ContentsPage
- [ ] Create announcement
- [ ] Update announcement
- [ ] Delete announcement
- [ ] Create module
- [ ] Update module
- [ ] Delete module
- [ ] Add lesson to module
- [ ] Delete lesson
- [ ] Switch between tabs

### ReportsPage
- [ ] View enrollment statistics
- [ ] Export enrollments to CSV
- [ ] Record attendance
- [ ] View attendance records
- [ ] Export attendance to CSV

### AdminDashboard
- [ ] View all statistics
- [ ] Refresh statistics
- [ ] Handle loading states
- [ ] Handle errors

---

## Known Issues & Future Improvements

### Current Limitations
1. Payment processing is not implemented
2. Attendance viewing needs pagination
3. No bulk operations (e.g., bulk user creation)
4. Limited search/filter functionality
5. No file upload support for profile pictures or documents

### Planned Enhancements
1. **Advanced Filtering**: Add search bars and advanced filters
2. **Bulk Operations**: Import users from CSV, bulk enrollment
3. **File Uploads**: Profile pictures, course materials, assignment submissions
4. **Real-time Updates**: WebSocket integration for live updates
5. **Data Visualization**: Charts and graphs for analytics
6. **Notifications**: Toast notifications for success/error messages
7. **Pagination**: For large datasets
8. **Caching**: Reduce API calls with client-side caching
9. **Role-based UI**: Show/hide features based on user role
10. **Activity Logs**: Track admin actions for auditing

---

## Troubleshooting

### Common Issues

1. **API Calls Failing**
   - Check if all microservices are running
   - Verify API_URL in client `.env`
   - Check authentication token is valid
   - Verify CORS configuration

2. **Empty Data**
   - Ensure database has seed data
   - Check MongoDB connection
   - Verify service ports are correct

3. **Authorization Errors**
   - Token might be expired, try logging in again
   - Check user role permissions
   - Verify JWT_SECRET matches across services

4. **Loading Forever**
   - Check browser console for errors
   - Verify API endpoints are correct
   - Check network tab for failed requests

---

## Security Considerations

1. **Authentication**: All routes require valid JWT token
2. **Authorization**: Admin role required for all operations
3. **Input Validation**: Server-side validation for all inputs
4. **SQL Injection**: Using MongoDB with Mongoose (NoSQL injection protection)
5. **XSS Protection**: React automatically escapes content
6. **CORS**: Configured to allow only specific origins

---

## Conclusion

The Admin pages are now fully integrated with the microservices backend, providing complete CRUD functionality for:
- User management (students, instructors, admins)
- Course management (courses, sections, enrollments)
- Content management (announcements, modules, lessons)
- Reporting and attendance tracking

All pages include proper error handling, loading states, form validation, and responsive design.
