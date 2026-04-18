import React from 'react';
import { WindowState } from '../../store/useStore';
import AppRenderer from '../apps/AppRenderer';
import MobileErrorBoundary from './MobileErrorBoundary';

// Mobile-native replacements for apps that don't translate well from desktop.
import MobileFiles from './apps/MobileFiles';
import MobileSettings from './apps/MobileSettings';
import MobileNotes from './apps/MobileNotes';
import MobileToDo from './apps/MobileToDo';
import MobileCalculator from './apps/MobileCalculator';
import MobilePhotos from './apps/MobilePhotos';
import MobileVideoPlayer from './apps/MobileVideoPlayer';
import MobileMusic from './apps/MobileMusic';
import MobileReminders from './apps/MobileReminders';
import MobileClock from './apps/MobileClock';
import MobileWeather from './apps/MobileWeather';
import MobileTextEdit from './apps/MobileTextEdit';
import MobileTimer from './apps/MobileTimer';
import MobileHelp from './apps/MobileHelp';
import MobileAppStore from './apps/MobileAppStore';

// Apps for which we have a mobile-specific implementation.
// Any app not in this map falls back to the shared desktop AppRenderer.
const MOBILE_OVERRIDES: Record<string, React.FC<{ window: WindowState }>> = {
  'finder': MobileFiles,
  'settings': MobileSettings,
  'notes': MobileNotes,
  'todo': MobileToDo,
  'calculator': MobileCalculator,
  'photos': MobilePhotos,
  'video-player': MobileVideoPlayer,
  'music': MobileMusic,
  'reminders': MobileReminders,
  'clock': MobileClock,
  'weather': MobileWeather,
  'textedit': MobileTextEdit,
  'timer': MobileTimer,
  'help': MobileHelp,
  'app-store': MobileAppStore,
};

const MobileAppRenderer: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const Override = MOBILE_OVERRIDES[win.appId];
  // Every app is wrapped in its own error boundary so a crash in one app
  // doesn't take down the whole mobile shell.
  return (
    <MobileErrorBoundary appName={win.title} key={win.id}>
      {Override ? <Override window={win} /> : <AppRenderer window={win} />}
    </MobileErrorBoundary>
  );
};

export default MobileAppRenderer;
