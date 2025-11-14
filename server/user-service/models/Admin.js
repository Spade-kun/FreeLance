import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
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
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_courses', 'manage_content', 'view_reports', 'system_maintenance']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
