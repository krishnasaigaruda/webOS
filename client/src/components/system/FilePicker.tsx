import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';

interface FilePickerProps {
  mode: 'open' | 'save';
  title?: string;
  defaultPath?: string;
  defaultFileName?: string;
  fileTypes?: string[]; // e.g. ['.txt', '.md']
  onSelect: (path: string) => void;
  onCancel: () => void;
}

const HOME = '/Users/krishna';

const FAVORITES = [
  { name: 'Desktop', path: `${HOME}/Desktop`, icon: 'desktop' },
  { name: 'Documents', path: `${HOME}/Documents`, icon: 'docs' },
  { name: 'Downloads', path: `${HOME}/Downloads`, icon: 'down' },
  { name: 'Pictures', path: `${HOME}/Pictures`, icon: 'pics' },
  { name: 'Applications', path: '/Applications', icon: 'apps' },
  { name: 'Home', path: HOME, icon: 'home' },
];

const FilePicker: React.FC<FilePickerProps> = ({
  mode, title, defaultPath, defaultFileName, fileTypes, onSelect, onCancel
}) => {
  const [currentPath, setCurrentPath] = useState(defaultPath || `${HOME}/Documents`);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState(defaultFileName || 'Untitled.txt');
  const [loading, setLoading] = useState(false);

  const loadFiles = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const data = await api.fs.list(path);
      setFiles(data.sort((a: any, b: any) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      }));
    } catch { setFiles([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadFiles(currentPath); }, [currentPath, loadFiles]);

  const navigate = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleSelect = () => {
    if (mode === 'save') {
      onSelect(`${currentPath}/${fileName}`);
    } else if (selectedFile) {
      onSelect(selectedFile);
    }
  };

  const handleDoubleClick = (file: any) => {
    if (file.isDirectory) {
      navigate(file.path);
    } else {
      onSelect(file.path);
    }
  };

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.dialog} onClick={e => e.stopPropagation()}>
        {/* Title */}
        <div style={s.titleBar}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {title || (mode === 'save' ? 'Save As' : 'Open')}
          </span>
        </div>

        <div style={s.body}>
          {/* Sidebar */}
          <div style={s.sidebar}>
            <div style={s.sidebarSection}>Favorites</div>
            {FAVORITES.map((fav, i) => (
              <div key={i}
                style={{
                  ...s.sidebarItem,
                  background: currentPath === fav.path ? 'var(--accent)' : 'transparent',
                  color: currentPath === fav.path ? '#fff' : 'var(--text-primary)',
                }}
                onClick={() => navigate(fav.path)}>
                <SidebarIcon type={fav.icon} active={currentPath === fav.path} />
                <span>{fav.name}</span>
              </div>
            ))}
            <div style={s.sidebarSection}>Locations</div>
            <div style={{ ...s.sidebarItem }} onClick={() => navigate('/')}>
              <SidebarIcon type="disk" active={false} />
              <span>Macintosh HD</span>
            </div>
          </div>

          {/* Main content */}
          <div style={s.main}>
            {/* Toolbar */}
            <div style={s.toolbar}>
              <button style={s.navBtn} onClick={() => {
                const parent = currentPath.split('/').slice(0, -1).join('/') || '/';
                navigate(parent);
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1L3 5l4 4"/></svg>
              </button>
              <button style={s.navBtn} onClick={() => {}}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1l4 4-4 4"/></svg>
              </button>
              <div style={s.pathBreadcrumb}>
                {pathParts.map((p, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span style={{ opacity: 0.3 }}>/</span>}
                    <button style={s.pathBtn} onClick={() => navigate('/' + pathParts.slice(0, i + 1).join('/'))}>
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* File list */}
            <div style={s.fileList}>
              {loading ? (
                <div style={s.empty}>Loading...</div>
              ) : files.length === 0 ? (
                <div style={s.empty}>Empty folder</div>
              ) : (
                files.map((file, i) => {
                  const isSelected = selectedFile === file.path;
                  return (
                    <div key={i}
                      style={{
                        ...s.fileRow,
                        background: isSelected ? 'var(--accent)' : i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)',
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                      }}
                      onClick={() => setSelectedFile(file.path)}
                      onDoubleClick={() => handleDoubleClick(file)}>
                      <FileIcon isDir={file.isDirectory} name={file.name} />
                      <span style={{ fontSize: 13 }}>{file.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={s.bottomBar}>
          {mode === 'save' && (
            <div style={s.saveRow}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Save as:</label>
              <input style={s.fileNameInput} value={fileName}
                onChange={e => setFileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSelect()} autoFocus />
            </div>
          )}
          <div style={s.actions}>
            <button style={s.cancelBtn} onClick={onCancel}>Cancel</button>
            <button style={s.okBtn} onClick={handleSelect}
              disabled={mode === 'open' && !selectedFile}>
              {mode === 'save' ? 'Save' : 'Open'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarIcon: React.FC<{ type: string; active: boolean }> = ({ type, active }) => {
  const color = active ? '#fff' : '#6b7280';
  const fills: Record<string, React.ReactNode> = {
    home: <svg width="14" height="14" viewBox="0 0 14 14" fill={color}><path d="M2 7l5-5 5 5v5a1 1 0 01-1 1H3a1 1 0 01-1-1V7z"/></svg>,
    apps: <svg width="14" height="14" viewBox="0 0 14 14" fill={color}><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>,
    desktop: <svg width="14" height="14" viewBox="0 0 14 14" fill={color}><rect x="1" y="2" width="12" height="8" rx="1.5"/><line x1="5" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="10" x2="7" y2="12" stroke={color} strokeWidth="1.5"/></svg>,
    docs: <svg width="14" height="14" viewBox="0 0 14 14" fill={color}><path d="M3 1h5l3 3v8a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z"/></svg>,
    down: <svg width="14" height="14" viewBox="0 0 14 14" fill={color}><path d="M7 2v7M4 7l3 3 3-3" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/><line x1="2" y1="12" x2="12" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
    pics: <svg width="14" height="14" viewBox="0 0 14 14" fill={color}><rect x="1" y="2" width="12" height="10" rx="1.5" fill="none" stroke={color} strokeWidth="1.2"/><circle cx="5" cy="6" r="1.5" fill={color}/><path d="M1 10l3-3 2 2 2-3 5 4" stroke={color} strokeWidth="1" fill="none"/></svg>,
    recent: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.3"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5l2.5 1.5" strokeLinecap="round"/></svg>,
    disk: <svg width="14" height="14" viewBox="0 0 14 14" fill={color}><rect x="1" y="3" width="12" height="8" rx="2"/><circle cx="10" cy="7" r="1" fill={active ? 'var(--accent)' : '#fff'}/></svg>,
  };
  return <span style={{ display: 'flex', flexShrink: 0 }}>{fills[type] || fills.docs}</span>;
};

const FileIcon: React.FC<{ isDir: boolean; name: string }> = ({ isDir, name }) => {
  if (isDir) return <svg width="16" height="16" viewBox="0 0 16 16" fill="#64B5F6"><path d="M1 4a1 1 0 011-1h4l2 2h6a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"/></svg>;
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const colors: Record<string, string> = { js: '#F7DF1E', ts: '#3178C6', py: '#3776AB', html: '#E34F26', css: '#1572B6', json: '#292929', md: '#083FA1', txt: '#888', pdf: '#FF0000' };
  const c = colors[ext] || '#9CA3AF';
  return <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.5"/><path d="M9 1l4 4H10a1 1 0 01-1-1V1z" fill="#e5e7eb"/><rect x="4" y="11" width="5" height="2" rx="0.5" fill={c}/></svg>;
};

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 100000,
    background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dialog: {
    width: 620, maxHeight: 460, background: 'var(--bg-primary)',
    borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 80px rgba(0,0,0,0.35)', border: '1px solid var(--border)',
  },
  titleBar: {
    padding: '10px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
  },
  body: { display: 'flex', flex: 1, minHeight: 0, maxHeight: 320 },
  sidebar: {
    width: 160, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)',
    overflowY: 'auto', padding: '4px 0', flexShrink: 0,
  },
  sidebarSection: {
    fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
    padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sidebarItem: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
    fontSize: 12, cursor: 'pointer', borderRadius: 5, margin: '1px 4px',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
    borderBottom: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
  },
  navBtn: {
    width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--bg-primary)',
  },
  pathBreadcrumb: { display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, overflow: 'hidden', flex: 1 },
  pathBtn: { fontSize: 12, color: 'var(--text-primary)', cursor: 'pointer', padding: '2px 4px', borderRadius: 3 },
  fileList: { flex: 1, overflowY: 'auto' },
  fileRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px',
    cursor: 'pointer', fontSize: 13,
  },
  empty: { padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 },
  bottomBar: { padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' },
  saveRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  fileNameInput: {
    flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
    background: 'var(--bg-primary)', fontSize: 13, outline: 'none', color: 'var(--text-primary)',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: {
    padding: '6px 20px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
    border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)',
  },
  okBtn: {
    padding: '6px 20px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    background: 'var(--accent)', color: '#fff', border: 'none',
  },
};

export default FilePicker;
