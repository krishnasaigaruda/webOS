import React from 'react';
import { WindowState } from '../../store/useStore';

const UniversalPreviewApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  let src = '/repos/UniversalPreviewSource/index.html';

  // If opened with a file path, pass it as a query param so the app auto-loads it
  if (win.filePath) {
    const fileUrl = `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(win.filePath)}`;
    const fileName = win.filePath.split('/').pop() || 'file';
    src += `?fileUrl=${encodeURIComponent(fileUrl)}&fileName=${encodeURIComponent(fileName)}`;
  }

  return (
    <iframe
      src={src}
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="Universal Preview"
      allow="clipboard-read; clipboard-write"
    />
  );
};

export default UniversalPreviewApp;
