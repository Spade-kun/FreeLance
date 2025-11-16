# 📎 Module File Upload Feature

## Overview
Instructors can now attach files to modules when creating learning materials. Students can view and download these files from both instructor and student dashboards.

## Features

### For Instructors
- **Upload Multiple Files**: Attach up to 10 files per module (PDFs, Word, PowerPoint, Excel, Images, Videos, ZIP files)
- **File Management**: View, download, and delete attached files
- **File Size Limit**: 100MB per file
- **Supported Formats**:
  - Documents: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
  - Images: JPG, JPEG, PNG, GIF
  - Videos: MP4, MOV
  - Archives: ZIP, RAR

### For Students
- **View Materials**: See all files attached to modules
- **Download Files**: Click to download or open files in browser
- **File Information**: View filename and file size

## Technical Implementation

### Backend Changes

#### 1. Module Model Updated
```javascript
// Added files array to Module schema
files: [{
  fileName: String,
  fileUrl: String,
  fileSize: Number,
  fileType: String,
  uploadedAt: Date
}]
```

#### 2. New Middleware
- **File**: `server/content-service/middleware/upload.js`
- **Purpose**: Handle file uploads using multer
- **Configuration**:
  - Storage: Local disk storage in `server/content-service/uploads/`
  - Size limit: 100MB per file
  - File naming: `timestamp_filename.ext`

#### 3. Updated Controllers
- **Create Module**: Now accepts file uploads via multipart/form-data
- **Update Module**: Appends new files to existing files
- **New Endpoints**:
  - `GET /api/content/files/:filename` - Download file
  - `DELETE /api/content/modules/:moduleId/files/:filename` - Delete file

#### 4. API Routes
```javascript
// File upload enabled routes
POST /api/content/courses/:courseId/modules (with files)
PUT /api/content/modules/:id (with files)
GET /api/content/files/:filename
DELETE /api/content/modules/:moduleId/files/:filename
```

### Frontend Changes

#### 1. Instructor Dashboard
- **File Input**: Added multiple file input in module form
- **File Preview**: Shows selected files before upload
- **Current Files Display**: Lists existing files with delete option
- **File Links**: Direct download links for uploaded files

#### 2. Student Dashboard
- **Module Files Display**: Shows attached files in green highlighted box
- **Download Links**: Click to download/view files
- **File Size Display**: Shows file size in MB

#### 3. API Service
- **FormData Support**: Automatically converts to FormData when files are present
- **File Delete Method**: New `deleteModuleFile()` method

## Usage

### Creating Module with Files

1. **Instructor Dashboard** → Learning Materials
2. Select a course
3. Click "Add Module"
4. Fill in module details
5. Click "Choose Files" to select files
6. Upload up to 10 files at once
7. Click "Add Module"

### Viewing Module Files

**As Instructor:**
- Files appear in the module list under "📎 Attached Files"
- Click filename to download
- Edit module to see "Current Files" section
- Delete files individually using "Delete" button

**As Student:**
- Go to "My Courses"
- Select a course
- Files appear under "📎 Course Materials" in green box
- Click filename to download

### File Storage

- **Location**: `server/content-service/uploads/`
- **Naming**: `{timestamp}_{sanitized_filename}.{ext}`
- **Example**: `1700123456789_lecture_notes.pdf`

## API Examples

### Create Module with Files (cURL)
```bash
curl -X POST http://localhost:1001/api/content/courses/{courseId}/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Introduction to Programming" \
  -F "description=Basic programming concepts" \
  -F "order=1" \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.docx"
```

### Download File
```bash
curl -O http://localhost:1001/api/content/files/{filename}
```

### Delete File
```bash
curl -X DELETE http://localhost:1001/api/content/modules/{moduleId}/files/{filename} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Considerations

### File Validation
- ✅ File type checking (whitelist approach)
- ✅ File size limit (100MB)
- ✅ Filename sanitization
- ✅ Timestamp-based unique naming

### Access Control
- Module files are accessible to all users (public access for learning materials)
- For private files, additional authentication can be added

## Future Enhancements

### Planned Features
- [ ] Google Drive integration (like assessment service)
- [ ] File versioning
- [ ] Bulk file upload
- [ ] File preview (PDF, images)
- [ ] Folder organization
- [ ] File search
- [ ] File access logs
- [ ] Student download tracking

### Optimization Ideas
- [ ] CDN integration for faster downloads
- [ ] Thumbnail generation for images/videos
- [ ] Compression for large files
- [ ] Cloud storage (S3, Azure Blob)

## Testing

### Manual Test Steps

1. **Upload Test**:
   - Login as instructor
   - Create module with 3 different file types (PDF, DOCX, PNG)
   - Verify files appear in module list
   - Verify file sizes are correct

2. **Download Test**:
   - Login as student
   - Navigate to course with files
   - Click each file link
   - Verify files download correctly

3. **Delete Test**:
   - Login as instructor
   - Edit module with files
   - Delete one file
   - Verify file removed from list
   - Verify physical file deleted from uploads folder

4. **Update Test**:
   - Edit existing module
   - Add 2 more files
   - Save module
   - Verify new files added (not replacing old ones)

## Troubleshooting

### Common Issues

**Files not uploading:**
- Check file size (must be < 100MB)
- Check file type (must be in allowed list)
- Check disk space on server
- Check uploads directory permissions

**Files not downloading:**
- Verify file exists in uploads directory
- Check API gateway routing
- Check content-service is running
- Verify file URL is correct

**Files not displaying:**
- Check module has `files` array populated
- Verify frontend API URL is correct
- Check browser console for errors

### Debug Commands

```bash
# Check uploads directory
ls -lh server/content-service/uploads/

# Check disk space
df -h

# View content-service logs
tail -f server/logs/content-service.log

# Test file download directly
curl -I http://localhost:1005/api/content/files/{filename}
```

## Database Schema

### Module Document Example
```json
{
  "_id": "649abc123def456",
  "courseId": "649abc000def111",
  "title": "Introduction to Programming",
  "description": "Basic concepts",
  "order": 1,
  "isPublished": true,
  "files": [
    {
      "fileName": "lecture_notes.pdf",
      "fileUrl": "/api/content/files/1700123456789_lecture_notes.pdf",
      "fileSize": 2048576,
      "fileType": "application/pdf",
      "uploadedAt": "2025-11-16T05:30:00.000Z"
    },
    {
      "fileName": "presentation.pptx",
      "fileUrl": "/api/content/files/1700123457890_presentation.pptx",
      "fileSize": 5242880,
      "fileType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "uploadedAt": "2025-11-16T05:30:10.000Z"
    }
  ],
  "createdAt": "2025-11-16T05:30:00.000Z",
  "updatedAt": "2025-11-16T05:30:10.000Z"
}
```

---

**Status**: ✅ Fully Implemented and Tested
**Date**: November 16, 2025
**Version**: 1.0.0
