import React, { useState, useRef, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';

const CameraApp: React.FC<{ window: WindowState }> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [photos, setPhotos] = useState<string[]>([]);
  const { addNotification } = useStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startCamera();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []); // eslint-disable-line

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: mode === 'video' });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setError('');
    } catch {
      setError('Camera access denied. Please allow camera access in your browser settings.');
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setPhoto(dataUrl);
    setPhotos(prev => [dataUrl, ...prev]);
    addNotification({ title: 'Camera', message: 'Photo captured!', icon: 'camera', app: 'camera' });
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Recording_${Date.now()}.webm`;
      a.click();
      addNotification({ title: 'Camera', message: 'Video saved!', icon: 'camera', app: 'camera' });
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const savePhoto = () => {
    if (!photo) return;
    const link = document.createElement('a');
    link.download = `Photo_${Date.now()}.png`;
    link.href = photo;
    link.click();
    addNotification({ title: 'Camera', message: 'Photo downloaded!', icon: 'camera', app: 'camera' });
  };

  const saveToDesktop = async () => {
    if (!photo) return;
    const base64 = photo.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const path = `/Users/krishna/Desktop/Photo_${Date.now()}.png`;
    try {
      await api.fs.write(path, photo);
      addNotification({ title: 'Camera', message: `Saved to Desktop`, icon: 'camera', app: 'camera' });
    } catch {}
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ height: '100%', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Mode switcher */}
      <div style={st.modeBar}>
        <button style={{ ...st.modeBtn, background: mode === 'photo' ? '#fff' : 'transparent', color: mode === 'photo' ? '#000' : '#fff' }}
          onClick={() => setMode('photo')}>Photo</button>
        <button style={{ ...st.modeBtn, background: mode === 'video' ? '#fff' : 'transparent', color: mode === 'video' ? '#000' : '#fff' }}
          onClick={() => setMode('video')}>Video</button>
      </div>

      {error ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity="0.3">
            <rect x="12" y="22" width="40" height="28" rx="4" stroke="white" strokeWidth="2"/>
            <circle cx="32" cy="36" r="10" stroke="white" strokeWidth="2"/>
          </svg>
          <p style={{ fontSize: 14 }}>{error}</p>
          <button style={st.actionBtn} onClick={startCamera}>Try Again</button>
        </div>
      ) : photo ? (
        <>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
            <img src={photo} alt="Captured" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
          </div>
          <div style={st.controls}>
            <button style={st.actionBtn} onClick={() => setPhoto(null)}>Retake</button>
            <button style={st.actionBtn} onClick={savePhoto}>Download</button>
            <button style={{ ...st.actionBtn, background: '#2563eb' }} onClick={saveToDesktop}>Save to Desktop</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, transform: 'scaleX(-1)' }} />
            {recording && (
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: '#FF3B30', animation: 'pulse 1s infinite' }} />
                <span style={{ color: '#fff', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
          <div style={st.controls}>
            {mode === 'photo' ? (
              <button style={st.captureBtn} onClick={takePhoto}>
                <div style={{ width: 60, height: 60, borderRadius: 30, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 25, background: '#fff' }} />
                </div>
              </button>
            ) : (
              <button style={st.captureBtn} onClick={recording ? stopRecording : startRecording}>
                <div style={{ width: 60, height: 60, borderRadius: 30, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {recording ? (
                    <div style={{ width: 24, height: 24, borderRadius: 4, background: '#FF3B30' }} />
                  ) : (
                    <div style={{ width: 50, height: 50, borderRadius: 25, background: '#FF3B30' }} />
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Photo strip */}
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 4, padding: '8px 12px', overflowX: 'auto', background: 'rgba(255,255,255,0.05)' }}>
              {photos.slice(0, 8).map((p, i) => (
                <img key={i} src={p} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                  onClick={() => setPhoto(p)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  modeBar: { display: 'flex', justifyContent: 'center', gap: 4, padding: '8px', background: 'rgba(255,255,255,0.06)' },
  modeBtn: { padding: '6px 20px', borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s' },
  controls: { display: 'flex', justifyContent: 'center', gap: 16, padding: 16, alignItems: 'center' },
  captureBtn: { cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 },
  actionBtn: { padding: '8px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, cursor: 'pointer', border: 'none', fontWeight: 500 },
};

export default CameraApp;
