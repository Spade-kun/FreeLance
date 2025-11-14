# 🔑 Fix: "OAuth client was not found" - Error 401: invalid_client

## Problem

When clicking "Sign in with Google", you see:
```
Access blocked: Authorization Error
The OAuth client was not found.
Error 401: invalid_client
```

## Why This Happens

This error means Google cannot find or validate your OAuth credentials because:
1. ❌ **Client ID doesn't exist** - The OAuth client was deleted or never created
2. ❌ **Incorrect credentials** - Wrong Client ID or Secret in `.env` files
3. ❌ **Typo/formatting issue** - Extra spaces, quotes, or line breaks
4. ❌ **Wrong Google Project** - Credentials from different project

---

## ✅ Solution: Create/Regenerate OAuth Credentials

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project** (or create a new one if needed)
   - If no project exists, click **"Select a project"** → **"New Project"**
   - Name: `LMS Authentication`
   - Click **"Create"**

### Step 2: Enable Google+ API (Required)

1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google People API"**
3. Click **"Enable"**
4. Wait for confirmation

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **User Type**:
   - Select **"External"** (for testing with any Gmail)
   - Click **"Create"**

3. **Fill in App Information**:
   ```
   App name: LMS Application
   User support email: your.email@gmail.com
   Developer contact: your.email@gmail.com
   ```

4. **Add Scopes**:
   - Click **"Add or Remove Scopes"**
   - Check these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **"Update"** → **"Save and Continue"**

5. **Add Test Users** (IMPORTANT!):
   - Click **"+ ADD USERS"**
   - Enter your Gmail address: `your.email@gmail.com`
   - Click **"Add"** → **"Save and Continue"**

6. **Summary**:
   - Review everything
   - Click **"Back to Dashboard"**

### Step 4: Create OAuth Client ID

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

3. **Configure the OAuth client**:
   ```
   Application type: Web application
   Name: LMS Web Client
   ```

4. **Add Authorized JavaScript origins**:
   Click **"+ ADD URI"** for each:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:1001
   http://localhost:1002
   ```

5. **Add Authorized redirect URIs**:
   Click **"+ ADD URI"** for each:
   ```
   http://localhost:1002/api/auth/google/callback
   http://localhost:5173/auth/callback
   ```

6. Click **"CREATE"**

### Step 5: Copy Credentials

A popup will appear with your credentials:

```
Your Client ID
706284845222-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

Your Client Secret  
GOCSPX-xxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT**: 
- Click the **copy icon** next to each credential
- Save them temporarily in a notepad
- Keep this window open while you update your `.env` files

---

## 📝 Update Configuration Files

### Backend Configuration

1. **Edit**: `/server/auth-service/.env`

2. **Update these lines** (replace with YOUR new credentials):
   ```bash
   # Google OAuth
   GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=http://localhost:1002/api/auth/google/callback
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

3. **Save the file**

### Frontend Configuration

1. **Edit**: `/client/.env`

2. **Update this line** (use same Client ID as backend):
   ```bash
   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com
   ```

3. **Save the file**

---

## 🔄 Restart Services

### Backend

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server

# Stop all services
./stop-all.sh

# Start all services
./start-all.sh

# Verify they're running
./check-services.sh
```

### Frontend

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/client

# Stop the dev server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

---

## 🧪 Test Your Configuration

### 1. Test Backend OAuth Endpoint

```bash
curl -I http://localhost:1001/api/auth/google
```

**Expected**: Should return `302 Found` redirect

### 2. Test in Browser

1. Go to: `http://localhost:5173/login` (or 5174)
2. Click **"Sign in with Google"**
3. Should open Google OAuth popup
4. Select your Gmail account (must be added as test user)
5. Should show consent screen
6. After accepting, should redirect back to app

### 3. Check Logs

If issues occur, check the logs:

```bash
# Backend logs
tail -f server/logs/auth-service.log

# Look for:
# ✅ Good: "🔐 Auth Service running on port 1002"
# ❌ Bad: Error messages about OAuth
```

---

## 🔍 Verification Checklist

Before testing, verify:

