import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Enrollment from '../models/Enrollment.js';

// COURSE CONTROLLERS

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('prerequisites');
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('prerequisites');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SECTION CONTROLLERS

export const getSectionsByCourse = async (req, res) => {
  try {
    const sections = await Section.find({ courseId: req.params.courseId });
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const sectionData = { ...req.body, courseId: req.params.courseId };
    const section = await Section.create(sectionData);
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.sectionId, req.body, {
      new: true,
      runValidators: true
    });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.status(200).json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ENROLLMENT CONTROLLERS

export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('courseId')
      .populate('sectionId');
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, sectionId } = req.body;

    // Check if section has capacity
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (section.enrolled >= section.capacity) {
      return res.status(400).json({ message: 'Section is full' });
    }

    // Create enrollment
    const enrollment = await Enrollment.create(req.body);

    // Update section enrolled count
    section.enrolled += 1;
    await section.save();

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student is already enrolled in this course section' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Update section enrolled count
    const section = await Section.findById(enrollment.sectionId);
    if (section) {
      section.enrolled = Math.max(0, section.enrolled - 1);
      await section.save();
    }

    res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.params.studentId })
      .populate('courseId')
      .populate('sectionId');
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const sections = await Section.find({ instructorId: req.params.instructorId })
      .populate('courseId');
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
