import React, { useState, useEffect, useRef } from 'react';
import { WindowState, useStore } from '../../../store/useStore';
import { api } from '../../../utils/api';

type Tab = 'library' | 'camera';

const isImage = (name: string) => /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico|heic|tiff)$/i.test(name);
const isVideo = (name: string) => /\.(webm|mp4|mov|m4v|ogv|avi|mkv)$/i.test(name);

const MobilePhotos: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [tab, setTab] = useState<Tab>('library');
  const [library, setLibrary] = useState<any[]>([]);
  const [cameraRoll, setCameraRoll] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(win.filePath || null);
  const [loading, setLoading] = useState(true);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useStore();

  const loadAll = async () => {
    setLoading(true);
    const lib: any[] = [];
    const cam: any[] = [];
    try {
      const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
      if (!r.root) { setLoading(false); return; }
      const root = r.root;
      const cameraRootPath = `${root}/Camera Roll`;
      const scan = async (dir: string, target: any[], depth = 0) => {
        if (depth > 6) return;
        try {
          const files = await api.fs.list(dir);
          if (!Array.isArray(files)) return;
          for (const f of files) {
            if (f.isDirectory) {
              if (target === lib && f.path === cameraRootPath) continue;
              await scan(f.path, target, depth + 1);
            } else {
              if (target === lib && isImage(f.name)) target.push(f);
              else if (target === cam && (isImage(f.name) || isVideo(f.name))) target.push(f);
            }
          }
        } catch {}
      };
      await scan(root, lib);
      await scan(cameraRootPath, cam);
    } catch {}
    setLibrary(lib);
    setCameraRoll(cam);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []); // eslint-disable-line

  useEffect(() => {
    const h = () => loadAll();
    window.addEventListener('webos-fs-changed', h);
    return () => window.removeEventListener('webos-fs-changed', h);
  }, []);

  const serveUrl = (path: string) => `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(path)}`;
  const items = tab === 'library' ? library : cameraRoll;

  const handleImport = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
    if (!r.root) return;
    for (let i = 0; i < list.length; i++) {
      try { await api.fs.uploadToPath(list[i], `${r.root}/Photos`); } catch {}
    }
    addNotification({ title: 'Photos', message: `Imported ${list.length} item${list.length === 1 ? '' : 's'}`, app: 'photos' });
    loadAll();
  };

  // Full-screen viewer
  if (selected) {
    const video = isVideo(selected);
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'calc(env(safe-area-inset-top) + 60px) 20px 20px' }}>
          {video ? (
            <video src={serveUrl(selected)} controls autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '100%' }} />
          ) : (
            <img src={serveUrl(selected)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )}
        </div>
        <button
          onClick={() => setSelected(null)}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top) + 10px)',
            right: 14,
            padding: '10px 18px',
            borderRadius: 20,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(16px)',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f2f2f7', color: '#1c1c1e' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', background: '#fff', borderBottom: '1px solid #e5e5ea' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Photos</h1>
      </div>

      {/* Tabs */}
      <div style={{ padding: '8px 12px 0', background: '#fff', display: 'flex', gap: 4, borderBottom: '1px solid #e5e5ea' }}>
        <TabBtn active={tab === 'library'} onClick={() => setTab('library')}>Library</TabBtn>
        <TabBtn active={tab === 'camera'} onClick={() => setTab('camera')}>Camera Roll</TabBtn>
        <div style={{ flex: 1 }} />
        <button onClick={() => photoInputRef.current?.click()}
          style={{ padding: '8px 14px', borderRadius: 8, background: '#007aff', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 6 }}>
          + Import
        </button>
        <input ref={photoInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
          onChange={e => handleImport(e.target.files)} />
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8e8e93' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#8e8e93' }}>
            <div style={{ marginBottom: 10, opacity: 0.4 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-8 8"/></svg></div>
            <div style={{ fontSize: 15 }}>{tab === 'camera' ? 'No photos or videos yet' : 'No photos found'}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{tab === 'camera' ? 'Take a photo with Camera' : 'Import photos to get started'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {items.map((f, i) => {
              const video = isVideo(f.name);
              return (
                <div key={i} onClick={() => setSelected(f.path)}
                  style={{ position: 'relative', paddingBottom: '100%', background: '#e5e5ea', overflow: 'hidden', cursor: 'pointer' }}>
                  {video ? (
                    <>
                      <video src={serveUrl(f.path)} preload="metadata" muted playsInline
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="#fff"><path d="M3 2l9 5-9 5z"/></svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={serveUrl(f.path)} alt={f.name} loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick}
    style={{
      padding: '10px 16px',
      fontSize: 14,
      fontWeight: 600,
      background: 'none',
      border: 'none',
      color: active ? '#007aff' : '#8e8e93',
      borderBottom: active ? '2px solid #007aff' : '2px solid transparent',
      marginBottom: -1,
      cursor: 'pointer',
    }}>
    {children}
  </button>
);

export default MobilePhotos;
