import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function AnnouncementCard({ userRole, userEnrollments = [] }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
    // Load dismissed announcements from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
    setDismissedAnnouncements(dismissed);
  }, [userRole, userEnrollments]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.getAnnouncements();
      
      console.log('📢 Announcements API Response:', response);
      console.log('📢 User Role:', userRole);
      console.log('📢 User Enrollments:', userEnrollments);
      
      // Handle both possible response structures
      const allAnnouncements = response.data?.data || response.data || [];
      console.log('📢 All Announcements:', allAnnouncements);
      
      if (allAnnouncements && Array.isArray(allAnnouncements)) {
        console.log('📢 Processing announcements...');

        // Filter announcements based on user role and enrollments
        const filteredAnnouncements = allAnnouncements.filter(announcement => {
          console.log(`📢 Checking announcement: ${announcement.title}`, {
            isActive: announcement.isActive,
            expiryDate: announcement.expiryDate,
            targetAudience: announcement.targetAudience,
            courseId: announcement.courseId
          });
          
          // Check if announcement is active and not expired
          if (!announcement.isActive) {
            console.log(`📢 ❌ ${announcement.title} - Not active`);
            return false;
          }
          if (announcement.expiryDate && new Date(announcement.expiryDate) < new Date()) {
            console.log(`📢 ❌ ${announcement.title} - Expired`);
            return false;
          }

          // Filter by target audience
          const { targetAudience, courseId } = announcement;
          
          if (targetAudience === 'all') {
            console.log(`📢 ✅ ${announcement.title} - For all users`);
            return true;
          }
          
          if (targetAudience === 'students' && userRole === 'student') {
            console.log(`📢 ✅ ${announcement.title} - For students`);
            return true;
          }
          if (targetAudience === 'instructors' && userRole === 'instructor') {
            console.log(`📢 ✅ ${announcement.title} - For instructors`);
            return true;
          }
          
          if (targetAudience === 'specific_course' && courseId) {
            // Check if user is enrolled in the specific course
            const isEnrolled = userEnrollments.some(enrollment => 
              enrollment.courseId === courseId || enrollment._id === courseId
            );
            console.log(`📢 ${isEnrolled ? '✅' : '❌'} ${announcement.title} - Course-specific (${courseId}), enrolled: ${isEnrolled}`);
            return isEnrolled;
          }
          
          console.log(`📢 ❌ ${announcement.title} - No match`);
          return false;
        });

        console.log('📢 Filtered Announcements:', filteredAnnouncements);

        // Sort by priority and publish date
        const sortedAnnouncements = filteredAnnouncements.sort((a, b) => {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.publishDate) - new Date(a.publishDate);
        });

        console.log('📢 Sorted Announcements:', sortedAnnouncements);
        setAnnouncements(sortedAnnouncements);
      } else {
        console.log('📢 ❌ No valid announcements array found');
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('📢 ❌ Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (announcementId) => {
    const updatedDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(updatedDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(updatedDismissed));
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: '#fef2f2',
          border: '#dc2626',
          color: '#dc2626',
          icon: AlertCircle,
          label: '🚨 URGENT'
        };
      case 'high':
        return {
          bg: '#fef3c7',
          border: '#f59e0b',
          color: '#d97706',
          icon: AlertTriangle,
          label: '⚠️ HIGH'
        };
      case 'medium':
        return {
          bg: '#dbeafe',
          border: '#3b82f6',
          color: '#1d4ed8',
          icon: Info,
          label: 'ℹ️ MEDIUM'
        };
      default:
        return {
          bg: '#f3f4f6',
          border: '#6b7280',
          color: '#4b5563',
          icon: Bell,
          label: '📢 INFO'
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const visibleAnnouncements = announcements.filter(
    a => !dismissedAnnouncements.includes(a._id)
  );

  if (loading) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} />
          <h3 style={{ margin: 0 }}>Announcements</h3>
        </div>
        <p className="muted small" style={{ marginTop: '12px' }}>Loading announcements...</p>
      </div>
    );
  }

  // Debug: Show card even if empty to help troubleshoot
  if (visibleAnnouncements.length === 0) {
    console.log('📢 No visible announcements. Total announcements:', announcements.length, 'Dismissed:', dismissedAnnouncements.length);
    return (
      <div className="card" style={{ marginBottom: '24px', background: '#fef3c7', border: '1px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#d97706" />
            <h3 style={{ margin: 0, color: '#d97706' }}>No Announcements</h3>
          </div>
          <button 
            onClick={fetchAnnouncements}
            className="btn small"
            style={{ fontSize: '0.85rem' }}
          >
            🔄 Refresh
          </button>
        </div>
        <p className="muted small" style={{ marginTop: '12px' }}>
          No announcements available for your role: <strong>{userRole}</strong>
          {announcements.length > 0 && ` (Found ${announcements.length} total, but all dismissed or filtered)`}
        </p>
        {dismissedAnnouncements.length > 0 && (
          <button
            onClick={() => {
              localStorage.removeItem('dismissedAnnouncements');
              setDismissedAnnouncements([]);
              fetchAnnouncements();
            }}
            className="btn ghost small"
            style={{ marginTop: '8px', fontSize: '0.85rem' }}
          >
            🔓 Show Dismissed Announcements
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Bell size={20} color="#0284c7" />
        <h3 style={{ margin: 0 }}>Announcements ({visibleAnnouncements.length})</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visibleAnnouncements.map((announcement) => {
          const priorityConfig = getPriorityConfig(announcement.priority);
          const Icon = priorityConfig.icon;

          return (
            <div
              key={announcement._id}
              className="card small"
              style={{
                background: priorityConfig.bg,
                border: `1px solid ${priorityConfig.border}`,
                position: 'relative',
                paddingRight: '40px'
              }}
            >
              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(announcement._id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Dismiss"
              >
                <X size={16} color={priorityConfig.color} />
              </button>

              {/* Priority badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon size={18} color={priorityConfig.color} />
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: priorityConfig.color,
                  letterSpacing: '0.5px'
                }}>
                  {priorityConfig.label}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginLeft: 'auto',
                  marginRight: '24px'
                }}>
                  {formatDate(announcement.publishDate)}
                </span>
              </div>

              {/* Title */}
              <h4 style={{ 
                margin: '0 0 8px 0', 
                color: priorityConfig.color,
                fontSize: '1rem'
              }}>
                {announcement.title}
              </h4>

              {/* Content */}
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem',
                lineHeight: '1.5',
                color: '#374151',
                whiteSpace: 'pre-wrap'
              }}>
                {announcement.content}
              </p>

              {/* Attachments */}
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <p className="small" style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#6b7280' }}>
                    📎 Attachments:
                  </p>
                  {announcement.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginRight: '12px',
                        padding: '4px 8px',
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        color: priorityConfig.color
                      }}
                    >
                      {attachment.filename}
                    </a>
                  ))}
                </div>
              )}

              {/* Target info */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                  {announcement.targetAudience === 'all' && '🌐 For everyone'}
                  {announcement.targetAudience === 'students' && '👨‍🎓 For students'}
                  {announcement.targetAudience === 'instructors' && '👨‍🏫 For instructors'}
                  {announcement.targetAudience === 'specific_course' && '📚 Course-specific'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