- [ ] Google Cloud project is selected
- [ ] Google+ API is enabled
- [ ] OAuth consent screen is configured
- [ ] **Test users added** (your Gmail address)
- [ ] OAuth Client ID created
- [ ] Authorized JavaScript origins include all ports
- [ ] Authorized redirect URIs include callback URL
- [ ] Client ID copied correctly (no spaces/line breaks)
- [ ] Client Secret copied correctly (no spaces/line breaks)
- [ ] Backend `.env` updated with new credentials
- [ ] Frontend `.env` updated with new Client ID
- [ ] Both `.env` files saved
- [ ] Backend services restarted
- [ ] Frontend dev server restarted

---

## 🚨 Common Mistakes

### 1. Wrong Project Selected
**Problem**: Credentials from Project A, but console showing Project B

**Solution**: Always check project name in top bar of Google Cloud Console

### 2. Copy/Paste Issues
**Problem**: Extra spaces, quotes, or line breaks in credentials

**Solution**: 
```bash
# ❌ Wrong - has quotes
GOOGLE_CLIENT_ID="123456.apps.googleusercontent.com"

# ❌ Wrong - has spaces
GOOGLE_CLIENT_ID= 123456.apps.googleusercontent.com

# ✅ Correct
GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
```

### 3. Forgot to Restart Services
**Problem**: Changed `.env` but services still using old credentials

**Solution**: Always restart after changing `.env`:
```bash
./stop-all.sh && ./start-all.sh
```

### 4. Frontend Cache
**Problem**: Frontend using cached credentials

