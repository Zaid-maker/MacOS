export interface AppWindow {
  id: string;
  appId: string;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  color: string;
  isRunning?: boolean;
  component?: React.ComponentType<any>;
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  appId: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  password: string;
}

export interface Wallpaper {
  id: string;
  name: string;
  thumbnail: string;
  gradient: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  appIcon?: string;
  timestamp: Date;
  actions?: NotificationAction[];
  duration?: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}
