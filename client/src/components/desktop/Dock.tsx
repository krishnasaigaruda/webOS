import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getApp } from '../../utils/appRegistry';
import { AppIcon, TrashIcon } from '../../utils/icons';
import { motion } from 'framer-motion';

const Dock: React.FC = () => {
  const { dockApps, openWindow, windows, focusWindow, showContextMenu } = useStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleAppClick = (appId: string) => {
    const app = getApp(appId);
    if (!app) return;
    const existingWindow = windows.find(w => w.appId === appId && !w.isMinimized);
    if (existingWindow) { focusWindow(existingWindow.id); return; }
    const minimizedWindow = windows.find(w => w.appId === appId && w.isMinimized);
    if (minimizedWindow) { focusWindow(minimizedWindow.id); return; }
    openWindow(appId, app.name, app.icon, {
      width: app.defaultWidth, height: app.defaultHeight,
      minWidth: app.minWidth, minHeight: app.minHeight,
    });
  };

  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const app = getApp(appId);
    const appWindows = windows.filter(w => w.appId === appId);
    const menuHeight = (appWindows.length + 4) * 28 + 20;
    showContextMenu(e.clientX, e.clientY - menuHeight, [
      { label: app?.name || appId, disabled: true },
      { separator: true, label: '' },
      { label: 'New Window', action: () => {
        const a = getApp(appId);
        if (!a) return;
        openWindow(appId, a.name, a.icon, {
          width: a.defaultWidth, height: a.defaultHeight,
          minWidth: a.minWidth, minHeight: a.minHeight,
        });
      } },
      ...(appWindows.length > 0 ? [
        { separator: true, label: '' },
        ...appWindows.map(w => ({ label: w.title, action: () => focusWindow(w.id) })),
        { separator: true, label: '' },
        { label: 'Quit', action: () => appWindows.forEach(w => useStore.getState().closeWindow(w.id)) },
      ] : []),
    ]);
  };

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const d = Math.abs(index - hoveredIndex);
    if (d === 0) return 1.45;
    if (d === 1) return 1.25;
    if (d === 2) return 1.08;
    return 1;
  };
  const getY = (index: number) => {
    if (hoveredIndex === null) return 0;
    const d = Math.abs(index - hoveredIndex);
    if (d === 0) return -18;
    if (d === 1) return -10;
    if (d === 2) return -3;
    return 0;
  };

  return (
    <div style={styles.dockContainer}>
      <div style={styles.dock}>
        {dockApps.map((appId, index) => {
          const app = getApp(appId);
          if (!app) return null;
          const hasOpenWindows = windows.some(w => w.appId === appId);
          return (
            <div
              key={appId}
              style={styles.dockItemContainer}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <div style={styles.tooltip}>{app.name}</div>
              )}
              <motion.div
                animate={{ scale: getScale(index), y: getY(index) }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                style={styles.dockItem}
                onClick={() => handleAppClick(appId)}
                onContextMenu={(e) => handleContextMenu(e, appId)}
              >
                <AppIcon appId={appId} size={46} />
              </motion.div>
              {hasOpenWindows && <div style={styles.runningDot} />}
            </div>
          );
        })}

        <div style={styles.separator} />

        {/* Minimized windows */}
        {windows.filter(w => w.isMinimized).map(w => (
          <div key={w.id} style={styles.dockItemContainer}>
            <motion.div
              whileHover={{ scale: 1.3, y: -12 }}
              style={styles.dockItem}
              onClick={() => focusWindow(w.id)}
            >
              <AppIcon appId={w.appId} size={46} />
            </motion.div>
          </div>
        ))}

        <div style={styles.separator} />
        <div style={styles.dockItemContainer}>
          <motion.div whileHover={{ scale: 1.3, y: -12 }} style={styles.dockItem}
            onClick={async () => {
              const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
              if (r.root) openWindow('finder', 'Trash', 'finder', { filePath: `${r.root}/.webos-trash` });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              showContextMenu(e.clientX, e.clientY - 120, [
                { label: 'Open Trash', action: async () => {
                  const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
                  if (r.root) openWindow('finder', 'Trash', 'finder', { filePath: `${r.root}/.webos-trash` });
                } },
                { separator: true, label: '' },
                { label: 'Empty Trash...', action: async () => {
                  if (window.confirm('Are you sure you want to permanently erase the items in the webOS Trash? This only removes webOS items, not your Mac files.')) {
                    try {
                      await fetch('http://localhost:3001/api/fs/trash-empty', { method: 'POST' });
                      window.dispatchEvent(new CustomEvent('webos-fs-changed'));
                      useStore.getState().addNotification({ title: 'Trash', message: 'webOS Trash emptied', app: 'finder' });
                    } catch {}
                  }
                }},
              ]);
            }}>
            <TrashIcon size={46} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  dockContainer: {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
  },
  dock: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    padding: '4px 10px 6px',
    borderRadius: 20,
    background: 'var(--dock-bg)',
    backdropFilter: 'blur(50px) saturate(200%)',
    WebkitBackdropFilter: 'blur(50px) saturate(200%)',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
  },
  dockItemContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  dockItem: {
    width: 52,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    cursor: 'pointer',
  },
  tooltip: {
    position: 'absolute',
    top: -34,
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    padding: '4px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    border: '1px solid var(--border)',
    pointerEvents: 'none',
    zIndex: 10,
  },
  runningDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  separator: {
    width: 1,
    height: 40,
    background: 'rgba(255,255,255,0.15)',
    margin: '0 4px',
    alignSelf: 'center',
  },
};

export default Dock;
