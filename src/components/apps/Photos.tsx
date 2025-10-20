import React, { useState, useEffect } from 'react';
import { Download, Trash2, X, Search, Grid3x3, List, Calendar, Image as ImageIcon, Heart, Share2 } from 'lucide-react';

interface Photo {
  id: string;
  dataUrl: string;
  timestamp: number;
  favorite?: boolean;
}

export const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');

  // Load photos from localStorage on mount
  useEffect(() => {
    loadPhotos();
    
    // Listen for storage changes (when Camera app captures new photos)
    const handleStorageChange = () => {
      loadPhotos();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event from Camera app
    window.addEventListener('photosCaptured', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('photosCaptured', handleStorageChange);
    };
  }, []);

  const loadPhotos = () => {
    try {
      const savedPhotos = localStorage.getItem('cameraPhotos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        // Convert timestamp to number if it's a Date string
        const normalizedPhotos = parsedPhotos.map((photo: any) => ({
          ...photo,
          timestamp: typeof photo.timestamp === 'string' 
            ? new Date(photo.timestamp).getTime() 
            : photo.timestamp
        }));
        setPhotos(normalizedPhotos);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `photo-${new Date(photo.timestamp).toISOString()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    setPhotos(updatedPhotos);
    localStorage.setItem('cameraPhotos', JSON.stringify(updatedPhotos));
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  };

  const toggleFavorite = (photoId: string) => {
    const updatedPhotos = photos.map(p => 
      p.id === photoId ? { ...p, favorite: !p.favorite } : p
    );
    setPhotos(updatedPhotos);
    localStorage.setItem('cameraPhotos', JSON.stringify(updatedPhotos));
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(updatedPhotos.find(p => p.id === photoId) || null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPhotos = photos
    .filter(photo => filterMode === 'all' || photo.favorite)
    .filter(photo => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      const date = formatDate(photo.timestamp).toLowerCase();
      return date.includes(searchLower);
    });

  return (
    <div className="photos-app">
      {/* Sidebar */}
      <div className="photos-sidebar">
        <div className="photos-sidebar-header">
          <h3>Library</h3>
        </div>
        
        <div className="photos-sidebar-sections">
          <button 
            className={`photos-sidebar-item ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            <ImageIcon size={18} />
            <span>All Photos</span>
            <span className="photos-count">{photos.length}</span>
          </button>
          
          <button 
            className={`photos-sidebar-item ${filterMode === 'favorites' ? 'active' : ''}`}
            onClick={() => setFilterMode('favorites')}
          >
            <Heart size={18} />
            <span>Favorites</span>
            <span className="photos-count">{photos.filter(p => p.favorite).length}</span>
          </button>
          
          <button className="photos-sidebar-item" disabled>
            <Calendar size={18} />
            <span>Recent</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="photos-main">
        {/* Toolbar */}
        <div className="photos-toolbar">
          <div className="photos-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search photos by date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="photos-toolbar-actions">
            <button
              className={`photos-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              className={`photos-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Photos Grid/List */}
        {filteredPhotos.length === 0 ? (
          <div className="photos-empty">
            <div className="photos-empty-icon">📷</div>
            <h2>No Photos Yet</h2>
            <p>
              {searchQuery 
                ? 'No photos match your search.'
                : filterMode === 'favorites'
                ? 'You haven\'t favorited any photos yet.'
                : 'Photos you capture with the Camera app will appear here.'}
            </p>
          </div>
        ) : (
          <div className={`photos-container ${viewMode}`}>
            {viewMode === 'grid' ? (
              <div className="photos-grid">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="photo-grid-item"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img src={photo.dataUrl} alt={`Photo ${photo.id}`} />
                    {photo.favorite && (
                      <div className="photo-favorite-badge">
                        <Heart size={14} fill="currentColor" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="photos-list">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="photo-list-item"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img src={photo.dataUrl} alt={`Photo ${photo.id}`} />
                    <div className="photo-list-info">
                      <span className="photo-list-date">{formatDate(photo.timestamp)}</span>
                      {photo.favorite && (
                        <Heart size={14} fill="currentColor" className="photo-list-favorite" />
                      )}
                    </div>
                    <div className="photo-list-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo);
                        }}
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="photo-viewer-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="photo-viewer-close"
              onClick={() => setSelectedPhoto(null)}
              title="Close"
            >
              <X size={20} />
            </button>
            
            <img src={selectedPhoto.dataUrl} alt="Selected photo" />
            
            <div className="photo-viewer-info">
              <span>{formatDate(selectedPhoto.timestamp)}</span>
            </div>
            
            <div className="photo-viewer-actions">
              <button
                className={`photo-viewer-action ${selectedPhoto.favorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(selectedPhoto.id)}
                title={selectedPhoto.favorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart size={20} fill={selectedPhoto.favorite ? "currentColor" : "none"} />
              </button>
              
              <button
                className="photo-viewer-action"
                onClick={() => handleDownload(selectedPhoto)}
                title="Download"
              >
                <Download size={20} />
              </button>
              
              <button
                className="photo-viewer-action"
                onClick={() => {
                  // Share functionality placeholder
                  alert('Share functionality coming soon!');
                }}
                title="Share"
              >
                <Share2 size={20} />
              </button>
              
              <button
                className="photo-viewer-action delete"
                onClick={() => handleDelete(selectedPhoto.id)}
                title="Delete"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
