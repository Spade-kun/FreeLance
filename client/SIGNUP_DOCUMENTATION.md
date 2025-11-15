# 🎓 Signup & Login Documentation

## ✅ Complete Authentication System

Your LMS now has separate Login and Signup pages with full backend integration!

---

## 🌐 Routes

### Login Page
- **URL**: http://localhost:5173/login
- **Purpose**: Existing users login
- **Required**: Email & Password

### Signup Page
- **URL**: http://localhost:5173/signup
- **Purpose**: New user registration
- **Features**: 
  - Role selection (Student, Instructor, Admin)
  - Password confirmation
  - Role-specific fields
  - Automatic auth account creation

---

## 🔐 Signup Features

### All Roles Required Fields:
- ✅ First Name
- ✅ Last Name
- ✅ Email
- ✅ Phone Number
- ✅ Password (min 6 characters)
- ✅ Confirm Password

### Student Additional Fields:
- ✅ Student ID (required)
- ⭕ Guardian Name (optional)
- ⭕ Guardian Contact (optional)

### Instructor Additional Fields:
- ✅ Specialization (required)
- ⭕ Bio (optional)

### Admin Fields:
- Only basic fields required

---

## 🔄 Signup Flow

```
User fills signup form
        ↓
Validates all fields
        ↓
Creates user profile in backend
(api.createStudent / api.createInstructor / api.createAdmin)
        ↓
Creates auth account with custom password
(api.register with user's chosen password)
        ↓
Shows success message with credentials
        ↓
Redirects to login page after 2 seconds
```

---

## 🧪 Testing Signup

### Test as Student:

1. Go to: http://localhost:5173/signup
2. Fill form:
   - Role: Student
   - First Name: Maria
   - Last Name: Santos
   - Email: maria.santos@student.lms.com
   - Phone: 09123456789
   - Password: Maria@123
   - Confirm Password: Maria@123
   - Student ID: 2024-00002
   - Guardian Name: Pedro Santos
   - Guardian Contact: 09234567890
3. Click "Create Account"
4. Wait for success message
5. Redirected to login
6. Login with: maria.santos@student.lms.com / Maria@123

### Test as Instructor:

1. Go to: http://localhost:5173/signup
2. Fill form:
   - Role: Instructor
   - First Name: Carlos
   - Last Name: Reyes
   - Email: carlos.reyes@instructor.lms.com
   - Phone: 09345678901
   - Password: Carlos@123
   - Confirm Password: Carlos@123
   - Specialization: Mathematics
   - Bio: Experienced math teacher with 5 years in education
3. Click "Create Account"
4. Login with: carlos.reyes@instructor.lms.com / Carlos@123

### Test as Admin:

1. Go to: http://localhost:5173/signup
2. Fill form:
   - Role: Admin
   - First Name: Admin
   - Last Name: User
   - Email: admin2@lms.com
   - Phone: 09456789012
   - Password: Admin2@123
   - Confirm Password: Admin2@123
3. Click "Create Account"
4. Login with: admin2@lms.com / Admin2@123

---

## 🔐 Login Features

### Test Credentials (Pre-created):

**Admin:**
- Email: `admin@lms.com`
- Password: `Admin@123`

**Student:**
- Email: `juan.delacruz@student.lms.com`
- Password: `Student@123`

### Login Flow:

```
User enters email & password
        ↓
Sends to backend API Gateway
        ↓
Auth service validates credentials
        ↓
Returns JWT token + user data
        ↓
Stores token in localStorage
        ↓
Redirects based on role:
  - Admin → /admin
  - Instructor → /instructor
  - Student → /student
```

---

## 🎨 UI Features

### Login Page (http://localhost:5173/login)
- Clean, modern design
- Email and password fields
- Link to signup page
- Test credentials displayed
- Loading state during authentication
- Error messages for failed login

### Signup Page (http://localhost:5173/signup)
- Role selector at top
- Dynamic fields based on role
- Password strength requirement (min 6 chars)
- Password confirmation
- Form validation
- Loading state during signup
- Success message with credentials
- Auto-redirect to login after signup
- Link back to login

---

## 🔧 API Integration

### Signup API Calls:

```javascript
// 1. Create user profile
const response = await api.createStudent({
  firstName: "Maria",
  lastName: "Santos",
  email: "maria@student.lms.com",
  phone: "09123456789",
  studentId: "2024-00002",
  guardianName: "Pedro Santos",
  guardianContact: "09234567890"
});

const userId = response.data._id;

// 2. Create auth account with custom password
await api.register(
  "maria@student.lms.com",  // email
  "Maria@123",               // password (user's choice)
  "student",                 // role
  userId                     // reference to user profile
);
```

### Login API Call:

```javascript
const response = await api.login(
  "maria@student.lms.com",
  "Maria@123"
);

// Response contains:
// - accessToken (JWT)
// - refreshToken
// - user (profile data)
```

---

## 📋 Validation Rules

### Email:
- ✅ Must be valid email format
- ✅ Must be unique (checked by backend)

### Password:
- ✅ Minimum 6 characters
- ✅ Must match confirmation
- ⭕ Recommended: Include uppercase, lowercase, numbers, symbols

### Phone:
- ✅ Required
- ⭕ Format not strictly enforced (can be any format)

### Student ID:
- ✅ Required for students
- ✅ Must be unique

### Names:
- ✅ First name and last name required
- ✅ No special validation

---

## 🗃️ Database Storage

