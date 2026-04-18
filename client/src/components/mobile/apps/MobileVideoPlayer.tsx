import React, { useRef, useEffect, useState } from 'react';
import { WindowState } from '../../../store/useStore';

const MobileVideoPlayer: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  const url = win.filePath ? `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(win.filePath)}` : '';
  const name = win.filePath?.split('/').pop() || 'Video';

  useEffect(() => {
    if (!url) return;
    const v = videoRef.current;
    if (!v) return;
    const onError = () => setError('Could not load this video');
    v.addEventListener('error', onError);
    return () => v.removeEventListener('error', onError);
  }, [url]);

  if (!win.filePath) {
    return (
      <div style={centered}>
        <div style={{ marginBottom: 12, opacity: 0.4 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9l5 3-5 3z"/></svg></div>
        <div style={{ fontSize: 15, color: '#fff' }}>No video selected</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Open a video from Files or Photos</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {error ? (
        <div style={centered}>
          <div style={{ marginBottom: 12, opacity: 0.4 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <div style={{ fontSize: 15, color: '#fff' }}>{error}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{name}</div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={url}
          controls
          playsInline
          autoPlay
          style={{ width: '100%', maxHeight: '100%', background: '#000' }}
        />
      )}
    </div>
  );
};

const centered: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#000',
  padding: 24,
  textAlign: 'center',
};

export default MobileVideoPlayer;
