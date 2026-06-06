import React, { useCallback, useEffect, useState } from 'react';
import { useStore, FileItem } from '../../store/useStore';
import { api } from '../../utils/api';
import { FolderIconSvg, FileIconSvg } from '../apps/FinderApp';
import MenuBar from './MenuBar';
import Dock from './Dock';
import WindowManager from './WindowManager';
import ContextMenu from '../system/ContextMenu';
import ControlCenter from '../system/ControlCenter';
import SpotlightSearch from '../system/SpotlightSearch';
import NotificationCenter from '../system/NotificationCenter';
import NotificationToasts from '../system/NotificationToasts';
import WidgetPanel from '../system/WidgetPanel';
import DesktopWidgets from './DesktopWidgets';
import SetupWizard from '../system/SetupWizard';

const WALLPAPERS: Record<string, string> = {
  default: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 30%, #f0932b 60%, #ffbe76 100%)',
  ocean: 'linear-gradient(135deg, #0c2461 0%, #0a3d62 30%, #3c6382 60%, #60a3bc 100%)',
  forest: 'linear-gradient(135deg, #0a3d0a 0%, #1e5128 30%, #4e9f3d 60%, #89b868 100%)',
  aurora: 'linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 50%, #0f9b8e 80%, #44bd6e 100%)',
  cosmic: 'linear-gradient(135deg, #000428 0%, #1a0533 30%, #2d1b69 60%, #004e92 100%)',
  rose: 'linear-gradient(135deg, #2c003e 0%, #512b58 30%, #8b4367 60%, #d9727b 100%)',
  minimal: 'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)',
  midnight: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a2e 100%)',
};

const Desktop: React.FC = () => {
  const {
    wallpaper,
    showContextMenu, hideContextMenu, contextMenu,
    showControlCenter, showNotificationCenter, showSpotlight, showWidgets,
    toggleSpotlight, openWindow, addNotification,
  } = useStore();
  const justLoggedIn = useStore(s => s.justLoggedIn);
  const clearJustLoggedIn = useStore(s => s.clearJustLoggedIn);
  const [needsSetup, setNeedsSetup] = useState(justLoggedIn);

  // Imported files/folders that live at the top level of the webOS sandbox.
  const [webosRoot, setWebosRoot] = useState('');
  const [desktopFiles, setDesktopFiles] = useState<FileItem[]>([]);

  const loadDesktopFiles = useCallback(async () => {
    try {
      const { root } = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
      if (!root) { setWebosRoot(''); setDesktopFiles([]); return; }
      setWebosRoot(root);
      const items: FileItem[] = await api.fs.list(root);
      items.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      setDesktopFiles(items);
    } catch { setDesktopFiles([]); }
  }, []);

  // Load on mount and whenever the filesystem changes (import/delete/rename).
  useEffect(() => {
    loadDesktopFiles();
    const handler = () => loadDesktopFiles();
    window.addEventListener('webos-fs-changed', handler);
    return () => window.removeEventListener('webos-fs-changed', handler);
  }, [loadDesktopFiles]);

  // Only show setup wizard if user just logged in fresh (not from restore)
  useEffect(() => {
    if (justLoggedIn) {
      setNeedsSetup(true);
    }
  }, [justLoggedIn]);

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    clearJustLoggedIn();
  };

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, [
      { label: 'Change Wallpaper...', action: () => openWindow('settings', 'Wallpaper', 'settings', { filePath: 'wallpaper' }) },
      { separator: true, label: '' },
      { label: 'System Settings...', action: () => openWindow('settings', 'Settings', 'settings') },
      { label: 'Open Finder', action: () => openWindow('finder', 'Finder', 'finder') },
    ]);
  }, [showContextMenu, openWindow]);

  const handleDesktopClick = useCallback(() => {
    hideContextMenu();
  }, [hideContextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === ' ') {
        e.preventDefault();
        toggleSpotlight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSpotlight]);

  // Listen for fs-change postMessages from Tools-Hub iframes (voice recorder, etc.)
  // and rebroadcast as window events that Finder/Photos listen to.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'webos-fs-changed') {
        window.dispatchEvent(new CustomEvent('webos-fs-changed'));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Welcome notification (only once per session)
  useEffect(() => {
    if (!(window as any).__webos_welcomed) {
      (window as any).__webos_welcomed = true;
      setTimeout(() => {
        addNotification({
          title: 'Welcome to webOS',
          message: 'Your desktop is ready. Open apps from the Dock or press Cmd+Space for Spotlight.',
          app: 'system'
        });
      }, 1000);
    }
  }, []); // eslint-disable-line

  const bg = WALLPAPERS[wallpaper] || WALLPAPERS.default;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
    >
      <MenuBar />

      {/* Desktop area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Desktop Widgets - time, date, weather */}
        <DesktopWidgets />

        {/* Desktop Icons — imported files & folders. Double-click opens
            Finder at the sandbox root with the item highlighted. */}
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', maxHeight: 'calc(100% - 32px)', flexWrap: 'wrap' }}>
          {desktopFiles.map((item) => (
            <div
              key={item.path}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openWindow('finder', item.name, 'finder', { filePath: webosRoot, selectPath: item.path });
              }}
              title={item.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 8,
                borderRadius: 8,
                cursor: 'pointer',
                userSelect: 'none',
                width: 80,
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              {item.isDirectory ? <FolderIconSvg size={52} /> : <FileIconSvg name={item.name} size={52} />}
              <span style={{
                fontSize: 11,
                color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                textAlign: 'center',
                fontWeight: 500,
                maxWidth: 78,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{item.name}</span>
            </div>
          ))}
        </div>

        {/* Windows */}
        <WindowManager />
      </div>

      <Dock />

      {/* Overlays */}
      {contextMenu && <ContextMenu />}
      {showControlCenter && <ControlCenter />}
      {showSpotlight && <SpotlightSearch />}
      {showNotificationCenter && <NotificationCenter />}
      <NotificationToasts />
      {showWidgets && <WidgetPanel />}
      {needsSetup && <SetupWizard onComplete={handleSetupComplete} />}
    </div>
  );
};

export default Desktop;
