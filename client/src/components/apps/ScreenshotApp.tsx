import React, { useState } from 'react';
import { WindowState, useStore } from '../../store/useStore';

const ScreenshotApp: React.FC<{ window: WindowState }> = () => {
  const [capturing, setCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const { addNotification } = useStore();

  const captureScreen = async () => {
    setCapturing(true);
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      stream.getTracks().forEach((t: any) => t.stop());

      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
      addNotification({ title: 'Screenshot', message: 'Screenshot captured!', icon: 'screenshot', app: 'screenshot' });
    } catch {
      addNotification({ title: 'Screenshot', message: 'Cancelled or not supported', icon: 'screenshot', app: 'screenshot' });
    }
    setCapturing(false);
  };

  const downloadScreenshot = () => {
    if (!screenshot) return;
    const link = document.createElement('a');
    link.download = `Screenshot_${Date.now()}.png`;
    link.href = screenshot;
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0' }}>
      {screenshot ? (
        <>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <img src={screenshot} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: 16 }}>
            <button style={st.btn} onClick={() => setScreenshot(null)}>New Screenshot</button>
            <button style={{ ...st.btn, background: '#2563eb' }} onClick={downloadScreenshot}>Download</button>
            <button style={st.btn} onClick={() => navigator.clipboard.write?.([new ClipboardItem({ 'image/png': fetch(screenshot).then(r => r.blob()) })])}>
              Copy to Clipboard
            </button>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity="0.2">
            <rect x="14" y="14" width="36" height="36" rx="4" stroke="white" strokeWidth="2" strokeDasharray="8 4"/>
            <path d="M28 18L28 14L14 14L14 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M36 50L36 50L50 50L50 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 style={{ fontSize: 20, fontWeight: 500 }}>Screenshot</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>Capture your screen or a window</p>
          <button style={{ ...st.btn, padding: '12px 32px', fontSize: 15 }} onClick={captureScreen} disabled={capturing}>
            {capturing ? 'Capturing...' : 'Capture Screen'}
          </button>
        </div>
      )}
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  btn: { padding: '8px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 500 },
};

export default ScreenshotApp;
