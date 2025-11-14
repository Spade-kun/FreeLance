import Admin from '../models/Admin.js';
import Instructor from '../models/Instructor.js';
import Student from '../models/Student.js';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:1002';

// Helper function to create auth account
const createAuthAccount = async (email, password, role, userId) => {
  try {
    await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {
      email,
      password,
      role,
      userId
    });
  } catch (error) {
    console.error('Error creating auth account:', error.message);
    throw new Error('Failed to create authentication account');
  }
};

// ADMIN CONTROLLERS

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    
    // Create auth account
    const defaultPassword = 'Admin@123'; // Should be changed on first login
    try {
      await createAuthAccount(admin.email, defaultPassword, 'admin', admin._id);
    } catch (authError) {
      await Admin.findByIdAndDelete(admin._id);
      throw authError;
    }

    res.status(201).json({ 
      success: true, 
      data: admin,
      message: 'Admin created successfully. Default password: Admin@123'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// INSTRUCTOR CONTROLLERS

export const getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.status(200).json({ success: true, data: instructor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.create(req.body);
    
    // Create auth account
    const defaultPassword = 'Instructor@123';
    try {
      await createAuthAccount(instructor.email, defaultPassword, 'instructor', instructor._id);
    } catch (authError) {
      await Instructor.findByIdAndDelete(instructor._id);
      throw authError;
    }

    res.status(201).json({ 
      success: true, 
      data: instructor,
      message: 'Instructor created successfully. Default password: Instructor@123'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.status(200).json({ success: true, data: instructor });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// STUDENT CONTROLLERS

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    
    // Create auth account
    const defaultPassword = 'Student@123';
    try {
      await createAuthAccount(student.email, defaultPassword, 'student', student._id);
    } catch (authError) {
      await Student.findByIdAndDelete(student._id);
      throw authError;
    }

    res.status(201).json({ 
      success: true, 
      data: student,
      message: 'Student created successfully. Default password: Student@123'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PROFILE CONTROLLERS

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    let profile;
    if (role === 'admin') {
      profile = await Admin.findById(id);
    } else if (role === 'instructor') {
      profile = await Instructor.findById(id);
    } else if (role === 'student') {
      profile = await Student.findById(id);
    }

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    let profile;
    if (role === 'admin') {
      profile = await Admin.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else if (role === 'instructor') {
      profile = await Instructor.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else if (role === 'student') {
      profile = await Student.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
