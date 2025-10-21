import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { App, AppWindow } from '../types';
import { useSound } from './SoundContext';

interface OSContextType {
  windows: AppWindow[];
  apps: App[];
  activeApp: string | null;
  openApp: (appId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
  setApps: (apps: App[]) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { playSound } = useSound();
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);

  const openApp = useCallback(
    (appId: string) => {
      const app = apps.find((a) => a.id === appId);
      if (!app) return;

      // Check if app already has a window open
      const existingWindow = windows.find((w) => w.appId === appId && !w.isMinimized);
      if (existingWindow) {
        focusWindow(existingWindow.id);
        return;
      }

      // Check if window is minimized
      const minimizedWindow = windows.find((w) => w.appId === appId && w.isMinimized);
      if (minimizedWindow) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === minimizedWindow.id
              ? { ...w, isMinimized: false, isFocused: true, zIndex: nextZIndex }
              : { ...w, isFocused: false }
          )
        );
        setNextZIndex((prev) => prev + 1);
        setActiveApp(appId);
        return;
      }

      const newWindow: AppWindow = {
        id: `${appId}-${Date.now()}`,
        appId,
        title: app.name,
        isMinimized: false,
        isMaximized: false,
        isFocused: true,
        position: { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
        size: { width: 800, height: 600 },
        zIndex: nextZIndex,
      };

      setWindows((prev) => [...prev.map((w) => ({ ...w, isFocused: false })), newWindow]);
      setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, isRunning: true } : a)));
      setActiveApp(appId);
      setNextZIndex((prev) => prev + 1);
      playSound('open');
    },
    [apps, windows, nextZIndex, playSound]
  );

  const closeWindow = useCallback(
    (windowId: string) => {
      const window = windows.find((w) => w.id === windowId);
      setWindows((prev) => prev.filter((w) => w.id !== windowId));

      if (window) {
        const hasOtherWindows = windows.some((w) => w.appId === window.appId && w.id !== windowId);
        if (!hasOtherWindows) {
          setApps((prev) => prev.map((a) => (a.id === window.appId ? { ...a, isRunning: false } : a)));
        }
      }
      playSound('close');
    },
    [windows, playSound]
  );

  const minimizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true, isFocused: false } : w)));
      playSound('minimize');
    },
    [playSound]
  );

  const maximizeWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w)));
      playSound('click');
    },
    [playSound]
  );

  const focusWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === windowId ? { ...w, isFocused: true, zIndex: nextZIndex } : { ...w, isFocused: false }
        )
      );
      const window = windows.find((w) => w.id === windowId);
      if (window) {
        setActiveApp(window.appId);
      }
      setNextZIndex((prev) => prev + 1);
    },
    [windows, nextZIndex]
  );

  const updateWindowPosition = useCallback((windowId: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, position } : w)));
  }, []);

  const updateWindowSize = useCallback((windowId: string, size: { width: number; height: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, size } : w)));
  }, []);

  const contextValue = useMemo(
    () => ({
      windows,
      apps,
      activeApp,
      openApp,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      setApps,
    }),
    [
      windows,
      apps,
      activeApp,
      openApp,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      setApps,
    ]
  );

  return <OSContext.Provider value={contextValue}>{children}</OSContext.Provider>;
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within OSProvider');
  }
  return context;
};
