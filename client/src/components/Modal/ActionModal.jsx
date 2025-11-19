import React from 'react';
import './ActionModal.css';

/**
 * ActionModal - A versatile modal for forms, actions, and custom content
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to close modal
 * @param {string} title - Modal title
 * @param {node} children - Custom content (forms, text, etc.)
 * @param {array} actions - Array of action buttons { label, onClick, variant, icon }
 * @param {string} size - Modal size: 'small', 'medium', 'large', 'xlarge'
 * @param {boolean} showCloseButton - Show close button in header
 * @param {string} icon - Icon to show in header (emoji or icon)
 */
const ActionModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions = [],
  size = 'medium',
  showCloseButton = true,
  icon = null
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getButtonClass = (variant) => {
    switch (variant) {
      case 'primary':
        return 'action-modal-btn-primary';
      case 'danger':
        return 'action-modal-btn-danger';
      case 'success':
        return 'action-modal-btn-success';
      case 'secondary':
        return 'action-modal-btn-secondary';
      default:
        return 'action-modal-btn-default';
    }
  };

  return (
    <div className="action-modal-overlay" onClick={handleOverlayClick}>
      <div className={`action-modal-container action-modal-${size}`}>
        {/* Header */}
        <div className="action-modal-header">
          <div className="action-modal-header-content">
            {icon && <span className="action-modal-header-icon">{icon}</span>}
            <h2 className="action-modal-title">{title}</h2>
          </div>
          {showCloseButton && (
            <button 
              className="action-modal-close-btn" 
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="action-modal-body">
          {children}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="action-modal-footer">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`action-modal-btn ${getButtonClass(action.variant)}`}
                disabled={action.disabled}
                type={action.type || 'button'}
              >
                {action.icon && <span className="action-modal-btn-icon">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionModal;
