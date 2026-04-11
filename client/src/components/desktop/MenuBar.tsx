import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { WebOSLogo } from '../../utils/icons';

const MenuBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const {
    toggleControlCenter, toggleNotificationCenter, toggleSpotlight,
    wifi, doNotDisturb, volume, currentUser, logout,
    openWindow, windows, showContextMenu, closeWindow,
    minimizeWindow, maximizeWindow, toggleTheme, theme,
  } = useStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeWindow = windows.find(w => w.isActive);
  const activeAppName = activeWindow?.title?.split(' - ')[0] || 'Finder';

  const handleAppleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    showContextMenu(e.currentTarget.getBoundingClientRect().left, 28, [
      { label: 'About This webOS', action: () => openWindow('settings', 'About webOS', 'settings', { filePath: 'about' }) },
      { separator: true, label: '' },
      { label: 'System Settings...', action: () => openWindow('settings', 'Settings', 'settings'), shortcut: '\u2318,' },
      { label: 'App Store...', action: () => openWindow('app-store', 'App Store', 'app-store') },
      { separator: true, label: '' },
      { label: 'Lock Screen', action: () => logout(), shortcut: '\u2303\u2318Q' },
      { label: `Sign Out ${currentUser?.name || 'User'}...`, action: () => logout(), shortcut: '\u21E7\u2318Q' },
    ]);
  };

  const handleFileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    showContextMenu(e.currentTarget.getBoundingClientRect().left, 28, [
      { label: 'New Window', action: () => {
        const aw = windows.find(w => w.isActive);
        if (aw) openWindow(aw.appId, aw.title, aw.appId);
        else openWindow('finder', 'Finder', 'finder');
      }, shortcut: '\u2318N' },
      { label: 'New File', action: () => openWindow('textedit', 'Untitled', 'textedit'), shortcut: '\u21E7\u2318N' },
      { separator: true, label: '' },
      { label: 'Open...', action: () => openWindow('finder', 'Open', 'finder'), shortcut: '\u2318O' },
      { label: 'Open With', submenu: [
        { label: 'TextEdit', action: () => openWindow('textedit', 'TextEdit', 'textedit') },
        { label: 'Code Editor', action: () => openWindow('code-editor', 'Code Editor', 'code-editor') },
        { label: 'Universal Preview', action: () => openWindow('universal-preview', 'Universal Preview', 'universal-preview') },
      ]},
      { separator: true, label: '' },
      { label: 'Close Window', action: () => { if (activeWindow) closeWindow(activeWindow.id); }, shortcut: '\u2318W' },
    ]);
  };

  const handleEditMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    showContextMenu(e.currentTarget.getBoundingClientRect().left, 28, [
      { label: 'Undo', action: () => document.execCommand('undo'), shortcut: '\u2318Z' },
      { label: 'Redo', action: () => document.execCommand('redo'), shortcut: '\u21E7\u2318Z' },
      { separator: true, label: '' },
      { label: 'Cut', action: () => document.execCommand('cut'), shortcut: '\u2318X' },
      { label: 'Copy', action: () => document.execCommand('copy'), shortcut: '\u2318C' },
      { label: 'Paste', action: () => document.execCommand('paste'), shortcut: '\u2318V' },
      { label: 'Select All', action: () => document.execCommand('selectAll'), shortcut: '\u2318A' },
      { separator: true, label: '' },
      { label: 'Find...', action: () => {}, shortcut: '\u2318F' },
    ]);
  };

  const handleViewMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    showContextMenu(e.currentTarget.getBoundingClientRect().left, 28, [
      { label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', action: () => toggleTheme() },
      { separator: true, label: '' },
      { label: 'Show Toolbar', action: () => {} },
      { label: 'Show Sidebar', action: () => {} },
      { separator: true, label: '' },
      { label: 'Enter Full Screen', action: () => { document.documentElement.requestFullscreen?.(); } },
      { label: 'Exit Full Screen', action: () => { document.exitFullscreen?.(); } },
    ]);
  };

  const handleGoMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    showContextMenu(e.currentTarget.getBoundingClientRect().left, 28, [
      { label: 'Home', action: () => openWindow('finder', 'Home', 'finder', { filePath: '/Users/krishna' }) },
      { label: 'Desktop', action: () => openWindow('finder', 'Desktop', 'finder', { filePath: '/Users/krishna/Desktop' }) },
      { label: 'Documents', action: () => openWindow('finder', 'Documents', 'finder', { filePath: '/Users/krishna/Documents' }) },
      { label: 'Downloads', action: () => openWindow('finder', 'Downloads', 'finder', { filePath: '/Users/krishna/Downloads' }) },
      { label: 'Applications', action: () => openWindow('finder', 'Applications', 'finder', { filePath: '/Applications' }) },
      { separator: true, label: '' },
      { label: 'Computer', action: () => openWindow('finder', '/', 'finder', { filePath: '/' }) },
    ]);
  };

  const handleWindowMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const items: any[] = [
      { label: 'Minimize', action: () => { if (activeWindow) minimizeWindow(activeWindow.id); }, shortcut: '\u2318M' },
      { label: 'Zoom', action: () => { if (activeWindow) maximizeWindow(activeWindow.id); } },
      { separator: true, label: '' },
      { label: 'Close All', action: () => { windows.forEach(w => closeWindow(w.id)); } },
    ];
    if (windows.length > 0) {
      items.push({ separator: true, label: '' });
      windows.forEach(w => {
        items.push({ label: `${w.isActive ? '\u2713 ' : '  '}${w.title}`, action: () => useStore.getState().focusWindow(w.id) });
      });
    }
    showContextMenu(e.currentTarget.getBoundingClientRect().left, 28, items);
  };

  const handleHelpMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    showContextMenu(e.currentTarget.getBoundingClientRect().left, 28, [
      { label: 'webOS Help', action: () => openWindow('settings', 'Help', 'settings', { filePath: 'about' }) },
      { separator: true, label: '' },
      { label: 'About webOS', action: () => openWindow('settings', 'About webOS', 'settings', { filePath: 'about' }) },
    ]);
  };

  return (
    <div style={styles.menuBar}>
      <div style={styles.left}>
        <button style={styles.appleBtn} onClick={handleAppleMenu}>
          <WebOSLogo size={18} />
        </button>
        <button style={styles.menuItem} onClick={handleFileMenu}><strong>{activeAppName}</strong></button>
        <button style={styles.menuItem} onClick={handleFileMenu}>File</button>
        <button style={styles.menuItem} onClick={handleEditMenu}>Edit</button>
        <button style={styles.menuItem} onClick={handleViewMenu}>View</button>
        <button style={styles.menuItem} onClick={handleGoMenu}>Go</button>
        <button style={styles.menuItem} onClick={handleWindowMenu}>Window</button>
        <button style={styles.menuItem} onClick={handleHelpMenu}>Help</button>
      </div>

      <div style={styles.right}>
        {doNotDisturb && <span style={styles.statusIcon}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5"/></svg>
        </span>}
        <button style={styles.statusIcon}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
            {wifi ? (
              <path d="M8 12a1 1 0 100 2 1 1 0 000-2zM1.8 6.2a8.5 8.5 0 0112.4 0l-.9.9a7 7 0 00-10.6 0l-.9-.9zM4 8.4a5.5 5.5 0 018 0l-.9.9a4 4 0 00-6.2 0L4 8.4zM6.2 10.6a2.5 2.5 0 013.6 0l-.9.9a1 1 0 00-1.8 0l-.9-.9z"/>
            ) : (
              <path d="M8 13a1 1 0 100-2 1 1 0 000 2zM1 7l1 1a8 8 0 0112 0l1-1A10 10 0 001 7z" opacity="0.3"/>
            )}
          </svg>
        </button>
        <button style={styles.statusIcon} onClick={toggleControlCenter}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
            <rect x="2" y="2" width="5" height="5" rx="1.5"/><rect x="9" y="2" width="5" height="5" rx="1.5"/><rect x="2" y="9" width="5" height="5" rx="1.5"/><rect x="9" y="9" width="5" height="5" rx="1.5"/>
          </svg>
        </button>
        <button style={styles.statusIcon}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
            {volume > 0 ? (
              <><path d="M2 6v4h3l4 3V3L5 6H2z"/><path d="M11 4.5c1.3 1 2 2.2 2 3.5s-.7 2.5-2 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>
            ) : (
              <><path d="M2 6v4h3l4 3V3L5 6H2z"/><line x1="12" y1="5" x2="15" y2="11" stroke="currentColor" strokeWidth="1.2"/><line x1="15" y1="5" x2="12" y2="11" stroke="currentColor" strokeWidth="1.2"/></>
            )}
          </svg>
        </button>
        <button style={styles.statusIcon} onClick={toggleSpotlight}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8">
            <circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14" strokeLinecap="round"/>
          </svg>
        </button>
        <button style={styles.dateTime} onClick={toggleNotificationCenter}>
          {format(time, 'EEE MMM d')}  {format(time, 'h:mm a')}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  menuBar: {
    height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 8px', background: 'var(--menubar-bg)',
    backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)',
    borderBottom: '0.5px solid rgba(0,0,0,0.15)', fontSize: 13, fontWeight: 400,
    zIndex: 9999, userSelect: 'none', flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: 0 },
  right: { display: 'flex', alignItems: 'center', gap: 2 },
  appleBtn: { padding: '2px 10px', borderRadius: 4, display: 'flex', alignItems: 'center' },
  menuItem: { padding: '2px 10px', borderRadius: 4, fontSize: 13, lineHeight: '24px', color: 'var(--text-primary)' },
  statusIcon: { padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' },
  dateTime: { padding: '2px 10px', borderRadius: 4, fontSize: 13, color: 'var(--text-primary)', lineHeight: '24px', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' },
};

export default MenuBar;
