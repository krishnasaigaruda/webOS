import React, { useRef, useState } from 'react';
import { WindowState } from '../../store/useStore';

const HOME = 'https://www.google.com/webhp?igu=1';

const BrowserApp: React.FC<{ window: WindowState }> = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState(HOME);

  const goBack = () => {
    try { iframeRef.current?.contentWindow?.history.back(); } catch {}
  };
  const goForward = () => {
    try { iframeRef.current?.contentWindow?.history.forward(); } catch {}
  };
  const reload = () => {
    setSrc('about:blank');
    setTimeout(() => setSrc(HOME), 50);
  };

  const btn: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#e2e8f0', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <button style={btn} onClick={goBack} title="Back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <button style={btn} onClick={goForward} title="Forward">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <button style={btn} onClick={reload} title="Reload">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 7a6 6 0 10-6 6v-2l-3 3 3 3v-2"/></svg>
        </button>
      </div>
      <iframe
        ref={iframeRef}
        src={src}
        style={{ flex: 1, width: '100%', border: 'none', display: 'block', background: '#fff' }}
        title="Browser"
      />
    </div>
  );
};

export default BrowserApp;
