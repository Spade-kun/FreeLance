import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 * Usage:
 * const { showToast, ToastContainer } = useToast();
 * showToast('Message here', 'success');
 */
export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = () => {
    if (toasts.length === 0) return null;

    return (
      <div className="toast-container">
        {toasts.map(toast => {
          const Toast = require('../components/Toast/Toast').default;
          return (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          );
        })}
      </div>
    );
  };

  return { showToast, ToastContainer, removeToast };
}
