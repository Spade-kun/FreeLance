# 🚀 Quick Reference: Google OAuth & reCAPTCHA v3

## ⚡ Quick Setup (3 Steps)

### 1. Get Google Credentials

**Google OAuth:**
- Go to: https://console.cloud.google.com/
- Create project → Enable Google+ API → Create OAuth Client ID
- Copy: Client ID + Client Secret

**reCAPTCHA v3:**
- Go to: https://www.google.com/recaptcha/admin
- Register site → Select v3 → Add localhost
- Copy: Site Key + Secret Key

### 2. Update Environment Files

**Backend** (`server/auth-service/.env`):
```bash
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_secret_here
RECAPTCHA_SECRET_KEY=paste_your_secret_key_here
```

**Frontend** (`client/.env`):
```bash
VITE_GOOGLE_CLIENT_ID=paste_your_client_id_here
VITE_RECAPTCHA_SITE_KEY=paste_your_site_key_here
```

### 3. Restart Services

```bash
# Kill auth service
lsof -ti:1002 | xargs kill -9

# Restart
cd server/auth-service
node server.js &

# Frontend should auto-reload
```

---

## 🔑 Where to Get Keys

| Service | Dashboard URL | What You Need |
|---------|--------------|---------------|
| **Google OAuth** | https://console.cloud.google.com/ | Client ID + Client Secret |
| **reCAPTCHA v3** | https://www.google.com/recaptcha/admin | Site Key + Secret Key |

---

## 📝 Environment Variables Reference

### Backend (.env)
```bash
# Required for Google OAuth
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:1002/api/auth/google/callback
FRONTEND_URL=http://localhost:5173

# Required for reCAPTCHA
RECAPTCHA_SECRET_KEY=6Lc...xxxxx

# Optional (already set)
SESSION_SECRET=your_secret
```

### Frontend (.env)
```bash
# Required for Google OAuth
VITE_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com

# Required for reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=6Lc...xxxxx

# Already set
VITE_API_URL=http://localhost:1001/api
```

---

## 🧪 Testing Steps

### Without Real Credentials (Development):
```bash
# 1. Start services
cd server && ./start-all.sh
cd client && npm run dev

# 2. Open http://localhost:5173/login
# 3. Try standard login (works without OAuth/reCAPTCHA)
# ⚠️ Google button appears but won't work
# ⚠️ reCAPTCHA will show warnings but allow login
```

### With Real Credentials:
```bash
# 1. Add credentials to .env files
# 2. Restart auth service
# 3. Open http://localhost:5173/login
# 4. Click "Sign in with Google"
# ✅ Should work perfectly
# ✅ reCAPTCHA verifies silently
```

---

## 🎯 What Works NOW vs What Needs Credentials

### ✅ Works Without Credentials:
- Standard email/password login
- Standard email/password signup  
- Protected routes
- JWT authentication
- All dashboards (admin/instructor/student)

