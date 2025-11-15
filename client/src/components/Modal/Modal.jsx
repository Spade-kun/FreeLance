import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, message, type = 'success', autoClose = true }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoClose]);

  if (!isOpen) return null;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container modal-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          {icons[type]}
        </div>
        <div className="modal-content">
          {title && <h3 className="modal-title">{title}</h3>}
          <p className="modal-message">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
