import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Course ID is required']
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  files: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Module', moduleSchema);
