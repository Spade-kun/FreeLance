import { useState, useEffect } from 'react';
import api from '../../services/api';
import './admin.css';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userRole: '',
    actionType: '',
    resource: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filters.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {};
      if (filters.userRole) queryParams.userRole = filters.userRole;
      if (filters.actionType) queryParams.actionType = filters.actionType;
      if (filters.resource) queryParams.resource = filters.resource;
      if (filters.status) queryParams.status = filters.status;
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;
      queryParams.page = filters.page;
      queryParams.limit = filters.limit;
      queryParams.sortBy = 'createdAt';
      queryParams.sortOrder = 'desc';

      const response = await api.getLogs(queryParams);
      
      if (response.success) {
        setLogs(response.data || []);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: 0
        });
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(`Failed to load activity logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getLogStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching log stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      userRole: '',
      actionType: '',
      resource: '',
      status: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 50
    });
    setTimeout(() => fetchLogs(), 100);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeColor = (actionType) => {
    const colors = {
      LOGIN: '#22c55e',
      LOGOUT: '#6b7280',
      LOGIN_FAILED: '#ef4444',
      CREATE: '#3b82f6',
      UPDATE: '#f59e0b',
      DELETE: '#dc2626',
      VIEW: '#8b5cf6',
      EXPORT: '#14b8a6',
      OTHER: '#64748b'
    };
    return colors[actionType] || '#64748b';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#dc2626',
      instructor: '#f59e0b',
      student: '#3b82f6',
      unknown: '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      success: '#22c55e',
      failed: '#ef4444',
      pending: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="card">
        <h2>Activity Logs</h2>
        <p className="muted small">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <h2>Activity Logs</h2>
        <p className="muted small">Track all user activities and system events</p>
      </div>

      {/* Statistics Summary */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card small" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0284c7' }}>{stats.total || 0}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Total Activities</p>
          </div>
          <div className="card small" style={{ background: '#f0fdf4', border: '1px solid #22c55e' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#16a34a' }}>{stats.recentActivity || 0}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Last 24 Hours</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ background: '#f8fafc', padding: '16px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1rem' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>User Role</label>
            <select
              value={filters.userRole}
              onChange={(e) => handleFilterChange('userRole', e.target.value)}
              className="input"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Action Type</label>
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              className="input"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW">View</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Resource</label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              className="input"
            >
              <option value="">All Resources</option>
              <option value="authentication">Authentication</option>
              <option value="user">User</option>
              <option value="course">Course</option>
              <option value="module">Module</option>
              <option value="lesson">Lesson</option>
              <option value="payment">Payment</option>
              <option value="content">Content</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleApplyFilters} className="btn primary small">
            Apply Filters
          </button>
          <button onClick={handleResetFilters} className="btn ghost small">
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', marginBottom: '16px' }}>
          <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User Email</th>
              <th>Role</th>
              <th>Action</th>
              <th>Type</th>
              <th>Resource</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>
                  <p className="muted">No activity logs found</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatDate(log.createdAt)}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{log.userEmail}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'white',
                        background: getRoleBadgeColor(log.userRole),
                        textTransform: 'capitalize'
                      }}
                    >
                      {log.userRole}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem' }}>{log.action}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'white',
                        background: getActionBadgeColor(log.actionType)
                      }}
                    >
                      {log.actionType}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
                    {log.resource}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'white',
                        background: getStatusBadgeColor(log.status),
                        textTransform: 'capitalize'
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', maxWidth: '200px' }}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="muted small">
            Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total logs)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="btn ghost small"
            >
              Previous
            </button>
            <span style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
              Page {pagination.currentPage}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="btn ghost small"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <button className="btn ghost small" onClick={fetchLogs}>
          Refresh Logs
        </button>
      </div>
    </div>
  );
}
