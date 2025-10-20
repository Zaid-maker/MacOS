import React, { useState, useEffect } from 'react';
import { Command } from 'lucide-react';

export const KeyboardShortcutsOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts overlay with Cmd+/
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
      // Hide with Escape
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { keys: `${cmdKey} Space`, description: 'Open Spotlight Search' },
    { keys: `${cmdKey} ↑ or F3`, description: 'Open Mission Control' },
    { keys: `${cmdKey} Q`, description: 'Quit/Close focused window' },
    { keys: `${cmdKey} W`, description: 'Close window' },
    { keys: `${cmdKey} M`, description: 'Minimize window' },
    { keys: `${cmdKey} H`, description: 'Hide window' },
    { keys: `${cmdKey} Tab`, description: 'Switch between windows' },
    { keys: `${cmdKey} /`, description: 'Toggle this shortcuts panel' },
    { keys: 'Esc', description: 'Close dialogs/menus' },
  ];

  return (
    <div className="shortcuts-overlay" onClick={() => setIsVisible(false)}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <Command size={24} />
          <h2>Keyboard Shortcuts</h2>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <kbd className="shortcut-keys">{shortcut.keys}</kbd>
              <span className="shortcut-description">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          Press <kbd>Esc</kbd> or click outside to close
        </div>
      </div>
    </div>
  );
};
