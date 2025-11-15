import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  moduleId: {
    type: Number,
    unique: true,
    sparse: true
  },
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
  }
}, {
  timestamps: true
});

// Auto-increment moduleId
moduleSchema.pre('save', async function(next) {
  if (!this.moduleId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.moduleId) {
    try {
      const lastModule = await this.constructor.findOne({ moduleId: { $ne: null } })
        .sort({ moduleId: -1 })
        .select('moduleId')
        .lean();
      this.moduleId = lastModule ? lastModule.moduleId + 1 : 1;
      console.log(`🆔 Auto-generated moduleId: ${this.moduleId}`);
    } catch (error) {
      console.error('Error generating moduleId:', error);
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Module', moduleSchema);
