import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const ASSESSMENT_SERVICE = process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:1006';

// Activity routes
router.get('/courses/:courseId/activities', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/courses/${req.params.courseId}/activities`));
router.get('/activities/:id', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/activities/${req.params.id}`));
router.post('/courses/:courseId/activities', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/courses/${req.params.courseId}/activities`));
router.put('/activities/:id', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/activities/${req.params.id}`));
router.delete('/activities/:id', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/activities/${req.params.id}`));

// Submission routes
router.get('/activities/:activityId/submissions', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/activities/${req.params.activityId}/submissions`));
router.get('/submissions/:id', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/submissions/${req.params.id}`));
router.post('/activities/:activityId/submissions', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/activities/${req.params.activityId}/submissions`));
router.put('/submissions/:id', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/submissions/${req.params.id}`));
router.get('/student/:studentId/submissions', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/student/${req.params.studentId}/submissions`));

// Grading routes
router.post('/submissions/:submissionId/grade', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/submissions/${req.params.submissionId}/grade`));
router.put('/submissions/:submissionId/grade', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/submissions/${req.params.submissionId}/grade`));
router.get('/courses/:courseId/grades', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/courses/${req.params.courseId}/grades`));
router.get('/student/:studentId/grades', (req, res) => proxyRequest(req, res, `${ASSESSMENT_SERVICE}/api/assessments/student/${req.params.studentId}/grades`));

export default router;
