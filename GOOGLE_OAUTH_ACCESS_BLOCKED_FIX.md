# 🔓 Fix: "Access blocked: Authorization Error"

## Problem

When clicking the Google Sign-In button, you see:

```
Access blocked: Authorization Error
Error 403: access_denied

The developer hasn't given you access to this app.
```

## Why This Happens

Your Google OAuth app is in **Testing mode** (not published), which means:
- ✅ Only users explicitly added as "test users" can sign in
- ❌ Any other Google account will be blocked

This is a **security feature** by Google to prevent unauthorized access during development.

---

## ✅ Quick Fix (5 Steps)

### Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (e.g., "LMS Authentication")

### Step 2: Navigate to OAuth Consent Screen
1. Click **"APIs & Services"** in the left menu
2. Click **"OAuth consent screen"**

### Step 3: Add Test Users
1. Scroll down to the **"Test users"** section
2. Click **"+ ADD USERS"** button
3. Enter your Gmail address (the one you want to sign in with)
   - Example: `your.email@gmail.com`
4. Click **"Save"**

### Step 4: Verify Test User Added
You should see your email listed under "Test users":
```
📧 your.email@gmail.com    [Remove]
```

### Step 5: Test Again
1. Go back to your app: `http://localhost:5174/login`
2. Click **"Sign in with Google"**
3. Select your Google account
4. ✅ Should work now!

---

## 📋 Visual Guide

```
Google Cloud Console
    ↓
APIs & Services
    ↓
OAuth consent screen
    ↓
Test users section
    ↓
[+ ADD USERS] ← Click this
    ↓
Enter your Gmail address
    ↓
Save
    ↓
✅ Done!
```

---

## 🔍 Verify Your Setup

### Check Test Users
```
Google Cloud Console → OAuth consent screen → Test users

Should show:
✅ your.email@gmail.com
✅ any.other.test.user@gmail.com
```

### Publishing Status
```
OAuth consent screen → Publishing status

Should show:
🧪 Testing (Recommended for development)
   Only test users can access this app

OR

🚀 In production (Requires verification)
   Anyone with a Google account can access
```

---

## 🎯 Common Scenarios

### Scenario 1: Multiple Developers
**Problem**: Other team members can't sign in

**Solution**: Add all developers as test users
```
Test users:
✅ developer1@gmail.com
✅ developer2@gmail.com  
✅ developer3@gmail.com
```

### Scenario 2: Testing with Different Accounts
**Problem**: Want to test with multiple Gmail accounts

**Solution**: Add all test accounts
```
Test users:
✅ personal.email@gmail.com
✅ work.email@gmail.com
✅ test.account@gmail.com
```

### Scenario 3: Client Testing
**Problem**: Client wants to test but gets access blocked

**Solution**: Add client's Gmail to test users
```
Test users:
✅ your.email@gmail.com
✅ client.email@gmail.com
```

---

## 🚫 Alternative: Publish App (Not Recommended for Dev)

If you want **anyone** to sign in without adding them as test users:

### Steps to Publish:
1. Go to **OAuth consent screen**
2. Click **"PUBLISH APP"** button
3. Confirm publishing

### ⚠️ Important Notes:
- **Verification Required**: Google may require verification for sensitive scopes
- **Review Process**: Can take days or weeks
- **Not Recommended for Development**: Use test users instead
- **Use for Production Only**: When app is ready for public use

### Scopes That Require Verification:
- Most apps using just `email`, `profile`, `openid` don't need verification
- But publishing makes your app publicly accessible

---

## 🔒 Security Best Practices

### During Development (Testing Mode)
✅ Keep app in **Testing mode**
✅ Only add necessary test users
✅ Remove test users when no longer needed
✅ Use test users for development/staging

### For Production (Published Mode)
✅ Complete Google's verification process if required
✅ Implement proper user authentication
✅ Monitor OAuth usage
✅ Have privacy policy and terms of service

---

## 🧪 Test Your Fix

After adding yourself as a test user:

1. **Clear Browser Data** (optional but recommended):
   - Press `Ctrl+Shift+Delete`
   - Clear cookies and cached data for last hour
   
2. **Go to Login Page**:
   ```
   http://localhost:5174/login
   ```

3. **Click "Sign in with Google"**:
   - Should open Google OAuth popup
   - Select your account (the one you added as test user)
   
4. **Expected Result**:
   - ✅ No "Access blocked" error
   - ✅ Google asks for permission (first time only)
   - ✅ Redirects back to your app
   - ✅ You're logged in!

---

## 📊 Debugging Checklist

If still not working after adding test user:

- [ ] Gmail address is correctly spelled in test users
- [ ] Using the exact same Gmail account that's added as test user
- [ ] Cleared browser cache/cookies
- [ ] OAuth Client ID matches in both `.env` files
- [ ] Backend services are running (`./check-services.sh`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Check browser console for errors (F12)
- [ ] Check backend logs: `tail -f server/logs/auth-service.log`

---

## 📚 Related Issues

### If you see different errors:

- **"redirect_uri_mismatch"** → See main setup guide
- **"invalid_client"** → Check Client ID and Secret in `.env`
- **"Route not found"** → Check API Gateway configuration
- **reCAPTCHA fails** → Check reCAPTCHA keys in `.env`

See main documentation: `/GOOGLE_AUTH_RECAPTCHA_SETUP.md`

---

## ✅ Status After Fix

After adding test users:
- ✅ You can sign in with Google
- ✅ Test users can sign in with Google
- ✅ Other accounts still blocked (by design)
- ✅ App remains in safe testing mode

---

## 🎉 Success!

You should now be able to:
1. Click "Sign in with Google"
2. See Google's consent screen
3. Grant permissions
4. Get redirected back to your app
5. Be logged in successfully!

**Date Created:** November 14, 2025
**Issue:** Access blocked: Authorization Error
**Solution:** Add test users to OAuth consent screen
