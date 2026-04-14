import React, { useEffect, useState, useRef } from 'react';
import { useStore, Notification } from '../../store/useStore';

interface ToastItem extends Notification {
  visible: boolean;
}

const NotificationToasts: React.FC = () => {
  const notifications = useStore(s => s.notifications);
  const clearNotification = useStore(s => s.clearNotification);
  const doNotDisturb = useStore(s => s.doNotDisturb);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const showToast = (n: { id?: string; title: string; message: string; app?: string }) => {
    if (doNotDisturb) return;
    const id = n.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (seenIdsRef.current.has(id)) return;
    seenIdsRef.current.add(id);
    const item: ToastItem = {
      id, title: n.title, message: n.message, app: n.app,
      timestamp: new Date(), read: false, visible: true,
    };
    setToasts(prev => [...prev, item]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 5000);
  };

  // Watch for newly added notifications via Zustand store
  useEffect(() => {
    if (doNotDisturb) return;
    for (const n of notifications) {
      if (!seenIdsRef.current.has(n.id)) {
        showToast(n);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, doNotDisturb]);

  // Fallback path: listen for direct window events fired by the background reminder checker
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail === 'object') showToast(detail);
    };
    window.addEventListener('webos-toast', handler);
    return () => window.removeEventListener('webos-toast', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doNotDisturb]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 36, right: 12, zIndex: 99997,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.slice(-4).map(t => (
        <div key={t.id} style={{
          width: 320,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          color: '#e2e8f0',
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateX(0)' : 'translateX(20px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onClick={() => {
          clearNotification(t.id);
          setToasts(prev => prev.filter(x => x.id !== t.id));
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
          <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToasts;
