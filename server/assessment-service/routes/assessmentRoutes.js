import express from 'express';
import {
  getActivitiesByCourse,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getAllSubmissions,
  getSubmissionsByActivity,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  getStudentSubmissions,
  gradeSubmission,
  getCourseGrades,
  getStudentGrades,
  getMVCCStats,
  resetMVCCStats
} from '../controllers/assessmentController.js';
import {
  uploadFile,
  deleteFile,
  downloadFile,
  uploadMiddleware,
  getAuthUrl,
  oauth2callback
} from '../controllers/fileController.js';

const router = express.Router();

// Activity routes
router.get('/courses/:courseId/activities', getActivitiesByCourse);
router.get('/activities/:id', getActivityById);
router.post('/courses/:courseId/activities', createActivity);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

// Submission routes
router.get('/submissions', getAllSubmissions);
router.get('/activities/:activityId/submissions', getSubmissionsByActivity);
router.get('/submissions/:id', getSubmissionById);
router.post('/submissions', createSubmission);
router.post('/activities/:activityId/submissions', createSubmission);
router.put('/submissions/:id', updateSubmission);
router.get('/student/:studentId/submissions', getStudentSubmissions);

// Grading routes
router.post('/submissions/:submissionId/grade', gradeSubmission);
router.put('/submissions/:submissionId/grade', gradeSubmission);
router.get('/courses/:courseId/grades', getCourseGrades);
router.get('/student/:studentId/grades', getStudentGrades);

// File upload routes (Local Storage)
router.post('/files/upload', uploadMiddleware, uploadFile);
router.delete('/files/:fileId', deleteFile);
router.get('/files/:fileId/download', downloadFile);
router.get('/files/:fileId', downloadFile); // Serve file (can view in browser)

// OAuth2 routes for Google Drive
router.get('/auth/google', getAuthUrl);
router.get('/oauth2callback', oauth2callback);

// MVCC monitoring routes
router.get('/mvcc/stats', getMVCCStats);
router.post('/mvcc/reset-stats', resetMVCCStats);

export default router;
