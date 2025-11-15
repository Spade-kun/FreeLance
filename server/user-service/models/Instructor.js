import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
  instructorId: {
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
  specialization: {
    type: String,
    trim: true
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  bio: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hireDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-increment instructorId
instructorSchema.pre('save', async function(next) {
  if (!this.instructorId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.instructorId) {
    try {
      const lastInstructor = await this.constructor.findOne({ instructorId: { $ne: null } })
        .sort({ instructorId: -1 })
        .select('instructorId')
        .lean();
      this.instructorId = lastInstructor ? lastInstructor.instructorId + 1 : 1;
      console.log(`🆔 Auto-generated instructorId: ${this.instructorId}`);
    } catch (error) {
      console.error('Error generating instructorId:', error);
      return next(error);
    }
  }
  next();
});

const Instructor = mongoose.model('Instructor', instructorSchema);

export default Instructor;
