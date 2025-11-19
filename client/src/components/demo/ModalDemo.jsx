import { useState } from 'react';
import { Modal, ConfirmModal, ActionModal } from '../Modal';

/**
 * Modal Demo Page - Showcases all modal types
 * This is a demonstration page showing how to use all modal components
 */
export default function ModalDemo() {
  const [simpleModal, setSimpleModal] = useState({ isOpen: false, type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [actionModal, setActionModal] = useState({ isOpen: false, size: 'medium' });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // Simple Modal Examples
  const showSuccessModal = () => {
    setSimpleModal({
      isOpen: true,
      title: 'Success!',
      message: 'Your operation completed successfully.',
      type: 'success'
    });
  };

  const showErrorModal = () => {
    setSimpleModal({
      isOpen: true,
      title: 'Error Occurred',
      message: 'Something went wrong. Please try again.',
      type: 'error'
    });
  };

  const showWarningModal = () => {
    setSimpleModal({
      isOpen: true,
      title: 'Warning',
      message: 'Please review your input before proceeding.',
      type: 'warning'
    });
  };

  const showInfoModal = () => {
    setSimpleModal({
      isOpen: true,
      title: 'Information',
      message: 'Here is some important information you should know.',
      type: 'info'
    });
  };

  // Confirm Modal Examples
  const showDeleteConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Item?',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        console.log('Item deleted');
        showSuccessModal();
      }
    });
  };

  const showApproveConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Payment?',
      message: 'Do you want to approve this payment and mark it as completed?',
      type: 'question',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      onConfirm: () => {
        console.log('Payment approved');
        showSuccessModal();
      }
    });
  };

  // Action Modal Examples
  const showSmallModal = () => {
    setActionModal({ isOpen: true, size: 'small' });
  };

  const showMediumModal = () => {
    setActionModal({ isOpen: true, size: 'medium' });
  };

  const showLargeModal = () => {
    setActionModal({ isOpen: true, size: 'large' });
  };

  const handleFormSubmit = () => {
    console.log('Form submitted:', formData);
    setActionModal({ ...actionModal, isOpen: false });
    showSuccessModal();
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '10px' }}>🎨 Modal Component Showcase</h1>
      <p style={{ color: '#6b7280', marginBottom: '40px' }}>
        Interactive demonstration of all modal types available in the system
      </p>

      {/* Simple Notification Modals */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
          📢 Simple Notification Modals
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
          Auto-dismiss after 2.5 seconds. Perfect for quick feedback.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={showSuccessModal} style={buttonStyle('#10b981')}>
            ✅ Success Modal
          </button>
          <button onClick={showErrorModal} style={buttonStyle('#ef4444')}>
            ❌ Error Modal
          </button>
          <button onClick={showWarningModal} style={buttonStyle('#f59e0b')}>
            ⚠️ Warning Modal
          </button>
          <button onClick={showInfoModal} style={buttonStyle('#3b82f6')}>
            ℹ️ Info Modal
          </button>
        </div>
      </section>

      {/* Confirmation Modals */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
          ✋ Confirmation Dialogs
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
          Require user confirmation. Use for destructive or important actions.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={showDeleteConfirm} style={buttonStyle('#ef4444')}>
            🗑️ Delete Confirmation
          </button>
          <button onClick={showApproveConfirm} style={buttonStyle('#8b5cf6')}>
            ✓ Approve Confirmation
          </button>
        </div>
      </section>

      {/* Action Modals */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
          📝 Action Modals (Forms & Content)
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>
          Versatile modals for forms, detailed views, and custom content. Multiple sizes available.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={showSmallModal} style={buttonStyle('#6b7280')}>
            📱 Small Modal (400px)
          </button>
          <button onClick={showMediumModal} style={buttonStyle('#6b7280')}>
            💻 Medium Modal (600px)
          </button>
          <button onClick={showLargeModal} style={buttonStyle('#6b7280')}>
            🖥️ Large Modal (800px)
          </button>
        </div>
      </section>

      {/* Code Examples */}
      <section>
        <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
          💻 Code Examples
        </h2>
        
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Simple Modal</h3>
          <pre style={{ background: '#1f2937', color: '#f9fafb', padding: '15px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>
{`setModal({
  isOpen: true,
  title: 'Success!',
  message: 'Operation completed',
  type: 'success' // 'error', 'warning', 'info'
});`}
          </pre>
        </div>

        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Confirmation Modal</h3>
          <pre style={{ background: '#1f2937', color: '#f9fafb', padding: '15px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>
{`setConfirmModal({
  isOpen: true,
  title: 'Delete Item?',
  message: 'This cannot be undone',
  type: 'danger',
  onConfirm: () => handleDelete()
});`}
          </pre>
        </div>

        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Action Modal</h3>
          <pre style={{ background: '#1f2937', color: '#f9fafb', padding: '15px', borderRadius: '8px', fontSize: '13px', overflow: 'auto' }}>
{`<ActionModal
  isOpen={show}
  onClose={close}
  title="Add Student"
  icon="👨‍🎓"
  size="medium"
  actions={[
    { label: 'Cancel', onClick: close, variant: 'default' },
    { label: 'Save', onClick: save, variant: 'primary' }
  ]}
>
  <div className="form-group">
    <label className="form-label">Name</label>
    <input className="form-input" />
  </div>
</ActionModal>`}
          </pre>
        </div>
      </section>

      {/* Modal Components */}
      <Modal
        isOpen={simpleModal.isOpen}
        onClose={() => setSimpleModal({ ...simpleModal, isOpen: false })}
        title={simpleModal.title}
        message={simpleModal.message}
        type={simpleModal.type}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
      />

      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        title="Example Form"
        icon="📝"
        size={actionModal.size}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setActionModal({ ...actionModal, isOpen: false }),
            variant: 'default'
          },
          {
            label: 'Submit',
            onClick: handleFormSubmit,
            variant: 'primary',
            icon: '✓'
          }
        ]}
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your name"
          />
          <span className="form-helper">This field is required</span>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-textarea"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Write your message here..."
            rows="4"
          />
        </div>

        <div style={{ 
          padding: '15px', 
          background: '#eff6ff', 
          border: '1px solid #3b82f6', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          ℹ️ This is an example form modal. The size is "{actionModal.size}".
        </div>
      </ActionModal>
    </div>
  );
}

const buttonStyle = (color) => ({
  padding: '12px 24px',
  background: `linear-gradient(135deg, ${color}, ${color}dd)`,
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: `0 2px 8px ${color}40`
});
