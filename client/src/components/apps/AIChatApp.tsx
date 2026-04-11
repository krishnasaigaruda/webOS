import React from 'react';
import { WindowState } from '../../store/useStore';

const AIChatApp: React.FC<{ window: WindowState }> = () => {
  return (
    <iframe
      src="/repos/AI-Chatbot/index.html"
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="AI Assistant"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
    />
  );
};

export default AIChatApp;
