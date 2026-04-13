import React from 'react';
import { WindowState } from '../../store/useStore';

const PresentationApp: React.FC<{ window: WindowState }> = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#e2e8f0', padding: 40, gap: 16, textAlign: 'center' }}>
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6">
        <rect x="3" y="4" width="18" height="14" rx="2"/>
        <path d="M9 8v6l6-3z"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
      </svg>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>Presentation Viewer</h2>
      <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 400 }}>
        You cannot open a presentation in webOS. Presentation files are not supported in this version.
      </p>
    </div>
  );
};

export default PresentationApp;
