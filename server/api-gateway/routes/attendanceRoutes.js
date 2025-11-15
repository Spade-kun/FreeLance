import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const COURSE_SERVICE = process.env.COURSE_SERVICE_URL || 'http://localhost:1004';

// Attendance routes
router.get('/section/:sectionId', (req, res) => 
  proxyRequest(req, res, `${COURSE_SERVICE}/api/attendance/section/${req.params.sectionId}`)
);

router.get('/section/:sectionId/date', (req, res) => 
  proxyRequest(req, res, `${COURSE_SERVICE}/api/attendance/section/${req.params.sectionId}/date${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`)
);

router.get('/section/:sectionId/students', (req, res) => 
  proxyRequest(req, res, `${COURSE_SERVICE}/api/attendance/section/${req.params.sectionId}/students`)
);

router.get('/section/:sectionId/stats', (req, res) => 
  proxyRequest(req, res, `${COURSE_SERVICE}/api/attendance/section/${req.params.sectionId}/stats`)
);

router.post('/', (req, res) => 
  proxyRequest(req, res, `${COURSE_SERVICE}/api/attendance`)
);

router.delete('/:attendanceId', (req, res) => 
  proxyRequest(req, res, `${COURSE_SERVICE}/api/attendance/${req.params.attendanceId}`)
);

export default router;
