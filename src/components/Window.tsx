import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOS } from '../contexts/OSContext';
import type { AppWindow } from '../types';

interface WindowProps {
  window: AppWindow;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = React.memo(({ window, children }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize } = useOS();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showControlIcons, setShowControlIcons] = useState(false);
  const [hasControlFocus, setHasControlFocus] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame for smooth 60fps updates
      animationFrameRef.current = requestAnimationFrame(() => {
        if (isDragging) {
          const newX = e.clientX - dragOffset.x;
          const newY = Math.max(25, e.clientY - dragOffset.y);
          updateWindowPosition(window.id, { x: newX, y: newY });
        } else if (isResizing) {
          const deltaX = e.clientX - resizeStart.x;
          const deltaY = e.clientY - resizeStart.y;
          const newWidth = Math.max(400, resizeStart.width + deltaX);
          const newHeight = Math.max(300, resizeStart.height + deltaY);
          updateWindowSize(window.id, { width: newWidth, height: newHeight });
        }
      }) as number;
    },
    [isDragging, isResizing, dragOffset, resizeStart, window.id, updateWindowPosition, updateWindowSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;

    focusWindow(window.id);
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    });
  };

  const handleWindowClick = useCallback(() => {
    if (!window.isFocused) {
      focusWindow(window.id);
    }
  }, [window.isFocused, window.id, focusWindow]);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    closeWindow(window.id);
  }, [window.id, closeWindow]);

  const handleMinimizeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow(window.id);
  }, [window.id, minimizeWindow]);

  const handleMaximizeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    maximizeWindow(window.id);
  }, [window.id, maximizeWindow]);

  if (window.isMinimized) return null;

  const style: React.CSSProperties = window.isMaximized
    ? {
        left: 0,
        top: 25,
        width: '100%',
        height: 'calc(100vh - 25px - 80px)',
        zIndex: window.zIndex,
      }
    : {
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      };

  return (
    <div
      ref={windowRef}
      className={`window ${window.isFocused ? 'focused' : ''}`}
      style={style}
      onClick={handleWindowClick}
      onMouseEnter={() => setShowControlIcons(true)}
      onMouseLeave={() => setShowControlIcons(false)}
      onTouchStart={() => setShowControlIcons(true)}
    >
      <div className="window-titlebar" onMouseDown={handleMouseDown}>
        <div className="window-controls">
          <button
            className="window-control close"
            onClick={handleCloseClick}
            onFocus={() => setHasControlFocus(true)}
            onBlur={() => setHasControlFocus(false)}
            title="Close"
          >
            {(showControlIcons || hasControlFocus) && <span className="control-icon">✕</span>}
          </button>
          <button
            className="window-control minimize"
            onClick={handleMinimizeClick}
            onFocus={() => setHasControlFocus(true)}
            onBlur={() => setHasControlFocus(false)}
            title="Minimize"
          >
            {(showControlIcons || hasControlFocus) && <span className="control-icon">−</span>}
          </button>
          <button
            className="window-control maximize"
            onClick={handleMaximizeClick}
            onFocus={() => setHasControlFocus(true)}
            onBlur={() => setHasControlFocus(false)}
            title="Maximize"
          >
            {(showControlIcons || hasControlFocus) && <span className="control-icon">⤢</span>}
          </button>
        </div>
        <div className="window-title">{window.title}</div>
      </div>
      <div className="window-content">{children}</div>
      {!window.isMaximized && <div className="window-resize-handle" onMouseDown={handleResizeMouseDown} />}
    </div>
  );
});
