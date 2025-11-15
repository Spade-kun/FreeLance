# Google Drive Integration for File Uploads

## Overview
Files are now stored in **TWO locations**:
1. **Local Database** - MongoDB (for quick access and backup)
2. **Google Drive** - Folder ID: `13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x`

## How It Works

### Upload Flow
1. Student submits file through frontend
2. File is saved to local `uploads/` directory
3. File metadata stored in MongoDB
4. **Simultaneously**: File uploaded to Google Drive folder
5. Both local fileId and Google Drive fileId stored in database

### Response Data
```json
{
  "success": true,
  "data": {
    "fileName": "assignment.pdf",
    "fileUrl": "/api/assessments/files/1234567890_assignment.pdf",
    "fileId": "1234567890_assignment.pdf",
    "size": 512000,
    "driveFileId": "1A2B3C4D5E...",
    "driveWebViewLink": "https://drive.google.com/file/d/..."
  }
}
```

### Submission Model
Updated to include Google Drive fields:
```javascript
attachments: [{
  filename: String,
  url: String,              // Local URL
  fileId: String,           // Local file ID
  driveFileId: String,      // Google Drive file ID
  driveWebViewLink: String, // Google Drive view link
  fileSize: Number
}]
```

## Configuration

### Google Drive Setup
- **Service Account**: `lms-auth-478213-df979ad34ac6.json`
- **Folder ID**: `13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x`
- **Permissions**: Service account has write access to this folder

### File Controller
Located: `controllers/fileController.js`
- Handles both local and Google Drive uploads
- Uses `googleapis` package for Drive API
- Authenticates using service account key

## Benefits of Dual Storage

1. **Redundancy**: Files stored in two locations for safety
2. **Quick Access**: Local files for fast retrieval
3. **Cloud Backup**: Google Drive as permanent storage
4. **Sharing**: Google Drive links can be shared if needed
5. **Scalability**: Can easily move to Drive-only storage later

## Testing

Test file upload:
```bash
curl -X POST http://localhost:1006/api/files/upload \
  -F "file=@test.pdf" \
  -F "studentId=12345" \
  -F "activityId=67890"
```

Check response for both `fileId` (local) and `driveFileId` (Google Drive).

## Notes
- Local files in `uploads/` directory (gitignored)
- Google Drive credentials in `config/` (gitignored)
- Both IDs stored for complete file tracking
- Delete operations remove from both locations
