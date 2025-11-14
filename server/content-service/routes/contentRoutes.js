import express from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getModulesByCourse,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  getLessonsByModule,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
} from '../controllers/contentController.js';

const router = express.Router();

// Announcement routes
router.get('/announcements', getAnnouncements);
router.get('/announcements/:id', getAnnouncementById);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Module routes
router.get('/courses/:courseId/modules', getModulesByCourse);
router.get('/modules/:id', getModuleById);
router.post('/courses/:courseId/modules', createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

// Lesson routes
router.get('/modules/:moduleId/lessons', getLessonsByModule);
router.get('/lessons/:id', getLessonById);
router.post('/modules/:moduleId/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

export default router;
