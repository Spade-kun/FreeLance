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
  deleteLesson,
  downloadFile,
  deleteModuleFile
} from '../controllers/contentController.js';
import upload from '../middleware/upload.js';

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
router.post('/courses/:courseId/modules', upload.array('files', 10), createModule);
router.put('/modules/:id', upload.array('files', 10), updateModule);
router.delete('/modules/:id', deleteModule);

// File routes
router.get('/files/:filename', downloadFile);
router.delete('/modules/:moduleId/files/:filename', deleteModuleFile);

// Lesson routes
router.get('/modules/:moduleId/lessons', getLessonsByModule);
router.get('/lessons/:id', getLessonById);
router.post('/modules/:moduleId/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

export default router;
