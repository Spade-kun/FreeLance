import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast Notification Component
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info', 'warning'
 * @param {number} duration - How long to show the toast in milliseconds (default: 4000)
 * @param {function} onClose - Callback when toast is closed
 */
export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
