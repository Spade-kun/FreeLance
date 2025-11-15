# Google Drive Setup - Quick Start Guide

## Problem
Files are not being uploaded to Google Drive because the API authentication is not configured.

## Solution

You have two options to fix this:

### Option 1: Use Existing Google OAuth (Recommended - Easiest)

Since you already have Google OAuth credentials configured, we just need to get a refresh token.

#### Steps:

1. **First, update your Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - Select your project
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable" (if not already enabled)

2. **Add redirect URI:**
   - Go to "APIs & Services" → "Credentials"
   - Click on your OAuth 2.0 Client ID
   - Under "Authorized redirect URIs", add:
     ```
     http://localhost:3001/oauth2callback
     ```
   - Click "Save"

3. **Run the token generator script:**
   ```bash
   cd /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service
   node scripts/get-google-token.js
   ```

4. **Follow the instructions:**
   - Copy the URL that appears in the terminal
   - Paste it in your browser
   - Sign in with your Google account
   - Grant permissions
   - Copy the refresh token that appears
   
5. **Add the token to .env:**
   Open `/server/assessment-service/.env` and update:
   ```env
   GOOGLE_REFRESH_TOKEN=paste_your_token_here
   ```

6. **Restart the services:**
   ```bash
   cd /home/spade/Public/Repository/MERN_FREELANCE/server
   ./stop-all.sh && sleep 2 && ./start-all.sh
   ```

7. **Test it:**
   - Login as a student
   - Go to Activities page
   - Submit an assignment with a file
   - File should now upload to Google Drive!

---

### Option 2: Use Service Account (For Production)

This is more secure for production but requires more setup.

#### Steps:

1. **Create a Service Account:**
   - Go to: https://console.cloud.google.com/
   - Select your project
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `lms-drive-service`
   - Role: "Editor" or "Storage Admin"
   - Click "Done"

2. **Create and download the key:**
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Click "Create"
   - Save the downloaded file

3. **Place the key file:**
   ```bash
   # Move the downloaded JSON file to:
   /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service/config/google-service-account.json
   ```

4. **Update .env:**
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY=./config/google-service-account.json
   ```

5. **Restart services** and test

---

## Verification

After setup, check the logs:
```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
tail -f logs/assessment-service.log | grep "Google"
```

You should see:
```
✅ Google Drive Service initialized with OAuth2
```
or
```
✅ Google Drive Service initialized with Service Account
```

If you see:
```
⚠️  Google Drive API not properly configured!
```
Then the authentication is not set up correctly.

---

## Testing

1. Login as student
2. Go to Activities page
3. Click Submit on any activity
4. Add text and select a file
5. Click "Submit to Google Drive"
6. Check your Google Drive for "LMS_Submissions" folder
7. Your file should be there!

---

## Troubleshooting

### "Google Drive not configured" error
- Make sure you completed all steps above
- Check that GOOGLE_REFRESH_TOKEN is in .env
- Restart the services

### "No refresh token received"
- You've already authorized this app before
- Go to: https://myaccount.google.com/permissions
- Find your LMS app and revoke access
- Run the token script again

### "Permission denied"
- Make sure Google Drive API is enabled
- Check that OAuth consent screen is configured
- Verify the scopes include drive.file

### Files still not uploading
- Check browser console for errors
- Check server logs: `tail -f logs/assessment-service.log`
- Make sure file is under 50MB
- Try with a PDF file first

---

## Quick Commands

```bash
# Get refresh token
cd /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service
node scripts/get-google-token.js

# Restart services
cd /home/spade/Public/Repository/MERN_FREELANCE/server
./stop-all.sh && sleep 2 && ./start-all.sh

# Check logs
tail -f logs/assessment-service.log | grep -i "google\|drive\|upload"

# Test from client
cd /home/spade/Public/Repository/MERN_FREELANCE/client
npm run dev
```

---

## Important Notes

- The refresh token is sensitive - keep it secure
- Don't commit the service account JSON to git
- Use .env.example for sharing configuration templates
- Test with small files first
- Check Google Drive quotas if uploads fail

---

**Next Steps:**
Run the token generator script now to get your refresh token!
