import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WindowState, useStore } from '../../../store/useStore';
import { api } from '../../../utils/api';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
  mimeType: string;
}

// SVG file icons
const FolderIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="#3b82f6" stroke="none"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>;
const ImageIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-8 8"/></svg>;
const VideoIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M10 9l5 3-5 3z" fill="#ef4444"/></svg>;
const AudioIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const DocIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>;
const SheetIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
const FileIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>;
const EmptyIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="1.2" opacity="0.5"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>;

const iconFor = (f: FileItem) => {
  if (f.isDirectory) return <FolderIcon />;
  const ext = f.name.split('.').pop()?.toLowerCase() || '';
  if (['png','jpg','jpeg','gif','webp','svg','heic','bmp'].includes(ext)) return <ImageIcon />;
  if (['mp4','mov','webm','mkv','avi','m4v'].includes(ext)) return <VideoIcon />;
  if (['mp3','wav','m4a','aac','flac','ogg'].includes(ext)) return <AudioIcon />;
  if (['docx','doc','pdf','pages','rtf'].includes(ext)) return <DocIcon />;
  if (['xlsx','xls','csv','tsv','numbers'].includes(ext)) return <SheetIcon />;
  return <FileIcon />;
};

const MobileFiles: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [root, setRoot] = useState('');
  const [currentPath, setCurrentPath] = useState(win.filePath || '');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const photosInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { addNotification } = useStore();

  useEffect(() => {
    fetch('http://localhost:3001/api/fs/root').then(r => r.json()).then(data => {
      if (data.root) { setRoot(data.root); if (!currentPath) setCurrentPath(data.root); }
    });
  }, []); // eslint-disable-line

  const loadFiles = useCallback(async (dirPath: string) => {
    if (!dirPath) return;
    setLoading(true);
    try {
      const data = await api.fs.list(dirPath);
      setFiles((Array.isArray(data) ? data : [])
        .filter((f: FileItem) => !f.name.startsWith('.'))
        .sort((a: FileItem, b: FileItem) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        }));
    } catch { setFiles([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadFiles(currentPath); }, [currentPath, loadFiles]);
  useEffect(() => {
    const h = () => loadFiles(currentPath);
    window.addEventListener('webos-fs-changed', h);
    return () => window.removeEventListener('webos-fs-changed', h);
  }, [currentPath, loadFiles]);

  const navigateTo = (path: string) => { setCurrentPath(path); setSelected(new Set()); setMultiSelect(false); };
  const goUp = () => {
    if (!root || currentPath === root) return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/'));
    if (parent.length >= root.length) navigateTo(parent);
  };

  const handleFile = (f: FileItem) => {
    if (multiSelect) { toggleSelected(f.path); return; }
    if (f.isDirectory) { navigateTo(f.path); return; }
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    const { openWindow } = useStore.getState();
    if (['png','jpg','jpeg','gif','webp','svg','bmp','heic'].includes(ext)) openWindow('photos', f.name, 'photos', { filePath: f.path });
    else if (['mp4','mov','webm','m4v','mkv','avi'].includes(ext)) openWindow('video-player', f.name, 'video-player', { filePath: f.path });
    else if (['mp3','wav','ogg','m4a','flac','aac'].includes(ext)) openWindow('music', f.name, 'music', { filePath: f.path });
    else if (ext === 'pdf' || ['docx','doc'].includes(ext)) openWindow('document', f.name, 'document', { filePath: f.path });
    else if (['xlsx','xls','csv','tsv'].includes(ext)) openWindow('spreadsheet', f.name, 'spreadsheet', { filePath: f.path });
    else openWindow('textedit', f.name, 'textedit', { filePath: f.path });
  };

  const toggleSelected = (path: string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(path)) n.delete(path); else n.add(path); return n; });
  };

  const handleDelete = async (path: string) => {
    const name = path.split('/').pop() || '';
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.fs.rename(path, `${root}/.webos-trash/${name}`);
      addNotification({ title: 'Files', message: `${name} moved to Trash`, app: 'finder' });
    } catch {}
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} item${selected.size === 1 ? '' : 's'}?`)) return;
    for (const p of Array.from(selected)) {
      try { await api.fs.rename(p, `${root}/.webos-trash/${p.split('/').pop()}`); } catch {}
    }
    addNotification({ title: 'Files', message: `${selected.size} items deleted`, app: 'finder' });
    setSelected(new Set());
    setMultiSelect(false);
  };

  const startRename = (f: FileItem) => { setRenaming(f.path); setRenameValue(f.name); };
  const confirmRename = async () => {
    if (!renaming || !renameValue.trim()) { setRenaming(null); return; }
    const dir = renaming.substring(0, renaming.lastIndexOf('/'));
    const newPath = `${dir}/${renameValue.trim()}`;
    if (newPath !== renaming) {
      try { await api.fs.rename(renaming, newPath); } catch {}
    }
    setRenaming(null);
  };

  const handleNewFolder = () => {
    const name = window.prompt('Folder name');
    if (!name?.trim()) return;
    api.fs.mkdir(`${currentPath}/${name.trim()}`);
  };

  const handleUploadFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    // Check existing file names so we skip duplicates
    const existingNames = new Set(files.map(f => f.name));
    const toUpload: File[] = [];
    let skipped = 0;
    for (let i = 0; i < list.length; i++) {
      if (existingNames.has(list[i].name)) {
        skipped++;
      } else {
        toUpload.push(list[i]);
        existingNames.add(list[i].name); // prevent dupes within the same batch
      }
    }
    if (toUpload.length === 0) {
      addNotification({ title: 'Files', message: `All ${skipped} file${skipped === 1 ? '' : 's'} already exist — nothing imported`, app: 'finder' });
      return;
    }
    setUploadingCount(toUpload.length);
    let done = 0;
    for (const f of toUpload) {
      try { await api.fs.uploadToPath(f, currentPath); } catch {}
      done++; setUploadingCount(toUpload.length - done);
    }
    setUploadingCount(0);
    const msg = skipped > 0
      ? `Imported ${toUpload.length}, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}`
      : `Imported ${toUpload.length} file${toUpload.length === 1 ? '' : 's'}`;
    addNotification({ title: 'Files', message: msg, app: 'finder' });
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const atRoot = currentPath === root;
  const displayPath = atRoot ? 'My Files' : currentPath.replace(root, 'My Files');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f2f2f7', color: '#1c1c1e' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', background: '#fff', borderBottom: '1px solid #e5e5ea' }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{atRoot ? 'Files' : displayPath.split('/').pop()}</div>
        <div style={{ fontSize: 12, color: '#8e8e93' }}>{displayPath}</div>
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 16px', background: '#fff', borderBottom: '1px solid #e5e5ea', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!atRoot && <Btn color="#007aff" outline onClick={goUp}>Back</Btn>}
          <Btn color="#34c759" onClick={() => { setShowWarning(true); setShowImportMenu(true); }}>Import</Btn>
          <input ref={photosInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
            onChange={e => { handleUploadFiles(e.target.files); setShowImportMenu(false); }} />
          <input ref={filesInputRef} type="file" multiple style={{ display: 'none' }}
            onChange={e => { handleUploadFiles(e.target.files); setShowImportMenu(false); }} />
          <Btn color={multiSelect ? '#007aff' : '#8e8e93'} outline={!multiSelect} onClick={() => { setMultiSelect(!multiSelect); setSelected(new Set()); }}>
            Select
          </Btn>
          {multiSelect && selected.size > 0 && (
            <Btn color="#ff3b30" onClick={bulkDelete}>Delete ({selected.size})</Btn>
          )}
        </div>
      </div>

      {/* Import menu overlay */}
      {showImportMenu && (
        <div onClick={() => setShowImportMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px 16px 0 0', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {showWarning && (
              <div style={{ padding: 16, background: '#fff8e1', borderBottom: '1px solid #ffe082', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                  The imported files will not duplicate on iOS or iPadOS, it will just display existing files. Changes are permanent.
                </div>
              </div>
            )}
            <button type="button" onClick={() => { filesInputRef.current?.click(); }}
              style={menuItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Import Files
            </button>
            <button type="button" onClick={() => { photosInputRef.current?.click(); }}
              style={menuItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-8 8"/></svg>
              Choose Photos and Videos
            </button>
            <div style={{ height: 8, background: '#f2f2f7' }} />
            <button type="button" onClick={() => setShowImportMenu(false)} style={{ ...menuItem, color: '#ff3b30', fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {uploadingCount > 0 && (
        <div style={{ padding: 12, background: '#e0f2fe', color: '#0369a1', fontSize: 13, textAlign: 'center' }}>
          Uploading... {uploadingCount} remaining
        </div>
      )}

      {/* File list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8e8e93' }}>Loading...</div>
        ) : files.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8e8e93' }}>
            <div style={{ marginBottom: 12 }}><EmptyIcon /></div>
            <div style={{ fontSize: 15 }}>This folder is empty</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tap Import to add files</div>
          </div>
        ) : (
          <div style={{ background: '#fff' }}>
            {files.map((f, i) => {
              const isChecked = selected.has(f.path);
              return (
                <div key={i} onClick={() => handleFile(f)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
                    borderBottom: i < files.length - 1 ? '1px solid #f2f2f7' : 'none',
                    cursor: 'pointer', minHeight: 56,
                    background: isChecked ? '#e8f0fe' : 'transparent',
                  }}>
                  {multiSelect && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                      border: isChecked ? 'none' : '2px solid #c7c7cc',
                      background: isChecked ? '#007aff' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isChecked && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M2 7l3 3 7-7"/></svg>}
                    </div>
                  )}
                  <div style={{ width: 36, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>{iconFor(f)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renaming === f.path ? (
                      <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                        onBlur={confirmRename}
                        onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenaming(null); }}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 15, fontWeight: 500, border: '1px solid #007aff', borderRadius: 6, padding: '2px 6px', outline: 'none', width: '100%' }} />
                    ) : (
                      <>
                        <div style={{ fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>{f.isDirectory ? 'Folder' : formatSize(f.size)}</div>
                      </>
                    )}
                  </div>
                  {!multiSelect && !renaming && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={e => { e.stopPropagation(); startRename(f); }}
                        style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(f.path); }}
                        style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                  {!multiSelect && f.isDirectory && (
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round"><path d="M2 1l6 6-6 6"/></svg>
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

const Btn: React.FC<{ color: string; outline?: boolean; onClick: () => void; children: React.ReactNode }> = ({ color, outline, onClick, children }) => (
  <button type="button" onClick={onClick} style={{
    padding: '9px 16px', borderRadius: 10,
    background: outline ? 'transparent' : color,
    color: outline ? color : '#fff',
    border: outline ? `1.5px solid ${color}` : 'none',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  }}>{children}</button>
);

const menuItem: React.CSSProperties = {
  width: '100%', padding: '16px 20px', background: '#fff', border: 'none',
  fontSize: 17, color: '#007aff', display: 'flex', alignItems: 'center', gap: 14,
  cursor: 'pointer', borderBottom: '1px solid #f2f2f7', textAlign: 'left',
};

export default MobileFiles;
