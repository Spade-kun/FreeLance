import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import Modal from "../Modal/Modal";
import ConfirmModal from "../Modal/ConfirmModal";
import "./instructor.css";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname.split('/').pop();
    if (['dashboard', 'profile', 'courses', 'materials', 'assessment', 'attendance', 'reports'].includes(path)) {
      return path;
    }
    return 'dashboard';
  };

  const [page, setPage] = useState(getCurrentPage());
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    myCourses: 0,
    mySections: 0,
    totalModules: 0,
    totalLessons: 0,
    totalStudents: 0
  });
  const [instructorCourses, setInstructorCourses] = useState([]);
  
  // Courses & Lessons data
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  // Form states for Learning Materials
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Module form fields
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleOrder, setModuleOrder] = useState("");
  const [moduleFiles, setModuleFiles] = useState([]);
  
  // File viewer state for instructor
  const [viewingFile, setViewingFile] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [viewingModule, setViewingModule] = useState(null);
  
  // Lesson form fields
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonType, setLessonType] = useState("video");
  const [lessonOrder, setLessonOrder] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  // Instructor profile data
  const [instructorProfile, setInstructorProfile] = useState(null);
  
  // Attendance data
  const [selectedAttendanceCourse, setSelectedAttendanceCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  
  // Modal state
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  useEffect(() => {
    loadUserData();
  }, []);

  // Sync page state with URL
  useEffect(() => {
    const currentPage = getCurrentPage();
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && page === "profile") {
      fetchInstructorProfile();
    }
  }, [currentUser, page]);

  const loadUserData = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user information');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const instructorId = currentUser?.userId || currentUser?.id;
      if (!instructorId) {
        setError('No instructor ID found');
        return;
      }

      // Fetch all courses and enrollments in parallel
      const [coursesRes, enrollmentsRes] = await Promise.allSettled([
        api.getCourses(),
        api.getEnrollments()
      ]);

      const allCourses = (coursesRes.status === 'fulfilled' && coursesRes.value?.data) || [];
      const allEnrollments = (enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value?.data) || [];

      // Filter courses where instructor teaches
      const instructorCoursesData = [];
      let totalSections = 0;
      let totalModules = 0;
      let totalLessons = 0;
      let totalStudents = 0;

      // Use Promise.allSettled for resilient fetching
      const coursePromises = allCourses.map(async (course) => {
        try {
          // Get sections for this course
          const sectionsRes = await api.getCourseSections(course._id);
          const sections = sectionsRes?.data || [];

          // Filter sections taught by this instructor
          const instructorSections = sections.filter(s => 
            s.instructorId === instructorId || 
            s.instructor === instructorId ||
            s.instructor?._id === instructorId
          );

          if (instructorSections.length > 0) {
            // Get modules for this course
            const modulesRes = await api.getCourseModules(course._id);
            const courseModules = modulesRes?.data || [];
            
            // Get lessons for each module
            let courseLessons = 0;
            await Promise.allSettled(
              courseModules.map(async (module) => {
                try {
                  const lessonsRes = await api.getModuleLessons(module._id);
                  const moduleLessons = lessonsRes?.data || [];
                  courseLessons += moduleLessons.length;
                } catch (err) {
                  console.error(`Error fetching lessons for module ${module._id}:`, err);
                }
              })
            );

            // Count students per section
            const sectionsWithStudents = instructorSections.map(section => {
              const sectionEnrollments = allEnrollments.filter(e => {
                // Handle both populated objects and ID strings
                const enrollmentCourseId = typeof e.courseId === 'object' ? e.courseId?._id : e.courseId;
                const enrollmentSectionId = typeof e.sectionId === 'object' ? e.sectionId?._id : e.sectionId;
                return enrollmentCourseId === course._id && enrollmentSectionId === section._id;
              });
              return {
                ...section,
                studentCount: sectionEnrollments.length,
                students: sectionEnrollments
              };
            });

            const courseStudentCount = sectionsWithStudents.reduce((sum, s) => sum + s.studentCount, 0);

            totalSections += instructorSections.length;
            totalModules += courseModules.length;
            totalLessons += courseLessons;
            totalStudents += courseStudentCount;

            instructorCoursesData.push({
              ...course,
              sections: sectionsWithStudents,
              moduleCount: courseModules.length,
              lessonCount: courseLessons,
              studentCount: courseStudentCount,
              modules: courseModules
            });
          }
        } catch (err) {
          console.error(`Error processing course ${course._id}:`, err);
        }
      });

      await Promise.allSettled(coursePromises);

      setInstructorCourses(instructorCoursesData);
      setDashboardStats({
        myCourses: instructorCoursesData.length,
        mySections: totalSections,
        totalModules: totalModules,
        totalLessons: totalLessons,
        totalStudents: totalStudents
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const instructorId = currentUser?.userId || currentUser?.id;
      if (!instructorId) {
        setError('No instructor ID found');
        return;
      }

      const response = await api.getInstructorById(instructorId);
      if (response?.data) {
        setInstructorProfile(response.data);
      }
    } catch (err) {
      console.error('Error fetching instructor profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmLogout = () => {
    localStorage.clear();
    
    setModal({ 
      isOpen: true, 
      title: 'Goodbye!', 
      message: 'Logged out successfully!', 
      type: 'success' 
    });
    
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  // ---------------- Dashboard ----------------
  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="card">
          <h2>Dashboard Overview</h2>
          <p className="muted small">Loading dashboard data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card">
          <h2>Dashboard Overview</h2>
          <p style={{ color: 'var(--danger)' }}>{error}</p>
          <button className="btn small" onClick={fetchDashboardData}>Retry</button>
        </div>
      );
    }

    return (
      <div>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2>Welcome, {currentUser?.email || 'Instructor'} 👋</h2>
          <p className="muted small">Here's an overview of your teaching activities</p>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card small" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#0284c7' }}>{dashboardStats.myCourses}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>📚 My Courses</p>
          </div>
          <div className="card small" style={{ background: '#f0fdf4', border: '1px solid #22c55e' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#16a34a' }}>{dashboardStats.mySections}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>🏫 My Sections</p>
          </div>
          <div className="card small" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#d97706' }}>{dashboardStats.totalStudents}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>👨‍🎓 Total Students</p>
          </div>
          <div className="card small" style={{ background: '#fefce8', border: '1px solid #eab308' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#ca8a04' }}>{dashboardStats.totalModules}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>📖 Total Modules</p>
          </div>
          <div className="card small" style={{ background: '#fdf4ff', border: '1px solid #a855f7' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#9333ea' }}>{dashboardStats.totalLessons}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>📝 Total Lessons</p>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="card">
          <h2>My Courses</h2>
          {instructorCourses.length === 0 ? (
            <p className="muted small">You are not assigned to any courses yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
              {instructorCourses.map((course) => (
                <div key={course._id} className="card small" style={{ background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>
                        {course.courseCode} - {course.title}
                      </h3>
                      <p className="muted small" style={{ margin: '4px 0' }}>
                        {course.department} | {course.level} | Year {course.year}
                      </p>
                      {course.description && (
                        <p className="small" style={{ margin: '8px 0' }}>{course.description}</p>
                      )}
                      
                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <span className="small">
                          <strong>Sections:</strong> {course.sections.length}
                        </span>
                        <span className="small">
                          <strong>Modules:</strong> {course.moduleCount}
                        </span>
                        <span className="small">
                          <strong>Lessons:</strong> {course.lessonCount}
                        </span>
                      </div>

                      {/* Sections List */}
                      {course.sections.length > 0 && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '8px' }}>
                          <p className="small" style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                            My Sections:
                          </p>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {course.sections.map((section) => (
                              <div 
                                key={section._id}
                                style={{ 
                                  padding: '8px 12px', 
                                  background: '#e0f2fe', 
                                  borderRadius: '8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <span className="small" style={{ color: '#0369a1' }}>
                                  <strong>Section {section.sectionName}</strong> - {section.schedule}
                                </span>
                                <span 
                                  className="small"
                                  style={{
                                    padding: '2px 8px',
                                    background: '#0284c7',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  👨‍🎓 {section.studentCount || 0} students
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Modules & Lessons Preview */}
                      {course.modules && course.modules.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <p className="small" style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                            Course Modules:
                          </p>
                          {course.modules.slice(0, 3).map((module) => (
                            <div key={module._id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                              <p className="small" style={{ margin: 0 }}>
                                📖 Module {module.order}: {module.title}
                              </p>
                            </div>
                          ))}
                          {course.modules.length > 3 && (
                            <p className="muted small" style={{ margin: '8px 0 0 0' }}>
                              + {course.modules.length - 3} more modules...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="btn small" 
                      onClick={() => {
                        setSelectedCourse(course);
                        setPage("materials");
                      }}
                    >
                      View Materials
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button className="btn ghost small" onClick={fetchDashboardData}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    );
  };
  // ---------------- Profile ----------------
  const renderProfile = () => {
    if (loading && !instructorProfile) {
      return (
        <div className="card">
          <p>Loading profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card">
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      );
    }

    const profile = instructorProfile || {};

    return (
      <div>
        {/* Personal Information Card */}
        <div className="card">
          <h2>👤 Personal Information</h2>
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                First Name
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{profile.firstName || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Last Name
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{profile.lastName || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Email
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{profile.email || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Phone
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{profile.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>💼 Professional Information</h2>
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Instructor ID
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{profile.instructorId || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Specialization
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{profile.specialization || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Status
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  background: profile.isActive ? '#d1fae5' : '#fee2e2',
                  color: profile.isActive ? '#065f46' : '#991b1b'
                }}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Hire Date
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {profile.hireDate ? new Date(profile.hireDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          
          {profile.bio && (
            <div style={{ marginTop: '20px' }}>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#666' }}>
                Bio
              </label>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                lineHeight: '1.6',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '5px',
                border: '1px solid #e5e7eb'
              }}>
                {profile.bio}
              </p>
            </div>
          )}

          {profile.qualifications && profile.qualifications.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#666' }}>
                Qualifications
              </label>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {profile.qualifications.map((qual, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{qual}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* System Information Card */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>⚙️ System Information</h2>
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Account Created
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Last Updated
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {/* <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Database ID
              </label>
              <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: '#666' }}>
                {profile._id || 'N/A'}
              </p>
            </div> */}
          </div>
        </div>
      </div>
    );
  };

  // ---------------- Courses ----------------
  const refreshCourses = async () => {
    setLoading(true);
    await fetchDashboardData();
    setLoading(false);
  };

  const viewCourseSections = async (course) => {
    try {
      setLoading(true);
      const sectionsRes = await api.getCourseSections(course._id);
      const sections = sectionsRes?.data || [];
      
      setSelectedCourse({
        ...course,
        sections: sections
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sections:', err);
      alert('Failed to load course sections');
      setLoading(false);
    }
  };

  const renderCourses = () => {
    if (loading) {
      return (
        <div className="card">
          <h2>Manage Courses & Sections</h2>
          <p className="muted small">Loading courses...</p>
        </div>
      );
    }

    return (
      <div>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2>Manage Courses & Sections</h2>
          <p className="muted small">View and manage your assigned courses and sections</p>
        </div>

        {/* Course List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>My Courses ({instructorCourses.length})</h3>
            <button className="btn ghost small" onClick={refreshCourses}>
              🔄 Refresh
            </button>
          </div>

          {instructorCourses.length === 0 ? (
            <p className="muted small">You are not assigned to any courses yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {instructorCourses.map((course) => (
                <div key={course._id} className="card small" style={{ background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0' }}>
                        {course.courseCode} - {course.title}
                      </h4>
                      <p className="muted small" style={{ margin: '4px 0' }}>
                        {course.department} | {course.level} | Year {course.year}
                      </p>
                      
                      <div style={{ marginTop: '12px' }}>
                        <p className="small" style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                          My Sections ({course.sections?.length || 0}):
                        </p>
                        {course.sections && course.sections.length > 0 ? (
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {course.sections.map((section) => (
                              <div 
                                key={section._id}
                                style={{
                                  padding: '8px 12px',
                                  background: '#fff',
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <div>
                                  <p className="small" style={{ margin: 0 }}>
                                    <strong>Section {section.sectionName}</strong>
                                  </p>
                                  <p className="small muted" style={{ margin: '4px 0 0 0' }}>
                                    {section.schedule} | {section.room}
                                  </p>
                                </div>
                                <span 
                                  className="small"
                                  style={{
                                    padding: '4px 8px',
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  👨‍🎓 {section.studentCount || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="muted small">No sections assigned</p>
                        )}
                      </div>
                    </div>

                    <button 
                      className="btn small"
                      onClick={() => {
                        setSelectedCourse(course);
                        setPage("materials");
                      }}
                    >
                      View Materials
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  

  // ---------------- Learning Materials ----------------
  const fetchModules = async (courseId) => {
    try {
      setLoading(true);
      const modulesRes = await api.getCourseModules(courseId);
      setModules(modulesRes?.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching modules:', err);
      alert('Failed to load modules');
      setLoading(false);
    }
  };

  const fetchLessons = async (moduleId) => {
    try {
      setLoading(true);
      const lessonsRes = await api.getModuleLessons(moduleId);
      setLessons(lessonsRes?.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      alert('Failed to load lessons');
      setLoading(false);
    }
  };

  const resetModuleForm = () => {
    setModuleTitle("");
    setModuleDescription("");
    setModuleOrder("");
    setModuleFiles([]);
    setEditingModule(null);
    setShowModuleForm(false);
  };

  const openModuleForm = (module = null) => {
    if (module) {
      // Edit mode
      setEditingModule(module);
      setModuleTitle(module.title);
      setModuleDescription(module.description || "");
      setModuleOrder(String(module.order));
    } else {
      // Add mode
      setEditingModule(null);
      setModuleTitle("");
      setModuleDescription("");
      setModuleOrder(String(modules.length + 1));
    }
    setShowModuleForm(true);
  };

  const validateModuleForm = () => {
    if (!moduleTitle.trim()) {
      alert("Module title is required!");
      return false;
    }
    if (!moduleOrder.trim() || isNaN(moduleOrder)) {
      alert("Please enter a valid module order number!");
      return false;
    }
    return true;
  };

  const addModule = async () => {
    if (!selectedCourse) return alert('No course selected');
    if (!validateModuleForm()) return;

    try {
      setLoading(true);
      await api.createModule({
        courseId: selectedCourse._id,
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        order: parseInt(moduleOrder) || modules.length + 1,
        files: moduleFiles
      });
      
      setModal({ isOpen: true, title: 'Success', message: 'Module created successfully!', type: 'success' });
      resetModuleForm();
      await fetchModules(selectedCourse._id);
    } catch (err) {
      console.error('Error creating module:', err);
      setModal({ isOpen: true, title: 'Error', message: 'Failed to create module: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const updateModule = async () => {
    if (!editingModule) return;
    if (!validateModuleForm()) return;

    try {
      setLoading(true);
      await api.updateModule(editingModule._id, {
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        order: parseInt(moduleOrder),
        files: moduleFiles
      });
      
      setModal({ isOpen: true, title: 'Success', message: 'Module updated successfully!', type: 'success' });
      resetModuleForm();
      await fetchModules(selectedCourse._id);
    } catch (err) {
      console.error('Error updating module:', err);
      setModal({ isOpen: true, title: 'Error', message: 'Failed to update module: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Delete this module? This will also delete all lessons in this module.')) return;
    
    try {
      setLoading(true);
      await api.deleteModule(moduleId);
      setModal({ isOpen: true, title: 'Success', message: 'Module deleted successfully!', type: 'success' });
      await fetchModules(selectedCourse._id);
    } catch (err) {
      console.error('Error deleting module:', err);
      setModal({ isOpen: true, title: 'Error', message: 'Failed to delete module: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const resetLessonForm = () => {
    setLessonTitle("");
    setLessonDescription("");
    setLessonType("video");
    setLessonOrder("");
    setLessonContent("");
    setEditingLesson(null);
    setShowLessonForm(false);
  };

  const openLessonForm = (lesson = null) => {
    if (lesson) {
      // Edit mode
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description || "");
      setLessonType(lesson.type || "video");
      setLessonOrder(String(lesson.order));
      setLessonContent(lesson.content || "");
    } else {
      // Add mode
      setEditingLesson(null);
      setLessonTitle("");
      setLessonDescription("");
      setLessonType("video");
      setLessonOrder(String(lessons.length + 1));
      setLessonContent("");
    }
    setShowLessonForm(true);
  };

  const validateLessonForm = () => {
    if (!lessonTitle.trim()) {
      alert("Lesson title is required!");
      return false;
    }
    if (!lessonOrder.trim() || isNaN(lessonOrder)) {
      alert("Please enter a valid lesson order number!");
      return false;
    }
    if (!lessonType) {
      alert("Please select a lesson type!");
      return false;
    }
    return true;
  };

  const addLesson = async () => {
    if (!selectedModule) return alert('No module selected');
    if (!validateLessonForm()) return;

    try {
      setLoading(true);
      await api.createLesson({
        moduleId: selectedModule._id,
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        type: lessonType,
        order: parseInt(lessonOrder) || lessons.length + 1,
        content: lessonContent.trim()
      });
      
      setModal({ isOpen: true, title: 'Success', message: 'Lesson created successfully!', type: 'success' });
      resetLessonForm();
      await fetchLessons(selectedModule._id);
    } catch (err) {
      console.error('Error creating lesson:', err);
      setModal({ isOpen: true, title: 'Error', message: 'Failed to create lesson: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const updateLesson = async () => {
    if (!editingLesson) return;
    if (!validateLessonForm()) return;

    try {
      setLoading(true);
      await api.updateLesson(editingLesson._id, {
        title: lessonTitle.trim(),
        description: lessonDescription.trim(),
        type: lessonType,
        order: parseInt(lessonOrder),
        content: lessonContent.trim()
      });
      
      setModal({ isOpen: true, title: 'Success', message: 'Lesson updated successfully!', type: 'success' });
      resetLessonForm();
      await fetchLessons(selectedModule._id);
    } catch (err) {
      console.error('Error updating lesson:', err);
      setModal({ isOpen: true, title: 'Error', message: 'Failed to update lesson: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    
    try {
      setLoading(true);
      await api.deleteLesson(lessonId);
      setModal({ isOpen: true, title: 'Success', message: 'Lesson deleted successfully!', type: 'success' });
      await fetchLessons(selectedModule._id);
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setModal({ isOpen: true, title: 'Error', message: 'Failed to delete lesson: ' + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const renderMaterials = () => {
    // Course selection view
    if (!selectedCourse) {
      return (
        <div className="card">
          <h2>Learning Materials</h2>
          <p className="muted small">Select a course to manage its modules and lessons</p>
          
          {loading ? (
            <p className="muted small" style={{ marginTop: '16px' }}>Loading courses...</p>
          ) : instructorCourses.length === 0 ? (
            <p className="muted small" style={{ marginTop: '16px' }}>No courses assigned to you.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              {instructorCourses.map((course) => (
                <div 
                  key={course._id} 
                  className="card small"
                  style={{ cursor: 'pointer', background: '#fafafa' }}
                  onClick={() => {
                    setSelectedCourse(course);
                    fetchModules(course._id);
                  }}
                >
                  <h4 style={{ margin: '0 0 8px 0' }}>
                    {course.courseCode} - {course.title}
                  </h4>
                  <p className="muted small">{course.department} | {course.level}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Module view
    if (selectedCourse && !selectedModule) {
      return (
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button 
                  className="btn ghost small" 
                  onClick={() => {
                    setSelectedCourse(null);
                    setModules([]);
                    resetModuleForm();
                  }}
                >
                  ← Back to Courses
                </button>
                <h2 style={{ margin: '8px 0 0 0' }}>
                  {selectedCourse.courseCode} - {selectedCourse.title}
                </h2>
                <p className="muted small">Manage course modules</p>
              </div>
              {!showModuleForm && (
                <button className="btn small" onClick={() => openModuleForm()}>
                  ➕ Add Module
                </button>
              )}
            </div>
          </div>

          {/* Module Form */}
          {showModuleForm && (
            <div className="card" style={{ marginBottom: '16px', background: '#f9fafb' }}>
              <h3>{editingModule ? 'Edit Module' : 'Add New Module'}</h3>
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Module Title <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="e.g., Introduction to Programming"
                  />
                </div>
                
                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Module Description
                  </label>
                  <textarea
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    placeholder="Describe what this module covers..."
                    rows="3"
                  />
                </div>

                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Module Order <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={moduleOrder}
                    onChange={(e) => setModuleOrder(e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    📎 Attach Files (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setModuleFiles(e.target.files)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.zip,.rar"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  <p className="small" style={{ color: '#666', marginTop: '4px', fontSize: '12px' }}>
                    Accepted: PDF, Word, PowerPoint, Excel, Images, Videos, ZIP (Max 100MB per file)
                  </p>
                  {moduleFiles && moduleFiles.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <p className="small" style={{ fontWeight: 'bold' }}>Selected Files:</p>
                      <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                        {Array.from(moduleFiles).map((file, idx) => (
                          <li key={idx} className="small">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {editingModule && editingModule.files && editingModule.files.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <p className="small" style={{ fontWeight: 'bold' }}>Current Files:</p>
                      <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                        {editingModule.files.map((file, idx) => (
                          <li key={idx} className="small" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <a href={`http://localhost:1001/api/content${file.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                              📄 {file.fileName}
                            </a>
                            <button
                              className="btn ghost small"
                              style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--danger)' }}
                              onClick={async () => {
                                if (confirm(`Delete ${file.fileName}?`)) {
                                  try {
                                    const filename = file.fileUrl.split('/').pop();
                                    await api.deleteModuleFile(editingModule._id, filename);
                                    alert('File deleted!');
                                    await fetchModules(selectedCourse._id);
                                  } catch (err) {
                                    alert('Failed to delete file: ' + err.message);
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    className="btn small" 
                    onClick={editingModule ? updateModule : addModule}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingModule ? 'Update Module' : 'Add Module')}
                  </button>
                  <button 
                    className="btn ghost small" 
                    onClick={resetModuleForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modules List */}
          <div className="card">
            <h3>Course Modules</h3>
            {loading ? (
              <p className="muted small">Loading modules...</p>
            ) : modules.length === 0 ? (
              <p className="muted small">No modules yet. Click "Add Module" to create one.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                {modules.map((module) => (
                  <div key={module._id} className="card small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div 
                        style={{ flex: 1, cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedModule(module);
                          fetchLessons(module._id);
                          resetLessonForm();
                        }}
                      >
                        <h4 style={{ margin: '0 0 8px 0' }}>
                          📖 Module {module.order}: {module.title}
                        </h4>
                        {module.description && (
                          <p className="small">{module.description}</p>
                        )}
                        {module.files && module.files.length > 0 && (
                          <p className="small" style={{ marginTop: '8px', color: '#2e7d32', fontWeight: 'bold' }}>
                            📎 {module.files.length} file(s) attached
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {module.files && module.files.length > 0 && (
                          <button 
                            className="btn small"
                            style={{ background: '#2e7d32', color: 'white' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingModule(viewingModule?._id === module._id ? null : module);
                            }}
                          >
                            📎 View
                          </button>
                        )}
                        <button 
                          className="btn ghost small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModuleForm(module);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn ghost small"
                          style={{ color: 'var(--danger)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModule(module._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Materials Section for Instructor */}
                    {viewingModule?._id === module._id && module.files && module.files.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
                        <h5 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>📎 Module Materials</h5>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {module.files.map((file, idx) => {
                            const isPDF = file.fileType === 'application/pdf' || file.fileName.toLowerCase().endsWith('.pdf');
                            const fileUrl = `http://localhost:1001/api/content${file.fileUrl}`;
                            
                            return (
                              <div key={idx} style={{ 
                                padding: '12px', 
                                background: '#e8f5e9', 
                                border: '1px solid #c8e6c9',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>
                                    📄 {file.fileName}
                                  </p>
                                  <p className="small" style={{ margin: 0, color: '#666' }}>
                                    Size: {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                    {isPDF && ' • PDF Document'}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    className="btn small"
                                    style={{ background: '#2e7d32', color: 'white' }}
                                    onClick={() => {
                                      setViewingFile({ ...file, url: fileUrl });
                                      setShowFileViewer(true);
                                    }}
                                  >
                                    👁️ View
                                  </button>
                                  <a
                                    href={fileUrl}
                                    download
                                    className="btn ghost small"
                                    style={{ textDecoration: 'none' }}
                                  >
                                    ⬇️ Download
                                  </a>
                                  <button
                                    className="btn ghost small"
                                    style={{ color: 'var(--danger)' }}
                                    onClick={async () => {
                                      if (confirm(`Delete ${file.fileName}?`)) {
                                        try {
                                          const filename = file.fileUrl.split('/').pop();
                                          await api.deleteModuleFile(module._id, filename);
                                          alert('File deleted!');
                                          await fetchModules(selectedCourse._id);
                                          setViewingModule(null);
                                        } catch (err) {
                                          alert('Failed to delete file: ' + err.message);
                                        }
                                      }
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Lesson view
    if (selectedModule) {
      return (
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button 
                  className="btn ghost small" 
                  onClick={() => {
                    setSelectedModule(null);
                    setLessons([]);
                    resetLessonForm();
                  }}
                >
                  ← Back to Modules
                </button>
                <h2 style={{ margin: '8px 0 0 0' }}>
                  Module {selectedModule.order}: {selectedModule.title}
                </h2>
                <p className="muted small">Manage module lessons</p>
              </div>
              {!showLessonForm && (
                <button className="btn small" onClick={() => openLessonForm()}>
                  ➕ Add Lesson
                </button>
              )}
            </div>
          </div>

          {/* Lesson Form */}
          {showLessonForm && (
            <div className="card" style={{ marginBottom: '16px', background: '#f9fafb' }}>
              <h3>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Lesson Title <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g., Variables and Data Types"
                  />
                </div>
                
                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Lesson Description
                  </label>
                  <textarea
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Describe what students will learn in this lesson..."
                    rows="3"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Lesson Type <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      value={lessonType}
                      onChange={(e) => setLessonType(e.target.value)}
                    >
                      <option value="video">Video</option>
                      <option value="reading">Reading</option>
                      <option value="assignment">Assignment</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>

                  <div>
                    <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Lesson Order <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={lessonOrder}
                      onChange={(e) => setLessonOrder(e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Content/URL
                  </label>
                  <textarea
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Enter lesson content, video URL, or resource link..."
                    rows="4"
                  />
                  <p className="small muted" style={{ margin: '4px 0 0 0' }}>
                    For videos: Enter YouTube URL or video embed code. For readings: Enter article text or link.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    className="btn small" 
                    onClick={editingLesson ? updateLesson : addLesson}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Add Lesson')}
                  </button>
                  <button 
                    className="btn ghost small" 
                    onClick={resetLessonForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lessons List */}
          <div className="card">
            <h3>Module Lessons</h3>
            {loading ? (
              <p className="muted small">Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <p className="muted small">No lessons yet. Click "Add Lesson" to create one.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                {lessons.map((lesson) => (
                  <div key={lesson._id} className="card small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: '0' }}>
                            Lesson {lesson.order}: {lesson.title}
                          </h4>
                          <span 
                            className="small"
                            style={{
                              padding: '2px 8px',
                              background: lesson.type === 'video' ? '#e0f2fe' : lesson.type === 'reading' ? '#fef3c7' : lesson.type === 'quiz' ? '#e0e7ff' : '#fce7f3',
                              borderRadius: '12px',
                              color: lesson.type === 'video' ? '#0369a1' : lesson.type === 'reading' ? '#b45309' : lesson.type === 'quiz' ? '#4338ca' : '#9f1239'
                            }}
                          >
                            {lesson.type}
                          </span>
                        </div>
                        {lesson.description && (
                          <p className="small" style={{ margin: '8px 0' }}>{lesson.description}</p>
                        )}
                        {lesson.content && (
                          <p className="small muted">
                            Content: {lesson.content.length > 100 ? lesson.content.substring(0, 100) + '...' : lesson.content}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn ghost small"
                          onClick={() => openLessonForm(lesson)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn ghost small"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => deleteLesson(lesson._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };
  // ---------------- Assessment & Grading ----------------
  const [activities, setActivities] = useState([]);
  const [selectedAssessmentCourse, setSelectedAssessmentCourse] = useState(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Activity form fields
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityType, setActivityType] = useState("assignment");
  const [activityInstructions, setActivityInstructions] = useState("");
  const [activityTotalPoints, setActivityTotalPoints] = useState("");
  const [activityDueDate, setActivityDueDate] = useState("");
  const [activityAvailableFrom, setActivityAvailableFrom] = useState("");
  const [activityAllowLate, setActivityAllowLate] = useState(false);
  const [activityLatePenalty, setActivityLatePenalty] = useState("");
  const [activityIsPublished, setActivityIsPublished] = useState(false);

  const fetchActivities = async (courseId) => {
    try {
      setLoading(true);
      const activitiesRes = await api.getCourseActivities(courseId);
      setActivities(activitiesRes?.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching activities:', err);
      alert('Failed to load activities');
      setActivities([]);
      setLoading(false);
    }
  };

  const resetActivityForm = () => {
    setActivityTitle("");
    setActivityDescription("");
    setActivityType("assignment");
    setActivityInstructions("");
    setActivityTotalPoints("");
    setActivityDueDate("");
    setActivityAvailableFrom("");
    setActivityAllowLate(false);
    setActivityLatePenalty("");
    setActivityIsPublished(false);
    setEditingActivity(null);
    setShowActivityForm(false);
  };

  const openActivityForm = (activity = null) => {
    if (activity) {
      // Edit mode
      setEditingActivity(activity);
      setActivityTitle(activity.title);
      setActivityDescription(activity.description);
      setActivityType(activity.type);
      setActivityInstructions(activity.instructions || "");
      setActivityTotalPoints(String(activity.totalPoints));
      setActivityDueDate(activity.dueDate ? new Date(activity.dueDate).toISOString().slice(0, 16) : "");
      setActivityAvailableFrom(activity.availableFrom ? new Date(activity.availableFrom).toISOString().slice(0, 16) : "");
      setActivityAllowLate(activity.allowLateSubmission || false);
      setActivityLatePenalty(activity.latePenalty ? String(activity.latePenalty) : "");
      setActivityIsPublished(activity.isPublished || false);
    } else {
      // Add mode
      setEditingActivity(null);
      setActivityTitle("");
      setActivityDescription("");
      setActivityType("assignment");
      setActivityInstructions("");
      setActivityTotalPoints("100");
      setActivityDueDate("");
      setActivityAvailableFrom(new Date().toISOString().slice(0, 16));
      setActivityAllowLate(false);
      setActivityLatePenalty("10");
      setActivityIsPublished(false);
    }
    setShowActivityForm(true);
  };

  const validateActivityForm = () => {
    if (!activityTitle.trim()) {
      alert("Activity title is required!");
      return false;
    }
    if (!activityDescription.trim()) {
      alert("Activity description is required!");
      return false;
    }
    if (!activityTotalPoints || isNaN(activityTotalPoints) || Number(activityTotalPoints) <= 0) {
      alert("Please enter a valid total points (greater than 0)!");
      return false;
    }
    if (!activityDueDate) {
      alert("Due date is required!");
      return false;
    }
    return true;
  };

  const addActivity = async () => {
    if (!selectedAssessmentCourse) return alert('No course selected');
    if (!validateActivityForm()) return;

    try {
      setLoading(true);
      const instructorId = currentUser?.userId || currentUser?.id;
      const instructorName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email;
      
      await api.createActivity({
        courseId: selectedAssessmentCourse._id,
        instructorId: instructorId,
        title: activityTitle.trim(),
        description: activityDescription.trim(),
        type: activityType,
        instructions: activityInstructions.trim(),
        totalPoints: Number(activityTotalPoints),
        dueDate: new Date(activityDueDate).toISOString(),
        availableFrom: activityAvailableFrom ? new Date(activityAvailableFrom).toISOString() : new Date().toISOString(),
        allowLateSubmission: activityAllowLate,
        latePenalty: activityAllowLate && activityLatePenalty ? Number(activityLatePenalty) : 0,
        isPublished: activityIsPublished,
        // Add data for email notifications
        courseName: selectedAssessmentCourse.courseName,
        courseCode: selectedAssessmentCourse.courseCode,
        instructorName: instructorName
      });
      
      alert('✅ Activity created successfully!\n📧 Email notifications sent to enrolled students.');
      resetActivityForm();
      await fetchActivities(selectedAssessmentCourse._id);
    } catch (err) {
      console.error('Error creating activity:', err);
      alert('❌ Failed to create activity: ' + err.message);
      setLoading(false);
    }
  };

  const updateActivity = async () => {
    if (!editingActivity) return;
    if (!validateActivityForm()) return;

    try {
      setLoading(true);
      
      await api.updateActivity(editingActivity._id, {
        title: activityTitle.trim(),
        description: activityDescription.trim(),
        type: activityType,
        instructions: activityInstructions.trim(),
        totalPoints: Number(activityTotalPoints),
        dueDate: new Date(activityDueDate).toISOString(),
        availableFrom: activityAvailableFrom ? new Date(activityAvailableFrom).toISOString() : new Date().toISOString(),
        allowLateSubmission: activityAllowLate,
        latePenalty: activityAllowLate && activityLatePenalty ? Number(activityLatePenalty) : 0,
        isPublished: activityIsPublished
      });
      
      alert('✅ Activity updated successfully!');
      resetActivityForm();
      await fetchActivities(selectedAssessmentCourse._id);
    } catch (err) {
      console.error('Error updating activity:', err);
      alert('❌ Failed to update activity: ' + err.message);
      setLoading(false);
    }
  };

  const deleteActivity = async (activityId) => {
    if (!confirm('Delete this activity? All student submissions will also be deleted.')) return;
    
    try {
      setLoading(true);
      await api.deleteActivity(activityId);
      alert('✅ Activity deleted successfully!');
      await fetchActivities(selectedAssessmentCourse._id);
    } catch (err) {
      console.error('Error deleting activity:', err);
      alert('❌ Failed to delete activity: ' + err.message);
      setLoading(false);
    }
  };

  const viewSubmissions = async (activity) => {
    try {
      setLoading(true);
      const submissionsRes = await api.getActivitySubmissions(activity._id);
      const submissionsData = submissionsRes?.data || [];
      
      setSelectedActivity(activity);
      setSubmissions(submissionsData);
      setShowSubmissionsModal(true);
      setLoading(false);
      
      if (submissionsData.length === 0) {
        console.log('No submissions yet for this activity.');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      alert('Failed to load submissions');
      setLoading(false);
    }
  };

  const openGradingForm = (submission) => {
    setGradingSubmission(submission);
    setGradeScore(submission.grade?.toString() || "");
    setGradeFeedback(submission.feedback || "");
  };

  const submitGrade = async () => {
    if (!gradingSubmission) return;
    
    const score = Number(gradeScore);
    if (isNaN(score) || score < 0 || score > selectedActivity.totalPoints) {
      alert(`Please enter a valid score between 0 and ${selectedActivity.totalPoints}`);
      return;
    }

    try {
      setLoading(true);
      await api.gradeSubmission(gradingSubmission._id, {
        score: score,
        feedback: gradeFeedback.trim(),
        gradedBy: currentUser?.userId || currentUser?.id
      });
      
      alert('✅ Grade submitted successfully!');
      setGradingSubmission(null);
      setGradeScore("");
      setGradeFeedback("");
      
      // Refresh submissions
      await viewSubmissions(selectedActivity);
    } catch (err) {
      console.error('Error submitting grade:', err);
      alert('❌ Failed to submit grade: ' + err.message);
      setLoading(false);
    }
  };

  const renderAssessment = () => {
    return (
      <div>
        <div className="card" style={{ marginBottom: '16px' }}>
          <h2>Assessment & Grading</h2>
          <p className="muted small">Create activities, manage assessments, and grade student submissions</p>
        </div>

        {/* Course Selector */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3>Select Course</h3>
            {selectedAssessmentCourse && !showActivityForm && (
              <button className="btn small" onClick={() => openActivityForm()}>
                ➕ Add Activity
              </button>
            )}
          </div>
          {loading ? (
            <p className="muted small">Loading courses...</p>
          ) : instructorCourses.length === 0 ? (
            <p className="muted small">No courses assigned to you.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
              {instructorCourses.map((course) => (
                <button
                  key={course._id}
                  className={selectedAssessmentCourse?._id === course._id ? 'btn small' : 'btn ghost small'}
                  onClick={() => {
                    setSelectedAssessmentCourse(course);
                    fetchActivities(course._id);
                    resetActivityForm();
                  }}
                  style={{ textAlign: 'left' }}
                >
                  <div>
                    <strong>{course.courseCode}</strong>
                    <p className="small" style={{ margin: '4px 0 0 0', opacity: 0.8 }}>{course.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity Form */}
        {selectedAssessmentCourse && showActivityForm && (
          <div className="card" style={{ marginBottom: '16px', background: '#f9fafb' }}>
            <h3>{editingActivity ? 'Edit Activity' : 'Create New Activity'}</h3>
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              {/* Title */}
              <div>
                <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Activity Title <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g., Chapter 1 Quiz, Final Project, Midterm Exam"
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Description <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Brief description of the activity..."
                  rows="2"
                />
              </div>

              {/* Type and Points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Activity Type <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="discussion">Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Total Points <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={activityTotalPoints}
                    onChange={(e) => setActivityTotalPoints(e.target.value)}
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Instructions
                </label>
                <textarea
                  value={activityInstructions}
                  onChange={(e) => setActivityInstructions(e.target.value)}
                  placeholder="Detailed instructions for students..."
                  rows="4"
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Available From
                  </label>
                  <input
                    type="datetime-local"
                    value={activityAvailableFrom}
                    onChange={(e) => setActivityAvailableFrom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Due Date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={activityDueDate}
                    onChange={(e) => setActivityDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Late Submission Settings */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', background: '#fff' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={activityAllowLate}
                      onChange={(e) => setActivityAllowLate(e.target.checked)}
                      style={{ width: 'auto', marginRight: '8px' }}
                    />
                    <span className="small" style={{ fontWeight: 'bold' }}>
                      Allow Late Submissions
                    </span>
                  </label>
                </div>

                {activityAllowLate && (
                  <div>
                    <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Late Penalty (% per day)
                    </label>
                    <input
                      type="number"
                      value={activityLatePenalty}
                      onChange={(e) => setActivityLatePenalty(e.target.value)}
                      placeholder="10"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>

              {/* Publish Status */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', background: '#fff' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={activityIsPublished}
                    onChange={(e) => setActivityIsPublished(e.target.checked)}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  <div>
                    <span className="small" style={{ fontWeight: 'bold', display: 'block' }}>
                      Publish Activity
                    </span>
                    <span className="small muted">
                      Students can only see published activities
                    </span>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  className="btn small" 
                  onClick={editingActivity ? updateActivity : addActivity}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingActivity ? 'Update Activity' : 'Create Activity')}
                </button>
                <button 
                  className="btn ghost small" 
                  onClick={resetActivityForm}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activities List */}
        {selectedAssessmentCourse && !showActivityForm && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Activities for {selectedAssessmentCourse.courseCode}</h3>
              <span className="small muted">{activities.length} activities</span>
            </div>
            
            {loading ? (
              <p className="muted small">Loading activities...</p>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <p className="muted">No activities created yet for this course.</p>
                <button className="btn small" onClick={() => openActivityForm()} style={{ marginTop: '12px' }}>
                  ➕ Create First Activity
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {activities.map((activity) => (
                  <div key={activity._id} className="card small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0 }}>{activity.title}</h4>
                          <span 
                            className="small"
                            style={{
                              padding: '2px 8px',
                              background: 
                                activity.type === 'assignment' ? '#e0f2fe' : 
                                activity.type === 'quiz' ? '#fef3c7' : 
                                activity.type === 'exam' ? '#fce7f3' :
                                activity.type === 'project' ? '#e0e7ff' : '#f3e8ff',
                              borderRadius: '12px',
                              color: 
                                activity.type === 'assignment' ? '#0369a1' : 
                                activity.type === 'quiz' ? '#b45309' : 
                                activity.type === 'exam' ? '#9f1239' :
                                activity.type === 'project' ? '#4338ca' : '#7e22ce'
                            }}
                          >
                            {activity.type}
                          </span>
                          <span 
                            className="small"
                            style={{
                              padding: '2px 8px',
                              background: activity.isPublished ? '#dcfce7' : '#fee2e2',
                              borderRadius: '12px',
                              color: activity.isPublished ? '#16a34a' : '#dc2626'
                            }}
                          >
                            {activity.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        
                        {activity.description && (
                          <p className="small" style={{ margin: '4px 0' }}>{activity.description}</p>
                        )}
                        
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <span className="small muted">
                            📊 <strong>{activity.totalPoints}</strong> points
                          </span>
                          {activity.dueDate && (
                            <span className="small muted">
                              📅 Due: <strong>{new Date(activity.dueDate).toLocaleString()}</strong>
                            </span>
                          )}
                          {activity.allowLateSubmission && (
                            <span className="small muted">
                              ⏰ Late: <strong>-{activity.latePenalty}% per day</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-primary small"
                          onClick={() => viewSubmissions(activity)}
                        >
                          📋 View Submissions
                        </button>
                        <button 
                          className="btn ghost small"
                          onClick={() => openActivityForm(activity)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn ghost small"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => deleteActivity(activity._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submissions Modal */}
        {showSubmissionsModal && selectedActivity && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'auto',
            padding: '20px'
          }}>
            <div className="card" style={{ 
              minWidth: '800px', 
              maxWidth: '95%', 
              maxHeight: '90vh',
              overflow: 'auto',
              background: '#fff' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '20px',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: 0 }}>Submissions for: {selectedActivity.title}</h3>
                  <p className="small muted" style={{ margin: '8px 0 0 0' }}>
                    Total Points: {selectedActivity.totalPoints} | 
                    Due: {new Date(selectedActivity.dueDate).toLocaleString()} | 
                    Submissions: {submissions.length}
                  </p>
                </div>
                <button 
                  className="btn ghost small"
                  onClick={() => {
                    setShowSubmissionsModal(false);
                    setSelectedActivity(null);
                    setSubmissions([]);
                    setGradingSubmission(null);
                  }}
                >
                  ✖ Close
                </button>
              </div>

              {loading ? (
                <p className="muted">Loading submissions...</p>
              ) : submissions.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>
                  📭 No submissions yet for this activity
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {submissions.map((submission) => (
                    <div 
                      key={submission._id} 
                      className="card"
                      style={{ 
                        padding: '16px',
                        border: '1px solid #e5e7eb',
                        background: submission.grade !== undefined ? '#f0fdf4' : '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0 }}>
                              👤 Student ID: {submission.studentId}
                            </h4>
                            {submission.isLate && (
                              <span style={{ 
                                background: '#fee2e2', 
                                color: '#dc2626',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}>
                                ⏰ Late
                              </span>
                            )}
                            {(submission.score !== undefined && submission.score !== null) && (
                              <span style={{ 
                                background: '#dcfce7', 
                                color: '#16a34a',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                ✓ Graded
                              </span>
                            )}
                          </div>

                          <p className="small muted" style={{ margin: '4px 0' }}>
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>

                          {submission.content && (
                            <div style={{ 
                              margin: '12px 0',
                              padding: '12px',
                              background: '#f9fafb',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <p className="small" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                {submission.content}
                              </p>
                            </div>
                          )}

                          {/* File Attachments */}
                          {submission.attachments && submission.attachments.length > 0 && (
                            <div style={{ margin: '12px 0' }}>
                              <p className="small" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                📎 Attachments:
                              </p>
                              {submission.attachments.map((att, idx) => (
                                <div key={idx} style={{ marginBottom: '4px' }}>
                                  <a 
                                    href={`http://localhost:1001${att.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="small"
                                    style={{ 
                                      color: '#646cff',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    📄 {att.filename} ({(att.fileSize / 1024).toFixed(2)} KB)
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Current Grade */}
                          {(submission.score !== undefined && submission.score !== null) && (
                            <div style={{ 
                              margin: '12px 0',
                              padding: '12px',
                              background: '#dcfce7',
                              borderRadius: '6px',
                              border: '1px solid #86efac'
                            }}>
                              <p className="small" style={{ margin: 0, fontWeight: 'bold' }}>
                                Grade: {submission.score} / {selectedActivity.totalPoints}
                              </p>
                              {submission.feedback && (
                                <p className="small muted" style={{ margin: '8px 0 0 0' }}>
                                  Feedback: {submission.feedback}
                                </p>
                              )}
                              {submission.gradedAt && (
                                <p className="small muted" style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
                                  Graded on: {new Date(submission.gradedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div style={{ marginLeft: '16px' }}>
                          {gradingSubmission?._id === submission._id ? (
                            <div style={{ 
                              minWidth: '250px',
                              padding: '12px',
                              background: '#fef3c7',
                              borderRadius: '6px',
                              border: '1px solid #fbbf24'
                            }}>
                              <p className="small" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                Grade this submission:
                              </p>
                              <div style={{ marginBottom: '8px' }}>
                                <label className="small" style={{ display: 'block', marginBottom: '4px' }}>
                                  Score (out of {selectedActivity.totalPoints}):
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={selectedActivity.totalPoints}
                                  value={gradeScore}
                                  onChange={(e) => setGradeScore(e.target.value)}
                                  style={{ 
                                    width: '100%', 
                                    padding: '6px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db'
                                  }}
                                />
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label className="small" style={{ display: 'block', marginBottom: '4px' }}>
                                  Feedback (optional):
                                </label>
                                <textarea
                                  rows="3"
                                  value={gradeFeedback}
                                  onChange={(e) => setGradeFeedback(e.target.value)}
                                  placeholder="Great work! / Needs improvement..."
                                  style={{ 
                                    width: '100%', 
                                    padding: '6px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db'
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn-primary small"
                                  onClick={submitGrade}
                                  disabled={loading}
                                >
                                  ✓ Submit
                                </button>
                                <button 
                                  className="btn ghost small"
                                  onClick={() => {
                                    setGradingSubmission(null);
                                    setGradeScore("");
                                    setGradeFeedback("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="btn-primary small"
                              onClick={() => openGradingForm(submission)}
                            >
                              {(submission.score !== undefined && submission.score !== null) ? '✏️ Re-grade' : '📝 Grade'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------------- Reports ----------------
  const [reportStats, setReportStats] = useState(null);

  const fetchInstructorReports = async () => {
    try {
      setLoading(true);
      const instructorId = currentUser?.userId || currentUser?.id;
      
      // Get performance report
      const performanceRes = await api.getInstructorPerformance(instructorId);
      setReportStats(performanceRes?.data || null);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      // Don't show error, just use dashboard data
      setReportStats(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 'reports' && currentUser) {
      fetchInstructorReports();
    }
  }, [page, currentUser]);

  // ---------------- Attendance Management ----------------
  
  const fetchCourseSections = async (courseId) => {
    try {
      setLoadingAttendance(true);
      const response = await api.getCourseSections(courseId);
      if (response.success) {
        setSections(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load course sections',
        type: 'error'
      });
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchSectionStudents = async (sectionId) => {
    try {
      setLoadingAttendance(true);
      const [enrollmentsResponse, studentsResponse] = await Promise.all([
        api.getEnrollments(),
        api.getStudents()
      ]);

      if (enrollmentsResponse.success && studentsResponse.success) {
        const allEnrollments = enrollmentsResponse.data || [];
        const allStudents = studentsResponse.data || [];

        // Filter enrollments for this section only
        const sectionEnrollments = allEnrollments.filter(
          enrollment => enrollment.sectionId === sectionId || 
                       enrollment.sectionId?._id === sectionId ||
                       enrollment.sectionId?.toString() === sectionId.toString()
        );

        // Map enrollments with student details
        const studentsWithDetails = sectionEnrollments.map(enrollment => {
          const studentId = enrollment.studentId?._id || enrollment.studentId;
          const student = allStudents.find(s => 
            s._id === studentId || 
            s._id?.toString() === studentId?.toString()
          );
          
          return {
            studentId: studentId,
            enrollmentId: enrollment.enrollmentId,
            status: enrollment.status,
            studentDetails: student || { 
              firstName: 'Unknown', 
              lastName: 'Student', 
              studentId: 'N/A' 
            }
          };
        });

        console.log('Loaded students for section:', studentsWithDetails);
        setSectionStudents(studentsWithDetails);
        
        // Try to load existing attendance for selected date
        if (attendanceDate) {
          await fetchAttendanceForDate(sectionId, attendanceDate);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setModal({
        isOpen: true,
        title: 'Error',
        message: `Failed to load students: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchAttendanceForDate = async (sectionId, date) => {
    try {
      const response = await api.getAttendanceByDate(sectionId, date);
      if (response.success && response.data) {
        setAttendanceRecords(response.data.records || []);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceRecords([]);
    }
  };

  const fetchAttendanceStats = async (sectionId) => {
    try {
      const response = await api.getAttendanceStats(sectionId);
      if (response.success) {
        setAttendanceStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => {
      const existing = prev.find(r => r.studentId.toString() === studentId.toString());
      if (existing) {
        return prev.map(r =>
          r.studentId.toString() === studentId.toString() ? { ...r, status } : r
        );
      } else {
        return [...prev, { studentId, status, remarks: '' }];
      }
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedSection) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Please select a section',
        type: 'warning'
      });
      return;
    }

    if (!currentUser) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'User information not found. Please login again.',
        type: 'error'
      });
      return;
    }

    try {
      setLoadingAttendance(true);

      // Get instructor ID from user object
      const instructorId = currentUser._id || currentUser.userId || currentUser.id;
      
      console.log('Current User:', currentUser);
      console.log('Instructor ID:', instructorId);

      if (!instructorId) {
        setModal({
          isOpen: true,
          title: 'Error',
          message: 'Instructor ID not found. Please login again.',
          type: 'error'
        });
        return;
      }

      // Ensure all students have a record
      const allRecords = sectionStudents.map(student => {
        const existing = attendanceRecords.find(
          r => r.studentId.toString() === student.studentId.toString()
        );
        return existing || { studentId: student.studentId, status: 'absent', remarks: '' };
      });

      const attendanceData = {
        sectionId: selectedSection._id,
        courseId: selectedAttendanceCourse._id,
        date: attendanceDate,
        records: allRecords,
        notes: '',
        instructorId: instructorId
      };

      console.log('Sending attendance data:', attendanceData);

      const response = await api.saveAttendance(attendanceData);
      
      if (response.success) {
        setModal({
          isOpen: true,
          title: 'Success',
          message: 'Attendance saved successfully!',
          type: 'success'
        });
        
        // Refresh attendance stats
        await fetchAttendanceStats(selectedSection._id);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Failed to save attendance',
        type: 'error'
      });
    } finally {
      setLoadingAttendance(false);
    }
  };

  const renderAttendance = () => {
    return (
      <div>
        <div className="card" style={{ marginBottom: '16px' }}>
          <h2>Attendance Management</h2>
          <p className="muted small">Track student attendance for your sections</p>
        </div>

        {/* Course Selection */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3>Select Course & Section</h3>
          {loading ? (
            <p className="muted small" style={{ marginTop: '12px' }}>Loading courses...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div>
                <label className="small" style={{ display: 'block', marginBottom: '4px' }}>Course</label>
                <select
                  value={selectedAttendanceCourse?._id || ''}
                  onChange={(e) => {
                    const course = instructorCourses.find(c => c._id === e.target.value);
                    setSelectedAttendanceCourse(course);
                    setSelectedSection(null);
                    setSectionStudents([]);
                    setAttendanceRecords([]);
                    if (course) fetchCourseSections(course._id);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="">-- Select Course --</option>
                  {instructorCourses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} - {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="small" style={{ display: 'block', marginBottom: '4px' }}>Section</label>
              <select
                value={selectedSection?._id || ''}
                onChange={(e) => {
                  const section = sections.find(s => s._id === e.target.value);
                  setSelectedSection(section);
                  setSectionStudents([]);
                  setAttendanceRecords([]);
                  if (section) {
                    fetchSectionStudents(section._id);
                    fetchAttendanceStats(section._id);
                  }
                }}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                disabled={!selectedAttendanceCourse}
              >
                <option value="">-- Select Section --</option>
                {sections.map(section => (
                  <option key={section._id} value={section._id}>
                    {section.sectionName} ({section.enrolled}/{section.capacity} students)
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}

          {selectedSection && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
              <p className="small" style={{ margin: 0 }}>
                <strong>Schedule:</strong> {selectedSection.schedule?.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ') || 'Not set'}
              </p>
              <p className="small" style={{ margin: '4px 0 0' }}>
                <strong>Room:</strong> {selectedSection.room || 'Not set'}
              </p>
            </div>
          )}
        </div>

        {/* Date Selection */}
        {selectedSection && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label className="small" style={{ display: 'block', marginBottom: '4px' }}>Attendance Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => {
                    setAttendanceDate(e.target.value);
                    fetchAttendanceForDate(selectedSection._id, e.target.value);
                  }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <button
                className="btn primary"
                onClick={handleSaveAttendance}
                disabled={loadingAttendance || sectionStudents.length === 0}
              >
                💾 Save Attendance
              </button>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {loadingAttendance && selectedSection && (
          <div className="card">
            <p className="muted" style={{ textAlign: 'center', padding: '20px' }}>
              Loading students...
            </p>
          </div>
        )}

        {!loadingAttendance && sectionStudents.length > 0 && (
          <div className="card">
            <h3>Student Attendance ({sectionStudents.length} students)</h3>
            <table style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectionStudents.map((student) => {
                  const record = attendanceRecords.find(
                    r => r.studentId?.toString() === student.studentId?.toString()
                  );
                  const status = record?.status || 'absent';

                  return (
                    <tr key={student.studentId || student.enrollmentId}>
                      <td>{student.studentDetails?.studentId || 'N/A'}</td>
                      <td>{`${student.studentDetails?.firstName || 'Unknown'} ${student.studentDetails?.lastName || 'Student'}`}</td>
                      <td>
                        <span
                          className="small"
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            background: 
                              status === 'present' ? '#dcfce7' :
                              status === 'late' ? '#fef3c7' :
                              status === 'excused' ? '#dbeafe' : '#fee2e2',
                            color:
                              status === 'present' ? '#16a34a' :
                              status === 'late' ? '#ca8a04' :
                              status === 'excused' ? '#2563eb' : '#dc2626'
                          }}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className={`btn small ${status === 'present' ? 'primary' : 'ghost'}`}
                            onClick={() => handleAttendanceStatusChange(student.studentId, 'present')}
                            title="Present"
                          >
                            ✓
                          </button>
                          <button
                            className={`btn small ${status === 'late' ? 'primary' : 'ghost'}`}
                            onClick={() => handleAttendanceStatusChange(student.studentId, 'late')}
                            title="Late"
                          >
                            ⏰
                          </button>
                          <button
                            className={`btn small ${status === 'excused' ? 'primary' : 'ghost'}`}
                            onClick={() => handleAttendanceStatusChange(student.studentId, 'excused')}
                            title="Excused"
                          >
                            📋
                          </button>
                          <button
                            className={`btn small ${status === 'absent' ? 'danger' : 'ghost'}`}
                            onClick={() => handleAttendanceStatusChange(student.studentId, 'absent')}
                            title="Absent"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Attendance Statistics */}
        {attendanceStats && attendanceStats.totalSessions > 0 && (
          <div className="card" style={{ marginTop: '16px' }}>
            <h3>Attendance Statistics</h3>
            <p className="small muted">Total Sessions: {attendanceStats.totalSessions}</p>
            <table style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Present</th>
                  <th>Late</th>
                  <th>Excused</th>
                  <th>Absent</th>
                  {/* <th>Attendance Rate</th> */}
                </tr>
              </thead>
              <tbody>
                {attendanceStats.studentStats.map((stat) => {
                  const student = sectionStudents.find(
                    s => s.studentId.toString() === stat.studentId.toString()
                  );
                  return (
                    <tr key={stat.studentId}>
                      <td>
                        {student 
                          ? `${student.studentDetails.firstName} ${student.studentDetails.lastName}`
                          : 'Unknown Student'
                        }
                      </td>
                      <td>{stat.present}</td>
                      <td>{stat.late}</td>
                      <td>{stat.excused}</td>
                      <td>{stat.absent}</td>
                      {/* <td>
                        <span
                          className="small"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: stat.attendanceRate >= 75 ? '#dcfce7' : '#fee2e2',
                            color: stat.attendanceRate >= 75 ? '#16a34a' : '#dc2626'
                          }}
                        >
                          {stat.attendanceRate}%
                        </span>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loadingAttendance && selectedSection && sectionStudents.length === 0 && (
          <div className="card">
            <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              No students enrolled in this section yet
            </p>
          </div>
        )}

        {!selectedSection && (
          <div className="card">
            <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              Please select a course and section to manage attendance
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderReports = () => {
    return (
      <div>
        <div className="card" style={{ marginBottom: '16px' }}>
          <h2>Reports & Analytics</h2>
          <p className="muted small">Overview of your teaching performance</p>
        </div>

        {loading ? (
          <p className="muted small" style={{ marginTop: '16px' }}>Loading reports data...</p>
        ) : (
          <>
            {/* Summary Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="card small" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#0284c7' }}>{dashboardStats.myCourses}</h3>
                <p className="muted small" style={{ margin: '4px 0 0' }}>Courses Teaching</p>
              </div>
              <div className="card small" style={{ background: '#f0fdf4', border: '1px solid #22c55e' }}>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#16a34a' }}>{dashboardStats.mySections}</h3>
                <p className="muted small" style={{ margin: '4px 0 0' }}>Sections Assigned</p>
              </div>
              <div className="card small" style={{ background: '#fefce8', border: '1px solid #eab308' }}>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#ca8a04' }}>{dashboardStats.totalModules}</h3>
                <p className="muted small" style={{ margin: '4px 0 0' }}>Total Modules</p>
              </div>
              <div className="card small" style={{ background: '#fdf4ff', border: '1px solid #a855f7' }}>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#9333ea' }}>{dashboardStats.totalLessons}</h3>
                <p className="muted small" style={{ margin: '4px 0 0' }}>Total Lessons</p>
              </div>
            </div>

            {/* Course Overview */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>Course Overview</h3>
                <button className="btn ghost small" onClick={fetchInstructorReports}>
                  🔄 Refresh
                </button>
              </div>

              {instructorCourses.length === 0 ? (
                <p className="muted small">No course data available.</p>
              ) : (
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Title</th>
                  <th>Sections</th>
                  <th>Modules</th>
                  <th>Lessons</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {instructorCourses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.courseCode}</td>
                    <td>{course.title}</td>
                    <td>{course.sections?.length || 0}</td>
                    <td>{course.moduleCount || 0}</td>
                    <td>{course.lessonCount || 0}</td>
                    <td>
                      <span 
                        className="small"
                        style={{
                          padding: '4px 8px',
                          background: course.isActive ? '#dcfce7' : '#fee2e2',
                          color: course.isActive ? '#16a34a' : '#dc2626',
                          borderRadius: '12px'
                        }}
                      >
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
          </>
        )}
      </div>
    );
  };

  const navigateToPage = (pageName) => {
    setPage(pageName);
    navigate(`/instructor/${pageName}`);
    
    // Reset states when changing pages
    if (pageName !== 'materials') {
      setSelectedCourse(null);
      setSelectedModule(null);
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      profile: 'Profile',
      courses: 'My Courses',
      materials: 'Learning Materials',
      assessment: 'Assessment & Grading',
      attendance: 'Attendance Management',
      reports: 'Reports'
    };
    return titles[page] || 'Dashboard';
  };

  return (
    <div className="app">
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="OK"
        cancelText="Cancel"
        type="warning"
      />
      
      <aside className="sidebar">
        <div className="brand">📚 LMS Instructor</div>
        <ul className="nav">
          <li>
            <button 
              className={page === "dashboard" ? "active" : ""} 
              onClick={() => navigateToPage("dashboard")}
            >
              📊 Dashboard
            </button>
          </li>
          <li>
            <button 
              className={page === "courses" ? "active" : ""} 
              onClick={() => navigateToPage("courses")}
            >
              📚 My Courses
            </button>
          </li>
          <li>
            <button 
              className={page === "materials" ? "active" : ""} 
              onClick={() => navigateToPage("materials")}
            >
              📖 Learning Materials
            </button>
          </li>
          <li>
            <button 
              className={page === "assessment" ? "active" : ""} 
              onClick={() => navigateToPage("assessment")}
            >
              ✏️ Assessment & Grading
            </button>
          </li>
          <li>
            <button 
              className={page === "attendance" ? "active" : ""} 
              onClick={() => navigateToPage("attendance")}
            >
              ✅ Attendance
            </button>
          </li>
          <li>
            <button 
              className={page === "reports" ? "active" : ""} 
              onClick={() => navigateToPage("reports")}
            >
              📊 Reports
            </button>
          </li>
          <li>
            <button 
              className={page === "profile" ? "active" : ""} 
              onClick={() => navigateToPage("profile")}
            >
              👤 Profile
            </button>
          </li>
          <li>
            <button className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </li>
        </ul>
        <div className="footer small">
          <p className="muted" style={{ margin: 0 }}>
            {currentUser?.email || 'Instructor'}
          </p>
        </div>
      </aside>

      <main className="content">
        <div className="topbar">
          <h1>{getPageTitle()}</h1>
        </div>

        <div id="pageContent">
          {page === "dashboard" && renderDashboard()}
          {page === "profile" && renderProfile()}
          {page === "courses" && renderCourses()}
          {page === "materials" && renderMaterials()}
          {page === "assessment" && renderAssessment()}
          {page === "attendance" && renderAttendance()}
          {page === "reports" && renderReports()}
        </div>
      </main>
      
      {/* File Viewer Modal */}
      {showFileViewer && viewingFile && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => {
            setShowFileViewer(false);
            setViewingFile(null);
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '1200px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f5f5f5'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>📄 {viewingFile.fileName}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                  {(viewingFile.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={viewingFile.url}
                  download
                  className="btn small"
                  style={{ textDecoration: 'none' }}
                >
                  ⬇️ Download
                </a>
                <button
                  className="btn ghost small"
                  onClick={() => {
                    setShowFileViewer(false);
                    setViewingFile(null);
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', background: '#f9f9f9' }}>
              {viewingFile.fileType === 'application/pdf' || viewingFile.fileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewingFile.url}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title={viewingFile.fileName}
                />
              ) : viewingFile.fileType?.startsWith('image/') ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <img 
                    src={viewingFile.url} 
                    alt={viewingFile.fileName}
                    style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📄</p>
                  <h3 style={{ margin: '0 0 8px 0' }}>{viewingFile.fileName}</h3>
                  <p style={{ margin: '0 0 24px 0' }}>
                    This file type cannot be previewed. Click download to view it.
                  </p>
                  <a
                    href={viewingFile.url}
                    download
                    className="btn"
                    style={{ textDecoration: 'none' }}
                  >
                    ⬇️ Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
