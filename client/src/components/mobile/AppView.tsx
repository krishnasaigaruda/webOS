import React from 'react';
import { useStore, WindowState } from '../../store/useStore';
import MobileAppRenderer from './MobileAppRenderer';

interface Props {
  window: WindowState;
}

const AppView: React.FC<Props> = ({ window: win }) => {
  const closeWindow = useStore(s => s.closeWindow);

  const handleBack = () => {
    closeWindow(win.id);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--window-content, #0f172a)',
        zIndex: 50,
      }}
    >
      {/* App content — fills the entire view */}
      <div
        className="mobile-app-host"
        style={{
          position: 'absolute',
          inset: 0,
          paddingTop: 'calc(env(safe-area-inset-top) + 50px)',
          overflow: 'hidden',
        }}
      >
        <MobileAppRenderer window={win} />
      </div>

      {/* Floating back button — no bar, no title, just a chip overlay */}
      <button
        onClick={handleBack}
        aria-label="Back"
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 8px)',
          left: 12,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3L5 9l7 6" />
        </svg>
      </button>
    </div>
  );
};

export default AppView;
