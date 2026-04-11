import React from 'react';
import { WindowState } from '../../store/useStore';

const DataAnalyzerApp: React.FC<{ window: WindowState }> = () => {
  return (
    <iframe
      src="/repos/DataAnalyzer/index.html"
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="Data Analyzer"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
    />
  );
};

export default DataAnalyzerApp;
