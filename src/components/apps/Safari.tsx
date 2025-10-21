import { ArrowLeft, ArrowRight, Home, Lock, RotateCw } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export const Safari: React.FC = () => {
  const [url, setUrl] = useState('https://www.apple.com');
  const [inputUrl, setInputUrl] = useState(url);

  const handleNavigate = () => {
    setUrl(inputUrl);
  };

  return (
    <div className="safari">
      <div className="safari-toolbar">
        <div className="safari-nav-buttons">
          <button className="safari-nav-btn">
            <ArrowLeft size={18} />
          </button>
          <button className="safari-nav-btn">
            <ArrowRight size={18} />
          </button>
          <button className="safari-nav-btn">
            <RotateCw size={18} />
          </button>
        </div>
        <div className="safari-url-bar">
          <Lock size={14} className="safari-lock" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
            className="safari-url-input"
          />
        </div>
        <button className="safari-home-btn">
          <Home size={18} />
        </button>
      </div>
      <div className="safari-content">
        <div className="safari-welcome">
          <h1>Welcome to Safari</h1>
          <p>Start browsing the web</p>
          <div className="safari-favorites">
            <div className="safari-favorite">
              <div className="safari-favorite-icon">🍎</div>
              <div>Apple</div>
            </div>
            <div className="safari-favorite">
              <div className="safari-favorite-icon">📰</div>
              <div>News</div>
            </div>
            <div className="safari-favorite">
              <div className="safari-favorite-icon">🎵</div>
              <div>Music</div>
            </div>
            <div className="safari-favorite">
              <div className="safari-favorite-icon">📺</div>
              <div>TV</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
