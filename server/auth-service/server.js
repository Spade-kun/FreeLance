import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import passport from './config/passport.js';
import { configureGoogleAuth } from './config/passport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1002;

// Connect to MongoDB
connectDB();

// Configure Google OAuth
configureGoogleAuth();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (needed for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Auth Service', port: PORT });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
});

export default app;
