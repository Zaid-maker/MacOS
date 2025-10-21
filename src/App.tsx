import { lazy, Suspense, useEffect, useState } from 'react';
import { BootAnimation } from './components/BootAnimation';
import { ControlCenter } from './components/ControlCenter';
import { Desktop } from './components/Desktop';
import { Dock } from './components/Dock';
import { KeyboardShortcutsOverlay } from './components/KeyboardShortcutsOverlay';
import { LoginPage } from './components/LoginPage';
import { MenuBar } from './components/MenuBar';
import { MissionControl } from './components/MissionControl';
import { NotificationToast } from './components/NotificationToast';
import { Spotlight } from './components/Spotlight';
import { Window } from './components/Window';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ContextMenuProvider } from './contexts/ContextMenuContext';
import { DragDropProvider } from './contexts/DragDropContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { OSProvider, useOS } from './contexts/OSContext';
import { SoundProvider } from './contexts/SoundContext';
import { SpacesProvider, useSpaces } from './contexts/SpacesContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useWallpaper, WallpaperProvider } from './contexts/WallpaperContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { App, DesktopIcon } from './types';
import './App.css';

// Lazy load app components
const Finder = lazy(() => import('./components/apps/Finder').then((m) => ({ default: m.Finder })));
const Safari = lazy(() => import('./components/apps/Safari').then((m) => ({ default: m.Safari })));
const Terminal = lazy(() => import('./components/apps/Terminal').then((m) => ({ default: m.Terminal })));
const Calculator = lazy(() => import('./components/apps/Calculator').then((m) => ({ default: m.Calculator })));
const Notes = lazy(() => import('./components/apps/Notes').then((m) => ({ default: m.Notes })));
const Settings = lazy(() => import('./components/apps/Settings').then((m) => ({ default: m.Settings })));
const Camera = lazy(() => import('./components/apps/Camera').then((m) => ({ default: m.Camera })));
const Photos = lazy(() => import('./components/apps/Photos').then((m) => ({ default: m.Photos })));

const apps: App[] = [
  { id: 'finder', name: 'Finder', icon: '📁', color: '#54a3ff', component: Finder },
  { id: 'safari', name: 'Safari', icon: '🧭', color: '#0066ff', component: Safari },
  { id: 'camera', name: 'Camera', icon: '📷', color: '#5e5ce6', component: Camera },
  { id: 'photos', name: 'Photos', icon: '🖼️', color: '#ff2d55', component: Photos },
  { id: 'terminal', name: 'Terminal', icon: '⌨️', color: '#2c2c2c', component: Terminal },
  { id: 'notes', name: 'Notes', icon: '📝', color: '#ffd60a', component: Notes },
  { id: 'calculator', name: 'Calculator', icon: '🔢', color: '#ff9500', component: Calculator },
  { id: 'settings', name: 'Settings', icon: '⚙️', color: '#8e8e93', component: Settings },
];

const desktopIcons: DesktopIcon[] = [
  { id: 'desktop-1', name: 'Documents', icon: '📄', position: { x: 20, y: 50 }, appId: 'finder' },
  { id: 'desktop-2', name: 'Pictures', icon: '🖼️', position: { x: 20, y: 150 }, appId: 'finder' },
  { id: 'desktop-3', name: 'Music', icon: '🎵', position: { x: 20, y: 250 }, appId: 'finder' },
];

function OSContent() {
  const { windows, apps: contextApps, setApps } = useOS();
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const { currentWallpaper } = useWallpaper();
  const { toggleMissionControl } = useSpaces();
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);

  useKeyboardShortcuts({
    onSpotlight: () => setIsSpotlightOpen(true),
    onMissionControl: toggleMissionControl,
  });

  useEffect(() => {
    setApps(apps);
  }, [setApps]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className={`macos ${isDarkMode ? 'dark-mode' : ''}`} style={{ background: currentWallpaper.gradient }}>
      <MenuBar
        onSpotlightOpen={() => setIsSpotlightOpen(true)}
        onControlCenterToggle={() => setIsControlCenterOpen(!isControlCenterOpen)}
      />
      <Desktop icons={desktopIcons} />
      {windows.map((window) => {
        const app = contextApps.find((a) => a.id === window.appId);
        const AppComponent = app?.component;
        return (
          <Window key={window.id} window={window}>
            <Suspense fallback={<div className="app-loading">Loading...</div>}>
              {AppComponent && <AppComponent />}
            </Suspense>
          </Window>
        );
      })}
      <Dock apps={contextApps} />
      <Spotlight isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />
      <ControlCenter isOpen={isControlCenterOpen} onClose={() => setIsControlCenterOpen(false)} />
      <KeyboardShortcutsOverlay />
      <NotificationToast />
      <MissionControl />
    </div>
  );
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleBootComplete = () => {
    setIsBooting(false);
    // Small delay before showing content for smooth transition
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <>
      {isBooting && <BootAnimation onComplete={handleBootComplete} />}
      {showContent && (
        <ThemeProvider>
          <WallpaperProvider>
            <SoundProvider>
              <NotificationProvider>
                <ContextMenuProvider>
                  <DragDropProvider>
                    <SpacesProvider>
                      <AuthProvider>
                        <OSProvider>
                          <OSContent />
                        </OSProvider>
                      </AuthProvider>
                    </SpacesProvider>
                  </DragDropProvider>
                </ContextMenuProvider>
              </NotificationProvider>
            </SoundProvider>
          </WallpaperProvider>
        </ThemeProvider>
      )}
    </>
  );
}
