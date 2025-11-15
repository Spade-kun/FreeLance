# Admin Pages - Quick Start Guide

## Prerequisites
1. All microservices must be running
2. MongoDB must be running
3. Client development server must be running

## Step 1: Start All Services

### Option A: Using Scripts (Recommended)
```bash
# From server directory
cd server
./start-all.sh  # Linux/Mac
# or
start-all.bat   # Windows
```

### Option B: Manual Start
```bash
# Terminal 1 - API Gateway
cd server/api-gateway
npm run dev

# Terminal 2 - Auth Service
cd server/auth-service
npm run dev

# Terminal 3 - User Service
cd server/user-service
npm run dev

# Terminal 4 - Course Service
cd server/course-service
npm run dev

# Terminal 5 - Content Service
cd server/content-service
npm run dev

# Terminal 6 - Assessment Service
cd server/assessment-service
npm run dev

# Terminal 7 - Report Service
cd server/report-service
npm run dev
```

## Step 2: Start Client
```bash
cd client
npm run dev
```

Client should be running at: `http://localhost:5173`

## Step 3: Login as Admin

1. Navigate to `http://localhost:5173`
2. Click "Login" button
3. Enter admin credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123` (or your configured password)
4. Complete reCAPTCHA if enabled
5. Click "Sign In"

## Step 4: Test Admin Pages

### 🏠 Dashboard
**URL**: After login, you'll see the dashboard

**What to test**:
- [ ] Statistics cards display correctly
- [ ] Numbers show actual data from database
- [ ] Refresh button works
- [ ] Loading states appear during fetch
- [ ] Error handling works (try stopping a service)

**Expected Data**:
- Total Students count
- Total Instructors count
- Total Courses count
- Total Enrollments count
- Active Announcements count

---

### 👥 Accounts Page
**Navigation**: Click "Accounts" in the sidebar

#### Test Create User
1. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@example.com`
   - Phone: `+1234567890`
   - Password: `password123`
   - Role: `Student`
2. Click "Add User"
3. Check for success alert
4. Verify user appears in table

#### Test Edit User
1. Click "✏️ Edit" button on a user
2. Modify the information
3. Click "Update User"
4. Check for success alert
5. Verify changes in table

#### Test Delete User
1. Click "🗑️" button on a user
2. Confirm deletion
3. Check for success alert
4. Verify user removed from table

#### Test Filters
1. Click different tabs:
   - [ ] All (shows all users)
   - [ ] Students (only students)
   - [ ] Instructors (only instructors)
   - [ ] Admins (only admins)
2. Verify counts are correct

---

### 📚 Courses Page
**Navigation**: Click "Courses" in the sidebar

#### Test Create Course
1. Fill in the form:
   - Course Code: `CS101`
   - Course Name: `Introduction to Computer Science`
   - Department: `Computer Science`
   - Credits: `3`
   - Description: `Basic programming concepts`
2. Click "Add Course"
3. Verify course appears in list

#### Test Add Section
1. Find a course in the list
2. Click "Add Section" button
3. Fill in section details:
   - Section Name: `Section A`
   - Instructor: Select from dropdown
   - Capacity: `30`
   - Room: `Room 101`
4. Click "Add Section"
5. Verify section appears under course

#### Test Student Enrollment
1. Switch to "Enrollments" tab
2. Click "+ Enroll Student"
3. Fill in enrollment form:
   - Select Student
   - Select Course
   - Select Section (appears after selecting course)
4. Click "Enroll Student"
5. Verify enrollment appears in table

#### Test Edit/Delete
- [ ] Edit course details
- [ ] Delete section
- [ ] Delete course
- [ ] Remove enrollment

---

### 📝 Contents Page
**Navigation**: Click "Contents" in the sidebar

#### Test Create Announcement
1. Stay on "Announcements" tab
2. Fill in the form:
   - Title: `Welcome to the new semester`
   - Course: `All Courses` or select specific
   - Priority: `High Priority`
   - Target Audience: `All Users`
   - Content: `We are excited to start...`
3. Click "Add Announcement"
4. Verify announcement appears in list

#### Test Create Module
1. Switch to "Modules" tab
2. Fill in the form:
   - Module Title: `Introduction to Programming`
   - Course: Select a course
   - Order: `1`
   - Description: `Basic concepts...`
3. Click "Add Module"
4. Verify module appears in list

#### Test Add Lesson
1. Find a module in the list
2. Click "+ Add Lesson"
3. Fill in the modal:
   - Lesson Title: `Variables and Data Types`
   - Content Type: `Text`
   - Order: `1`
   - Description: `Learn about variables...`
   - Content: `Variables are containers...`
4. Click "Add Lesson"
5. Verify lesson appears under module

#### Test Edit/Delete
- [ ] Edit announcement
- [ ] Delete announcement
- [ ] Edit module
- [ ] Delete module
- [ ] Delete lesson

---

### 📊 Reports Page
**Navigation**: Click "Reports" in the sidebar

#### Test Statistics
- [ ] View enrollment statistics cards
- [ ] Verify counts match actual data

#### Test Enrollment Report
1. Stay on "Enrollments Report" tab
2. Review enrollment table
3. Click "📥 Export Enrollments CSV"
4. Verify CSV file downloads
5. Open CSV and check data format

