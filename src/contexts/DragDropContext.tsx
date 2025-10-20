import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface DragData {
  type: 'desktop-icon' | 'dock-app' | 'file';
  id: string;
  data: any;
}

interface DragDropContextType {
  isDragging: boolean;
  dragData: DragData | null;
  startDrag: (data: DragData) => void;
  endDrag: () => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const DragDropProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState<DragData | null>(null);

  const startDrag = useCallback((data: DragData) => {
    setIsDragging(true);
    setDragData(data);
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragData(null);
  }, []);

  return (
    <DragDropContext.Provider value={{ isDragging, dragData, startDrag, endDrag }}>
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
};
