# Attendance Management Feature

## Overview
Added a comprehensive attendance tracking system for instructors to manage student attendance in their course sections.

## Backend Implementation

### 1. **Attendance Model**
   - **Location**: `/server/course-service/models/Attendance.js`
   - **Schema**:
     - `attendanceId`: Auto-incremented unique identifier
     - `sectionId`: Reference to Section
     - `courseId`: Reference to Course
     - `date`: Date of attendance
     - `records`: Array of student attendance records
       - `studentId`: Reference to Student
       - `status`: Enum ['present', 'absent', 'late', 'excused']
       - `remarks`: Optional notes
     - `takenBy`: Instructor who recorded attendance
     - `notes`: General notes for the day
   - **Indexes**: Compound unique index on `sectionId` and `date` to prevent duplicates

### 2. **Attendance Controller**
   - **Location**: `/server/course-service/controllers/attendanceController.js`
   - **Functions**:
     - `getSectionAttendance()` - Get all attendance records for a section
     - `getAttendanceByDate()` - Get attendance for a specific date
     - `saveAttendance()` - Create or update attendance record
     - `getSectionStudents()` - Get enrolled students in a section
     - `getAttendanceStats()` - Calculate attendance statistics per student
     - `deleteAttendance()` - Delete an attendance record

### 3. **Attendance Routes**
   - **Location**: `/server/course-service/routes/attendance.js`
   - **Endpoints**:
     - `GET /api/attendance/section/:sectionId` - Get all attendance for section
     - `GET /api/attendance/section/:sectionId/date?date=YYYY-MM-DD` - Get specific date
     - `GET /api/attendance/section/:sectionId/students` - Get enrolled students
     - `GET /api/attendance/section/:sectionId/stats` - Get attendance statistics
     - `POST /api/attendance` - Save attendance record
     - `DELETE /api/attendance/:attendanceId` - Delete attendance

### 4. **Server Integration**
   - **File**: `/server/course-service/server.js`
   - Added attendance routes to the course service

## Frontend Implementation

### 1. **API Service Updates**
   - **Location**: `/client/src/services/api.js`
   - **Added Methods**:
     - `getSectionAttendance(sectionId)`
     - `getAttendanceByDate(sectionId, date)`
     - `getSectionStudents(sectionId)`
     - `saveAttendance(data)`
     - `getAttendanceStats(sectionId)`
     - `deleteAttendance(attendanceId)`

### 2. **Instructor Dashboard Integration**
   - **Location**: `/client/src/components/instructor/InstructorsDashboard.jsx`
   - **New Page**: "Attendance" added to navigation menu
   - **State Variables**:
     - `selectedAttendanceCourse` - Selected course for attendance
     - `selectedSection` - Selected section
     - `sections` - List of course sections
     - `attendanceDate` - Selected date for attendance
     - `sectionStudents` - Enrolled students in section
     - `attendanceRecords` - Attendance records for the date
     - `attendanceStats` - Attendance statistics
     - `loadingAttendance` - Loading state

### 3. **Attendance Features**

#### **Course & Section Selection**
- Dropdown to select course from instructor's courses
- Dropdown to select section (shows enrolled/capacity)
- Displays section schedule and room information

#### **Date Selection**
- Date picker to select attendance date (defaults to today)
- Automatically loads existing attendance for selected date

#### **Attendance Marking**
- Table displaying all enrolled students
- Four status buttons per student:
  - ✓ **Present** (Green)
  - ⏰ **Late** (Yellow)
  - 📋 **Excused** (Blue)
  - ✕ **Absent** (Red)
- Quick status toggle with visual feedback
- Save button to record attendance

#### **Attendance Statistics**
- Shows total number of sessions
- Per-student statistics table:
  - Present count
  - Late count
  - Excused count
  - Absent count
  - Attendance rate percentage
- Color-coded attendance rate (Green ≥75%, Red <75%)

## User Flow

1. **Navigate to Attendance Page**
   - Click "✅ Attendance" in the instructor sidebar

2. **Select Course & Section**
   - Choose a course from dropdown
   - Choose a section from the course's sections
   - View section details (schedule, room, capacity)

3. **Select Date**
   - Use date picker to select attendance date
   - System loads any existing attendance for that date

4. **Mark Attendance**
   - View all enrolled students in a table
   - Click status buttons to mark each student:
     - Present (default for attended)
     - Late (attended but late)
     - Excused (absent with excuse)
     - Absent (did not attend)
   - Click "💾 Save Attendance" to record

5. **View Statistics**
   - See overall attendance statistics for the section
   - Monitor individual student attendance rates
   - Identify students with poor attendance

## Database Schema

### Attendance Collection
```javascript
{
  attendanceId: 1,
  sectionId: ObjectId("..."),
  courseId: ObjectId("..."),
  date: ISODate("2025-11-15T00:00:00.000Z"),
  records: [
    {
      studentId: ObjectId("..."),
      status: "present",
      remarks: ""
    },
    {
      studentId: ObjectId("..."),
      status: "late",
      remarks: "Arrived 15 minutes late"
    }
  ],
  takenBy: ObjectId("..."),
  notes: "Quiz day",
  createdAt: ISODate("2025-11-15T08:30:00.000Z"),
  updatedAt: ISODate("2025-11-15T08:30:00.000Z")
}
```

## Key Features

1. **Quick Marking**: One-click status buttons for fast attendance taking
2. **Visual Feedback**: Color-coded status badges for easy scanning
3. **Edit Existing**: Can update attendance records for past dates
4. **Statistics**: Track attendance trends over time
5. **Auto-save**: Prevents duplicate entries for same section/date
6. **Student Details**: Shows student ID and full name
7. **Section Info**: Displays schedule and room information
8. **Validation**: Ensures instructor owns the section before allowing edits

## Security

- **Authorization**: Only section instructor can record/edit attendance
- **Validation**: Validates section ownership before operations
- **Unique Constraint**: Prevents duplicate attendance records
- **Token Required**: All endpoints require valid authentication token

## Future Enhancements

- Export attendance to Excel/PDF
- Attendance reports by date range
- Email notifications for low attendance
- Mobile-responsive attendance marking
- Bulk operations (mark all present/absent)
- QR code check-in system
- Attendance alerts for students below threshold
