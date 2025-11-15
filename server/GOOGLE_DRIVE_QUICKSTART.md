# Google Drive Integration - Quick Start

## ✅ What's Been Implemented

### Backend
- ✅ Google Drive service with Service Account & OAuth2 support
- ✅ File upload controller with multer
- ✅ File upload routes (`/api/assessments/files/*`)
- ✅ Enhanced Submission model with attachments
- ✅ Support for PDF, Word, Excel, PowerPoint, Images, ZIP (50MB max)

### Frontend
- ✅ File upload in student submission form
- ✅ Google Drive integration in API service
- ✅ File attachments display in grades view
- ✅ File type validation and size preview
- ✅ Direct file viewing via Google Drive links

## 🚀 Quick Setup (3 Steps)

### 1. Get Google Service Account Credentials

```bash
# Go to: https://console.cloud.google.com/
# 1. Create new project
# 2. Enable "Google Drive API"
# 3. Create Service Account
# 4. Download JSON key
# 5. Rename to: lms-auth-service-account.json
```

### 2. Configure Assessment Service

```bash
# Place the JSON file in:
cd /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service/

# Update .env file:
echo "GOOGLE_SERVICE_ACCOUNT_KEY=./lms-auth-service-account.json" >> .env
```

### 3. Restart Services

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
./stop-all.sh && sleep 2 && ./start-all.sh

# Verify in logs:
tail -f logs/assessment-service.log
# Should see: "✅ Google Drive Service initialized with Service Account"
```

## 🧪 Test It Now (Without Setup)

Even without Google Drive configured, you can test the interface:

1. **Login as student**
2. **Go to Activities page**
3. **Click Submit on any activity**
4. **Select a file (PDF, Word, etc.)**
5. **See file name and size displayed**
6. **Submit the activity**

**Note**: File won't actually upload to Drive until you complete setup, but the form works!

## 📁 File Structure

```
server/
├── assessment-service/
│   ├── .env                              # Add Google Drive config here
│   ├── lms-auth-service-account.json    # Place your JSON key here (DON'T COMMIT!)
│   ├── services/
│   │   └── googleDriveService.js         # ✅ Google Drive integration
│   ├── controllers/
│   │   └── fileController.js             # ✅ File upload handling
│   ├── routes/
│   │   └── assessmentRoutes.js           # ✅ Added file routes
│   └── models/
│       └── Submission.js                 # ✅ Enhanced with attachments
├── GOOGLE_DRIVE_SETUP.md                 # 📖 Detailed setup guide
└── GOOGLE_DRIVE_IMPLEMENTATION.md        # 📋 Full documentation

client/
└── src/
    ├── services/
    │   └── api.js                        # ✅ File upload API methods
    └── components/
        └── student/
            └── StudentDashboard.jsx      # ✅ Enhanced submission form
```

## 🎯 Key Features

### For Students
- 📤 **Upload files** directly from submission form
- 📎 **Multiple file types** supported
- 📊 **See file size** before uploading
- ✅ **Confirmation** when file selected
- 🔗 **Access submitted files** anytime from Grades page

### For Instructors  
- 👀 **View all submissions** with attachments
- 📥 **Download student files** directly
- 🔗 **Direct Google Drive** access
- 📊 **File info** (name, size, type) visible

### Technical
- 🔒 **Secure upload** to Google Drive
- 🚀 **50MB file limit**
- 📁 **Auto-organized** in LMS_Submissions folder
- 🔐 **Link-based access** control
- ♻️ **No local storage** needed

## 🛡️ Security

```javascript
// File Type Validation
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-rar-compressed'
];

// Size Limit: 50MB
// Authentication: JWT required
// Access: Anyone with link can view
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assessments/files/upload` | Upload file to Google Drive |
| DELETE | `/api/assessments/files/:fileId` | Delete file from Drive |
| GET | `/api/assessments/files/:fileId/download` | Download file |

## 🔍 Troubleshooting

### ❌ "Google Drive not configured"
```bash
# Check if JSON file exists:
ls -la /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service/*.json

# Check .env file:
cat /home/spade/Public/Repository/MERN_FREELANCE/server/assessment-service/.env | grep GOOGLE

# Restart service:
cd /home/spade/Public/Repository/MERN_FREELANCE/server && ./stop-all.sh && ./start-all.sh
```

### ❌ "Error uploading file"
```bash
# Check logs:
tail -f /home/spade/Public/Repository/MERN_FREELANCE/server/logs/assessment-service.log

# Verify Drive API is enabled in Google Cloud Console
# Check service account permissions
```

### ❌ "Invalid file type"
- Only allowed file types can be uploaded
- Check the list in the submission form
- File extension must match content type

## 📚 Documentation

- **Setup Guide**: [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)
- **Implementation Details**: [GOOGLE_DRIVE_IMPLEMENTATION.md](./GOOGLE_DRIVE_IMPLEMENTATION.md)
- **Google Drive API**: https://developers.google.com/drive/api/v3/about-sdk

## ⚡ Next Steps

1. **Complete Google Drive setup** (see GOOGLE_DRIVE_SETUP.md)
2. **Test file upload** with a student account
3. **Verify files** appear in Google Drive
4. **Test instructor view** of submissions
5. **Configure production** credentials

## 💡 Tips

- Start with Service Account (easiest for multi-user)
- Test with small files first (< 1MB)
- Check logs if something doesn't work
- Use incognito window to test as different users
- Keep service account key secure (never commit to Git!)

## 🎉 Success Indicators

When properly configured, you'll see:

1. In logs: `✅ Google Drive Service initialized with Service Account`
2. New folder in Drive: `LMS_Submissions`
3. Uploaded files with format: `studentId_activityId_timestamp_filename.ext`
4. Files have "anyone with link" permission
5. Clickable file links in student Grades page
6. Instructor can view all submission files

---

**Status**: ✅ Code Ready - Credentials Needed
**Setup Time**: ~15 minutes
**Difficulty**: Easy

**Ready to go?** → See [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md) for step-by-step setup!
