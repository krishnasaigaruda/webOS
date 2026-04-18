import React, { useState, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import FilePicker from '../system/FilePicker';

const TextEditApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [content, setContent] = useState('');
  const [modified, setModified] = useState(false);
  const [filePath, setFilePath] = useState(win.filePath || '');
  const [isOpen, setIsOpen] = useState(!!win.filePath);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showSavePicker, setShowSavePicker] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileSize, setFileSize] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const { updateWindow, addNotification } = useStore();

  useEffect(() => {
    if (win.filePath) openFile(win.filePath);
    api.fs.list('/Users/krishna/Documents').then(files => {
      setRecentFiles(files.filter((f: any) =>
        !f.isDirectory && f.name.match(/\.(txt|md|json|js|ts|py|html|css|xml|yaml|yml|toml|sh|env|log|csv)$/i)
      ).slice(0, 10));
    }).catch(() => {});
  }, []); // eslint-disable-line

  const openFile = async (path: string) => {
    setLoadingFile(true);
    setIsOpen(true);
    try {
      // First check file size via info endpoint
      const infoRes = await fetch(`http://localhost:3001/api/fs/info?path=${encodeURIComponent(path)}`);
      const info = await infoRes.json();
      const size = info.size || 0;
      setFileSize(size);

      // Hard cap at 50 MB - refuse to open
      if (size > 50 * 1024 * 1024) {
        setContent(`[File too large to open in TextEdit]\n\nFile size: ${(size / 1024 / 1024).toFixed(1)} MB\nMaximum supported: 50 MB\n\nTry opening this file in a specialized app, or split it into smaller chunks.`);
        setFilePath(path);
        setModified(false);
        setTruncated(true);
        updateWindow(win.id, { title: path.split('/').pop() || 'TextEdit', filePath: path });
        setLoadingFile(false);
        return;
      }

      const res = await fetch(`http://localhost:3001/api/fs/read?path=${encodeURIComponent(path)}&text=true`);
      const data = await res.json();
      setContent(data.content || '');
      setTruncated(!!data.truncated);
      setFilePath(path);
      setModified(false);
      updateWindow(win.id, { title: path.split('/').pop() || 'TextEdit', filePath: path });
      if (data.truncated) {
        addNotification({ title: 'TextEdit', message: `Large file (${(size / 1024 / 1024).toFixed(1)} MB) — showing first 5 MB in read-only mode`, icon: 'textedit' });
      }
    } catch {
      addNotification({ title: 'TextEdit', message: 'Could not open file', icon: 'textedit' });
    }
    setLoadingFile(false);
  };

  const handleSave = async () => {
    if (filePath) {
      await api.fs.write(filePath, content);
      setModified(false);
      addNotification({ title: 'TextEdit', message: `Saved ${filePath.split('/').pop()}`, icon: 'textedit' });
      return;
    }
    // No file path yet — auto-save into the webOS sandbox root as Untitled-<ts>.txt
    try {
      const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
      if (!r.root) throw new Error('webOS folder not configured');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const newPath = `${r.root}/Untitled-${ts}.txt`;
      await api.fs.write(newPath, content);
      setFilePath(newPath);
      updateWindow(win.id, { title: newPath.split('/').pop() || 'TextEdit', filePath: newPath });
      setModified(false);
      addNotification({ title: 'TextEdit', message: `Saved to My Files`, icon: 'textedit' });
    } catch (e: any) {
      addNotification({ title: 'TextEdit', message: `Save failed: ${e.message}`, icon: 'textedit' });
    }
  };

  const handleSaveAs = async (path: string) => {
    setShowSavePicker(false);
    setFilePath(path);
    updateWindow(win.id, { title: path.split('/').pop() || 'TextEdit', filePath: path });
    await api.fs.write(path, content);
    setModified(false);
    addNotification({ title: 'TextEdit', message: `Saved ${path.split('/').pop()}`, icon: 'textedit' });
  };

  const handleNew = () => {
    setContent('');
    setFilePath('');
    setModified(false);
    setIsOpen(true);
    updateWindow(win.id, { title: 'Untitled', filePath: undefined });
  };

  if (!isOpen) {
    return (
      <div style={{ height: '100%', background: '#0f172a', color: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <svg width="56" height="56" viewBox="0 0 64 64" fill="none" opacity="0.3">
          <rect x="14" y="10" width="36" height="44" rx="4" stroke="white" strokeWidth="2.5"/>
          <path d="M22 22h20M22 30h16M22 38h20M22 46h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <h2 style={{ fontSize: 22, fontWeight: 500 }}>TextEdit</h2>
        <p style={{ fontSize: 14, color: '#94a3b8' }}>Open a file or create a new document</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button style={st.primaryBtn} onClick={handleNew}>New Document</button>
          <button style={st.secondaryBtn} onClick={() => setShowOpenPicker(true)}>Open File</button>
        </div>
        {recentFiles.length > 0 && (
          <div style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Recent Files</div>
            {recentFiles.map((f, i) => (
              <div key={i} style={st.recentItem} onClick={() => openFile(f.path)}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" fill="#334155"/><path d="M9 1l4 4H10a1 1 0 01-1-1V1z" fill="#475569"/></svg>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.path}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showOpenPicker && <FilePicker mode="open" title="Open File" onSelect={path => { setShowOpenPicker(false); openFile(path); }} onCancel={() => setShowOpenPicker(false)} />}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      <div style={st.toolbar}>
        <button style={st.btn} onClick={handleNew}>New</button>
        <button style={st.btn} onClick={() => setShowOpenPicker(true)}>Open</button>
        <button style={st.btn} onClick={handleSave}>Save{modified ? ' *' : ''}</button>
        <div style={{ flex: 1 }} />
        <select style={st.select} onChange={e => { const el = document.getElementById('textedit-area') as HTMLTextAreaElement; if (el) el.style.fontSize = e.target.value + 'px'; }} defaultValue="14">
          {[12, 14, 16, 18, 20, 24].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
        </select>
      </div>
      {loadingFile ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #334155', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13 }}>Loading file...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {truncated && (
            <div style={{ padding: '8px 14px', background: '#422006', borderBottom: '1px solid #78350f', fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 1v8M7 12v1"/><circle cx="7" cy="7" r="6"/></svg>
              Cannot load full file — {(fileSize / 1024 / 1024).toFixed(1)} MB is too large. Read-only mode showing first 5 MB.
            </div>
          )}
          <textarea id="textedit-area" style={st.editor} value={content}
            onChange={e => { if (!truncated) { setContent(e.target.value); setModified(true); } }}
            placeholder="Start typing..." spellCheck readOnly={truncated} />
        </>
      )}
      <div style={st.statusBar}>
        <span>{content.length.toLocaleString()} chars | {content.split(/\n/).length.toLocaleString()} lines | {fileSize > 0 ? `${(fileSize / 1024).toFixed(1)} KB` : '0 KB'}</span>
        <span>{filePath ? filePath.split('/').pop() : 'Untitled'}{modified ? ' (modified)' : ''}{truncated ? ' (read-only)' : ''}</span>
      </div>
      {showOpenPicker && <FilePicker mode="open" title="Open File" onSelect={path => { setShowOpenPicker(false); openFile(path); }} onCancel={() => setShowOpenPicker(false)} />}
      {showSavePicker && <FilePicker mode="save" title="Save As" defaultFileName={filePath?.split('/').pop() || 'Untitled.txt'} onSelect={handleSaveAs} onCancel={() => setShowSavePicker(false)} />}
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  toolbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#1e293b', borderBottom: '1px solid #334155' },
  btn: { padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid #475569', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', cursor: 'pointer' },
  select: { padding: '4px 8px', borderRadius: 6, fontSize: 12, border: '1px solid #475569', background: '#0f172a', color: '#e2e8f0', outline: 'none' },
  editor: { flex: 1, padding: 20, border: 'none', outline: 'none', resize: 'none', fontSize: 14, lineHeight: 1.7, background: '#0f172a', color: '#e2e8f0', fontFamily: "'SF Mono', 'JetBrains Mono', Menlo, monospace" },
  statusBar: { display: 'flex', justifyContent: 'space-between', padding: '4px 12px', fontSize: 11, color: '#94a3b8', background: '#1e293b', borderTop: '1px solid #334155' },
  primaryBtn: { padding: '10px 24px', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' },
  secondaryBtn: { padding: '10px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' },
  recentItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' },
};

export default TextEditApp;
