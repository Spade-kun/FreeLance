import express from 'express';
import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getProfile,
  updateProfile
} from '../controllers/userController.js';
import { validateAdmin, validateInstructor, validateStudent } from '../middleware/validator.js';

const router = express.Router();

// Admin routes
router.get('/admins', getAdmins);
router.get('/admins/:id', getAdminById);
router.post('/admins', validateAdmin, createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// Instructor routes
router.get('/instructors', getInstructors);
router.get('/instructors/:id', getInstructorById);
router.post('/instructors', validateInstructor, createInstructor);
router.put('/instructors/:id', updateInstructor);
router.delete('/instructors/:id', deleteInstructor);

// Student routes
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.post('/students', validateStudent, createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Profile routes
router.get('/profile/:id', getProfile);
router.put('/profile/:id', updateProfile);

export default router;
