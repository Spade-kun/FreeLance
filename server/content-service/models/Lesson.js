import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  lessonId: {
    type: Number,
    unique: true,
    sparse: true
  },
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
    enum: ['text', 'video', 'document', 'quiz', 'pdf', 'presentation', 'link', 'mixed'],
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

// Auto-increment lessonId
lessonSchema.pre('save', async function(next) {
  if (!this.lessonId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.lessonId) {
    try {
      const lastLesson = await this.constructor.findOne({ lessonId: { $ne: null } })
        .sort({ lessonId: -1 })
        .select('lessonId')
        .lean();
      this.lessonId = lastLesson ? lastLesson.lessonId + 1 : 1;
      console.log(`🆔 Auto-generated lessonId: ${this.lessonId}`);
    } catch (error) {
      console.error('Error generating lessonId:', error);
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Lesson', lessonSchema);
