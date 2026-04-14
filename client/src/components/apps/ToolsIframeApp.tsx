import React, { useRef, useEffect } from 'react';
import { WindowState } from '../../store/useStore';

interface Props {
  window: WindowState;
  src: string;
  hideHeader?: boolean;
}

const ToolsIframeApp: React.FC<Props> = ({ src, hideHeader = true }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!hideHeader) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const injectCSS = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const style = doc.createElement('style');
        style.textContent = `
          .header, .toolbar-header, nav.header, header, .hdr, .top-bar, .topbar, .app-header {
            display: none !important;
          }
          body {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          .app, main, .main, .content {
            top: 0 !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
            height: 100vh !important;
          }
        `;
        doc.head.appendChild(style);
      } catch {
        // Cross-origin, can't inject - use offset fallback
      }
    };

    iframe.addEventListener('load', injectCSS);
    return () => iframe.removeEventListener('load', injectCSS);
  }, [hideHeader]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src={src}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="App"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads"
      />
    </div>
  );
};

export default ToolsIframeApp;
