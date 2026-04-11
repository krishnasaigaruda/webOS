import React from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const PresentationApp: React.FC<{ window: WindowState }> = ({ window: win }) => (
  <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/presentation.html" />
);

export default PresentationApp;
