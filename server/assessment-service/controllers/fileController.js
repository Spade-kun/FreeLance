import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Drive OAuth2 setup
const FOLDER_ID = '13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x';

// Function to get OAuth2 client (ensures env vars are loaded)
const getOAuth2Client = () => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:1006/api/assessments/oauth2callback'
  );

  // Set refresh token if available
  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_REFRESH_TOKEN !== 'your_refresh_token_here') {
    client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
  }

  return client;
};

const getDrive = () => google.drive({ version: 'v3', auth: getOAuth2Client() });

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${timestamp}_${name}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'application/zip'];
    cb(null, allowed.includes(file.mimetype));
  }
});

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
    const { studentId, activityId } = req.body;
    if (!studentId || !activityId) return res.status(400).json({ success: false, message: 'IDs required' });
    
    console.log('Uploaded to local:', req.file.filename);
    
    // Upload to Google Drive
    const fileMetadata = {
      name: req.file.originalname,
      parents: [FOLDER_ID]
    };
    
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    };
    
    const drive = getDrive();
    const driveFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });
    
    console.log('Uploaded to Google Drive:', driveFile.data.id);
    
    res.status(200).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileUrl: `/api/assessments/files/${req.file.filename}`,
        fileId: req.file.filename,
        size: req.file.size,
        driveFileId: driveFile.data.id,
        driveWebViewLink: driveFile.data.webViewLink
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    // Delete from local storage
    const filePath = path.join(uploadsDir, req.params.fileId);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    // Delete from Google Drive if driveFileId is provided
    if (req.query.driveFileId) {
      const drive = getDrive();
      await drive.files.delete({ fileId: req.query.driveFileId });
      console.log('Deleted from Google Drive:', req.query.driveFileId);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.fileId);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false });
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileId}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMiddleware = upload.single('file');

// OAuth2 authorization flow
export const getAuthUrl = (req, res) => {
  const client = getOAuth2Client();
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
    prompt: 'consent'
  });
  res.json({ authUrl });
};

export const oauth2callback = async (req, res) => {
  const { code } = req.query;
  try {
    const client = getOAuth2Client();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    console.log('OAuth tokens:', tokens);
    console.log('\n=== ADD THIS TO YOUR .env FILE ===');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('==================================\n');
    
    res.send(`
      <h1>Authorization Successful!</h1>
      <p>Copy this refresh token to your .env file:</p>
      <pre>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p>You can close this window.</p>
    `);
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Authorization failed: ' + error.message);
  }
};
