import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Home, Star, Clock, FileText } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
}

export const Finder: React.FC = () => {
  const { addNotification } = useNotifications();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['Desktop']));
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: FileItem) => {
    e.stopPropagation();
    setDraggedItem(item.name);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.name);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (targetFolder.type === 'folder' && draggedItem) {
      addNotification(
        'File Moved',
        `"${draggedItem}" moved to "${targetFolder.name}"`,
        'success',
        { appIcon: '📁', duration: 3000 }
      );
      setDraggedItem(null);
    }
  };

  const fileStructure: FileItem[] = [
    {
      name: 'Desktop',
      type: 'folder',
      children: [
        { name: 'Project.pdf', type: 'file' },
        { name: 'Screenshot.png', type: 'file' },
      ],
    },
    {
      name: 'Documents',
      type: 'folder',
      children: [
        { name: 'Resume.docx', type: 'file' },
        { name: 'Work', type: 'folder', children: [] },
      ],
    },
    {
      name: 'Downloads',
      type: 'folder',
      children: [{ name: 'installer.dmg', type: 'file' }],
    },
    { name: 'Pictures', type: 'folder', children: [] },
    { name: 'Music', type: 'folder', children: [] },
  ];

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.name}>
        <div
          className={`finder-item ${selectedItem === item.name ? 'selected' : ''} ${
            draggedItem === item.name ? 'dragging' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 10}px` }}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item)}
          onClick={() => {
            setSelectedItem(item.name);
            if (item.type === 'folder') toggleFolder(item.name);
          }}
        >
          {item.type === 'folder' && (
            <span className="folder-icon">
              {expandedFolders.has(item.name) ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </span>
          )}
          {item.type === 'folder' ? <Folder size={16} /> : <File size={16} />}
          <span className="item-name">{item.name}</span>
        </div>
        {item.type === 'folder' && expandedFolders.has(item.name) && item.children && (
          <div>{renderFileTree(item.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="finder">
      <div className="finder-sidebar">
        <div className="finder-section">
          <div className="finder-section-title">Favorites</div>
          <div className="finder-sidebar-item">
            <Home size={16} />
            <span>Home</span>
          </div>
          <div className="finder-sidebar-item">
            <Star size={16} />
            <span>Favorites</span>
          </div>
          <div className="finder-sidebar-item">
            <Clock size={16} />
            <span>Recent</span>
          </div>
        </div>
        <div className="finder-section">
          <div className="finder-section-title">Locations</div>
          {renderFileTree(fileStructure)}
        </div>
      </div>
      <div className="finder-main">
        <div className="finder-toolbar">
          <div className="finder-breadcrumb">
            <Home size={16} />
            <ChevronRight size={14} />
            <span>{selectedItem || 'Home'}</span>
          </div>
        </div>
        <div className="finder-content">
          <div className="finder-grid">
            {fileStructure.map((item) => (
              <div key={item.name} className="finder-grid-item">
                {item.type === 'folder' ? (
                  <Folder size={48} color="#54a3ff" />
                ) : (
                  <FileText size={48} color="#888" />
                )}
                <div className="finder-grid-item-name">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
