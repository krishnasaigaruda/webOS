import React from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const UniversalPreviewApp: React.FC<{ window: WindowState }> = ({ window: win }) => (
  <ToolsIframeApp window={win} src="/repos/UniversalPreview/index.html" hideHeader={false} />
);

export default UniversalPreviewApp;
