# 🔐 Authentication & Route Protection Flow

## 📊 Visual Flow Diagrams

### 1. Login Flow
```
┌─────────────────┐
│  User at /login │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Enters credentials  │
│ - email             │
│ - password          │
└────────┬────────────┘
         │
         ▼
┌──────────────────────────┐
│ API validates credentials│
│ POST /auth/login         │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │ Valid?  │
    └────┬────┘
         │
    ┌────┴─────┐
    │          │
   YES        NO
    │          │
    ▼          ▼
┌──────┐   ┌─────────┐
│Store:│   │ Show    │
│-token│   │ error   │
│-user │   │ message │
│-role │   └─────────┘
└───┬──┘
    │
    ▼
┌─────────────┐
│ Check role  │
└─────┬───────┘
      │
  ┌───┴───┬───────┬────────┐
  │       │       │        │
admin  instructor student other
  │       │       │        │
  ▼       ▼       ▼        ▼
/admin /instructor /student /login
```

### 2. Protected Route Access Flow
```
┌──────────────────────┐
│ User tries to access │
│   /admin or          │
│   /instructor or     │
│   /student           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ProtectedRoute       │
│ Component            │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │ Has token?   │
    └──────┬───────┘
           │
      ┌────┴────┐
      │         │
     YES       NO
      │         │
      ▼         ▼
┌──────────┐  ┌────────────┐
│Has user? │  │ Redirect   │
└────┬─────┘  │ to /login  │
     │        └────────────┘
┌────┴────┐
│         │
YES       NO
│         │
│         ▼
│    ┌────────────┐
│    │ Redirect   │
│    │ to /login  │
│    └────────────┘
│
▼
┌──────────────────────┐
│ Role validation      │
│ (if requiredRole)    │
└──────────┬───────────┘
           │
    ┌──────┴───────┐
    │ Role match?  │
    └──────┬───────┘
           │
      ┌────┴────┐
      │         │
     YES       NO
      │         │
      ▼         ▼
┌──────────┐  ┌─────────────────┐
│  Render  │  │ Redirect to     │
│Dashboard │  │ correct         │
└──────────┘  │ dashboard       │
              │ based on role   │
              └─────────────────┘
```

### 3. Logout Flow
```
┌─────────────────┐
│ User clicks     │
│ Logout button   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Confirmation dialog │
│ "Are you sure?"     │
└────────┬────────────┘
         │
    ┌────┴────┐
    │Confirm? │
    └────┬────┘
         │
    ┌────┴─────┐
    │          │
   YES        NO
    │          │
    │          ▼
    │     ┌────────┐
    │     │ Cancel │
    │     │ Stay   │
    │     └────────┘
    │
    ▼
┌──────────────────┐
│ Clear localStorage│
│ - token          │
│ - user           │
│ - refreshToken   │
│ - all other data │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Show success msg │
│ "Logged out!"    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ navigate("/login")│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User at /login   │
│ (Dashboard       │
│  inaccessible)   │
└──────────────────┘
```

### 4. Role-Based Redirect Logic
```
┌─────────────────────┐
│ User logged in with │
│ role: "student"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Tries to access     │
│ /admin              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ ProtectedRoute      │
│ requiredRole="admin"│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Check:              │
│ student === admin?  │
└──────────┬──────────┘
           │
           ▼
          NO
           │
           ▼
┌─────────────────────┐
│ Check user.role:    │
│ "student"           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Redirect to         │
│ /student            │
│ (correct dashboard) │
└─────────────────────┘
```

---

## 🔑 Key Components

### ProtectedRoute.jsx Logic
```
IF no token OR no user:
    → Redirect to /login
    
ELSE IF requiredRole specified:
    IF user.role !== requiredRole:
        SWITCH user.role:
            CASE "admin":
                → Redirect to /admin
            CASE "instructor":
                → Redirect to /instructor
            CASE "student":
                → Redirect to /student
            DEFAULT:
                → Redirect to /login
    ELSE:
        → Render children (dashboard)
        
ELSE:
    → Render children (dashboard)
```

---

## 🎯 Security Matrix

| User Role | Can Access | Cannot Access |
|-----------|------------|---------------|
| **None (Not logged in)** | /login, /signup | /admin, /instructor, /student |
| **Admin** | /admin, /login, /signup | /instructor, /student |
| **Instructor** | /instructor, /login, /signup | /admin, /student |
| **Student** | /student, /login, /signup | /admin, /instructor |

---

## 📦 Data Storage Flow

### Login Success
```javascript
// Stored in localStorage:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",  // JWT access token
  "user": {                               // User profile
    "_id": "673592ec5e36f81a40aef7ec",
    "email": "admin@lms.com",
    "role": "admin",
    "userId": "673592ec5e36f81a40aef7eb"
  },
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..." // Refresh token
}
```

### After Logout
```javascript
// localStorage completely empty:
{
  // Nothing here
}
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────┐
│         1. Client-Side              │
│    ProtectedRoute Component         │
│  • Checks localStorage              │
│  • Validates role                   │
│  • Redirects if invalid             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         2. Navigation               │
│    React Router Guards              │
│  • Prevents direct URL access       │
│  • Handles redirects                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         3. API Calls                │
│    JWT Token in Headers             │
│  • Authorization: Bearer <token>    │
│  • Backend validates token          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         4. Backend Validation       │
│    Middleware & Controllers         │
│  • Verifies JWT signature           │
│  • Checks token expiry              │
│  • Validates user role              │
└─────────────────────────────────────┘
```

---

## 🎨 UI State Changes

### Before Login
```
URL: http://localhost:5173/login
Display: Login form
localStorage: {}
Can navigate to: /login, /signup
```

### After Login (Admin)
```
URL: http://localhost:5173/admin
Display: Admin Dashboard
localStorage: {token, user, refreshToken}
Can navigate to: /admin, /login, /signup
Cannot navigate to: /instructor, /student
```

### After Logout
```
URL: http://localhost:5173/login
Display: Login form
localStorage: {}
Can navigate to: /login, /signup
Cannot navigate to: /admin, /instructor, /student
```

---

## 🧪 Testing Decision Tree

```
Start Testing
    |
    ▼
Not Logged In?
    |
    ├─ YES → Try /admin → Should redirect to /login ✅
    |
    └─ NO → Continue
         |
         ▼
    Logged in as Admin?
         |
         ├─ YES → Try /student → Should redirect to /admin ✅
         |
         ▼
    Logged in as Student?
         |
         ├─ YES → Try /admin → Should redirect to /student ✅
         |
         ▼
    Logout?
         |
         ├─ YES → Check redirect to /login ✅
         |     → Check can't go back to dashboard ✅
         |     → Check localStorage cleared ✅
         |
         ▼
    All Tests Pass ✅
```

---

## 📝 Quick Reference

### Check if Protected
```javascript
// In browser console:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Force Logout
```javascript
// In browser console:
localStorage.clear();
window.location.href = '/login';
```

### Check Current Role
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('user'));
console.log('Role:', user?.role);
```

---

## ✅ Implementation Checklist

- ✅ ProtectedRoute component created
- ✅ All dashboard routes wrapped with ProtectedRoute
- ✅ Role-based access control implemented
- ✅ Logout clears localStorage
- ✅ Logout redirects to /login
- ✅ Cannot access dashboards without login
- ✅ Cannot access wrong role's dashboard
- ✅ Confirmation dialog on logout
- ✅ Success messages on logout
- ✅ Navigation using useNavigate hook

🎉 **All security features implemented successfully!**
