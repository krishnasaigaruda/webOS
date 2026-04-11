import React from 'react';
import { WindowState } from '../../store/useStore';

const ToolsHubApp: React.FC<{ window: WindowState }> = () => {
  return (
    <iframe
      src="/repos/Tools-Hub/Tools.html"
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="Tools Hub"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
    />
  );
};

export default ToolsHubApp;
