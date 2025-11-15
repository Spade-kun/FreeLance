import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for admin operations
 * Provides common functionality for CRUD operations with loading and error states
 */
export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeOperation = useCallback(async (operation, successMessage = null) => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      if (successMessage) {
        // You can use a toast notification library here
        console.log(successMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Operation failed';
      setError(errorMessage);
      console.error('Admin operation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeOperation,
    clearError
  };
};

/**
 * Hook for user management operations
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const { loading, error, executeOperation, clearError } = useAdmin();

  const fetchAllUsers = useCallback(async () => {
    return executeOperation(async () => {
      const [studentsRes, instructorsRes, adminsRes] = await Promise.all([
        api.getStudents(),
        api.getInstructors(),
        api.getAdmins()
      ]);

      const allUsers = [
        ...(studentsRes.data || []).map(u => ({ ...u, role: 'student' })),
        ...(instructorsRes.data || []).map(u => ({ ...u, role: 'instructor' })),
        ...(adminsRes.data || []).map(u => ({ ...u, role: 'admin' }))
      ];

      setUsers(allUsers);
      return allUsers;
    });
  }, [executeOperation]);

  const createUser = useCallback(async (userData, role) => {
    return executeOperation(async () => {
      let response;
      if (role === 'student') {
        response = await api.createStudent(userData);
      } else if (role === 'instructor') {
        response = await api.createInstructor(userData);
      } else if (role === 'admin') {
        response = await api.createAdmin(userData);
      }
      return response;
    }, `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`);
  }, [executeOperation]);

  const updateUser = useCallback(async (userId, userData, role) => {
    return executeOperation(async () => {
      let response;
      if (role === 'student') {
        response = await api.updateStudent(userId, userData);
      } else if (role === 'instructor') {
        response = await api.updateInstructor(userId, userData);
      } else if (role === 'admin') {
        response = await api.updateAdmin(userId, userData);
      }
      return response;
    }, 'User updated successfully!');
  }, [executeOperation]);

  const deleteUser = useCallback(async (userId, role) => {
    return executeOperation(async () => {
      let response;
      if (role === 'student') {
        response = await api.deleteStudent(userId);
      } else if (role === 'instructor') {
        response = await api.deleteInstructor(userId);
      } else if (role === 'admin') {
        response = await api.deleteAdmin(userId);
      }
      return response;
    }, 'User deleted successfully!');
  }, [executeOperation]);

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError
  };
};

/**
 * Hook for course management operations
 */
export const useCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState({});
  const [enrollments, setEnrollments] = useState([]);
  const { loading, error, executeOperation, clearError } = useAdmin();

  const fetchAllCourses = useCallback(async () => {
    return executeOperation(async () => {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.getCourses(),
        api.getEnrollments()
      ]);

      const coursesData = coursesRes.data || [];
      setCourses(coursesData);
      setEnrollments(enrollmentsRes.data || []);

      // Fetch sections for each course
      const sectionsData = {};
      for (const course of coursesData) {
        try {
          const sectionsRes = await api.getCourseSections(course._id);
          sectionsData[course._id] = sectionsRes.data || [];
        } catch (err) {
          sectionsData[course._id] = [];
        }
      }
      setSections(sectionsData);

      return { courses: coursesData, sections: sectionsData, enrollments: enrollmentsRes.data };
    });
  }, [executeOperation]);

  const createCourse = useCallback(async (courseData) => {
    return executeOperation(
      () => api.createCourse(courseData),
      'Course created successfully!'
    );
  }, [executeOperation]);

  const updateCourse = useCallback(async (courseId, courseData) => {
    return executeOperation(
      () => api.updateCourse(courseId, courseData),
      'Course updated successfully!'
    );
  }, [executeOperation]);

  const deleteCourse = useCallback(async (courseId) => {
    return executeOperation(
      () => api.deleteCourse(courseId),
      'Course deleted successfully!'
    );
  }, [executeOperation]);

  const createSection = useCallback(async (courseId, sectionData) => {
    return executeOperation(
      () => api.createSection(courseId, sectionData),
      'Section created successfully!'
    );
  }, [executeOperation]);

  const deleteSection = useCallback(async (courseId, sectionId) => {
    return executeOperation(
      () => api.deleteSection(courseId, sectionId),
      'Section deleted successfully!'
    );
  }, [executeOperation]);

  const enrollStudent = useCallback(async (enrollmentData) => {
    return executeOperation(
      () => api.enrollStudent(enrollmentData),
      'Student enrolled successfully!'
    );
  }, [executeOperation]);

  const deleteEnrollment = useCallback(async (enrollmentId) => {
    return executeOperation(
      () => api.deleteEnrollment(enrollmentId),
      'Enrollment removed successfully!'
    );
  }, [executeOperation]);

  return {
    courses,
    sections,
    enrollments,
    loading,
    error,
    fetchAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    createSection,
    deleteSection,
    enrollStudent,
    deleteEnrollment,
    clearError
  };
};

