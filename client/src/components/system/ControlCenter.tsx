import React from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../utils/api';

const ControlCenter: React.FC = () => {
  const {
    wifi, doNotDisturb, airplaneMode, volume,
    toggleWifi, toggleDoNotDisturb, toggleAirplaneMode,
    setVolume, toggleControlCenter, theme, toggleTheme,
  } = useStore();

  const handleWifi = () => {
    const newState = !wifi;
    toggleWifi();
    api.system.wifi(newState).catch(() => {});
  };

  const handleDnd = () => {
    const newState = !doNotDisturb;
    toggleDoNotDisturb();
    api.system.dnd(newState).catch(() => {});
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    api.system.volume(v).catch(() => {});
  };

  return (
    <div style={styles.overlay} onClick={toggleControlCenter}>
      <div className="animate-scaleIn" style={styles.panel} onClick={e => e.stopPropagation()}>
        {/* Toggle Grid */}
        <div style={styles.grid}>
          <ToggleTile icon={<WifiIcon />} label="Wi-Fi" active={wifi} sublabel={wifi ? 'Connected' : 'Off'} onClick={handleWifi} />
          <ToggleTile icon={<AirplaneIcon />} label="Airplane" active={airplaneMode} sublabel={airplaneMode ? 'On' : 'Off'} onClick={toggleAirplaneMode} />
          <ToggleTile icon={<MoonIcon />} label="Do Not Disturb" active={doNotDisturb} sublabel={doNotDisturb ? 'On' : 'Off'} onClick={handleDnd} />
          <ToggleTile icon={theme === 'dark' ? <MoonIcon /> : <SunIcon />} label="Dark Mode" active={theme === 'dark'} sublabel={theme === 'dark' ? 'On' : 'Off'} onClick={toggleTheme} />
        </div>

        {/* Volume slider */}
        <div style={styles.sliderSection}>
          <div style={styles.sliderRow}>
            <VolumeIcon />
            <input type="range" min="0" max="100" value={volume}
              onChange={e => handleVolume(Number(e.target.value))} style={{ flex: 1 }} />
          </div>
        </div>

      </div>
    </div>
  );
};

const ToggleTile: React.FC<{
  icon: React.ReactNode; label: string; active: boolean; sublabel: string; onClick: () => void;
}> = ({ icon, label, active, sublabel, onClick }) => (
  <button style={{
    ...tileStyle,
    background: active ? 'var(--accent)' : 'var(--card-bg)',
    color: active ? '#fff' : 'var(--text-primary)',
    border: active ? 'none' : '1px solid var(--card-border)',
  }} onClick={onClick}>
    <span style={{ display: 'flex' }}>{icon}</span>
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontSize: 11, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 10, opacity: 0.7 }}>{sublabel}</div>
    </div>
  </button>
);

const tileStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
  borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
};

// SVG mini icons
const WifiIcon = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM2 6c3.3-3 8.7-3 12 0l-.8.8C10.3 3.8 5.7 3.8 2.8 6.8L2 6zM4.5 8.5c2-1.8 5-1.8 7 0l-.8.8c-1.5-1.3-3.9-1.3-5.4 0l-.8-.8zM6.5 10.5c1-0.8 2-0.8 3 0l-.8.8c-.4-.3-.8-.3-1.2 0l-.8-.8z"/></svg>;
const AirplaneIcon = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M14 7H9.5L7 1H5.5l1.5 6H2.5L1.5 5.5H.5L1.5 8l-1 2.5h1L2.5 9H7l-1.5 6H7l2.5-6H14c.6 0 1-.4 1-1s-.4-1-1-1z"/></svg>;
const MoonIcon = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M6 1C3.2 1.8 1.2 4.4 1.2 7.5c0 3.9 3.2 7 7 7 3.1 0 5.7-2 6.5-4.8-.7.3-1.4.4-2.2.4-3.4 0-6.2-2.8-6.2-6.2 0-.8.1-1.5.4-2.2L6 1z"/></svg>;
const SunIcon = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const VolumeIcon = () => <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M2 5.5v5h2.5l3.5 3V2.5l-3.5 3H2z"/><path d="M10.5 4c1.2 1 2 2.3 2 4s-.8 3-2 4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, zIndex: 99998 },
  panel: {
    position: 'absolute', top: 36, right: 12, width: 320, padding: 14,
    borderRadius: 16, background: 'var(--bg-primary)',
    backdropFilter: 'blur(50px) saturate(200%)',
    WebkitBackdropFilter: 'blur(50px) saturate(200%)',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
  sliderSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  sliderRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--card-border)',
  },
};

export default ControlCenter;
