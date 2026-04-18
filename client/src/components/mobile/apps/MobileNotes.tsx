import React from 'react';
import { WindowState } from '../../../store/useStore';
import ToolsIframeApp from '../../apps/ToolsIframeApp';

const MobileNotes: React.FC<{ window: WindowState }> = ({ window: win }) => {
  return <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/notes.html" />;
};

export default MobileNotes;
