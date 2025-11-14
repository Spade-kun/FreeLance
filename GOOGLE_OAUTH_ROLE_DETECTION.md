# 🎯 Google OAuth with Automatic Role Detection

## Overview

The Google OAuth implementation now automatically detects user roles by searching across Admin, Instructor, and Student collections in the database. Users are automatically redirected to their appropriate dashboard based on their existing role.

---

## 🔄 How It Works

### Authentication Flow

```
User clicks "Sign in with Google"
            ↓
Google OAuth popup opens
            ↓
User selects Google account
            ↓
Google redirects to: /api/auth/google/callback
            ↓
Backend searches for user email in:
  1. Admin collection
  2. Instructor collection  
  3. Student collection
            ↓
    ┌───────┴───────┐
    │               │
 Found          Not Found
    │               │
    ↓               ↓
Create auth     Redirect to
record with    complete signup
detected role       page
    │               │
    ↓               ↓
Generate        User selects
tokens             role
    │               │
    ↓               ↓
Redirect to     Complete
appropriate    registration
dashboard           │
                   ↓
              Redirect to
              dashboard
```

---

## 🔍 Role Detection Logic

### Backend: `auth-service/controllers/authController.js`

The `findUserRoleByEmail()` function searches for the user's email across all user types:

```javascript
1. Search in Admin collection
   ↓ If found → Return { role: 'admin', userId, userData }
   
2. Search in Instructor collection
   ↓ If found → Return { role: 'instructor', userId, userData }
   
3. Search in Student collection
   ↓ If found → Return { role: 'student', userId, userData }
   
4. Not found in any collection
   ↓ Return null → User needs to complete registration
```

### What Happens When User Is Found:

1. **Check Auth Record**: Look for existing authentication record in `User` collection
2. **Create If Needed**: If no auth record exists, create one with detected role
3. **Link Google Account**: Save Google ID to auth record
4. **Generate Tokens**: Create access token and refresh token
5. **Redirect**: Send user to appropriate dashboard

---

## 📁 File Structure

### Backend Files

```
server/auth-service/
├── controllers/
│   └── authController.js         # Main OAuth logic & role detection
├── config/
│   └── passport.js                # Google OAuth strategy
├── models/
│   └── User.js                    # Auth records (credentials)
└── .env                           # OAuth credentials

server/user-service/
├── models/
│   ├── Admin.js                   # Admin data model
│   ├── Instructor.js              # Instructor data model
│   └── Student.js                 # Student data model
└── controllers/
    └── userController.js          # User management
```

### Frontend Files

```
client/src/
├── components/
│   ├── GoogleAuthCallback.jsx     # Handles OAuth redirect
│   ├── GoogleSignInButton.jsx     # Google sign-in button
│   └── LoginSignup/
│       └── CompleteGoogleSignup.jsx  # For new users
├── context/
│   ├── GoogleAuthContext.jsx      # Google OAuth provider
│   └── AuthContext.jsx            # Auth state management
└── App.jsx                        # Routes including /auth/callback
```

---

## 🎨 Frontend: OAuth Callback Handler

### Component: `GoogleAuthCallback.jsx`

```javascript
// Extracts tokens from URL parameters
const accessToken = searchParams.get('accessToken');
const refreshToken = searchParams.get('refreshToken');
const role = searchParams.get('role');
const email = searchParams.get('email');

// Saves to localStorage
localStorage.setItem('token', accessToken);
localStorage.setItem('user', JSON.stringify({ role, email }));

// Redirects based on role
switch (role) {
  case 'admin': navigate('/admin');
  case 'instructor': navigate('/instructor');
  case 'student': navigate('/student');
}
```

---

## 🧪 Testing the Flow

### Scenario 1: Existing User (Email in Database)

**Example**: `instructor@example.com` exists in Instructor collection

1. Click "Sign in with Google"
2. Select Google account with `instructor@example.com`
3. **Backend automatically detects role**: `instructor`
4. Creates/updates auth record
5. **Redirects to**: `/instructor` dashboard
6. ✅ **Result**: User lands on Instructor Dashboard

### Scenario 2: New User (Email Not in Database)

**Example**: `newuser@gmail.com` doesn't exist anywhere

1. Click "Sign in with Google"
2. Select Google account with `newuser@gmail.com`
3. **Backend doesn't find user** in any collection
4. **Redirects to**: `/complete-signup` page
5. User selects role (Admin/Instructor/Student)
6. Creates user in selected collection
7. Creates auth record
8. Redirects to appropriate dashboard

---

## 🔐 Database Collections

### 1. Auth Collection (`users` in auth-service)

