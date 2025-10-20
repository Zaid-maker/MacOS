import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Wallpaper } from '../types';

export const wallpapers: Wallpaper[] = [
  {
    id: 'purple-gradient',
    name: 'Purple Dreams',
    thumbnail: '🌌',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    thumbnail: '🌊',
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    thumbnail: '🌅',
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #c44569 100%)',
  },
  {
    id: 'forest',
    name: 'Forest',
    thumbnail: '🌲',
    gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    thumbnail: '✨',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    thumbnail: '🌠',
    gradient: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
  },
  {
    id: 'mint',
    name: 'Mint',
    thumbnail: '🍃',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    thumbnail: '🌹',
    gradient: 'linear-gradient(135deg, #ed4264 0%, #ffedbc 100%)',
  },
  {
    id: 'night-sky',
    name: 'Night Sky',
    thumbnail: '🌃',
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  },
  {
    id: 'peach',
    name: 'Peach',
    thumbnail: '🍑',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
  {
    id: 'neon',
    name: 'Neon',
    thumbnail: '💜',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 'deep-sea',
    name: 'Deep Sea',
    thumbnail: '🐚',
    gradient: 'linear-gradient(135deg, #2e1437 0%, #3f1f6b 50%, #1e3c72 100%)',
  },
];

interface WallpaperContextType {
  currentWallpaper: Wallpaper;
  setWallpaper: (wallpaper: Wallpaper) => void;
  wallpapers: Wallpaper[];
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export const WallpaperProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWallpaper, setCurrentWallpaper] = useState<Wallpaper>(() => {
    const saved = localStorage.getItem('wallpaper');
    if (saved) {
      const wallpaper = wallpapers.find(w => w.id === saved);
      if (wallpaper) return wallpaper;
    }
    return wallpapers[0];
  });

  const setWallpaper = (wallpaper: Wallpaper) => {
    setCurrentWallpaper(wallpaper);
    localStorage.setItem('wallpaper', wallpaper.id);
  };

  return (
    <WallpaperContext.Provider value={{ currentWallpaper, setWallpaper, wallpapers }}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within WallpaperProvider');
  }
  return context;
};
