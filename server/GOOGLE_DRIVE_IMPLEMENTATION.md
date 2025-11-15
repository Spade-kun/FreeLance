# Google Drive Integration - Implementation Summary

## ✅ Completed Implementation

### Backend Implementation

#### 1. Google Drive Service (`assessment-service/services/googleDriveService.js`)
- **Service Account Authentication** (Recommended)
- **OAuth2 Authentication** (Alternative)
- **Auto-creates LMS_Submissions folder** in Google Drive
- **File Operations**:
  - Upload files from buffer or file path
  - Delete files
  - Download files
  - Get file metadata
- **MIME type detection** for various file formats
- **Graceful fallback** if Google Drive is not configured

#### 2. File Controller (`assessment-service/controllers/fileController.js`)
- **Multer configuration** for file uploads
  - Memory storage (no local disk usage)
  - 50MB file size limit
  - File type validation
- **Supported file types**:
  - Documents: PDF, Word, Excel, PowerPoint, Text
  - Images: JPEG, PNG, GIF
  - Archives: ZIP, RAR
- **API endpoints**:
  - `POST /api/assessments/files/upload` - Upload file
  - `DELETE /api/assessments/files/:fileId` - Delete file
  - `GET /api/assessments/files/:fileId/download` - Download file

#### 3. Routes (`assessment-service/routes/assessmentRoutes.js`)
- Added file upload routes with multer middleware
- Integrated with existing assessment routes

#### 4. Submission Model (`assessment-service/models/Submission.js`)
- Enhanced with file attachment support:
  ```javascript
  attachments: [{
    filename: String,
    url: String,          // Google Drive web view link
    fileType: String,     // MIME type
    fileId: String,       // Google Drive file ID
    fileSize: Number,     // Size in bytes
    uploadedAt: Date
  }]
  ```
- Legacy fields for backward compatibility

#### 5. Dependencies
- ✅ `googleapis` package installed
- ✅ `multer` package already present

### Frontend Implementation

#### 1. API Service (`client/src/services/api.js`)
- **uploadFile()** - Handles FormData and file upload
- **deleteFile()** - Removes file from Google Drive
- **downloadFile()** - Opens file in new tab
- Proper authorization headers
- Error handling

#### 2. Student Dashboard (`client/src/components/student/StudentDashboard.jsx`)
**Enhanced Submission Form**:
- File selection with accept attribute for file type filtering
- File size display in MB
- Visual confirmation when file is selected
- Upload to Google Drive before creating submission
- Attachments array support
- Graceful error handling if upload fails

**Enhanced Grades View**:
- Added "Attachments" column
- Displays file links with icons (📎)
- Opens files in new tab
- Handles both new attachments array and legacy fileUrl

#### 3. File Upload UI Features
- Clear instructions about Google Drive upload
- List of supported file types
- File size limit notice
- Selected file preview with size
- Progress feedback during upload
- Error messages if upload fails

## 📋 Setup Requirements

### Option 1: Service Account (Recommended for Production)

**Steps**:
1. Create Google Cloud Project
2. Enable Google Drive API
3. Create Service Account
4. Download JSON key file
5. Place in `assessment-service/` folder
6. Add to `.env`:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY=./lms-auth-service-account.json
   ```

**Pros**:
- No user interaction needed
- Better for automated systems
- More secure for production

**Cons**:
- Requires Google Cloud Platform setup
- Files stored in service account's Drive

### Option 2: OAuth2 (Alternative for Personal Use)

**Steps**:
1. Create OAuth 2.0 Client ID
2. Get refresh token
3. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REFRESH_TOKEN=your-refresh-token
   ```

**Pros**:
- Easier initial setup
- Files in personal Drive

**Cons**:
- Requires one-time auth flow
- Token can expire

## 🎯 How It Works

### Student Upload Flow

1. **Student selects file** in submission form
2. **Frontend validates** file type and size
3. **Frontend uploads** file to backend via API
4. **Backend (Multer)** receives file in memory
5. **Google Drive Service** uploads to Drive
   - Creates folder if needed
   - Generates unique filename
   - Sets file permissions (anyone with link)
6. **Returns file data**:
   - fileId (Google Drive ID)
   - fileUrl (view link)
   - downloadUrl (direct download)
   - fileName
   - fileSize
7. **Frontend creates submission** with file data
8. **Submission saved** to MongoDB with attachments

### Instructor View Flow

1. **Instructor views submissions**
2. **Frontend fetches** submissions from API
3. **Displays file attachments** with links
4. **Click opens file** in new tab
5. **Accesses Google Drive** directly

## 📊 Database Schema

