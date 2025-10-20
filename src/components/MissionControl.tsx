import React, { useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useSpaces } from '../contexts/SpacesContext';
import { useOS } from '../contexts/OSContext';

export const MissionControl: React.FC = () => {
  const { spaces, currentSpaceId, switchToSpace, addSpace, removeSpace, isMissionControlOpen, toggleMissionControl } = useSpaces();
  const { windows } = useOS();

  // Handle Escape key to close Mission Control
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMissionControlOpen) {
        toggleMissionControl();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMissionControlOpen, toggleMissionControl]);

  if (!isMissionControlOpen) return null;

  const handleSpaceClick = (spaceId: string) => {
    switchToSpace(spaceId);
  };

  const handleRemoveSpace = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    if (spaces.length > 1) {
      removeSpace(spaceId);
    }
  };

  const handleAddSpace = () => {
    addSpace();
  };

  // Get windows for a specific space
  const getSpaceWindows = (spaceId: string) => {
    return windows.filter((w) => {
      const space = spaces.find((s) => s.id === spaceId);
      return space?.windows.includes(w.id);
    });
  };

  return (
    <div className="mission-control-overlay" onClick={toggleMissionControl}>
      <div className="mission-control-content" onClick={(e) => e.stopPropagation()}>
        <div className="mission-control-header">
          <h2>Mission Control</h2>
          <button className="mission-control-close" onClick={toggleMissionControl}>
            <X size={20} />
          </button>
        </div>

        <div className="spaces-grid">
          {spaces.map((space) => {
            const spaceWindows = getSpaceWindows(space.id);
            const isCurrentSpace = space.id === currentSpaceId;

            return (
              <div
                key={space.id}
                className={`space-thumbnail ${isCurrentSpace ? 'current-space' : ''}`}
                onClick={() => handleSpaceClick(space.id)}
              >
                {spaces.length > 1 && (
                  <button
                    className="remove-space-btn"
                    onClick={(e) => handleRemoveSpace(e, space.id)}
                    title="Remove Desktop"
                  >
                    <X size={14} />
                  </button>
                )}

                <div className="space-preview">
                  {spaceWindows.length === 0 ? (
                    <div className="empty-space">No windows</div>
                  ) : (
                    <div className="space-windows">
                      {spaceWindows.slice(0, 6).map((window) => (
                        <div key={window.id} className="space-window-preview">
                          <div className="space-window-title">{window.title}</div>
                        </div>
                      ))}
                      {spaceWindows.length > 6 && (
                        <div className="space-window-more">+{spaceWindows.length - 6}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-name">{space.name}</div>
              </div>
            );
          })}

          {/* Add Space Button */}
          <div className="space-thumbnail add-space-thumbnail" onClick={handleAddSpace}>
            <div className="add-space-content">
              <Plus size={40} />
              <div className="space-name">Add Desktop</div>
            </div>
          </div>
        </div>

        <div className="mission-control-footer">
          <p>Click a desktop to switch • Press Esc to exit</p>
        </div>
      </div>
    </div>
  );
};
