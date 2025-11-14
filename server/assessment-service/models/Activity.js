import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Course ID is required']
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Instructor ID is required']
  },
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project', 'discussion'],
    required: true
  },
  instructions: {
    type: String
  },
  totalPoints: {
    type: Number,
    required: [true, 'Total points is required'],
    min: 0
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Activity', activitySchema);
