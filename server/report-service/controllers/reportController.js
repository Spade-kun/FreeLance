import Attendance from '../models/Attendance.js';
import axios from 'axios';

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:1003';
const COURSE_SERVICE = process.env.COURSE_SERVICE_URL || 'http://localhost:1004';
const ASSESSMENT_SERVICE = process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:1006';

// STUDENT REPORT CONTROLLERS

export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student enrollments
    const enrollmentsRes = await axios.get(`${COURSE_SERVICE}/api/courses/student/${studentId}/enrollments`);
    const enrollments = enrollmentsRes.data.data;

    // Get student grades
    const gradesRes = await axios.get(`${ASSESSMENT_SERVICE}/api/assessments/student/${studentId}/grades`);
    const grades = gradesRes.data.data;

    // Calculate progress for each course
    const progress = enrollments.map(enrollment => {
      const courseGrades = grades.filter(g => g.activityId.courseId.toString() === enrollment.courseId._id.toString());
      const avgScore = courseGrades.length > 0 
        ? courseGrades.reduce((sum, g) => sum + (g.score / g.activityId.totalPoints * 100), 0) / courseGrades.length 
        : 0;

      return {
        course: enrollment.courseId,
        enrollmentStatus: enrollment.status,
        completedActivities: courseGrades.length,
        averageScore: avgScore.toFixed(2)
      };
    });

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;

    const gradesRes = await axios.get(`${ASSESSMENT_SERVICE}/api/assessments/student/${studentId}/grades`);
    const grades = gradesRes.data.data;

    // Group by course
    const gradesByCourse = grades.reduce((acc, grade) => {
      const courseId = grade.activityId.courseId;
      if (!acc[courseId]) {
        acc[courseId] = [];
      }
      acc[courseId].push(grade);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: gradesByCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attendance = await Attendance.find({ studentId });

    // Calculate attendance statistics
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const excused = attendance.filter(a => a.status === 'excused').length;

    const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        records: attendance,
        statistics: {
          total,
          present,
          absent,
          late,
          excused,
          attendanceRate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// INSTRUCTOR REPORT CONTROLLERS

export const getInstructorPerformance = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // Get instructor's courses
    const coursesRes = await axios.get(`${COURSE_SERVICE}/api/courses/instructor/${instructorId}/courses`);
    const sections = coursesRes.data.data;

    // Get performance metrics for each course
    const performance = await Promise.all(sections.map(async (section) => {
      const courseId = section.courseId._id;

      // Get course grades
      try {
        const gradesRes = await axios.get(`${ASSESSMENT_SERVICE}/api/assessments/courses/${courseId}/grades`);
        const grades = gradesRes.data.data;

        const avgScore = grades.length > 0
          ? grades.reduce((sum, g) => sum + (g.score / g.activityId.totalPoints * 100), 0) / grades.length
          : 0;

        return {
          course: section.courseId,
          section: section.sectionName,
          studentsEnrolled: section.enrolled,
          averageScore: avgScore.toFixed(2)
        };
      } catch (error) {
        return {
          course: section.courseId,
          section: section.sectionName,
          studentsEnrolled: section.enrolled,
          averageScore: 0
        };
      }
    }));

    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const coursesRes = await axios.get(`${COURSE_SERVICE}/api/courses/instructor/${instructorId}/courses`);
    const courses = coursesRes.data.data;

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COURSE REPORT CONTROLLERS

export const getCourseStatistics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get course details
    const courseRes = await axios.get(`${COURSE_SERVICE}/api/courses/${courseId}`);
    const course = courseRes.data.data;

    // Get enrollments
    const enrollmentsRes = await axios.get(`${COURSE_SERVICE}/api/courses/enrollments`);
    const allEnrollments = enrollmentsRes.data.data;
    const courseEnrollments = allEnrollments.filter(e => e.courseId._id.toString() === courseId);

    // Get grades
    const gradesRes = await axios.get(`${ASSESSMENT_SERVICE}/api/assessments/courses/${courseId}/grades`);
    const grades = gradesRes.data.data;

    const avgScore = grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.score / g.activityId.totalPoints * 100), 0) / grades.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        course,
        totalEnrollments: courseEnrollments.length,
        averageScore: avgScore.toFixed(2),
        totalGraded: grades.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseStudentPerformance = async (req, res) => {
  try {
    const { courseId } = req.params;

    const gradesRes = await axios.get(`${ASSESSMENT_SERVICE}/api/assessments/courses/${courseId}/grades`);
    const grades = gradesRes.data.data;

    // Group by student
    const performanceByStudent = grades.reduce((acc, grade) => {
      const studentId = grade.studentId.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          grades: [],
          totalScore: 0,
          count: 0
        };
      }
      acc[studentId].grades.push(grade);
      acc[studentId].totalScore += (grade.score / grade.activityId.totalPoints * 100);
      acc[studentId].count += 1;
      return acc;
    }, {});

    // Calculate averages
    const performance = Object.values(performanceByStudent).map(student => ({
      studentId: student.studentId,
      averageScore: (student.totalScore / student.count).toFixed(2),
      completedActivities: student.count
    }));

    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ATTENDANCE CONTROLLERS

export const getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { courseId };
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const attendanceData = { ...req.body, courseId };

    const attendance = await Attendance.create(attendanceData);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already recorded for this student on this date' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ADMIN DASHBOARD CONTROLLERS

export const getDashboardOverview = async (req, res) => {
  try {
    // Get counts from various services
    const [studentsRes, instructorsRes, coursesRes, enrollmentsRes] = await Promise.all([
      axios.get(`${USER_SERVICE}/api/users/students`),
      axios.get(`${USER_SERVICE}/api/users/instructors`),
      axios.get(`${COURSE_SERVICE}/api/courses`),
      axios.get(`${COURSE_SERVICE}/api/courses/enrollments`)
    ]);

    const overview = {
      totalStudents: studentsRes.data.data.length,
      totalInstructors: instructorsRes.data.data.length,
      totalCourses: coursesRes.data.data.length,
      totalEnrollments: enrollmentsRes.data.data.length
    };

    res.status(200).json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalAttendance = await Attendance.countDocuments();
    const todayAttendance = await Attendance.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const stats = {
      totalAttendanceRecords: totalAttendance,
      todayAttendance
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
