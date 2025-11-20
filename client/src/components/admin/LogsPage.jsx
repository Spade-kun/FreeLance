import { useState, useEffect } from "react";
import api from "../../services/api";
import Modal from "../Modal/Modal";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  
  const [filter, setFilter] = useState({
    userRole: '',
    actionType: '',
    status: '',
    targetType: '',
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filter, currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        limit: 30,
        search: searchTerm,
        ...filter
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key];
      });

      const response = await api.getAllLogs(queryParams);
      
      if (response.success) {
        setLogs(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const queryParams = { ...filter };
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key];
      });

      const response = await api.getLogStats(queryParams);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilter({
      userRole: '',
      actionType: '',
      status: '',
      targetType: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const exportFilters = { ...filter };
      Object.keys(exportFilters).forEach(key => {
        if (!exportFilters[key]) delete exportFilters[key];
      });
      
      await api.exportLogs(exportFilters);
      setModal({ isOpen: true, title: 'Success', message: 'Logs exported successfully!', type: 'success' });
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: 'Failed to export logs: ' + err.message, type: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      success: '#10b981',
      failed: '#ef4444',
      warning: '#f59e0b'
    };
    return (
      <span style={{
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: colors[status] || '#6b7280',
        color: 'white'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: '#8b5cf6',
      instructor: '#06b6d4',
      student: '#3b82f6'
    };
    return (
      <span style={{
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: colors[role] || '#6b7280',
        color: 'white'
      }}>
        {role.toUpperCase()}
      </span>
    );
  };

  const getActionTypeIcon = (actionType) => {
    const icons = {
      create: '➕',
      read: '👁️',
      update: '✏️',
      delete: '🗑️',
      login: '🔓',
      logout: '🔒',
      payment: '💰',
      submission: '📝',
      enrollment: '📚',
      other: '📌'
    };
    return icons[actionType] || '📌';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="card">
        <h2>📊 Activity Logs</h2>
        <p className="muted small">Loading logs...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="card small" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0284c7' }}>{stats.totalLogs || 0}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Total Logs</p>
          </div>
          <div className="card small" style={{ background: '#f0fdf4', border: '1px solid #22c55e' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#16a34a' }}>{stats.byStatus?.success || 0}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Successful Actions</p>
          </div>
          <div className="card small" style={{ background: '#fef2f2', border: '1px solid #ef4444' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#dc2626' }}>{stats.byStatus?.failed || 0}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Failed Actions</p>
          </div>
          <div className="card small" style={{ background: '#fefce8', border: '1px solid #eab308' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#ca8a04' }}>{stats.byRole?.admin + stats.byRole?.instructor + stats.byRole?.student || 0}</h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Active Users</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>🔍 Filters</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, action..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>User Role</label>
            <select
              name="userRole"
              value={filter.userRole}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Action Type</label>
            <select
              name="actionType"
              value={filter.actionType}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="payment">Payment</option>
              <option value="submission">Submission</option>
              <option value="enrollment">Enrollment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Status</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Target Type</label>
            <select
              name="targetType"
              value={filter.targetType}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="course">Course</option>
              <option value="module">Module</option>
              <option value="lesson">Lesson</option>
              <option value="activity">Activity</option>
              <option value="submission">Submission</option>
              <option value="payment">Payment</option>
              <option value="enrollment">Enrollment</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn small ghost" onClick={clearFilters}>Clear Filters</button>
          <button className="btn small" onClick={fetchLogs}>Apply Filters</button>
          <button className="btn small" style={{ marginLeft: 'auto', background: '#10b981' }} onClick={handleExport}>
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>📊 Activity Logs</h2>
          <span className="muted small">
            Showing {logs.length} logs
          </span>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {logs.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>
            {searchTerm || Object.values(filter).some(v => v) ? 'No logs found matching your criteria' : 'No activity logs yet'}
          </p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Timestamp</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>User</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Role</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Action</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Description</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Target</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(log.timestamp)}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{log.userName}</div>
                          <div className="muted small">{log.userEmail}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {getRoleBadge(log.userRole)}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                        <span style={{ marginRight: '6px' }}>{getActionTypeIcon(log.actionType)}</span>
                        {log.action}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', maxWidth: '300px' }}>
                        {log.description}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                        {log.targetType && (
                          <div>
                            <div style={{ fontWeight: '600', color: '#6b7280' }}>{log.targetType}</div>
                            {log.targetName && <div className="muted small">{log.targetName}</div>}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {getStatusBadge(log.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                <button
                  className="btn small ghost"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="muted small">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn small ghost"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false })} 
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
