import React, { useState, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import { api } from '../../utils/api';

const PhotosApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(win.filePath || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPhotos(); }, []); // eslint-disable-line

  const loadPhotos = async () => {
    setLoading(true);
    const allFiles: any[] = [];
    for (const p of ['/Users/krishna/Pictures', '/Users/krishna/Desktop', '/Users/krishna/Downloads', '/Users/krishna/Documents']) {
      try {
        const files = await api.fs.list(p);
        allFiles.push(...files.filter((f: any) =>
          f.name.match(/\.(png|jpg|jpeg|gif|svg|webp|bmp|ico|heic|tiff)$/i)
        ));
      } catch {}
    }
    setPhotos(allFiles);
    setLoading(false);
  };

  const imgUrl = (path: string) => `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(path)}`;

  // Full-size viewer
  if (selectedPhoto) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.9)', gap: 12 }}>
          <button onClick={() => setSelectedPhoto(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, fontSize: 13, color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 1L3 6l5 5"/></svg>
            Library
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{selectedPhoto.split('/').pop()}</span>
          <a href={imgUrl(selectedPhoto)} download={selectedPhoto.split('/').pop()} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.1)', textDecoration: 'none', border: 'none' }}>
            Download
          </a>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
          <img src={imgUrl(selectedPhoto)} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Library</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#64748b' }}>{photos.length} photos</span>
        <button onClick={loadPhotos} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, color: '#94a3b8', border: '1px solid #334155', background: 'none', cursor: 'pointer' }}>Refresh</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>Scanning for photos...</div>
        ) : photos.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#64748b' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><rect x="6" y="10" width="36" height="28" rx="4"/><circle cx="18" cy="22" r="4"/><path d="M6 34l10-10 8 8 6-6 12 12"/></svg>
            <p>No photos found</p>
            <p style={{ fontSize: 12 }}>Add images to ~/Pictures, ~/Desktop, or ~/Downloads</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 3 }}>
            {photos.map((photo, i) => (
              <div key={i} onClick={() => setSelectedPhoto(photo.path)}
                style={{ position: 'relative', paddingBottom: '75%', background: '#1e293b', borderRadius: 4, overflow: 'hidden', cursor: 'pointer' }}>
                <img src={imgUrl(photo.path)} alt={photo.name} loading="lazy"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotosApp;
