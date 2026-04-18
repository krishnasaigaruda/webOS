import React, { useState, useEffect } from 'react';
import { WindowState } from '../../../store/useStore';

const MobileClock: React.FC<{ window: WindowState }> = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ height: '100%', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 72, fontWeight: 200, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>{time}</div>
      <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>{date}</div>
    </div>
  );
};

export default MobileClock;
