import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseId: {
    type: Number,
    unique: true,
    sparse: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  credits: {
    type: Number,
    default: 3
  },
  department: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['Undergraduate', 'Graduate', 'Postgraduate', 'Beginner', 'Intermediate', 'Advanced'],
    default: 'Undergraduate'
  },
  duration: {
    weeks: Number,
    hours: Number
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  thumbnail: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-increment courseId
courseSchema.pre('save', async function(next) {
  if (!this.courseId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.courseId) {
    try {
      const lastCourse = await this.constructor.findOne({ courseId: { $ne: null } })
        .sort({ courseId: -1 })
        .select('courseId')
        .lean();
      this.courseId = lastCourse ? lastCourse.courseId + 1 : 1;
      console.log(`🆔 Auto-generated courseId: ${this.courseId}`);
    } catch (error) {
      console.error('Error generating courseId:', error);
      return next(error);
    }
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
