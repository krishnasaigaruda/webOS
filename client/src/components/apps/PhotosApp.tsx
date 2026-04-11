import React, { useState, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';

const PhotosApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(win.filePath || null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'library' | 'recents'>('library');
  const { openWindow } = useStore();

  useEffect(() => { loadPhotos(); }, []); // eslint-disable-line

  const loadPhotos = async () => {
    setLoading(true);
    const allFiles: any[] = [];
    for (const p of ['/Users/krishna/Pictures', '/Users/krishna/Desktop', '/Users/krishna/Downloads', '/Users/krishna/Documents']) {
      try {
        const files = await api.fs.list(p);
        allFiles.push(...files.filter((f: any) =>
          f.name.match(/\.(png|jpg|jpeg|gif|svg|webp|bmp|ico|heic)$/i)
        ));
      } catch {}
    }
    setPhotos(allFiles);
    setLoading(false);
  };

  const imgUrl = (path: string) => `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(path)}`;

  if (selectedPhoto) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
        <div style={s.viewerToolbar}>
          <button style={s.backBtn} onClick={() => setSelectedPhoto(null)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
            Library
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, opacity: 0.7 }}>{selectedPhoto.split('/').pop()}</span>
          <button style={s.backBtn} onClick={() => openWindow('textedit', selectedPhoto.split('/').pop() || '', 'textedit', { filePath: selectedPhoto })}>
            Edit
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <img src={imgUrl(selectedPhoto)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={s.toolbar}>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 2 }}>
          {(['library', 'recents'] as const).map(t => (
            <button key={t} style={{ ...s.tabBtn, background: tab === t ? 'rgba(255,255,255,0.15)' : 'transparent' }}
              onClick={() => setTab(t)}>{t === 'library' ? 'Library' : 'Recents'}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{photos.length} photos</span>
        <button style={s.refreshBtn} onClick={loadPhotos}>↻</button>
      </div>
      <div style={s.grid}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#94a3b8' }}>Scanning for photos...</div>
        ) : photos.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60, color: '#94a3b8' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
              <rect x="6" y="12" width="36" height="28" rx="4" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="24" r="5" stroke="white" strokeWidth="2"/>
              <path d="M12 36l8-10 6 6 4-4 8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No photos found</p>
            <p style={{ fontSize: 12 }}>Add images to ~/Pictures, ~/Desktop, or ~/Downloads</p>
          </div>
        ) : (
          photos.map((photo, i) => (
            <div key={i} style={s.photoCard} onClick={() => setSelectedPhoto(photo.path)}>
              <img src={imgUrl(photo.path)} alt={photo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  toolbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #1e293b', background: '#0f172a' },
  tabBtn: { padding: '5px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#e2e8f0', border: 'none' },
  refreshBtn: { padding: '4px 10px', borderRadius: 6, fontSize: 14, cursor: 'pointer', color: '#94a3b8', border: '1px solid #334155', background: 'none' },
  grid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2, overflowY: 'auto', padding: 2 },
  photoCard: { aspectRatio: '1', cursor: 'pointer', overflow: 'hidden', background: '#1e293b' },
  viewerToolbar: { display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.8)', color: '#fff' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, fontSize: 13, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: 'none' },
};

export default PhotosApp;
