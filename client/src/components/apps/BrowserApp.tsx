import React, { useState } from 'react';
import { WindowState } from '../../store/useStore';

interface Tab {
  id: string;
  url: string;
  title: string;
  loading: boolean;
}

const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com/webhp?igu=1' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'MDN', url: 'https://developer.mozilla.org' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
];

let tabCounter = 0;

const BrowserApp: React.FC<{ window: WindowState }> = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: `tab-${++tabCounter}`, url: 'about:blank', title: 'New Tab', loading: false },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [inputUrl, setInputUrl] = useState('');
  const [bookmarks, setBookmarks] = useState(DEFAULT_BOOKMARKS);
  const [showBookmarks, setShowBookmarks] = useState(true);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const reload = () => {
    if (activeTab.url && activeTab.url !== 'about:blank') {
      const tid = activeTabId;
      // Force iframe reload by briefly setting to blank
      setTabs(prev => prev.map(t => t.id === tid ? { ...t, url: 'about:blank', loading: true } : t));
      setTimeout(() => setTabs(prev => prev.map(t => t.id === tid ? { ...t, url: activeTab.url } : t)), 50);
    }
  };

  const navigate = (newUrl: string, tabId?: string) => {
    let finalUrl = newUrl.trim();
    if (!finalUrl || finalUrl === 'about:blank') return;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
      }
    }
    const tid = tabId || activeTabId;
    // Use proxy to bypass X-Frame-Options for most sites
    const proxyUrl = `http://localhost:3001/api/proxy?url=${encodeURIComponent(finalUrl)}`;
    const displayTitle = finalUrl.split('/')[2]?.replace('www.', '') || finalUrl;
    setTabs(prev => prev.map(t => t.id === tid ? { ...t, url: proxyUrl, loading: true, title: displayTitle } : t));
    setInputUrl(finalUrl);
  };

  const addTab = () => {
    const newTab: Tab = { id: `tab-${++tabCounter}`, url: 'about:blank', title: 'New Tab', loading: false };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setInputUrl('');
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return; // Don't close last tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setInputUrl(newTabs[newTabs.length - 1].url);
    }
  };

  const switchTab = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) setInputUrl(tab.url);
  };

  const addBookmark = () => {
    if (!bookmarks.find(b => b.url === activeTab.url)) {
      setBookmarks([...bookmarks, { name: activeTab.title, url: activeTab.url }]);
    }
  };

  const removeBookmark = (url: string) => {
    setBookmarks(bookmarks.filter(b => b.url !== url));
  };

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
        <button style={s.navBtn} onClick={() => {/* back */ }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
        </button>
        <button style={s.navBtn} onClick={() => {/* forward */ }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 2l5 5-5 5"/></svg>
        </button>
        <button style={s.navBtn} onClick={reload}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 7a6 6 0 1112 0 6 6 0 01-12 0z"/><path d="M7 3v4"/></svg>
        </button>
        <div style={s.urlBar}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <rect x="1" y="4" width="10" height="7" rx="1.5"/><path d="M3 4V3a3 3 0 016 0v1"/>
          </svg>
          <input style={s.urlInput} value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(inputUrl)}
            placeholder="Search or enter URL" />
        </div>
        <button style={s.navBtn} onClick={addBookmark} title="Bookmark this page">
          <svg width="14" height="14" viewBox="0 0 14 14" fill={bookmarks.find(b => b.url === activeTab.url) ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="1.3">
            <path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.4 3.4 12l.7-4L1.2 5.2l4-.6z"/>
          </svg>
        </button>
        <button style={s.navBtn} onClick={() => setShowBookmarks(!showBookmarks)} title="Bookmarks">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="2" y="1" width="10" height="12" rx="1.5"/><line x1="5" y1="1" x2="5" y2="13"/></svg>
        </button>
      </div>

      {/* Bookmarks bar */}
      {showBookmarks && (
        <div style={s.bookmarksBar}>
          {bookmarks.map((b, i) => (
            <button key={i} style={s.bookmark} onClick={() => navigate(b.url)}
              onContextMenu={(e) => { e.preventDefault(); removeBookmark(b.url); }}>
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Content - iframes for each tab */}
      <div style={{ flex: 1, position: 'relative' }}>
        {tabs.map(tab => (
          <iframe key={tab.id}
            src={tab.url === 'about:blank' ? undefined : tab.url}
            style={{
              width: '100%', height: '100%', border: 'none',
              position: 'absolute', inset: 0,
              display: tab.id === activeTabId ? 'block' : 'none',
            }}
            onLoad={() => setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, loading: false } : t))}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title={tab.title}
          />
        ))}
        {/* New tab page */}
        {activeTab.url === 'about:blank' && (
          <div style={s.newTabPage}>
            <h2 style={{ fontSize: 24, fontWeight: 300, color: '#94a3b8', marginBottom: 24 }}>New Tab</h2>
            <div style={s.shortcuts}>
              {DEFAULT_BOOKMARKS.map((b, i) => (
                <button key={i} style={s.shortcutBtn} onClick={() => navigate(b.url)}>
                  <div style={s.shortcutIcon}>{b.name.charAt(0)}</div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  tabBar: {
    display: 'flex', alignItems: 'center', background: '#1e293b',
    borderBottom: '1px solid #334155', minHeight: 36,
  },
  tabList: {
    display: 'flex', flex: 1, overflowX: 'auto', overflowY: 'hidden',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 0, maxWidth: 200,
    fontSize: 12, color: '#e2e8f0', borderRight: '1px solid #475569',
  },
  tabTitle: {
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
  },
  tabClose: {
    width: 16, height: 16, borderRadius: 3, display: 'flex', alignItems: 'center',
    justifyContent: 'center', opacity: 0.5, color: '#e2e8f0', background: 'none',
    border: 'none', cursor: 'pointer', flexShrink: 0,
  },
  spinner: {
    width: 10, height: 10, borderRadius: 5, border: '2px solid #475569',
    borderTopColor: 'var(--accent)', animation: 'spin 0.6s linear infinite', flexShrink: 0,
  },
  newTabBtn: {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0,
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
    background: '#0f172a', borderBottom: '1px solid #1e293b',
  },
  navBtn: {
    width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', background: 'none',
    border: 'none', flexShrink: 0,
  },
  urlBar: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
    borderRadius: 8, background: '#1e293b', border: '1px solid #334155',
  },
  urlInput: {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#e2e8f0',
  },
  bookmarksBar: {
    display: 'flex', gap: 2, padding: '3px 8px', background: '#0f172a',
    borderBottom: '1px solid #1e293b', overflowX: 'auto',
  },
  bookmark: {
    padding: '3px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
    background: '#1e293b', color: '#94a3b8', border: 'none', whiteSpace: 'nowrap',
  },
  newTabPage: {
    position: 'absolute', inset: 0, background: '#0f172a',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  shortcuts: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
  },
  shortcutBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: 16, borderRadius: 12, cursor: 'pointer', background: '#1e293b',
    border: '1px solid #334155', color: '#e2e8f0', width: 100,
  },
  shortcutIcon: {
    width: 40, height: 40, borderRadius: 10, background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, color: '#fff',
  },
};

export default BrowserApp;
