import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Space {
  id: string;
  name: string;
  windows: string[]; // Window IDs in this space
}

interface SpacesContextType {
  spaces: Space[];
  currentSpaceId: string;
  isMissionControlOpen: boolean;
  switchToSpace: (spaceId: string) => void;
  addSpace: () => void;
  removeSpace: (spaceId: string) => void;
  moveWindowToSpace: (windowId: string, spaceId: string) => void;
  toggleMissionControl: () => void;
  getCurrentSpace: () => Space;
}

const SpacesContext = createContext<SpacesContextType | undefined>(undefined);

export const SpacesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([
    { id: 'space-1', name: 'Desktop 1', windows: [] },
    { id: 'space-2', name: 'Desktop 2', windows: [] },
    { id: 'space-3', name: 'Desktop 3', windows: [] },
  ]);
  const [currentSpaceId, setCurrentSpaceId] = useState('space-1');
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);

  const switchToSpace = useCallback((spaceId: string) => {
    setCurrentSpaceId(spaceId);
    setIsMissionControlOpen(false);
  }, []);

  const addSpace = useCallback(() => {
    const newSpace: Space = {
      id: `space-${spaces.length + 1}`,
      name: `Desktop ${spaces.length + 1}`,
      windows: [],
    };
    setSpaces((prev) => [...prev, newSpace]);
  }, [spaces.length]);

  const removeSpace = useCallback((spaceId: string) => {
    if (spaces.length <= 1) return; // Keep at least one space
    
    setSpaces((prev) => prev.filter((s) => s.id !== spaceId));
    
    // Switch to first space if removing current space
    if (currentSpaceId === spaceId) {
      setCurrentSpaceId(spaces[0].id === spaceId ? spaces[1].id : spaces[0].id);
    }
  }, [spaces, currentSpaceId]);

  const moveWindowToSpace = useCallback((windowId: string, targetSpaceId: string) => {
    setSpaces((prev) =>
      prev.map((space) => {
        if (space.id === targetSpaceId) {
          return { ...space, windows: [...space.windows, windowId] };
        } else {
          return { ...space, windows: space.windows.filter((id) => id !== windowId) };
        }
      })
    );
  }, []);

  const toggleMissionControl = useCallback(() => {
    setIsMissionControlOpen((prev) => !prev);
  }, []);

  const getCurrentSpace = useCallback(() => {
    return spaces.find((s) => s.id === currentSpaceId) || spaces[0];
  }, [spaces, currentSpaceId]);

  return (
    <SpacesContext.Provider
      value={{
        spaces,
        currentSpaceId,
        isMissionControlOpen,
        switchToSpace,
        addSpace,
        removeSpace,
        moveWindowToSpace,
        toggleMissionControl,
        getCurrentSpace,
      }}
    >
      {children}
    </SpacesContext.Provider>
  );
};

export const useSpaces = () => {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error('useSpaces must be used within SpacesProvider');
  }
  return context;
};
