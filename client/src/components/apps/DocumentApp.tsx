import React from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const DocumentApp: React.FC<{ window: WindowState }> = ({ window: win }) => (
  <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/document.html" />
);

export default DocumentApp;
