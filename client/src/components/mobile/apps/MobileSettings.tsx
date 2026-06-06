import React from 'react';
import { WindowState, useStore } from '../../../store/useStore';

const WALLPAPERS = [
  { id: 'default', name: 'Default', preview: 'linear-gradient(135deg, #1a1a2e, #533483)' },
  { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #ff6b6b, #ffbe76)' },
  { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #0c2461, #60a3bc)' },
  { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #0a3d0a, #89b868)' },
  { id: 'aurora', name: 'Aurora', preview: 'linear-gradient(135deg, #0f0c29, #44bd6e)' },
  { id: 'cosmic', name: 'Cosmic', preview: 'linear-gradient(135deg, #000428, #004e92)' },
  { id: 'rose', name: 'Rose', preview: 'linear-gradient(135deg, #2c003e, #d9727b)' },
  { id: 'midnight', name: 'Midnight', preview: 'linear-gradient(135deg, #000, #1a1a2e)' },
];

const ACCENT_COLORS = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7'];

const MobileSettings: React.FC<{ window: WindowState }> = () => {
  const {
    theme, toggleTheme, accentColor, setAccentColor, wallpaper, setWallpaper,
    doNotDisturb, toggleDoNotDisturb, currentUser,
  } = useStore();

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f2f2f7', color: '#1c1c1e' }}>
      {/* Profile */}
      <div style={{ padding: '20px 16px', background: '#fff', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
            {currentUser?.avatar || '?'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{currentUser?.name || 'User'}</div>
            <div style={{ fontSize: 13, color: '#8e8e93' }}>{currentUser?.email || ''}</div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Dark Mode" right={<Toggle active={theme === 'dark'} onToggle={toggleTheme} />} />
        <Row label="Do Not Disturb" right={<Toggle active={doNotDisturb} onToggle={toggleDoNotDisturb} />} />
      </Section>

      {/* Accent color */}
      <Section title="Accent Color">
        <div style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ACCENT_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setAccentColor(c)}
              style={{
                width: 40, height: 40, borderRadius: 20,
                background: c,
                border: accentColor === c ? '3px solid #1c1c1e' : '3px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </Section>

      {/* Wallpaper */}
      <Section title="Wallpaper">
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {WALLPAPERS.map(w => (
            <button
              key={w.id}
              onClick={() => setWallpaper(w.id)}
              style={{
                height: 100,
                borderRadius: 12,
                background: w.preview,
                border: wallpaper === w.id ? '3px solid #007aff' : '3px solid transparent',
                cursor: 'pointer',
                position: 'relative',
                padding: 0,
              }}
            >
              <span style={{ position: 'absolute', bottom: 8, left: 8, color: '#fff', fontSize: 12, fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{w.name}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <Row label="webOS" right={<span style={{ color: '#8e8e93' }}>Version 1.1.5</span>} />
        <Row label="Device" right={<span style={{ color: '#8e8e93' }}>Mobile</span>} />
      </Section>

      <div style={{ height: 40 }} />
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 13, color: '#8e8e93', padding: '0 16px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
    <div style={{ background: '#fff' }}>{children}</div>
  </div>
);

const Row: React.FC<{ label: string; right: React.ReactNode }> = ({ label, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f2f2f7', minHeight: 48 }}>
    <span style={{ fontSize: 15 }}>{label}</span>
    {right}
  </div>
);

const Toggle: React.FC<{ active: boolean; onToggle: () => void }> = ({ active, onToggle }) => (
  <button
    onClick={onToggle}
    style={{
      width: 50, height: 30, borderRadius: 15,
      background: active ? '#34c759' : '#e5e5ea',
      border: 'none',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s',
    }}
  >
    <div style={{
      position: 'absolute',
      top: 2, left: active ? 22 : 2,
      width: 26, height: 26, borderRadius: 13,
      background: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      transition: 'left 0.2s',
    }} />
  </button>
);

export default MobileSettings;
