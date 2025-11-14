import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required']
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String
  },
  contentType: {
    type: String,
    enum: ['text', 'video', 'pdf', 'presentation', 'link', 'mixed'],
    default: 'text'
  },
  content: {
    type: String
  },
  videoUrl: {
    type: String
  },
  materials: [{
    title: String,
    url: String,
    fileType: String
  }],
  order: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number // in minutes
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Lesson', lessonSchema);
