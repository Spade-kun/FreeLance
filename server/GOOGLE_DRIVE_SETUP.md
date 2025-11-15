# Google Drive Integration Setup Guide

## Overview
This guide will help you set up Google Drive API for file uploads in the LMS Activities & Assignments feature.

## Prerequisites
- A Google Cloud Platform account
- Admin access to Google Cloud Console
- Node.js and npm installed

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name your project (e.g., "LMS File Storage")
4. Click "Create"

### 2. Enable Google Drive API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on "Google Drive API"
4. Click **Enable**

### 3. Create Service Account (Recommended Method)

#### Step 3.1: Create Service Account
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in details:
   - **Service account name**: `lms-drive-service`
   - **Service account ID**: (auto-generated)
   - **Description**: `Service account for LMS file uploads`
4. Click **Create and Continue**
5. Select role: **Project** → **Editor** (or create custom role with Drive access)
6. Click **Continue** → **Done**

#### Step 3.2: Create and Download Key
1. In the Service Accounts list, click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Click **Create**
6. A JSON file will be downloaded to your computer

#### Step 3.3: Configure Service Account
1. Rename the downloaded JSON file to: `lms-auth-service-account.json`
2. Move it to your assessment-service folder:
   ```
   /server/assessment-service/lms-auth-service-account.json
   ```
3. Update your `.env` file:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY=./lms-auth-service-account.json
   ```

#### Step 3.4: Important Security Note
⚠️ **Never commit the service account key to Git!**

Add to `.gitignore`:
```
# Google Service Account Keys
*service-account*.json
lms-auth-*.json
```

### 4. Alternative: OAuth2 Setup (For Personal Use)

If you prefer OAuth2 instead of Service Account:

#### Step 4.1: Create OAuth 2.0 Client ID
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `LMS File Upload`
   - User support email: Your email
   - Developer contact: Your email
4. For Application type, choose: **Web application**
5. Name: `LMS OAuth Client`
6. Authorized redirect URIs:
   ```
   http://localhost:1006/api/auth/google/callback
   ```
7. Click **Create**
8. Save the **Client ID** and **Client Secret**

#### Step 4.2: Get Refresh Token
Run this Node.js script once to get your refresh token:

```javascript
// get-refresh-token.js
import { google } from 'googleapis';
import readline from 'readline';

const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = 'http://localhost:1006/api/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', async (code) => {
  rl.close();
  const { tokens } = await oauth2Client.getToken(code);
  console.log('Your refresh token:', tokens.refresh_token);
});
```

Run: `node get-refresh-token.js`

#### Step 4.3: Configure OAuth2
Update your `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REFRESH_TOKEN=your-refresh-token-here
GOOGLE_REDIRECT_URI=http://localhost:1006/api/auth/google/callback
```

## Configuration

### Assessment Service .env File

Complete `.env` configuration:
```env
PORT=1006
NODE_ENV=development
MONGODB_URI=your-mongodb-uri

# Google Drive - Service Account (Recommended)
GOOGLE_SERVICE_ACCOUNT_KEY=./lms-auth-service-account.json

# OR Google Drive - OAuth2 (Alternative)
# GOOGLE_CLIENT_ID=your-client-id
# GOOGLE_CLIENT_SECRET=your-client-secret
# GOOGLE_REFRESH_TOKEN=your-refresh-token
# GOOGLE_REDIRECT_URI=http://localhost:1006/api/auth/google/callback
```

## Testing the Setup

### 1. Restart Assessment Service
```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
./stop-all.sh && sleep 2 && ./start-all.sh
```

### 2. Check Logs
```bash
tail -f logs/assessment-service.log
```

You should see:
```
✅ Google Drive Service initialized with Service Account
```

### 3. Test File Upload
1. Login as a student
2. Go to Activities page
3. Click "Submit" on any activity
4. Upload a file
5. Submit the activity

### 4. Verify in Google Drive
1. Go to [Google Drive](https://drive.google.com/)
2. Look for a folder named `LMS_Submissions`
3. Your uploaded files should be there

## File Upload API Endpoints

### Upload File
```
POST /api/assessments/files/upload
Content-Type: multipart/form-data

Fields:
- file: The file to upload (required)
- studentId: Student ID (required)
- activityId: Activity ID (required)
- submissionId: Submission ID (optional)
```

### Delete File
```
DELETE /api/assessments/files/:fileId
```

### Download File
```
GET /api/assessments/files/:fileId/download
```

## Supported File Types

- **Documents**: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text (.txt)
- **Images**: JPEG, PNG, GIF
- **Archives**: ZIP, RAR

**File Size Limit**: 50MB per file

## Troubleshooting

### Error: "Google Drive not configured"
- Check if the service account JSON file exists in the correct location
- Verify the file path in `.env` is correct
- Ensure the file has proper read permissions

### Error: "Error uploading file to Google Drive"
- Check if Google Drive API is enabled in Cloud Console
- Verify service account has proper permissions
- Check assessment-service logs for detailed error messages

### Error: "Invalid file type"
- Only allowed file types can be uploaded
- Check the file extension matches the allowed types
- Contact admin to add more file types if needed

### Files not appearing in Google Drive
- Check if the service account has Drive access
- Verify the folder creation was successful
- Check logs for permission errors

## Security Best Practices

1. **Never commit credentials to Git**
   - Add all credential files to `.gitignore`
   - Use environment variables for sensitive data

2. **Service Account Permissions**
   - Grant minimum required permissions
   - Use separate service accounts for dev/prod

3. **File Access Control**
   - Files are set to "anyone with link" can view
   - Consider implementing stricter access control for production

4. **Monitoring**
   - Monitor API usage in Google Cloud Console
   - Set up quota alerts
   - Review service account activity regularly

## Production Deployment

For production, consider:

1. **Use Google Cloud Storage** instead of Drive for better control and pricing
2. **Implement file scanning** for viruses/malware
3. **Set up CDN** for faster file delivery
4. **Use signed URLs** for temporary access
5. **Implement rate limiting** on upload endpoints
6. **Add file retention policies**

## Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [Google API Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

## Support

If you encounter issues:
1. Check the logs: `tail -f logs/assessment-service.log`
2. Verify your Google Cloud Console configuration
3. Test API access with the Google API playground
4. Review this documentation carefully

---

**Last Updated**: November 15, 2025
