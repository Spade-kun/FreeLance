import Payment from '../models/Payment.js';

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private (Student)
export const createPayment = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      studentEmail,
      amount,
      currency,
      paymentType,
      paymentMethod,
      transactionId,
      paypalOrderId,
      payerName,
      payerEmail,
      description,
      metadata
    } = req.body;

    // Validate required fields
    if (!studentId || !studentName || !studentEmail || !amount || !paymentType || !transactionId || !payerName) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Check if transaction ID already exists
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment with this transaction ID already exists' 
      });
    }

    // Create payment with status from request or default to 'pending'
    const payment = await Payment.create({
      studentId,
      studentName,
      studentEmail,
      amount,
      currency: currency || 'USD',
      paymentType,
      paymentMethod: paymentMethod || 'PAYPAL',
      status: req.body.status || 'pending', // Default to pending, can be overridden
      transactionId,
      paypalOrderId,
      payerName,
      payerEmail,
      description,
      metadata,
      paymentDate: new Date()
    });

    res.status(201).json({ 
      success: true, 
      data: payment,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while creating payment' 
    });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const { 
      status, 
      studentId, 
      paymentType,
      startDate,
      endDate,
      sortBy = 'paymentDate',
      order = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    if (paymentType) filter.paymentType = paymentType;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Get payments with pagination
    const payments = await Payment.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Payment.countDocuments(filter);

    // Calculate statistics
    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.status(200).json({ 
      success: true, 
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        limit: parseInt(limit)
      },
      stats: stats.length > 0 ? stats[0] : { totalAmount: 0, totalPayments: 0, avgAmount: 0 }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while fetching payments' 
    });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: payment 
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while fetching payment' 
    });
  }
};

// @desc    Get payments by student ID
// @route   GET /api/payments/student/:studentId
// @access  Private (Student/Admin)
export const getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, sortBy = 'paymentDate', order = 'desc' } = req.query;

    const filter = { studentId };
    if (status) filter.status = status;

    const sortOrder = order === 'desc' ? -1 : 1;

    const payments = await Payment.find(filter)
      .sort({ [sortBy]: sortOrder });

    // Calculate student's total paid
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({ 
      success: true, 
      data: payments,
      summary: {
        totalPayments: payments.length,
        totalPaid: totalPaid,
        completedPayments: payments.filter(p => p.status === 'completed').length,
        pendingPayments: payments.filter(p => p.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Get payments by student error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while fetching student payments' 
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private (Admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: payment,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while updating payment status' 
    });
  }
};

// @desc    Delete payment (Admin only)
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Payment deleted successfully' 
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while deleting payment' 
    });
  }
};

// @desc    Get payment statistics (Admin)
// @route   GET /api/payments/stats/summary
// @access  Private (Admin)
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Overall statistics
    const overallStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
          totalPayments: { $sum: 1 },
          completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          avgPayment: { $avg: '$amount' }
        }
      }
    ]);

    // Payment by type
    const byType = await Payment.aggregate([
      { $match: { ...filter, status: 'completed' } },
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Payment by month (last 6 months)
    const byMonth = await Payment.aggregate([
      { $match: { ...filter, status: 'completed' } },
      {
        $group: {
          _id: { 
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        overview: overallStats.length > 0 ? overallStats[0] : {
          totalRevenue: 0,
          totalPayments: 0,
          completedPayments: 0,
          pendingPayments: 0,
          failedPayments: 0,
          avgPayment: 0
        },
        byType,
        byMonth
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error while fetching payment statistics' 
    });
  }
};
