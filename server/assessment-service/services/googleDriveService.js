import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Google Drive configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME = 'LMS_Submissions';

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.folderId = null;
    this.initialized = false;
    // Don't initialize in constructor - wait for first use
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Debug logging
      console.log('🔍 Checking Google Drive configuration...');
      console.log('GOOGLE_SERVICE_ACCOUNT_KEY:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      console.log('File exists:', process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? fs.existsSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) : false);
      
      // Check if service account key file exists
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY && fs.existsSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)) {
        console.log('Using Google Service Account authentication...');
        this.auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
          scopes: SCOPES,
        });
        this.drive = google.drive({ 
          version: 'v3', 
          auth: this.auth 
        });
        console.log('✅ Google Drive Service initialized with Service Account');
        this.initialized = true;
        return;
      }

      // Fallback to OAuth2 if client ID and secret are provided
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log('Using OAuth2 authentication (requires manual token)...');
        this.auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI || 'http://localhost:1006/api/auth/google/callback'
        );
        
        // Check if we have a refresh token stored
        if (process.env.GOOGLE_REFRESH_TOKEN) {
          this.auth.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
          });
          this.drive = google.drive({ 
            version: 'v3', 
            auth: this.auth 
          });
          console.log('✅ Google Drive Service initialized with OAuth2');
          return;
        }
      }

      // No valid authentication method found
      console.warn('⚠️  Google Drive API not properly configured!');
      console.warn('Please configure one of the following:');
      console.warn('1. Service Account: GOOGLE_SERVICE_ACCOUNT_KEY');
      console.warn('2. OAuth2: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
      console.warn('Files will be stored locally until Google Drive is configured.');
      
      this.drive = null; // Mark as not initialized
    } catch (error) {
      console.error('Error initializing Google Drive Service:', error);
      this.drive = null;
    }
  }

  // Get or create the main LMS folder
  async getOrCreateFolder() {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    if (this.folderId) {
      return this.folderId;
    }

    try {
      // Use existing folder ID from environment variable if provided
      if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
        console.log('Using existing Google Drive folder ID from environment:', process.env.GOOGLE_DRIVE_FOLDER_ID);
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        return this.folderId;
      }

      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        this.folderId = response.data.files[0].id;
        console.log('Found existing LMS_Submissions folder:', this.folderId);
        return this.folderId;
      }

      // Create folder if it doesn't exist
      const folderMetadata = {
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });

      this.folderId = folder.data.id;
      console.log('Created new LMS_Submissions folder:', this.folderId);
      
      // Make folder publicly readable (optional)
      await this.drive.permissions.create({
        fileId: this.folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return this.folderId;
    } catch (error) {
      console.error('Error getting/creating folder:', error);
      throw error;
    }
  }

  // Upload file to Google Drive
  async uploadFile(fileBuffer, fileName, mimeType, metadata = {}) {
    // Ensure initialization is complete
    await this.initialize();
    
    // Check if Google Drive is properly initialized
    if (!this.drive) {
      console.error('Google Drive not configured. Please set up authentication.');
      throw new Error('Google Drive not configured. Please add service account credentials or OAuth2 tokens to .env file.');
    }

    try {
      const folderId = await this.getOrCreateFolder();

      // Create a readable stream from buffer
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: metadata.description || 'LMS Assignment Submission',
        properties: {
          studentId: metadata.studentId || '',
          activityId: metadata.activityId || '',
          submissionId: metadata.submissionId || '',
          uploadedAt: new Date().toISOString(),
        },
      };

      const media = {
        mimeType: mimeType,
        body: bufferStream,
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size',
      });

      // Make file readable by anyone with the link
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        fileUrl: response.data.webViewLink,
        downloadUrl: response.data.webContentLink,
        size: response.data.size,
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  // Upload file from path
  async uploadFileFromPath(filePath, metadata = {}) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const mimeType = this.getMimeType(fileName);

      return await this.uploadFile(fileBuffer, fileName, mimeType, metadata);
    } catch (error) {
      console.error('Error uploading file from path:', error);
      throw error;
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId) {
    await this.initialize();
    
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(fileId) {
    await this.initialize();
    
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink',
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  // Download file
  async downloadFile(fileId) {
    await this.initialize();
    
    try {
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Get MIME type from file extension
  getMimeType(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

// Export singleton instance
const googleDriveService = new GoogleDriveService();
export default googleDriveService;
