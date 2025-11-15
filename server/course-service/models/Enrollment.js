import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  enrollmentId: {
    type: Number,
    unique: true,
    sparse: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'active', 'completed', 'dropped', 'withdrawn'],
    default: 'enrolled'
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'INC', 'W', 'P', null],
    default: null
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1, sectionId: 1 }, { unique: true });

// Auto-increment enrollmentId
enrollmentSchema.pre('save', async function(next) {
  if (!this.enrollmentId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.enrollmentId) {
    try {
      const lastEnrollment = await this.constructor.findOne({ enrollmentId: { $ne: null } })
        .sort({ enrollmentId: -1 })
        .select('enrollmentId')
        .lean();
      this.enrollmentId = lastEnrollment ? lastEnrollment.enrollmentId + 1 : 1;
      console.log(`🆔 Auto-generated enrollmentId: ${this.enrollmentId}`);
    } catch (error) {
      console.error('Error generating enrollmentId:', error);
      return next(error);
    }
  }
  next();
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
