import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'OK', cancelText = 'Cancel', type = 'warning' }) => {
  if (!isOpen) return null;

  const icons = {
    warning: '⚠',
    danger: '⚠',
    info: 'ℹ',
    question: '?'
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className={`confirm-modal-container confirm-modal-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          {icons[type] || icons.question}
        </div>
        <div className="confirm-modal-content">
          <h3 className="confirm-modal-title">{title}</h3>
          <p className="confirm-modal-message">{message}</p>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn confirm-modal-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm-modal-btn confirm-modal-confirm" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
