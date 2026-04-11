import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import ToolsIframeApp from './ToolsIframeApp';

const LANG: Record<string, string> = {
  js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',
  py:'python',rb:'ruby',go:'go',rs:'rust',c:'c',cpp:'cpp',h:'c',
  java:'java',swift:'swift',kt:'kotlin',php:'php',
  html:'html',css:'css',scss:'scss',json:'json',xml:'xml',
  yaml:'yaml',yml:'yaml',md:'markdown',sql:'sql',sh:'shell',
};

const CodeEditorApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  // If no file path, show Tools Hub code editor
  if (!win.filePath) {
    return <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/code-editor.html" />;
  }

  return <MonacoEditor window={win} />;
};

const MonacoEditor: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [modified, setModified] = useState(false);
  const { theme, updateWindow, addNotification } = useStore();

  useEffect(() => {
    if (win.filePath) {
      api.fs.read(win.filePath).then(data => {
        setContent(data.content || '');
        const ext = win.filePath!.split('.').pop()?.toLowerCase() || '';
        setLanguage(LANG[ext] || 'plaintext');
        updateWindow(win.id, { title: win.filePath!.split('/').pop() || 'Code Editor' });
      }).catch(() => setContent('// Error loading file'));
    }
  }, [win.filePath]); // eslint-disable-line

  const handleSave = async () => {
    if (!win.filePath) return;
    await api.fs.write(win.filePath, content);
    setModified(false);
    addNotification({ title: 'Code Editor', message: `Saved ${win.filePath.split('/').pop()}`, icon: 'code-editor' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: theme === 'dark' ? '#1e1e1e' : '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: theme === 'dark' ? '#252526' : '#f3f3f3', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{win.filePath?.split('/').pop()}{modified ? ' *' : ''}</span>
        <button onClick={handleSave} style={{ padding: '3px 12px', borderRadius: 4, fontSize: 12, background: 'var(--accent)', color: '#fff', cursor: 'pointer', border: 'none' }}>
          Save
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{language}</span>
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={language}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={content}
          onChange={v => { setContent(v || ''); setModified(true); }}
          options={{
            minimap: { enabled: true }, fontSize: 13,
            fontFamily: "'SF Mono', Menlo, monospace",
            wordWrap: 'on', automaticLayout: true, smoothScrolling: true,
            cursorBlinking: 'smooth', roundedSelection: true,
            padding: { top: 8 }, lineNumbers: 'on',
            bracketPairColorization: { enabled: true },
            scrollBeyondLastLine: false, tabSize: 2,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, padding: '2px 12px', fontSize: 11, background: 'var(--accent)', color: '#fff' }}>
        <span>{language}</span>
        <span>UTF-8</span>
        <span>{content.split('\n').length} lines</span>
      </div>
    </div>
  );
};

export default CodeEditorApp;
