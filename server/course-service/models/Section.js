import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
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

const Section = mongoose.model('Section', sectionSchema);

export default Section;
