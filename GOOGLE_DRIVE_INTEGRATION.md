# Google Drive Integration Setup Guide

This document explains how to set up Google Drive integration for file uploads in the LMS Activities and Assignments feature.

## Overview

The LMS now integrates with Google Drive to store student assignment submissions. Files are uploaded to a dedicated Google Drive folder and can be viewed/downloaded by students and instructors.

## Features

✅ Upload files up to 50MB to Google Drive
✅ Supported file types: PDF, Word, Excel, PowerPoint, Images, Archives
✅ Automatic organization in "LMS_Submissions" folder
✅ File metadata tracking (student ID, activity ID, upload date)
✅ View and download files from Google Drive
✅ Secure file access with permissions

## Google Drive API Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "LMS-FileUpload" (or your preferred name)
4. Click "Create"

### Step 2: Enable Google Drive API

1. In the Google Cloud Console, navigate to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### Step 3: Create Credentials

#### Option A: Using Service Account (Recommended for Production)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter service account details:
   - Name: `lms-drive-service`
   - Description: "Service account for LMS file uploads"
4. Click "Create and Continue"
5. Grant role: "Editor" or "Storage Admin"
6. Click "Done"
7. Click on the created service account
8. Go to "Keys" tab → "Add Key" → "Create new key"
9. Choose "JSON" and click "Create"
10. Save the downloaded JSON file securely

#### Option B: Using API Key (Simpler, for Development)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Restrict Key" (recommended):
   - API restrictions: Select "Google Drive API"
   - Save

### Step 4: Configure OAuth Consent Screen (if using OAuth)

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (or "Internal" if G Suite)
3. Fill in required information:
   - App name: "LMS File Upload"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.file`
5. Save

### Step 5: Create OAuth 2.0 Client ID (if using OAuth)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:1006/api/auth/google/callback`
   - Add production URLs when deploying
5. Click "Create"
6. Copy Client ID and Client Secret

## Environment Configuration

### Backend Configuration

Add these variables to `/server/assessment-service/.env`:

```env
# Google Drive API Configuration

# Option A: Using API Key (Development)
GOOGLE_API_KEY=your_api_key_here

# Option B: Using OAuth 2.0 (Production)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:1006/api/auth/google/callback

# Option C: Using Service Account (Best for Production)
GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
```

### Service Account Setup (Recommended)

If using a service account:

1. Place the downloaded JSON key file in a secure location:
   ```
   /server/assessment-service/config/google-service-account.json
   ```

2. Update `.env`:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY=./config/google-service-account.json
   ```

3. Add to `.gitignore`:
   ```
   config/google-service-account.json
   ```

## Installation

Install required dependencies:

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service
npm install googleapis
```

## Usage

### For Students

1. Navigate to "Activities" page
2. Click "Submit" on an activity
3. Enter submission text
4. Click "📎 Attach File to Google Drive"
5. Select a file (max 50MB)
6. Click "✓ Submit to Google Drive"
7. File is automatically uploaded to Google Drive
8. View or download submitted files anytime

### For Instructors

1. Navigate to "Assessment & Grading" page
2. Click "View Submissions" on an activity
3. See all student submissions with attached files
4. Click "View" to open file in Google Drive
5. Click "Download" to download the file
6. Grade submissions with file context

## File Organization

Files are organized in Google Drive as follows:

```
Google Drive
└── LMS_Submissions/
    ├── studentId_activityId_timestamp_filename.pdf
    ├── studentId_activityId_timestamp_filename.docx
    └── ...
```

Each file includes metadata:
- Student ID
- Activity ID
- Submission ID
- Upload timestamp
- Description

## Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT
- **Spreadsheets**: XLS, XLSX
- **Presentations**: PPT, PPTX
- **Images**: JPG, JPEG, PNG, GIF
- **Archives**: ZIP, RAR

Maximum file size: **50MB**

## Security Features

✅ Files are stored in a dedicated LMS folder
✅ Automatic file permission management
✅ Files are readable only with the link
✅ Metadata tracking for audit trails
✅ File type validation
✅ File size limits

## Troubleshooting

### Error: "Authentication failed"

- Check that API key or credentials are correct
- Verify Google Drive API is enabled
- Check OAuth consent screen configuration

### Error: "Quota exceeded"

- Google Drive API has daily quotas
- Check quota usage in Google Cloud Console
- Request quota increase if needed

### Error: "File upload failed"

- Check file size (max 50MB)
- Verify file type is supported
- Check network connection
- Review server logs for details

### Error: "Permission denied"

- Check service account permissions
- Verify API key restrictions
- Ensure OAuth scopes are correct

## API Endpoints

### Upload File
```
POST /api/assessments/upload
Content-Type: multipart/form-data

Body:
- file: File (required)
- studentId: String (required)
- activityId: String (required)
- submissionId: String (optional)
```

### Delete File
```
DELETE /api/assessments/files/:fileId
```

### Download File
```
GET /api/assessments/files/:fileId/download
```

## Production Deployment

When deploying to production:

1. Use service account authentication (most secure)
2. Store service account key securely (not in code)
3. Update redirect URIs with production URLs
4. Enable quota monitoring and alerts
5. Implement proper error handling
6. Add file virus scanning (recommended)
7. Set up backup strategy for files

## Migration Notes

If you have existing file submissions:

1. Files are backward compatible
2. Old submissions without files will still work
3. New submissions will automatically use Google Drive
4. No data migration required

## Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Service Account Authentication](https://developers.google.com/identity/protocols/oauth2/service-account)

## Support

For issues or questions:
1. Check server logs: `/server/assessment-service/logs`
2. Review browser console for frontend errors
3. Verify API credentials are correctly configured
4. Test with smaller files first

---

**Note**: Remember to keep your API keys and service account credentials secure. Never commit them to version control!
