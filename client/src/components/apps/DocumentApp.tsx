import React, { useState, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import ToolsIframeApp from './ToolsIframeApp';

const DocumentApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  // If no file, show Tools Hub document editor
  if (!win.filePath) {
    return <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/document.html" />;
  }

  // If opened with a file, load it in a rich text editor
  return <RichDocEditor window={win} />;
};

const RichDocEditor: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [content, setContent] = useState('');
  const [modified, setModified] = useState(false);
  const { updateWindow, addNotification } = useStore();

  useEffect(() => {
    if (win.filePath) {
      fetch(`http://localhost:3001/api/fs/read?path=${encodeURIComponent(win.filePath)}&text=true`)
        .then(r => r.json())
        .then(data => {
          setContent(data.content || '');
          updateWindow(win.id, { title: win.filePath!.split('/').pop() || 'Document' });
        }).catch(() => setContent('Error loading file'));
    }
  }, [win.filePath]); // eslint-disable-line

  const handleSave = async () => {
    if (!win.filePath) return;
    const el = document.getElementById(`doc-${win.id}`);
    if (!el) return;
    await api.fs.write(win.filePath, el.innerHTML);
    setModified(false);
    addNotification({ title: 'Document', message: `Saved ${win.filePath.split('/').pop()}`, icon: 'document' });
  };

  const execCmd = (cmd: string, value?: string) => document.execCommand(cmd, false, value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      <div style={s.toolbar}>
        <button style={s.btn} onClick={handleSave}>Save{modified ? ' *' : ''}</button>
        <div style={s.sep} />
        <button style={s.fmtBtn} onClick={() => execCmd('bold')}><b>B</b></button>
        <button style={s.fmtBtn} onClick={() => execCmd('italic')}><i>I</i></button>
        <button style={s.fmtBtn} onClick={() => execCmd('underline')}><u>U</u></button>
        <div style={s.sep} />
        <button style={s.fmtBtn} onClick={() => execCmd('justifyLeft')}>L</button>
        <button style={s.fmtBtn} onClick={() => execCmd('justifyCenter')}>C</button>
        <button style={s.fmtBtn} onClick={() => execCmd('justifyRight')}>R</button>
        <div style={s.sep} />
        <button style={s.fmtBtn} onClick={() => execCmd('insertUnorderedList')}>ul</button>
        <button style={s.fmtBtn} onClick={() => execCmd('insertOrderedList')}>ol</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 20, background: '#1e293b' }}>
        <div style={{ width: '100%', maxWidth: 700, background: '#0f172a', borderRadius: 8, minHeight: 600 }}>
          <div
            id={`doc-${win.id}`}
            contentEditable
            style={s.editor}
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={() => setModified(true)}
            suppressContentEditableWarning
          />
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  toolbar: { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderBottom: '1px solid #334155', background: '#1e293b' },
  btn: { padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid #475569', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', cursor: 'pointer' },
  fmtBtn: { width: 28, height: 28, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, border: '1px solid #475569', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' },
  sep: { width: 1, height: 20, background: '#475569' },
  editor: { padding: 32, outline: 'none', minHeight: 600, fontSize: 15, lineHeight: 1.8, color: '#e2e8f0' },
};

export default DocumentApp;
