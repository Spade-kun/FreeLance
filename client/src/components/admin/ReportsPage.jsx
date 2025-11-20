import { useState, useEffect } from "react";
import api from "../../services/api";
import { logReportAction } from "../../utils/logActivity";

export default function ReportsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState({});
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('enrollments'); // enrollments, students, courses, instructors

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        api.getEnrollments(),
        api.getStudents(),
        api.getCourses(),
        api.getInstructors()
      ]);

      const [enrollmentsRes, studentsRes, coursesRes, instructorsRes] = results;

      setEnrollments((enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value?.data) || []);
      setStudents((studentsRes.status === 'fulfilled' && studentsRes.value?.data) || []);
      setInstructors((instructorsRes.status === 'fulfilled' && instructorsRes.value?.data) || []);
      const coursesData = (coursesRes.status === 'fulfilled' && coursesRes.value?.data) || [];
      setCourses(coursesData);

      // Fetch sections for each course
      const sectionsData = {};
      for (const course of coursesData) {
        try {
          const sectionsRes = await api.getCourseSections(course._id);
          sectionsData[course._id] = sectionsRes.data || [];
        } catch (err) {
          console.warn(`Failed to load sections for course ${course._id}:`, err);
          sectionsData[course._id] = [];
        }
      }
      setSections(sectionsData);

      // Check if any requests failed
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some reports data failed to load:', failures);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load reports data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  const exportEnrollmentsCsv = () => {
    if (enrollments.length === 0) {
      alert("No enrollments to export.");
      return;
    }

    const rows = [
      ["Student ID", "Student Name", "Email", "Course Code", "Course Name", "Section", "Enrollment Date", "Status"],
      ...enrollments.map(e => {
        const student = students.find(s => s._id === e.studentId);
        const course = courses.find(c => c._id === e.courseId);
        const section = sections[e.courseId]?.find(s => s._id === e.sectionId);
        
        return [
          e.studentId,
          student ? `${student.firstName} ${student.lastName}` : "Unknown",
          student ? student.email : "",
          course ? course.courseCode : "Unknown",
          course ? course.courseName : "Unknown",
          section ? section.sectionName : "Unknown",
          new Date(e.enrollmentDate).toLocaleDateString(),
          e.status
        ];
      })
    ];

    const csv = rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `enrollments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };



  const getEnrollmentStats = () => {
    const total = enrollments.length;
    const enrolled = enrollments.filter(e => e.status === 'enrolled' || e.status === 'active').length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const dropped = enrollments.filter(e => e.status === 'dropped' || e.status === 'withdrawn').length;

    return { total, enrolled, completed, dropped };
  };

  const getCourseStats = () => {
    return courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course._id);
      const courseSections = sections[course._id] || [];
      
      return {
        ...course,
        totalEnrollments: courseEnrollments.length,
        activeSections: courseSections.filter(s => s.isActive).length,
        totalSections: courseSections.length
      };
    });
  };

  const getStudentReport = () => {
    return students.map(student => {
      const studentEnrollments = enrollments.filter(e => e.studentId === student._id);
      const completedCourses = studentEnrollments.filter(e => e.status === 'completed').length;
      
      return {
        ...student,
        totalEnrollments: studentEnrollments.length,
        completedCourses,
        activeCourses: studentEnrollments.filter(e => e.status === 'enrolled' || e.status === 'active').length
      };
    });
  };

  const getInstructorReport = () => {
    return instructors.map(instructor => {
      let totalSections = 0;
      let totalStudents = 0;
      
      Object.values(sections).forEach(courseSections => {
        const instructorSections = courseSections.filter(s => s.instructorId === instructor._id);
        totalSections += instructorSections.length;
        instructorSections.forEach(section => {
          totalStudents += section.enrolled || 0;
        });
      });
      
      return {
        ...instructor,
        totalSections,
        totalStudents
      };
    });
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Reports & Analytics</h2>
        <p className="muted small">Loading reports...</p>
      </div>
    );
  }

  const stats = getEnrollmentStats();

  return (
    <div className="card">
      <h2>📈 Monitor Reports</h2>
      <p className="muted small" style={{ marginTop: '8px' }}>
        Access course reports, instructor reports, and student reports
      </p>

      {error && (
        <div style={{ padding: '10px', background: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
          <button className="btn ghost small" style={{ marginLeft: '10px' }} onClick={fetchAllData}>
            Retry
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="card small" style={{ background: '#f0f9ff', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#0284c7' }}>{stats.total}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Total Enrollments</p>
        </div>
        <div className="card small" style={{ background: '#f0fdf4', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#16a34a' }}>{stats.enrolled}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Active</p>
        </div>
        <div className="card small" style={{ background: '#fefce8', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ca8a04' }}>{stats.completed}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Completed</p>
        </div>
        <div className="card small" style={{ background: '#fef2f2', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#dc2626' }}>{stats.dropped}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Dropped</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #ddd', flexWrap: 'wrap' }}>
        <button 
          className={activeTab === 'enrollments' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('enrollments')}
        >
          📊 Enrollment Report
        </button>
        <button 
          className={activeTab === 'students' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('students')}
        >
          👨‍🎓 Student Report
        </button>
        <button 
          className={activeTab === 'courses' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('courses')}
        >
          📚 Course Report
        </button>
        <button 
          className={activeTab === 'instructors' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveTab('instructors')}
        >
          👨‍🏫 Instructor Report
        </button>
      </div>

      {/* ========== ENROLLMENTS TAB ========== */}
      {activeTab === 'enrollments' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <button className="btn small" onClick={exportEnrollmentsCsv}>
              📥 Export Enrollments CSV
            </button>
          </div>

          {/* Enrollments Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Section</th>
                  <th>Enrollment Date</th>
                  <th>Status</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      <span className="muted">No enrollments found</span>
                    </td>
                  </tr>
                ) : (
                  enrollments.map(enrollment => {
                    const student = students.find(s => s._id === enrollment.studentId);
                    const course = courses.find(c => c._id === enrollment.courseId);
                    const section = sections[enrollment.courseId]?.find(s => s._id === enrollment.sectionId);

                    return (
                      <tr key={enrollment._id}>
                        <td>{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
                        <td>{student ? student.email : '-'}</td>
                        <td>{course ? `${course.courseCode} - ${course.courseName}` : 'Unknown'}</td>
                        <td>{section ? section.sectionName : 'Unknown'}</td>
                        <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                        <td>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem',
                            background: enrollment.status === 'enrolled' ? '#f0fdf4' : 
                                      enrollment.status === 'completed' ? '#fefce8' : '#fef2f2',
                            color: enrollment.status === 'enrolled' ? '#16a34a' : 
                                  enrollment.status === 'completed' ? '#ca8a04' : '#dc2626'
                          }}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td>{enrollment.grade || enrollment.finalScore || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== STUDENT REPORT TAB ========== */}
      {activeTab === 'students' && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Enrollments</th>
                  <th>Active Courses</th>
                  <th>Completed Courses</th>
                </tr>
              </thead>
              <tbody>
                {getStudentReport().length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      <span className="muted">No students found</span>
                    </td>
                  </tr>
                ) : (
                  getStudentReport().map(student => (
                    <tr key={student._id}>
                      <td>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: 'bold',
                          color: '#0284c7',
                          background: '#f0f9ff',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {student.studentId || 'N/A'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{student.firstName} {student.lastName}</td>
                      <td>{student.email}</td>
                      <td style={{ textAlign: 'center' }}>{student.totalEnrollments}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          background: '#f0fdf4', 
                          color: '#16a34a',
                          fontWeight: '500'
                        }}>
                          {student.activeCourses}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          background: '#fefce8', 
                          color: '#ca8a04',
                          fontWeight: '500'
                        }}>
                          {student.completedCourses}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== COURSE REPORT TAB ========== */}
      {activeTab === 'courses' && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Level</th>
                  <th>Total Sections</th>
                  <th>Active Sections</th>
                  <th>Total Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {getCourseStats().length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                      <span className="muted">No courses found</span>
                    </td>
                  </tr>
                ) : (
                  getCourseStats().map(course => (
                    <tr key={course._id}>
                      <td>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.85rem', 
                          fontWeight: 'bold',
                          color: '#666' 
                        }}>
                          {course.courseId || 'N/A'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{course.courseCode}</td>
                      <td>{course.courseName}</td>
                      <td>{course.department || '-'}</td>
                      <td>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.85rem',
                          background: '#f0f9ff',
                          color: '#0284c7'
                        }}>
                          {course.level}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{course.totalSections}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          background: '#f0fdf4', 
                          color: '#16a34a',
                          fontWeight: '500'
                        }}>
                          {course.activeSections}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{course.totalEnrollments}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== INSTRUCTOR REPORT TAB ========== */}
      {activeTab === 'instructors' && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Instructor ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Total Sections</th>
                  <th>Total Students</th>
                </tr>
              </thead>
              <tbody>
                {getInstructorReport().length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      <span className="muted">No instructors found</span>
                    </td>
                  </tr>
                ) : (
                  getInstructorReport().map(instructor => (
                    <tr key={instructor._id}>
                      <td>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontWeight: 'bold',
                          color: '#16a34a',
                          background: '#f0fdf4',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {instructor.instructorId || 'N/A'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{instructor.firstName} {instructor.lastName}</td>
                      <td>{instructor.email}</td>
                      <td>{instructor.specialization || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{instructor.totalSections}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          background: '#f0f9ff', 
                          color: '#0284c7',
                          fontWeight: '500'
                        }}>
                          {instructor.totalStudents}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
  