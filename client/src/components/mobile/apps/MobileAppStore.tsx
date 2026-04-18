import React, { useState } from 'react';
import { WindowState, useStore } from '../../../store/useStore';
import { registerApp, getAllApps } from '../../../utils/appRegistry';
import { saveInstalledApps } from '../../../store/useStore';
import { AppIcon } from '../../../utils/icons';
import { isMobileAllowedApp } from '../mobileAppRegistry';

interface StoreApp { id: string; name: string; desc: string; category: string; color: string; installed: boolean }

const ALL_APPS: StoreApp[] = [
  { id: 'chess', name: 'Chess', desc: 'Play chess against a friend', category: 'Games', color: '#1e293b', installed: true },
  { id: '2048', name: '2048', desc: 'Slide tiles to reach 2048', category: 'Games', color: '#edc22e', installed: true },
  { id: 'snake', name: 'Snake', desc: 'Classic snake game with touch controls', category: 'Games', color: '#10b981', installed: true },
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', desc: 'Play tic-tac-toe', category: 'Games', color: '#6366f1', installed: true },
  { id: 'memory-game', name: 'Memory', desc: 'Match pairs memory game', category: 'Games', color: '#8b5cf6', installed: true },
  { id: 'drawing-pad', name: 'Drawing Pad', desc: 'Digital drawing canvas with brushes', category: 'Creative', color: '#ec4899', installed: true },
  { id: 'translator', name: 'Translate', desc: 'Translate between languages', category: 'Utilities', color: '#3b82f6', installed: true },
  { id: 'quiz', name: 'Quiz', desc: 'Test your knowledge with trivia', category: 'Games', color: '#8b5cf6', installed: false },
  { id: 'coin-flip', name: 'Coin Flip', desc: 'Flip a virtual coin', category: 'Games', color: '#d97706', installed: false },
  { id: 'dice-roller', name: 'Dice Roller', desc: 'Roll virtual dice', category: 'Games', color: '#dc2626', installed: false },
  { id: 'typing-test', name: 'Typing Test', desc: 'Test your typing speed', category: 'Games', color: '#f59e0b', installed: false },
  { id: 'whiteboard', name: 'Whiteboard', desc: 'Collaborative whiteboard', category: 'Creative', color: '#64748b', installed: false },
  { id: 'periodic-table', name: 'Periodic Table', desc: 'Interactive periodic table', category: 'Education', color: '#06b6d4', installed: false },
  { id: 'qr-generator', name: 'QR Generator', desc: 'Create QR codes', category: 'Utilities', color: '#1f2937', installed: false },
  { id: 'password-gen', name: 'Password Gen', desc: 'Generate secure passwords', category: 'Utilities', color: '#10b981', installed: false },
].filter(a => isMobileAllowedApp(a.id));

const CATS = ['All', 'Games', 'Creative', 'Utilities', 'Education'];

const MobileAppStore: React.FC<{ window: WindowState }> = () => {
  const { openWindow, addNotification } = useStore();
  const [cat, setCat] = useState('All');
  const [installedSet, setInstalledSet] = useState(() => {
    const reg = new Set(getAllApps().map(a => a.id));
    return new Set(ALL_APPS.filter(a => a.installed || reg.has(a.id)).map(a => a.id));
  });

  const filtered = cat === 'All' ? ALL_APPS : ALL_APPS.filter(a => a.category === cat);

  const install = (app: StoreApp) => {
    registerApp({ id: app.id, name: app.name, icon: app.id, category: 'media', description: app.desc });
    setInstalledSet(prev => { const n = new Set(Array.from(prev)); n.add(app.id); return n; });
    saveInstalledApps(getAllApps());
    addNotification({ title: 'App Store', message: `${app.name} installed`, app: 'app-store' });
  };

  const open = (app: StoreApp) => {
    openWindow(app.id, app.name, app.id);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f2f2f7', color: '#1c1c1e' }}>
      <div style={{ padding: '16px 16px 0', background: '#fff', borderBottom: '1px solid #e5e5ea' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px', color: '#1c1c1e' }}>App Store</h1>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: -1 }}>
          {CATS.map(c => (
            <button key={c} type="button" onClick={() => setCat(c)}
              style={{
                padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: 'none', border: 'none',
                color: cat === c ? '#007aff' : '#8e8e93',
                borderBottom: cat === c ? '2px solid #007aff' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: '#fff', marginTop: 8 }}>
          {filtered.map((app, i) => (
            <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #f2f2f7' : 'none' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <AppIcon appId={app.id} size={52} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1c1c1e' }}>{app.name}</div>
                <div style={{ fontSize: 13, color: '#8e8e93', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                <div style={{ fontSize: 11, color: '#8e8e93', marginTop: 2 }}>{app.category}</div>
              </div>
              {installedSet.has(app.id) ? (
                <button type="button" onClick={() => open(app)} style={openBtn}>Open</button>
              ) : (
                <button type="button" onClick={() => install(app)} style={getBtn}>Get</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getBtn: React.CSSProperties = {
  padding: '7px 20px', borderRadius: 16, background: '#007aff', color: '#fff',
  fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0,
};

const openBtn: React.CSSProperties = {
  padding: '7px 20px', borderRadius: 16, background: '#e5e5ea', color: '#007aff',
  fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0,
};

export default MobileAppStore;
