import React, { useState } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { APP_REGISTRY } from '../../utils/appRegistry';
import { AppIcon } from '../../utils/icons';

interface StoreApp {
  id: string;
  name: string;
  developer: string;
  rating: number;
  category: string;
  description: string;
  installed: boolean;
  featured?: boolean;
  color: string;
}

const STORE_APPS: StoreApp[] = [
  { id: 'code-editor', name: 'Code Editor', developer: 'webOS', rating: 4.8, category: 'Developer Tools', description: 'Professional code editor with Monaco, syntax highlighting, and multi-file tabs.', installed: true, featured: true, color: '#0078d4' },
  { id: 'ai-chat', name: 'AI Assistant', developer: 'webOS AI', rating: 4.9, category: 'Productivity', description: 'AI-powered assistant that can help with code, writing, analysis, and OS control.', installed: true, featured: true, color: '#7C3AED' },
  { id: 'spreadsheet', name: 'Spreadsheet', developer: 'webOS', rating: 4.5, category: 'Productivity', description: 'Create and edit spreadsheets with formulas, functions, and data analysis.', installed: true, color: '#2E7D32' },
  { id: 'presentation', name: 'Presentation', developer: 'webOS', rating: 4.3, category: 'Productivity', description: 'Create beautiful presentations with slides, transitions, and present mode.', installed: true, color: '#D84315' },
  { id: 'document', name: 'Document', developer: 'webOS', rating: 4.4, category: 'Productivity', description: 'Rich text document editor with formatting, styles, and export options.', installed: true, color: '#1565C0' },
  { id: 'data-analyzer', name: 'Data Analyzer', developer: 'webOS Labs', rating: 4.6, category: 'Developer Tools', description: 'Analyze CSV, JSON and other data formats with charts and statistics.', installed: true, featured: true, color: '#E65100' },
  { id: 'universal-preview', name: 'Universal Preview', developer: 'webOS Labs', rating: 4.7, category: 'Utilities', description: 'Preview any file type - images, documents, code, media, and more.', installed: true, color: '#283593' },
  { id: 'tools-hub', name: 'Tools Hub', developer: 'webOS Labs', rating: 4.5, category: 'Utilities', description: '60+ tools: color picker, QR generator, JSON formatter, regex tester, and more.', installed: true, color: '#263238' },
  { id: 'camera', name: 'Camera', developer: 'webOS', rating: 4.2, category: 'Photo & Video', description: 'Take photos and videos using your webcam.', installed: true, color: '#37474F' },
  { id: 'music', name: 'Music', developer: 'webOS', rating: 4.1, category: 'Entertainment', description: 'Play and organize your music library.', installed: true, color: '#AD1457' },
  { id: 'maps', name: 'Maps', developer: 'webOS', rating: 4.0, category: 'Navigation', description: 'Explore maps and get directions with OpenStreetMap.', installed: true, color: '#2E7D32' },
  { id: 'dictionary', name: 'Dictionary', developer: 'webOS', rating: 4.3, category: 'Reference', description: 'Look up word definitions, synonyms, and pronunciation.', installed: true, color: '#4E342E' },
  { id: 'screen-recorder', name: 'Screen Recorder', developer: 'webOS', rating: 3.9, category: 'Utilities', description: 'Record your screen for tutorials and presentations.', installed: true, color: '#333' },
  { id: 'screenshot', name: 'Screenshot', developer: 'webOS', rating: 4.1, category: 'Utilities', description: 'Capture your screen or specific areas.', installed: true, color: '#4527A0' },
];

const CATEGORIES = ['All', 'Discover', 'Productivity', 'Developer Tools', 'Utilities', 'Photo & Video', 'Entertainment', 'Reference'];

