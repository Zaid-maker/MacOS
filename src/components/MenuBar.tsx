import React, { useState, useEffect } from 'react';
import { Apple, Wifi, Battery, Volume2, VolumeX, Search, LogOut, Moon, Sun, Grid3x3 } from 'lucide-react';
import { useOS } from '../contexts/OSContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSound } from '../contexts/SoundContext';
import { useSpaces } from '../contexts/SpacesContext';

interface MenuBarProps {
  onSpotlightOpen: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = React.memo(({ onSpotlightOpen }) => {
  const { activeApp, apps } = useOS();
  const { logout, currentUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isMuted, toggleMute } = useSound();
  const { toggleMissionControl } = useSpaces();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAppleMenu, setShowAppleMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowAppleMenu(false);
    if (showAppleMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAppleMenu]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const activeAppData = apps.find(app => app.id === activeApp);

  return (
    <div className="menu-bar">
      <div className="menu-bar-left">
        <div 
          className="menu-item apple-menu"
          onClick={(e) => {
            e.stopPropagation();
            setShowAppleMenu(!showAppleMenu);
          }}
        >
          <Apple size={18} />
          {showAppleMenu && (
            <div className="apple-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-item">
                <span>About This Mac</span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item">
                <span>System Preferences...</span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item" onClick={(e) => {
                e.stopPropagation();
                logout();
              }}>
                <LogOut size={14} />
                <span>Log Out {currentUser?.name}...</span>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item">
                <span>Sleep</span>
              </div>
              <div className="dropdown-item">
                <span>Restart...</span>
              </div>
              <div className="dropdown-item">
                <span>Shut Down...</span>
              </div>
            </div>
          )}
        </div>
        <div className="menu-item menu-app-name">
          {activeAppData?.name || 'Finder'}
        </div>
        <div className="menu-item">File</div>
        <div className="menu-item">Edit</div>
        <div className="menu-item">View</div>
        <div className="menu-item">Go</div>
        <div className="menu-item">Window</div>
        <div className="menu-item">Help</div>
      </div>
      <div className="menu-bar-right">
        <div className="menu-item">
          <Battery size={16} />
        </div>
        <div className="menu-item">
          <Wifi size={16} />
        </div>
        <div className="menu-item" onClick={toggleMissionControl} title="Mission Control (⌃↑ or F3)">
          <Grid3x3 size={16} />
        </div>
        <div className="menu-item" onClick={onSpotlightOpen} title="Spotlight Search (⌘Space)">
          <Search size={16} />
        </div>
        <div className="menu-item" onClick={toggleDarkMode} title="Toggle Dark Mode">
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </div>
        <div className="menu-item" onClick={toggleMute} title="Toggle Sound">
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </div>
        <div className="menu-item time">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
});
