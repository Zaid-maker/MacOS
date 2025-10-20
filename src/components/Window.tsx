import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  const animationFrameRef = useRef<number | undefined>(undefined);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

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
    });
  }, [isDragging, isResizing, dragOffset, resizeStart, window.id, updateWindowPosition, updateWindowSize]);

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
      onClick={() => focusWindow(window.id)}
      onMouseEnter={() => setShowControlIcons(true)}
      onMouseLeave={() => setShowControlIcons(false)}
    >
      <div className="window-titlebar" onMouseDown={handleMouseDown}>
        <div className="window-controls">
          <button
            className="window-control close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
            title="Close"
          >
            {showControlIcons && <span className="control-icon">✕</span>}
          </button>
          <button
            className="window-control minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(window.id);
            }}
            title="Minimize"
          >
            {showControlIcons && <span className="control-icon">−</span>}
          </button>
          <button
            className="window-control maximize"
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(window.id);
            }}
            title="Maximize"
          >
            {showControlIcons && <span className="control-icon">⤢</span>}
          </button>
        </div>
        <div className="window-title">{window.title}</div>
      </div>
      <div className="window-content">{children}</div>
      {!window.isMaximized && (
        <div className="window-resize-handle" onMouseDown={handleResizeMouseDown} />
      )}
    </div>
  );
});
