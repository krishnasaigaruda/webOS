import React, { useRef, useState, useEffect } from 'react';
import { WindowState } from '../../../store/useStore';
import { api } from '../../../utils/api';

const isAudio = (name: string) => /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(name);

const MobileMusic: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string | null>(win.filePath || null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const found: any[] = [];
      const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
      if (r.root) {
        const scan = async (dir: string, depth = 0) => {
          if (depth > 6) return;
          try {
            const files = await api.fs.list(dir);
            if (!Array.isArray(files)) return;
            for (const f of files) {
              if (f.isDirectory) await scan(f.path, depth + 1);
              else if (isAudio(f.name)) found.push(f);
            }
          } catch {}
        };
        await scan(r.root);
      }
      setSongs(found);
      setLoading(false);
    })();
  }, []);

  const serveUrl = (p: string) => `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(p)}`;

  const play = (path: string) => {
    setCurrentPath(path);
    setTimeout(() => {
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }, 50);
  };

  const togglePlayPause = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else a.play().then(() => setPlaying(true)).catch(() => {});
  };

  const currentName = currentPath?.split('/').pop() || 'No song selected';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f2f2f7', color: '#1c1c1e' }}>
      <div style={{ padding: '16px 16px 12px', background: '#fff', borderBottom: '1px solid #e5e5ea' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Music</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8e8e93' }}>Scanning for audio…</div>
        ) : songs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#8e8e93' }}>
            <div style={{ marginBottom: 10, opacity: 0.4 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
            <div style={{ fontSize: 15 }}>No songs found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Import .mp3, .m4a or .wav files via Files</div>
          </div>
        ) : (
          <div style={{ background: '#fff' }}>
            {songs.map((s, i) => (
              <div key={i} onClick={() => play(s.path)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < songs.length - 1 ? '1px solid #f2f2f7' : 'none', cursor: 'pointer', background: currentPath === s.path ? '#e9f2ff' : 'transparent' }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg, #ff2d55, #ff9500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini player */}
      {currentPath && (
        <div style={{ borderTop: '1px solid #e5e5ea', background: '#fff', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg, #ff2d55, #ff9500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentName}</div>
              <div style={{ fontSize: 12, color: '#8e8e93' }}>{playing ? 'Playing' : 'Paused'}</div>
            </div>
            <button onClick={togglePlayPause}
              style={{ width: 48, height: 48, borderRadius: 24, background: '#007aff', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer' }}>
              {playing
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
          </div>
          <audio ref={audioRef} src={serveUrl(currentPath)} onEnded={() => setPlaying(false)} />
        </div>
      )}
    </div>
  );
};

export default MobileMusic;
