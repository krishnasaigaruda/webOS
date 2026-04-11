import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import LandingPage from './components/landing/LandingPage';
import Desktop from './components/desktop/Desktop';

function App() {
  const { isLoggedIn, theme, accentColor } = useStore();

  // Apply accent color to CSS variable on the root
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    // Generate lighter version for hover/active states
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-light', `rgba(${r}, ${g}, ${b}, 0.15)`);
    document.documentElement.style.setProperty('--sidebar-active', `rgba(${r}, ${g}, ${b}, 0.15)`);
  }, [accentColor]);

  return (
    <div data-theme={theme} style={{ width: '100%', height: '100%' }}>
      {isLoggedIn ? <Desktop /> : <LandingPage />}
    </div>
  );
}

export default App;
