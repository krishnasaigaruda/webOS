import React, { useState } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { registerApp, getAllApps } from '../../utils/appRegistry';
import { saveInstalledApps } from '../../store/useStore';
import { AppIcon } from '../../utils/icons';
import { isMobileDevice } from '../../hooks/useDeviceType';
import { isMobileAllowedApp } from '../mobile/mobileAppRegistry';

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
  { id: 'document', name: 'Document', developer: 'webOS', rating: 4.4, category: 'Productivity', description: 'Rich text document editor with formatting, styles, and export options.', installed: true, color: '#1565C0' },
  { id: 'data-analyzer', name: 'Data Analyzer', developer: 'webOS Labs', rating: 4.6, category: 'Developer Tools', description: 'Analyze CSV, JSON and other data formats with charts and statistics.', installed: true, featured: true, color: '#E65100' },
  { id: 'universal-preview', name: 'Universal Preview', developer: 'webOS Labs', rating: 4.7, category: 'Utilities', description: 'Preview any file type - images, documents, code, media, and more.', installed: true, color: '#283593' },
  { id: 'tools-hub', name: 'Tools Hub', developer: 'webOS Labs', rating: 4.5, category: 'Utilities', description: '60+ tools: color picker, QR generator, JSON formatter, regex tester, and more.', installed: false, color: '#263238' },
  { id: 'camera', name: 'Camera', developer: 'webOS', rating: 4.2, category: 'Photo & Video', description: 'Take photos and videos using your webcam.', installed: true, color: '#37474F' },
  { id: 'music', name: 'Music', developer: 'webOS', rating: 4.1, category: 'Entertainment', description: 'Play and organize your music library.', installed: true, color: '#AD1457' },
  { id: 'maps', name: 'Maps', developer: 'webOS', rating: 4.0, category: 'Navigation', description: 'Explore maps and get directions with OpenStreetMap.', installed: true, color: '#2E7D32' },
  { id: 'dictionary', name: 'Dictionary', developer: 'webOS', rating: 4.3, category: 'Reference', description: 'Look up word definitions, synonyms, and pronunciation.', installed: true, color: '#4E342E' },
  { id: 'typing-test', name: 'Typing Test', developer: 'webOS Games', rating: 4.4, category: 'Games', description: 'Test your typing speed and accuracy with real-time WPM tracking.', installed: false, color: '#F59E0B' },
  { id: 'drawing-pad', name: 'Drawing Pad', developer: 'webOS Creative', rating: 4.2, category: 'Creative', description: 'Digital drawing canvas with brushes, colors, and layers.', installed: false, color: '#EC4899' },
  { id: 'whiteboard', name: 'Whiteboard', developer: 'webOS Creative', rating: 4.1, category: 'Creative', description: 'Collaborative whiteboard for brainstorming and sketching.', installed: false, color: '#F3F4F6' },
  { id: 'quiz', name: 'Quiz Game', developer: 'webOS Games', rating: 4.0, category: 'Games', description: 'Test your knowledge with trivia questions across multiple categories.', installed: false, color: '#8B5CF6' },
  { id: 'periodic-table', name: 'Periodic Table', developer: 'webOS Education', rating: 4.5, category: 'Education', description: 'Interactive periodic table with element details and properties.', installed: false, color: '#06B6D4' },
  { id: 'metronome', name: 'Metronome', developer: 'webOS Music', rating: 3.9, category: 'Music', description: 'Precise digital metronome for musicians and practice sessions.', installed: false, color: '#EF4444' },
  { id: 'password-gen', name: 'Password Generator', developer: 'webOS Security', rating: 4.6, category: 'Utilities', description: 'Generate strong, secure passwords with customizable options.', installed: false, color: '#10B981' },
  { id: 'qr-generator', name: 'QR Generator', developer: 'webOS Tools', rating: 4.3, category: 'Utilities', description: 'Create QR codes for URLs, text, contacts, and more.', installed: false, color: '#1F2937' },
  { id: 'translator', name: 'Translator', developer: 'webOS Tools', rating: 4.1, category: 'Utilities', description: 'Translate text between multiple languages instantly.', installed: false, color: '#3B82F6' },
  { id: 'coin-flip', name: 'Coin Flip', developer: 'webOS Games', rating: 3.8, category: 'Games', description: 'Flip a virtual coin with realistic animation. Heads or tails?', installed: false, color: '#D97706' },
  { id: 'dice-roller', name: 'Dice Roller', developer: 'webOS Games', rating: 3.7, category: 'Games', description: 'Roll virtual dice for board games and tabletop RPGs.', installed: false, color: '#DC2626' },
  { id: 'graph-plotter', name: 'Graph Plotter', developer: 'webOS Math', rating: 4.4, category: 'Education', description: 'Plot mathematical functions and equations on interactive graphs.', installed: false, color: '#7C3AED' },
  { id: 'voice-recorder', name: 'Voice Recorder', developer: 'webOS Media', rating: 4.0, category: 'Utilities', description: 'Record audio with your microphone. Save and playback recordings.', installed: false, color: '#EF4444' },
  { id: 'tuner', name: 'Guitar Tuner', developer: 'webOS Music', rating: 4.2, category: 'Music', description: 'Tune your guitar and other instruments with a chromatic tuner.', installed: false, color: '#A855F7' },
];

const CATEGORIES = ['All', 'Discover', 'Productivity', 'Developer Tools', 'Utilities', 'Games', 'Education', 'Creative', 'Music', 'Photo & Video', 'Entertainment', 'Reference'];

const AppStoreApp: React.FC<{ window: WindowState }> = () => {
  const [activeCategory, setActiveCategory] = useState('Discover');
  const mobile = isMobileDevice();
  // On mobile, filter out apps that aren't in the mobile-allowed list
  const visibleApps = mobile ? STORE_APPS.filter(a => isMobileAllowedApp(a.id)) : STORE_APPS;
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  // Check which apps are installed (from default + restored from IndexedDB)
  const [installed, setInstalled] = useState<Set<string>>(() => {
    const registeredIds = new Set(getAllApps().map(a => a.id));
    const defaultInstalled = STORE_APPS.filter(a => a.installed).map(a => a.id);
    return new Set([...defaultInstalled, ...Array.from(registeredIds)].filter(id => STORE_APPS.some(sa => sa.id === id)));
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { openWindow, addNotification } = useStore();

  const handleInstall = (app: StoreApp) => {
    setInstalled(prev => { const s = new Set(Array.from(prev)); s.add(app.id); return s; });
    // Register in the global app registry so it shows in Spotlight and Finder
    registerApp({
      id: app.id,
      name: app.name,
      icon: app.id,
      category: app.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') as any,
      defaultWidth: 800,
      defaultHeight: 600,
      description: app.description,
    });
    addNotification({ title: 'App Store', message: `${app.name} installed successfully`, app: 'app-store' });
    // Persist all installed apps to IndexedDB
    saveInstalledApps(getAllApps());
  };

  const handleOpen = (app: StoreApp) => {
    openWindow(app.id, app.name, app.id, { width: 800, height: 600 });
  };

  const filteredApps = visibleApps.filter(app => {
    if (searchQuery) return app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'All' || activeCategory === 'Discover') return true;
    return app.category === activeCategory;
  });

  const featuredApps = visibleApps.filter(a => a.featured);

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