Stores authentication credentials:

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  googleId: "123456789",        // Google OAuth ID
  role: "instructor",           // Detected/assigned role
  userId: ObjectId,             // Reference to actual user record
  isActive: true,
  refreshTokens: [],
  lastLogin: Date
}
```

### 2. User Collections (in user-service)

**Admins Collection:**
```javascript
{
  _id: ObjectId,
  firstName: "John",
  lastName: "Admin",
  email: "admin@example.com",   // Used for role detection
  permissions: ["manage_users"],
  isActive: true
}
```

**Instructors Collection:**
```javascript
{
  _id: ObjectId,
  firstName: "Jane",
  lastName: "Teacher",
  email: "teacher@example.com", // Used for role detection
  specialization: "Mathematics",
  isActive: true
}
```

**Students Collection:**
```javascript
{
  _id: ObjectId,
  firstName: "Bob",
  lastName: "Student",
  email: "student@example.com", // Used for role detection
  studentId: "2024001",
  isActive: true
}
```

---

## 🚀 Setup Instructions

### 1. Ensure Services Are Running

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
./start-all.sh
```

### 2. Verify Google OAuth Credentials

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
./verify-oauth.sh
```

### 3. Test the Flow

#### Test with Existing User:

1. **Create a test user** in one of the collections:
   ```javascript
   // Example: Add student in database
   {
     firstName: "Test",
     lastName: "Student",
     email: "your.gmail@gmail.com",  // Your actual Gmail
     studentId: "TEST001",
     isActive: true
   }
   ```

2. **Sign in with Google** using that Gmail
3. **Verify**: Automatically redirected to Student Dashboard

#### Test with New User:

1. Use a Gmail that's **NOT** in any collection
2. Sign in with Google
3. Should redirect to "Complete Signup" page
4. Select role and complete registration

---

## 🔍 Debugging

### Check Backend Logs

```bash
# View auth service logs
tail -f /home/spade/Public/Repository/MERN_FREELANCE/server/logs/auth-service.log
```

**Look for:**
```
🔍 Searching for existing user with email: user@example.com
✅ Found existing instructor with email: user@example.com
📝 Creating auth record for existing instructor
🎯 Redirecting instructor to dashboard
```

### Check Browser Console

After Google OAuth redirect, check console for:
```
✅ Google OAuth successful! Role: instructor
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Auth failed" | Google OAuth config wrong | Run `./verify-oauth.sh` |
| "Invalid role" | Role detection failed | Check if email exists in collections |
| "Callback failed" | Missing tokens | Check backend logs |
| Still shows old client | Browser cache | Clear cache, use incognito |

---

## 📊 URL Parameters

### OAuth Callback URL

```
http://localhost:5173/auth/callback?
  accessToken=eyJhbG...xyz&
  refreshToken=eyJhbG...abc&
  role=instructor&
  email=teacher@example.com&
  userId=507f1f77bcf86cd799439011
```

### Complete Signup URL (for new users)

```
http://localhost:5173/complete-signup?
  email=newuser@gmail.com&
  firstName=John&
  lastName=Doe&
  googleId=123456789&
  picture=https://...&
  needsRole=true
```

---

## ✅ Success Criteria

After implementing this feature, users should experience:

1. **Existing Users**:
   - ✅ Sign in with Google using their work/school email
   - ✅ Automatically detected as Admin/Instructor/Student
   - ✅ Redirected to correct dashboard
   - ✅ No manual role selection needed

2. **New Users**:
   - ✅ Sign in with Google
   - ✅ Prompted to select role
   - ✅ Complete registration
   - ✅ Redirected to appropriate dashboard

3. **Security**:
   - ✅ Tokens stored securely in localStorage
   - ✅ Refresh tokens for session management
   - ✅ Protected routes check role permissions

---

## 🎯 Dashboard Routes

Based on detected role:

| Role | Dashboard URL | Component |
|------|---------------|-----------|
| Admin | `/admin` | `AdminDashboard.jsx` |
| Instructor | `/instructor` | `InstructorsDashboard.jsx` |
| Student | `/student` | `StudentDashboard.jsx` |

All routes are protected by `ProtectedRoute` component which checks:
- User is authenticated (has valid token)
- User has required role for the route

---

## 🔄 Future Enhancements

- [ ] Support for multiple roles per user
- [ ] Role hierarchy (e.g., Admin can access Instructor views)
- [ ] Social login with other providers (Facebook, Microsoft)
- [ ] Two-factor authentication (2FA) integration
- [ ] Email verification before role assignment
- [ ] Audit log for role changes

---

## 📚 Related Documentation

- `/GOOGLE_AUTH_RECAPTCHA_SETUP.md` - Complete OAuth setup guide
- `/GOOGLE_OAUTH_CREDENTIALS_FIX.md` - Troubleshooting credentials
- `/OAUTH_CLIENT_DELETED_FIX.md` - Fixing deleted client errors
- `/AUTHENTICATION_FLOW.md` - Overall auth architecture

---

**Date Created:** November 14, 2025  
**Feature:** Automatic role detection via Google OAuth  
**Status:** ✅ Implemented and Ready for Testing
