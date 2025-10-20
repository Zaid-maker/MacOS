import React from 'react';
import { User, Wifi, Bell, Monitor, Lock, Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useWallpaper } from '../../contexts/WallpaperContext';

export const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentWallpaper, setWallpaper, wallpapers } = useWallpaper();

  return (
    <div className="settings">
      <div className="settings-sidebar">
        <div className="settings-section">General</div>
        <div className="settings-item">
          <User size={18} />
          <span>Account</span>
        </div>
        <div className="settings-item">
          <Monitor size={18} />
          <span>Display</span>
        </div>
        <div className="settings-item">
          <Palette size={18} />
          <span>Appearance</span>
        </div>
        <div className="settings-section">Network</div>
        <div className="settings-item">
          <Wifi size={18} />
          <span>Wi-Fi</span>
        </div>
        <div className="settings-section">System</div>
        <div className="settings-item">
          <Bell size={18} />
          <span>Notifications</span>
        </div>
        <div className="settings-item">
          <Lock size={18} />
          <span>Security</span>
        </div>
      </div>
      <div className="settings-content">
        <h1>System Settings</h1>
        <div className="settings-panel">
          <h2>Display</h2>
          <div className="settings-option">
            <label>
              <strong>Resolution</strong>
              <select className="settings-select">
                <option>1920 × 1080</option>
                <option>2560 × 1440</option>
                <option>3840 × 2160</option>
              </select>
            </label>
          </div>
          <div className="settings-option">
            <label>
              <strong>Appearance</strong>
              <select className="settings-select" value={isDarkMode ? 'dark' : 'light'} onChange={(e) => {
                if ((e.target.value === 'dark') !== isDarkMode) {
                  toggleDarkMode();
                }
              }}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
          <div className="settings-option">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Show menu bar</span>
            </label>
          </div>
          <div className="settings-option">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Automatically hide and show the Dock</span>
            </label>
          </div>
        </div>

        <div className="settings-panel">
          <h2>Wallpaper</h2>
          <div className="wallpaper-grid">
            {wallpapers.map((wallpaper) => (
              <div
                key={wallpaper.id}
                className={`wallpaper-option ${currentWallpaper.id === wallpaper.id ? 'selected' : ''}`}
                onClick={() => setWallpaper(wallpaper)}
                style={{ background: wallpaper.gradient }}
              >
                <div className="wallpaper-thumbnail">{wallpaper.thumbnail}</div>
                <div className="wallpaper-name">{wallpaper.name}</div>
                {currentWallpaper.id === wallpaper.id && (
                  <div className="wallpaper-check">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
