import React, { useState, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import { api } from '../../utils/api';

type Tab = 'library' | 'camera';

const isImage = (name: string) => /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico|heic|tiff)$/i.test(name);
const isVideo = (name: string) => /\.(webm|mp4|mov|m4v|ogv|avi|mkv)$/i.test(name);

const PhotosApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [tab, setTab] = useState<Tab>('library');
  const [libraryMedia, setLibraryMedia] = useState<any[]>([]);
  const [cameraMedia, setCameraMedia] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(win.filePath || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []); // eslint-disable-line

  // Live-refresh when any app (especially Camera) writes new files
  useEffect(() => {
    const handler = () => loadAll();
    window.addEventListener('webos-fs-changed', handler);
    return () => window.removeEventListener('webos-fs-changed', handler);
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const library: any[] = [];
    const camera: any[] = [];

    const rootRes = await fetch('http://localhost:3001/api/fs/root').then(r => r.json()).catch(() => ({}));
    if (!rootRes.root) { setLoading(false); return; }
    const root = rootRes.root;
    const cameraRoot = `${root}/Camera Roll`;

    const scan = async (dir: string, target: any[], depth: number = 0) => {
      if (depth > 6) return;
      try {
        const files = await api.fs.list(dir);
        if (!Array.isArray(files)) return;
        for (const f of files) {
          if (f.isDirectory) {
            // Skip Camera Roll while scanning library so it doesn't double up
            if (target === library && f.path === cameraRoot) continue;
            await scan(f.path, target, depth + 1);
          } else {
            // Library: images only. Camera Roll: images + videos.
            if (target === library && isImage(f.name)) target.push(f);
            else if (target === camera && (isImage(f.name) || isVideo(f.name))) target.push(f);
          }
        }
      } catch {}
    };

    await scan(root, library);
    await scan(cameraRoot, camera);

    setLibraryMedia(library);
    setCameraMedia(camera);
    setLoading(false);
  };

  const serveUrl = (path: string) => `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(path)}`;
  const items = tab === 'library' ? libraryMedia : cameraMedia;
  const selectedIsVideo = selectedItem ? isVideo(selectedItem) : false;

  // Full-size viewer
  if (selectedItem) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.9)', gap: 12 }}>
          <button onClick={() => setSelectedItem(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, fontSize: 13, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 1L3 6l5 5"/></svg>
            Library
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{selectedItem.split('/').pop()}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
          {selectedIsVideo ? (
            <video src={serveUrl(selectedItem)} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />
          ) : (
            <img src={serveUrl(selectedItem)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 12px', borderBottom: '1px solid #1e293b' }}>
        <button onClick={() => setTab('library')}
          style={{
            padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'none', border: 'none',
            color: tab === 'library' ? '#fff' : '#64748b',
            borderBottom: tab === 'library' ? '2px solid var(--accent, #2563eb)' : '2px solid transparent',
          }}>Library</button>
        <button onClick={() => setTab('camera')}
          style={{
            padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'none', border: 'none',
            color: tab === 'camera' ? '#fff' : '#64748b',
            borderBottom: tab === 'camera' ? '2px solid var(--accent, #2563eb)' : '2px solid transparent',
          }}>webOS Camera</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#64748b' }}>{items.length} items</span>
        <button onClick={loadAll} style={{ marginLeft: 12, padding: '3px 10px', borderRadius: 6, fontSize: 12, color: '#94a3b8', border: '1px solid #334155', background: 'none', cursor: 'pointer' }}>Refresh</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>Scanning for photos...</div>
        ) : items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#64748b' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><rect x="6" y="10" width="36" height="28" rx="4"/><circle cx="18" cy="22" r="4"/><path d="M6 34l10-10 8 8 6-6 12 12"/></svg>
            <p>{tab === 'camera' ? 'Nothing in Camera Roll yet' : 'No photos found'}</p>
            <p style={{ fontSize: 12 }}>{tab === 'camera' ? 'Take a photo or video with the Camera app' : 'Import images to your webOS folder from Finder'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 3 }}>
            {items.map((item, i) => {
              const video = isVideo(item.name);
              return (
                <div key={i} onClick={() => setSelectedItem(item.path)}
                  style={{ position: 'relative', paddingBottom: '75%', background: '#1e293b', borderRadius: 4, overflow: 'hidden', cursor: 'pointer' }}>
                  {video ? (
                    <>
                      <video src={serveUrl(item.path)} preload="metadata" muted
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      {/* Play badge */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="#fff"><path d="M3 2l9 5-9 5z"/></svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={serveUrl(item.path)} alt={item.name} loading="lazy"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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

export default PhotosApp;
