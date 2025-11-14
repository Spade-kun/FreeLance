import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: [true, 'Activity ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Student ID is required']
  },
  content: {
    type: String
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmit'],
    default: 'submitted'
  },
  score: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate submissions
submissionSchema.index({ activityId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
