import express from 'express';
import { 
  createLog, 
  getAllLogs, 
  getLogById, 
  getLogsByUser, 
  getLogsByAction, 
  deleteLog, 
  deleteLogs, 
  getLogStats 
} from '../controllers/logController.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Logs service is healthy' });
});

// Statistics
router.get('/stats', getLogStats);

// Get logs by user
router.get('/user/:userId', getLogsByUser);

// Get logs by action type
router.get('/action/:actionType', getLogsByAction);

// Get all logs (with filters)
router.get('/', getAllLogs);

// Get single log
router.get('/:id', getLogById);

// Create log
router.post('/', createLog);

// Delete single log
router.delete('/:id', deleteLog);

// Bulk delete logs
router.post('/bulk-delete', deleteLogs);

export default router;