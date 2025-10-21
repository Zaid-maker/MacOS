import { useEffect } from 'react';
import { useOS } from '../contexts/OSContext';

interface UseKeyboardShortcutsProps {
  onSpotlight: () => void;
  onMissionControl?: () => void;
}

export const useKeyboardShortcuts = ({ onSpotlight, onMissionControl }: UseKeyboardShortcutsProps) => {
  const { windows, closeWindow, minimizeWindow, focusWindow } = useOS();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Space - Spotlight
      if (cmdKey && e.code === 'Space') {
        e.preventDefault();
        onSpotlight();
        return;
      }

      // Ctrl/Cmd + Up Arrow OR F3 - Mission Control
      if ((cmdKey && e.key === 'ArrowUp') || e.key === 'F3') {
        e.preventDefault();
        if (onMissionControl) {
          onMissionControl();
        }
        return;
      }

      // Escape - Close Mission Control (handled in MissionControl component)

      // Cmd/Ctrl + Q - Quit app (close focused window)
      if (cmdKey && e.key === 'q') {
        e.preventDefault();
        const focusedWindow = windows.find((w) => w.isFocused);
        if (focusedWindow) {
          closeWindow(focusedWindow.id);
        }
        return;
      }

      // Cmd/Ctrl + W - Close window
      if (cmdKey && e.key === 'w') {
        e.preventDefault();
        const focusedWindow = windows.find((w) => w.isFocused);
        if (focusedWindow) {
          closeWindow(focusedWindow.id);
        }
        return;
      }

      // Cmd/Ctrl + M - Minimize window
      if (cmdKey && e.key === 'm') {
        e.preventDefault();
        const focusedWindow = windows.find((w) => w.isFocused);
        if (focusedWindow) {
          minimizeWindow(focusedWindow.id);
        }
        return;
      }

      // Cmd/Ctrl + H - Hide window (minimize)
      if (cmdKey && e.key === 'h') {
        e.preventDefault();
        const focusedWindow = windows.find((w) => w.isFocused);
        if (focusedWindow) {
          minimizeWindow(focusedWindow.id);
        }
        return;
      }

      // Cmd/Ctrl + Tab - Switch between windows
      if (cmdKey && e.key === 'Tab') {
        e.preventDefault();
        if (windows.length > 0) {
          const currentIndex = windows.findIndex((w) => w.isFocused);
          const nextIndex = (currentIndex + 1) % windows.length;
          const nextWindow = windows[nextIndex];
          if (nextWindow && !nextWindow.isMinimized) {
            focusWindow(nextWindow.id);
          }
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [windows, closeWindow, minimizeWindow, focusWindow, onSpotlight, onMissionControl]);
};