**Solution**: 
- Hard refresh: `Ctrl+Shift+R` (Linux/Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache

### 5. Forgot Test Users
**Problem**: Credentials work but still get "Access blocked"

**Solution**: Add your Gmail to test users (see Step 3.5 above)

---

## 📋 Correct `.env` Format

### Backend: `/server/auth-service/.env`

```bash
PORT=1002
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://your_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
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

# Google OAuth - REPLACE THESE!
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:1002/api/auth/google/callback

# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Session
SESSION_SECRET=use_a_very_long_random_string_here
```

### Frontend: `/client/.env`

```bash
# API Configuration
VITE_API_URL=http://localhost:1001/api

# Google OAuth - REPLACE THIS!
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com

# Google reCAPTCHA v3
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 🔐 Security Best Practices

### DO:
✅ Keep credentials in `.env` files (not committed to git)
✅ Use different credentials for dev/staging/production
✅ Rotate secrets regularly
✅ Add only necessary test users
✅ Use HTTPS in production

### DON'T:
❌ Commit `.env` files to version control
❌ Share credentials in Slack/email
❌ Use production credentials in development
❌ Publish app to production without verification
❌ Hard-code credentials in source files

---

## ⚠️ "The OAuth client was deleted" Error

If you see this error even after creating new credentials:

### Cause 1: Google Propagation Delay (MOST COMMON)
**Problem**: New credentials take 5-10 minutes to propagate in Google's systems

**Solution**: 
1. Wait 5-10 minutes after creating credentials
2. During this time, do NOT keep trying (it won't help)
3. Have a coffee ☕ and come back
4. Try again after the wait period

### Cause 2: Wrong Google Cloud Project
**Problem**: Created credentials in Project A, but your old credentials were from Project B

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Check the project name** in the top bar
3. Click project dropdown and verify you're in the correct project
4. Go to **"APIs & Services"** → **"Credentials"**
5. Verify you see your OAuth Client ID in the list
6. If not found, you're in the wrong project!

### Cause 3: Credentials Not Saved Properly
**Problem**: Credentials still showing old/deleted client

**Solution**:
1. **Double-check the Client ID** in Google Cloud Console:
   ```
   Go to: APIs & Services → Credentials
   Click on your OAuth Client ID
   Copy the Client ID shown at the top
   ```

2. **Compare with your .env file**:
   ```bash
   # In terminal
   cd /home/spade/Public/Repository/MERN_FREELANCE/server
   ./verify-oauth.sh
   ```
   
3. **If they don't match**, update `.env` and restart:
   ```bash
   # Edit both .env files with correct Client ID
   ./stop-all.sh
   ./start-all.sh
   ```

### Cause 4: Browser Cached Old Credentials
**Problem**: Browser is using cached OAuth session

**Solution**:
1. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete` (Linux/Windows)
   - Select "Cookies and other site data"
   - Select "Cached images and files"
   - Choose "Last hour"
   - Click "Clear data"

2. **Or use Incognito/Private mode**:
   - Open incognito window
   - Go to `http://localhost:5173/login`
   - Try Google login there

3. **Or try different browser**:
   - If using Chrome, try Firefox
   - Fresh browser = no cache

### Cause 5: OAuth Client Actually Deleted
**Problem**: The OAuth client was actually deleted from Google Cloud Console

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Look for your OAuth Client ID in the "OAuth 2.0 Client IDs" section
5. **If not found** → It was deleted, create a new one
6. **If found** → Click on it and verify the Client ID matches your `.env`

### Cause 6: Using Client ID from Frontend Request
**Problem**: Frontend is sending cached Client ID instead of using new one

**Solution**:
1. **Verify frontend .env**:
   ```bash
   cat /home/spade/Public/Repository/MERN_FREELANCE/client/.env
   ```
   
2. **Should show**:
   ```bash
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
   ```

3. **Restart frontend** (Vite doesn't always hot-reload .env changes):
   ```bash
   # Stop the dev server (Ctrl+C)
   cd /home/spade/Public/Repository/MERN_FREELANCE/client
   npm run dev
   ```

4. **Hard refresh** browser after restart:
   - `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

## 🆘 Still Not Working?

### Debug Steps:

1. **Verify credentials exist in Google Cloud Console**:
   - Go to Credentials page
   - Should see "LMS Web Client" in the list
   - Click on it to verify Client ID matches your `.env`

2. **Check for typos**:
   ```bash
   # Backend - print the actual values (remove after debugging)
   cd server/auth-service
   node -e "require('dotenv').config(); console.log('Client ID:', process.env.GOOGLE_CLIENT_ID); console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'EXISTS' : 'MISSING');"
   ```

3. **Test credentials manually**:
   - Try creating a simple test request to Google's OAuth endpoint
   - If it fails, credentials are definitely wrong

4. **Create new credentials**:
   - Delete the old OAuth client in Google Cloud Console
   - Create a completely new one
   - Update both `.env` files
   - Restart everything

5. **Check service status**:
   ```bash
   cd server
   ./check-services.sh
   
   # All should show "responding"
   ```

---

## 📚 Related Issues

- **"Access blocked: Authorization Error"** (without invalid_client) → Add test users
- **"redirect_uri_mismatch"** → Check Authorized redirect URIs
- **"Route not found"** → Check API Gateway configuration
- **reCAPTCHA fails** → Different issue, check reCAPTCHA setup

See main guide: `/GOOGLE_AUTH_RECAPTCHA_SETUP.md`

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ No errors in browser console
2. ✅ Google OAuth popup opens successfully
3. ✅ Can select Google account
4. ✅ See consent screen (first time only)
5. ✅ Redirects back to your app
6. ✅ Successfully logged in / redirected to dashboard
7. ✅ Backend logs show successful authentication

---

## 🎯 Quick Checklist

Use this to verify your setup:

```
Google Cloud Console:
  ✓ Project created/selected
  ✓ Google+ API enabled
  ✓ OAuth consent screen configured
  ✓ Test users added (your Gmail)
  ✓ OAuth Client ID created
  ✓ JavaScript origins: localhost:5173, :5174, :1001, :1002
  ✓ Redirect URIs: localhost:1002/api/auth/google/callback

Backend (.env):
  ✓ GOOGLE_CLIENT_ID = (copied from Google Console)
  ✓ GOOGLE_CLIENT_SECRET = (copied from Google Console)
  ✓ GOOGLE_CALLBACK_URL = http://localhost:1002/api/auth/google/callback
  ✓ FRONTEND_URL = http://localhost:5173

Frontend (.env):
  ✓ VITE_GOOGLE_CLIENT_ID = (same as backend)

Services:
  ✓ Backend services running (./check-services.sh)
  ✓ Frontend running (npm run dev)
  ✓ No errors in logs
```

---

**Date Created:** November 14, 2025  
**Issue:** OAuth client was not found - Error 401: invalid_client  
**Solution:** Create/regenerate OAuth credentials and update `.env` files
