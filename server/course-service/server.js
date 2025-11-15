import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import courseRoutes from './routes/courseRoutes.js';
import attendanceRoutes from './routes/attendance.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1004;

connectDB();

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Course Service', port: PORT });
});

app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`📚 Course Service running on port ${PORT}`);
});

export default app;
