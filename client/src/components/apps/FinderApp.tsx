import React, { useState, useEffect, useCallback } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import { AppIcon } from '../../utils/icons';
import { getAllApps, APP_REGISTRY } from '../../utils/appRegistry';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
  mimeType: string;
}

const HOME = '/Users/krishna';

// File type helpers
const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || '';
const isAppBundle = (name: string) => name.endsWith('.app');
const isImageExt = (ext: string) => ['png','jpg','jpeg','gif','svg','webp','bmp','ico','heic','tiff'].includes(ext);
const isVideoExt = (ext: string) => ['mp4','mov','avi','webm','mkv','m4v'].includes(ext);
const isAudioExt = (ext: string) => ['mp3','wav','ogg','flac','aac','m4a','wma'].includes(ext);
const isCodeExt = (ext: string) => ['js','ts','jsx','tsx','py','go','rs','c','cpp','h','java','rb','swift','html','css','json','xml','yaml','yml','toml','sh','sql','md','php','pl','lua','r','scala','kt'].includes(ext);
const isMediaExt = (ext: string) => isImageExt(ext) || isVideoExt(ext) || isAudioExt(ext);

// Compatible apps for "Open With > Browse"
const getCompatibleApps = (ext: string) => {
  const apps: Array<{id: string; name: string}> = [];
  if (!isMediaExt(ext)) {
    apps.push({ id: 'textedit', name: 'TextEdit' });
    apps.push({ id: 'code-editor', name: 'Code Editor' });
    apps.push({ id: 'document', name: 'Document' });
  }
  if (isImageExt(ext)) {
    apps.push({ id: 'photos', name: 'Photos' });
  }
  apps.push({ id: 'universal-preview', name: 'Universal Preview' });
  return apps;
};

const FinderApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [currentPath, setCurrentPath] = useState(win.filePath || HOME);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sidebarTab, setSidebarTab] = useState<'files' | 'webos'>('files');
  const [history, setHistory] = useState<string[]>([win.filePath || HOME]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileItem[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewDialog, setShowNewDialog] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const { openWindow, showContextMenu, updateWindow, addNotification } = useStore();

  const loadFiles = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const data = await api.fs.list(path);
      setFiles(data.sort((a: FileItem, b: FileItem) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      }));
    } catch { setFiles([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFiles(currentPath);
    updateWindow(win.id, { title: currentPath.split('/').pop() || '/' });
  }, [currentPath]); // eslint-disable-line

  const navigate = (path: string) => {
    setCurrentPath(path);
    const newHistory = [...history.slice(0, historyIndex + 1), path];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSelectedFile(null);
  };

  const goBack = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setCurrentPath(history[historyIndex - 1]); } };
  const goForward = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setCurrentPath(history[historyIndex + 1]); } };

  const handleDoubleClick = (file: FileItem) => {
    // .app bundles - don't navigate into them
    if (isAppBundle(file.name)) return;
    if (file.isDirectory) { navigate(file.path); return; }
    const ext = getExt(file.name);
    if (isImageExt(ext)) {
      openWindow('photos', file.name, 'photos', { filePath: file.path });
    } else if (isCodeExt(ext)) {
      openWindow('code-editor', file.name, 'code-editor', { filePath: file.path });
    } else if (isAudioExt(ext)) {
      openWindow('music', file.name, 'music', { filePath: file.path });
    } else {
      openWindow('textedit', file.name, 'textedit', { filePath: file.path });
    }
  };

  const handleCreateFolder = () => { setShowNewDialog('folder'); setNewItemName(''); };
  const handleCreateFile = () => { setShowNewDialog('file'); setNewItemName('untitled.txt'); };
  const handleCreateConfirm = async () => {
    if (!newItemName.trim()) return;
    if (showNewDialog === 'folder') await api.fs.mkdir(`${currentPath}/${newItemName}`);
    else await api.fs.write(`${currentPath}/${newItemName}`, '');
    setShowNewDialog(null);
    loadFiles(currentPath);
  };

  const handleRename = async (oldPath: string, newName: string) => {
    const dir = oldPath.substring(0, oldPath.lastIndexOf('/'));
    await api.fs.rename(oldPath, `${dir}/${newName}`);
    setRenaming(null);
    loadFiles(currentPath);
  };

  const handleDelete = async (filePath: string) => {
    const fileName = filePath.split('/').pop() || '';
    const trashPath = `${HOME}/.Trash/${fileName}`;
    try {
      await api.fs.rename(filePath, trashPath);
    } catch {
      try { await api.fs.copy(filePath, trashPath); await api.fs.delete(filePath); } catch { await api.fs.delete(filePath); }
    }
    loadFiles(currentPath);
    addNotification({ title: 'Finder', message: `${fileName} moved to Trash`, icon: 'finder' });
  };

  const handleFileContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(file.path);
    const ext = getExt(file.name);

    const items: any[] = [
      { label: 'Open', action: () => handleDoubleClick(file) },
    ];

    // Only show "Open With" for non-folder files
    if (!file.isDirectory) {
      const compatApps = getCompatibleApps(ext);
      items.push({
        label: 'Open With',
        submenu: compatApps.map(app => ({
          label: app.name,
          action: () => openWindow(app.id, file.name, app.id, { filePath: file.path }),
        })),
      });
    }

    items.push(
      { separator: true, label: '' },
      { label: 'Get Info', action: () => {}, disabled: true },
      { label: 'Rename', action: () => { setRenaming(file.path); setRenameValue(file.name); } },
      { label: 'Duplicate', action: () => { api.fs.copy(file.path, file.path + ' copy').then(() => loadFiles(currentPath)); } },
      { label: 'Copy Path', action: () => navigator.clipboard.writeText(file.path) },
      { separator: true, label: '' },
      { label: 'Move to Trash', action: () => handleDelete(file.path) },
    );
    showContextMenu(e.clientX, e.clientY, items);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '--';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const sidebarFavorites = [
    { name: 'Desktop', path: `${HOME}/Desktop`, icon: 'desktop' },
    { name: 'Documents', path: `${HOME}/Documents`, icon: 'docs' },
    { name: 'Downloads', path: `${HOME}/Downloads`, icon: 'down' },
    { name: 'Pictures', path: `${HOME}/Pictures`, icon: 'pics' },
    { name: 'Applications', path: '/Applications', icon: 'apps' },
  ];

  const sidebarLocations = [
    { name: 'Macintosh HD', path: '/', icon: 'disk' },
    { name: 'Home', path: HOME, icon: 'home' },
  ];

  // Recursive search via server when query is entered
  useEffect(() => {
    setSelectedFile(null); // Clear selection when search changes
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await api.fs.search(searchQuery, currentPath);
        setSearchResults(results.map((r: any) => ({
          name: r.name, path: r.path, isDirectory: r.isDirectory,
          size: 0, modified: '', mimeType: r.isDirectory ? 'directory' : 'file',
        })));
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPath]); // eslint-disable-line

  const filteredFiles = searchResults !== null ? searchResults : files;

  const webosApps = getAllApps();

  const renderFileIcon = (file: FileItem, size: number = 16) => {
    if (isAppBundle(file.name)) {
      return <AppBundleIcon size={size} />;
    }
    if (file.isDirectory) {
      return <FolderIconSvg size={size} />;
    }
    return <FileIconSvg name={file.name} size={size} />;
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--window-content)', position: 'relative' }}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Sidebar tabs */}
        <div style={styles.sidebarTabs}>
          <button style={{ ...styles.sidebarTabBtn, background: sidebarTab === 'files' ? 'var(--accent)' : 'transparent', color: sidebarTab === 'files' ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setSidebarTab('files')}>Files</button>
          <button style={{ ...styles.sidebarTabBtn, background: sidebarTab === 'webos' ? 'var(--accent)' : 'transparent', color: sidebarTab === 'webos' ? '#fff' : 'var(--text-secondary)' }}
            onClick={() => setSidebarTab('webos')}>webOS Apps</button>
        </div>

        {sidebarTab === 'files' ? (
          <>
            <div style={styles.sidebarLabel}>Favorites</div>
            {sidebarFavorites.map((item, j) => (
              <div key={j} style={{ ...styles.sidebarItem, background: currentPath === item.path ? 'var(--sidebar-active)' : 'transparent', color: currentPath === item.path ? 'var(--accent)' : 'var(--text-primary)', fontWeight: currentPath === item.path ? 500 : 400 }}
                onClick={() => navigate(item.path)}>
                <SidebarIcon type={item.icon} active={currentPath === item.path} />
                <span>{item.name}</span>
              </div>
            ))}
            <div style={styles.sidebarLabel}>Locations</div>
            {sidebarLocations.map((item, j) => (
              <div key={j} style={{ ...styles.sidebarItem, background: currentPath === item.path ? 'var(--sidebar-active)' : 'transparent', color: currentPath === item.path ? 'var(--accent)' : 'var(--text-primary)' }}
                onClick={() => navigate(item.path)}>
                <SidebarIcon type={item.icon} active={currentPath === item.path} />
                <span>{item.name}</span>
              </div>
            ))}
          </>
        ) : (
          <div style={{ padding: '4px 0' }}>
            {webosApps.map(app => (
              <div key={app.id} style={styles.sidebarItem}
                onClick={() => {
                  const reg = APP_REGISTRY[app.id];
                  if (reg) openWindow(app.id, app.name, app.id, { width: reg.defaultWidth, height: reg.defaultHeight });
                }}>
                <AppIcon appId={app.id} size={20} />
                <span style={{ fontSize: 12 }}>{app.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button style={{ ...styles.toolBtn, opacity: historyIndex <= 0 ? 0.3 : 1 }} onClick={goBack}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1L3 6l5 5"/></svg>
            </button>
            <button style={{ ...styles.toolBtn, opacity: historyIndex >= history.length - 1 ? 0.3 : 1 }} onClick={goForward}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 1l5 5-5 5"/></svg>
            </button>
          </div>
          <div style={styles.pathBar}>
            {(() => {
              // Only show selected file's parent path when a file is actually selected during search
              const displayPath = (searchResults !== null && selectedFile)
                ? selectedFile.substring(0, selectedFile.lastIndexOf('/'))
                : currentPath;
              return displayPath.split('/').filter(Boolean).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {i > 0 && <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" style={{flexShrink:0}}><path d="M1 1l4 4-4 4"/></svg>}
                  <span style={{ cursor: 'pointer', fontSize: 13, fontWeight: i === arr.length - 1 ? 600 : 400 }}
                    onClick={() => { setSearchQuery(''); navigate('/' + arr.slice(0, i + 1).join('/')); }}>
                    {part}
                  </span>
                </React.Fragment>
              ));
            })()}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input style={styles.searchInput} placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <div style={{ display: 'flex', gap: 1, background: 'var(--input-bg)', borderRadius: 6, padding: 2 }}>
              <button style={{ ...styles.viewBtn, background: viewMode === 'list' ? 'var(--accent)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setViewMode('list')}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="1.5" rx="0.5"/><rect x="1" y="6" width="12" height="1.5" rx="0.5"/><rect x="1" y="10" width="12" height="1.5" rx="0.5"/></svg>
              </button>
              <button style={{ ...styles.viewBtn, background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setViewMode('grid')}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>
              </button>
            </div>
            <button style={styles.toolBtn} onClick={handleCreateFolder} title="New Folder">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="3" width="12" height="9" rx="1.5"/><path d="M1 5h12M1 3l2-1.5h3L8 3"/><line x1="7" y1="6.5" x2="7" y2="10.5"/><line x1="5" y1="8.5" x2="9" y2="8.5"/></svg>
            </button>
            <button style={styles.toolBtn} onClick={handleCreateFile} title="New File">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="1" width="10" height="12" rx="1.5"/><line x1="7" y1="5" x2="7" y2="9"/><line x1="5" y1="7" x2="9" y2="7"/></svg>
            </button>
          </div>
        </div>

        {/* File list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(loading || searching) ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>{searching ? 'Searching...' : 'Loading...'}</div>
          ) : filteredFiles.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', gap: 8 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><rect x="4" y="8" width="32" height="24" rx="3"/><path d="M4 12h32"/></svg>
              <span style={{ fontSize: 13 }}>This folder is empty</span>
            </div>
          ) : viewMode === 'list' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={{ ...styles.th, width: 90 }}>Size</th>
                  <th style={{ ...styles.th, width: 120 }}>Modified</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, i) => (
                  <tr key={i}
                    style={{ background: selectedFile === file.path ? 'var(--accent)' : i % 2 === 0 ? 'transparent' : 'var(--hover)', color: selectedFile === file.path ? '#fff' : 'var(--text-primary)', cursor: 'default' }}
                    onClick={() => setSelectedFile(file.path)}
                    onDoubleClick={() => handleDoubleClick(file)}
                    onContextMenu={(e) => handleFileContextMenu(e, file)}>
                    <td style={{ padding: '5px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {renderFileIcon(file)}
                      {renaming === file.path ? (
                        <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => handleRename(file.path, renameValue)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRename(file.path, renameValue); if (e.key === 'Escape') setRenaming(null); }}
                          autoFocus onClick={e => e.stopPropagation()}
                          style={{ border: '1px solid var(--accent)', borderRadius: 4, padding: '1px 4px', fontSize: 13, background: 'var(--window-content)', color: 'var(--text-primary)', outline: 'none' }} />
                      ) : file.name}
                    </td>
                    <td style={{ padding: '5px 16px', fontSize: 12, color: selectedFile === file.path ? '#fff' : 'var(--text-secondary)', textAlign: 'right' }}>
                      {file.isDirectory ? '--' : formatSize(file.size)}
                    </td>
                    <td style={{ padding: '5px 16px', fontSize: 12, color: selectedFile === file.path ? '#fff' : 'var(--text-secondary)', textAlign: 'right' }}>
                      {file.modified ? new Date(file.modified).toLocaleDateString() : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 4, padding: 16 }}>
              {filteredFiles.map((file, i) => (
                <div key={i}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, borderRadius: 8, cursor: 'default',
                    background: selectedFile === file.path ? 'var(--accent)' : 'transparent', color: selectedFile === file.path ? '#fff' : 'var(--text-primary)' }}
                  onClick={() => setSelectedFile(file.path)}
                  onDoubleClick={() => handleDoubleClick(file)}
                  onContextMenu={(e) => handleFileContextMenu(e, file)}>
                  {renderFileIcon(file, 40)}
                  <span style={{ fontSize: 11, textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.3 }}>{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.statusBar}>
          <span>{filteredFiles.length} items</span>
          <span style={{ color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%', direction: 'rtl', textAlign: 'right' }}>
            {selectedFile || currentPath}
          </span>
        </div>

        {/* New file/folder dialog */}
        {showNewDialog && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            onClick={() => setShowNewDialog(null)}>
            <div style={{ width: 340, background: 'var(--bg-primary)', borderRadius: 12, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                New {showNewDialog === 'folder' ? 'Folder' : 'File'}
              </h3>
              <input value={newItemName} onChange={e => setNewItemName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateConfirm()}
                placeholder={showNewDialog === 'folder' ? 'Folder name' : 'File name'} autoFocus
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', fontSize: 14, outline: 'none', color: 'var(--text-primary)', marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button style={{ padding: '6px 18px', borderRadius: 6, fontSize: 13, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  onClick={() => setShowNewDialog(null)}>Cancel</button>
                <button style={{ padding: '6px 18px', borderRadius: 6, fontSize: 13, background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontWeight: 600, border: 'none' }}
                  onClick={handleCreateConfirm}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// === SVG Icon Components ===

const SidebarIcon: React.FC<{type: string; active: boolean}> = ({type, active}) => {
  const c = active ? 'var(--accent)' : '#6b7280';
  const icons: Record<string, React.ReactNode> = {
    home: <svg width="15" height="15" viewBox="0 0 16 16" fill={c}><path d="M2 8l6-6 6 6v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8z"/></svg>,
    apps: <svg width="15" height="15" viewBox="0 0 16 16" fill={c}><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
    desktop: <svg width="15" height="15" viewBox="0 0 16 16" fill={c}><rect x="1" y="2" width="14" height="9" rx="1.5"/><line x1="5" y1="14" x2="11" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="11" x2="8" y2="14" stroke={c} strokeWidth="1.5"/></svg>,
    docs: <svg width="15" height="15" viewBox="0 0 16 16" fill={c}><path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z"/></svg>,
    down: <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M8 2v9M5 8l3 3 3-3"/><line x1="2" y1="14" x2="14" y2="14"/></svg>,
    pics: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke={c} strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1.5" fill={c}/><path d="M1 12l4-4 2.5 2.5L10 8l5 6" stroke={c} strokeWidth="1" fill="none"/></svg>,
    disk: <svg width="15" height="15" viewBox="0 0 16 16" fill={c}><rect x="1" y="3" width="14" height="10" rx="2"/><circle cx="12" cy="8" r="1.5" fill={active?'var(--accent)':'#fff'}/></svg>,
  };
  return <span style={{display:'flex',flexShrink:0}}>{icons[type]||icons.docs}</span>;
};

const FolderIconSvg: React.FC<{size?: number}> = ({size = 16}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="#64B5F6">
    <path d="M1.5 4A1.5 1.5 0 013 2.5h3.5L8.5 5H13A1.5 1.5 0 0114.5 6.5v6A1.5 1.5 0 0113 14H3A1.5 1.5 0 011.5 12.5V4z"/>
  </svg>
);

const AppBundleIcon: React.FC<{size?: number}> = ({size = 16}) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <rect x="1" y="1" width="14" height="14" rx="3" fill="url(#appGrad)" />
    <defs><linearGradient id="appGrad" x1="0" y1="0" x2="16" y2="16"><stop stopColor="#42A5F5"/><stop offset="1" stopColor="#1565C0"/></linearGradient></defs>
    <rect x="4" y="4" width="3.5" height="3.5" rx="0.8" fill="rgba(255,255,255,0.5)"/>
    <rect x="8.5" y="4" width="3.5" height="3.5" rx="0.8" fill="rgba(255,255,255,0.5)"/>
    <rect x="4" y="8.5" width="3.5" height="3.5" rx="0.8" fill="rgba(255,255,255,0.5)"/>
    <rect x="8.5" y="8.5" width="3.5" height="3.5" rx="0.8" fill="rgba(255,255,255,0.5)"/>
  </svg>
);

const FileIconSvg: React.FC<{name: string; size?: number}> = ({name, size = 16}) => {
  const ext = getExt(name);
  const colorMap: Record<string, string> = {
    js:'#F7DF1E', ts:'#3178C6', jsx:'#61DAFB', tsx:'#61DAFB', py:'#3776AB',
    html:'#E34F26', css:'#1572B6', json:'#292929', md:'#083FA1', txt:'#888',
    pdf:'#FF0000', doc:'#2B579A', docx:'#2B579A', xls:'#217346', xlsx:'#217346', csv:'#217346',
    png:'#A855F7', jpg:'#A855F7', jpeg:'#A855F7', gif:'#A855F7', svg:'#FFB13B', webp:'#A855F7',
    mp3:'#1DB954', wav:'#1DB954', flac:'#1DB954', ogg:'#1DB954',
    mp4:'#FF6B6B', mov:'#FF6B6B', avi:'#FF6B6B', webm:'#FF6B6B',
    zip:'#F59E0B', tar:'#F59E0B', gz:'#F59E0B', rar:'#F59E0B',
    sh:'#4EAA25', bash:'#4EAA25', zsh:'#4EAA25',
    env:'#EAB308', gitignore:'#F05032', lock:'#888',
    xml:'#E34F26', yaml:'#CB171E', yml:'#CB171E', toml:'#9C4221',
    sql:'#336791', rb:'#CC342D', go:'#00ADD8', rs:'#DEA584',
    java:'#007396', swift:'#FA7343', kt:'#7F52FF', php:'#777BB4',
    plist:'#999', icns:'#42A5F5', dmg:'#888',
  };
  const c = colorMap[ext] || '#9CA3AF';
  const label = ext.slice(0, 4).toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.5"/>
      <path d="M9 1l4 4H10a1 1 0 01-1-1V1z" fill="#e5e7eb"/>
      {ext && <><rect x="3" y="10.5" width={Math.min(label.length * 2.5 + 1, 10)} height="3" rx="0.5" fill={c}/><text x={1.5 + Math.min(label.length * 1.25, 5)} y="13" fill="#fff" fontSize="2.8" textAnchor="middle" fontWeight="700">{label}</text></>}
    </svg>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 200, padding: '0', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)',
    overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column',
  },
  sidebarTabs: {
    display: 'flex', gap: 2, padding: '6px 6px 4px', background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  sidebarTabBtn: {
    flex: 1, padding: '4px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
    cursor: 'pointer', textAlign: 'center', border: 'none',
  },
  sidebarLabel: {
    fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)',
    padding: '8px 14px 4px', textTransform: 'uppercase', letterSpacing: 0.3,
  },
  sidebarItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 14px', fontSize: 13, cursor: 'pointer',
    borderRadius: 6, margin: '1px 6px', transition: 'background 0.15s',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'var(--toolbar-bg)',
  },
  toolBtn: {
    width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-secondary)',
  },
  pathBar: {
    flex: 1, fontSize: 13, display: 'flex', alignItems: 'center', gap: 2,
    overflow: 'hidden', color: 'var(--text-secondary)',
  },
  searchInput: {
    width: 140, padding: '5px 10px', borderRadius: 8,
    border: 'none', background: 'var(--input-bg)', fontSize: 12, outline: 'none', color: 'var(--text-primary)',
  },
  viewBtn: {
    width: 26, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  th: {
    padding: '6px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'left',
    borderBottom: '1px solid var(--border)', position: 'sticky' as any, top: 0, background: 'var(--bg-secondary)',
  },
  statusBar: {
    display: 'flex', justifyContent: 'space-between',
    padding: '4px 16px', fontSize: 11, color: 'var(--text-secondary)',
    borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)',
  },
};

export default FinderApp;
