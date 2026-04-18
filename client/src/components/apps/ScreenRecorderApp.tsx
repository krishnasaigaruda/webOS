import React, { useState, useRef } from 'react';
import { WindowState, useStore } from '../../store/useStore';

const ScreenRecorderApp: React.FC<{ window: WindowState }> = () => {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addNotification } = useStore();

  const startRecording = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoUrl(URL.createObjectURL(blob));
        addNotification({ title: 'Screen Recorder', message: 'Recording saved!', icon: 'screen-recorder', app: 'screen-recorder' });
      };
      stream.getVideoTracks()[0].onended = () => stopRecording();
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setTime(0);
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } catch {
      addNotification({ title: 'Screen Recorder', message: 'Recording cancelled', icon: 'screen-recorder', app: 'screen-recorder' });
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const download = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `Recording_${Date.now()}.webm`;
    a.click();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      {videoUrl ? (
        <>
          <video src={videoUrl} controls playsInline style={{ maxWidth: '90%', maxHeight: '60%', borderRadius: 8 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={st.btn} onClick={() => setVideoUrl(null)}>New Recording</button>
            <button style={{ ...st.btn, background: '#2563eb' }} onClick={download}>Download</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: recording ? '#FF3B30' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.2)' }}>
            {recording ? (
              <div style={{ width: 24, height: 24, borderRadius: 4, background: '#fff' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: '#FF3B30' }} />
            )}
          </div>
          {recording && (
            <div style={{ fontSize: 32, fontWeight: 200, fontVariantNumeric: 'tabular-nums' }}>{formatTime(time)}</div>
          )}
          <h2 style={{ fontSize: 20, fontWeight: 500 }}>{recording ? 'Recording...' : 'Screen Recorder'}</h2>
          <button style={{ ...st.btn, padding: '12px 32px', fontSize: 15, background: recording ? '#FF3B30' : 'rgba(255,255,255,0.1)' }}
            onClick={recording ? stopRecording : startRecording}>
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </>
      )}
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  btn: { padding: '8px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 500 },
};

export default ScreenRecorderApp;
