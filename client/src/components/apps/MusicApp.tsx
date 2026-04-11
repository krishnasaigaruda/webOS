import React from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const MusicApp: React.FC<{ window: WindowState }> = ({ window: win }) => (
  <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/music-player.html" />
);

export default MusicApp;
