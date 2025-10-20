import { useEffect, useState, lazy, Suspense } from 'react';
import { OSProvider, useOS } from './contexts/OSContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { WallpaperProvider, useWallpaper } from './contexts/WallpaperContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ContextMenuProvider } from './contexts/ContextMenuContext';
import { DragDropProvider } from './contexts/DragDropContext';
import { SoundProvider } from './contexts/SoundContext';
import { SpacesProvider, useSpaces } from './contexts/SpacesContext';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { Desktop } from './components/Desktop';
import { Window } from './components/Window';
import { LoginPage } from './components/LoginPage';
import { Spotlight } from './components/Spotlight';
import { KeyboardShortcutsOverlay } from './components/KeyboardShortcutsOverlay';
import { NotificationToast } from './components/NotificationToast';
import { MissionControl } from './components/MissionControl';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { App, DesktopIcon } from './types';
import './App.css';

// Lazy load app components
const Finder = lazy(() => import('./components/apps/Finder').then(m => ({ default: m.Finder })));
const Safari = lazy(() => import('./components/apps/Safari').then(m => ({ default: m.Safari })));
const Terminal = lazy(() => import('./components/apps/Terminal').then(m => ({ default: m.Terminal })));
const Calculator = lazy(() => import('./components/apps/Calculator').then(m => ({ default: m.Calculator })));
const Notes = lazy(() => import('./components/apps/Notes').then(m => ({ default: m.Notes })));
const Settings = lazy(() => import('./components/apps/Settings').then(m => ({ default: m.Settings })));

const apps: App[] = [
  { id: 'finder', name: 'Finder', icon: '📁', color: '#54a3ff', component: Finder },
  { id: 'safari', name: 'Safari', icon: '🧭', color: '#0066ff', component: Safari },
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
      <MenuBar onSpotlightOpen={() => setIsSpotlightOpen(true)} />
      <Desktop icons={desktopIcons} />
      {windows.map(window => {
        const app = contextApps.find(a => a.id === window.appId);
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
      <KeyboardShortcutsOverlay />
      <NotificationToast />
      <MissionControl />
    </div>
  );
}

function App() {
  return (
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
  );
}

export default App;
