# Google Drive OAuth2 Setup Guide

## Problem
Service accounts don't have storage quota, so we need to use OAuth2 to authenticate as a regular Google user.

## Solution: OAuth2 Authentication

### Step 1: Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `lms-auth-478213`
3. Go to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Choose **Web application**
6. Set name: `LMS File Upload`
7. Add Authorized redirect URIs:
   ```
   http://localhost:1006/api/assessments/oauth2callback
   ```
8. Click **Create**
9. **COPY** the Client ID and Client Secret

### Step 2: Update .env File

Open `/server/assessment-service/.env` and add:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:1006/api/assessments/oauth2callback
```

### Step 3: Generate Refresh Token

1. Make sure assessment service is running:
   ```bash
   npm start
   ```

2. Visit this URL in your browser:
   ```
   http://localhost:1006/api/assessments/auth/google
   ```

3. You'll get a JSON response with `authUrl`. **Copy the URL** and paste it in your browser

4. Sign in with your **personal Google account** (the one that owns the Drive folder)

5. Grant permissions to access Google Drive

6. You'll be redirected back and see your **refresh token**

7. **Copy the refresh token** and add it to `.env`:
   ```env
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

8. Restart the assessment service:
   ```bash
   npm start
   ```

### Step 4: Test Upload

Submit a file through the student dashboard. It should now upload to both:
- Local storage (`uploads/` folder)
- Google Drive (folder ID: `13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x`)

## Quick Commands

```bash
# Get authorization URL
curl http://localhost:1006/api/assessments/auth/google

# Check if service is running
curl http://localhost:1006/health

# Test file upload
curl -X POST http://localhost:1006/api/assessments/files/upload \
  -F "file=@test.pdf" \
  -F "studentId=12345" \
  -F "activityId=67890"
```

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that the redirect URI in Google Cloud Console matches exactly: `http://localhost:1006/api/assessments/oauth2callback`

### Error: "invalid_client"
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct in .env

### Error: "invalid_grant"
- Your refresh token may have expired. Generate a new one by repeating Step 3

### Files not appearing in Drive
- Check that your Google account has access to folder `13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x`
- Make sure GOOGLE_REFRESH_TOKEN is set correctly

## How It Works

1. **OAuth2 Flow**: User authenticates once and grants permission
2. **Refresh Token**: Stored in .env, used to get new access tokens automatically
3. **Dual Storage**: Files saved locally AND to Google Drive
4. **User's Storage**: Files use YOUR Google Drive quota (15GB free)

## Security Notes

- ⚠️ Never commit `.env` file to git (already in .gitignore)
- ⚠️ Keep refresh token secret
- ✅ Refresh tokens don't expire unless revoked
- ✅ Access tokens auto-refresh using the refresh token
