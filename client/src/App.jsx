import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from "react-router-dom";

import InstructorsPage from "./components/instructor/InstructorsDashboard.jsx";
import "./components/admin/admin.css";

import DashboardPage from "./components/admin/AdminDashboard.jsx";
import AccountsPage from "./components/admin/AccountsPage.jsx";
import CoursesPage from "./components/admin/CoursesPage.jsx";
import ContentsPage from "./components/admin/ContentsPage.jsx";
import ReportsPage from "./components/admin/ReportsPage.jsx";
import PaymentsPage from "./components/admin/PaymentsPage.jsx";
import AdminProfilePage from "./components/admin/AdminProfilePage.jsx";

// ✅ New import for the Student Dashboard
import StudentDashboard from "./components/student/StudentDashboard.jsx";

import Login from "./components/LoginSignup/Login.jsx";
import Signup from "./components/LoginSignup/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GoogleAuthCallback from "./components/GoogleAuthCallback.jsx";
import Modal from "./components/Modal/Modal.jsx";
import ConfirmModal from "./components/Modal/ConfirmModal.jsx";

// ================== ADMIN LAYOUT ==================
function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname.split('/').pop();
    return path || 'dashboard';
  };

  const currentPage = getCurrentPage();

  const handleLogout = () => {
    setConfirmModal({ isOpen: true });
  };

  const confirmLogout = async () => {
    try {
      // Clear all localStorage
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
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      localStorage.clear();
      navigate("/login");
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      accounts: 'Manage Accounts',
      courses: 'Manage Courses & Enrollment',
      contents: 'Contents',
      reports: 'Monitor Reports',
      payments: 'Payment Transactions',
      profile: 'Profile'
    };
    return titles[currentPage] || 'Dashboard';
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
        <div className="brand">LMS Admin</div>

        <ul className="nav">
          <li><button className={currentPage === "dashboard" ? "active" : ""} onClick={() => navigate("/admin/dashboard")}>📊 Dashboard</button></li>
          <li><button className={currentPage === "accounts" ? "active" : ""} onClick={() => navigate("/admin/accounts")}>👥 Manage Accounts</button></li>
          <li><button className={currentPage === "courses" ? "active" : ""} onClick={() => navigate("/admin/courses")}>📚 Manage Courses & Enrollment</button></li>
          <li><button className={currentPage === "contents" ? "active" : ""} onClick={() => navigate("/admin/contents")}>📢 Contents</button></li>
          <li><button className={currentPage === "reports" ? "active" : ""} onClick={() => navigate("/admin/reports")}>📈 Monitor Reports</button></li>
          <li><button className={currentPage === "payments" ? "active" : ""} onClick={() => navigate("/admin/payments")}>💳 Payment Transactions</button></li>
          <li><button className={currentPage === "profile" ? "active" : ""} onClick={() => navigate("/admin/profile")}>👤 Profile</button></li>
          <li><button className="logout-btn" onClick={handleLogout}>🚪 Logout</button></li>
        </ul>
      </aside>

      <main className="content">
        <div className="topbar">
          <h1>{getPageTitle()}</h1>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

// ================== APP ROUTER ==================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Dashboard - Protected with nested routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested admin routes */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="contents" element={<ContentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Instructor Dashboard - Protected with nested routes */}
        <Route 
          path="/instructor/*" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorsPage />
            </ProtectedRoute>
          } 
        />

        {/* Student Dashboard - Protected with nested routes */}
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Login Page - Public */}
        <Route path="/login" element={<Login />} />

        {/* Signup Page - Public */}
        <Route path="/signup" element={<Signup />} />

        {/* Google OAuth Callback - Public */}
        <Route path="/auth/callback" element={<GoogleAuthCallback />} />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
