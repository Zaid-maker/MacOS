import React, { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';

type SoundType = 'click' | 'open' | 'close' | 'minimize' | 'error' | 'success' | 'notification' | 'trash';

interface SoundContextType {
  playSound: (sound: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Web Audio API based sound generator
const createOscillatorSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Silently fail if audio context is not supported
  }
};

const createMultiToneSound = (frequencies: number[], durations: number[], types?: OscillatorType[]) => {
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      createOscillatorSound(freq, durations[index] || 0.1, types?.[index] || 'sine');
    }, index * 100);
  });
};

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const playSound = useCallback((sound: SoundType) => {
    if (isMuted) return;

    switch (sound) {
      case 'click':
        createOscillatorSound(800, 0.05, 'sine');
        break;
      case 'open':
        createMultiToneSound([400, 600, 800], [0.05, 0.05, 0.08]);
        break;
      case 'close':
        createMultiToneSound([800, 600, 400], [0.05, 0.05, 0.08]);
        break;
      case 'minimize':
        createMultiToneSound([600, 400], [0.08, 0.12]);
        break;
      case 'error':
        createMultiToneSound([300, 250, 200], [0.1, 0.1, 0.15], ['square', 'square', 'square']);
        break;
      case 'success':
        createMultiToneSound([523, 659, 784], [0.08, 0.08, 0.12]);
        break;
      case 'notification':
        createMultiToneSound([659, 880], [0.08, 0.15]);
        break;
      case 'trash':
        createMultiToneSound([500, 300, 200], [0.06, 0.06, 0.1], ['triangle', 'triangle', 'triangle']);
        break;
      default:
        break;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
};
