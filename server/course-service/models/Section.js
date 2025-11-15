import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: Number,
    unique: true,
    sparse: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sectionName: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Instructor is required']
  },
  capacity: {
    type: Number,
    default: 30
  },
  enrolled: {
    type: Number,
    default: 0
  },
  room: {
    type: String,
    trim: true
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-increment sectionId
sectionSchema.pre('save', async function(next) {
  if (!this.sectionId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.sectionId) {
    try {
      const lastSection = await this.constructor.findOne({ sectionId: { $ne: null } })
        .sort({ sectionId: -1 })
        .select('sectionId')
        .lean();
      this.sectionId = lastSection ? lastSection.sectionId + 1 : 1;
      console.log(`🆔 Auto-generated sectionId: ${this.sectionId}`);
    } catch (error) {
      console.error('Error generating sectionId:', error);
      return next(error);
    }
  }
  next();
});

const Section = mongoose.model('Section', sectionSchema);

export default Section;
