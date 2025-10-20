import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Folder, Calculator, Settings as SettingsIcon } from 'lucide-react';
import { useOS } from '../contexts/OSContext';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose }) => {
  const { openApp, apps } = useOS();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const getSearchResults = (): SearchResult[] => {
    if (!query.trim()) {
      return apps.map(app => ({
        id: app.id,
        title: app.name,
        subtitle: 'Application',
        icon: <span style={{ fontSize: '24px' }}>{app.icon}</span>,
        category: 'Applications',
        action: () => {
          openApp(app.id);
          onClose();
        },
      }));
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search apps
    apps.forEach(app => {
      if (app.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: app.id,
          title: app.name,
          subtitle: 'Application',
          icon: <span style={{ fontSize: '24px' }}>{app.icon}</span>,
          category: 'Applications',
          action: () => {
            openApp(app.id);
            onClose();
          },
        });
      }
    });

    // Search system items
    const systemItems = [
      {
        id: 'system-prefs',
        title: 'System Preferences',
        subtitle: 'Settings',
        icon: <SettingsIcon size={24} />,
        category: 'System',
        keywords: ['settings', 'preferences', 'system'],
        action: () => {
          openApp('settings');
          onClose();
        },
      },
      {
        id: 'calc',
        title: 'Calculator',
        subtitle: 'Perform calculations',
        icon: <Calculator size={24} />,
        category: 'Applications',
        keywords: ['calculator', 'math', 'calculate'],
        action: () => {
          openApp('calculator');
          onClose();
        },
      },
    ];

    systemItems.forEach(item => {
      if (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle.toLowerCase().includes(lowerQuery) ||
        item.keywords.some(k => k.includes(lowerQuery))
      ) {
        results.push(item as SearchResult);
      }
    });

    // Add some file results for demonstration
    if (lowerQuery.includes('document') || lowerQuery.includes('file')) {
      results.push({
        id: 'doc-1',
        title: 'Important Document.pdf',
        subtitle: 'Documents',
        icon: <FileText size={24} />,
        category: 'Documents',
        action: () => {
          openApp('finder');
          onClose();
        },
      });
    }

    if (lowerQuery.includes('folder') || lowerQuery.includes('download')) {
      results.push({
        id: 'folder-1',
        title: 'Downloads',
        subtitle: 'Folder',
        icon: <Folder size={24} />,
        category: 'Folders',
        action: () => {
          openApp('finder');
          onClose();
        },
      });
    }

    return results;
  };

  const results = getSearchResults();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="spotlight-overlay" onClick={onClose}>
      <div className="spotlight" onClick={(e) => e.stopPropagation()}>
        <div className="spotlight-search-bar">
          <Search size={20} className="spotlight-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="spotlight-input"
          />
          {query && (
            <span className="spotlight-shortcut-hint">↵ to select</span>
          )}
        </div>

        {results.length > 0 && (
          <div className="spotlight-results">
            {results.slice(0, 8).map((result, index) => (
              <div
                key={result.id}
                className={`spotlight-result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={result.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="spotlight-result-icon">{result.icon}</div>
                <div className="spotlight-result-content">
                  <div className="spotlight-result-title">{result.title}</div>
                  <div className="spotlight-result-subtitle">{result.subtitle}</div>
                </div>
                <div className="spotlight-result-category">{result.category}</div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && query && (
          <div className="spotlight-no-results">
            <p>No results found for "{query}"</p>
          </div>
        )}

        {!query && (
          <div className="spotlight-tips">
            <p className="spotlight-tip">💡 Search for apps, files, and more</p>
            <div className="spotlight-shortcuts">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>⎋ Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
