import Announcement from '../models/Announcement.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';

// ANNOUNCEMENT CONTROLLERS

export const getAnnouncements = async (req, res) => {
  try {
    const { targetAudience, courseId } = req.query;
    const filter = { isActive: true };
    
    if (targetAudience) filter.targetAudience = targetAudience;
    if (courseId) filter.courseId = courseId;
    
    const announcements = await Announcement.find(filter).sort({ publishDate: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MODULE CONTROLLERS

export const getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.status(200).json({ success: true, data: modules });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const moduleData = { ...req.body, courseId: req.params.courseId };
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      moduleData.files = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/api/content/files/${file.filename}`,
        fileSize: file.size,
        fileType: file.mimetype
      }));
    }
    
    const module = await Module.create(moduleData);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: `/api/content/files/${file.filename}`,
        fileSize: file.size,
        fileType: file.mimetype
      }));
      
      // Get existing module to preserve existing files
      const existingModule = await Module.findById(req.params.id);
      if (existingModule && existingModule.files) {
        updateData.files = [...existingModule.files, ...newFiles];
      } else {
        updateData.files = newFiles;
      }
    }
    
    const module = await Module.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    // Also delete associated lessons
    await Lesson.deleteMany({ moduleId: req.params.id });
    res.status(200).json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LESSON CONTROLLERS

export const getLessonsByModule = async (req, res) => {
  try {
    const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLesson = async (req, res) => {
  try {
    const lessonData = { ...req.body, moduleId: req.params.moduleId };
    const lesson = await Lesson.create(lessonData);
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FILE CONTROLLERS

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadFile = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if download is explicitly requested via query parameter
    if (req.query.download === 'true') {
      return res.download(filePath);
    }
    
    // Otherwise, send file inline for viewing (enables PDF embedding)
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteModuleFile = async (req, res) => {
  try {
    const { moduleId, filename } = req.params;
    
    // Remove file from module document
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    module.files = module.files.filter(f => !f.fileUrl.includes(filename));
    await module.save();
    
    // Delete physical file
    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