/**
 * Hook for content management operations
 */
export const useContentManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const { loading, error, executeOperation, clearError } = useAdmin();

  const fetchAllContent = useCallback(async (courses = []) => {
    return executeOperation(async () => {
      const [announcementsRes] = await Promise.all([
        api.getAnnouncements()
      ]);

      setAnnouncements(announcementsRes.data || []);

      // Fetch modules for each course
      const allModules = [];
      const lessonsData = {};
      
      for (const course of courses) {
        try {
          const modulesRes = await api.getCourseModules(course._id);
          const courseModules = modulesRes.data || [];
          allModules.push(...courseModules);

          // Fetch lessons for each module
          for (const module of courseModules) {
            try {
              const lessonsRes = await api.getModuleLessons(module._id);
              lessonsData[module._id] = lessonsRes.data || [];
            } catch (err) {
              lessonsData[module._id] = [];
            }
          }
        } catch (err) {
          console.error('Error fetching modules for course:', course._id, err);
        }
      }

      setModules(allModules);
      setLessons(lessonsData);

      return { announcements: announcementsRes.data, modules: allModules, lessons: lessonsData };
    });
  }, [executeOperation]);

  const createAnnouncement = useCallback(async (announcementData) => {
    return executeOperation(
      () => api.createAnnouncement(announcementData),
      'Announcement created successfully!'
    );
  }, [executeOperation]);

  const updateAnnouncement = useCallback(async (announcementId, announcementData) => {
    return executeOperation(
      () => api.updateAnnouncement(announcementId, announcementData),
      'Announcement updated successfully!'
    );
  }, [executeOperation]);

  const deleteAnnouncement = useCallback(async (announcementId) => {
    return executeOperation(
      () => api.deleteAnnouncement(announcementId),
      'Announcement deleted successfully!'
    );
  }, [executeOperation]);

  const createModule = useCallback(async (moduleData) => {
    return executeOperation(
      () => api.createModule(moduleData),
      'Module created successfully!'
    );
  }, [executeOperation]);

  const updateModule = useCallback(async (moduleId, moduleData) => {
    return executeOperation(
      () => api.updateModule(moduleId, moduleData),
      'Module updated successfully!'
    );
  }, [executeOperation]);

  const deleteModule = useCallback(async (moduleId) => {
    return executeOperation(
      () => api.deleteModule(moduleId),
      'Module deleted successfully!'
    );
  }, [executeOperation]);

  const createLesson = useCallback(async (lessonData) => {
    return executeOperation(
      () => api.createLesson(lessonData),
      'Lesson created successfully!'
    );
  }, [executeOperation]);

  const deleteLesson = useCallback(async (lessonId) => {
    return executeOperation(
      () => api.deleteLesson(lessonId),
      'Lesson deleted successfully!'
    );
  }, [executeOperation]);

  return {
    announcements,
    modules,
    lessons,
    loading,
    error,
    fetchAllContent,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    deleteLesson,
    clearError
  };
};

/**
 * Hook for dashboard statistics
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeAnnouncements: 0
  });
  const { loading, error, executeOperation, clearError } = useAdmin();

  const fetchDashboardStats = useCallback(async () => {
    return executeOperation(async () => {
      const [studentsRes, instructorsRes, coursesRes, enrollmentsRes, announcementsRes] = await Promise.all([
        api.getStudents(),
        api.getInstructors(),
        api.getCourses(),
        api.getEnrollments(),
        api.getAnnouncements({ isActive: true })
      ]);

      const newStats = {
        totalStudents: studentsRes.data?.length || 0,
        totalInstructors: instructorsRes.data?.length || 0,
        totalCourses: coursesRes.data?.length || 0,
        totalEnrollments: enrollmentsRes.data?.length || 0,
        activeAnnouncements: announcementsRes.data?.length || 0
      };

      setStats(newStats);
      return newStats;
    });
  }, [executeOperation]);

  return {
    stats,
    loading,
    error,
    fetchDashboardStats,
    clearError
  };
};

/**
 * Hook for reports and attendance
 */
export const useReports = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const { loading, error, executeOperation, clearError } = useAdmin();

  const fetchEnrollments = useCallback(async () => {
    return executeOperation(async () => {
      const response = await api.getEnrollments();
      setEnrollments(response.data || []);
      return response.data;
    });
  }, [executeOperation]);

  const recordAttendance = useCallback(async (attendanceData) => {
    return executeOperation(
      () => api.recordAttendance(attendanceData),
      'Attendance recorded successfully!'
    );
  }, [executeOperation]);

  const fetchCourseAttendance = useCallback(async (courseId, sectionId = null) => {
    return executeOperation(async () => {
      const response = await api.getCourseAttendance(courseId, sectionId);
      setAttendance(response.data || []);
      return response.data;
    });
  }, [executeOperation]);

  return {
    enrollments,
    attendance,
    loading,
    error,
    fetchEnrollments,
    recordAttendance,
    fetchCourseAttendance,
    clearError
  };
};
