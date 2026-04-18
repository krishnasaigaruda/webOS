import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import HomeScreen from './HomeScreen';
import AppView from './AppView';
import MobileStatusBar from './MobileStatusBar';
import MobileControlCenter from './MobileControlCenter';
import { useSwipeDown } from './gestures/useSwipeDown';
import { isMobileAllowedApp } from './mobileAppRegistry';
import MobileSetupWizard from './MobileSetupWizard';
import NotificationToasts from '../system/NotificationToasts';

const MobileShell: React.FC = () => {
  const windows = useStore(s => s.windows);
  const justLoggedIn = useStore(s => s.justLoggedIn);
  const clearJustLoggedIn = useStore(s => s.clearJustLoggedIn);
  const closeWindow = useStore(s => s.closeWindow);

  const [needsSetup, setNeedsSetup] = useState(justLoggedIn);
  const [ccOpen, setCcOpen] = useState(false);
  const statusBarRef = useRef<HTMLDivElement>(null);

  // Swipe down from the status bar area → open control center
  useSwipeDown(statusBarRef, () => setCcOpen(true));

  useEffect(() => {
    if (justLoggedIn) setNeedsSetup(true);
  }, [justLoggedIn]);

  // Auto-close any window that isn't allowed on mobile (defensive)
  useEffect(() => {
    for (const w of windows) {
      if (!isMobileAllowedApp(w.appId)) closeWindow(w.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows.length]);

  // The single active app on mobile = topmost non-minimized window
  const active = [...windows].reverse().find(w => !w.isMinimized && isMobileAllowedApp(w.appId)) || null;

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    clearJustLoggedIn();
  };

  if (needsSetup) {
    return <MobileSetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <>
      {/* Status bar is always visible over everything. Only the icons on the
          right trigger Control Center; the rest of the bar passes touches through. */}
      <MobileStatusBar ref={statusBarRef} onIconsTap={() => setCcOpen(true)} />

      {/* Home or active app */}
      {active ? <AppView window={active} /> : <HomeScreen />}

      {/* Control center overlay */}
      <MobileControlCenter open={ccOpen} onClose={() => setCcOpen(false)} />
      <NotificationToasts />
    </>
  );
};

export default MobileShell;