#### Test Attendance Tracking
1. Switch to "Attendance Tracking" tab
2. Fill in attendance form:
   - Select Course
   - Select Section (appears after course)
   - Select Student (appears after section)
   - Date: Today's date
   - Status: `Present`
   - Remarks: Optional notes
3. Click "Record Attendance"
4. Check for success alert

---

## Common Test Scenarios

### Scenario 1: Complete Student Onboarding
1. **Create Student** in Accounts page
2. **Create Course** in Courses page
3. **Add Section** to the course
4. **Enroll Student** in the section
5. **Create Announcement** for the course
6. **Create Module** for the course
7. **Add Lessons** to the module
8. **Record Attendance** for the student

### Scenario 2: Course Setup
1. Create multiple courses
2. Add sections to each course
3. Assign instructors to sections
4. Create modules for courses
5. Add lessons to modules
6. Create course announcements

### Scenario 3: Reporting
1. Ensure you have enrollments
2. Export enrollment report
3. Record attendance for multiple students
4. View statistics
5. Export attendance report

---

## Verification Checklist

### ✅ Basic Functionality
- [ ] All pages load without errors
- [ ] Navigation works correctly
- [ ] Forms accept input
- [ ] Buttons are clickable
- [ ] Tables display data

### ✅ CRUD Operations
- [ ] Create operations work
- [ ] Read operations display data
- [ ] Update operations save changes
- [ ] Delete operations remove records

### ✅ User Experience
- [ ] Loading states show during operations
- [ ] Success messages appear
- [ ] Error messages are clear
- [ ] Forms validate input
- [ ] Confirmation dialogs work

### ✅ Data Integrity
- [ ] Created data persists after refresh
- [ ] Updates reflect immediately
- [ ] Deleted data doesn't reappear
- [ ] Related data updates correctly

### ✅ Error Handling
- [ ] Network errors show messages
- [ ] Invalid input is caught
- [ ] Required fields are enforced
- [ ] Retry buttons work

---

## Testing with API Tools

### Using Thunder Client (VS Code Extension)

1. Import collection from `server/thunder-tests/thunder-collection_LMS_API.json`
2. Test endpoints directly:
   - GET `/api/users/students`
   - GET `/api/courses`
   - POST `/api/content/announcements`
   - etc.

### Using Postman

1. Import the API documentation
2. Set environment variable: `API_URL=http://localhost:1001/api`
3. Add Authorization header: `Bearer <your_token>`
4. Test each endpoint

---

## Debugging Tips

### Check Browser Console
```javascript
// Open DevTools (F12) and check for:
// - Network errors
// - JavaScript errors
// - API response data
```

### Check Server Logs
```bash
# Each service logs to console
# Look for:
# - Database connection errors
# - Route errors
# - Authentication errors
```

### Common Issues

1. **"Failed to load data"**
   - Check if services are running: `./check-services.sh`
   - Verify MongoDB is running
   - Check network tab for specific error

2. **"Unauthorized" or 401 errors**
   - Token might be expired, login again
   - Check if user has admin role
   - Verify JWT_SECRET matches

3. **Empty tables/lists**
   - Database might be empty
   - Create some test data manually
   - Check API responses in network tab

4. **Form submission fails**
   - Check required fields
   - Verify data format
   - Look for validation errors in console

---

## Sample Test Data

### Create Test Admin
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "admin"
}
```

### Create Test Student
```json
{
  "firstName": "Alice",
  "lastName": "Student",
  "email": "alice@test.com",
  "phone": "+1234567890",
  "password": "student123",
  "role": "student"
}
```

### Create Test Course
```json
{
  "courseCode": "TEST101",
  "courseName": "Test Course",
  "description": "A test course for verification",
  "credits": 3,
  "department": "Testing"
}
```

---

## Performance Testing

### Load Testing
1. Create 100+ students
2. Create 20+ courses
3. Enroll students in multiple courses
4. Test page load times
5. Check table rendering performance

### Stress Testing
1. Rapid form submissions
2. Multiple simultaneous operations
3. Large dataset handling
4. Export large CSV files

---

## Success Criteria

### All Tests Pass When:
- ✅ All CRUD operations complete successfully
- ✅ Data persists across page refreshes
- ✅ Error messages display for invalid operations
- ✅ Loading states appear appropriately
- ✅ Forms validate correctly
- ✅ Tables display all data
- ✅ CSV exports contain correct data
- ✅ Statistics match actual database counts
- ✅ Navigation works smoothly
- ✅ No console errors

---

## Next Steps After Testing

1. **Fix any bugs found**
2. **Add more features** (see ADMIN_PAGES_DOCUMENTATION.md)
3. **Implement remaining pages** (Instructor, Student dashboards)
4. **Add notifications system**
5. **Implement file uploads**
6. **Add data visualization**
7. **Deploy to production**

---

## Support

If you encounter issues:
1. Check the documentation: `ADMIN_PAGES_DOCUMENTATION.md`
2. Review API docs: `server/API_DOCUMENTATION.md`
3. Check setup guides: `server/SETUP_INSTRUCTIONS.md`
4. Look at backend logs for errors
5. Test individual microservices

---

## Conclusion

The admin pages provide complete CRUD functionality for managing:
- Users (students, instructors, admins)
- Courses and sections
- Enrollments
- Content (announcements, modules, lessons)
- Reports and attendance

All features are backed by microservices and include proper error handling, loading states, and data validation.

Happy testing! 🚀
