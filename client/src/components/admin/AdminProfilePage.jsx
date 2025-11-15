import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminProfilePage() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const adminId = user?.userId || user?.id;

      if (!adminId) {
        setError('No admin ID found');
        setLoading(false);
        return;
      }

      const response = await api.getAdminById(adminId);
      setAdminData(response.data);
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading Profile...</h2>
        <p className="muted small">Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <button className="btn small" onClick={fetchAdminProfile}>Retry</button>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="card">
        <h2>No Profile Data</h2>
        <p className="muted">Unable to load profile information.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Personal Information Card */}
      <div className="card">
        <h2>👤 Personal Information</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Admin ID:
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{adminData.adminId || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                First Name:
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{adminData.firstName || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Last Name:
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{adminData.lastName || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>📞 Contact Information</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Email Address:
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{adminData.email || 'N/A'}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Phone Number:
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{adminData.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions & Access Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>🔐 Permissions & Access</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Permissions:
              </label>
              {adminData.permissions && adminData.permissions.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {adminData.permissions.map((permission, index) => (
                    <span 
                      key={index}
                      style={{ 
                        padding: '4px 12px', 
                        background: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '16px', color: '#999' }}>No permissions assigned</p>
              )}
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Account Status:
              </label>
              <span style={{ 
                padding: '6px 16px', 
                background: adminData.isActive ? '#d1fae5' : '#fee2e2',
                color: adminData.isActive ? '#065f46' : '#991b1b',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'inline-block',
                marginTop: '4px'
              }}>
                {adminData.isActive ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>📅 Account Details</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Account Created:
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{formatDate(adminData.createdAt)}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Last Updated:
              </label>
              <p style={{ margin: 0, fontSize: '16px' }}>{formatDate(adminData.updatedAt)}</p>
            </div>
            <div>
              <label className="small" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#666' }}>
                Database ID:
              </label>
              <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: '#666' }}>{adminData._id || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
