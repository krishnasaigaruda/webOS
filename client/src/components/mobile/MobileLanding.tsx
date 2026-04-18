import React, { useState, useRef } from 'react';
import { useStore, applySessionSnapshot } from '../../store/useStore';
import { WebOSLogo, AppIcon } from '../../utils/icons';
import { getMobileApps } from './mobileAppRegistry';

type View = 'landing' | 'signin';

const MobileLanding: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [name, setName] = useState('');
  const [loadError, setLoadError] = useState('');
  const login = useStore(s => s.login);
  const loadInputRef = useRef<HTMLInputElement>(null);

  const apps = getMobileApps();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const nick = name.trim();
    if (!nick) return;
    login(nick, `${nick.toLowerCase().replace(/\s+/g, '')}@webos.local`);
  };

  const handleLoadProfile = async (file: File) => {
    setLoadError('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      applySessionSnapshot(data);
    } catch (e: any) {
      setLoadError(e.message || 'Invalid .webos file');
    }
  };

  // Sign-in screen
  if (view === 'signin') {
    return (
      <div style={styles.authPage}>
        <div style={styles.authOrb1} />
        <div style={styles.authOrb2} />
        <div style={styles.authCard}>
          <WebOSLogo size={52} />
          <h1 style={styles.authH1}>Welcome to webOS</h1>
          <p style={styles.authP}>Pick a nickname to get started</p>
          <form onSubmit={handleCreate} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input style={styles.input} type="text" placeholder="Your nickname" value={name} onChange={e => setName(e.target.value)} maxLength={30} />
            <button type="submit" style={styles.primary} disabled={!name.trim()}>Enter webOS</button>
          </form>
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />
          <button style={styles.secondary} onClick={() => loadInputRef.current?.click()}>
            Load Existing Profile (.webos)
          </button>
          <input ref={loadInputRef} type="file" accept=".webos,application/json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleLoadProfile(f); }} />
          {loadError && <p style={styles.err}>{loadError}</p>}
          <button style={styles.back} onClick={() => setView('landing')}>Back</button>
        </div>
      </div>
    );
  }

  // Marketing / landing
  return (
    <div style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WebOSLogo size={24} />
          <span style={{ fontSize: 17, fontWeight: 700 }}>webOS</span>
        </div>
        <button style={styles.navBtn} onClick={() => setView('signin')}>Launch</button>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.badge}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="#818cf8"><path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5z"/></svg>
          Now with AI-powered assistant
        </div>
        <h1 style={styles.heroTitle}>
          The complete OS<br />
          <span style={styles.heroGradient}>in your browser</span>
        </h1>
        <p style={styles.heroDesc}>
          A full desktop experience with real file management, AI assistant, and professional apps. Built for iPhone, iPad, and Mac.
        </p>
        <button style={styles.primary} onClick={() => setView('signin')}>
          Launch webOS
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 8, verticalAlign: 'middle' }}><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </button>
      </section>

      {/* Stats */}
      <section style={styles.stats}>
        <Stat value={`${apps.length}+`} label="Built-in Apps" />
        <Stat value="60+" label="Tools" />
        <Stat value="AI" label="Assistant" />
      </section>

      {/* Features */}
      <section style={{ padding: '20px 20px 0' }}>
        <h2 style={styles.sectionTitle}>Powerful features</h2>
        <p style={styles.sectionDesc}>Everything you need in an operating system, running entirely in your browser</p>
        <div style={styles.featureGrid}>
          <Feature appId="ai-chat" title="AI Assistant" desc="Chat, code, analyze, brainstorm — all built into your desktop." />
          <Feature appId="browser" title="Web Browser" desc="Tabbed browser with bookmarks and Google search." />
          <Feature appId="camera" title="Camera & Media" desc="Take photos, record video, browse images, play music." />
          <Feature appId="settings" title="Customizable" desc="Dark mode, 10 accent colors, 9 wallpapers. Make it yours." />
        </div>
      </section>

      {/* Apps grid */}
      <section style={{ padding: '36px 20px 0' }}>
        <h2 style={styles.sectionTitle}>All your apps</h2>
        <p style={styles.sectionDesc}>Photos, Notes, Reminders, Calendar, Music, and more</p>
        <div style={styles.appsGrid}>
          {apps.slice(0, 12).map(a => (
            <div key={a.id} style={styles.appItem}>
              <AppIcon appId={a.id} size={42} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 6 }}>{a.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '36px 20px 0' }}>
        <h2 style={styles.sectionTitle}>Good to know</h2>
        <Faq q="Where do my files live?" a="webOS creates a folder on this device and keeps everything there. Your data isn't stuck in browser storage." />
        <Faq q="Does it work offline?" a="Yes, for apps that don't need the internet. Camera, Photos, Notes, Calculator — all work offline." />
        <Faq q="Is my data saved?" a="Yes, across sessions. You can also export a .webos session file and load it on another device." />
      </section>

      {/* CTA */}
      <section style={{ padding: '36px 20px 40px' }}>
        <div style={styles.ctaBox}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ready to try webOS?</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>No download needed. It runs right here.</p>
          <button style={styles.primary} onClick={() => setView('signin')}>Launch webOS</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><WebOSLogo size={16} /><span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>webOS</span></div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Built with React, TypeScript &amp; Node.js</span>
      </footer>
    </div>
  );
};

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div style={{ textAlign: 'center', flex: 1, padding: '18px 8px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
  </div>
);

const Feature: React.FC<{ appId: string; title: string; desc: string }> = ({ appId, title, desc }) => (
  <div style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ marginBottom: 10 }}><AppIcon appId={appId} size={32} /></div>
    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{title}</h3>
    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{desc}</p>
  </div>
);

const Faq: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <div style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{q}</div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{a}</div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'absolute',
    inset: 0,
    background: '#050510',
    color: '#fff',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  bgOrb1: { position: 'fixed', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)', top: -120, left: -100, pointerEvents: 'none' },
  bgOrb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.2), transparent 70%)', top: 180, right: -100, pointerEvents: 'none' },
  bgOrb3: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', bottom: -150, left: '30%', pointerEvents: 'none' },

  nav: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'calc(env(safe-area-inset-top) + 14px) 20px 14px',
    background: 'rgba(5, 5, 16, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 10,
  },
  navBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  },

  hero: {
    textAlign: 'center',
    padding: '40px 24px 24px',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 16,
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    marginBottom: 14,
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: 15,
    lineHeight: 1.55,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 26,
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  stats: {
    display: 'flex',
    gap: 10,
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 18,
    lineHeight: 1.5,
  },

  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  appsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
  },
  appItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.04)',
  },

  ctaBox: {
    padding: '32px 24px',
    borderRadius: 20,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.1))',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center',
  },

  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 28px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'calc(env(safe-area-inset-bottom) + 24px) 20px 24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: 20,
  },

  // Sign-in screen
  authPage: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#050510',
    padding: 24,
  },
  authOrb1: { position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: '#6366f1', filter: 'blur(100px)', opacity: 0.3, top: '-20%', left: '-15%' },
  authOrb2: { position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: '#ec4899', filter: 'blur(100px)', opacity: 0.3, bottom: '-10%', right: '-10%' },
  authCard: {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    padding: 28,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    textAlign: 'center',
    color: '#fff',
  },
  authH1: { fontSize: 24, fontWeight: 700, margin: '10px 0 0' },
  authP: { fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 },
  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
  },
  secondary: {
    width: '100%',
    padding: '13px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.12)',
    cursor: 'pointer',
  },
  back: { fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6 },
  err: { fontSize: 13, color: '#f87171', margin: 0 },
};

export default MobileLanding;
