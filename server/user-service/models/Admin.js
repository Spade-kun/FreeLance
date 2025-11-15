import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  adminId: {
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
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_courses', 'manage_content', 'view_reports', 'view_dashboard', 'system_maintenance']
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

// Auto-increment adminId
adminSchema.pre('save', async function(next) {
  if (!this.adminId && !this.isNew) {
    return next();
  }
  
  if (this.isNew && !this.adminId) {
    try {
      const lastAdmin = await this.constructor.findOne({ adminId: { $ne: null } })
        .sort({ adminId: -1 })
        .select('adminId')
        .lean();
      this.adminId = lastAdmin ? lastAdmin.adminId + 1 : 1;
      console.log(`🆔 Auto-generated adminId: ${this.adminId}`);
    } catch (error) {
      console.error('Error generating adminId:', error);
      return next(error);
    }
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
