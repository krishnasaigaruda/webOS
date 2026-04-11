import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { WebOSLogo, AppIcon } from '../../utils/icons';
import { getAllApps } from '../../utils/appRegistry';

const LandingPage: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const login = useStore(s => s.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || 'User', email || 'user@webos.local');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || 'User', email || 'user@webos.local');
  };

  if (view === 'login' || view === 'signup') {
    return (
      <div style={styles.authPage}>
        <div style={styles.authBg} />
        <div style={styles.authCard} className="animate-scaleIn">
          <div style={styles.authLogo}><WebOSLogo size={56} /></div>
          <h1 style={styles.authTitle}>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p style={styles.authSubtitle}>
            {view === 'login' ? 'Sign in to your webOS' : 'Join webOS today'}
          </p>
          <form onSubmit={view === 'login' ? handleLogin : handleSignup} style={styles.authForm}>
            {view === 'signup' && (
              <input
                style={styles.authInput}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            )}
            <input
              style={styles.authInput}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              style={styles.authInput}
              type="password"
              placeholder="Password"
            />
            {view === 'signup' && (
              <input
                style={styles.authInput}
                type="password"
                placeholder="Confirm Password"
              />
            )}
            <button type="submit" style={styles.authButton}>
              {view === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <p style={styles.authSwitch}>
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span
              style={styles.authLink}
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
            >
              {view === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
          <button style={styles.backLink} onClick={() => setView('landing')}>
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgGradient} />
      <div style={styles.bgOrbs}>
        <div style={{ ...styles.orb, ...styles.orb1 }} />
        <div style={{ ...styles.orb, ...styles.orb2 }} />
        <div style={{ ...styles.orb, ...styles.orb3 }} />
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <WebOSLogo size={28} />
          <span style={styles.logoText}>webOS</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#apps" style={styles.navLink}>Apps</a>
          <a href="#about" style={styles.navLink}>About</a>
          <button style={styles.navButton} onClick={() => setView('login')}>Sign In</button>
          <button style={styles.navButtonPrimary} onClick={() => setView('signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent} className="animate-slideUp">
          <div style={styles.badge}>✨ The Future of Computing</div>
          <h1 style={styles.heroTitle}>
            Your entire OS.<br />
            <span style={styles.heroGradient}>In your browser.</span>
          </h1>
          <p style={styles.heroDesc}>
            Experience a full desktop operating system with AI integration, real file sync,
            professional apps, and beautiful design — all running in your web browser.
          </p>
          <div style={styles.heroCTA}>
            <button style={styles.ctaPrimary} onClick={() => setView('signup')}>
              Launch webOS →
            </button>
            <button style={styles.ctaSecondary} onClick={() => setView('login')}>
              Sign In
            </button>
          </div>
        </div>
        <div style={styles.heroPreview} className="animate-fadeIn">
          <div style={styles.previewWindow}>
            <div style={styles.previewTitlebar}>
              <div style={styles.trafficLights}>
                <span style={{ ...styles.light, background: '#FF5F56' }} />
                <span style={{ ...styles.light, background: '#FFBD2E' }} />
                <span style={{ ...styles.light, background: '#27C93F' }} />
              </div>
              <span style={styles.previewTitle}>webOS Desktop</span>
            </div>
            <div style={styles.previewContent}>
              <div style={styles.previewMenubar}>
                <span>webOS  Finder  File  Edit  View</span>
                <span>Fri Apr 11  3:24 PM</span>
              </div>
              <div style={styles.previewDesktop}>
                <div style={styles.miniApp}>Finder</div>
                <div style={styles.miniApp}>Code</div>
                <div style={styles.miniApp}>AI</div>
                <div style={styles.miniApp}>Data</div>
              </div>
              <div style={styles.previewDock}>
                {['Finder', 'Code', 'Web', 'Text', 'Calc', 'Cal', 'AI', 'Set'].map((label, i) => (
                  <span key={i} style={{ ...styles.dockIcon, fontSize: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 6, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>Everything you need</h2>
        <p style={styles.sectionDesc}>A complete operating system experience in your browser</p>
        <div style={styles.featureGrid}>
          {[
            { appId: 'ai-chat', title: 'AI Integrated', desc: 'Built-in AI assistant that can help with anything -- code, writing, analysis, and more.' },
            { appId: 'finder', title: 'Real File Sync', desc: 'Your Mac files synced directly. Create, edit, and manage real files on your machine.' },
            { appId: 'code-editor', title: 'Pro Code Editor', desc: 'Full editor with syntax highlighting, IntelliSense, and multi-language support.' },
            { appId: 'settings', title: 'Beautiful Design', desc: 'Glass morphism, smooth animations, dark/light themes, and customizable accent colors.' },
            { appId: 'data-analyzer', title: 'Data Analysis', desc: 'Built-in spreadsheet, charts, and data analyzer for processing any dataset.' },
            { appId: 'tools-hub', title: 'Developer Tools', desc: 'Terminal, code editor, activity monitor, and integrated development environment.' },
            { appId: 'photos', title: 'Media Suite', desc: 'Photos, camera, music player, and universal file preview.' },
            { appId: 'calendar', title: 'Productivity', desc: 'Calendar, reminders, notes, documents, presentations, and more.' },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}><AppIcon appId={f.appId} size={40} /></div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps" style={styles.appsSection}>
        <h2 style={styles.sectionTitle}>Built-in Apps</h2>
        <p style={styles.sectionDesc}>Every app you need, right out of the box</p>
        <div style={styles.appGrid}>
          {getAllApps().map((app, i) => (
            <div key={i} style={styles.appItem}>
              <span style={styles.appItemIcon}><AppIcon appId={app.id} size={36} /></span>
              <span style={styles.appItemName}>{app.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <WebOSLogo size={24} />
            <span style={{ ...styles.logoText, color: '#fff' }}> webOS</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            © 2026 webOS. Your OS in the browser.
          </p>
          <button style={styles.ctaPrimary} onClick={() => setView('signup')}>
            Get Started Free →
          </button>
        </div>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    background: '#000',
    color: '#fff',
    position: 'relative',
  },
  bgGradient: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,122,255,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  bgOrbs: { position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.3,
  },
  orb1: { width: 600, height: 600, background: '#007AFF', top: '-10%', left: '-10%' },
  orb2: { width: 400, height: 400, background: '#AF52DE', top: '30%', right: '-5%' },
  orb3: { width: 500, height: 500, background: '#30D158', bottom: '-10%', left: '30%' },

  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 40px',
    backdropFilter: 'blur(20px)',
    background: 'rgba(0,0,0,0.6)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 22, fontWeight: 700, color: '#fff' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 24 },
  navLink: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 15, fontWeight: 500 },
  navButton: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
  },
  navButtonPrimary: {
    background: '#007AFF',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    padding: '8px 20px',
    borderRadius: 8,
  },

  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 40px 60px',
    gap: 60,
    position: 'relative',
    zIndex: 1,
  },
  heroContent: { textAlign: 'center' as const, maxWidth: 700 },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: 20,
    background: 'rgba(0,122,255,0.15)',
    color: '#5AC8FA',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 24,
    border: '1px solid rgba(0,122,255,0.3)',
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    marginBottom: 24,
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #007AFF, #AF52DE, #FF2D55)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDesc: {
    fontSize: 20,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 40,
  },
  heroCTA: { display: 'flex', gap: 16, justifyContent: 'center' },
  ctaPrimary: {
    background: 'linear-gradient(135deg, #007AFF, #5856D6)',
    color: '#fff',
    fontSize: 17,
    fontWeight: 600,
    padding: '14px 32px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  ctaSecondary: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 500,
    padding: '14px 32px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
  },

  heroPreview: {
    width: '100%',
    maxWidth: 900,
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
  },
  previewWindow: { background: '#1a1a1a' },
  previewTitlebar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#2a2a2a',
    gap: 12,
  },
  trafficLights: { display: 'flex', gap: 6 },
  light: { width: 12, height: 12, borderRadius: '50%', display: 'inline-block' },
  previewTitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  previewContent: { padding: 0, minHeight: 300 },
  previewMenubar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 16px',
    background: 'rgba(255,255,255,0.05)',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  previewDesktop: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    padding: 40,
    minHeight: 200,
  },
  miniApp: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center' as const,
    fontSize: 14,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  previewDock: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 0 16px',
    background: 'rgba(255,255,255,0.03)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  dockIcon: { fontSize: 28, cursor: 'default' },

  features: {
    padding: '100px 40px',
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: { fontSize: 48, fontWeight: 700, textAlign: 'center' as const, marginBottom: 16 },
  sectionDesc: { fontSize: 18, color: 'rgba(255,255,255,0.5)', textAlign: 'center' as const, marginBottom: 60 },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
    maxWidth: 1200,
    margin: '0 auto',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 32,
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'transform 0.2s, background 0.2s',
  },
  featureIcon: { fontSize: 40, marginBottom: 16 },
  featureTitle: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  featureDesc: { fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 },

  appsSection: {
    padding: '80px 40px 100px',
    position: 'relative',
    zIndex: 1,
  },
  appGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 20,
    maxWidth: 1000,
    margin: '0 auto',
  },
  appItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  appItemIcon: { fontSize: 36 },
  appItemName: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' as const },

  footer: {
    padding: '60px 40px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    zIndex: 1,
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    margin: '0 auto',
  },

  // Auth styles
  authPage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  authBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1628 100%)',
  },
  authCard: {
    position: 'relative',
    width: 400,
    padding: 48,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center' as const,
  },
  authLogo: { fontSize: 48, marginBottom: 16 },
  authTitle: { fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 },
  authSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 32 },
  authForm: { display: 'flex', flexDirection: 'column' as const, gap: 16 },
  authInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
  },
  authButton: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #007AFF, #5856D6)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    marginTop: 8,
  },
  authSwitch: { marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  authLink: { color: '#007AFF', cursor: 'pointer', fontWeight: 600 },
  backLink: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
  },
};

export default LandingPage;
