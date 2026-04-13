import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { WebOSLogo, AppIcon } from '../../utils/icons';
import { getAllApps } from '../../utils/appRegistry';

const LandingPage: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const login = useStore(s => s.login);

  useEffect(() => {
    const handleScroll = (e: Event) => setScrollY((e.target as HTMLElement).scrollTop);
    const el = document.getElementById('landing-scroll');
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); login(name || 'User', email || 'user@webos.local'); };
  const handleSignup = (e: React.FormEvent) => { e.preventDefault(); login(name || 'User', email || 'user@webos.local'); };

  // Auth screens
  if (view === 'login' || view === 'signup') {
    return (
      <div style={s.authPage}>
        <div style={s.authBg}>
          <div style={{ ...s.authOrb, width: 500, height: 500, background: '#6366f1', top: '-20%', left: '-10%' }} />
          <div style={{ ...s.authOrb, width: 400, height: 400, background: '#ec4899', bottom: '-15%', right: '-5%' }} />
        </div>
        <div style={s.authCard} className="animate-scaleIn">
          <WebOSLogo size={52} />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '16px 0 6px' }}>{view === 'login' ? 'Welcome Back' : 'Get Started'}</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>{view === 'login' ? 'Sign in to continue to webOS' : 'Create your webOS account'}</p>
          <form onSubmit={view === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {view === 'signup' && <input style={s.authInput} type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />}
            <input style={s.authInput} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={s.authInput} type="password" placeholder="Password" />
            {view === 'signup' && <input style={s.authInput} type="password" placeholder="Confirm Password" />}
            <button type="submit" style={s.authBtn}>{view === 'login' ? 'Sign In' : 'Create Account'}</button>
          </form>
          <p style={{ marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }} onClick={() => setView(view === 'login' ? 'signup' : 'login')}>
              {view === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
          <button style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', border: 'none', background: 'none' }} onClick={() => setView('landing')}>Back to home</button>
        </div>
      </div>
    );
  }

  const apps = getAllApps();
  const stats = [
    { value: `${apps.length}+`, label: 'Built-in Apps' },
    { value: '60+', label: 'Tools Available' },
    { value: 'AI', label: 'Powered Assistant' },
  ];

  return (
    <div id="landing-scroll" style={s.container}>
      {/* Animated background */}
      <div style={s.bgWrap}>
        <div style={{ ...s.orb, width: 800, height: 800, background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)', top: '-20%', left: '-15%', transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.02}px)` }} />
        <div style={{ ...s.orb, width: 600, height: 600, background: 'radial-gradient(circle, rgba(236,72,153,0.2), transparent 70%)', top: '20%', right: '-10%', transform: `translate(${-scrollY * 0.03}px, ${scrollY * 0.04}px)` }} />
        <div style={{ ...s.orb, width: 700, height: 700, background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)', bottom: '10%', left: '20%', transform: `translate(${scrollY * 0.02}px, ${-scrollY * 0.03}px)` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\' fill=\'rgba(255,255,255,0.03)\'/%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
      </div>

      {/* Nav */}
      <nav style={{ ...s.nav, background: scrollY > 50 ? 'rgba(0,0,0,0.8)' : 'transparent', borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
        <div style={s.navLogo}><WebOSLogo size={28} /><span style={s.logoText}>webOS</span></div>
        <div style={s.navLinks}>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#apps" style={s.navLink}>Apps</a>
          <button style={s.navBtn} onClick={() => setView('login')}>Sign In</button>
          <button style={s.navBtnPrimary} onClick={() => setView('signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div className="animate-slideUp" style={{ textAlign: 'center', maxWidth: 800, zIndex: 1 }}>
          <div style={s.badge}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#818cf8"><path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5z"/></svg>
            Now with AI-powered assistant
          </div>
          <h1 style={s.heroTitle}>
            The complete OS<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in your browser
            </span>
          </h1>
          <p style={s.heroDesc}>
            A full desktop experience with real file management, AI assistant, and
            professional apps. Built for the modern web.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={s.ctaPrimary} onClick={() => setView('signup')}>
              Launch webOS
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </button>
            <button style={s.ctaSecondary} onClick={() => setView('login')}>Sign In</button>
          </div>
        </div>

        {/* Desktop Preview */}
        <div className="animate-fadeIn" style={{ ...s.preview, transform: `perspective(1200px) rotateX(${Math.max(0, 8 - scrollY * 0.03)}deg)` }}>
          <div style={s.prevTitlebar}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: '#ff5f56' }} />
              <span style={{ width: 12, height: 12, borderRadius: 6, background: '#ffbd2e' }} />
              <span style={{ width: 12, height: 12, borderRadius: 6, background: '#27c93f' }} />
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>webOS Desktop</span>
            <div style={{ width: 52 }} />
          </div>
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', minHeight: 340, position: 'relative', padding: 0 }}>
            {/* Fake menubar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 12px', background: 'rgba(0,0,0,0.4)', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <WebOSLogo size={12} />
                <span style={{ fontWeight: 600 }}>Finder</span>
                <span>File</span><span>Edit</span><span>View</span>
              </div>
              <span>Sat Apr 11 2:30 PM</span>
            </div>
            {/* Fake time widget */}
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontSize: 64, fontWeight: 200, color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.3)', fontVariantNumeric: 'tabular-nums' }}>2:30</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Saturday, April 11</div>
            </div>
            {/* Fake windows */}
            <div style={{ position: 'absolute', top: 90, left: 30, width: 220, background: 'rgba(30,30,30,0.95)', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              <div style={{ padding: '6px 10px', background: 'rgba(50,50,50,0.9)', display: 'flex', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#ff5f56' }} />
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#ffbd2e' }} />
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#27c93f' }} />
              </div>
              <div style={{ padding: 10, fontSize: 9, fontFamily: 'monospace', color: '#a5b4fc', lineHeight: 1.6 }}>
                <span style={{ color: '#c084fc' }}>const</span> webOS = {'{\n'}
                {'  '}ai: <span style={{ color: '#34d399' }}>"powered"</span>,{'\n'}
                {'  '}apps: <span style={{ color: '#fbbf24' }}>25</span>{'\n'}
                {'}'};
              </div>
            </div>
            <div style={{ position: 'absolute', top: 100, right: 40, width: 180, background: 'rgba(30,30,30,0.95)', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              <div style={{ padding: '6px 10px', background: 'rgba(50,50,50,0.9)', display: 'flex', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#ff5f56' }} />
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#ffbd2e' }} />
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#27c93f' }} />
              </div>
              <div style={{ padding: 10, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>AI Assistant</div>
                <div style={{ background: 'rgba(99,102,241,0.2)', borderRadius: 6, padding: '6px 8px', fontSize: 9, marginBottom: 4 }}>How can I help?</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '6px 8px', fontSize: 9, textAlign: 'right' }}>Write a function</div>
              </div>
            </div>
            {/* Fake dock */}
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 14, backdropFilter: 'blur(20px)' }}>
              {['finder', 'code-editor', 'browser', 'calculator', 'calendar', 'ai-chat', 'settings'].map(id => (
                <div key={id} style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden' }}><AppIcon appId={id} size={28} /></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {stats.map((st, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 36, fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{st.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 44, fontWeight: 700, marginBottom: 12 }}>Powerful features</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>Everything you need in an operating system, running entirely in your browser</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { appId: 'ai-chat', title: 'AI Assistant', desc: 'Powered by Pollinations AI. Chat, code, analyze, brainstorm - all built into your desktop.', gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.1))' },
            { appId: 'code-editor', title: 'Code Editor', desc: 'Monaco-powered editor with syntax highlighting for 20+ languages. Open any file.', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.1))' },
            { appId: 'settings', title: 'Customizable', desc: 'Dark/light themes, 10 accent colors, 9 wallpapers. Make it yours.', gradient: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(251,146,60,0.1))' },
            { appId: 'browser', title: 'Web Browser', desc: 'Tabbed browser with bookmarks, search, and web proxy for loading any site.', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))' },
            { appId: 'camera', title: 'Media & Camera', desc: 'Take photos, record video, browse images, play music. Full media suite.', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))' },
          ].map((f, i) => (
            <div key={i} style={{ padding: 28, borderRadius: 16, background: f.gradient, border: '1px solid rgba(255,255,255,0.06)', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ marginBottom: 14 }}><AppIcon appId={f.appId} size={44} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Apps Grid */}
      <section id="apps" style={{ padding: '80px 40px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: 44, fontWeight: 700, marginBottom: 12 }}>All your apps</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>Plus 15+ more available in the App Store</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {apps.map((app, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s, transform 0.2s', cursor: 'default' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <AppIcon appId={app.id} size={40} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{app.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 40px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Ready to try webOS?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>No download needed. It runs right here in your browser.</p>
          <button style={s.ctaPrimary} onClick={() => setView('signup')}>
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><WebOSLogo size={20} /><span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>webOS</span></div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Built with React, TypeScript & Node.js</p>
        </div>
      </footer>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  container: { width: '100%', height: '100%', overflow: 'auto', background: '#050510', color: '#fff', position: 'relative' },
  bgWrap: { position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: '50%', transition: 'transform 0.1s linear' },

  nav: { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px', backdropFilter: 'blur(20px)', transition: 'background 0.3s' },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 20, fontWeight: 700 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 20 },
  navLink: { color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
  navBtn: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'none' },
  navBtnPrimary: { background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, padding: '7px 18px', borderRadius: 8, border: 'none' },

  hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 40px 60px', gap: 50, position: 'relative', zIndex: 1 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontSize: 13, fontWeight: 500, marginBottom: 20, border: '1px solid rgba(99,102,241,0.2)' },
  heroTitle: { fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 20 },
  heroDesc: { fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,0.4)', marginBottom: 36, maxWidth: 550, margin: '0 auto 36px' },
  ctaPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 600, padding: '14px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' },
  ctaSecondary: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 500, padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' },

  preview: { width: '100%', maxWidth: 850, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)', transition: 'transform 0.1s linear' },
  prevTitlebar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c1e' },

  authPage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#050510' },
  authBg: { position: 'absolute', inset: 0 },
  authOrb: { position: 'absolute', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.3 },
  authCard: { position: 'relative', width: 380, padding: 40, borderRadius: 20, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' as const },
  authInput: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, outline: 'none' },
  authBtn: { width: '100%', padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4 },
};

export default LandingPage;
