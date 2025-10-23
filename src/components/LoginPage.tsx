import { AlertCircle, ArrowLeft, Moon, RotateCw, Power, Globe, Accessibility } from 'lucide-react';
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      { appIcon: '🌙', duration: 2000 }
    );
    
    // Dim the screen and fade out
    setTimeout(() => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 999999;
        animation: fadeIn 1s ease-in-out;
      `;
      document.body.appendChild(overlay);
      
      // After fade out, close the tab or show wake message
      setTimeout(() => {
        // Try to close the window (works if opened by script)
        window.close();
        
        // If window.close() doesn't work (most modern browsers), show wake screen
        if (!window.closed) {
          const iconContainer = document.createElement('div');
          iconContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          `;
          
          overlay.innerHTML = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              color: rgba(255,255,255,0.8);
              font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
              text-align: center;
              padding: 20px;
            ">
              <div id="sleep-icon" style="margin-bottom: 30px; opacity: 0.7;"></div>
              <div style="font-size: 24px; font-weight: 300; margin-bottom: 10px;">Mac is asleep</div>
              <div style="font-size: 16px; opacity: 0.7; margin-bottom: 30px;">Click or press any key to wake</div>
            </div>
          `;
          
          overlay.querySelector('#sleep-icon')?.appendChild(iconContainer.firstElementChild!);
          
          const wake = () => {
            overlay.style.animation = 'fadeOut 0.5s ease-in-out';
            setTimeout(() => {
              document.body.removeChild(overlay);
            }, 500);
          };
          
          overlay.addEventListener('click', wake);
          document.addEventListener('keydown', wake, { once: true });
        }
      }, 1000);
    }, 1500);
  };

  const handleRestart = () => {
    addNotification(
      'Restart',
      'Your Mac is restarting...',
      'warning',
      { appIcon: '↻', duration: 2000 }
    );
    
    setTimeout(() => {
      // Show restart screen
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.5s ease-in-out;
      `;
      
      const iconContainer = document.createElement('div');
      iconContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
        </svg>
      `;
      
      overlay.innerHTML = `
        <div style="
          color: rgba(255,255,255,0.9);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
          text-align: center;
        ">
          <div id="restart-icon" style="margin-bottom: 20px; display: flex; justify-content: center; animation: spin 1.5s linear infinite;"></div>
          <div style="font-size: 20px; font-weight: 300;">Restarting...</div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      overlay.querySelector('#restart-icon')?.appendChild(iconContainer.firstElementChild!);
      
      // Add spin animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      
      // Reload the page after animation
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }, 1500);
  };

  const handleShutDown = () => {
    addNotification(
      'Shut Down',
      'Your Mac is shutting down...',
      'error',
      { appIcon: '⏼', duration: 2000 }
    );
    
    setTimeout(() => {
      // Show shutdown screen
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.8s ease-in-out;
      `;
      
      const iconContainer = document.createElement('div');
      iconContainer.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
      `;
      
      overlay.innerHTML = `
        <div style="
          color: rgba(255,255,255,0.9);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
          text-align: center;
        ">
          <div id="shutdown-icon" style="margin-bottom: 20px; display: flex; justify-content: center; opacity: 0.8;"></div>
          <div style="font-size: 20px; font-weight: 300;">Shutting down...</div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      overlay.querySelector('#shutdown-icon')?.appendChild(iconContainer.firstElementChild!);
      
      // After shutdown animation, try to close tab or show blank screen
      setTimeout(() => {
        // Try to close the window
        window.close();
        
        // If window.close() doesn't work, show blank screen
        if (!window.closed) {
          overlay.innerHTML = '';
          overlay.style.background = '#000';
          
          // Optional: Add a subtle message with icon
          setTimeout(() => {
            const msgContainer = document.createElement('div');
            msgContainer.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3; margin-bottom: 10px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            `;
            
            overlay.innerHTML = `
              <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                color: rgba(255,255,255,0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
                text-align: center;
              ">
                <div id="info-icon" style="margin-bottom: 10px;"></div>
                <div style="font-size: 14px; font-weight: 300;">
                  System shut down. You can close this tab.
                </div>
              </div>
            `;
            
            overlay.querySelector('#info-icon')?.appendChild(msgContainer.firstElementChild!);
          }, 1000);
        }
      }, 2000);
    }, 1500);
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
                  onKeyDown={handleKeyDown}
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
            <Accessibility size={20} strokeWidth={1.5} />
          </button>
          <button className="footer-icon" title="Language">
            <Globe size={20} strokeWidth={1.5} />
          </button>
          <button className="footer-icon" title="Power">
            <Power size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
