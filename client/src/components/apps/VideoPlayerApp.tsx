import React, { useRef, useState, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';

const VideoPlayerApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  if (!win.filePath) {
    return <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/video-player.html" />;
  }
  return <NativeVideoPlayer filePath={win.filePath} />;
};

const NativeVideoPlayer: React.FC<{ filePath: string }> = ({ filePath }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(true);
  const fileName = filePath.split('/').pop() || 'Video';
  const url = `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(filePath)}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setCurrentTime(video.currentTime);
    const onDuration = () => setDuration(video.duration);
    const onEnd = () => setPlaying(false);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onDuration);
    video.addEventListener('ended', onEnd);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onDuration);
      video.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  };

  const seek = (t: number) => {
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const toggleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!document.fullscreenElement) v.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const fmt = (t: number) => {
    if (!isFinite(t)) return '0:00';
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const sec = Math.floor(t % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: 'rgba(0,0,0,0.9)', color: '#fff', gap: 12 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M10 9l6 3-6 3z" fill="#ef4444"/></svg>
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
      </div>

      {/* Video */}
      <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={togglePlay}>
        <video ref={videoRef} src={url} style={{ maxWidth: '100%', maxHeight: '100%' }} />

        {/* Play button overlay */}
        {!playing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.9)', display: showControls ? 'flex' : 'none', flexDirection: 'column', gap: 8 }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontVariantNumeric: 'tabular-nums', minWidth: 40 }}>{fmt(currentTime)}</span>
          <input type="range" min="0" max={duration || 0} step="0.1" value={currentTime}
            onChange={e => seek(Number(e.target.value))}
            style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#94a3b8', fontVariantNumeric: 'tabular-nums', minWidth: 40 }}>{fmt(duration)}</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={btnStyle} onClick={() => seek(Math.max(0, currentTime - 10))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button style={{ ...btnStyle, width: 40, height: 40, background: '#6366f1' }} onClick={togglePlay}>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button style={btnStyle} onClick={() => seek(Math.min(duration, currentTime + 10))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#94a3b8"><path d="M3 10v4h4l5 5V5l-5 5H3z"/></svg>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={e => changeVolume(Number(e.target.value))}
              style={{ width: 80 }} />
          </div>
          <div style={{ flex: 1 }} />
          <button style={btnStyle} onClick={toggleFullscreen} title="Fullscreen">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.1)', border: 'none',
  cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default VideoPlayerApp;
