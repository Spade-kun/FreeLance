import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1003;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'User Service', port: PORT });
});

// Routes
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`👥 User Service running on port ${PORT}`);
});

export default app;
