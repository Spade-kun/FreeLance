import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
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

const Instructor = mongoose.model('Instructor', instructorSchema);

export default Instructor;
