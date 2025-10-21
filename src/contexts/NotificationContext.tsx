import type React from 'react';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import type { Notification, NotificationAction } from '../types';
import { useSound } from './SoundContext';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    title: string,
    message: string,
    type?: Notification['type'],
    options?: {
      appIcon?: string;
      actions?: NotificationAction[];
      duration?: number;
    }
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { playSound } = useSound();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: Notification['type'] = 'info',
      options?: {
        appIcon?: string;
        actions?: NotificationAction[];
        duration?: number;
      }
    ) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        message,
        type,
        timestamp: new Date(),
        appIcon: options?.appIcon,
        actions: options?.actions,
        duration: options?.duration ?? 5000,
      };

      setNotifications((prev) => [...prev, notification]);

      // Play sound based on notification type
      switch (type) {
        case 'success':
          playSound('success');
          break;
        case 'error':
          playSound('error');
          break;
        default:
          playSound('notification');
          break;
      }

      // Auto-remove after duration
      const duration = notification.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, duration);
      }
    },
    [playSound]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
