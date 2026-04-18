import React, { useState, useEffect } from 'react';
import { useStore, applySessionSnapshot } from '../../store/useStore';
import { WebOSLogo, AppIcon } from '../../utils/icons';
import { getAllApps } from '../../utils/appRegistry';
import { api } from '../../utils/api';

const LandingPage: React.FC = () => {
  const [view, setView] = useState<'landing' | 'signin' | 'docs' | 'choose'>('landing');
  const [name, setName] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [loadError, setLoadError] = useState<string>('');
  const login = useStore(s => s.login);
  const setSessionFilePath = useStore(s => s.setSessionFilePath);

  useEffect(() => {
    const handleScroll = (e: Event) => setScrollY((e.target as HTMLElement).scrollTop);
    const el = document.getElementById('landing-scroll');
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // "New profile" — nickname → choose where to save the .webos session file → login
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const nick = name.trim();
    if (!nick) return;
    // Ask where to save the new session file
    const defaultName = `${nick.toLowerCase().replace(/\s+/g, '-')}.webos`;
    const picked = await api.session.pickSave(defaultName);
    if (picked.cancelled || !picked.path) return;
    setSessionFilePath(picked.path);
    login(nick, `${nick.toLowerCase().replace(/\s+/g, '')}@webos.local`);
  };

  // "Load existing profile" — pick a .webos file, apply its contents
  const handleLoadProfile = async () => {
    setLoadError('');
    const picked = await api.session.pickLoad();
    if (picked.cancelled || !picked.path) return;
    const res = await api.session.load(picked.path);
    if (!res.success || !res.data) {
      setLoadError(res.error || 'Could not read that session file.');
      return;
    }
    applySessionSnapshot(res.data);
    setSessionFilePath(picked.path);
    // applySessionSnapshot sets isLoggedIn from the saved state if it was true
  };

  // Docs screen
  if (view === 'docs') {
    return (
      <div style={s.docsPage}>
        <nav style={{ ...s.nav, background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={s.navLogo} onClick={() => setView('landing')}><WebOSLogo size={28} /><span style={s.logoText}>webOS</span></div>
          <div style={s.navLinks}>
            <button style={s.navBtn} onClick={() => setView('landing')}>Home</button>
            <button style={s.navBtnPrimary} onClick={() => setView('choose')}>Get Started</button>
          </div>
        </nav>

        <div style={s.docsWrap}>
          <aside style={s.docsSidebar}>
            <div style={s.docsSidebarTitle}>Docs</div>
            <a href="#what-is-webos" style={s.docsSidebarLink}>What is webOS?</a>
            <a href="#getting-started" style={s.docsSidebarLink}>Getting Started</a>
            <a href="#the-desktop" style={s.docsSidebarLink}>The Desktop</a>
            <a href="#files-and-finder" style={s.docsSidebarLink}>Files & Finder</a>
            <a href="#built-in-apps" style={s.docsSidebarLink}>Built-in Apps</a>
            <a href="#app-store" style={s.docsSidebarLink}>App Store</a>
            <a href="#ai-assistant" style={s.docsSidebarLink}>AI Assistant</a>
            <a href="#camera-and-media" style={s.docsSidebarLink}>Camera & Media</a>
            <a href="#reminders" style={s.docsSidebarLink}>Reminders</a>
            <a href="#settings" style={s.docsSidebarLink}>Settings</a>
            <a href="#shortcuts" style={s.docsSidebarLink}>Keyboard Shortcuts</a>
            <a href="#tips" style={s.docsSidebarLink}>Tips & Tricks</a>
            <a href="#faq" style={s.docsSidebarLink}>FAQ</a>
          </aside>

          <main style={s.docsMain}>
            <h1 style={s.docsH1}>webOS Documentation</h1>
            <p style={s.docsLead}>A complete desktop operating system that runs in your browser —   AI, and 25+ apps.</p>

            <h2 id="what-is-webos" style={s.docsH2}>What is webOS?</h2>
            <p style={s.docsP}>webOS is a full desktop experience built entirely for the browser. It gives you a menu bar, dock, windowed apps, a real file system sandbox, and an AI assistant — all running on React + TypeScript on the client and Node.js on the server. Files you import or create live inside a folder you pick on your Mac, so nothing is stuck in browser storage.</p>

            <h2 id="getting-started" style={s.docsH2}>Getting Started</h2>
            <ol style={s.docsList}>
              <li>Click <b>Get Started</b>, pick a nickname, and press <b>Enter webOS</b>.</li>
              <li>On first launch, a setup wizard asks you to choose a folder on your Mac. This becomes your webOS sandbox — everything you save inside webOS lives there.</li>
              <li>The wizard also lets you import files and folders. Imported items are real symlinks, so you can access them natively on your Mac at the same time.</li>
              <li>You're in. The Dock at the bottom holds your apps, and the Menu Bar at the top holds system actions.</li>
            </ol>

            <h2 id="the-desktop" style={s.docsH2}>The Desktop</h2>
            <p style={s.docsP}>The desktop shows your current wallpaper, a time/weather widget, and shortcut icons. Right-click anywhere for a context menu to change the wallpaper or open Finder. The <b>Menu Bar</b> at the top has the Apple-style menu, system actions, Control Center, Spotlight, and Notification Center.</p>

            <h2 id="files-and-finder" style={s.docsH2}>Files & Finder</h2>
            <p style={s.docsP}>Finder is your file manager. It shows your webOS sandbox as <b>My Files</b>, with sidebar shortcuts and a breadcrumb path bar.</p>
            <ul style={s.docsList}>
              <li><b>Navigate</b> with the back/forward arrows or by double-clicking folders.</li>
              <li><b>Import</b> files or folders from your Mac with the blue Import button — imports are symlinks, so nothing is copied.</li>
              <li><b>New File / New Folder</b> buttons create items in the current directory.</li>
              <li><b>Multi-select</b>: click the checkbox-square button in the toolbar, then tick the files you want. Right-click any selected file for bulk actions (Move to Trash, Duplicate, Copy Paths).</li>
              <li><b>Right-click</b> any file for Rename, Duplicate, Open With, Copy Path, Move to Trash.</li>
              <li><b>Trash</b> is hidden inside the sandbox at <code>.webos-trash</code>. Delete items to move them there — emptying Trash removes them for real.</li>
              <li><b>Live refresh</b>: when another app writes a file, Finder picks it up automatically.</li>
            </ul>

            <h2 id="built-in-apps" style={s.docsH2}>Built-in Apps</h2>
            <p style={s.docsP}>webOS ships with a full suite:</p>
            <ul style={s.docsList}>
              <li><b>TextEdit</b> — simple text editor with file save.</li>
              <li><b>Code Editor</b> — Monaco-powered, syntax highlighting for 20+ languages.</li>
              <li><b>Terminal</b> — command line with access to your sandbox.</li>
              <li><b>Spreadsheet</b>, <b>Document</b>, <b>Data Analyzer</b> — native XLSX, DOCX, and CSV viewers.</li>
              <li><b>Universal Preview</b> — opens almost any file type.</li>
              <li><b>Photos</b> — Library tab for imported images, webOS Camera tab for photos & videos you took with the Camera app.</li>
              <li><b>Camera</b> — take mirrored selfies, record audio-enabled videos. Saves straight to a Camera Roll folder.</li>
              <li><b>Music</b>, <b>Video Player</b>, <b>3D Model Viewer</b> — handle their respective media types.</li>
              <li><b>Web Browser</b> — iframe-based Google search.</li>
              <li><b>Calculator</b>, <b>Calendar</b>, <b>Clock</b>, <b>Weather</b>, <b>Maps</b>, <b>Dictionary</b>, <b>Notes</b>, <b>To Do</b>, <b>Reminders</b>.</li>
              <li><b>Activity Monitor</b> — real CPU/memory/disk stats plus a webOS apps tab.</li>
              <li><b>Settings</b> — appearance, wallpaper, sound, notifications, network, about.</li>
            </ul>

            <h2 id="app-store" style={s.docsH2}>App Store</h2>
            <p style={s.docsP}>The App Store has 15+ installable apps from the Tools-Hub collection — Voice Recorder, Drawing Pad, Whiteboard, Translator, Dice Roller, Graph Plotter, Guitar Tuner, and more. Installed apps appear in Spotlight and the Finder apps sidebar.</p>

            <h2 id="ai-assistant" style={s.docsH2}>AI Assistant</h2>
            <p style={s.docsP}>Open <b>AI Assistant</b> from the Dock for a chat window powered by Pollinations AI. Ask coding questions, get explanations, brainstorm ideas, or just chat. The Data Analyzer app also uses AI to describe data you upload.</p>

            <h2 id="camera-and-media" style={s.docsH2}>Camera & Media</h2>
            <ul style={s.docsList}>
              <li><b>Photo mode</b>: click the big shutter to capture. You get a preview with <b>Retake</b> and <b>Save to Camera Roll</b>.</li>
              <li><b>Video mode</b>: click record, click stop when you're done. Videos auto-save to Camera Roll as <code>.webm</code> — with audio, mirrored to match the preview.</li>
              <li><b>Camera Roll</b>: <code>My Files/Camera Roll/</code>. Photos and videos show up in the Photos app under the <b>webOS Camera</b> tab, and in Finder too.</li>
              <li><b>Voice Recorder</b> (from App Store) → saves recordings to <code>Audio Recordings/</code>.</li>
            </ul>

            <h2 id="reminders" style={s.docsH2}>Reminders</h2>
            <p style={s.docsP}>Open the Reminders app, tap the <b>+</b>, set a title + date + time + repeat option, and save. Reminders fire a toast notification and a double chime at their target time. They work even when the Reminders app is closed — there's a background checker running as long as webOS is open. Reminders persist across sessions.</p>

            <h2 id="settings" style={s.docsH2}>Settings</h2>
            <p style={s.docsP}>Settings has: <b>General</b> (theme, accent color), <b>Appearance</b>, <b>Wallpaper</b> (9 presets), <b>Network</b> (real Mac Wi-Fi toggle), <b>Sound</b> (real Mac volume slider), <b>Notifications</b>, <b>About</b>. The Wi-Fi and volume controls in Settings and Control Center both actually drive your Mac's system settings via AppleScript.</p>

            <h2 id="shortcuts" style={s.docsH2}>Keyboard Shortcuts</h2>
            <ul style={s.docsList}>
              <li><b>⌘ Space</b> — open Spotlight search</li>
              <li><b>⌘ N</b> — new window for the active app</li>
              <li><b>⌘ ,</b> — open Settings</li>
              <li><b>⌘ O</b> — open a file in Finder</li>
            </ul>

            <h2 id="tips" style={s.docsH2}>Tips & Tricks</h2>
            <ul style={s.docsList}>
              <li><b>Right-click the dock</b> on any app to open a new window, switch to an existing one, or quit all of its windows.</li>
              <li><b>Drag windows</b> by their title bar, <b>resize</b> from any corner. Traffic-light buttons close/minimize/maximize.</li>
              <li><b>Spotlight</b> (⌘ Space) searches apps, files, and AI prompts.</li>
              <li><b>Notification Center</b> is accessible via the clock in the Menu Bar.</li>
              <li><b>Activity Monitor</b> can force-quit any webOS window if it hangs.</li>
              <li><b>Imports are symlinks</b>, so editing a file in webOS also edits it on your Mac — and vice versa.</li>
            </ul>

            <h2 id="faq" style={s.docsH2}>FAQ</h2>
            <p style={s.docsQ}>Does webOS save my files somewhere I can access later?</p>
            <p style={s.docsA}>Yes. You choose a real folder on your Mac during setup. Everything in webOS lives there and is visible in Finder.app on your Mac.</p>
            <p style={s.docsQ}>Can I use webOS offline?</p>
            <p style={s.docsA}>Some apps work offline (TextEdit, Calculator, Photos viewer). Apps that call remote services — AI Assistant, Weather, Web Browser — need an internet connection.</p>
            <p style={s.docsQ}>Why do I have to give Chrome camera/microphone permissions?</p>
            <p style={s.docsA}>The Camera and Voice Recorder apps use the browser's real media APIs. Chrome asks once, and the permission persists for <code>localhost:3000</code>. You can revoke it anytime from Chrome's lock icon in the address bar.</p>
            <p style={s.docsQ}>Will my data be lost if I clear browser storage?</p>
            <p style={s.docsA}>Your window layout, open apps, and notifications live in IndexedDB, so clearing it resets the UI — but your actual files are on your Mac's filesystem inside your sandbox folder, untouched.</p>
            <p style={s.docsQ}>How do I get out?</p>
            <p style={s.docsA}>Click the user icon in the Menu Bar → <b>Log Out</b>. You can log back in with the same nickname and everything is where you left it.</p>

            <div style={{ marginTop: 60, padding: 32, borderRadius: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ready to jump in?</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Takes less than 30 seconds to set up.</p>
              <button style={s.ctaPrimary} onClick={() => setView('choose')}>
                Launch webOS
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Profile choice screen — new or existing
  if (view === 'choose') {
    return (
      <div style={s.authPage}>
        <div style={s.authBg}>
          <div style={{ ...s.authOrb, width: 500, height: 500, background: '#6366f1', top: '-20%', left: '-10%' }} />
          <div style={{ ...s.authOrb, width: 400, height: 400, background: '#ec4899', bottom: '-15%', right: '-5%' }} />
        </div>
        <div style={s.authCard} className="animate-scaleIn">
          <WebOSLogo size={52} />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '16px 0 6px' }}>Welcome to webOS</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>Start fresh or pick up where you left off</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={s.authBtn} onClick={() => setView('signin')}>Create New Profile</button>
            <button style={{ ...s.authBtn, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} onClick={handleLoadProfile}>Load Existing Profile (.webos)</button>
          </div>
          {loadError && <p style={{ marginTop: 16, fontSize: 13, color: '#f87171' }}>{loadError}</p>}
          <button style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', border: 'none', background: 'none' }} onClick={() => setView('landing')}>Back to home</button>
        </div>
      </div>
    );
  }

  // Sign-in screen — nickname, then pick save location for .webos session
  if (view === 'signin') {
    return (
      <div style={s.authPage}>
        <div style={s.authBg}>
          <div style={{ ...s.authOrb, width: 500, height: 500, background: '#6366f1', top: '-20%', left: '-10%' }} />
          <div style={{ ...s.authOrb, width: 400, height: 400, background: '#ec4899', bottom: '-15%', right: '-5%' }} />
        </div>
        <div style={s.authCard} className="animate-scaleIn">
          <WebOSLogo size={52} />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '16px 0 6px' }}>New Profile</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>Pick a nickname. You'll choose where to save your session file next.</p>
          <form onSubmit={handleCreateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input style={s.authInput} type="text" placeholder="Your nickname" value={name} onChange={e => setName(e.target.value)} autoFocus maxLength={30} />
            <button type="submit" style={s.authBtn} disabled={!name.trim()}>Continue</button>
          </form>
          <button style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', border: 'none', background: 'none' }} onClick={() => setView('choose')}>Back</button>
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
          <button style={s.navBtn} onClick={() => setView('docs')}>Docs</button>
          <button style={s.navBtnPrimary} onClick={() => setView('choose')}>Get Started</button>
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
            <button style={s.ctaPrimary} onClick={() => setView('choose')}>
              Launch webOS
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </button>
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
          <button style={s.ctaPrimary} onClick={() => setView('choose')}>
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

  docsPage: { width: '100%', height: '100%', overflow: 'auto', background: '#050510', color: '#fff' },
  docsWrap: { display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px', gap: 48 },
  docsSidebar: { width: 220, flexShrink: 0, position: 'sticky', top: 90, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 },
  docsSidebarTitle: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px' },
  docsSidebarLink: { display: 'block', padding: '7px 12px', borderRadius: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  docsMain: { flex: 1, minWidth: 0 },
  docsH1: { fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 },
  docsLead: { fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 40 },
  docsH2: { fontSize: 26, fontWeight: 700, marginTop: 40, marginBottom: 14, letterSpacing: '-0.01em', scrollMarginTop: 80 },
  docsP: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 14 },
  docsList: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, marginBottom: 14, paddingLeft: 22 },
  docsQ: { fontSize: 15, color: '#fff', fontWeight: 600, marginTop: 16, marginBottom: 4 },
  docsA: { fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 8 },

  authPage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#050510' },
  authBg: { position: 'absolute', inset: 0 },
  authOrb: { position: 'absolute', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.3 },
  authCard: { position: 'relative', width: 380, padding: 40, borderRadius: 20, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' as const },
  authInput: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, outline: 'none' },
  authBtn: { width: '100%', padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4 },
};

export default LandingPage;
