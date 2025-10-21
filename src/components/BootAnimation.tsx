import { Apple } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface BootAnimationProps {
  onComplete: () => void;
}

export const BootAnimation: React.FC<BootAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'logo' | 'progress' | 'fadeout'>('logo');
  const [progress, setProgress] = useState(0);
  const [showPowerChime, setShowPowerChime] = useState(true);

  useEffect(() => {
    // Check if this is first boot
    const hasBooted = sessionStorage.getItem('hasBooted');

    if (hasBooted) {
      // Skip animation if already booted this session
      onComplete();
      return;
    }

    // Power chime effect (brief flash)
    const chimeTimer = setTimeout(() => {
      setShowPowerChime(false);
    }, 300);

    // Stage 1: Show Apple logo (2s)
    const logoTimer = setTimeout(() => {
      setStage('progress');
    }, 2000);

    // Stage 2: Progress bar animation (3s)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Simulate realistic boot progress
        // Fast start (0-40%): 10% increments
        // Medium (40-80%): 5% increments
        // Slow end (80-100%): 2% increments
        const increment = prev < 40 ? 10 : prev < 80 ? 5 : 2;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    // Stage 3: Fade out and complete (5.5s total)
    const fadeoutTimer = setTimeout(() => {
      setStage('fadeout');
    }, 5000);

    const completeTimer = setTimeout(() => {
      sessionStorage.setItem('hasBooted', 'true');
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(chimeTimer);
      clearTimeout(logoTimer);
      clearTimeout(fadeoutTimer);
      clearTimeout(completeTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className={`boot-screen ${stage === 'fadeout' ? 'fade-out' : ''} ${showPowerChime ? 'power-chime' : ''}`}>
      <div className="boot-content">
        {/* Apple Logo */}
        <div className={`boot-logo ${stage !== 'logo' ? 'logo-shrink' : ''}`}>
          <Apple size={120} strokeWidth={1.5} />
        </div>

        {/* Progress Bar */}
        {stage !== 'logo' && (
          <div className="boot-progress-container">
            <div className="boot-progress-track">
              <div className="boot-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Startup text - appears when progress is significant */}
        {stage === 'progress' && progress > 60 && <div className="boot-text">macOS</div>}
      </div>

      {/* Subtle version text at bottom */}
      {stage === 'progress' && progress > 80 && <div className="boot-version">Version 14.0</div>}
    </div>
  );
};
