import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByStudent,
  updatePaymentStatus,
  deletePayment,
  getPaymentStats
} from '../controllers/paymentController.js';

const router = express.Router();

// Payment routes
router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/stats/summary', getPaymentStats);
router.get('/student/:studentId', getPaymentsByStudent);
router.get('/:id', getPaymentById);
router.put('/:id/status', updatePaymentStatus);
router.delete('/:id', deletePayment);

export default router;
