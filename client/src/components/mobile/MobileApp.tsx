import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import MobileLanding from './MobileLanding';
import MobileShell from './MobileShell';
import './mobile.css';

const MobileApp: React.FC = () => {
  const isLoggedIn = useStore(s => s.isLoggedIn);

  // Unlock AudioContext on first user gesture so reminder sounds work on iOS.
  // iOS blocks AudioContext creation unless triggered by a user interaction.
  useEffect(() => {
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      try {
        const ctx = new AudioContext();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        // Store the context globally so the reminder checker can reuse it
        (window as any).__webos_audio_ctx = ctx;
      } catch {}
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });
    return () => {
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
  }, []);

  // Prevent body scroll bounce on iOS
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // iOS keyboard-close hack: on every touch, if the tap target is NOT an
  // input/textarea/contenteditable, force-dismiss the keyboard.
  // Works even when the focused element is inside a cross-origin iframe (like Google in the browser).
  useEffect(() => {
    // Hidden offscreen input used to steal and immediately release focus,
    // which forces iOS Safari to close any open soft keyboard.
    const ghost = document.createElement('input');
    ghost.setAttribute('readonly', 'true');
    ghost.style.position = 'fixed';
    ghost.style.opacity = '0';
    ghost.style.left = '-9999px';
    ghost.style.top = '-9999px';
    ghost.style.width = '0';
    ghost.style.height = '0';
    document.body.appendChild(ghost);

    const handler = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable;
      if (isEditable) return;
      // Standard blur for same-origin focused elements
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body) {
        try { active.blur(); } catch {}
      }
      // Ghost-focus trick for cross-origin iframe keyboard dismiss
      try { ghost.focus(); ghost.blur(); } catch {}
    };
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handler);
      ghost.remove();
    };
  }, []);

  return (
    <div className="mobile-root">
      {isLoggedIn ? <MobileShell /> : <MobileLanding />}
    </div>
  );
};

export default MobileApp;
