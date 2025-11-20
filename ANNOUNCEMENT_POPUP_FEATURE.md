# 📢 Announcement Popup Notification Feature

## Overview
This feature displays announcement notifications as popup modals on user dashboards. Announcements are shown based on target audience (all users, specific role, or specific course) and priority levels.

## Features

### 🎯 Target Audience Filtering
Announcements are automatically filtered and shown to:
- **All users** - Everyone sees these announcements
- **Students only** - Only student users
- **Instructors only** - Only instructor users  
- **Specific course** - Only users enrolled in or teaching that course

### 📊 Priority Levels
Announcements support 4 priority levels:
- **🔴 Urgent** - Red border and icon (highest priority)
- **🟠 High** - Orange border and icon
- **🔵 Medium** - Blue border and icon (default)
- **⚪ Low** - Gray border and icon

### ✨ Smart Display Logic
- ✅ Shows only **unread** announcements
- ✅ Displays **active** announcements only
- ✅ Respects **expiry dates** (won't show expired announcements)
- ✅ Shows on **dashboard page only**
- ✅ Sorted by **priority** (urgent first) then by **publish date**
- ✅ Sequential display - shows next announcement after closing current one

### 💾 Read Tracking
- Uses localStorage to track which announcements user has read
- Key: `readAnnouncements` - array of announcement IDs
- Persists across sessions
- Auto-marks as read when user closes or dismisses

## Components

### AnnouncementModal Component
**Location:** `/client/src/components/common/AnnouncementModal.jsx`

**Props:**
```javascript
{
  userRole: 'student' | 'instructor',  // User's role
  userId: string,                       // User's ID
  enrolledCourses: string[]            // Array of course IDs user is enrolled in
}
```

**Features:**
- Auto-fetches unread announcements on mount
- Filters based on user role and enrolled courses
- Sequential display with "Next" button
- "Dismiss All" option for multiple announcements
- Priority-based color coding and icons
- Responsive design with animations
- Attachment display support

## Integration

### Student Dashboard
**File:** `/client/src/components/student/StudentDashboard.jsx`

```jsx
{page === 'dashboard' && currentUser && (
  <AnnouncementModal 
    userRole="student"
    userId={currentUser.id}
    enrolledCourses={enrollments.map(e => e.courseId)}
  />
)}
```

### Instructor Dashboard  
**File:** `/client/src/components/instructor/InstructorsDashboard.jsx`

```jsx
{page === 'dashboard' && currentUser && (
  <AnnouncementModal 
    userRole="instructor"
    userId={currentUser.id}
    enrolledCourses={instructorCourses.map(c => c._id)}
  />
)}
```

## API Usage

### Get Announcements
```javascript
const response = await api.getAnnouncements();
```

Returns all announcements with full details including:
- Title, content, priority
- Target audience, course ID
- Active status, expiry date
- Attachments

## User Experience

### First-time View
1. User lands on dashboard
2. Modal automatically appears if there are unread announcements
3. Shows highest priority announcement first
4. User can read and close

### Multiple Announcements
1. Counter shows "1 of 3" to indicate position
2. After closing, next announcement appears automatically
3. "Dismiss All" button available to skip remaining
4. Footer shows "Next announcement will appear after closing"

### No Announcements
- Modal doesn't appear if:
  - No announcements target the user
  - All announcements already read
  - All announcements expired or inactive

## Styling

### Priority Colors
- **Urgent:** `border-red-500 bg-red-50`
- **High:** `border-orange-500 bg-orange-50`
- **Medium:** `border-blue-500 bg-blue-50`
- **Low:** `border-gray-500 bg-gray-50`

### Animations
- Fade-in animation on appear: `animate-fade-in`
- Smooth transitions on hover
- Scale and opacity effects

### Layout
- Fixed overlay with backdrop blur
- Centered modal (max-width: 768px)
- Max height: 90vh with scrollable content
- Responsive padding and spacing
- Left border indicates priority

## Admin Announcement Creation

When creating announcements in admin panel, set:
- **Target Audience:** Choose who should see it
- **Course ID:** Required if audience is "specific_course"
- **Priority:** Set urgency level
- **Expiry Date:** Optional - announcement won't show after this date
- **Active Status:** Toggle to enable/disable

## Technical Details

### localStorage Schema
```javascript
{
  "readAnnouncements": ["64abc123...", "64def456...", ...]
}
```

### Filtering Logic
```javascript
// Active and not expired
if (!announcement.isActive) return false;
if (announcement.expiryDate && new Date(announcement.expiryDate) < new Date()) return false;

// Already read
const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
if (readAnnouncements.includes(announcement._id)) return false;

// Target audience match
if (announcement.targetAudience === 'all') return true;
if (announcement.targetAudience === 'students' && userRole === 'student') return true;
if (announcement.targetAudience === 'instructors' && userRole === 'instructor') return true;
if (announcement.targetAudience === 'specific_course') {
  return enrolledCourses.includes(announcement.courseId);
}
```

### Sorting Logic
```javascript
const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
filteredAnnouncements.sort((a, b) => {
  const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
  if (priorityDiff !== 0) return priorityDiff;
  return new Date(b.publishDate) - new Date(a.publishDate);
});
```

## Testing Checklist

### As Admin
- [ ] Create announcement with target "all"
- [ ] Create announcement with target "students"  
- [ ] Create announcement with target "instructors"
- [ ] Create announcement with target "specific_course"
- [ ] Set different priority levels
- [ ] Add expiry dates

### As Student
- [ ] See "all" and "students" announcements
- [ ] Don't see "instructors" announcements
- [ ] See specific course announcements for enrolled courses
- [ ] Verify priority sorting
- [ ] Test "Next" and "Dismiss All" buttons
- [ ] Verify announcements marked as read
- [ ] Confirm no repeat on page reload

### As Instructor
- [ ] See "all" and "instructors" announcements
- [ ] Don't see "students" announcements
- [ ] See specific course announcements for teaching courses
- [ ] Verify all other features work

## Future Enhancements

Potential improvements:
1. **Mark as unread** - Allow users to see announcements again
2. **Announcement center** - Page to view all past announcements
3. **Email notifications** - Send email for urgent announcements
4. **Rich text editor** - Support for formatted content
5. **Read receipts** - Track who has read announcements
6. **Schedule publishing** - Set future publish dates
7. **Categories/Tags** - Group announcements by category
8. **Search/Filter** - Search past announcements

## Summary

✅ **Implemented:**
- Popup modal for announcements
- Target audience filtering (all, students, instructors, specific course)
- Priority levels with visual indicators
- Sequential display for multiple announcements
- Read tracking with localStorage
- Dashboard-only display
- Expiry date support
- Responsive design with animations

✅ **Working on both:**
- Student Dashboard
- Instructor Dashboard

🎯 **Result:** Users now see relevant announcements automatically when visiting their dashboard, with smart filtering based on role and course enrollment!
