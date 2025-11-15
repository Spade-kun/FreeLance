import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./student.css";

export default function StudentDashboard() {
  const [page, setPage] = useState("dashboard");
  const navigate = useNavigate();

  const student = {
    name: "John Student",
    email: "johnstudent@example.com",
    enrolledCourses: [
      { course: "Intro to Programming", status: "Ongoing" },
      { course: "Web Development", status: "Completed" },
    ],
    activities: [
      { title: "Quiz 1 - Passed", date: "2025-01-05" },
      { title: "Assignment Submitted", date: "2025-01-18" },
      { title: "Quiz 2 - Pending", date: "2025-01-20" },
    ],
  };

  const renderContent = () => {
    if (page === "dashboard")
      return (
        <div className="card">
          <h2>Welcome, {student.name}</h2>
          <p className="muted small">
            You are currently enrolled in {student.enrolledCourses.length} course(s)
          </p>
        </div>
      );

    if (page === "profile")
      return (
        <div className="card">
          <h2>Profile</h2>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {student.email}</p>
        </div>
      );

    if (page === "activities")
      return (
        <div className="card">
          <h2>Recent Activities</h2>
          <table>
            <thead>
              <tr><th>Activity</th><th>Date</th></tr>
            </thead>
            <tbody>
              {student.activities.map((a, i) => (
                <tr key={i}><td>{a.title}</td><td>{a.date}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    if (page === "reports")
      return (
        <div className="card">
          <h2>Course Progress</h2>
          <table>
            <thead>
              <tr><th>Course</th><th>Status</th></tr>
            </thead>
            <tbody>
              {student.enrolledCourses.map((c, i) => (
                <tr key={i}><td>{c.course}</td><td>{c.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    return null;
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      console.log("Logout button clicked!");
      // Clear all localStorage
      localStorage.clear();
      alert("Logged out successfully!");
      // Redirect to login page
      navigate("/login");
    }
  };
  
  

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">LMS Student</div>

        <ul className="nav">
          <li><button onClick={() => setPage("dashboard")}>Dashboard</button></li>
          <li><button onClick={() => setPage("profile")}>Profile</button></li>
          <li><button onClick={() => setPage("activities")}>Activities</button></li>
          <li><button onClick={() => setPage("reports")}>Reports</button></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>

        <div className="footer small">Signed in as {student.email}</div>
      </aside>

      <main className="content">
        <div className="topbar">
          <h1>{page.charAt(0).toUpperCase() + page.slice(1)}</h1>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
