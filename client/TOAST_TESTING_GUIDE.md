# Toast Notification Testing Guide

## Quick Test Scenarios

### 1. Login Success Test
1. Navigate to `/login`
2. Enter valid credentials
3. Click "Login"
4. **Expected**: Green toast appears with "Welcome back, [Your Name]! 👋"
5. **Expected**: Toast auto-dismisses after 5 seconds
6. **Expected**: Redirect happens after 800ms

### 2. Login Error Test
1. Navigate to `/login`
2. Enter invalid credentials
3. Click "Login"
4. **Expected**: Red toast appears with error message
5. **Expected**: Toast auto-dismisses after 4 seconds
6. **Expected**: Stay on login page

### 3. Student Logout Test
1. Login as student
2. Click "Logout" button in sidebar
3. Confirm logout in dialog
4. **Expected**: Green toast appears with "Goodbye, [Your Name]! See you next time! 👋"
5. **Expected**: Redirect to login after 1 second

### 4. Instructor Logout Test
1. Login as instructor
2. Click "Logout" button in sidebar
3. Confirm logout in dialog
4. **Expected**: Green toast appears with "Goodbye, [Your Name]! See you next time! 👋"
5. **Expected**: Redirect to login after 1 second

### 5. Admin Logout Test
1. Login as admin
2. Click "Logout" button in sidebar
3. Confirm logout in dialog
4. **Expected**: Green toast appears with "Goodbye, [Your Name]! See you next time! 👋"
5. **Expected**: Redirect to login after 1 second

## Visual Checks

### Toast Appearance
- ✅ Toast should slide in from the right
- ✅ Toast should be positioned at top-right corner
- ✅ Toast should have proper shadow and rounded corners
- ✅ Close button (×) should be visible and clickable
- ✅ Icon should match toast type (✓ for success, ✕ for error)

### Colors
- **Success Toast**: Green border-left, green icon background
- **Error Toast**: Red border-left, red icon background
- **Warning Toast**: Orange border-left, orange icon background
- **Info Toast**: Blue border-left, blue icon background

### Animations
- ✅ Smooth slide-in animation (300ms)
- ✅ Auto-dismiss after specified duration
- ✅ Manual close button works instantly

### Responsive Design
- ✅ On desktop: Fixed width (320-450px) at top-right
- ✅ On mobile: Full width with margins

## Browser Testing

Test in the following browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## User Scenarios

### Scenario 1: First-time user without name
- User has only email, no firstName/lastName
- **Expected**: Toast shows email instead of name
- Example: "Welcome back, user@example.com! 👋"

### Scenario 2: User with full name
- User has firstName and lastName
- **Expected**: Toast shows full name
- Example: "Welcome back, John Doe! 👋"

### Scenario 3: User with only first name
- User has firstName but no lastName
- **Expected**: Toast shows first name only
- Example: "Welcome back, John! 👋"

### Scenario 4: Multiple rapid logins/logouts
- User logs in and out quickly
- **Expected**: Toasts stack vertically without overlapping
- **Expected**: Each toast auto-dismisses independently

## Common Issues to Check

1. **Toast not appearing**: Check console for errors, verify ToastContainer is rendered
2. **Toast not dismissing**: Check duration prop, verify onClose callback works
3. **Wrong position**: Check CSS import, verify no conflicting styles
4. **Animation issues**: Check browser support for CSS animations
5. **Z-index problems**: Toast should appear above all other content (z-index: 9999)

## Development Tools

### Chrome DevTools
1. Open DevTools (F12)
2. Check Console for errors
3. Use Network tab to verify API calls
4. Use Elements tab to inspect toast DOM structure

### React DevTools
1. Install React DevTools extension
2. Inspect Toast component props
3. Verify useToast hook state updates

## Manual Testing Checklist

- [ ] Login with admin credentials
- [ ] Login with instructor credentials
- [ ] Login with student credentials
- [ ] Login with invalid credentials (error case)
- [ ] Logout from admin dashboard
- [ ] Logout from instructor dashboard
- [ ] Logout from student dashboard
- [ ] Test on different screen sizes
- [ ] Test toast close button
- [ ] Test multiple toasts simultaneously
- [ ] Verify smooth animations
- [ ] Check mobile responsiveness

## Expected Results Summary

| Action | Toast Type | Message Format | Duration |
|--------|-----------|----------------|----------|
| Login Success | Success (Green) | "Welcome back, [Name]! 👋" | 5000ms |
| Login Error | Error (Red) | Error message | 4000ms |
| Logout | Success (Green) | "Goodbye, [Name]! See you next time! 👋" | 4000ms |

## Notes

- Toast messages are personalized using user's name from localStorage
- All toasts auto-dismiss after their duration
- Users can manually close toasts using the × button
- Multiple toasts can appear simultaneously and stack vertically
- Toast container is positioned fixed at top-right (desktop) or top (mobile)

---

**Testing Status**: Ready for QA  
**Last Updated**: November 15, 2025