### Auth Collection (`users`):
```json
{
  "_id": "...",
  "email": "maria@student.lms.com",
  "password": "$2a$10$...",  // bcrypt hashed
  "role": "student",
  "userId": "..." // reference to students collection
}
```

### Students Collection:
```json
{
  "_id": "...",
  "firstName": "Maria",
  "lastName": "Santos",
  "email": "maria@student.lms.com",
  "phone": "09123456789",
  "studentId": "2024-00002",
  "guardianName": "Pedro Santos",
  "guardianContact": "09234567890",
  "isActive": true,
  "enrollmentDate": "2025-11-14T..."
}
```

### Instructors Collection:
```json
{
  "_id": "...",
  "firstName": "Carlos",
  "lastName": "Reyes",
  "email": "carlos@instructor.lms.com",
  "phone": "09345678901",
  "specialization": "Mathematics",
  "bio": "Experienced math teacher...",
  "qualifications": [],
  "isActive": true
}
```

---

## 🔒 Security Features

1. **Password Hashing**: All passwords hashed with bcrypt (10 rounds)
2. **JWT Tokens**: Secure token-based authentication
3. **Token Storage**: AccessToken in localStorage
4. **Token Expiry**: 7 days for access token, 30 days for refresh
5. **Password Validation**: Minimum 6 characters
6. **Email Uniqueness**: Backend validates unique emails
7. **CORS Protection**: Only allowed origins can access API

---

## 🐛 Error Handling

### Signup Errors:

**"Please fill all required fields"**
- Solution: Fill all fields marked with *

**"Passwords do not match"**
- Solution: Ensure Password and Confirm Password are identical

**"Password must be at least 6 characters"**
- Solution: Use a longer password

**"Email already registered" / "Duplicate key error"**
- Solution: User already exists, use login instead

**"Student ID is required"**
- Solution: Fill the Student ID field (for students)

**"Specialization is required"**
- Solution: Fill the Specialization field (for instructors)

### Login Errors:

**"Invalid email or password"**
- Solution: Check credentials, ensure they match signup

**"User not found"**
- Solution: User doesn't exist, sign up first

**"Failed to fetch" / "Network Error"**
- Solution: Ensure backend is running (./start-all.sh)

---

## 🧪 Testing Checklist

### Signup Testing:
- [ ] Create student account
- [ ] Create instructor account
- [ ] Create admin account
- [ ] Try duplicate email (should fail)
- [ ] Try mismatched passwords (should fail)
- [ ] Try short password (should fail)
- [ ] Try empty fields (should fail)
- [ ] Verify redirect to login after success
- [ ] Check MongoDB for created records

### Login Testing:
- [ ] Login with newly created student
- [ ] Login with newly created instructor
- [ ] Login with newly created admin
- [ ] Try wrong password (should fail)
- [ ] Try non-existent email (should fail)
- [ ] Verify redirect to correct dashboard
- [ ] Check localStorage for token
- [ ] Verify token in MongoDB users collection

### Navigation Testing:
- [ ] Login page → Signup page link works
- [ ] Signup page → Login page link works
- [ ] Direct access to /login works
- [ ] Direct access to /signup works
- [ ] Default route redirects to /login

---

## 📱 Responsive Design

Both login and signup pages are responsive:
- ✅ Mobile-friendly
- ✅ Centered layout
- ✅ Scrollable on small screens
- ✅ Touch-friendly buttons

---

## 🔄 What Changed

### Files Created:
1. `client/src/components/LoginSignup/Login.jsx` - Dedicated login component
2. `client/src/components/LoginSignup/Signup.jsx` - Full-featured signup component
3. `client/SIGNUP_DOCUMENTATION.md` - This documentation

### Files Modified:
1. `client/src/App.jsx` - Added /signup route
2. `client/src/services/api.js` - Already had all needed methods

### Old Files:
- `LoginSignup.jsx` - Can be removed (replaced by Login.jsx and Signup.jsx)

---

## 🚀 Next Steps

1. ✅ Test signup with all 3 roles
2. ✅ Test login with created accounts
3. ✅ Verify database records
4. 🔄 Add profile picture upload (optional)
5. 🔄 Add email verification (optional)
6. 🔄 Add forgot password feature
7. 🔄 Add "Remember me" functionality
8. 🔄 Add social login (Google, Facebook)

---

## 💡 Pro Tips

1. **Default Passwords**: When admin creates users via dashboard, default passwords are used (Admin@123, Student@123, etc.). Users created via signup use their chosen password.

2. **Password Recovery**: Currently no password reset. Users must contact admin if they forget password.

3. **Email Confirmation**: No email verification currently. All accounts are active immediately.

4. **Testing**: Use the MongoDB Atlas interface to view created users in the `lms_mern` database.

5. **Security**: In production, use environment variables for sensitive data and enable HTTPS.

---

## 🌐 URLs Summary

| Page | URL | Purpose |
|------|-----|---------|
| Login | http://localhost:5173/login | User authentication |
| Signup | http://localhost:5173/signup | New user registration |
| Admin | http://localhost:5173/admin | Admin dashboard |
| Instructor | http://localhost:5173/instructor | Instructor dashboard |
| Student | http://localhost:5173/student | Student dashboard |

---

## ✅ Success!

Your LMS now has a complete authentication system with:
- ✅ Separate login and signup pages
- ✅ Password confirmation
- ✅ Role-based registration
- ✅ Custom password during signup
- ✅ Full backend integration
- ✅ Database storage
- ✅ JWT authentication
- ✅ Proper validation
- ✅ Error handling

**Open http://localhost:5173/signup and create your first account!** 🎉
