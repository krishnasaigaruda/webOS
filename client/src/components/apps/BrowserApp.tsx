import React, { useState, useRef } from 'react';
import { WindowState } from '../../store/useStore';

interface Tab {
  id: string;
  url: string;
  title: string;
  loading: boolean;
  history: string[];
  historyIndex: number;
}

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com/search?igu=1' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?kae=d' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'MDN', url: 'https://developer.mozilla.org' },
];

let tabCounter = 0;

const BrowserApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const initialUrl = win.filePath
    ? `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(win.filePath)}`
    : 'webos://newtab';
  const initialTitle = win.filePath ? (win.filePath.split('/').pop() || 'File') : 'New Tab';

  const [tabs, setTabs] = useState<Tab[]>([
    { id: `tab-${++tabCounter}`, url: initialUrl, title: initialTitle, loading: false, history: [initialUrl], historyIndex: 0 },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [inputUrl, setInputUrl] = useState(win.filePath ? '' : '');
  const [bookmarks, setBookmarks] = useState(DEFAULT_BOOKMARKS);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const buildUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return 'webos://newtab';
    // If it looks like a URL
    if (/^https?:\/\//.test(trimmed)) return trimmed;
    if (/^[a-z0-9-]+\.[a-z]{2,}/i.test(trimmed) && !trimmed.includes(' ')) {
      return 'https://' + trimmed;
    }
    // Otherwise search via DuckDuckGo HTML (works in iframes)
    return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
  };

  const getProxyUrl = (rawUrl: string): string => {
    if (rawUrl === 'webos://newtab') return 'about:blank';
    if (rawUrl.startsWith('http://localhost:3001')) return rawUrl;
    return `http://localhost:3001/api/proxy?url=${encodeURIComponent(rawUrl)}`;
  };

  const navigate = (input: string, tabId?: string) => {
    const finalUrl = buildUrl(input);
    if (!finalUrl || finalUrl === 'webos://newtab') return;
    const tid = tabId || activeTabId;
    const displayTitle = (() => {
      try { return new URL(finalUrl).hostname.replace('www.', ''); }
      catch { return finalUrl; }
    })();
    setTabs(prev => prev.map(t => {
      if (t.id !== tid) return t;
      const newHistory = [...t.history.slice(0, t.historyIndex + 1), finalUrl];
      return { ...t, url: finalUrl, loading: true, title: displayTitle, history: newHistory, historyIndex: newHistory.length - 1 };
    }));
    setInputUrl(finalUrl);
  };

  const goBack = () => {
    const t = activeTab;
    if (t.historyIndex > 0) {
      const newIdx = t.historyIndex - 1;
      const newUrl = t.history[newIdx];
      setTabs(prev => prev.map(x => x.id === t.id ? { ...x, url: newUrl, historyIndex: newIdx, loading: true } : x));
      setInputUrl(newUrl);
    }
  };

  const goForward = () => {
    const t = activeTab;
    if (t.historyIndex < t.history.length - 1) {
      const newIdx = t.historyIndex + 1;
      const newUrl = t.history[newIdx];
      setTabs(prev => prev.map(x => x.id === t.id ? { ...x, url: newUrl, historyIndex: newIdx, loading: true } : x));
      setInputUrl(newUrl);
    }
  };

  const reload = () => {
    const t = activeTab;
    if (t.url === 'webos://newtab') return;
    setTabs(prev => prev.map(x => x.id === t.id ? { ...x, url: 'about:blank', loading: true } : x));
    setTimeout(() => setTabs(prev => prev.map(x => x.id === t.id ? { ...x, url: t.url } : x)), 50);
  };

  const addTab = () => {
    const newTab: Tab = { id: `tab-${++tabCounter}`, url: 'webos://newtab', title: 'New Tab', loading: false, history: ['webos://newtab'], historyIndex: 0 };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setInputUrl('');
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      const nextTab = newTabs[newTabs.length - 1];
      setActiveTabId(nextTab.id);
      setInputUrl(nextTab.url === 'webos://newtab' ? '' : nextTab.url);
    }
  };

  const switchTab = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) setInputUrl(tab.url === 'webos://newtab' ? '' : tab.url);
  };

  const addBookmark = () => {
    if (activeTab.url === 'webos://newtab') return;
    if (!bookmarks.find(b => b.url === activeTab.url)) {
      setBookmarks([...bookmarks, { name: activeTab.title, url: activeTab.url }]);
    }
  };

  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e293b' }}>
      {/* Tab bar */}
      <div style={s.tabBar}>
        <div style={s.tabList}>
          {tabs.map(tab => (
            <div key={tab.id}
              style={{
                ...s.tab,
                background: tab.id === activeTabId ? '#0f172a' : '#334155',
                borderBottom: tab.id === activeTabId ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onClick={() => switchTab(tab.id)}>
              {tab.loading && <div style={s.spinner} />}
              <span style={s.tabTitle}>{tab.title}</span>
              {tabs.length > 1 && (
                <button style={s.tabClose} onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button style={s.newTabBtn} onClick={addTab}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>
        </button>
      </div>

      {/* URL bar */}
      <div style={s.toolbar}>
        <button style={{ ...s.navBtn, opacity: canGoBack ? 1 : 0.3 }} onClick={goBack} disabled={!canGoBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
        </button>
        <button style={{ ...s.navBtn, opacity: canGoForward ? 1 : 0.3 }} onClick={goForward} disabled={!canGoForward}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 2l5 5-5 5"/></svg>
        </button>
        <button style={s.navBtn} onClick={reload}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 6a5 5 0 10-5 5V9l-3 3 3 3v-2"/></svg>
        </button>
        <div style={s.urlBar}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="5.5" cy="5.5" r="3.5"/><path d="M8 8l3 3"/>
          </svg>
          <input style={s.urlInput} value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigate(inputUrl); }}
            placeholder="Search or enter URL" />
        </div>
        <button style={s.navBtn} onClick={addBookmark} title="Bookmark">
          <svg width="14" height="14" viewBox="0 0 14 14" fill={bookmarks.find(b => b.url === activeTab.url) ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="1.3">
            <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.4 3.4 12l.7-4L1.2 5.2l4-.6z"/>
          </svg>
        </button>
      </div>

      {/* Bookmarks */}
      <div style={s.bookmarksBar}>
        {bookmarks.map((b, i) => (
          <button key={i} style={s.bookmark} onClick={() => navigate(b.url)}
            onContextMenu={(e) => { e.preventDefault(); setBookmarks(bookmarks.filter(bm => bm.url !== b.url)); }}>
            {b.name}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
        {tabs.map(tab => {
          const proxiedUrl = getProxyUrl(tab.url);
          const isVisible = tab.id === activeTabId;
          if (tab.url === 'webos://newtab') {
            return isVisible ? <NewTabPage key={tab.id} onNavigate={navigate} bookmarks={bookmarks} /> : null;
          }
          return (
            <iframe key={tab.id}
              ref={el => { iframeRefs.current[tab.id] = el; }}
              src={proxiedUrl}
              style={{
                width: '100%', height: '100%', border: 'none',
                position: 'absolute', inset: 0,
                display: isVisible ? 'block' : 'none',
                background: '#fff',
              }}
              onLoad={() => setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, loading: false } : t))}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              title={tab.title}
            />
          );
        })}
      </div>
    </div>
  );
};

const NewTabPage: React.FC<{ onNavigate: (url: string) => void; bookmarks: { name: string; url: string }[] }> = ({ onNavigate, bookmarks }) => {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#fff' }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 8, letterSpacing: -1, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>webOS Browser</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>Search the web or enter a URL</p>

      {/* Search box */}
      <div style={{ width: '100%', maxWidth: 600, position: 'relative', marginBottom: 32 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="8" cy="8" r="5.5"/><path d="M12 12l4 4"/>
        </svg>
        <input value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchInput.trim() && onNavigate(searchInput)}
          placeholder="Search Google or type a URL"
          style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 28, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: 15, outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} />
      </div>

      {/* Bookmarks grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, width: '100%', maxWidth: 600 }}>
        {bookmarks.slice(0, 8).map((b, i) => (
          <button key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', cursor: 'pointer', transition: 'background 0.15s' }}
            onClick={() => onNavigate(b.url)}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {b.name.charAt(0)}
            </div>
            <span style={{ fontSize: 11, textAlign: 'center' }}>{b.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  tabBar: { display: 'flex', alignItems: 'center', background: '#1e293b', borderBottom: '1px solid #334155', minHeight: 36 },
  tabList: { display: 'flex', flex: 1, overflowX: 'auto', overflowY: 'hidden' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 0, maxWidth: 200, fontSize: 12, color: '#e2e8f0', borderRight: '1px solid #475569' },
  tabTitle: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  tabClose: { width: 16, height: 16, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, color: '#e2e8f0', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 },
  spinner: { width: 10, height: 10, borderRadius: 5, border: '2px solid #475569', borderTopColor: 'var(--accent)', animation: 'spin 0.6s linear infinite', flexShrink: 0 },
  newTabBtn: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0 },
  toolbar: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: '#0f172a', borderBottom: '1px solid #1e293b' },
  navBtn: { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0 },
  urlBar: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 20, background: '#1e293b', border: '1px solid #334155' },
  urlInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#e2e8f0' },
  bookmarksBar: { display: 'flex', gap: 2, padding: '3px 8px', background: '#0f172a', borderBottom: '1px solid #1e293b', overflowX: 'auto' },
  bookmark: { padding: '3px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer', background: '#1e293b', color: '#94a3b8', border: 'none', whiteSpace: 'nowrap' },
};

export default BrowserApp;
