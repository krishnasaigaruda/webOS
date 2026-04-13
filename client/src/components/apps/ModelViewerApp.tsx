import React, { useRef, useEffect, useState } from 'react';
import { WindowState } from '../../store/useStore';

// Use model-viewer web component via script injection (loads on demand)
const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';

let scriptLoaded = false;
function loadModelViewer(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded || document.querySelector(`script[src="${MODEL_VIEWER_SRC}"]`)) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = MODEL_VIEWER_SRC;
    script.onload = () => { scriptLoaded = true; resolve(); };
    document.head.appendChild(script);
  });
}

const ModelViewerApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [ready, setReady] = useState(false);
  const [error] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadModelViewer().then(() => setReady(true));
  }, []);

  if (!win.filePath) {
    return (
      <div style={{ height: '100%', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', color: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M40 10L70 25v30L40 70L10 55V25z"/>
          <path d="M40 10L40 40L70 25"/>
          <path d="M40 40L10 25"/>
          <path d="M40 40L40 70"/>
        </svg>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>3D Model Viewer</h2>
        <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', maxWidth: 360 }}>
          Open a 3D model file from Finder to view it here. Supported formats:
          <br /><code style={{ color: '#a5b4fc', fontSize: 12 }}>.glb .gltf .obj .stl .fbx</code>
        </p>
      </div>
    );
  }

  const url = `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(win.filePath)}`;
  const ext = win.filePath.split('.').pop()?.toLowerCase() || '';
  const fileName = win.filePath.split('/').pop() || 'Model';

  // model-viewer supports glb/gltf natively. For obj/stl/fbx we show a message.
  const supported = ext === 'glb' || ext === 'gltf';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L22 7v10l-10 5-10-5V7z"/>
          <path d="M12 2v10l10 5"/>
          <path d="M12 12l-10 5"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', flex: 1 }}>{fileName}</span>
        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', background: '#334155', padding: '2px 8px', borderRadius: 4 }}>{ext}</span>
      </div>

      <div ref={containerRef} style={{ flex: 1, position: 'relative', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        {!ready ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Loading 3D viewer...
          </div>
        ) : error ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            {error}
          </div>
        ) : supported ? (
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{
            __html: `<model-viewer src="${url}" auto-rotate camera-controls shadow-intensity="1" style="width:100%;height:100%;background:linear-gradient(135deg,#1e293b,#0f172a)" environment-image="neutral"></model-viewer>`
          }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 80 80" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <path d="M40 10L70 25v30L40 70L10 55V25z"/>
              <path d="M40 10L40 40L70 25"/>
              <path d="M40 40L10 25"/>
              <path d="M40 40L40 70"/>
            </svg>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>.{ext} format</div>
              <div style={{ fontSize: 13, color: '#64748b', maxWidth: 380 }}>
                This viewer currently supports <strong style={{ color: '#a5b4fc' }}>.glb</strong> and <strong style={{ color: '#a5b4fc' }}>.gltf</strong> files.
                To view {ext.toUpperCase()} files, convert them to glTF first.
              </div>
            </div>
            <a href={url} download={fileName} style={{ marginTop: 8, padding: '8px 20px', borderRadius: 8, background: '#6366f1', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              Download File
            </a>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div style={{ display: 'flex', gap: 16, padding: '6px 16px', fontSize: 11, color: '#64748b', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
        <span>Drag to rotate · Scroll to zoom · Right-click to pan</span>
        <span style={{ marginLeft: 'auto' }}>Powered by model-viewer</span>
      </div>
    </div>
  );
};

export default ModelViewerApp;
