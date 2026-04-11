import React from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const ClockApp: React.FC<{ window: WindowState }> = ({ window: win }) => (
  <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/clock.html" />
);

export default ClockApp;