### ⚠️ Needs Credentials to Work:
- Google Sign-In button (shows but doesn't work)
- reCAPTCHA verification (bypassed in development)

### 🚀 Works With Credentials:
- One-click Google login
- Automatic bot protection
- Invisible CAPTCHA
- Enhanced security

---

## 🔧 Troubleshooting Quick Fixes

### "Google Sign-In not working"
```bash
# 1. Check credentials are correct
grep GOOGLE_CLIENT_ID server/auth-service/.env
grep VITE_GOOGLE_CLIENT_ID client/.env

# 2. Restart auth service
lsof -ti:1002 | xargs kill -9
cd server/auth-service && node server.js &

# 3. Clear browser cache and try again
```

### "reCAPTCHA not verifying"
```bash
# 1. Check secret key
grep RECAPTCHA_SECRET_KEY server/auth-service/.env
grep VITE_RECAPTCHA_SITE_KEY client/.env

# 2. Check backend logs
# Should see: ✅ reCAPTCHA verified: action=login, score=0.9

# 3. Check browser console
# Should see: reCAPTCHA loaded successfully
```

### "Redirect URI mismatch"
```bash
# Add to Google Console > Credentials > OAuth Client ID:
http://localhost:1002/api/auth/google/callback
http://localhost:5173/auth/callback
```

---

## 📊 Feature Status

| Feature | Status | Requires Credentials |
|---------|--------|---------------------|
| Email/Password Login | ✅ Working | No |
| Email/Password Signup | ✅ Working | No |
| Google OAuth Login | ⚠️ Needs Setup | Yes |
| Google OAuth Signup | ⚠️ Needs Setup | Yes |
| reCAPTCHA Protection | ⚠️ Optional | Yes |
| Protected Routes | ✅ Working | No |
| JWT Authentication | ✅ Working | No |

---

## 🎨 UI Preview

### Login Page Changes:
- ✅ New "Sign in with Google" button
- ✅ OR divider between methods
- ✅ Same look and feel
- ✅ reCAPTCHA badge (bottom-right corner)

### Signup Page Changes:
- ✅ New "Sign up with Google" button
- ✅ OR divider between methods
- ✅ All existing fields remain
- ✅ reCAPTCHA badge (bottom-right corner)

---

## 🔐 Security Checklist

### Development (Current):
- [x] HTTPS: Not required
- [x] Real credentials: Optional
- [x] reCAPTCHA: Bypassed on error
- [x] OAuth: Shows warnings
- [x] Localhost: Allowed

### Production (When Deploying):
- [ ] HTTPS: **Required**
- [ ] Real credentials: **Required**
- [ ] reCAPTCHA: Enforced
- [ ] OAuth: Strict validation
- [ ] Production domain: Added to Google Console

---

## 📞 Need Help?

### Documentation:
1. **Full Setup**: `GOOGLE_AUTH_RECAPTCHA_SETUP.md`
2. **Summary**: `OAUTH_RECAPTCHA_SUMMARY.md`
3. **This Card**: `QUICK_REFERENCE.md`

### Check Logs:
```bash
# Backend (should see):
# 🔐 Auth Service running on port 1002
# MongoDB connected successfully
# ✅ reCAPTCHA verified: action=login, score=0.9

# Frontend (browser console should see):
# reCAPTCHA loaded successfully
# Login successful
```

### Verify Installation:
```bash
# Backend packages
cd server/auth-service
npm list passport passport-google-oauth20 axios

# Frontend packages
cd client
npm list @react-oauth/google react-google-recaptcha-v3
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Auth service starts on port 1002
2. ✅ Frontend loads at http://localhost:5173
3. ✅ Google Sign-In button visible on login page
4. ✅ No console errors
5. ✅ Standard login works fine
6. ✅ (With credentials) Google login works
7. ✅ (With credentials) reCAPTCHA verifies silently

---

## 🎯 Priority Actions

### To Use Standard Login (Now):
✅ Nothing needed - already working!

### To Enable Google OAuth:
1. Get Google OAuth credentials (10 minutes)
2. Add to `.env` files
3. Restart auth service
4. Test login

### To Enable reCAPTCHA:
1. Get reCAPTCHA keys (5 minutes)
2. Add to `.env` files
3. Restart auth service
4. Test login/signup

---

## 💡 Pro Tips

1. **Test Standard Login First**: Make sure basic auth works
2. **One Feature at a Time**: Setup OAuth, test. Then reCAPTCHA, test.
3. **Check Console**: Frontend and backend logs are your friends
4. **Use Test Account**: Don't use your main Google account for testing
5. **Incognito Mode**: Good for testing fresh sessions

---

## 🚀 Current Status

**System Status**: ✅ Fully Implemented

**Running Services**:
- ✅ Auth Service (port 1002) - with OAuth & reCAPTCHA
- ✅ Frontend (port 5173) - with Google Sign-In buttons
- ✅ MongoDB - Connected
- ✅ API Gateway (port 1001) - Running

**Next Steps**:
1. Get credentials from Google
2. Update `.env` files  
3. Test Google Sign-In
4. Enjoy enhanced security! 🎉

---

**Everything is ready to go! Just add your Google credentials when you're ready to test.** 🚀
