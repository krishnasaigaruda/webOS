import React, { useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useStore, WindowState } from '../../store/useStore';
import { motion } from 'framer-motion';
import { AppIcon } from '../../utils/icons';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ window: win, children }) => {
  const {
    closeWindow, minimizeWindow, maximizeWindow, restoreWindow,
    focusWindow, updateWindow, showContextMenu
  } = useStore();

  const handleFocus = useCallback(() => {
    if (!win.isActive) focusWindow(win.id);
  }, [win.id, win.isActive, focusWindow]);

  const handleTitleBarDoubleClick = useCallback(() => {
    if (win.isMaximized) {
      restoreWindow(win.id);
    } else {
      maximizeWindow(win.id);
    }
  }, [win.id, win.isMaximized, maximizeWindow, restoreWindow]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, [
      { label: 'Close', action: () => closeWindow(win.id), shortcut: '⌘W' },
      { label: 'Minimize', action: () => minimizeWindow(win.id), shortcut: '⌘M' },
      { label: win.isMaximized ? 'Restore' : 'Maximize', action: () => win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id) },
      { separator: true, label: '' },
      { label: 'Move to Desktop 1', action: () => updateWindow(win.id, { desktop: 0 }) },
      { label: 'Move to Desktop 2', action: () => updateWindow(win.id, { desktop: 1 }) },
      { label: 'Move to Desktop 3', action: () => updateWindow(win.id, { desktop: 2 }) },
    ]);
  };

  const maximized = win.isMaximized;

  // NOTE: We always render the SAME Rnd element tree, switching it into a
  // "filled" mode when maximized rather than returning a different element.
  // Returning a structurally different tree on maximize would unmount and
  // remount `children` (the app), destroying its local React state — which
  // is what caused chat/app progress to be lost on fullscreen toggle.
  return (
    <Rnd
      size={maximized ? { width: '100%', height: '100%' } : { width: win.width, height: win.height }}
      position={maximized ? { x: 0, y: 0 } : { x: win.x, y: win.y }}
      minWidth={win.minWidth || 400}
      minHeight={win.minHeight || 300}
      bounds="parent"
      dragHandleClassName="window-titlebar"
      style={{ zIndex: win.zIndex, pointerEvents: 'auto' }}
      disableDragging={maximized}
      onMouseDown={handleFocus}
      onDragStop={(e, d) => updateWindow(win.id, { x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) => {
        updateWindow(win.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: pos.x,
          y: pos.y,
        });
      }}
      enableResizing={maximized ? false : {
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--window-bg)',
          borderRadius: maximized ? 0 : 'var(--window-radius)',
          boxShadow: maximized
            ? 'none'
            : win.isActive
              ? '0 20px 60px rgba(0,0,0,0.35), 0 0 0 0.5px var(--border)'
              : '0 10px 30px rgba(0,0,0,0.2), 0 0 0 0.5px var(--border)',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <TitleBar
          win={win}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximized ? restoreWindow(win.id) : maximizeWindow(win.id)}
          onDoubleClick={handleTitleBarDoubleClick}
          onContextMenu={handleContextMenu}
          isMaximized={maximized}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
      </motion.div>
    </Rnd>
  );
};

interface TitleBarProps {
  win: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isMaximized?: boolean;
}

const TitleBar: React.FC<TitleBarProps> = ({
  win, onClose, onMinimize, onMaximize, onDoubleClick, onContextMenu, isMaximized
}) => {
  const [showButtons, setShowButtons] = React.useState(false);

  return (
    <div
      className="window-titlebar"
      style={{
        height: 38,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        background: win.isActive ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border)',
        userSelect: 'none',
        cursor: 'default',
        flexShrink: 0,
        gap: 8,
      }}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {/* Traffic lights */}
      <div
        style={{ display: 'flex', gap: 6, alignItems: 'center' }}
        onMouseEnter={() => setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            ...trafficLight,
            background: win.isActive ? '#FF5F56' : 'var(--text-tertiary)',
          }}
        >
          {showButtons && <span style={trafficIcon}>✕</span>}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          style={{
            ...trafficLight,
            background: win.isActive ? '#FFBD2E' : 'var(--text-tertiary)',
          }}
        >
          {showButtons && <span style={trafficIcon}>−</span>}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMaximize(); }}
          style={{
            ...trafficLight,
            background: win.isActive ? '#27C93F' : 'var(--text-tertiary)',
          }}
        >
          {showButtons && <span style={trafficIcon}>⤢</span>}
        </button>
      </div>

      {/* Title */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 500,
        color: win.isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        <span style={{ marginRight: 6, display: 'inline-flex', verticalAlign: 'middle' }}><AppIcon appId={win.appId} size={16} /></span>
        {win.title}
      </div>

      {/* Spacer to center title */}
      <div style={{ width: 52 }} />
    </div>
  );
};

const trafficLight: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  position: 'relative',
};

const trafficIcon: React.CSSProperties = {
  fontSize: 8,
  fontWeight: 700,
  color: 'rgba(0,0,0,0.5)',
  lineHeight: 1,
};

export default Window;
