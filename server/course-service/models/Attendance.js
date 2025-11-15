import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  attendanceId: {
    type: Number,
    unique: true,
    sparse: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Attendance date is required'],
    default: Date.now
  },
  records: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent'
    },
    remarks: {
      type: String,
      trim: true
    }
  }],
  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Instructor ID is required']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records for same section and date
attendanceSchema.index({ sectionId: 1, date: 1 }, { unique: true });

// Auto-increment attendanceId
attendanceSchema.pre('save', async function(next) {
  if (!this.attendanceId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.attendanceId) {
    try {
      const lastAttendance = await this.constructor.findOne({ attendanceId: { $ne: null } })
        .sort({ attendanceId: -1 })
        .select('attendanceId')
        .lean();
      this.attendanceId = lastAttendance ? lastAttendance.attendanceId + 1 : 1;
      console.log(`🆔 Auto-generated attendanceId: ${this.attendanceId}`);
    } catch (error) {
      console.error('Error generating attendanceId:', error);
      return next(error);
    }
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
