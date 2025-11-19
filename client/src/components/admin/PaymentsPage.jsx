import { useState, useEffect } from "react";
import api from "../../services/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    paymentType: '',
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filter, currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        limit: 20,
        ...filter
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) delete queryParams[key];
      });

      const response = await api.getAllPayments(queryParams);
      
      if (response.success) {
        setPayments(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payments');
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

      const response = await api.getPaymentStats(queryParams);
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
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilter({
      status: '',
      paymentType: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) {
      return;
    }

    try {
      await api.deletePayment(id);
      alert('Payment deleted successfully');
      fetchPayments();
      fetchStats();
    } catch (err) {
      alert('Error deleting payment: ' + err.message);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updatePaymentStatus(id, newStatus);
      alert('Payment status updated successfully');
      fetchPayments();
      fetchStats();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleApprovePayment = async (id) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) {
      return;
    }

    try {
      await api.updatePaymentStatus(id, 'completed');
      alert('✅ Payment approved successfully!');
      fetchPayments();
      fetchStats();
    } catch (err) {
      alert('Error approving payment: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444',
      refunded: '#6366f1',
      cancelled: '#6b7280'
    };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: colors[status] || '#6b7280',
        color: 'white'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Filter payments by search term
  const filteredPayments = payments.filter(payment => 
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && payments.length === 0) {
    return (
      <div className="card">
        <h2>💳 Payment Management</h2>
        <p className="muted small">Loading payments...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Statistics Cards */}
      {stats && stats.overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="card small" style={{ background: '#f0fdf4', border: '1px solid #10b981' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#059669' }}>
              {formatCurrency(stats.overview.totalRevenue || 0)}
            </h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Total Revenue</p>
          </div>
          <div className="card small" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0284c7' }}>
              {stats.overview.totalPayments || 0}
            </h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Total Payments</p>
          </div>
          <div className="card small" style={{ background: '#fefce8', border: '1px solid #eab308' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#ca8a04' }}>
              {stats.overview.completedPayments || 0}
            </h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Completed</p>
          </div>
          <div className="card small" style={{ background: '#fef2f2', border: '1px solid #ef4444' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#dc2626' }}>
              {stats.overview.pendingPayments || 0}
            </h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Pending</p>
          </div>
          <div className="card small" style={{ background: '#fdf4ff', border: '1px solid #a855f7' }}>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#9333ea' }}>
              {formatCurrency(stats.overview.avgPayment || 0)}
            </h3>
            <p className="muted small" style={{ margin: '4px 0 0' }}>Average Payment</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>🔍 Filters & Search</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Search</label>
            <input
              type="text"
              placeholder="Student, Email, Transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="small" style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Payment Type</label>
            <select
              name="paymentType"
              value={filter.paymentType}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All Types</option>
              <option value="Tuition Fee">Tuition Fee</option>
              <option value="Enrollment Fee">Enrollment Fee</option>
              <option value="Laboratory Fee">Laboratory Fee</option>
              <option value="Miscellaneous Fee">Miscellaneous Fee</option>
              <option value="Other">Other</option>
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
          <button className="btn small" onClick={fetchPayments}>Refresh</button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>💰 Payment Transactions</h2>
          <span className="muted small">
            Showing {filteredPayments.length} of {payments.length} payments
          </span>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {filteredPayments.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>
            {searchTerm || filter.status || filter.paymentType ? 'No payments found matching your criteria' : 'No payments recorded yet'}
          </p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Date</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Student</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Type</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Method</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Transaction ID</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{payment.studentName}</div>
                          <div className="muted small">{payment.studentEmail}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>{payment.paymentType}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151'
                        }}>
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' }}>
                        {payment.transactionId.substring(0, 20)}...
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {getStatusBadge(payment.status)}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {payment.status === 'pending' && (
                            <button
                              className="btn small"
                              onClick={() => handleApprovePayment(payment._id)}
                              style={{ 
                                fontSize: '12px', 
                                padding: '4px 8px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              ✅ Approve
                            </button>
                          )}
                          <button
                            className="btn ghost small"
                            onClick={() => {
                              const details = `
Payment Details:
--------------------------------
Student: ${payment.studentName}
Email: ${payment.studentEmail}
Amount: ${formatCurrency(payment.amount, payment.currency)}
Type: ${payment.paymentType}
Method: ${payment.paymentMethod}
Transaction ID: ${payment.transactionId}
Payer: ${payment.payerName}
Date: ${formatDate(payment.paymentDate)}
Status: ${payment.status}
--------------------------------
                              `.trim();
                              alert(details);
                            }}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            View
                          </button>
                          <button
                            className="btn danger small"
                            onClick={() => handleDeletePayment(payment._id)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            Delete
                          </button>
                        </div>
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
    </div>
  );
}
