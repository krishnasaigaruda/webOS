import React, { useState } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';

const SettingsApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const {
    theme, toggleTheme, accentColor, setAccentColor, wallpaper, setWallpaper,
    currentUser, wifi, doNotDisturb,
    toggleWifi, toggleDoNotDisturb,
  } = useStore();

  const handleWifiToggle = () => {
    const next = !wifi;
    toggleWifi();
    api.system.wifi(next).catch(() => {});
  };
  // If opened with filePath like 'about', go to that section
  const [activeSection, setActiveSection] = useState(win.filePath || 'general');

  const sectionIcons: Record<string, React.ReactNode> = {
    general: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    appearance: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
    wallpaper: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    network: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
notifications: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    about: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  };

  const sections = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'wallpaper', label: 'Wallpaper' },
    { id: 'network', label: 'Network' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'about', label: 'About' },
  ];

  const accentColors = [
    '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30',
    '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7',
  ];

  const wallpapers = [
    { id: 'default', name: 'Default', preview: 'linear-gradient(135deg, #1a1a2e, #533483)' },
    { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #ff6b6b, #ffbe76)' },
    { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #0c2461, #60a3bc)' },
    { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #0a3d0a, #89b868)' },
    { id: 'aurora', name: 'Aurora', preview: 'linear-gradient(135deg, #0f0c29, #44bd6e)' },
    { id: 'cosmic', name: 'Cosmic', preview: 'linear-gradient(135deg, #000428, #004e92)' },
    { id: 'rose', name: 'Rose', preview: 'linear-gradient(135deg, #2c003e, #d9727b)' },
    { id: 'minimal', name: 'Minimal', preview: 'linear-gradient(180deg, #f5f5f7, #e8e8ed)' },
    { id: 'midnight', name: 'Midnight', preview: 'linear-gradient(135deg, #000, #1a1a2e)' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--window-content)', color: 'var(--text-primary)' }}>
      <div style={styles.sidebar}>
        <div style={styles.profile}>
          <div style={styles.avatar}>{currentUser?.avatar || '👤'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{currentUser?.name || 'User'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{currentUser?.email || ''}</div>
          </div>
        </div>
        {sections.map(s => (
          <button
            key={s.id}
            style={{
              ...styles.sectionBtn,
              background: activeSection === s.id ? 'var(--accent)' : 'transparent',
              color: activeSection === s.id ? '#fff' : 'var(--text-primary)',
            }}
            onClick={() => setActiveSection(s.id)}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{sectionIcons[s.id]}</span> {s.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeSection === 'general' && (
          <div>
            <h2 style={styles.title}>General</h2>
            <SettingRow label="Dark Mode" desc="Switch between light and dark themes">
              <Toggle active={theme === 'dark'} onToggle={toggleTheme} />
            </SettingRow>
            <SettingRow label="Do Not Disturb" desc="Silence all notifications">
              <Toggle active={doNotDisturb} onToggle={toggleDoNotDisturb} />
            </SettingRow>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div>
            <h2 style={styles.title}>Appearance</h2>
            <SettingRow label="Theme" desc="Choose your preferred color scheme">
              <div style={{ display: 'flex', gap: 12 }}>
                {['light', 'dark'].map(t => (
                  <button
                    key={t}
                    style={{
                      ...styles.themeBtn,
                      background: t === 'light' ? '#f5f5f7' : '#1c1c1e',
                      border: theme === t ? `2px solid var(--accent)` : '2px solid var(--border)',
                    }}
                    onClick={toggleTheme}
                  >
                    <span style={{ color: t === 'light' ? '#000' : '#fff' }}>{t === 'light' ? 'Light' : 'Dark'}</span>
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Accent Color" desc="Choose your accent color">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {accentColors.map(c => (
                  <button
                    key={c}
                    style={{
                      width: 28, height: 28, borderRadius: 14, background: c, cursor: 'pointer',
                      border: accentColor === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                      outline: accentColor === c ? `2px solid ${c}` : 'none',
                    }}
                    onClick={() => setAccentColor(c)}
                  />
                ))}
              </div>
            </SettingRow>
          </div>
        )}

        {activeSection === 'wallpaper' && (
          <div>
            <h2 style={styles.title}>Wallpaper</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {wallpapers.map(w => (
                <div
                  key={w.id}
                  style={{
                    ...styles.wallpaperCard,
                    background: w.preview,
                    border: wallpaper === w.id ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                  onClick={() => setWallpaper(w.id)}
                >
                  <span style={{ color: '#fff', fontSize: 12, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{w.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'network' && (
          <div>
            <h2 style={styles.title}>Network</h2>
            <SettingRow label="Wi-Fi" desc={wifi ? 'Connected' : 'Off'}>
              <Toggle active={wifi} onToggle={handleWifiToggle} />
            </SettingRow>
          </div>
        )}

{activeSection === 'about' && (
          <div>
            <h2 style={styles.title}>About This webOS</h2>
            <div style={styles.aboutCard}>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>webOS</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Version 1.1.4</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 12 }}>
                  A complete web-based operating system with AI integration
                  and professional applications.
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 16 }}>
                  Built with React, TypeScript, Node.js, and Monaco Editor
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div>
            <h2 style={styles.title}>Notifications</h2>
            <SettingRow label="Allow Notifications" desc="Show notifications from apps">
              <Toggle active={true} onToggle={() => {}} />
            </SettingRow>
            <SettingRow label="Show Previews" desc="Show notification previews on lock screen">
              <Toggle active={true} onToggle={() => {}} />
            </SettingRow>
          </div>
        )}

      </div>
    </div>
  );
};

const SettingRow: React.FC<{ label: string; desc: string; children: React.ReactNode }> = ({ label, desc, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>
    </div>
    {children}
  </div>
);

const Toggle: React.FC<{ active: boolean; onToggle: () => void }> = ({ active, onToggle }) => (
  <button
    style={{
      width: 46, height: 26, borderRadius: 13,
      background: active ? 'var(--accent)' : 'var(--bg-tertiary)',
      cursor: 'pointer', position: 'relative', border: 'none', transition: 'background 0.2s',
    }}
    onClick={onToggle}
  >
    <div style={{
      width: 22, height: 22, borderRadius: 11, background: '#fff',
      position: 'absolute', top: 2, left: active ? 22 : 2,
      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

const styles: Record<string, React.CSSProperties> = {
  sidebar: { width: 220, padding: 12, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)', overflowY: 'auto' },
  profile: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', marginBottom: 12, borderBottom: '1px solid var(--border)' },
  avatar: { width: 40, height: 40, borderRadius: 20, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 },
  sectionBtn: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', textAlign: 'left', marginBottom: 2 },
  content: { flex: 1, padding: 24, overflowY: 'auto' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  themeBtn: { width: 80, height: 60, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24 },
  wallpaperCard: { height: 100, borderRadius: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 8, cursor: 'pointer' },
  aboutCard: { padding: 32, borderRadius: 16, background: 'var(--bg-secondary)', maxWidth: 400, margin: '0 auto' },
};

export default SettingsApp;
