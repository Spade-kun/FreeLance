import express from 'express';
import {
  getActivitiesByCourse,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getSubmissionsByActivity,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  getStudentSubmissions,
  gradeSubmission,
  getCourseGrades,
  getStudentGrades
} from '../controllers/assessmentController.js';

const router = express.Router();

// Activity routes
router.get('/courses/:courseId/activities', getActivitiesByCourse);
router.get('/activities/:id', getActivityById);
router.post('/courses/:courseId/activities', createActivity);
router.put('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);

// Submission routes
router.get('/activities/:activityId/submissions', getSubmissionsByActivity);
router.get('/submissions/:id', getSubmissionById);
router.post('/activities/:activityId/submissions', createSubmission);
router.put('/submissions/:id', updateSubmission);
router.get('/student/:studentId/submissions', getStudentSubmissions);

// Grading routes
router.post('/submissions/:submissionId/grade', gradeSubmission);
router.put('/submissions/:submissionId/grade', gradeSubmission);
router.get('/courses/:courseId/grades', getCourseGrades);
router.get('/student/:studentId/grades', getStudentGrades);

export default router;
