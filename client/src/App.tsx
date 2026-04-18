import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { restoreState } from './store/useStore';
import LandingPage from './components/landing/LandingPage';
import Desktop from './components/desktop/Desktop';
import MobileApp from './components/mobile/MobileApp';
import { useDevice } from './hooks/useDeviceType';

function App() {
  const { isLoggedIn, theme, accentColor } = useStore();
  const [restored, setRestored] = useState(false);
  const device = useDevice();

  // Restore persisted state from IndexedDB on first load
  useEffect(() => {
    restoreState().then(() => setRestored(true)).catch(() => setRestored(true));
  }, []);

  // Apply accent color to CSS variable on the root
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-light', `rgba(${r}, ${g}, ${b}, 0.15)`);
    document.documentElement.style.setProperty('--sidebar-active', `rgba(${r}, ${g}, ${b}, 0.15)`);
  }, [accentColor]);

  // Show nothing until state is restored to prevent flicker
  if (!restored) {
    return <div style={{ width: '100%', height: '100%', background: '#000' }} />;
  }

  return (
    <div data-theme={theme} style={{ width: '100%', height: '100%' }}>
      {device === 'desktop'
        ? (isLoggedIn ? <Desktop /> : <LandingPage />)
        : <MobileApp />}
    </div>
  );
}

export default App;
