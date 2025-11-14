# 🔐 Google OAuth & reCAPTCHA v3 Setup Guide

This guide explains how to configure Google OAuth authentication and reCAPTCHA v3 for your LMS application.

---

## 📋 Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Google reCAPTCHA v3 Setup](#google-recaptcha-v3-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## 🔑 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `LMS Authentication`
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project dashboard, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure consent screen:
   - User Type: **External**
   - App name: **LMS Application**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - **IMPORTANT**: Add test users (for development)
     - Click **"ADD USERS"** button
     - Enter your Gmail address (the one you'll use to sign in)
     - Click **"Save"**
   - Click **"Save and Continue"**
   
   ⚠️ **Critical**: If you skip adding test users, you'll get "Access blocked: Authorization Error"

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `LMS Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:1001
     http://localhost:1002
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:1002/api/auth/google/callback
     http://localhost:5173/auth/callback
     ```
   - Click **"Create"**
   
   **Note**: Port 1001 is the API Gateway that redirects to auth-service on port 1002

5. **Copy the credentials**:
   - Client ID: `123456789-abc...xyz.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-YOUR_SECRET_HERE...xyz`

### Step 4: Configure Backend (.env)

Edit `/server/auth-service/.env`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_SECRET_HERE...xyz
GOOGLE_CALLBACK_URL=http://localhost:1002/api/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

### Step 5: Configure Frontend (.env)

Edit `/client/.env`:

```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc...xyz.apps.googleusercontent.com
```

---

## 🛡️ Google reCAPTCHA v3 Setup

### Step 1: Register Your Site

1. Go to [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label**: `LMS Application`
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add:
     ```
     localhost
     127.0.0.1
     ```
   - Accept terms and submit

### Step 2: Copy Your Keys

After registration, you'll receive:
- **Site Key** (for frontend): `6Lc...xyz`
- **Secret Key** (for backend): `6Lc...abc`

### Step 3: Configure Backend (.env)

Edit `/server/auth-service/.env`:

```bash
# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=6Lc...abc
```

### Step 4: Configure Frontend (.env)

Edit `/client/.env`:

```bash
# Google reCAPTCHA v3
VITE_RECAPTCHA_SITE_KEY=6Lc...xyz
```

---

## ⚙️ Environment Configuration

### Backend Configuration

**File**: `/server/auth-service/.env`

```bash
PORT=1002
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/lms_mern

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@lms.com

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:1002/api/auth/google/callback

# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Session
SESSION_SECRET=your_session_secret_use_long_random_string
```

### Frontend Configuration

**File**: `/client/.env`

```bash
# API Configuration
VITE_API_URL=http://localhost:1001/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Google reCAPTCHA v3
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 🧪 Testing

### Test Google OAuth

1. **Start Backend Services**:
   ```bash
   cd server
   ./start-all.sh
   ```

2. **Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```

3. **Test Login with Google**:
   - Go to http://localhost:5173/login
   - Click **"Sign in with Google"** button
   - Select your Google account
   - Should redirect to appropriate dashboard

4. **Test Signup with Google**:
   - Go to http://localhost:5173/signup
   - Click **"Sign up with Google"** button
   - If new user, you'll need to complete registration with role selection

### Test reCAPTCHA v3

1. **Open Browser DevTools** (F12)
2. Go to **Console** tab
3. Login or Signup
4. Look for messages:
   ```
   ✅ reCAPTCHA verified: action=login, score=0.9
   ```

5. **Check Network Tab**:
   - Look for `/auth/login` or `/auth/register` requests
   - Check request payload includes `recaptchaToken`

### Verify reCAPTCHA Score

**Backend logs** will show:
```
✅ reCAPTCHA verified: action=login, score=0.9
```

**Score interpretation**:
- `0.9 - 1.0`: Very likely human
- `0.7 - 0.9`: Probably human
- `0.5 - 0.7`: Suspicious
- `0.0 - 0.5`: Likely bot (will be rejected)

---

## 🚨 Troubleshooting

### Google OAuth Issues

#### ⚠️ Error: "Access blocked: Authorization Error" (MOST COMMON)

**Problem**: You see "Access blocked: Authorization Error - The developer hasn't given you access to this app"

**Solution**: Your app is in testing mode. You need to add your Gmail address as a test user.

**Quick Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **"APIs & Services"** → **"OAuth consent screen"**
3. Scroll to **"Test users"** section
4. Click **"+ ADD USERS"**
5. Enter your Gmail address
6. Click **"Save"**
7. Try signing in again - should work immediately!

📖 **Detailed Guide**: See `/GOOGLE_OAUTH_ACCESS_BLOCKED_FIX.md`

#### Error: "Route not found" for Google Auth

**Problem**: Frontend trying to access `http://localhost:1001/api/auth/google` but route doesn't exist

**Solution**:
- The API Gateway (port 1001) now properly redirects Google OAuth requests to auth-service (port 1002)
- Make sure all services are running: `cd server && ./start-all.sh`
- Verify the redirect works: `curl -I http://localhost:1001/api/auth/google`
- You should see `Location: http://localhost:1002/api/auth/google` in the response

**Note**: The frontend uses port 1001 (API Gateway), which automatically redirects Google OAuth to port 1002 (auth-service)

#### Error: "redirect_uri_mismatch"

**Problem**: Redirect URI not authorized

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth Client ID
3. Add to Authorized redirect URIs:
   ```
   http://localhost:1002/api/auth/google/callback
   ```
4. Add to Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:1001
   http://localhost:1002
   ```

#### Error: "Access blocked: Authorization Error"

**Problem**: Your app is in testing mode and your Google account is not added as a test user

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services"** → **"OAuth consent screen"**
4. Scroll down to **"Test users"** section
5. Click **"ADD USERS"**
6. Enter your Gmail address (the one you're trying to sign in with)
7. Click **"Save"**
8. Try signing in again - should work immediately

**Alternative**: Publish your app (not recommended for development)
- On the OAuth consent screen page
- Click **"PUBLISH APP"**
- Note: This requires verification for production use

#### Error: "OAuth client was not found" - Error 401: invalid_client

**Problem**: Google cannot find or validate your OAuth credentials

**Causes**:
- OAuth client was deleted or never created properly
- Client ID or Secret is incorrect in `.env` files
- Typos, extra spaces, or wrong formatting
- Using credentials from a different Google Cloud project

**Solution**:
1. **Create/Regenerate OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Go to **"APIs & Services"** → **"Credentials"**
   - Create new OAuth Client ID (or verify existing one)
   - Copy Client ID and Secret carefully

2. **Update Backend** `/server/auth-service/.env`:
   ```bash
   GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET
   ```

3. **Update Frontend** `/client/.env`:
   ```bash
   VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com
   ```

4. **Restart Services**:
   ```bash
   cd server
   ./stop-all.sh
   ./start-all.sh
   
   cd ../client
   npm run dev
   ```

📖 **Detailed Guide**: See `/GOOGLE_OAUTH_CREDENTIALS_FIX.md`

#### Google Login Opens but Nothing Happens

**Problem**: Popup blocked or callback not handled

**Solution**:
1. Allow popups for localhost in browser
2. Check browser console for errors
3. Verify CORS settings in backend

### reCAPTCHA Issues

#### Error: "reCAPTCHA token is required"

**Problem**: reCAPTCHA not loading or token not sent

**Solution**:
1. Check VITE_RECAPTCHA_SITE_KEY is set in `.env`
2. Clear browser cache
3. Check browser console for script loading errors

#### Error: "reCAPTCHA verification failed"

**Problem**: Invalid secret key or network issue

**Solution**:
1. Verify RECAPTCHA_SECRET_KEY in backend `.env` (auth-service)
2. Check backend logs: `tail -f server/logs/auth-service.log`
3. Ensure localhost is added to reCAPTCHA domains in Google Admin Console
4. Verify the frontend is sending the token correctly - check Network tab in DevTools
5. Make sure the recaptchaToken is included in the request body for login/register

**Debug Steps**:
```bash
# Check if reCAPTCHA token is being sent
# Open browser DevTools → Network → Look for /api/auth/login or /api/auth/register
# Check Request Payload should include: { email, password, recaptchaToken }

# Check backend logs for reCAPTCHA verification
tail -f server/logs/auth-service.log
# Look for: ✅ reCAPTCHA verified: action=login, score=0.9
```

#### Warning: "reCAPTCHA not ready yet"

**Problem**: Script still loading when form submitted

**Solution**:
1. Wait a moment after page load
2. Check network connection
3. Verify site key is correct

---

## 🔄 Flow Diagrams

### Google OAuth Flow

```
User clicks "Sign in with Google"
            ↓
Opens popup to /api/auth/google
            ↓
Redirects to Google's OAuth page
            ↓
User selects Google account
            ↓
Google redirects to /api/auth/google/callback
            ↓
Backend checks if user exists
            ↓
    ┌───────┴───────┐
    │               │
 Exists       New User
    │               │
    ↓               ↓
Generate        Redirect to
tokens      complete-signup
    │          with user info
    ↓               │
Redirect            ↓
to correct    User selects role
dashboard          │
                   ↓
              Complete registration
                   ↓
              Generate tokens
                   ↓
              Redirect to dashboard
```

### reCAPTCHA v3 Flow

```
User submits login/signup form
            ↓
Frontend calls getRecaptchaToken('login')
            ↓
Google reCAPTCHA generates token
            ↓
Token sent with form data to backend
            ↓
Backend verifies token with Google API
            ↓
Google returns score (0.0 - 1.0)
            ↓
    ┌───────┴───────┐
    │               │
Score >= 0.5   Score < 0.5
    │               │
    ↓               ↓
Continue       Reject request
process       "Suspicious activity"
```

---

## � Port Configuration

### Service Architecture

```
Frontend (Port 5173)
       ↓
API Gateway (Port 1001) → Proxies all requests
       ↓
Auth Service (Port 1002) → Handles Google OAuth & reCAPTCHA
```

### Important URLs

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 5173 | `http://localhost:5173` | React App |
| API Gateway | 1001 | `http://localhost:1001/api` | Main API endpoint |
| Auth Service | 1002 | `http://localhost:1002/api/auth` | Direct auth access |

**Frontend Configuration** (`client/.env`):
```bash
VITE_API_URL=http://localhost:1001/api  # Always use API Gateway
```

**Google OAuth Flow**:
1. Frontend calls: `http://localhost:1001/api/auth/google`
2. API Gateway redirects to: `http://localhost:1002/api/auth/google`
3. Auth service handles OAuth flow
4. Callback goes to: `http://localhost:1002/api/auth/google/callback`

---

## �📝 API Endpoints

### Google OAuth Endpoints

| Method | Endpoint | Description | Direct URL |
|--------|----------|-------------|------------|
| GET | `/api/auth/google` | Initiates Google OAuth flow | `http://localhost:1001/api/auth/google` |
| GET | `/api/auth/google/callback` | Handles Google OAuth callback | `http://localhost:1002/api/auth/google/callback` |
| POST | `/api/auth/google/complete` | Completes registration for new users | `http://localhost:1001/api/auth/google/complete` |

### Standard Auth Endpoints (with reCAPTCHA)

| Method | Endpoint | Description | reCAPTCHA |
|--------|----------|-------------|-----------|
| POST | `/api/auth/login` | User login | Required |
| POST | `/api/auth/register` | User registration | Required |
| POST | `/api/auth/logout` | User logout | Not required |

---

## 🎯 Security Best Practices

### Production Configuration

1. **Use HTTPS** in production:
   ```bash
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Update Authorized Domains**:
   - Google Cloud Console: Add your production domain
   - reCAPTCHA Admin: Add your production domain

3. **Secure Environment Variables**:
   - Never commit `.env` files to git
   - Use environment variable management service
   - Rotate secrets regularly

4. **reCAPTCHA Score Threshold**:
   - Adjust in `/server/auth-service/middleware/recaptcha.js`
   - Increase for stricter security (0.7 or 0.8)
   - Monitor false positives

5. **Session Security**:
   ```bash
   SESSION_SECRET=use-very-long-random-string-64-chars-minimum
   ```

---

## ✅ Verification Checklist

### Google OAuth Setup
- [ ] Google Cloud project created
- [ ] OAuth credentials created
- [ ] Redirect URIs configured correctly
- [ ] **Test users added to OAuth consent screen** ⚠️ (IMPORTANT!)
- [ ] Client ID and Secret added to `.env` files
- [ ] Backend restarted after configuration
- [ ] Test login with Google account (using test user email)
- [ ] Test signup with Google account (using test user email)
- [ ] Verify user created in MongoDB

### reCAPTCHA v3 Setup
- [ ] Site registered at reCAPTCHA Admin
- [ ] Site key added to frontend `.env`
- [ ] Secret key added to backend `.env`
- [ ] Backend restarted after configuration
- [ ] reCAPTCHA badge visible on pages
- [ ] Console shows reCAPTCHA verification logs
- [ ] Test login with valid score
- [ ] Verify score is logged in backend

---

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [React reCAPTCHA v3](https://www.npmjs.com/package/react-google-recaptcha-v3)

---

## 🎉 Success!

If you can:
- ✅ Sign in with Google and reach your dashboard
- ✅ Sign up with Google and complete registration
- ✅ See reCAPTCHA verification logs in backend
- ✅ Login/Signup works with good reCAPTCHA scores

Then your integration is complete! 🚀

---

## 💡 Development Tips

### Skip reCAPTCHA in Development

The middleware automatically skips reCAPTCHA in development if there's an error:

```javascript
if (process.env.NODE_ENV === 'development') {
  console.warn('⚠️ reCAPTCHA error in development, allowing request');
  return next();
}
```

### Test Different reCAPTCHA Scenarios

1. **High Score (Human)**: Normal browsing
2. **Low Score (Bot)**: Rapid form submissions
3. **No Token**: Disable JavaScript

### Monitor reCAPTCHA Analytics

Visit [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) to see:
- Request volume
- Score distribution
- Challenge attempts

---

**Need Help?** Check the logs:
- Backend: Look for `✅ reCAPTCHA verified` messages
- Frontend: Check browser console for errors
- Network: Inspect API request/response in DevTools
