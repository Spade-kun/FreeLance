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
    fileType: String,
    fileId: String, // Local file ID
    driveFileId: String, // Google Drive file ID
    driveWebViewLink: String, // Google Drive web view link
    fileSize: Number, // File size in bytes
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Legacy fields for backward compatibility
  fileUrl: String,
  fileId: String,
  fileName: String,
  fileSize: Number,
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
  },
  // MVCC version field for concurrency control
  __version: {
    type: Number,
    default: 1
  },
  attemptNumber: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate submissions
submissionSchema.index({ activityId: 1, studentId: 1 }, { unique: true });

// Index for version-based queries
submissionSchema.index({ activityId: 1, studentId: 1, __version: 1 });

export default mongoose.model('Submission', submissionSchema);
