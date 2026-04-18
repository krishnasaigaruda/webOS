import React, { useEffect, useState, forwardRef } from 'react';
import { useStore } from '../../store/useStore';

interface Props {
  onIconsTap?: () => void;
}

const MobileStatusBar = forwardRef<HTMLDivElement, Props>(({ onIconsTap }, ref) => {
  const [now, setNow] = useState(new Date());
  const wifi = useStore(s => s.wifi);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div
      ref={ref}
      className="mobile-status-bar"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 'calc(env(safe-area-inset-top) + 32px)',
        paddingTop: 'env(safe-area-inset-top)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        zIndex: 100,
        // The whole bar passes touches through to the app below,
        // EXCEPT the icon area on the right, which opens Control Center.
        pointerEvents: 'none',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
      }}
    >
      <span style={{ pointerEvents: 'none' }}>{timeStr}</span>
      <div
        onClick={onIconsTap}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 8,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
      >
        {/* Wi-Fi icon */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ opacity: wifi ? 1 : 0.35 }}>
          <path d="M1 4a11 11 0 0114 0" />
          <path d="M3 6.5a8 8 0 0110 0" />
          <path d="M5 9a5 5 0 016 0" />
          <circle cx="8" cy="11" r="0.6" fill="currentColor" />
        </svg>
        {/* Battery */}
        <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1" y="2" width="17" height="8" rx="2" />
          <rect x="3" y="4" width="13" height="4" fill="currentColor" />
          <rect x="19" y="5" width="1.5" height="2" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
});

export default MobileStatusBar;
