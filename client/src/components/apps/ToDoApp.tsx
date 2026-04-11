import React from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const ToDoApp: React.FC<{ window: WindowState }> = ({ window: win }) => (
  <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/todo.html" />
);

export default ToDoApp;
