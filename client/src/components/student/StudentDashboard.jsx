import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./student.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname.split('/').pop();
    if (['dashboard', 'courses', 'activities', 'grades', 'profile', 'payment'].includes(path)) {
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
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      alert("Logged out successfully!");
      navigate("/login");
    }
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
                      </div>
                      <button 
                        className="btn small"
                        onClick={() => {
                          setSelectedModule(module);
                          fetchModuleLessons(module._id);
                        }}
                      >
                        View Lessons
                      </button>
                    </div>
                    
                    {selectedModule?._id === module._id && moduleLessons.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
                        <h5 style={{ margin: '0 0 12px 0' }}>Lessons:</h5>
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

  // ---------------- Profile ----------------
  const renderProfile = () => {
    return (
      <div>
        <div className="card">
          <h2>My Profile</h2>
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Student ID:
              </label>
              <p>{currentUser?.studentId || 'N/A'}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Name:
              </label>
              <p>{currentUser?.firstName || ''} {currentUser?.lastName || ''}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Email:
              </label>
              <p>{currentUser?.email || 'N/A'}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Role:
              </label>
              <p style={{ textTransform: 'capitalize' }}>{currentUser?.role || 'student'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- Payment ----------------
  const renderPayment = () => {
    const handleProceedToPayment = (e) => {
      e.preventDefault();
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      setShowPayPalButtons(true);
    };

    const createOrder = (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          description: paymentDescription,
          amount: {
            value: paymentAmount
          }
        }]
      });
    };

    const onApprove = (data, actions) => {
      return actions.order.capture().then((details) => {
        // Payment successful
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
        
        alert(`Payment Successful!\nTransaction ID: ${details.id}\nThank you, ${details.payer.name.given_name}!`);
      });
    };

    const onError = (err) => {
      console.error('PayPal Error:', err);
      alert('Payment failed. Please try again.');
      setShowPayPalButtons(false);
    };

    const onCancel = () => {
      alert('Payment cancelled.');
      setShowPayPalButtons(false);
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
                <div style={{ marginBottom: '20px' }}>
                  <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    Payment Description
                  </label>
                  <select
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
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
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  🅿️ Proceed to PayPal
                </button>
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
                  style={{ layout: "vertical" }}
                />

                <button 
                  onClick={() => setShowPayPalButtons(false)}
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '15px' }}
                >
                  Cancel
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
              <p className="small" style={{ margin: 0, color: '#92400e' }}>
                <strong>ℹ️ Sandbox Mode:</strong> This is using PayPal Sandbox for testing. Use PayPal test credentials to complete payment.
              </p>
            </div>
          </div>

        {/* Payment History */}
        <div className="card" style={{ marginTop: '20px' }}>
          <h2>📜 Payment History</h2>
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
                        {payment.method === 'GCASH' ? '₱' : '$'}{payment.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
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
    profile: 'Profile',
    payment: 'Payment'
  };

  return (
    <div className="app">
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
        {page === "payment" && renderPayment()}
        {page === "profile" && renderProfile()}
      </main>
    </div>
  );
}
