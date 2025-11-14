import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const REPORT_SERVICE = process.env.REPORT_SERVICE_URL || 'http://localhost:1007';

// Student reports
router.get('/students/:studentId/progress', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/students/${req.params.studentId}/progress`));
router.get('/students/:studentId/grades', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/students/${req.params.studentId}/grades`));
router.get('/students/:studentId/attendance', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/students/${req.params.studentId}/attendance`));

// Instructor reports
router.get('/instructors/:instructorId/performance', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/instructors/${req.params.instructorId}/performance`));
router.get('/instructors/:instructorId/courses', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/instructors/${req.params.instructorId}/courses`));

// Course reports
router.get('/courses/:courseId/statistics', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/courses/${req.params.courseId}/statistics`));
router.get('/courses/:courseId/student-performance', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/courses/${req.params.courseId}/student-performance`));

// Attendance routes
router.get('/courses/:courseId/attendance', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/courses/${req.params.courseId}/attendance`));
router.post('/courses/:courseId/attendance', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/courses/${req.params.courseId}/attendance`));
router.put('/attendance/:id', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/attendance/${req.params.id}`));

// Admin dashboard reports
router.get('/dashboard/overview', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/dashboard/overview`));
router.get('/dashboard/system-stats', (req, res) => proxyRequest(req, res, `${REPORT_SERVICE}/api/reports/dashboard/system-stats`));

export default router;
