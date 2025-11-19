import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Student'
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'PHP', 'EUR', 'GBP']
  },
  paymentType: {
    type: String,
    required: true,
    enum: ['Tuition Fee', 'Enrollment Fee', 'Laboratory Fee', 'Miscellaneous Fee', 'Other']
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'PAYPAL',
    enum: ['PAYPAL', 'CARD', 'BANK_TRANSFER', 'CASH']
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled']
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paypalOrderId: {
    type: String,
    sparse: true
  },
  payerName: {
    type: String,
    required: true
  },
  payerEmail: {
    type: String
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for faster queries
paymentSchema.index({ studentId: 1, paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentDate: -1 });

export default mongoose.model('Payment', paymentSchema);
