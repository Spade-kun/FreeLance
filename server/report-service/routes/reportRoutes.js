import express from 'express';
import {
  getStudentProgress,
  getStudentGrades,
  getStudentAttendance,
  getInstructorPerformance,
  getInstructorCourses,
  getCourseStatistics,
  getCourseStudentPerformance,
  getCourseAttendance,
  recordAttendance,
  updateAttendance,
  getDashboardOverview,
  getSystemStats
} from '../controllers/reportController.js';

const router = express.Router();

// Student reports
router.get('/students/:studentId/progress', getStudentProgress);
router.get('/students/:studentId/grades', getStudentGrades);
router.get('/students/:studentId/attendance', getStudentAttendance);

// Instructor reports
router.get('/instructors/:instructorId/performance', getInstructorPerformance);
router.get('/instructors/:instructorId/courses', getInstructorCourses);

// Course reports
router.get('/courses/:courseId/statistics', getCourseStatistics);
router.get('/courses/:courseId/student-performance', getCourseStudentPerformance);

// Attendance routes
router.get('/courses/:courseId/attendance', getCourseAttendance);
router.post('/courses/:courseId/attendance', recordAttendance);
router.put('/attendance/:id', updateAttendance);

// Admin dashboard
router.get('/dashboard/overview', getDashboardOverview);
router.get('/dashboard/system-stats', getSystemStats);

export default router;
