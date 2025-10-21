import React, { useState } from 'react';
import { useContextMenu } from '../contexts/ContextMenuContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useOS } from '../contexts/OSContext';
import type { DesktopIcon } from '../types';

interface DesktopProps {
  icons: DesktopIcon[];
}

export const Desktop: React.FC<DesktopProps> = React.memo(({ icons }) => {
  const { openApp } = useOS();
  const { showContextMenu } = useContextMenu();
  const { addNotification } = useNotifications();
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    icons.reduce((acc, icon) => ({ ...acc, [icon.id]: icon.position }), {})
  );
  const [draggedIcon, setDraggedIcon] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleIconMouseDown = (e: React.MouseEvent, icon: DesktopIcon) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();

    const iconElement = e.currentTarget as HTMLElement;
    const rect = iconElement.getBoundingClientRect();

    setDraggedIcon(icon.id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedIcon) return;

    const desktopRect = document.querySelector('.desktop')?.getBoundingClientRect();
    if (!desktopRect) return;

    const newX = Math.max(0, Math.min(e.clientX - desktopRect.left - dragOffset.x, desktopRect.width - 80));
    const newY = Math.max(0, Math.min(e.clientY - desktopRect.top - dragOffset.y, desktopRect.height - 100));

    setIconPositions((prev) => ({
      ...prev,
      [draggedIcon]: { x: newX, y: newY },
    }));
  };

  const handleMouseUp = () => {
    if (draggedIcon) {
      addNotification('Desktop', 'Icon position saved!', 'success', { duration: 2000 });
      setDraggedIcon(null);
    }
  };

  React.useEffect(() => {
    if (draggedIcon) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedIcon, dragOffset]);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, [
      {
        label: 'New Folder',
        icon: '📁',
        onClick: () => {
          addNotification('New Folder', 'Folder creation coming soon!', 'info');
        },
      },
      {
        label: 'Change Wallpaper',
        icon: '🎨',
        onClick: () => {
          openApp('settings');
          addNotification('Settings', 'Open Settings > Wallpaper to change wallpaper', 'info');
        },
      },
      { divider: true },
      {
        label: 'Get Info',
        icon: 'ℹ️',
        onClick: () => {
          addNotification('Desktop Info', 'Desktop size: 1920x1080', 'info');
        },
      },
      {
        label: 'Refresh',
        icon: '🔄',
        onClick: () => {
          addNotification('Desktop', 'Desktop refreshed!', 'success');
        },
      },
    ]);
  };

  const handleIconContextMenu = (e: React.MouseEvent, icon: DesktopIcon) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, [
      {
        label: 'Open',
        icon: '📂',
        onClick: () => openApp(icon.appId),
      },
      { divider: true },
      {
        label: 'Get Info',
        icon: 'ℹ️',
        onClick: () => {
          addNotification(`${icon.name} Info`, `Name: ${icon.name}\nType: Folder`, 'info');
        },
      },
      {
        label: 'Rename',
        icon: '✏️',
        onClick: () => {
          addNotification('Rename', 'Rename feature coming soon!', 'info');
        },
      },
      { divider: true },
      {
        label: 'Move to Trash',
        icon: '🗑️',
        onClick: () => {
          addNotification('Moved to Trash', `${icon.name} moved to trash`, 'success');
        },
      },
    ]);
  };

  return (
    <div className="desktop" onContextMenu={handleDesktopContextMenu}>
      <div className="desktop-icons">
        {icons.map((icon) => {
          const position = iconPositions[icon.id] || icon.position;
          return (
            <div
              key={icon.id}
              className={`desktop-icon ${draggedIcon === icon.id ? 'dragging' : ''}`}
              style={{
                left: position.x,
                top: position.y,
                cursor: draggedIcon === icon.id ? 'grabbing' : 'pointer',
              }}
              onMouseDown={(e) => handleIconMouseDown(e, icon)}
              onDoubleClick={() => openApp(icon.appId)}
              onContextMenu={(e) => handleIconContextMenu(e, icon)}
            >
              <div className="desktop-icon-image">{icon.icon}</div>
              <div className="desktop-icon-label">{icon.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
