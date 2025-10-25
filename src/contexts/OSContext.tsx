import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { App, AppWindow } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
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
  
  // Persist window positions and sizes to localStorage
  const [persistedWindowStates, setPersistedWindowStates] = useLocalStorage<
    Record<string, { position: { x: number; y: number }; size: { width: number; height: number } }>
  >('macos-window-states', {});

  // Persist running apps to localStorage
  const [persistedRunningApps, setPersistedRunningApps] = useLocalStorage<string[]>('macos-running-apps', []);

  // Restore window states when opening apps
  useEffect(() => {
    // Restore running apps on mount
    if (persistedRunningApps.length > 0 && apps.length > 0) {
      persistedRunningApps.forEach((appId) => {
        const app = apps.find((a) => a.id === appId);
        if (app && !windows.some((w) => w.appId === appId)) {
          // Restore the app (but don't auto-open, just mark as running)
          setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, isRunning: true } : a)));
        }
      });
    }
  }, [apps.length]); // Only run when apps are loaded

  // Persist running apps whenever they change
  useEffect(() => {
    const runningAppIds = apps.filter((app) => app.isRunning).map((app) => app.id);
    
    // Only update if the list actually changed to prevent infinite loops
    // Also allow empty arrays to clear localStorage when all apps are closed
    const hasChanged =
      runningAppIds.length !== persistedRunningApps.length ||
      runningAppIds.some((id, index) => id !== persistedRunningApps[index]);
    
    if (hasChanged) {
      setPersistedRunningApps(runningAppIds);
    }
  }, [apps, persistedRunningApps, setPersistedRunningApps]);

  // Persist window states when they change (debounced through state updates)
  useEffect(() => {
    const windowStates = windows.reduce((acc, window) => {
      acc[window.appId] = {
        position: window.position,
        size: window.size,
      };
      return acc;
    }, {} as Record<string, { position: { x: number; y: number }; size: { width: number; height: number } }>);
    
    // Only update if the states actually changed to prevent infinite loops
    const stateKeys = Object.keys(windowStates).sort();
    const persistedKeys = Object.keys(persistedWindowStates).sort();
    
    const hasChanged =
      stateKeys.length !== persistedKeys.length ||
      stateKeys.some((key, index) => key !== persistedKeys[index]) ||
      stateKeys.some((key) => {
        const current = windowStates[key];
        const persisted = persistedWindowStates[key];
        return (
          !persisted ||
          current.position.x !== persisted.position.x ||
          current.position.y !== persisted.position.y ||
          current.size.width !== persisted.size.width ||
          current.size.height !== persisted.size.height
        );
      });
    
    if (hasChanged) {
      setPersistedWindowStates(windowStates);
    }
  }, [windows, persistedWindowStates, setPersistedWindowStates]);

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

      // Use persisted state if available, otherwise use defaults
      const persistedState = persistedWindowStates[appId];
      const defaultPosition = { x: 100 + windows.length * 30, y: 100 + windows.length * 30 };
      const defaultSize = { width: 800, height: 600 };

      const newWindow: AppWindow = {
        id: `${appId}-${Date.now()}`,
        appId,
        title: app.name,
        isMinimized: false,
        isMaximized: false,
        isFocused: true,
        position: persistedState?.position || defaultPosition,
        size: persistedState?.size || defaultSize,
        zIndex: nextZIndex,
      };

      setWindows((prev) => [...prev.map((w) => ({ ...w, isFocused: false })), newWindow]);
      setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, isRunning: true } : a)));
      setActiveApp(appId);
      setNextZIndex((prev) => prev + 1);
      playSound('open');
    },
    [apps, windows, nextZIndex, playSound, persistedWindowStates]
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
      setWindows((prev) => {
        const window = prev.find((w) => w.id === windowId);
        if (window) {
          setActiveApp(window.appId);
        }
        return prev.map((w) =>
          w.id === windowId ? { ...w, isFocused: true, zIndex: nextZIndex } : { ...w, isFocused: false }
        );
      });
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex]
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
