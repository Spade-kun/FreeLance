import { useState, useEffect } from "react";
import api from "../../services/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState({});
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('courses'); // courses, enrollments

  // Course form
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("Undergraduate");
  const [editingCourse, setEditingCourse] = useState(null);

  // Section form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [selectedCourseForSection, setSelectedCourseForSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionName, setSectionName] = useState("");
  const [sectionInstructor, setSectionInstructor] = useState("");
  const [sectionCapacity, setSectionCapacity] = useState("");
  const [sectionRoom, setSectionRoom] = useState("");

  // Enrollment form
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrollCourseId, setEnrollCourseId] = useState("");
  const [enrollSectionId, setEnrollSectionId] = useState("");
  const [enrollStatus, setEnrollStatus] = useState("enrolled");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        api.getCourses(),
        api.getEnrollments(),
        api.getStudents(),
        api.getInstructors()
      ]);

      const [coursesRes, enrollmentsRes, studentsRes, instructorsRes] = results;

      const coursesData = (coursesRes.status === 'fulfilled' && coursesRes.value?.data) || [];
      setCourses(coursesData);
      setEnrollments((enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value?.data) || []);
      setStudents((studentsRes.status === 'fulfilled' && studentsRes.value?.data) || []);
      setInstructors((instructorsRes.status === 'fulfilled' && instructorsRes.value?.data) || []);

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
        console.warn('Some course data failed to load:', failures);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load courses data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
    if (!courseCode.trim() || !courseName.trim()) {
      return alert("Please fill in course code and name.");
    }

    try {
      const courseData = {
        courseCode,
        courseName,
        description,
        credits: Number(credits) || 3,
        department,
        level,
        isActive: true
      };

      const response = await api.createCourse(courseData);
      if (response.success) {
        alert('Course created successfully!');
        resetCourseForm();
        fetchAllData();
      }
    } catch (err) {
      console.error('Error creating course:', err);
      alert(err.message || 'Failed to create course');
    }
  };

  const updateCourse = async () => {
    if (!editingCourse || !courseCode.trim() || !courseName.trim()) {
      return alert("Please fill in required fields.");
    }

    try {
      const courseData = {
        courseCode,
        courseName,
        description,
        credits: Number(credits) || 3,
        department,
        level
      };

      const response = await api.updateCourse(editingCourse._id, courseData);
      if (response.success) {
        alert('Course updated successfully!');
        resetCourseForm();
        fetchAllData();
      }
    } catch (err) {
      console.error('Error updating course:', err);
      alert(err.message || 'Failed to update course');
    }
  };

  const deleteCourse = async (course) => {
    if (!confirm(`Delete course ${course.courseName}?`)) return;

    try {
      const response = await api.deleteCourse(course._id);
      if (response.success) {
        alert('Course deleted successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.message || 'Failed to delete course');
    }
  };

  const startEditCourse = (course) => {
    setEditingCourse(course);
    setCourseCode(course.courseCode);
    setCourseName(course.courseName);
    setDescription(course.description || "");
    setCredits(course.credits || "");
    setDepartment(course.department || "");
    setLevel(course.level || "Undergraduate");
  };

  const resetCourseForm = () => {
    setEditingCourse(null);
    setCourseCode("");
    setCourseName("");
    setDescription("");
    setCredits("");
    setDepartment("");
    setLevel("Undergraduate");
  };

  const openSectionForm = (course) => {
    setSelectedCourseForSection(course);
    setEditingSection(null);
    setShowSectionForm(true);
    setSectionName("");
    setSectionInstructor("");
    setSectionCapacity("");
    setSectionRoom("");
  };

  const openEditSectionForm = (course, section) => {
    setSelectedCourseForSection(course);
    setEditingSection(section);
    setShowSectionForm(true);
    setSectionName(section.sectionName);
    setSectionInstructor(section.instructorId || "");
    setSectionCapacity(section.capacity || "");
    setSectionRoom(section.room || "");
  };

  const addOrUpdateSection = async () => {
    if (!sectionName.trim() || !selectedCourseForSection) {
      return alert("Please fill in section name.");
    }

    try {
      const sectionData = {
        sectionName,
        instructorId: sectionInstructor || null,
        capacity: Number(sectionCapacity) || 30,
        room: sectionRoom,
        isActive: true
      };

      if (editingSection) {
        const response = await api.updateSection(selectedCourseForSection._id, editingSection._id, sectionData);
        if (response.success) {
          alert('Section updated successfully!');
          setShowSectionForm(false);
          setEditingSection(null);
          fetchAllData();
        }
      } else {
        const response = await api.createSection(selectedCourseForSection._id, sectionData);
        if (response.success) {
          alert('Section created successfully!');
          setShowSectionForm(false);
          fetchAllData();
        }
      }
    } catch (err) {
      console.error('Error saving section:', err);
      alert(err.message || 'Failed to save section');
    }
  };

  const deleteSection = async (courseId, sectionId) => {
    if (!confirm("Delete this section?")) return;

    try {
      const response = await api.deleteSection(courseId, sectionId);
      if (response.success) {
        alert('Section deleted successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      alert(err.message || 'Failed to delete section');
    }
  };

  const enrollStudent = async () => {
    if (!enrollStudentId || !enrollCourseId || !enrollSectionId) {
      return alert("Please select student, course, and section.");
    }

    try {
      const enrollmentData = {
        studentId: enrollStudentId,
        courseId: enrollCourseId,
        sectionId: enrollSectionId,
        status: enrollStatus
      };

      const response = await api.enrollStudent(enrollmentData);
      if (response.success) {
        alert('Student enrolled successfully!');
        setShowEnrollmentForm(false);
        setEnrollStudentId("");
        setEnrollCourseId("");
        setEnrollSectionId("");
        setEnrollStatus("enrolled");
        fetchAllData();
      }
    } catch (err) {
      console.error('Error enrolling student:', err);
      alert(err.message || 'Failed to enroll student');
    }
  };

  const deleteEnrollment = async (enrollmentId) => {
    if (!confirm("Remove this enrollment?")) return;

    try {
      const response = await api.deleteEnrollment(enrollmentId);
      if (response.success) {
        alert('Enrollment removed successfully!');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      alert(err.message || 'Failed to remove enrollment');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Manage Courses</h2>
        <p className="muted small">Loading courses...</p>
      </div>
    );
  }

  const availableSectionsForEnrollment = enrollCourseId ? (sections[enrollCourseId] || []) : [];

  return (
    <div className="card">
      <h2>Manage Courses & Enrollment</h2>

      {error && (
        <div style={{ padding: '10px', background: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
          <button className="btn ghost small" style={{ marginLeft: '10px' }} onClick={fetchAllData}>
            Retry
          </button>
        </div>
      )}

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          className={activeView === 'courses' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveView('courses')}
        >
          Courses ({courses.length})
        </button>
        <button 
          className={activeView === 'enrollments' ? 'btn small' : 'btn ghost small'}
          onClick={() => setActiveView('enrollments')}
        >
          Enrollments ({enrollments.length})
        </button>
      </div>

      {activeView === 'courses' && (
        <>
          {/* Course Form */}
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
              {editingCourse ? '✏️ Edit Course' : '➕ Add New Course'}
            </h3>
            
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="Course Code * (e.g., CS101)"
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <input
                type="text"
                placeholder="Course Name * (e.g., Introduction to Programming)"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <input
                type="text"
                placeholder="Department (e.g., Computer Science)"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <input
                type="number"
                placeholder="Credits (e.g., 3)"
                value={credits}
                onChange={e => setCredits(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="Undergraduate">📚 Undergraduate</option>
                <option value="Graduate">🎓 Graduate</option>
                <option value="Postgraduate">👨‍🎓 Postgraduate</option>
                <option value="Beginner">🌱 Beginner</option>
                <option value="Intermediate">📈 Intermediate</option>
                <option value="Advanced">🚀 Advanced</option>
              </select>

              <textarea
                placeholder="Course description..."
                rows="3"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '42px', gridColumn: '1 / -1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {editingCourse ? (
                <>
                  <button onClick={updateCourse} className="btn-primary">✓ Update Course</button>
                  <button onClick={resetCourseForm} className="btn ghost">✖ Cancel</button>
                </>
              ) : (
                <button onClick={addCourse} className="btn-primary">➕ Add Course</button>
              )}
            </div>
          </div>

          <hr />

          {/* Courses List */}
          <div style={{ marginTop: "16px" }}>
            {courses.length === 0 ? (
              <p className="muted small">No courses yet.</p>
            ) : (
              courses.map(course => (
                <div className="card small" style={{ marginTop: "8px" }} key={course._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.8rem', 
                          background: '#e3f2fd', 
                          color: '#1976d2',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          ID: {course.courseId || 'N/A'}
                        </span>
                        <strong style={{ fontSize: '1.1rem' }}>{course.courseCode} - {course.courseName}</strong>
                      </div>
                      <p className="muted small" style={{ marginTop: '4px' }}>{course.description || 'No description'}</p>
                      <p className="muted small" style={{ marginTop: '4px' }}>
                        📚 Credits: {course.credits} | 🏛️ Department: {course.department || 'N/A'} | 📊 Level: {course.level || 'N/A'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn ghost small" onClick={() => startEditCourse(course)}>
                        ✏️ Edit
                      </button>
                      <button className="btn-danger small" onClick={() => deleteCourse(course)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Sections */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong className="muted small">Sections:</strong>
                      <button className="btn ghost small" onClick={() => openSectionForm(course)}>
                        + Add Section
                      </button>
                    </div>

                    {(sections[course._id] || []).length === 0 ? (
                      <p className="muted small">No sections yet</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(sections[course._id] || []).map(section => {
                          const instructor = instructors.find(i => i._id === section.instructorId);
                          
                          return (
                            <div key={section._id} style={{ 
                              padding: '8px 12px', 
                              background: '#f0fdf4',
                              border: '1px solid #86efac',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#16a34a' }}>
                                #{section.sectionId || '?'}
                              </span>
                              <span style={{ fontWeight: '500' }}>{section.sectionName}</span>
                              {instructor ? (
                                <span className="muted" style={{ fontSize: '0.8rem' }}>
                                  👨‍🏫 {instructor.firstName} {instructor.lastName}
                                </span>
                              ) : (
                                <span className="muted" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                                  👨‍🏫 No instructor
                                </span>
                              )}
                              <span className="muted" style={{ fontSize: '0.8rem' }}>
                                👥 {section.enrolled || 0}/{section.capacity}
                              </span>
                              {section.room && (
                                <span className="muted" style={{ fontSize: '0.8rem' }}>
                                  🏠 {section.room}
                                </span>
                              )}
                              <button 
                                className="btn ghost" 
                                style={{ padding: '2px 8px', fontSize: '0.7rem', marginLeft: 'auto' }}
                                onClick={() => openEditSectionForm(course, section)}
                                title="Edit section"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-danger" 
                                style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                                onClick={() => deleteSection(course._id, section._id)}
                                title="Delete section"
                              >
                                ✖
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section Form Modal */}
          {showSectionForm && (
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
              <div className="card" style={{ minWidth: '450px', maxWidth: '90%', background: '#fff' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>
                  {editingSection ? '✏️ Edit' : '➕ Add'} Section {editingSection ? 'for' : 'to'} <span style={{ color: '#646cff' }}>{selectedCourseForSection?.courseName}</span>
                </h3>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Section Name * (e.g., Section A)"
                    value={sectionName}
                    onChange={e => setSectionName(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  />

                  <select
                    value={sectionInstructor}
                    onChange={e => setSectionInstructor(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  >
                    <option value="">👨‍🏫 Select Instructor (Optional)</option>
                    {instructors.map(inst => (
                      <option key={inst._id} value={inst._id}>
                        ID: {inst.instructorId || 'N/A'} - {inst.firstName} {inst.lastName}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Capacity (e.g., 30)"
                    value={sectionCapacity}
                    onChange={e => setSectionCapacity(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  />

                  <input
                    type="text"
                    placeholder="Room (e.g., Room 101)"
                    value={sectionRoom}
                    onChange={e => setSectionRoom(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="btn-primary" onClick={addOrUpdateSection}>
                    ✓ {editingSection ? 'Update' : 'Add'} Section
                  </button>
                  <button className="btn ghost" onClick={() => {
                    setShowSectionForm(false);
                    setEditingSection(null);
                  }}>✖ Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'enrollments' && (
        <>
          <button 
            className="btn small" 
            onClick={() => setShowEnrollmentForm(!showEnrollmentForm)}
            style={{ marginBottom: '16px' }}
          >
            {showEnrollmentForm ? 'Hide Form' : '+ Enroll Student'}
          </button>

          {/* Enrollment Form */}
          {showEnrollmentForm && (
            <div style={{ marginBottom: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>
                📝 Enroll Student
              </h3>
              
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <select
                  value={enrollStudentId}
                  onChange={e => setEnrollStudentId(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">👨‍🎓 Select Student *</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      ID: {student.studentId || 'N/A'} - {student.firstName} {student.lastName} ({student.email})
                    </option>
                  ))}
                </select>

                <select
                  value={enrollCourseId}
                  onChange={e => {
                    setEnrollCourseId(e.target.value);
                    setEnrollSectionId("");
                  }}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">📚 Select Course *</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>

                <select
                  value={enrollSectionId}
                  onChange={e => setEnrollSectionId(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  disabled={!enrollCourseId}
                >
                  <option value="">🏫 Select Section *</option>
                  {availableSectionsForEnrollment.map(section => (
                    <option key={section._id} value={section._id}>
                      #{section.sectionId || '?'} {section.sectionName} ({section.enrolled || 0}/{section.capacity})
                    </option>
                  ))}
                </select>

                <select
                  value={enrollStatus}
                  onChange={e => setEnrollStatus(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="enrolled">✅ Enrolled</option>
                  <option value="active">🟢 Active</option>
                  <option value="completed">🎓 Completed</option>
                  <option value="dropped">⚠️ Dropped</option>
                  <option value="withdrawn">🚫 Withdrawn</option>
                </select>
              </div>

              <button 
                className="btn-primary" 
                onClick={enrollStudent}
                style={{ marginTop: '12px' }}
              >
                ✓ Enroll Student
              </button>
            </div>
          )}

          {/* Enrollments Grouped by Course */}
          {enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p className="muted">No enrollments yet</p>
            </div>
          ) : (
            (() => {
              // Group enrollments by course
              const enrollmentsByCourse = {};
              enrollments.forEach(enrollment => {
                const course = enrollment.courseId && typeof enrollment.courseId === 'object' 
                  ? enrollment.courseId 
                  : courses.find(c => c._id === enrollment.courseId);
                
                const courseId = course?._id || 'unknown';
                if (!enrollmentsByCourse[courseId]) {
                  enrollmentsByCourse[courseId] = {
                    course: course,
                    enrollments: []
                  };
                }
                enrollmentsByCourse[courseId].enrollments.push(enrollment);
              });

              return Object.entries(enrollmentsByCourse).map(([courseId, { course, enrollments: courseEnrollments }]) => (
                <div key={courseId} style={{ marginBottom: '24px' }}>
                  {/* Course Header */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                        {course ? (
                          <>
                            {course.courseCode} - {course.courseName}
                          </>
                        ) : (
                          'Unknown Course'
                        )}
                      </h3>
                      {course && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                          {course.department || 'N/A'} • {course.level || 'N/A'} • {course.credits || 0} Credits
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {courseEnrollments.length} Student{courseEnrollments.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Course Enrollments Table */}
                  <table className="table" style={{ marginTop: 0, borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                    <thead>
                      <tr>
                        <th>Enrollment ID</th>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Section</th>
                        <th>Status</th>
                        <th>Enrollment Date</th>
                        <th width="100">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseEnrollments.map(enrollment => {
                        const student = students.find(s => s._id === enrollment.studentId);
                        const section = enrollment.sectionId && typeof enrollment.sectionId === 'object'
                          ? enrollment.sectionId
                          : sections[enrollment.courseId]?.find(s => s._id === enrollment.sectionId);

                        return (
                          <tr key={enrollment._id}>
                            <td>
                              <span style={{ 
                                fontFamily: 'monospace', 
                                fontSize: '0.85rem', 
                                fontWeight: 'bold',
                                color: '#666' 
                              }}>
                                {enrollment.enrollmentId || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span style={{ 
                                fontFamily: 'monospace', 
                                fontSize: '0.85rem',
                                color: '#0284c7',
                                background: '#f0f9ff',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                {student?.studentId || 'N/A'}
                              </span>
                            </td>
                            <td style={{ fontWeight: '500' }}>
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                              {student && (
                                <div className="muted small" style={{ marginTop: '2px' }}>
                                  {student.email}
                                </div>
                              )}
                            </td>
                            <td>
                              {section ? (
                                <span>
                                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#16a34a' }}>
                                    #{section.sectionId}
                                  </span>{' '}
                                  {section.sectionName}
                                </span>
                              ) : 'Unknown'}
                            </td>
                            <td>
                              <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '12px', 
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                background: enrollment.status === 'active' || enrollment.status === 'enrolled' ? '#f0fdf4' : 
                                           enrollment.status === 'completed' ? '#e0e7ff' : 
                                           enrollment.status === 'dropped' ? '#fee' : '#fef3c7',
                                color: enrollment.status === 'active' || enrollment.status === 'enrolled' ? '#16a34a' : 
                                      enrollment.status === 'completed' ? '#4f46e5' : 
                                      enrollment.status === 'dropped' ? '#dc2626' : '#ca8a04'
                              }}>
                                {enrollment.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.9rem' }}>
                              {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                            </td>
                            <td>
                              <button 
                                className="btn-danger small" 
                                onClick={() => deleteEnrollment(enrollment._id)}
                                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                              >
                                🗑️ Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ));
            })()
          )}
        </>
      )}
    </div>
  );
}
