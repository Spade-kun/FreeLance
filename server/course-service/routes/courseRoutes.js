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

// Enrollment routes (must be before /:id routes to avoid conflicts)
router.get('/enrollments', getEnrollments);
router.post('/enrollments', createEnrollment);
router.delete('/enrollments/:id', deleteEnrollment);

// Student/Instructor specific routes (must be before /:id routes)
router.get('/student/:studentId/enrollments', getStudentEnrollments);
router.get('/instructor/:instructorId/courses', getInstructorCourses);

// Course routes (base routes first)
router.get('/', getCourses);
router.post('/', createCourse);

// Section routes (must be before /:id to avoid matching sections as an id)
router.get('/:courseId/sections', getSectionsByCourse);
router.post('/:courseId/sections', createSection);
router.put('/:courseId/sections/:sectionId', updateSection);
router.delete('/:courseId/sections/:sectionId', deleteSection);

// Generic course ID routes (must be last to avoid catching specific routes)
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
