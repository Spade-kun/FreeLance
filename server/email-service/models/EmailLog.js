const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  emailLogId: {
    type: Number,
    required: false
  },
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['new-activity', 'grade-notification', 'attendance-alert', 'welcome', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  activityId: {
    type: String
  },
  courseId: {
    type: String
  },
  sentAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-increment emailLogId
emailLogSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastLog = await this.constructor.findOne().sort('-emailLogId');
      this.emailLogId = lastLog ? lastLog.emailLogId + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