```javascript
// Submission Model
{
  activityId: ObjectId,
  studentId: ObjectId,
  content: String,
  
  // New attachments array (supports multiple files)
  attachments: [{
    filename: "student_123_activity_456_1699999999_document.pdf",
    url: "https://drive.google.com/file/d/.../view",
    fileId: "1ABC...XYZ",
    fileSize: 2048576,
    fileType: "application/pdf",
    uploadedAt: Date
  }],
  
  // Legacy fields (backward compatibility)
  fileUrl: String,
  fileId: String,
  fileName: String,
  fileSize: Number,
  
  submittedAt: Date,
  status: String,
  score: Number,
  feedback: String
}
```

## 🔒 Security Features

1. **File Type Validation**
   - Server-side MIME type checking
   - Client-side accept attribute
   - Only allowed types can be uploaded

2. **File Size Limits**
   - 50MB per file maximum
   - Enforced by multer middleware

3. **Google Drive Permissions**
   - Files set to "anyone with link can view"
   - Prevents unauthorized access without link

4. **Authentication**
   - All API calls require valid JWT token
   - Student can only upload for their own ID

5. **File Naming**
   - Timestamped unique filenames
   - Prevents overwrite conflicts
   - Format: `{studentId}_{activityId}_{timestamp}_{originalName}`

## 🚀 Testing the Integration

### Without Google Drive Setup
- System works but shows warning in logs
- Files are not actually uploaded
- Submission still works with text content
- No errors thrown

### With Google Drive Setup
1. Configure credentials (see GOOGLE_DRIVE_SETUP.md)
2. Restart assessment service
3. Check logs for: `✅ Google Drive Service initialized`
4. Test upload:
   - Login as student
   - Go to Activities
   - Submit with file
   - Check Google Drive for `LMS_Submissions` folder
   - Verify file appears

## 📈 Future Enhancements

### Planned Features
1. **Multiple file uploads** per submission
2. **File preview** in browser (PDF viewer)
3. **Drag & drop** file upload
4. **Progress bar** for large files
5. **File scanning** for viruses
6. **Direct Google Drive picker** (select existing files)
7. **Google Docs integration** (create/edit docs)
8. **Version control** for resubmissions
9. **Bulk download** for instructors
10. **File retention policies**

### Performance Optimizations
1. **Use Google Cloud Storage** instead of Drive
2. **Implement CDN** for file delivery
3. **Add thumbnail generation** for images
4. **Compress files** before upload
5. **Chunked uploads** for very large files

### UI Enhancements
1. **Rich text editor** for submission content
2. **File preview modal** before upload
3. **Download all attachments** as ZIP
4. **Inline PDF viewer**
5. **Image gallery** for image submissions

## 🐛 Known Limitations

1. **No local storage fallback** - If Google Drive is down, uploads will fail
2. **No file encryption** - Files stored in plain format
3. **Link-based access** - Anyone with link can view (no per-user permissions)
4. **No versioning** - Resubmission creates new file, old one orphaned
5. **No quota management** - Could hit Drive storage limits

## 📝 API Documentation

### Upload File
```http
POST /api/assessments/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- file: File (required)
- studentId: String (required)
- activityId: String (required)
- submissionId: String (optional)

Response:
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileId": "1ABC...XYZ",
    "fileName": "student_123_activity_456_1699999999_document.pdf",
    "fileUrl": "https://drive.google.com/file/d/.../view",
    "downloadUrl": "https://drive.google.com/uc?id=...",
    "size": "2048576"
  }
}
```

### Delete File
```http
DELETE /api/assessments/files/:fileId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Download File
```http
GET /api/assessments/files/:fileId/download
Authorization: Bearer {token}

Response:
- Stream of file content
- Content-Disposition header for download
```

## 📚 Related Documentation

- [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md) - Complete setup guide
- [Google Drive API Docs](https://developers.google.com/drive/api/v3/about-sdk)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Google API Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

## ✅ Checklist for Deployment

- [ ] Create Google Cloud Project
- [ ] Enable Google Drive API
- [ ] Create Service Account
- [ ] Download and configure credentials
- [ ] Add `.env` variables
- [ ] Add credentials to `.gitignore`
- [ ] Test file upload
- [ ] Verify files in Google Drive
- [ ] Test file download
- [ ] Test submission with attachments
- [ ] Test instructor view of submissions
- [ ] Monitor API quota usage
- [ ] Set up backup strategy
- [ ] Configure production permissions

---

**Status**: ✅ Implementation Complete - Setup Required
**Last Updated**: November 15, 2025
**Next Steps**: Configure Google Drive API credentials (see GOOGLE_DRIVE_SETUP.md)
