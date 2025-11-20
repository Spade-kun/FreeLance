import express from 'express';
import axios from 'axios';

const router = express.Router();
const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:1010/api/logs';

// Proxy all requests to logs service
router.all('*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${LOGS_SERVICE_URL}${req.path}`,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Logs service error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Logs service error',
      error: error.message
    });
  }
});

export default router;
