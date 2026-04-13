import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const MusicApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  // If no file, show Tools Hub music player
  if (!win.filePath) {
    return <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/music-player.html" />;
  }
  return <NativeAudioPlayer filePath={win.filePath} />;
};

const NativeAudioPlayer: React.FC<{ filePath: string }> = ({ filePath }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const fileName = filePath.split('/').pop() || 'Audio';
  const url = `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(filePath)}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const fmt = (t: number) => {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #1e1b4b, #0f172a)', color: '#fff' }}>
      <audio ref={audioRef} src={url} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {/* Album art placeholder */}
        <div style={{ width: 180, height: 180, borderRadius: 20, background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>

        <div style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 4, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>webOS Music</div>

        {/* Progress */}
        <div style={{ width: '100%', maxWidth: 400, marginTop: 24 }}>
          <input type="range" min="0" max={duration || 0} value={currentTime}
            onChange={e => seek(Number(e.target.value))}
            style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16 }}>
          <button style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => seek(Math.max(0, currentTime - 10))}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button style={{ width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(139,92,246,0.4)' }} onClick={togglePlay}>
            {playing ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => seek(Math.min(duration, currentTime + 10))}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, width: '100%', maxWidth: 300 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" opacity="0.5"><path d="M3 10v4h4l5 5V5l-5 5H3z"/></svg>
          <input type="range" min="0" max="1" step="0.01" value={volume}
            onChange={e => changeVolume(Number(e.target.value))}
            style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
};

export default MusicApp;
