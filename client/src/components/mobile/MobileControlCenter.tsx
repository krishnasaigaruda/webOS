import React from 'react';
import { useStore } from '../../store/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const MobileControlCenter: React.FC<Props> = ({ open, onClose }) => {
  const {
    doNotDisturb, toggleDoNotDisturb,
    theme, toggleTheme, logout,
  } = useStore();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: open ? 'rgba(0,0,0,0.5)' : 'transparent',
        backdropFilter: open ? 'blur(30px)' : 'none',
        WebkitBackdropFilter: open ? 'blur(30px)' : 'none',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'background 0.25s, backdrop-filter 0.25s',
        zIndex: 200,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          padding: 'calc(env(safe-area-inset-top) + 20px) 16px 24px',
          transform: open ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.33, 1, 0.68, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Tile active={doNotDisturb} label="Do Not Disturb" sub={doNotDisturb ? 'On — notifications silenced' : 'Off'} onClick={toggleDoNotDisturb} />
        <Tile active={theme === 'dark'} label="Dark Mode" sub={theme === 'dark' ? 'On' : 'Off'} onClick={toggleTheme} />

        <button
          onClick={() => { logout(); onClose(); }}
          style={{
            padding: '14px',
            borderRadius: 14,
            background: 'rgba(239, 68, 68, 0.85)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Tile: React.FC<{ active: boolean; label: string; sub: string; onClick: () => void }> = ({ active, label, sub, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '18px 20px',
      borderRadius: 18,
      background: active ? 'rgba(59, 130, 246, 0.9)' : 'rgba(255,255,255,0.12)',
      color: '#fff',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 4,
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
    }}
  >
    <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
    <span style={{ fontSize: 12, opacity: 0.85 }}>{sub}</span>
  </button>
);

export default MobileControlCenter;
