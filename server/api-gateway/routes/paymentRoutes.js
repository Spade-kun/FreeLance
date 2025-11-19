import express from 'express';
import axios from 'axios';

const router = express.Router();
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:1009';

// Forward all payment requests to payment service
router.all('*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${PAYMENT_SERVICE_URL}${req.originalUrl.replace('/api/payments', '/api/payments')}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      params: req.query
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Payment service error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Payment service unavailable'
    });
  }
});

export default router;
