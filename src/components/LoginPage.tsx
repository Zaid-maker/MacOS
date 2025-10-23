import { AlertCircle, ArrowLeft } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import type { User } from '../types';

export const LoginPage: React.FC = () => {
  const { login, users } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setPassword('');
    setError('');
  };

  const handleBack = () => {
    setSelectedUser(null);
    setPassword('');
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const success = login(selectedUser.id, password);
    if (!success) {
      setError('Incorrect password');
      setIsShaking(true);
      setPassword('');
      setTimeout(() => setIsShaking(false), 500);
    } else {
      // Show welcome notification after successful login
      setTimeout(() => {
        const hour = new Date().getHours();
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
        if (hour >= 17) greeting = 'Good evening';

        addNotification(
          `${greeting}, ${selectedUser.name}!`,
          'Welcome back to macOS. Your desktop is ready.',
          'success',
          { appIcon: '👋', duration: 6000 }
        );
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e as any);
    }
  };

  const handleCancel = () => {
    handleBack();
  };

  const handleSleep = () => {
    addNotification(
      'Sleep',
      'Your Mac is going to sleep...',
      'info',
      { appIcon: '💤', duration: 3000 }
    );
    setTimeout(() => {
      // In a real app, this would trigger sleep mode
      console.log('Sleep mode activated');
    }, 1000);
  };

  const handleRestart = () => {
    addNotification(
      'Restart',
      'Your Mac is restarting...',
      'warning',
      { appIcon: '🔄', duration: 3000 }
    );
    setTimeout(() => {
      // In a real app, this would trigger restart
      window.location.reload();
    }, 2000);
  };

  const handleShutDown = () => {
    addNotification(
      'Shut Down',
      'Your Mac is shutting down...',
      'error',
      { appIcon: '⏻', duration: 3000 }
    );
    setTimeout(() => {
      // In a real app, this would trigger shutdown
      document.body.style.background = '#000';
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;font-size:24px;">Shutting down...</div>';
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="login-wallpaper" />

      <div className="login-header">
        <div className="login-time">{formatTime(currentTime)}</div>
        <div className="login-date">{formatDate(currentTime)}</div>
      </div>

      <div className="login-content">
        {!selectedUser ? (
          <div className="user-selection">
            <h2 className="login-title">Select a user to log in</h2>
            <div className="user-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card" onClick={() => handleUserSelect(user)}>
                  <div className="user-avatar">{user.avatar}</div>
                  <div className="user-name">{user.name}</div>
                </div>
              ))}
            </div>
            <div className="login-hint">Hint: Default password is "password" (or empty for Guest)</div>
          </div>
        ) : (
          <div className={`login-form-container ${isShaking ? 'shake' : ''}`}>
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>

            <div className="selected-user">
              <div className="selected-user-avatar">{selectedUser.avatar}</div>
              <div className="selected-user-name">{selectedUser.name}</div>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="password-input-container">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedUser.password === '' ? 'Press Enter' : 'Enter password'}
                  className="password-input"
                  autoFocus
                />
                {error && (
                  <div className="login-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <button type="submit" className="login-button">
                <span className="login-arrow">→</span>
              </button>
            </form>

            <div className="login-options">
              <button className="login-option" onClick={handleCancel}>Cancel</button>
              <button className="login-option" onClick={handleSleep}>Sleep</button>
              <button className="login-option" onClick={handleRestart}>Restart</button>
              <button className="login-option" onClick={handleShutDown}>Shut Down</button>
            </div>
          </div>
        )}
      </div>

      <div className="login-footer">
        <div className="login-footer-icons">
          <button className="footer-icon" title="Accessibility">
            ♿
          </button>
          <button className="footer-icon" title="Language">
            🌐
          </button>
          <button className="footer-icon" title="Power">
            ⏻
          </button>
        </div>
      </div>
    </div>
  );
};
