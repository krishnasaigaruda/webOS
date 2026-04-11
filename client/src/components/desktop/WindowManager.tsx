import React from 'react';
import { useStore } from '../../store/useStore';
import Window from './Window';
import AppRenderer from '../apps/AppRenderer';

const WindowManager: React.FC = () => {
  const { windows, currentDesktop } = useStore();

  const visibleWindows = windows.filter(
    w => w.desktop === currentDesktop && !w.isMinimized
  );

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {visibleWindows.map(win => (
        <Window key={win.id} window={win}>
          <AppRenderer window={win} />
        </Window>
      ))}
    </div>
  );
};

export default WindowManager;
