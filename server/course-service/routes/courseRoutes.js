import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getSectionsByCourse,
  createSection,
  updateSection,
  deleteSection,
  createEnrollment,
  getEnrollments,
  deleteEnrollment,
  getStudentEnrollments,
  getInstructorCourses
} from '../controllers/courseController.js';

const router = express.Router();

// Course routes
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Section routes
router.get('/:courseId/sections', getSectionsByCourse);
router.post('/:courseId/sections', createSection);
router.put('/:courseId/sections/:sectionId', updateSection);
router.delete('/:courseId/sections/:sectionId', deleteSection);

// Enrollment routes
router.get('/enrollments', getEnrollments);
router.post('/enrollments', createEnrollment);
router.delete('/enrollments/:id', deleteEnrollment);
router.get('/student/:studentId/enrollments', getStudentEnrollments);
router.get('/instructor/:instructorId/courses', getInstructorCourses);

export default router;