const AppStoreApp: React.FC<{ window: WindowState }> = () => {
  const [activeCategory, setActiveCategory] = useState('Discover');
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set(STORE_APPS.filter(a => a.installed).map(a => a.id)));
  const [searchQuery, setSearchQuery] = useState('');
  const { openWindow, addNotification } = useStore();

  const handleInstall = (app: StoreApp) => {
    setInstalled(prev => { const s = new Set(Array.from(prev)); s.add(app.id); return s; });
    addNotification({ title: 'App Store', message: `${app.name} installed successfully`, icon: 'settings' });
  };

  const handleOpen = (app: StoreApp) => {
    const reg = APP_REGISTRY[app.id];
    if (reg) openWindow(app.id, reg.name, app.id, { width: reg.defaultWidth, height: reg.defaultHeight });
  };

  const filteredApps = STORE_APPS.filter(app => {
    if (searchQuery) return app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'All' || activeCategory === 'Discover') return true;
    return app.category === activeCategory;
  });

  const featuredApps = STORE_APPS.filter(a => a.featured);

  if (selectedApp) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', background: 'var(--window-content)' }}>
        <div style={{ padding: 24 }}>
          <button style={st.backBtn} onClick={() => setSelectedApp(null)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 1L3 6l5 5"/></svg>
            Back
          </button>
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            <div style={{ width: 128, height: 128, borderRadius: 28, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              <AppIcon appId={selectedApp.id} size={128} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700 }}>{selectedApp.name}</h1>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{selectedApp.developer}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <span style={{ color: '#FFB800', fontSize: 14 }}>{'★'.repeat(Math.round(selectedApp.rating))}{'☆'.repeat(5 - Math.round(selectedApp.rating))}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedApp.rating}</span>
                <span style={st.categoryBadge}>{selectedApp.category}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {installed.has(selectedApp.id) ? (
                  <button style={st.openBtn} onClick={() => handleOpen(selectedApp)}>Open</button>
                ) : (
                  <button style={st.installBtn} onClick={() => handleInstall(selectedApp)}>Get</button>
                )}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>About</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{selectedApp.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--window-content)' }}>
      {/* Sidebar */}
      <div style={st.sidebar}>
        <div style={{ padding: '12px 14px' }}>
          <input
            style={st.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setActiveCategory('All'); }}
          />
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            style={{
              ...st.catBtn,
              background: activeCategory === cat ? 'var(--sidebar-active)' : 'transparent',
              color: activeCategory === cat ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: activeCategory === cat ? 600 : 400,
            }}
            onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {activeCategory === 'Discover' && !searchQuery && (
          <>
            {/* Featured banner */}
            <div style={st.featuredBanner}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>Featured</div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>webOS Apps</h2>
                <p style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>Professional tools built for the web desktop experience</p>
              </div>
            </div>

            {/* Featured row */}
            <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 28, marginBottom: 12 }}>Featured Apps</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {featuredApps.map(app => (
                <div key={app.id} style={st.featuredCard} onClick={() => setSelectedApp(app)}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                    <AppIcon appId={app.id} size={56} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{app.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{app.category}</div>
                    <div style={{ fontSize: 11, color: '#FFB800', marginTop: 4 }}>{'★'.repeat(Math.round(app.rating))} {app.rating}</div>
                  </div>
                  {installed.has(app.id) ? (
                    <button style={st.smallOpenBtn} onClick={(e) => { e.stopPropagation(); handleOpen(app); }}>Open</button>
                  ) : (
                    <button style={st.smallGetBtn} onClick={(e) => { e.stopPropagation(); handleInstall(app); }}>Get</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>
          {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'Discover' ? 'All Apps' : activeCategory}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredApps.map((app, i) => (
            <div key={app.id} style={st.appRow} onClick={() => setSelectedApp(app)}>
              <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <AppIcon appId={app.id} size={48} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{app.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.description}</div>
              </div>
              {installed.has(app.id) ? (
                <button style={st.smallOpenBtn} onClick={(e) => { e.stopPropagation(); handleOpen(app); }}>Open</button>
              ) : (
                <button style={st.smallGetBtn} onClick={(e) => { e.stopPropagation(); handleInstall(app); }}>Get</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 200, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)',
    overflowY: 'auto', flexShrink: 0,
  },
  searchInput: {
    width: '100%', padding: '7px 12px', borderRadius: 8,
    border: 'none', background: 'var(--input-bg)', fontSize: 13,
    outline: 'none', color: 'var(--text-primary)',
  },
  catBtn: {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '7px 14px', fontSize: 13, textAlign: 'left',
    borderRadius: 6, margin: '1px 6px', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  featuredBanner: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
    borderRadius: 16, padding: 32, color: '#fff',
    position: 'relative', overflow: 'hidden',
  },
  featuredCard: {
    display: 'flex', alignItems: 'center', gap: 14, padding: 14,
    borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--card-border)',
    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
  },
  appRow: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px',
    borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s',
    borderBottom: '1px solid var(--border-light)',
  },
  smallGetBtn: {
    padding: '5px 18px', borderRadius: 14, background: 'var(--accent)',
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  smallOpenBtn: {
    padding: '5px 18px', borderRadius: 14, background: 'var(--input-bg)',
    color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
    border: '1px solid var(--accent)',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
    color: 'var(--accent)', cursor: 'pointer', fontWeight: 500,
  },
  categoryBadge: {
    padding: '2px 10px', borderRadius: 10, background: 'var(--input-bg)',
    fontSize: 12, color: 'var(--text-secondary)',
  },
  installBtn: {
    padding: '8px 32px', borderRadius: 18, background: 'var(--accent)',
    color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  openBtn: {
    padding: '8px 32px', borderRadius: 18, background: 'var(--input-bg)',
    color: 'var(--accent)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
    border: '1px solid var(--accent)',
  },
};

export default AppStoreApp;
