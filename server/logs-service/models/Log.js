import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true,
    enum: ['admin', 'instructor', 'student', 'unknown'],
    index: true
  },
  action: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'OTHER'],
    index: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    index: true
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for common queries
logSchema.index({ createdAt: -1 });
logSchema.index({ userEmail: 1, createdAt: -1 });
logSchema.index({ actionType: 1, createdAt: -1 });
logSchema.index({ userRole: 1, createdAt: -1 });
logSchema.index({ resource: 1, createdAt: -1 });

const Log = mongoose.model('Log', logSchema);

export default Log;