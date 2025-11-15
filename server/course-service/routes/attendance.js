import express from 'express';
import {
  getSectionAttendance,
  getAttendanceByDate,
  saveAttendance,
  getSectionStudents,
  getAttendanceStats,
  deleteAttendance
} from '../controllers/attendanceController.js';

const router = express.Router();

// Get all attendance records for a section
router.get('/section/:sectionId', getSectionAttendance);

// Get attendance for a specific date
router.get('/section/:sectionId/date', getAttendanceByDate);

// Get enrolled students for a section
router.get('/section/:sectionId/students', getSectionStudents);

// Get attendance statistics for a section
router.get('/section/:sectionId/stats', getAttendanceStats);

// Create or update attendance
router.post('/', saveAttendance);

// Delete attendance record
router.delete('/:attendanceId', deleteAttendance);

export default router;
