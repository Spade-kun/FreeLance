# Google Drive OAuth Setup - Quick Start

## What Changed?

Switched from **Service Account** (no storage quota) to **OAuth2** (uses your personal Google Drive storage).

## Setup Steps (5 minutes)

### 1. Create OAuth Credentials

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=lms-auth-478213)

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `LMS File Upload`
4. Authorized redirect URIs: `http://localhost:1006/api/assessments/oauth2callback`
5. Click **Create**
6. **COPY** Client ID and Client Secret

### 2. Update .env File

Open: `/server/assessment-service/.env`

Add these lines (replace with your actual values):
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:1006/api/assessments/oauth2callback
```

### 3. Get Refresh Token

**Option A - Use HTML Helper:**
```bash
# Open this file in your browser:
open server/assessment-service/oauth-setup.html
```

**Option B - Manual:**
```bash
# 1. Get auth URL
curl http://localhost:1006/api/assessments/auth/google

# 2. Copy the authUrl from response and open in browser
# 3. Sign in with your Google account
# 4. Grant permissions
# 5. Copy the refresh token shown on the page
```

### 4. Add Refresh Token

Add to `.env`:
```env
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

### 5. Restart Service

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service
npm start
```

## Test It

1. Login as student
2. Go to an activity
3. Upload a file
4. Check that file appears in Google Drive folder: `13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x`

## Files Modified

✅ `fileController.js` - OAuth2 authentication
✅ `assessmentRoutes.js` - Added OAuth routes
✅ `.env` - OAuth credentials
✅ `OAUTH_SETUP_GUIDE.md` - Detailed guide
✅ `oauth-setup.html` - Helper page

## How It Works

1. **One-time setup**: Authorize with your Google account
2. **Refresh token**: Stored in .env, never expires (unless revoked)
3. **Automatic**: Access tokens auto-refresh
4. **Dual storage**: Files saved locally AND to Google Drive
5. **Your quota**: Uses your personal 15GB free storage

## Troubleshooting

**Service not starting?**
```bash
# Check logs
tail -f logs/assessment-service.log
```

**OAuth errors?**
- Make sure redirect URI matches exactly in Google Cloud Console
- Check Client ID and Secret are correct
- Generate new refresh token if needed

**Files not uploading to Drive?**
- Verify refresh token is set
- Check you have access to folder `13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x`
- Make sure you authorized with the correct Google account

## Need Help?

Check the detailed guide: `OAUTH_SETUP_GUIDE.md`
