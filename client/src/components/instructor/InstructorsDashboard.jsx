import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialDB = {
  users: [
    { id: 1, name: "Admin User", email: "admin@example.com", role: "Admin" },
    { id: 2, name: "Jane Doe", email: "jane@example.com", role: "Instructor" }
  ],
  courses: [
    { id: 1, title: "Intro to Programming", year: "2025", sections: [{ id: 1, name: "A" }] },
    { id: 2, title: "Web Development", year: "2025", sections: [] }
  ],
  enrollments: [
    { id: 1, studentName: "John Student", courseId: 1, section: "A" }
  ],
  contents: [
    { id: 1, courseId: 1, title: "Syllabus", body: "Course syllabus goes here." }
  ],
  grades: [] // added grades
};

const uid = () => Date.now() + Math.floor(Math.random() * 999);

export default function InstructorDashboard() {
  const [db, setDb] = useState(initialDB);
  const [page, setPage] = useState("dashboard");
  const navigate = useNavigate();

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear all localStorage
      localStorage.clear();
      alert("Logged out successfully!");
      // Redirect to login page
      navigate("/login");
    }
  };

   // ---------------- Dashboard ----------------
   const renderDashboard = () => (
    <div>
      <h2>Dashboard Overview</h2>

      {/* Users List */}
      <section className="card section">
        <h3>👥 Users</h3>
        {db.users.length === 0 ? (
          <p className="muted small">No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
              </tr>
            </thead>
            <tbody>
              {db.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Courses List */}
      <section className="card section">
        <h3>📚 Courses</h3>
        {db.courses.length === 0 ? (
          <p className="muted small">No courses yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Year</th><th>Sections</th>
              </tr>
            </thead>
            <tbody>
              {db.courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.title}</td>
                  <td>{c.year}</td>
                  <td>{c.sections.map((s) => s.name).join(", ") || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Enrollments List */}
      <section className="card section">
        <h3>🧾 Enrollments</h3>
        {db.enrollments.length === 0 ? (
          <p className="muted small">No enrollments yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Student</th><th>Course</th><th>Section</th>
              </tr>
            </thead>
            <tbody>
              {db.enrollments.map((e) => {
                const course = db.courses.find((c) => c.id === e.courseId);
                return (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.studentName}</td>
                    <td>{course ? course.title : "N/A"}</td>
                    <td>{e.section}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Grades List */}
      <section className="card section">
        <h3>🏆 Grades</h3>
        {db.grades.length === 0 ? (
          <p className="muted small">No grades recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Student</th><th>Course</th><th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {db.grades.map((g) => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>{g.studentName}</td>
                  <td>{g.course}</td>
                  <td>{g.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
  // ---------------- Profile ----------------
  const renderProfile = () => (
    <div className="card">
      <h2>Profile</h2>
      <p><strong>Name:</strong> Admin User</p>
      <p><strong>Email:</strong> admin@example.com</p>
      <button className="btn small">Edit Profile</button>
    </div>
  );

  // ---------------- Courses ----------------
  const addCourse = () => {
    const title = prompt("Course title");
    if (!title) return;
    const year = prompt("Year", "2025");
    setDb(prev => ({
      ...prev,
      courses: [...prev.courses, { id: uid(prev.courses), title, year, sections: [] }]
    }));
  };
  

  const enrollStudent = () => {
    const studentName = prompt("Student name:");
    if (!studentName) return;

    const id = Number(prompt("Course ID:\n" + db.courses.map(c => `${c.id}: ${c.title}`).join("\n")));
    const course = db.courses.find(c => c.id === id);
    if (!course) return alert("Invalid Course");

    const section = prompt("Section", "A");
    setDb(prev => ({
      ...prev,
      enrollments: [...prev.enrollments, { id: uid(), studentName, courseId: id, section }]
    }));
  };

  const addSection = (courseId) => {
    const sec = prompt("Section name");
    if (!sec) return;
    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(c =>
        c.id === courseId ? { ...c, sections: [...c.sections, { id: uid(), name: sec }] } : c
      )
    }));
  };

  const editCourse = (courseId) => {
    const c = db.courses.find(x => x.id === courseId);
    const title = prompt("Title", c.title);
    const year = prompt("Year", c.year);
    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(x => x.id === courseId ? { ...x, title, year } : x)
    }));
  };

  const deleteCourse = (courseId) => {
    if (!confirm("Delete course?")) return;
    setDb(prev => ({
      ...prev,
      courses: prev.courses.filter(x => x.id !== courseId)
    }));
  };

  const renderCourses = () => (
    <div>
      <h2>Manage Courses & Sections</h2>
  
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: 16 }}>
        {/* Add Course Card */}
        <div className="card" style={{ flex: "1 1 300px" }}>
          <h3>Add Course</h3>
          <p className="muted small">Create a new course with its year and sections.</p>
          <button className="btn small" onClick={addCourse}>Add Course</button>
        </div>
  
        {/* Enroll Student Card */}
        <div className="card" style={{ flex: "1 1 300px" }}>
          <h3>Enroll Student</h3>
          <p className="muted small">Enroll a student into a specific course and section.</p>
          <button className="btn small" onClick={enrollStudent}>Enroll Student</button>
        </div>
      </div>
  
      {/* Course List */}
      <div style={{ marginTop: 24 }}>
        <h3>Course List</h3>
        {db.courses.length === 0 && <p className="muted small">No courses yet.</p>}
  
        {db.courses.map(c => (
          <div key={c.id} className="card small" style={{ marginTop: 8 }}>
            <strong>{c.title}</strong> ({c.year})
            <p className="muted small">Sections: {c.sections.map(s => s.name).join(", ") || "none"}</p>
            <div>
              <button className="btn ghost small" onClick={() => addSection(c.id)}>Add Section</button>
              <button className="btn ghost small" onClick={() => editCourse(c.id)}>Edit</button>
              <button className="btn ghost small" onClick={() => deleteCourse(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  

  // ---------------- Learning Materials ----------------
const addMaterial = () => {
  const title = prompt("Enter material title:");
  if (!title) return;

  const courseId = Number(
    prompt("Select Course ID:\n" + db.courses.map(c => `${c.id}: ${c.title}`).join("\n"))
  );
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return alert("Invalid course ID");

  const body = prompt("Enter material description or notes:");
  const link = prompt("Enter YouTube or external link (optional):");

  setDb(prev => ({
    ...prev,
    contents: [
      ...prev.contents,
      {
        id: uid(prev.contents),
        courseId,
        title,
        body,
        link
      }
    ]
  }));
};

const editMaterial = (id) => {
  const m = db.contents.find(x => x.id === id);
  if (!m) return alert("Material not found");

  const title = prompt("Edit title:", m.title);
  const body = prompt("Edit description:", m.body);
  const link = prompt("Edit link:", m.link || "");

  setDb(prev => ({
    ...prev,
    contents: prev.contents.map(x =>
      x.id === id ? { ...x, title, body, link } : x
    )
  }));
};

const deleteMaterial = (id) => {
  if (!confirm("Delete this material?")) return;
  setDb(prev => ({
    ...prev,
    contents: prev.contents.filter(x => x.id !== id)
  }));
};

const renderMaterials = () => (
  <div>
    <h2>Learning Materials</h2>
    <button className="btn small" onClick={addMaterial}>➕ Add Material</button>

    {db.contents.length === 0 ? (
      <p className="muted small" style={{ marginTop: 16 }}>No materials yet.</p>
    ) : (
      <div style={{ marginTop: 20 }}>
        {db.contents.map((m) => {
          const course = db.courses.find(c => c.id === m.courseId);
          return (
            <div key={m.id} className="card small" style={{ marginBottom: 10 }}>
              <h3>{m.title}</h3>
              <p className="muted small">Course: {course ? course.title : "Unknown"}</p>
              <p>{m.body}</p>
              {m.link && (
                <p>
                  <a href={m.link} target="_blank" rel="noopener noreferrer">
                    🔗 Open Resource
                  </a>
                </p>
              )}
              <div>
                <button className="btn ghost small" onClick={() => editMaterial(m.id)}>Edit</button>
                <button className="btn ghost small" onClick={() => deleteMaterial(m.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
  // ---------------- Assessment & Grading ----------------
  const addGrade = () => {
    if (db.enrollments.length === 0) return alert("No students enrolled.");
  
    const studentId = Number(prompt("Select student ID:\n" + db.enrollments.map((e, idx) => `${idx + 1}: ${e.studentName} (${db.courses.find(c => c.id === e.courseId)?.title || "—"})`).join("\n")));
    const enrollment = db.enrollments[studentId - 1];
    if (!enrollment) return alert("Invalid selection");
  
    const assessmentTitle = prompt("Assessment title:");
    if (!assessmentTitle) return;
  
    const score = prompt("Score (e.g., 85/100):");
    if (!score) return alert("Invalid input");
  
    setDb(prev => ({
      ...prev,
      grades: [...prev.grades, {
        id: uid(),
        studentName: enrollment.studentName,
        courseId: enrollment.courseId,
        assessmentTitle,
        score // store as string
      }]
    }));
  };
  
  const editGrade = (id) => {
    const g = db.grades.find(x => x.id === id);
    if (!g) return;
  
    const assessmentTitle = prompt("Assessment title", g.assessmentTitle);
    const score = prompt("Score (e.g., 85/100)", g.score);
    if (!score) return alert("Invalid input");
  
    setDb(prev => ({
      ...prev,
      grades: prev.grades.map(x => x.id === id ? { ...x, assessmentTitle, score } : x)
    }));
  };
  

  const renderAssessment = () => (
    <div className="card">
      <h2>Assessment & Grading</h2>
      <button className="btn small" onClick={addGrade}>Add Grade</button>

      <div style={{ marginTop: 12 }}>
        {db.grades.length === 0 ? (
          <p className="muted small">No grades yet.</p>
        ) : (
          db.grades.map(g => {
            const course = db.courses.find(c => c.id === g.courseId);
            return (
              <div key={g.id} className="card small" style={{ marginTop: 8 }}>
                <strong>{g.assessmentTitle}</strong> — {g.studentName} ({course?.title || "—"}) : <strong>{g.score}</strong>
                <div style={{ marginTop: 8 }}>
                  <button className="btn ghost small" onClick={() => editGrade(g.id)}>Edit</button>
                  <button className="btn ghost small" onClick={() => deleteGrade(g.id)}>Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ---------------- Reports ----------------
  const exportCsv = () => {
    const rows = [["Student", "Course", "Section", "Assessment", "Score"], 
      ...db.grades.map(g => [
        g.studentName,
        db.courses.find(c => c.id === g.courseId)?.title || "?",
        db.enrollments.find(e => e.studentName === g.studentName && e.courseId === g.courseId)?.section || "?",
        g.assessmentTitle,
        g.score
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "grades.csv";
    a.click();
  };

  const resetData = () => {
    if (confirm("Reset demo data?")) window.location.reload();
  };

  const renderReports = () => (
    <div className="card">
      <h2>Reports</h2>
      <button className="btn small" onClick={exportCsv}>Export Grades CSV</button>
      <button className="btn ghost small" onClick={resetData}>Reset Data</button>
      <p className="muted small" style={{ marginTop: 8 }}>Enrollments: {db.enrollments.length}</p>
    </div>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">LMS Instructor</div>
        <ul className="nav">
          <li><button onClick={() => setPage("dashboard")}>Dashboard</button></li>
          <li><button onClick={() => setPage("profile")}>Profile</button></li>
          <li><button onClick={() => setPage("courses")}>Manage Courses & Section</button></li>
          <li><button onClick={() => setPage("materials")}>Learning Materials</button></li>
          <li><button onClick={() => setPage("assessment")}>Assessment & Grading</button></li>
          <li><button onClick={() => setPage("reports")}>Reports</button></li>
          <li><button onClick={logout}>Logout</button></li>
        </ul>
        <div className="footer small"></div>
      </aside>

      <main className="content">
        <div className="topbar">
          <h1>{page.charAt(0).toUpperCase() + page.slice(1)}</h1>
        </div>

        <div id="pageContent">
          {page === "dashboard" && renderDashboard()}
          {page === "profile" && renderProfile()}
          {page === "courses" && renderCourses()}
          {page === "materials" && renderMaterials()}
          {page === "assessment" && renderAssessment()}
          {page === "reports" && renderReports()}
        </div>
      </main>
    </div>
  );
}
