import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Square, RotateCw, Download, Trash2, X } from 'lucide-react';

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  favorite?: boolean;
}

export const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Load photos from localStorage on mount
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem('cameraPhotos');
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        // Validate that parsed data is an array before setting state
        if (Array.isArray(parsedPhotos)) {
          setCapturedPhotos(parsedPhotos);
        } else {
          console.warn('Invalid photos data in localStorage, expected array');
          setCapturedPhotos([]);
        }
      }
    } catch (error) {
      console.error('Error loading photos from localStorage:', error);
      setCapturedPhotos([]);
    }
  }, []);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !currentDeviceId) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
        setError('Unable to enumerate camera devices');
      }
    };

    getDevices();
  }, [currentDeviceId]);

  // Start camera stream
  const startCamera = async (deviceId?: string) => {
    try {
      setError('');
      
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is already in use by another application.');
        } else {
          setError(`Error accessing camera: ${err.message}`);
        }
      }
    }
  };

  // Start camera on mount
  useEffect(() => {
    startCamera(currentDeviceId);

    return () => {
      // Cleanup: stop the camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [currentDeviceId]);

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Add to captured photos
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: Date.now(),
    };

    setCapturedPhotos(prev => {
      const updatedPhotos = [newPhoto, ...prev];
      
      // Save to localStorage
      try {
        localStorage.setItem('cameraPhotos', JSON.stringify(updatedPhotos));
        // Dispatch custom event to notify Photos app
        window.dispatchEvent(new Event('photosCaptured'));
      } catch (error) {
        console.error('Error saving photo to localStorage:', error);
      }
      
      return updatedPhotos;
    });
    
    // Capture animation
    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 200);
  };

  // Switch camera
  const switchCamera = async () => {
    if (devices.length <= 1) return;

    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDeviceId = devices[nextIndex].deviceId;

    setCurrentDeviceId(nextDeviceId);
  };

  // Download photo
  const downloadPhoto = (photo: CapturedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `photo-${photo.timestamp}.jpg`;
    link.click();
  };

  // Delete photo
  const deletePhoto = (photoId: string) => {
    setCapturedPhotos(prev => {
      const updatedPhotos = prev.filter(p => p.id !== photoId);
      
      // Update localStorage
      try {
        localStorage.setItem('cameraPhotos', JSON.stringify(updatedPhotos));
        window.dispatchEvent(new Event('photosCaptured'));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
      
      return updatedPhotos;
    });
    
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="camera-app">
      <div className="camera-main">
        <div className="camera-view">
          {error ? (
            <div className="camera-error">
              <CameraIcon size={48} />
              <p>{error}</p>
              <button onClick={() => startCamera(currentDeviceId)} className="retry-button">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video ${isCapturing ? 'capturing' : ''}`}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="camera-controls">
                {devices.length > 1 && (
                  <button
                    onClick={switchCamera}
                    className="camera-control-button"
                    title="Switch Camera"
                  >
                    <RotateCw size={24} />
                  </button>
                )}
                
                <button
                  onClick={capturePhoto}
                  className="camera-capture-button"
                  disabled={!hasPermission}
                  title="Take Photo"
                >
                  <div className="capture-button-inner">
                    <Square size={32} />
                  </div>
                </button>
                
                <div className="camera-device-info">
                  {devices.length > 0 && (
                    <span>
                      {devices.find(d => d.deviceId === currentDeviceId)?.label || 'Camera'}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="camera-sidebar">
          <div className="camera-sidebar-header">
            <h3>Photos ({capturedPhotos.length})</h3>
          </div>
          
          <div className="camera-photos-grid">
            {capturedPhotos.length === 0 ? (
              <div className="no-photos">
                <CameraIcon size={32} />
                <p>No photos taken yet</p>
              </div>
            ) : (
              capturedPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="camera-photo-thumbnail"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo.dataUrl} alt="Captured" />
                  <div className="photo-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(photo);
                      }}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhoto(photo.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <div className="camera-photo-modal" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="photo-modal-close"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={24} />
            </button>
            <img src={selectedPhoto.dataUrl} alt="Full size" />
            <div className="photo-modal-actions">
              <button onClick={() => downloadPhoto(selectedPhoto)}>
                <Download size={20} />
                Download
              </button>
              <button
                onClick={() => deletePhoto(selectedPhoto.id)}
                className="delete-button"
              >
                <Trash2 size={20} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
