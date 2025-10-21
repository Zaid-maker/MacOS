import {
  Camera as CameraIcon,
  Circle,
  Download,
  RotateCcw,
  RotateCw,
  Settings,
  Square,
  StopCircle,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  favorite?: boolean;
}

interface CapturedVideo {
  id: string;
  dataUrl: string;
  timestamp: number;
  duration: number;
}

type Resolution = '480p' | '720p' | '1080p' | '4k';

interface CameraSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  invert: boolean;
  grayscale: boolean;
  sepia: boolean;
  blur: number;
  hueRotate: number;
  mirror: boolean;
  frameRate: number;
  resolution: Resolution;
}

export const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [capturedVideos, setCapturedVideos] = useState<CapturedVideo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CapturedVideo | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'photos' | 'videos'>('photos');
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [settings, setSettings] = useState<CameraSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    invert: false,
    grayscale: false,
    sepia: false,
    blur: 0,
    hueRotate: 0,
    mirror: false,
    frameRate: 30,
    resolution: '720p',
  });

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

  // Helper function to get resolution constraints
  const getResolutionConstraints = (resolution: Resolution) => {
    switch (resolution) {
      case '480p':
        return { width: 640, height: 480 };
      case '720p':
        return { width: 1280, height: 720 };
      case '1080p':
        return { width: 1920, height: 1080 };
      case '4k':
        return { width: 3840, height: 2160 };
      default:
        return { width: 1280, height: 720 };
    }
  };

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter((device) => device.kind === 'videoinput');
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
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const resolutionConstraints = getResolutionConstraints(settings.resolution);

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              frameRate: { ideal: settings.frameRate },
              width: { ideal: resolutionConstraints.width },
              height: { ideal: resolutionConstraints.height },
            }
          : {
              frameRate: { ideal: settings.frameRate },
              width: { ideal: resolutionConstraints.width },
              height: { ideal: resolutionConstraints.height },
            },
        audio: mode === 'video',
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

  // Start camera on mount and when settings change
  useEffect(() => {
    startCamera(currentDeviceId);

    return () => {
      // Cleanup: stop the camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [currentDeviceId, settings.frameRate, settings.resolution, mode]);

  // Helper function to safely read photos from localStorage
  const getStoredPhotos = (): CapturedPhoto[] => {
    try {
      const savedPhotos = localStorage.getItem('cameraPhotos');
      if (savedPhotos) {
        const parsed = JSON.parse(savedPhotos);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Error reading photos from localStorage:', error);
    }
    return [];
  };

  // Helper function to safely write photos to localStorage
  const setStoredPhotos = (photos: CapturedPhoto[]) => {
    try {
      localStorage.setItem('cameraPhotos', JSON.stringify(photos));
      window.dispatchEvent(new Event('photosCaptured'));
    } catch (error) {
      console.error('Error saving photos to localStorage:', error);
    }
  };

  // Apply filters to canvas context
  const applyFilters = (ctx: CanvasRenderingContext2D) => {
    const filters: string[] = [];

    if (settings.brightness !== 100) filters.push(`brightness(${settings.brightness}%)`);
    if (settings.contrast !== 100) filters.push(`contrast(${settings.contrast}%)`);
    if (settings.saturation !== 100) filters.push(`saturate(${settings.saturation}%)`);
    if (settings.blur > 0) filters.push(`blur(${settings.blur}px)`);
    if (settings.hueRotate !== 0) filters.push(`hue-rotate(${settings.hueRotate}deg)`);
    if (settings.invert) filters.push('invert(100%)');
    if (settings.grayscale) filters.push('grayscale(100%)');
    if (settings.sepia) filters.push('sepia(100%)');

    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
  };

  // Get CSS filter string for video element
  const getVideoFilterStyle = (): string => {
    const filters: string[] = [];

    if (settings.brightness !== 100) filters.push(`brightness(${settings.brightness}%)`);
    if (settings.contrast !== 100) filters.push(`contrast(${settings.contrast}%)`);
    if (settings.saturation !== 100) filters.push(`saturate(${settings.saturation}%)`);
    if (settings.blur > 0) filters.push(`blur(${settings.blur}px)`);
    if (settings.hueRotate !== 0) filters.push(`hue-rotate(${settings.hueRotate}deg)`);
    if (settings.invert) filters.push('invert(100%)');
    if (settings.grayscale) filters.push('grayscale(100%)');
    if (settings.sepia) filters.push('sepia(100%)');

    return filters.join(' ');
  };

  // Reset settings to default
  const resetSettings = () => {
    setSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      invert: false,
      grayscale: false,
      sepia: false,
      blur: 0,
      hueRotate: 0,
      mirror: false,
      frameRate: 30,
      resolution: '720p',
    });
  };

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

    // Apply filters to canvas
    applyFilters(context);

    // Apply mirror transformation if enabled
    if (settings.mirror) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transformation
    if (settings.mirror) {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Add to captured photos
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: Date.now(),
    };

    // Read latest photos from localStorage (may include changes from Photos app)
    const latestPhotos = getStoredPhotos();
    const updatedPhotos = [newPhoto, ...latestPhotos];

    // Save to localStorage
    setStoredPhotos(updatedPhotos);

    // Update component state
    setCapturedPhotos(updatedPhotos);

    // Capture animation
    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 200);
  };

  // Start video recording
  const startRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];

    try {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const mediaRecorder = new MediaRecorder(streamRef.current, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm',
        });
        const dataUrl = URL.createObjectURL(blob);

        const newVideo: CapturedVideo = {
          id: Date.now().toString(),
          dataUrl,
          timestamp: Date.now(),
          duration: recordingDuration,
        };

        setCapturedVideos((prev) => [newVideo, ...prev]);
        setRecordingDuration(0);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start recording timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Store timer ID for cleanup
      (mediaRecorder as any).timerId = timer;
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to start video recording');
    }
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear timer
      const timerId = (mediaRecorderRef.current as any).timerId;
      if (timerId) clearInterval(timerId);

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Switch camera
  const switchCamera = async () => {
    if (devices.length <= 1) return;

    const currentIndex = devices.findIndex((d) => d.deviceId === currentDeviceId);
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
    // Read latest photos from localStorage (may include changes from Photos app)
    const latestPhotos = getStoredPhotos();
    const updatedPhotos = latestPhotos.filter((p) => p.id !== photoId);

    // Save to localStorage
    setStoredPhotos(updatedPhotos);

    // Update component state
    setCapturedPhotos(updatedPhotos);

    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  };

  // Download video
  const downloadVideo = (video: CapturedVideo) => {
    const link = document.createElement('a');
    link.href = video.dataUrl;
    link.download = `video-${video.timestamp}.webm`;
    link.click();
  };

  // Delete video
  const deleteVideo = (videoId: string) => {
    setCapturedVideos((prev) => prev.filter((v) => v.id !== videoId));

    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
  };

  // Format duration helper
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                style={{
                  filter: getVideoFilterStyle(),
                  transform: settings.mirror ? 'scaleX(-1)' : 'none',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Recording Duration Display */}
              {isRecording && (
                <div className="recording-indicator">
                  <Circle className="recording-dot" size={12} fill="red" color="red" />
                  <span>
                    {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Mode Switcher */}
              <div className="camera-mode-switcher">
                <button className={`mode-button ${mode === 'photo' ? 'active' : ''}`} onClick={() => setMode('photo')}>
                  <CameraIcon size={18} />
                  Photo
                </button>
                <button className={`mode-button ${mode === 'video' ? 'active' : ''}`} onClick={() => setMode('video')}>
                  <Video size={18} />
                  Video
                </button>
              </div>

              <div className="camera-controls">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`camera-control-button ${showSettings ? 'active' : ''}`}
                  title="Settings"
                >
                  <Settings size={24} />
                </button>

                {devices.length > 1 && (
                  <button onClick={switchCamera} className="camera-control-button" title="Switch Camera">
                    <RotateCw size={24} />
                  </button>
                )}

                {mode === 'photo' ? (
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
                ) : (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`camera-capture-button ${isRecording ? 'recording' : ''}`}
                    disabled={!hasPermission}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                  >
                    <div className="capture-button-inner">
                      {isRecording ? <StopCircle size={32} /> : <Circle size={32} />}
                    </div>
                  </button>
                )}

                <div className="camera-device-info">
                  {devices.length > 0 && (
                    <span>{devices.find((d) => d.deviceId === currentDeviceId)?.label || 'Camera'}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="camera-settings-panel">
            <div className="camera-settings-header">
              <h3>Camera Settings</h3>
              <div className="camera-settings-actions">
                <button onClick={resetSettings} className="reset-settings-button" title="Reset to defaults">
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button onClick={() => setShowSettings(false)} className="close-settings-button" title="Close settings">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="camera-settings-content">
              {/* Brightness */}
              <div className="setting-item">
                <label>
                  <span>Brightness</span>
                  <span className="setting-value">{settings.brightness}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.brightness}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      brightness: parseInt(e.target.value),
                    })
                  }
                  className="setting-slider"
                />
              </div>

              {/* Contrast */}
              <div className="setting-item">
                <label>
                  <span>Contrast</span>
                  <span className="setting-value">{settings.contrast}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.contrast}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contrast: parseInt(e.target.value),
                    })
                  }
                  className="setting-slider"
                />
              </div>

              {/* Saturation */}
              <div className="setting-item">
                <label>
                  <span>Saturation</span>
                  <span className="setting-value">{settings.saturation}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.saturation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      saturation: parseInt(e.target.value),
                    })
                  }
                  className="setting-slider"
                />
              </div>

              {/* Blur */}
              <div className="setting-item">
                <label>
                  <span>Blur</span>
                  <span className="setting-value">{settings.blur}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={settings.blur}
                  onChange={(e) => setSettings({ ...settings, blur: parseInt(e.target.value) })}
                  className="setting-slider"
                />
              </div>

              {/* Hue Rotate */}
              <div className="setting-item">
                <label>
                  <span>Hue Rotate</span>
                  <span className="setting-value">{settings.hueRotate}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.hueRotate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hueRotate: parseInt(e.target.value),
                    })
                  }
                  className="setting-slider"
                />
              </div>

              {/* Toggle Effects */}
              <div className="setting-toggles">
                <button
                  className={`setting-toggle ${settings.invert ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, invert: !settings.invert })}
                >
                  Invert
                </button>
                <button
                  className={`setting-toggle ${settings.grayscale ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, grayscale: !settings.grayscale })}
                >
                  Grayscale
                </button>
                <button
                  className={`setting-toggle ${settings.sepia ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, sepia: !settings.sepia })}
                >
                  Sepia
                </button>
              </div>

              {/* Camera Settings */}
              <div className="setting-item">
                <label>
                  <span>Resolution</span>
                  <span className="setting-value">{settings.resolution.toUpperCase()}</span>
                </label>
                <div className="setting-toggles resolution-toggles">
                  <button
                    className={`setting-toggle ${settings.resolution === '480p' ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, resolution: '480p' })}
                  >
                    480p
                  </button>
                  <button
                    className={`setting-toggle ${settings.resolution === '720p' ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, resolution: '720p' })}
                  >
                    720p
                  </button>
                  <button
                    className={`setting-toggle ${settings.resolution === '1080p' ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, resolution: '1080p' })}
                  >
                    1080p
                  </button>
                  <button
                    className={`setting-toggle ${settings.resolution === '4k' ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, resolution: '4k' })}
                  >
                    4K
                  </button>
                </div>
              </div>

              <div className="setting-item">
                <label>
                  <span>Frame Rate</span>
                  <span className="setting-value">{settings.frameRate} FPS</span>
                </label>
                <div className="setting-toggles">
                  <button
                    className={`setting-toggle ${settings.frameRate === 24 ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, frameRate: 24 })}
                  >
                    24 FPS
                  </button>
                  <button
                    className={`setting-toggle ${settings.frameRate === 30 ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, frameRate: 30 })}
                  >
                    30 FPS
                  </button>
                  <button
                    className={`setting-toggle ${settings.frameRate === 60 ? 'active' : ''}`}
                    onClick={() => setSettings({ ...settings, frameRate: 60 })}
                  >
                    60 FPS
                  </button>
                </div>
              </div>

              <div className="setting-toggles">
                <button
                  className={`setting-toggle ${settings.mirror ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, mirror: !settings.mirror })}
                >
                  Mirror
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="camera-sidebar">
          <div className="camera-sidebar-header">
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab ${sidebarTab === 'photos' ? 'active' : ''}`}
                onClick={() => setSidebarTab('photos')}
              >
                <CameraIcon size={16} />
                Photos ({capturedPhotos.length})
              </button>
              <button
                className={`sidebar-tab ${sidebarTab === 'videos' ? 'active' : ''}`}
                onClick={() => setSidebarTab('videos')}
              >
                <Video size={16} />
                Videos ({capturedVideos.length})
              </button>
            </div>
          </div>

          <div className="camera-photos-grid">
            {sidebarTab === 'photos' ? (
              capturedPhotos.length === 0 ? (
                <div className="no-photos">
                  <CameraIcon size={32} />
                  <p>No photos taken yet</p>
                </div>
              ) : (
                capturedPhotos.map((photo) => (
                  <div key={photo.id} className="camera-photo-thumbnail" onClick={() => setSelectedPhoto(photo)}>
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
              )
            ) : capturedVideos.length === 0 ? (
              <div className="no-photos">
                <Video size={32} />
                <p>No videos recorded yet</p>
              </div>
            ) : (
              capturedVideos.map((video) => (
                <div
                  key={video.id}
                  className="camera-photo-thumbnail video-thumbnail"
                  onClick={() => setSelectedVideo(video)}
                >
                  <video src={video.dataUrl} />
                  <div className="video-duration">{formatDuration(video.duration)}</div>
                  <div className="photo-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadVideo(video);
                      }}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVideo(video.id);
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
            <button className="photo-modal-close" onClick={() => setSelectedPhoto(null)}>
              <X size={24} />
            </button>
            <img src={selectedPhoto.dataUrl} alt="Full size" />
            <div className="photo-modal-actions">
              <button onClick={() => downloadPhoto(selectedPhoto)}>
                <Download size={20} />
                Download
              </button>
              <button onClick={() => deletePhoto(selectedPhoto.id)} className="delete-button">
                <Trash2 size={20} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVideo && (
        <div className="camera-photo-modal" onClick={() => setSelectedVideo(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setSelectedVideo(null)}>
              <X size={24} />
            </button>
            <video src={selectedVideo.dataUrl} controls autoPlay />
            <div className="photo-modal-actions">
              <button onClick={() => downloadVideo(selectedVideo)}>
                <Download size={20} />
                Download
              </button>
              <button onClick={() => deleteVideo(selectedVideo.id)} className="delete-button">
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
