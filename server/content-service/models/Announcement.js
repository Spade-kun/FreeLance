import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  authorRole: {
    type: String,
    enum: ['admin', 'instructor'],
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'instructors', 'specific_course'],
    default: 'all'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Announcement', announcementSchema);
