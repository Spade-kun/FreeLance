import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const COURSE_SERVICE = process.env.COURSE_SERVICE_URL || 'http://localhost:1004';

// Enrollment routes (must be before /:id routes to avoid conflicts)
router.get('/enrollments', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/enrollments`));
router.post('/enrollments', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/enrollments`));
router.delete('/enrollments/:id', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/enrollments/${req.params.id}`));

// Student/Instructor specific routes (must be before /:id routes)
router.get('/student/:studentId/enrollments', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/student/${req.params.studentId}/enrollments`));
router.get('/instructor/:instructorId/courses', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/instructor/${req.params.instructorId}/courses`));

// Course routes
router.get('/', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses`));
router.post('/', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses`));

// Section routes (must be before /:id to avoid matching sections as an id)
router.get('/:courseId/sections', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.courseId}/sections`));
router.post('/:courseId/sections', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.courseId}/sections`));
router.put('/:courseId/sections/:sectionId', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.courseId}/sections/${req.params.sectionId}`));
router.delete('/:courseId/sections/:sectionId', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.courseId}/sections/${req.params.sectionId}`));

// Schedule routes (must be before /:id)
router.get('/:courseId/schedule', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.courseId}/schedule`));
router.post('/:courseId/schedule', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.courseId}/schedule`));
router.put('/:courseId/schedule/:scheduleId', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.courseId}/schedule/${req.params.scheduleId}`));

// Generic course ID routes (must be last to avoid catching specific routes)
router.get('/:id', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.id}`));
router.put('/:id', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.id}`));
router.delete('/:id', (req, res) => proxyRequest(req, res, `${COURSE_SERVICE}/api/courses/${req.params.id}`));

export default router;
