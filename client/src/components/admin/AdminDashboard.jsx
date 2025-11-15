import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeAnnouncements: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from multiple microservices with individual error handling
      const results = await Promise.allSettled([
        api.getStudents(),
        api.getInstructors(),
        api.getCourses(),
        api.getEnrollments(),
        api.getAnnouncements({ isActive: true })
      ]);

      // Extract data with fallbacks
      const [studentsRes, instructorsRes, coursesRes, enrollmentsRes, announcementsRes] = results;

      setStats({
        totalStudents: (studentsRes.status === 'fulfilled' && studentsRes.value?.data?.length) || 0,
        totalInstructors: (instructorsRes.status === 'fulfilled' && instructorsRes.value?.data?.length) || 0,
        totalCourses: (coursesRes.status === 'fulfilled' && coursesRes.value?.data?.length) || 0,
        totalEnrollments: (enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value?.data?.length) || 0,
        activeAnnouncements: (announcementsRes.status === 'fulfilled' && announcementsRes.value?.data?.length) || 0
      });

      // Check if any requests failed
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some dashboard data failed to load:', failures);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard statistics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Dashboard Overview</h2>
        <p className="muted small">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Dashboard Overview</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button className="btn small" onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
        <div className="card small" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
          <h3 style={{ margin: 0, fontSize: '2rem', color: '#0284c7' }}>{stats.totalStudents}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Total Students</p>
        </div>
        <div className="card small" style={{ background: '#f0fdf4', border: '1px solid #22c55e' }}>
          <h3 style={{ margin: 0, fontSize: '2rem', color: '#16a34a' }}>{stats.totalInstructors}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Total Instructors</p>
        </div>
        <div className="card small" style={{ background: '#fefce8', border: '1px solid #eab308' }}>
          <h3 style={{ margin: 0, fontSize: '2rem', color: '#ca8a04' }}>{stats.totalCourses}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Total Courses</p>
        </div>
        <div className="card small" style={{ background: '#fdf4ff', border: '1px solid #a855f7' }}>
          <h3 style={{ margin: 0, fontSize: '2rem', color: '#9333ea' }}>{stats.totalEnrollments}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Total Enrollments</p>
        </div>
        <div className="card small" style={{ background: '#fef2f2', border: '1px solid #ef4444' }}>
          <h3 style={{ margin: 0, fontSize: '2rem', color: '#dc2626' }}>{stats.activeAnnouncements}</h3>
          <p className="muted small" style={{ margin: '4px 0 0' }}>Active Announcements</p>
        </div>
      </div>
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <button className="btn ghost small" onClick={fetchDashboardData}>Refresh</button>
      </div>
    </div>
  );
}
  