import {
  Bluetooth,
  Cast,
  Focus,
  Monitor,
  Moon,
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useSound } from '../contexts/SoundContext';
import { useTheme } from '../contexts/ThemeContext';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isMuted, toggleMute } = useSound();
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(50);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airdropEnabled, setAirdropEnabled] = useState(false);
  const [focusMode, setFocusMode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const focusModes = [
    { id: 'dnd', name: 'Do Not Disturb', icon: Moon },
    { id: 'work', name: 'Work', icon: Monitor },
    { id: 'personal', name: 'Personal Time', icon: Focus },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="control-center-backdrop" onClick={onClose} />

      {/* Control Center Panel */}
      <div className="control-center">
        <div className="control-center-content">
          {/* Main Controls Grid */}
          <div className="control-grid">
            {/* WiFi */}
            <button
              className={`control-card ${wifiEnabled ? 'active' : ''}`}
              onClick={() => setWifiEnabled(!wifiEnabled)}
            >
              <div className="control-card-icon">
                <Wifi size={20} />
              </div>
              <div className="control-card-label">
                <div className="control-card-title">Wi-Fi</div>
                <div className="control-card-subtitle">{wifiEnabled ? 'Home Network' : 'Off'}</div>
              </div>
            </button>

            {/* Bluetooth */}
            <button
              className={`control-card ${bluetoothEnabled ? 'active' : ''}`}
              onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
            >
              <div className="control-card-icon">
                <Bluetooth size={20} />
              </div>
              <div className="control-card-label">
                <div className="control-card-title">Bluetooth</div>
                <div className="control-card-subtitle">{bluetoothEnabled ? 'On' : 'Off'}</div>
              </div>
            </button>

            {/* AirDrop */}
            <button
              className={`control-card ${airdropEnabled ? 'active' : ''}`}
              onClick={() => setAirdropEnabled(!airdropEnabled)}
            >
              <div className="control-card-icon">
                <Cast size={20} />
              </div>
              <div className="control-card-label">
                <div className="control-card-title">AirDrop</div>
                <div className="control-card-subtitle">{airdropEnabled ? 'Everyone' : 'Off'}</div>
              </div>
            </button>

            {/* Dark Mode */}
            <button className={`control-card ${isDarkMode ? 'active' : ''}`} onClick={toggleDarkMode}>
              <div className="control-card-icon">{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}</div>
              <div className="control-card-label">
                <div className="control-card-title">Appearance</div>
                <div className="control-card-subtitle">{isDarkMode ? 'Dark' : 'Light'}</div>
              </div>
            </button>
          </div>

          {/* Brightness Slider */}
          <div className="control-slider-card">
            <div className="control-slider-header">
              <Sun size={16} />
              <span>Display</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="control-slider"
            />
            <div className="control-slider-value">{brightness}%</div>
          </div>

          {/* Volume Slider */}
          <div className="control-slider-card">
            <div className="control-slider-header">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>Sound</span>
              <button className="control-mute-button" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="control-slider"
              disabled={isMuted}
            />
            <div className="control-slider-value">{isMuted ? 0 : volume}%</div>
          </div>

          {/* Focus Modes */}
          <div className="focus-modes-section">
            <div className="focus-modes-header">Focus</div>
            <div className="focus-modes-grid">
              {focusModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    className={`focus-mode-card ${focusMode === mode.id ? 'active' : ''}`}
                    onClick={() => setFocusMode(focusMode === mode.id ? null : mode.id)}
                  >
                    <Icon size={18} />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Now Playing */}
          <div className="now-playing-card">
            <div className="now-playing-header">
              <Music size={16} />
              <span>Now Playing</span>
            </div>
            <div className="now-playing-info">
              <div className="now-playing-artwork">🎵</div>
              <div className="now-playing-details">
                <div className="now-playing-title">No Music Playing</div>
                <div className="now-playing-artist">Select a song to play</div>
              </div>
            </div>
            <div className="now-playing-controls">
              <button className="playback-button" disabled>
                <SkipBack size={16} />
              </button>
              <button className="playback-button play-button" onClick={() => setIsPlaying(!isPlaying)} disabled>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button className="playback-button" disabled>
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
