import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 1007;

connectDB();

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Report Service', port: PORT });
});

app.use('/api/reports', reportRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`📊 Report Service running on port ${PORT}`);
});

export default app;
