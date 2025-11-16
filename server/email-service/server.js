// Load environment variables FIRST before any other requires
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const emailRoutes = require('./routes/emailRoutes');

const app = express();
const PORT = process.env.PORT || 1008;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check (put before routes to ensure it works)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Email Service',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use('/api/email', emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// Start server first, then connect to DB
const server = app.listen(PORT, () => {
  console.log(`📧 Email Service running on port ${PORT}`);
  // Connect to MongoDB after server starts
  connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
  });
});

module.exports = app;
