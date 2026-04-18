import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import { WebOSLogo } from '../../utils/icons';

interface Props {
  onComplete: () => void;
}

type Step = 'welcome' | 'creating' | 'import' | 'done';

const MobileSetupWizard: React.FC<Props> = ({ onComplete }) => {
  const currentUser = useStore(s => s.currentUser);
  const nickname = currentUser?.name || 'User';

  const [step, setStep] = useState<Step>('welcome');
  const [root, setRoot] = useState<string>('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const filesInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  // Auto-provision the sandbox folder on the server when moving to creating step
  useEffect(() => {
    if (step !== 'creating') return;
    (async () => {
      try {
        const res = await api.fs.createDefaultRoot(nickname);
        if (res.error) throw new Error(res.error);
        setRoot(res.root);
        setStep('import');
      } catch (e: any) {
        setError(e.message || 'Could not create webOS folder');
      }
    })();
  }, [step, nickname]);

  const handleFilesPicked = async (list: FileList | null, subdir: string) => {
    if (!list || list.length === 0 || !root) return;
    setUploading(true);
    setUploadedCount(0);
    const targetDir = subdir ? `${root}/${subdir}` : root;
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      try {
        await api.fs.uploadToPath(f, targetDir);
        count++;
        setUploadedCount(count);
      } catch {}
    }
    setUploading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <WebOSLogo size={52} />

        {step === 'welcome' && (
          <>
            <h1 style={styles.h1}>Welcome, {nickname}</h1>
            <p style={styles.p}>webOS will create a folder on this device to store your files, photos, and app data.</p>
            <button style={styles.primary} onClick={() => setStep('creating')}>Continue</button>
          </>
        )}

        {step === 'creating' && (
          <>
            <h1 style={styles.h1}>Setting up…</h1>
            <p style={styles.p}>Creating your webOS folder.</p>
            {error && <p style={styles.error}>{error}</p>}
          </>
        )}

        {step === 'import' && (
          <>
            <h1 style={styles.h1}>Import Files</h1>
            <p style={styles.p}>Bring in some files to get started. You can skip this and import later from the Files app.</p>
            <p style={styles.rootLine}>Saving to: <code>{root.split('/').pop()}</code></p>

            <button style={styles.secondary} onClick={() => filesInputRef.current?.click()}>
              Import from Files
            </button>
            <input ref={filesInputRef} type="file" multiple style={{ display: 'none' }}
              onChange={e => handleFilesPicked(e.target.files, '')} />

            <button style={styles.secondary} onClick={() => photosInputRef.current?.click()}>
              Import Photos / Videos
            </button>
            <input ref={photosInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
              onChange={e => handleFilesPicked(e.target.files, 'Photos')} />

            {uploading && <p style={styles.status}>Uploading… {uploadedCount} file{uploadedCount === 1 ? '' : 's'}</p>}
            {!uploading && uploadedCount > 0 && <p style={styles.status}>{uploadedCount} file{uploadedCount === 1 ? '' : 's'} imported</p>}

            <button style={styles.primary} onClick={() => setStep('done')}>Continue</button>
          </>
        )}

        {step === 'done' && (
          <>
            <h1 style={styles.h1}>All set</h1>
            <p style={styles.p}>Enjoy webOS on this device.</p>
            <button style={styles.primary} onClick={onComplete}>Enter webOS</button>
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    padding: 24,
    color: '#fff',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 28,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    textAlign: 'center',
  },
  h1: { fontSize: 24, fontWeight: 700, margin: '10px 0 0' },
  p: { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 },
  rootLine: { fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 },
  status: { fontSize: 13, color: '#93c5fd', margin: 0 },
  error: { fontSize: 13, color: '#f87171', margin: 0 },
  primary: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    marginTop: 6,
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
};

export default MobileSetupWizard;
