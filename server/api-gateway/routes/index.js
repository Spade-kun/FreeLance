import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import courseRoutes from './courseRoutes.js';
import contentRoutes from './contentRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import reportRoutes from './reportRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import emailRoutes from './emailRoutes.js';

const router = express.Router();

// Route to respective microservices
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/content', contentRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/reports', reportRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/email', emailRoutes);

export default router;
