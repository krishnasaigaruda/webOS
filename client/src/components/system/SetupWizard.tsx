import React, { useState } from 'react';
import { WebOSLogo } from '../../utils/icons';

interface SetupWizardProps {
  onComplete: () => void;
}

interface PickedItem {
  path: string;
  name: string;
  isFolder: boolean;
}

// Extract the last non-empty segment from a path (handles trailing slashes from AppleScript folders)
function getName(p: string): string {
  const trimmed = p.replace(/\/+$/, '');
  return trimmed.split('/').pop() || trimmed;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'folder' | 'files' | 'done'>('welcome');
  const [chosenFolder, setChosenFolder] = useState<string>('');
  const [pickedFiles, setPickedFiles] = useState<PickedItem[]>([]);
  const [importing, setImporting] = useState(false);

  // Step 2: native folder picker → becomes the webOS sandbox root
  const pickFolder = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/fs/pick-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Choose or create a folder for your webOS files' }),
      });
      const data = await res.json();
      if (data.cancelled || !data.path) return;
      setChosenFolder(data.path);
    } catch {}
  };

  const confirmFolder = async () => {
    if (!chosenFolder) return;
    try {
      await fetch('http://localhost:3001/api/fs/set-root', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: chosenFolder }),
      });
      setStep('files');
    } catch {}
  };

  // Step 3: pick files (or folders)
  const pickFiles = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/fs/pick-any', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'files' }),
      });
      const data = await res.json();
      if (data.cancelled || !data.paths) return;
      const newItems: PickedItem[] = data.paths.map((p: string) => ({
        path: p.replace(/\/+$/, ''),
        name: getName(p),
        isFolder: false,
      }));
      setPickedFiles(prev => [...prev, ...newItems]);
    } catch {}
  };

  const pickFolders = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/fs/pick-any', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'folders' }),
      });
      const data = await res.json();
      if (data.cancelled || !data.paths) return;
      const newItems: PickedItem[] = data.paths.map((p: string) => ({
        path: p.replace(/\/+$/, ''),
        name: getName(p),
        isFolder: true,
      }));
      setPickedFiles(prev => [...prev, ...newItems]);
    } catch {}
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      for (const item of pickedFiles) {
        await fetch('http://localhost:3001/api/fs/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: item.path, name: item.name }),
        });
      }
      setStep('done');
      setTimeout(() => onComplete(), 1500);
    } catch {}
    setImporting(false);
  };

  const handleSkipFiles = () => {
    setStep('done');
    setTimeout(() => onComplete(), 1000);
  };

  const folderName = chosenFolder.split('/').pop() || 'folder';

  return (
    <div style={s.overlay}>
      <div style={s.bg}>
        <div style={{ ...s.orb, width: 600, height: 600, background: '#6366f1', top: '-20%', left: '-10%' }} />
        <div style={{ ...s.orb, width: 500, height: 500, background: '#ec4899', bottom: '-20%', right: '-10%' }} />
      </div>

      {step === 'welcome' && (
        <div className="animate-scaleIn" style={s.card}>
          <WebOSLogo size={72} />
          <h1 style={s.title}>Welcome to webOS</h1>
          <p style={s.subtitle}>
            webOS runs inside a folder on your Mac that you pick. That folder becomes
            "My Files" and is the only place webOS can see.
          </p>
          <div style={s.features}>
            <Feature
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
              title="Sandboxed & Secure"
              desc="webOS can only access files inside the folder you pick."
            />
            <Feature
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>}
              title="Real File Access"
              desc="Edits save directly to your Mac."
            />
            <Feature
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2"/></svg>}
              title="Safe Trash"
              desc="webOS has its own trash. Your Mac trash is untouched."
            />
          </div>
          <button style={{ ...s.primaryBtn, width: '100%', marginTop: 24 }} onClick={() => setStep('folder')}>Get Started</button>
        </div>
      )}

      {step === 'folder' && (
        <div className="animate-scaleIn" style={s.card}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/></svg>
          </div>
          <h1 style={s.title}>Choose Your Folder</h1>
          <p style={s.subtitle}>
            Pick or create a folder on your Mac. This folder becomes "My Files" in webOS.
            Everything you do in webOS stays inside it.
          </p>

          {chosenFolder ? (
            <div style={{ padding: 16, borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', marginTop: 8, marginBottom: 16, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M3 8l3 3 7-7"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#86efac', fontWeight: 600 }}>Selected</div>
                  <div style={{ fontSize: 14, color: '#fff' }}>{folderName}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{chosenFolder}</div>
                </div>
              </div>
            </div>
          ) : null}

          <button style={{ ...s.primaryBtn, width: '100%', marginTop: 8 }} onClick={pickFolder}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 8 }}><path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/></svg>
            {chosenFolder ? 'Choose Different Folder' : 'Choose Folder...'}
          </button>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button style={s.secondaryBtn} onClick={() => setStep('welcome')}>Back</button>
            <button style={{ ...s.primaryBtn, opacity: chosenFolder ? 1 : 0.5 }}
              onClick={confirmFolder} disabled={!chosenFolder}>Continue</button>
          </div>
        </div>
      )}

      {step === 'files' && (
        <div className="animate-scaleIn" style={s.card}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #ec4899, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          </div>
          <h1 style={s.title}>Import Files (Optional)</h1>
          <p style={s.subtitle}>
            Bring existing files into <strong style={{ color: '#818cf8' }}>{folderName}</strong>.
            You can also skip this and add files later from Finder.
          </p>

          {pickedFiles.length > 0 && (
            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16, maxHeight: 140, overflowY: 'auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{pickedFiles.length} selected</span>
                <button style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setPickedFiles([])}>Clear</button>
              </div>
              {pickedFiles.slice(0, 10).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12, color: '#e2e8f0' }}>
                  {item.isFolder ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="#64B5F6"><path d="M1.5 4A1.5 1.5 0 013 2.5h3.5L8.5 5H13A1.5 1.5 0 0114.5 6.5v6A1.5 1.5 0 0113 14H3A1.5 1.5 0 011.5 12.5V4z"/></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="#94a3b8"><path d="M4 1h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z"/></svg>
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
                </div>
              ))}
              {pickedFiles.length > 10 && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>+{pickedFiles.length - 10} more</div>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...s.pickBtn }} onClick={pickFiles}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V5z"/><path d="M8 1v4h4"/></svg>
              Files
            </button>
            <button style={{ ...s.pickBtn }} onClick={pickFolders}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4a1 1 0 011-1h3l1.5 1.5H11a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/></svg>
              Folders
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button style={s.secondaryBtn} onClick={handleSkipFiles}>Skip</button>
            <button style={{ ...s.primaryBtn, opacity: pickedFiles.length > 0 && !importing ? 1 : 0.5 }}
              onClick={handleImport} disabled={pickedFiles.length === 0 || importing}>
              {importing ? 'Importing...' : `Import ${pickedFiles.length || ''}`}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="animate-scaleIn" style={s.card}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: 'linear-gradient(135deg, #22c55e, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M10 20l7 7 13-13"/></svg>
          </div>
          <h1 style={s.title}>All Set!</h1>
          <p style={s.subtitle}>webOS is ready. Launching your desktop...</p>
        </div>
      )}
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div style={s.feature}>
    <div style={s.featureIcon}>{icon}</div>
    <div>
      <div style={s.featureTitle}>{title}</div>
      <div style={s.featureDesc}>{desc}</div>
    </div>
  </div>
);

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, zIndex: 200000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', overflow: 'hidden' },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  orb: { position: 'absolute', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.3 },
  card: { position: 'relative', width: 480, padding: 36, borderRadius: 24, background: 'rgba(20,20,30,0.88)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' as const, color: '#fff' },
  title: { fontSize: 26, fontWeight: 700, margin: '16px 0 8px' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 },
  features: { display: 'flex', flexDirection: 'column' as const, gap: 10, textAlign: 'left' as const, marginTop: 12 },
  feature: { display: 'flex', gap: 12, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' },
  featureIcon: { width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureTitle: { fontSize: 14, fontWeight: 600, color: '#fff' },
  featureDesc: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  primaryBtn: { flex: 1, padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  secondaryBtn: { padding: '12px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  pickBtn: { flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
};

export default SetupWizard;
