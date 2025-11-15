import express from 'express';
import { proxyRequest } from '../utils/proxyHelper.js';

const router = express.Router();
const CONTENT_SERVICE = process.env.CONTENT_SERVICE_URL || 'http://localhost:1005';

// Announcement routes
router.get('/announcements', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/announcements`));
router.get('/announcements/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/announcements/${req.params.id}`));
router.post('/announcements', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/announcements`));
router.put('/announcements/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/announcements/${req.params.id}`));
router.delete('/announcements/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/announcements/${req.params.id}`));

// Module routes (must be before specific course routes to avoid conflicts)
router.post('/modules', (req, res) => {
  // Extract courseId from body and route to correct endpoint
  const { courseId } = req.body;
  if (!courseId) {
    return res.status(400).json({ message: 'courseId is required' });
  }
  proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/courses/${courseId}/modules`);
});
router.get('/courses/:courseId/modules', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/courses/${req.params.courseId}/modules`));
router.get('/modules/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/modules/${req.params.id}`));
router.post('/courses/:courseId/modules', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/courses/${req.params.courseId}/modules`));
router.put('/modules/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/modules/${req.params.id}`));
router.delete('/modules/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/modules/${req.params.id}`));

// Lesson routes (must be before specific module routes to avoid conflicts)
router.post('/lessons', (req, res) => {
  // Extract moduleId from body and route to correct endpoint
  const { moduleId } = req.body;
  if (!moduleId) {
    return res.status(400).json({ message: 'moduleId is required' });
  }
  proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/modules/${moduleId}/lessons`);
});
router.get('/modules/:moduleId/lessons', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/modules/${req.params.moduleId}/lessons`));
router.get('/lessons/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/lessons/${req.params.id}`));
router.post('/modules/:moduleId/lessons', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/modules/${req.params.moduleId}/lessons`));
router.put('/lessons/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/lessons/${req.params.id}`));
router.delete('/lessons/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/lessons/${req.params.id}`));

// Learning material routes
router.get('/lessons/:lessonId/materials', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/lessons/${req.params.lessonId}/materials`));
router.post('/lessons/:lessonId/materials', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/lessons/${req.params.lessonId}/materials`));
router.delete('/materials/:id', (req, res) => proxyRequest(req, res, `${CONTENT_SERVICE}/api/content/materials/${req.params.id}`));

export default router;
