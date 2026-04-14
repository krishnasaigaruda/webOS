import React, { useState, useRef, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';

const CameraApp: React.FC<{ window: WindowState }> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRecordCanvasRef = useRef<HTMLCanvasElement>(null);
  const recordRafRef = useRef<number | null>(null);
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
  const cameraAccess = useStore(s => s.cameraAccess);
  const microphoneAccess = useStore(s => s.microphoneAccess);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cameraAccess) {
      startCamera();
    } else {
      // Camera access was revoked — stop any existing stream and show error
      stream?.getTracks().forEach(t => t.stop());
      setStream(null);
      setError('Camera access is disabled. Turn it on in Settings → Privacy & Security.');
    }
    return () => { stream?.getTracks().forEach(t => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraAccess, microphoneAccess]);

  // Reattach stream whenever the video element remounts (e.g. after Retake)
  useEffect(() => {
    if (!photo && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [photo, stream]);

  const startCamera = async () => {
    if (!cameraAccess) {
      setError('Camera access is disabled. Turn it on in Settings → Privacy & Security.');
      return;
    }
    try {
      // Request audio only if microphone access is allowed
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: microphoneAccess,
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setError('');
    } catch {
      setError('Camera access denied. Please allow camera and microphone access in your browser settings.');
    }
  };

  const getWebosRoot = async (): Promise<string> => {
    const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
    if (!r.root) throw new Error('webOS folder not configured');
    return r.root;
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Mirror the captured image so it matches the live preview (selfie-natural)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setPhoto(dataUrl);
    setPhotos(prev => [dataUrl, ...prev]);
  };

  const savePhotoToCameraRoll = async () => {
    if (!photo) return;
    try {
      const root = await getWebosRoot();
      const targetPath = `${root}/Camera Roll/Photo_${Date.now()}.png`;
      await api.fs.writeBinary(targetPath, photo);
      addNotification({ title: 'Camera', message: 'Saved to Camera Roll', icon: 'camera', app: 'camera' });
      setPhoto(null);
    } catch (e: any) {
      addNotification({ title: 'Camera', message: `Save failed: ${e.message}`, icon: 'camera', app: 'camera' });
    }
  };

  const startRecording = () => {
    if (!stream || !videoRef.current || !liveRecordCanvasRef.current) return;
    chunksRef.current = [];
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    // Draw the live video mirrored onto the visible canvas every frame
    const canvas = liveRecordCanvasRef.current;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const drawFrame = () => {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      recordRafRef.current = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    // Build a combined stream: mirrored video from canvas + audio from mic
    const canvasStream = canvas.captureStream(30);
    const combined = new MediaStream();
    canvasStream.getVideoTracks().forEach(t => combined.addTrack(t));
    stream.getAudioTracks().forEach(t => combined.addTrack(t));

    const recorder = new MediaRecorder(combined, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      if (recordRafRef.current !== null) cancelAnimationFrame(recordRafRef.current);
      recordRafRef.current = null;
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

      // Auto-save to Camera Roll
      try {
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const root = await getWebosRoot();
        const targetPath = `${root}/Camera Roll/Recording_${Date.now()}.webm`;
        await api.fs.writeBinary(targetPath, dataUrl);
        addNotification({ title: 'Camera', message: 'Saved to Camera Roll', icon: 'camera', app: 'camera' });
      } catch (e: any) {
        addNotification({ title: 'Camera', message: `Save failed: ${e.message}`, icon: 'camera', app: 'camera' });
      }
    };
    // Pass a timeslice so chunks flush every 100ms instead of only on stop
    recorder.start(100);
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    try { mediaRecorderRef.current?.requestData(); } catch {}
    mediaRecorderRef.current?.stop();
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
            <button style={{ ...st.actionBtn, background: '#2563eb' }} onClick={savePhotoToCameraRoll}>Save to Camera Roll</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{
                maxWidth: '100%', maxHeight: '100%', borderRadius: 8,
                // Live camera preview is mirrored. During recording we hide it and
                // display the recording canvas (which is already mirrored) instead.
                transform: 'scaleX(-1)',
                display: recording ? 'none' : 'block',
              }} />
            <canvas ref={liveRecordCanvasRef}
              style={{
                maxWidth: '100%', maxHeight: '100%', borderRadius: 8,
                display: recording ? 'block' : 'none',
              }} />
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
