import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Course ID is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Section ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Student ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: [true, 'Status is required']
  },
  remarks: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ courseId: 1, sectionId: 1, studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
