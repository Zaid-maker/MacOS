import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import type { Notification } from '../types';

export const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  notification: Notification;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className={`notification-toast notification-${notification.type} ${isExiting ? 'exiting' : ''}`}>
      <div className="notification-header">
        <div className="notification-icon-wrapper">
          {notification.appIcon ? (
            <span className="notification-app-icon">{notification.appIcon}</span>
          ) : (
            <div className={`notification-type-icon icon-${notification.type}`}>{getIcon()}</div>
          )}
        </div>
        <div className="notification-title-section">
          <h4 className="notification-title">{notification.title}</h4>
          <span className="notification-time">{formatTime(notification.timestamp)}</span>
        </div>
        <button className="notification-close" onClick={handleClose}>
          <X size={16} />
        </button>
      </div>
      <p className="notification-message">{notification.message}</p>
      {notification.actions && notification.actions.length > 0 && (
        <div className="notification-actions">
          {notification.actions.map((action, index) => (
            <button
              key={index}
              className="notification-action-btn"
              onClick={() => {
                action.onClick();
                handleClose();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      {(notification.duration ?? 0) > 0 && (
        <div className="notification-progress">
          <div className="notification-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};
