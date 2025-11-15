import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.log('Uploaded:', req.file.filename);
    res.status(200).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileUrl: `/api/assessments/files/${req.file.filename}`,
        fileId: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.fileId);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
