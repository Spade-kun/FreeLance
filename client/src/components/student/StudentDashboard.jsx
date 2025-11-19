import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Modal from "../Modal/Modal";
import ConfirmModal from "../Modal/ConfirmModal";
import "./student.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname.split('/').pop();
    if (['dashboard', 'courses', 'activities', 'grades', 'attendance', 'profile', 'payment'].includes(path)) {
      return path;
    }
    return 'dashboard';
  };

  const [page, setPage] = useState(getCurrentPage());
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard data
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    totalActivities: 0,
    completedActivities: 0,
    pendingActivities: 0
  });

  // Selected course for viewing details
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);
  
  // File viewer state
  const [viewingFile, setViewingFile] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);

  // Activity submission form
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('Tuition Fee');
  const [showPayPalButtons, setShowPayPalButtons] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [pendingPaymentId, setPendingPaymentId] = useState(null);

  // Profile state
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState(null);
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

  const navigateToPage = (pageName) => {
    setPage(pageName);
    navigate(`/student/${pageName}`);
  };

  const loadUserData = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user information');
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const studentId = currentUser?.userId || currentUser?.id;
      if (!studentId) {
        setError('No student ID found');
        setLoading(false);
        return;
      }

      // Fetch student enrollments
      const enrollmentsRes = await api.getEnrollments();
      const allEnrollments = enrollmentsRes?.data || [];
      
      // Filter enrollments for this student
      const studentEnrollments = allEnrollments.filter(e => e.studentId === studentId);
      setEnrollments(studentEnrollments);

      // Extract unique courses from enrollments
      const enrolledCourses = [];
      const courseIds = new Set();
      
      studentEnrollments.forEach(enrollment => {
        const course = typeof enrollment.courseId === 'object' ? enrollment.courseId : null;
        if (course && !courseIds.has(course._id)) {
          courseIds.add(course._id);
          const section = typeof enrollment.sectionId === 'object' ? enrollment.sectionId : null;
          enrolledCourses.push({
            ...course,
            enrollmentStatus: enrollment.status,
            section: section
          });
        }
      });

      setCourses(enrolledCourses);

      // Fetch activities for enrolled courses
      const allActivities = [];
      for (const course of enrolledCourses) {
        try {
          const activitiesRes = await api.getActivitiesByCourse(course._id);
          const courseActivities = activitiesRes?.data || [];
          allActivities.push(...courseActivities.map(a => ({ ...a, course })));
        } catch (err) {
          console.error(`Error fetching activities for course ${course._id}:`, err);
        }
      }
      setActivities(allActivities);

      // Fetch submissions
      let completedCount = 0;
      try {
        const submissionsRes = await api.getSubmissions();
        const allSubmissions = submissionsRes?.data || [];
        const studentSubmissions = allSubmissions.filter(s => s.studentId === studentId);
        setSubmissions(studentSubmissions);
        completedCount = studentSubmissions.filter(s => s.status === 'graded').length;
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }

      // Calculate statistics (always set, even if submissions fetch fails)
      setDashboardStats({
        totalCourses: enrolledCourses.length,
        totalActivities: allActivities.length,
        completedActivities: completedCount,
        pendingActivities: allActivities.length - completedCount
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseModules = async (courseId) => {
    try {
      setLoading(true);
      const modulesRes = await api.getCourseModules(courseId);
      setCourseModules(modulesRes?.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching modules:', err);
      alert('Failed to load course modules');
      setLoading(false);
    }
  };

  const fetchModuleLessons = async (moduleId) => {
    try {
      setLoading(true);
      const lessonsRes = await api.getModuleLessons(moduleId);
      setModuleLessons(lessonsRes?.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      alert('Failed to load module lessons');
      setLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      setProfileLoading(true);
      const studentId = currentUser?._id || currentUser?.userId || currentUser?.id;
      if (!studentId) {
        console.error('No student ID found');
        setProfileLoading(false);
        return;
      }
      
      const response = await api.getStudentById(studentId);
      if (response && response.data) {
        setStudentProfile(response.data);
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const studentId = currentUser?._id || currentUser?.userId || currentUser?.id;
      if (!studentId) {
        console.error('No student ID found for payment history');
        return;
      }

      const response = await api.getPaymentsByStudent(studentId);
      if (response && response.success && response.data) {
        // Transform payment data to match the display format
        const formattedPayments = response.data.map(payment => ({
          id: payment._id,
          date: new Date(payment.paymentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          description: payment.paymentType,
          method: payment.paymentMethod,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status
        }));
        setPaymentHistory(formattedPayments);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
    }
  };

  const openSubmissionForm = (activity) => {
    setSelectedActivity(activity);
    setSubmissionText("");
    setSubmissionFile(null);
    setShowSubmissionForm(true);
  };

  const submitActivity = async () => {
    if (!selectedActivity) return;
    if (!submissionText.trim() && !submissionFile) {
      alert('⚠️ Please provide a submission text or file');
      return;
    }

    try {
      setLoading(true);
      const studentId = currentUser?.userId || currentUser?.id;
      
      console.log('📝 Starting submission for activity:', selectedActivity._id);
      
      const submissionData = {
        activityId: selectedActivity._id,
        studentId: studentId,
        content: submissionText.trim(),
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        attachments: []
      };

      // Upload file to Google Drive if provided
      if (submissionFile) {
        try {
          console.log('📤 Uploading file to Google Drive:', submissionFile.name);
          const uploadResponse = await api.uploadFile(submissionFile, {
            studentId: studentId,
            activityId: selectedActivity._id,
          });

          console.log('Upload response:', uploadResponse);

          if (uploadResponse.success) {
            console.log('✅ File uploaded successfully');
            // Add file info to attachments
            submissionData.attachments.push({
              filename: uploadResponse.data.fileName,
              url: uploadResponse.data.fileUrl,
              fileId: uploadResponse.data.fileId,
              fileSize: uploadResponse.data.size,
              fileType: submissionFile.type
            });

            // Also add to legacy fields for backward compatibility
            submissionData.fileUrl = uploadResponse.data.fileUrl;
            submissionData.fileId = uploadResponse.data.fileId;
            submissionData.fileName = uploadResponse.data.fileName;
            submissionData.fileSize = uploadResponse.data.size;
          } else {
            throw new Error('File upload failed: ' + (uploadResponse.message || 'Unknown error'));
          }
        } catch (uploadErr) {
          console.error('❌ Error uploading file:', uploadErr);
          setLoading(false);
          alert('⚠️ File upload failed: ' + uploadErr.message + '\n\nPlease try again or submit without a file.');
          return; // Stop submission if file upload fails
        }
      }

      console.log('💾 Creating submission in database...', submissionData);
      const response = await api.createSubmission(submissionData);
      console.log('Submission response:', response);
      
      // Close modal and reset form
      setShowSubmissionForm(false);
      setSelectedActivity(null);
      setSubmissionText("");
      setSubmissionFile(null);
      setLoading(false);
      
      // Show success message
      alert('✅ Assignment submitted successfully!' + (submissionFile ? '\n📁 File uploaded successfully' : ''));
      
      // Refresh dashboard data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('❌ Error submitting activity:', err);
      setLoading(false);
      alert('❌ Failed to submit assignment: ' + (err.message || 'Unknown error') + '\n\nPlease try again.');
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
          <h2>Welcome, {currentUser?.firstName || currentUser?.email} 👋</h2>
          <p className="muted small">Here's an overview of your learning progress</p>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card small" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#0284c7' }}>{dashboardStats.totalCourses}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>📚 Enrolled Courses</p>
          </div>
          <div className="card small" style={{ background: '#fef3c7', border: '1px solid #f59e0b' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#d97706' }}>{dashboardStats.totalActivities}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>📝 Total Activities</p>
          </div>
          <div className="card small" style={{ background: '#f0fdf4', border: '1px solid #22c55e' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#16a34a' }}>{dashboardStats.completedActivities}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>✅ Completed</p>
          </div>
          <div className="card small" style={{ background: '#fef2f2', border: '1px solid #ef4444' }}>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#dc2626' }}>{dashboardStats.pendingActivities}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>⏳ Pending</p>
          </div>
        </div>

        {/* My Courses Overview */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2>My Courses ({courses.length})</h2>
          {courses.length === 0 ? (
            <p className="muted small">You are not enrolled in any courses yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              {courses.map((course) => (
                <div key={course._id} className="card small" style={{ background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0' }}>{course.courseCode} - {course.courseName}</h4>
                      <p className="muted small" style={{ margin: '4px 0' }}>
                        {course.department} | {course.level} | {course.credits} Credits
                      </p>
                      {course.section && (
                        <p className="small" style={{ margin: '8px 0 0 0' }}>
                          <strong>Section:</strong> {course.section.sectionName}
                        </p>
                      )}
                      <span style={{ 
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        background: course.enrollmentStatus === 'active' || course.enrollmentStatus === 'enrolled' ? '#f0fdf4' : '#fef3c7',
                        color: course.enrollmentStatus === 'active' || course.enrollmentStatus === 'enrolled' ? '#16a34a' : '#ca8a04'
                      }}>
                        {course.enrollmentStatus?.toUpperCase() || 'ENROLLED'}
                      </span>
                    </div>
                    <button 
                      className="btn small"
                      onClick={() => {
                        setSelectedCourse(course);
                        fetchCourseModules(course._id);
                        navigateToPage('courses');
                      }}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h2>Recent Activities</h2>
          {activities.length === 0 ? (
            <p className="muted small">No activities available.</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {activities.slice(0, 5).map((activity) => {
                const submission = submissions.find(s => s.activityId === activity._id);
                return (
                  <div key={activity._id} style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{activity.title}</p>
                      <p className="muted small" style={{ margin: 0 }}>
                        {activity.course?.courseName} | Due: {new Date(activity.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    {submission ? (
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        background: submission.status === 'graded' ? '#f0fdf4' : '#fef3c7',
                        color: submission.status === 'graded' ? '#16a34a' : '#d97706'
                      }}>
                        {submission.status === 'graded' ? '✅ Graded' : '⏳ Submitted'}
                      </span>
                    ) : (
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        background: '#fef2f2',
                        color: '#dc2626'
                      }}>
                        ❌ Not Submitted
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------- My Courses ----------------
  const renderCourses = () => {
    if (loading && !selectedCourse) {
      return (
        <div className="card">
          <h2>My Courses</h2>
          <p className="muted small">Loading courses...</p>
        </div>
      );
    }

    if (selectedCourse) {
      return (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <button className="btn ghost small" onClick={() => {
              setSelectedCourse(null);
              setCourseModules([]);
              setSelectedModule(null);
              setModuleLessons([]);
            }}>
              ← Back to Courses
            </button>
            <h2 style={{ marginTop: '12px' }}>{selectedCourse.courseCode} - {selectedCourse.courseName}</h2>
            <p className="muted small">{selectedCourse.description}</p>
          </div>

          {/* Modules */}
          <div className="card">
            <h3>Course Modules</h3>
            {courseModules.length === 0 ? (
              <p className="muted small">No modules available yet.</p>
            ) : (
              <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
                {courseModules.map((module) => (
                  <div key={module._id} className="card small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0' }}>
                          Module {module.order}: {module.title}
                        </h4>
                        <p className="muted small">{module.description}</p>
                        {module.files && module.files.length > 0 && (
                          <p className="small" style={{ marginTop: '8px', color: '#2e7d32', fontWeight: 'bold' }}>
                            📎 {module.files.length} file(s) available
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* {module.files && module.files.length > 0 && (
                          <button 
                            className="btn small"
                            style={{ background: '#2e7d32', color: 'white' }}
                            onClick={() => {
                              setSelectedModule(module);
                              setSelectedModule(prev => prev?._id === module._id ? null : module);
                            }}
                          >
                            📎 View Materials
                          </button>
                        )} */}
                        <button 
                          className="btn small"
                          onClick={() => {
                            setSelectedModule(module);
                            fetchModuleLessons(module._id);
                          }}
                        >
                          📚 View Lessons
                        </button>
                      </div>
                    </div>
                    
                    {/* Materials Section */}
                    {selectedModule?._id === module._id && module.files && module.files.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
                        <h5 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>📎 Course Materials</h5>
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
                                  <p className="muted small" style={{ margin: 0 }}>
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
                                    href={`${fileUrl}?download=true`}
                                    className="btn ghost small"
                                    style={{ textDecoration: 'none' }}
                                  >
                                    ⬇️ Download
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {selectedModule?._id === module._id && moduleLessons.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
                        <h5 style={{ margin: '0 0 12px 0' }}>📚 Lessons:</h5>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {moduleLessons.map((lesson) => (
                            <div key={lesson._id} style={{ 
                              padding: '10px', 
                              background: '#fff', 
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px' 
                            }}>
                              <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>
                                Lesson {lesson.order}: {lesson.title}
                              </p>
                              <p className="muted small" style={{ margin: '0 0 8px 0' }}>
                                Type: {lesson.type}
                              </p>
                              {lesson.content && (
                                <p className="small" style={{ margin: 0 }}>{lesson.content.substring(0, 150)}...</p>
                              )}
                            </div>
                          ))}
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

    return (
      <div className="card">
        <h2>My Courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <p className="muted small">You are not enrolled in any courses yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            {courses.map((course) => (
              <div key={course._id} className="card small" style={{ background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>{course.courseCode} - {course.courseName}</h4>
                    <p className="muted small" style={{ margin: '4px 0' }}>
                      {course.department} | {course.level} | {course.credits} Credits
                    </p>
                    {course.description && (
                      <p className="small" style={{ margin: '8px 0' }}>{course.description}</p>
                    )}
                    {course.section && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#e0f2fe', borderRadius: '8px' }}>
                        <p className="small" style={{ margin: 0 }}>
                          <strong>Section:</strong> {course.section.sectionName} | <strong>Room:</strong> {course.section.room || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn small"
                    onClick={() => {
                      setSelectedCourse(course);
                      fetchCourseModules(course._id);
                    }}
                  >
                    View Modules
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---------------- Activities ----------------
  const renderActivities = () => {
    if (loading) {
      return (
        <div className="card">
          <h2>Activities</h2>
          <p className="muted small">Loading activities...</p>
        </div>
      );
    }

    return (
      <div>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2>Activities & Assignments</h2>
          <p className="muted small">View and submit your course activities</p>
        </div>

        <div className="card">
          {activities.length === 0 ? (
            <p className="muted small">No activities available.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Course</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => {
                  const submission = submissions.find(s => s.activityId === activity._id);
                  const isOverdue = new Date(activity.dueDate) < new Date() && !submission;
                  
                  return (
                    <tr key={activity._id}>
                      <td>
                        <strong>{activity.title}</strong>
                        <p className="muted small" style={{ margin: '4px 0 0 0' }}>{activity.description}</p>
                      </td>
                      <td>{activity.course?.courseCode || 'N/A'}</td>
                      <td>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          background: activity.type === 'assignment' ? '#e0f2fe' : '#fef3c7',
                          color: activity.type === 'assignment' ? '#0369a1' : '#ca8a04'
                        }}>
                          {activity.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: isOverdue ? '#dc2626' : 'inherit' }}>
                          {new Date(activity.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>{activity.totalPoints}</td>
                      <td>
                        {submission ? (
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem',
                            background: submission.status === 'graded' ? '#f0fdf4' : '#fef3c7',
                            color: submission.status === 'graded' ? '#16a34a' : '#d97706'
                          }}>
                            {submission.status === 'graded' ? '✅ Graded' : '⏳ Submitted'}
                          </span>
                        ) : isOverdue ? (
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem',
                            background: '#fef2f2',
                            color: '#dc2626'
                          }}>
                            ⚠️ Overdue
                          </span>
                        ) : (
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem',
                            background: '#fef2f2',
                            color: '#dc2626'
                          }}>
                            ❌ Not Submitted
                          </span>
                        )}
                      </td>
                      <td>
                        {!submission && (
                          <button 
                            className="btn small"
                            onClick={() => openSubmissionForm(activity)}
                          >
                            Submit
                          </button>
                        )}
                        {submission && (
                          <button 
                            className="btn ghost small"
                            onClick={() => openSubmissionForm(activity)}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Submission Form Modal */}
        {showSubmissionForm && selectedActivity && (
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
            zIndex: 1000
          }}>
            <div className="card" style={{ minWidth: '500px', maxWidth: '90%', background: '#fff' }}>
              <h3 style={{ marginTop: 0 }}>Submit Activity</h3>
              <h4 style={{ margin: '0 0 16px 0', color: '#646cff' }}>{selectedActivity.title}</h4>
              
              <div style={{ marginBottom: '16px' }}>
                <p className="small"><strong>Description:</strong> {selectedActivity.description}</p>
                <p className="small"><strong>Due Date:</strong> {new Date(selectedActivity.dueDate).toLocaleDateString()}</p>
                <p className="small"><strong>Points:</strong> {selectedActivity.totalPoints}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="small" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Submission Text:
                </label>
                <textarea
                  rows="8"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your submission here..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="small" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Attach File (Optional):
                </label>
                <p className="muted small" style={{ margin: '4px 0 8px 0' }}>
                  📤 Files will be stored securely on the server
                  <br />
                  Supported: PDF, Word, Excel, PowerPoint, Images, ZIP (Max: 50MB)
                </p>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  style={{ width: '100%' }}
                />
                {submissionFile && (
                  <p className="small" style={{ marginTop: '8px', color: '#16a34a' }}>
                    ✓ Selected: {submissionFile.name} ({(submissionFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-primary" 
                  onClick={submitActivity}
                  disabled={loading}
                  style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? '⏳ Submitting...' : '✓ Submit'}
                </button>
                <button 
                  className="btn ghost" 
                  onClick={() => {
                    setShowSubmissionForm(false);
                    setSelectedActivity(null);
                    setSubmissionText("");
                    setSubmissionFile(null);
                  }}
                  disabled={loading}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  ✖ Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------------- Grades ----------------
  const renderGrades = () => {
    if (loading) {
      return (
        <div className="card">
          <h2>Grades</h2>
          <p className="muted small">Loading grades...</p>
        </div>
      );
    }

    const gradedSubmissions = submissions.filter(s => s.status === 'graded');

    return (
      <div>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2>My Grades</h2>
          <p className="muted small">View your graded assignments and feedback</p>
        </div>

        <div className="card">
          {gradedSubmissions.length === 0 ? (
            <p className="muted small">No graded submissions yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Course</th>
                  <th>Submitted</th>
                  <th>Attachments</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {gradedSubmissions.map((submission) => {
                  const activity = activities.find(a => a._id === submission.activityId);
                  const percentage = activity ? ((submission.score / activity.totalPoints) * 100).toFixed(1) : 0;
                  const hasAttachments = submission.attachments && submission.attachments.length > 0;
                  
                  return (
                    <tr key={submission._id}>
                      <td>
                        <strong>{activity?.title || 'Unknown Activity'}</strong>
                      </td>
                      <td>{activity?.course?.courseCode || 'N/A'}</td>
                      <td>{new Date(submission.submittedAt || submission.submissionDate).toLocaleDateString()}</td>
                      <td>
                        {hasAttachments ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {submission.attachments.map((attachment, idx) => (
                              <a
                                key={idx}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  fontSize: '0.85rem',
                                  color: '#6366f1',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                📎 {attachment.filename}
                              </a>
                            ))}
                          </div>
                        ) : submission.fileUrl ? (
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontSize: '0.85rem',
                              color: '#6366f1',
                              textDecoration: 'none'
                            }}
                          >
                            📎 {submission.fileName || 'View File'}
                          </a>
                        ) : (
                          <span className="muted small">No files</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong style={{ fontSize: '1.2rem', color: percentage >= 75 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626' }}>
                            {submission.score}/{activity?.totalPoints || 0}
                          </strong>
                          <span className="muted small" style={{ marginLeft: '8px' }}>
                            ({percentage}%)
                          </span>
                        </div>
                      </td>
                      <td>
                        <p className="small" style={{ margin: 0 }}>
                          {submission.feedback || 'No feedback provided'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // ---------------- Attendance ----------------
  const fetchStudentAttendance = async (courseId, sectionId) => {
    try {
      setLoadingAttendance(true);
      
      // Get the current student ID
      const studentId = currentUser?.userId || currentUser?._id || currentUser?.id;
      
      console.log('Fetching attendance for student:', studentId, 'section:', sectionId);
      
      // Get attendance records for the section
      const response = await api.getSectionAttendance(sectionId);
      
      console.log('Attendance API response:', response);
      
      if (response.success) {
        const allRecords = response.data || [];
        
        console.log('Total attendance records:', allRecords.length);
        
        // Filter records that include this student
        const studentRecords = allRecords.map(attendance => {
          const studentRecord = attendance.records?.find(r => {
            const recordStudentId = typeof r.studentId === 'object' ? r.studentId._id : r.studentId;
            return recordStudentId?.toString() === studentId?.toString();
          });
          
          if (studentRecord) {
            console.log('Found attendance record:', attendance.date, studentRecord.status);
            return {
              date: attendance.date,
              status: studentRecord.status,
              remarks: studentRecord.remarks
            };
          }
          return null;
        }).filter(r => r !== null);
        
        console.log('Filtered student records:', studentRecords.length);
        
        setAttendanceRecords(studentRecords);
        
        // Calculate statistics
        const present = studentRecords.filter(r => r.status === 'present').length;
        const late = studentRecords.filter(r => r.status === 'late').length;
        const excused = studentRecords.filter(r => r.status === 'excused').length;
        const absent = studentRecords.filter(r => r.status === 'absent').length;
        const total = studentRecords.length;
        const attendanceRate = total > 0 ? (((present + late) / total) * 100).toFixed(2) : 0;
        
        setAttendanceStats({
          present,
          late,
          excused,
          absent,
          total,
          attendanceRate
        });
      } else {
        console.error('API response not successful:', response);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load attendance records',
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
          <h2>My Attendance</h2>
          <p className="muted small">View your attendance records for enrolled courses</p>
        </div>

        {/* Course Selection */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3>Select Course</h3>
          <select
            value={selectedCourseForAttendance?._id || ''}
            onChange={(e) => {
              const selectedCourseId = e.target.value;
              if (selectedCourseId) {
                const enrollment = enrollments.find(enr => {
                  const courseId = typeof enr.courseId === 'object' ? enr.courseId._id : enr.courseId;
                  return courseId === selectedCourseId;
                });
                
                if (enrollment) {
                  const course = courses.find(c => c._id === selectedCourseId);
                  const sectionId = typeof enrollment.sectionId === 'object' ? enrollment.sectionId._id : enrollment.sectionId;
                  
                  setSelectedCourseForAttendance(course);
                  setAttendanceRecords([]);
                  setAttendanceStats(null);
                  
                  console.log('Selected course:', selectedCourseId, 'Section:', sectionId);
                  fetchStudentAttendance(selectedCourseId, sectionId);
                }
              }
            }}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">-- Select a Course --</option>
            {enrollments.map(enrollment => {
              const courseId = typeof enrollment.courseId === 'object' ? enrollment.courseId._id : enrollment.courseId;
              const course = courses.find(c => c._id === courseId);
              return course ? (
                <option key={enrollment._id} value={course._id}>
                  {course.courseCode} - {course.courseName}
                </option>
              ) : null;
            })}
          </select>
        </div>

        {/* Attendance Statistics */}
        {attendanceStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="card small" style={{ background: '#dcfce7', border: '1px solid #16a34a' }}>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#16a34a' }}>{attendanceStats.present}</h3>
              <p className="muted small" style={{ margin: '4px 0 0' }}>Present</p>
            </div>
            <div className="card small" style={{ background: '#fef3c7', border: '1px solid #d97706' }}>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#d97706' }}>{attendanceStats.late}</h3>
              <p className="muted small" style={{ margin: '4px 0 0' }}>Late</p>
            </div>
            <div className="card small" style={{ background: '#dbeafe', border: '1px solid #2563eb' }}>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#2563eb' }}>{attendanceStats.excused}</h3>
              <p className="muted small" style={{ margin: '4px 0 0' }}>Excused</p>
            </div>
            <div className="card small" style={{ background: '#fee2e2', border: '1px solid #dc2626' }}>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#dc2626' }}>{attendanceStats.absent}</h3>
              <p className="muted small" style={{ margin: '4px 0 0' }}>Absent</p>
            </div>
            {/* <div className="card small" style={{ background: '#f3f4f6', border: '1px solid #6b7280' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#374151' }}>
                {attendanceStats.attendanceRate}%
              </h3>
              <p className="muted small" style={{ margin: '4px 0 0' }}>Attendance Rate</p>
            </div> */}
          </div>
        )}

        {/* Attendance Records Table */}
        {loadingAttendance ? (
          <div className="card">
            <p className="muted" style={{ textAlign: 'center', padding: '20px' }}>Loading attendance records...</p>
          </div>
        ) : attendanceRecords.length > 0 ? (
          <div className="card">
            <h3>Attendance Records ({attendanceRecords.length} sessions)</h3>
            <table style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  {/* <th>Remarks</th> */}
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      <span
                        className="small"
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          background: 
                            record.status === 'present' ? '#dcfce7' :
                            record.status === 'late' ? '#fef3c7' :
                            record.status === 'excused' ? '#dbeafe' : '#fee2e2',
                          color:
                            record.status === 'present' ? '#16a34a' :
                            record.status === 'late' ? '#d97706' :
                            record.status === 'excused' ? '#2563eb' : '#dc2626'
                        }}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    {/* <td>{record.remarks || '-'}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedCourseForAttendance ? (
          <div className="card">
            <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              No attendance records found for this course
            </p>
          </div>
        ) : (
          <div className="card">
            <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              Please select a course to view attendance records
            </p>
          </div>
        )}
      </div>
    );
  };

  // ---------------- Profile ----------------
  const renderProfile = () => {
    // Fetch profile data when profile page is opened
    if (!studentProfile && !profileLoading) {
      fetchStudentProfile();
    }

    const profile = studentProfile || currentUser;
    const enrollmentDate = profile?.enrollmentDate ? new Date(profile.enrollmentDate).toLocaleDateString() : 'N/A';
    const createdDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A';

    return (
      <div>
        <div className="card">
          <h2>👤 My Profile</h2>
          
          {profileLoading ? (
            <p style={{ marginTop: '20px', color: '#666' }}>Loading profile...</p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {/* Personal Information */}
              <div style={{ 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e40af' }}>
                  📋 Personal Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      Student ID:
                    </label>
                    <p style={{ margin: 0, fontSize: '15px' }}>{profile?.studentId || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      Status:
                    </label>
                    <p style={{ margin: 0 }}>
                      <span style={{
                        padding: '4px 12px',
                        background: profile?.isActive ? '#dcfce7' : '#fee2e2',
                        color: profile?.isActive ? '#166534' : '#991b1b',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        {profile?.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      First Name:
                    </label>
                    <p style={{ margin: 0, fontSize: '15px' }}>{profile?.firstName || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      Last Name:
                    </label>
                    <p style={{ margin: 0, fontSize: '15px' }}>{profile?.lastName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e40af' }}>
                  📞 Contact Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      Email:
                    </label>
                    <p style={{ margin: 0, fontSize: '15px' }}>{profile?.email || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      Phone:
                    </label>
                    <p style={{ margin: 0, fontSize: '15px' }}>{profile?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div style={{ 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e40af' }}>
                  👨‍👩‍👧 Guardian Information
                </h3>
                
                <div>
                  <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                    Guardian Name:
                  </label>
                  <p style={{ margin: 0, fontSize: '15px' }}>{profile?.guardianName || 'N/A'}</p>
                </div>
              </div>

              {/* Enrollment Details */}
              <div style={{ 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e40af' }}>
                  📅 Enrollment Details
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      Enrollment Date:
                    </label>
                    <p style={{ margin: 0, fontSize: '15px' }}>{enrollmentDate}</p>
                  </div>
                  
                  <div>
                    <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                      Account Created:
                    </label>
                    <p style={{ margin: 0, fontSize: '15px' }}>{createdDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------- Payment ----------------
  const renderPayment = () => {
    // Fetch payment history when payment page is loaded
    if (paymentHistory.length === 0 && currentUser) {
      fetchPaymentHistory();
    }

    const handleProceedToPayment = async (e) => {
      e.preventDefault();
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
      }
      
      // Verify student profile exists
      const profile = studentProfile || currentUser;
      const studentId = profile?._id || profile?.userId || profile?.id;
      
      if (!studentId) {
        alert('Error: Student profile not loaded. Please refresh the page and try again.');
        return;
      }
      
      try {
        // Create pending payment record immediately
        const tempTransactionId = `PENDING-${Date.now()}`;
        const pendingPaymentData = {
          studentId: studentId,
          studentName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email || 'Student',
          studentEmail: profile.email,
          amount: amount,
          currency: 'USD',
          paymentType: paymentDescription,
          paymentMethod: 'PAYPAL',
          transactionId: tempTransactionId,
          paypalOrderId: tempTransactionId,
          payerName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
          payerEmail: profile.email,
          description: `${paymentDescription} payment via PayPal - Awaiting completion`,
          metadata: {
            status: 'pending_paypal_approval'
          }
        };

        console.log('Creating pending payment record:', pendingPaymentData);
        const response = await api.createPayment(pendingPaymentData);
        
        if (response.success && response.data) {
          setPendingPaymentId(response.data._id);
          console.log('Pending payment created with ID:', response.data._id);
          alert(`✅ Payment request created!\n\nAmount: $${amount}\nType: ${paymentDescription}\nStatus: Pending Admin Approval\n\nPlease wait for admin to approve your payment.`);
          // Don't clear the form - keep data visible until approved
          // Don't show PayPal buttons - admin needs to approve first
        } else {
          throw new Error('Failed to create pending payment record');
        }
      } catch (error) {
        console.error('Error creating pending payment:', error);
        alert('Error: Failed to create payment record. Please try again.');
      }
    };

    const createOrder = (data, actions) => {
      console.log('Creating PayPal order...');
      return actions.order.create({
        purchase_units: [{
          description: paymentDescription,
          amount: {
            value: paymentAmount
          }
        }]
      }).then((orderId) => {
        console.log('PayPal order created:', orderId);
        return orderId;
      }).catch((error) => {
        console.error('Error creating PayPal order:', error);
        alert('Failed to create PayPal order. Please try again.');
        throw error;
      });
    };

    const onApprove = async (data, actions) => {
      return actions.order.capture().then(async (details) => {
        // Payment successful - Update pending payment to completed
        try {
          const profile = studentProfile || currentUser;
          
          if (!profile || !profile._id) {
            throw new Error('Student profile not found');
          }

          console.log('Payment approved! Updating payment record...');
          console.log('PayPal details:', details);

          if (pendingPaymentId) {
            // Update existing pending payment to completed
            try {
              await api.updatePaymentStatus(pendingPaymentId, 'completed');
              console.log('Payment status updated to completed');
            } catch (updateError) {
              console.error('Failed to update payment status:', updateError);
              // Continue anyway since we'll create a new record
            }
          }

          // Also create a completed payment record with actual PayPal details
          const completedPaymentData = {
            studentId: profile._id,
            studentName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email,
            studentEmail: profile.email,
            amount: parseFloat(paymentAmount),
            currency: 'USD',
            paymentType: paymentDescription,
            paymentMethod: 'PAYPAL',
            transactionId: details.id,
            paypalOrderId: data.orderID,
            payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
            payerEmail: details.payer.email_address,
            description: `${paymentDescription} payment via PayPal - Completed`,
            metadata: {
              paypalDetails: details,
              captureId: details.purchase_units[0].payments.captures[0].id,
              previousPendingId: pendingPaymentId
            }
          };

          console.log('Creating completed payment record:', completedPaymentData);
          const response = await api.createPayment(completedPaymentData);
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to save completed payment');
          }

          const newPayment = {
            id: details.id,
            date: new Date().toLocaleDateString(),
            amount: parseFloat(paymentAmount),
            method: 'PAYPAL',
            description: paymentDescription,
            status: 'Completed',
            transactionId: details.id,
            payer: details.payer.name.given_name + ' ' + details.payer.name.surname
          };

          setPaymentHistory([newPayment, ...paymentHistory]);
          setPaymentAmount('');
          setPaymentDescription('Tuition Fee');
          setShowPayPalButtons(false);
          setPendingPaymentId(null);
          
          alert(`✅ Payment Successful!\n\nTransaction ID: ${details.id}\nAmount: $${paymentAmount}\nThank you, ${details.payer.name.given_name}!\n\nYour payment has been recorded in the system.`);
        } catch (error) {
          console.error('Error updating payment:', error);
          alert(`⚠️ Payment completed but there was an error recording it:\n${error.message}\n\nTransaction ID: ${details.id}\n\nPlease contact support with this transaction ID.`);
          setShowPayPalButtons(false);
          setPendingPaymentId(null);
        }
      }).catch((error) => {
        console.error('PayPal capture error:', error);
        alert('Failed to capture payment. Please try again.');
        setShowPayPalButtons(false);
      });
    };

    const onError = async (err) => {
      console.error('PayPal Error:', err);
      
      // Update pending payment to failed
      if (pendingPaymentId) {
        try {
          await api.updatePaymentStatus(pendingPaymentId, 'failed');
          console.log('Payment status updated to failed');
        } catch (updateError) {
          console.error('Failed to update payment status:', updateError);
        }
      }
      
      alert('❌ Payment Error\n\nSomething went wrong with PayPal. Please try again or contact support if the problem persists.');
      setShowPayPalButtons(false);
      setPendingPaymentId(null);
    };

    const onCancel = async () => {
      console.log('Payment cancelled by user');
      
      // Update pending payment to cancelled
      if (pendingPaymentId) {
        try {
          await api.updatePaymentStatus(pendingPaymentId, 'cancelled');
          console.log('Payment status updated to cancelled');
        } catch (updateError) {
          console.error('Failed to update payment status:', updateError);
        }
      }
      
      alert('Payment was cancelled. No charges were made.');
      setShowPayPalButtons(false);
      setPendingPaymentId(null);
    };

    return (
      <PayPalScriptProvider options={{ 
        "client-id": "AeB1hNjEO5r8nhGJ_S0NshGYGHJZ2UHrBFiRkv4DGHsrJ5mvyMKJVPZJn9JPYQInfJv9BVG7UJhJ-Gof",
        currency: "USD"
      }}>
        <div>
          {/* Payment Form */}
          <div className="card">
            <h2>💳 Tuition Payment with PayPal</h2>
            
            {!showPayPalButtons ? (
              <form onSubmit={handleProceedToPayment} style={{ marginTop: '20px' }}>
                {pendingPaymentId && (
                  <div style={{
                    padding: '15px',
                    background: '#fff7ed',
                    border: '2px solid #fb923c',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#9a3412', fontSize: '14px' }}>
                      ⏳ Payment Pending Admin Approval
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#9a3412' }}>
                      Your payment request has been submitted. Please wait for admin approval before the transaction is completed.
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    Payment Description
                  </label>
                  <select
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    disabled={pendingPaymentId}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px',
                      backgroundColor: pendingPaymentId ? '#f3f4f6' : 'white'
                    }}
                  >
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Enrollment Fee">Enrollment Fee</option>
                    <option value="Laboratory Fee">Laboratory Fee</option>
                    <option value="Miscellaneous Fee">Miscellaneous Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    min="0.01"
                    disabled={pendingPaymentId}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px',
                      backgroundColor: pendingPaymentId ? '#f3f4f6' : 'white'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ width: '100%' }}
                  disabled={pendingPaymentId}
                >
                  {pendingPaymentId ? '⏳ Awaiting Approval...' : '📤 Submit Payment Request'}
                </button>

                {pendingPaymentId && (
                  <button 
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this payment request?')) {
                        setPendingPaymentId(null);
                        setPaymentAmount('');
                        setPaymentDescription('Tuition Fee');
                      }
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    Cancel Request
                  </button>
                )}
              </form>
            ) : (
              <div style={{ marginTop: '20px' }}>
                <div style={{ 
                  padding: '15px', 
                  background: '#f0f9ff', 
                  borderRadius: '5px',
                  border: '1px solid #bae6fd',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Payment Details:</p>
                  <p style={{ margin: '8px 0 0 0' }}>
                    {paymentDescription}: <strong>${paymentAmount}</strong>
                  </p>
                </div>

                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  onCancel={onCancel}
                  style={{ 
                    layout: "vertical",
                    color: "blue",
                    shape: "rect",
                    label: "pay"
                  }}
                  forceReRender={[paymentAmount, paymentDescription]}
                />

                <button 
                  onClick={() => {
                    console.log('User clicked cancel button');
                    setShowPayPalButtons(false);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '15px' }}
                >
                  ← Back to Form
                </button>
              </div>
            )}

            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#fff7ed', 
              borderRadius: '5px',
              border: '1px solid #fed7aa'
            }}>
              <p className="small" style={{ margin: 0, color: '#92400e', lineHeight: '1.6' }}>
                <strong>ℹ️ Sandbox Mode:</strong> This is using PayPal Sandbox for testing.<br/>
                <strong>Test Credentials:</strong><br/>
                • Email: sb-buyer@personal.example.com<br/>
                • Password: testbuyer123<br/>
                <br/>
                Click the PayPal button above, login with test credentials, and complete the payment.
              </p>
            </div>
          </div>

        {/* Payment History */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0 }}>📜 Payment History</h2>
            <button 
              onClick={fetchPaymentHistory}
              className="btn small ghost"
              style={{ fontSize: '13px' }}
            >
              🔄 Refresh
            </button>
          </div>
          {paymentHistory.length === 0 ? (
            <p style={{ marginTop: '20px', color: '#666' }}>No payment history yet.</p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{payment.date}</td>
                      <td style={{ padding: '12px' }}>{payment.description}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: payment.method === 'GCASH' ? '#e0f2fe' : '#fef3c7',
                          color: payment.method === 'GCASH' ? '#0369a1' : '#92400e',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {payment.method}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                        {payment.currency === 'PHP' ? '₱' : '$'}{payment.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          background: payment.status === 'completed' ? '#dcfce7' : 
                                     payment.status === 'pending' ? '#fef3c7' :
                                     payment.status === 'failed' ? '#fee2e2' :
                                     payment.status === 'cancelled' ? '#f3f4f6' :
                                     payment.status === 'refunded' ? '#e0e7ff' : '#fef3c7',
                          color: payment.status === 'completed' ? '#166534' : 
                                payment.status === 'pending' ? '#92400e' :
                                payment.status === 'failed' ? '#991b1b' :
                                payment.status === 'cancelled' ? '#374151' :
                                payment.status === 'refunded' ? '#3730a3' : '#92400e',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {payment.status === 'pending' && '⏳ '}
                          {payment.status === 'completed' && '✅ '}
                          {payment.status === 'failed' && '❌ '}
                          {payment.status === 'cancelled' && '🚫 '}
                          {payment.status === 'refunded' && '💰 '}
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </PayPalScriptProvider>
    );
  };

  const pageNames = {
    dashboard: 'Dashboard',
    courses: 'My Courses',
    activities: 'Activities',
    grades: 'Grades',
    attendance: 'My Attendance',
    profile: 'Profile',
    payment: 'Payment'
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
        <div className="brand">📚 LMS Student</div>

        <ul className="nav">
          <li>
            <button 
              onClick={() => navigateToPage('dashboard')}
              className={page === 'dashboard' ? 'active' : ''}
            >
              🏠 Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToPage('courses')}
              className={page === 'courses' ? 'active' : ''}
            >
              📚 My Courses
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToPage('activities')}
              className={page === 'activities' ? 'active' : ''}
            >
              📝 Activities
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToPage('grades')}
              className={page === 'grades' ? 'active' : ''}
            >
              🎯 Grades
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToPage('attendance')}
              className={page === 'attendance' ? 'active' : ''}
            >
              ✅ Attendance
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToPage('payment')}
              className={page === 'payment' ? 'active' : ''}
            >
              💳 Payment
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateToPage('profile')}
              className={page === 'profile' ? 'active' : ''}
            >
              👤 Profile
            </button>
          </li>
          <li style={{ marginTop: '20px' }}>
            <button onClick={logout} style={{ color: '#ef4444' }}>
              🚪 Logout
            </button>
          </li>
        </ul>

        <div className="footer small">
          Signed in as<br />
          {currentUser?.email || 'Student'}
        </div>
      </aside>

      <main className="content">
        <div className="topbar">
          <h1>{pageNames[page] || 'Student Dashboard'}</h1>
        </div>

        {page === "dashboard" && renderDashboard()}
        {page === "courses" && renderCourses()}
        {page === "activities" && renderActivities()}
        {page === "grades" && renderGrades()}
        {page === "attendance" && renderAttendance()}
        {page === "payment" && renderPayment()}
        {page === "profile" && renderProfile()}
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
                  href={`${viewingFile.url}?download=true`}
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
                    href={`${viewingFile.url}?download=true`}
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
