import React, { useState, useRef } from 'react';
import { WindowState } from '../../store/useStore';

const BrowserApp: React.FC<{ window: WindowState }> = () => {
  const [url, setUrl] = useState('https://www.wikipedia.org');
  const [inputUrl, setInputUrl] = useState('https://www.wikipedia.org');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(['https://www.wikipedia.org']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
      }
    }
    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setLoading(true);
    const newHistory = [...history.slice(0, historyIdx + 1), finalUrl];
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const idx = historyIdx - 1;
      setHistoryIdx(idx);
      setUrl(history[idx]);
      setInputUrl(history[idx]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const idx = historyIdx + 1;
      setHistoryIdx(idx);
      setUrl(history[idx]);
      setInputUrl(history[idx]);
    }
  };

  const bookmarks = [
    { name: 'Google', url: 'https://www.google.com/webhp?igu=1' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={styles.navBtn} onClick={goBack} disabled={historyIdx <= 0}>◀</button>
          <button style={styles.navBtn} onClick={goForward} disabled={historyIdx >= history.length - 1}>▶</button>
          <button style={styles.navBtn} onClick={() => navigate(url)}>↻</button>
        </div>
        <div style={styles.urlBar}>
          {loading && <span style={{ fontSize: 12 }}>⏳</span>}
          <input
            style={styles.urlInput}
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(inputUrl)}
            placeholder="Search or enter URL"
          />
        </div>
      </div>

      {/* Bookmarks */}
      <div style={styles.bookmarks}>
        {bookmarks.map((b, i) => (
          <button key={i} style={styles.bookmark} onClick={() => navigate(b.url)}>
            {b.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          ref={iframeRef}
          src={url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          onLoad={() => setLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          title="Browser"
        />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toolbar: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' },
  navBtn: { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' },
  urlBar: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)' },
  urlInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)' },
  bookmarks: { display: 'flex', gap: 4, padding: '4px 8px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' },
  bookmark: { padding: '3px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'none' },
};

export default BrowserApp;
