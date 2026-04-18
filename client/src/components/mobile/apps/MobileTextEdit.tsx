import React, { useEffect, useState, useRef } from 'react';
import { WindowState, useStore } from '../../../store/useStore';
import { api } from '../../../utils/api';

const MobileTextEdit: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [content, setContent] = useState('');
  const [filePath, setFilePath] = useState(win.filePath || '');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { addNotification, updateWindow } = useStore();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load content on mount
  useEffect(() => {
    (async () => {
      if (!win.filePath) {
        setLoaded(true);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3001/api/fs/read?path=${encodeURIComponent(win.filePath)}&text=true`);
        const data = await res.json();
        setContent(data.content || '');
      } catch {}
      setLoaded(true);
    })();
  }, [win.filePath]);

  // Debounced auto-save
  const scheduleSave = (text: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNow(text), 600);
  };

  const saveNow = async (text: string) => {
    setSaving(true);
    try {
      let path = filePath;
      if (!path) {
        // New doc — generate a path inside the webOS sandbox, no picker
        const r = await fetch('http://localhost:3001/api/fs/root').then(r => r.json());
        if (!r.root) throw new Error('webOS folder not configured');
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        path = `${r.root}/Note-${ts}.txt`;
        setFilePath(path);
        updateWindow(win.id, { filePath: path });
      }
      await api.fs.write(path, text);
    } catch (e: any) {
      addNotification({ title: 'TextEdit', message: `Save failed: ${e.message}`, app: 'textedit' });
    }
    setSaving(false);
  };

  const fileName = filePath ? filePath.split('/').pop() : 'Untitled';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', color: '#1c1c1e' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 50px) 16px 10px 70px', borderBottom: '1px solid #e5e5ea', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
          <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>{saving ? 'Saving…' : 'Auto-saved to My Files'}</div>
        </div>
      </div>
      <textarea
        value={content}
        onChange={e => { setContent(e.target.value); scheduleSave(e.target.value); }}
        placeholder={loaded ? 'Start writing…' : 'Loading…'}
        readOnly={!loaded}
        style={{
          flex: 1,
          padding: '16px',
          border: 'none',
          outline: 'none',
          fontSize: 16,
          lineHeight: 1.6,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          background: '#fff',
          color: '#1c1c1e',
          resize: 'none',
          WebkitAppearance: 'none',
        }}
      />
    </div>
  );
};

export default MobileTextEdit;
