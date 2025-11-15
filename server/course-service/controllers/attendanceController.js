import Attendance from '../models/Attendance.js';
import Enrollment from '../models/Enrollment.js';
import Section from '../models/Section.js';

// Get all attendance records for a section
export const getSectionAttendance = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const attendanceRecords = await Attendance.find({ sectionId })
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Get attendance for a specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { date } = req.query;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      sectionId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};

// Create or update attendance record
export const saveAttendance = async (req, res) => {
  try {
    const { sectionId, courseId, date, records, notes, instructorId: reqInstructorId } = req.body;
    
    // Get instructor ID from req.user (if auth middleware is present) or from request body
    const instructorId = req.user?.userId || req.user?._id || reqInstructorId;
    
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: 'Instructor ID is required'
      });
    }

    // Validate section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Check if instructor owns this section
    if (section.instructorId.toString() !== instructorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage attendance for this section'
      });
    }

    // Check if attendance already exists for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      sectionId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (attendance) {
      // Update existing attendance
      attendance.records = records;
      attendance.notes = notes;
      await attendance.save();

      return res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance
      });
    }

    // Create new attendance record
    attendance = new Attendance({
      sectionId,
      courseId,
      date: startOfDay,
      records,
      takenBy: instructorId,
      notes
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save attendance',
      error: error.message
    });
  }
};

// Get enrolled students for a section
export const getSectionStudents = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const enrollments = await Enrollment.find({ 
      sectionId,
      status: { $in: ['enrolled', 'active'] }
    })
    .select('studentId enrollmentId status')
    .lean();

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching section students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

// Get attendance statistics for a section
export const getAttendanceStats = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const attendanceRecords = await Attendance.find({ sectionId }).lean();
    
    if (attendanceRecords.length === 0) {
      return res.json({
        success: true,
        data: {
          totalSessions: 0,
          studentStats: []
        }
      });
    }

    // Calculate stats per student
    const studentStatsMap = new Map();

    attendanceRecords.forEach(record => {
      record.records.forEach(({ studentId, status }) => {
        const key = studentId.toString();
        if (!studentStatsMap.has(key)) {
          studentStatsMap.set(key, {
            studentId,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0
          });
        }
        
        const stats = studentStatsMap.get(key);
        stats[status]++;
        stats.total++;
        studentStatsMap.set(key, stats);
      });
    });

    const studentStats = Array.from(studentStatsMap.values()).map(stats => ({
      ...stats,
      attendanceRate: ((stats.present + stats.late) / stats.total * 100).toFixed(2)
    }));

    res.json({
      success: true,
      data: {
        totalSessions: attendanceRecords.length,
        studentStats
      }
    });
  } catch (error) {
    console.error('Error calculating attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate attendance statistics',
      error: error.message
    });
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const instructorId = req.user?.userId || req.user?._id || req.body?.instructorId;
    
    if (!instructorId) {
      return res.status(401).json({
        success: false,
        message: 'Instructor ID is required'
      });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if instructor owns this attendance record
    if (attendance.takenBy.toString() !== instructorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this attendance record'
      });
    }

    await Attendance.findByIdAndDelete(attendanceId);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance',
      error: error.message
    });
  }
};
