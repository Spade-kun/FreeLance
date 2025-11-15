import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: Number,
    unique: true,
    sparse: true // Allows multiple null values without duplicate key error
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  guardianName: {
    type: String
  },
  guardianPhone: {
    type: String
  },
  guardianEmail: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-increment studentId
studentSchema.pre('save', async function(next) {
  if (!this.studentId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.studentId) {
    try {
      const lastStudent = await this.constructor.findOne({ studentId: { $ne: null } })
        .sort({ studentId: -1 })
        .select('studentId')
        .lean();
      this.studentId = lastStudent ? lastStudent.studentId + 1 : 1;
      console.log(`🆔 Auto-generated studentId: ${this.studentId}`);
    } catch (error) {
      console.error('Error generating studentId:', error);
      return next(error);
    }
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
