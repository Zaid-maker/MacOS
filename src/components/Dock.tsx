import React, { useRef, useState } from 'react';
import { useContextMenu } from '../contexts/ContextMenuContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useOS } from '../contexts/OSContext';
import type { App } from '../types';

interface DockProps {
  apps: App[];
}

export const Dock: React.FC<DockProps> = React.memo(({ apps }) => {
  const { openApp, closeWindow, windows } = useOS();
  const { showContextMenu } = useContextMenu();
  const { addNotification } = useNotifications();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const handleDockItemContextMenu = (e: React.MouseEvent, app: App) => {
    e.preventDefault();
    e.stopPropagation();

    const appWindows = windows.filter((w) => w.appId === app.id);

    showContextMenu(e.clientX, e.clientY, [
      {
        label: app.isRunning ? 'Show' : 'Open',
        icon: '📂',
        onClick: () => openApp(app.id),
      },
      ...(appWindows.length > 0
        ? [
            {
              label: 'Close All Windows',
              icon: '❌',
              onClick: () => {
                appWindows.forEach((w) => closeWindow(w.id));
                addNotification(app.name, 'All windows closed', 'success');
              },
            },
          ]
        : []),
      { divider: true },
      {
        label: 'Options',
        icon: '⚙️',
        onClick: () => {
          addNotification(app.name, 'App options coming soon!', 'info', { appIcon: app.icon });
        },
      },
      {
        label: app.isRunning ? 'Keep in Dock' : 'Remove from Dock',
        icon: '📌',
        disabled: true,
        onClick: () => {},
      },
    ]);
  };

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.6;
    if (distance === 1) return 1.3;
    if (distance === 2) return 1.1;
    return 1;
  };

  return (
    <div className="dock-container">
      <div className="dock" ref={dockRef}>
        {apps.map((app, index) => (
          <div
            key={app.id}
            className="dock-item-wrapper"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => openApp(app.id)}
            onContextMenu={(e) => handleDockItemContextMenu(e, app)}
            style={{
              transform: `scale(${getScale(index)}) translateY(${
                getScale(index) > 1 ? -(getScale(index) - 1) * 30 : 0
              }px)`,
            }}
          >
            <div className="dock-item" style={{ backgroundColor: app.color }}>
              <span className="dock-icon">{app.icon}</span>
            </div>
            {app.isRunning && <div className="running-indicator" />}
            <div className="dock-tooltip">{app.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
