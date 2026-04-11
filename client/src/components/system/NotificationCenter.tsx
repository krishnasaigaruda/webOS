import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const {
    notifications, clearNotification, clearAllNotifications,
    toggleNotificationCenter,
  } = useStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={s.overlay} onClick={toggleNotificationCenter}>
      <div className="animate-slideDown" style={s.panel} onClick={e => e.stopPropagation()}>
        {/* Date header */}
        <div style={s.dateSection}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{format(time, 'EEEE')}</div>
          <div style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-secondary)', marginTop: 2 }}>
            {format(time, 'MMMM d')}
          </div>
        </div>

        {/* Notifications */}
        <div style={s.notifSection}>
          <div style={s.notifHeader}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Notifications</span>
            {notifications.length > 0 && (
              <button style={s.clearBtn} onClick={clearAllNotifications}>Clear All</button>
            )}
          </div>
          <div style={s.notifList}>
            {notifications.length === 0 ? (
              <div style={s.empty}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 8 }}>No new notifications</span>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={s.notifItem}>
                  <div style={{ flex: 1 }}>
                    <div style={s.notifTitle}>{n.title}</div>
                    <div style={s.notifMsg}>{n.message}</div>
                    <div style={s.notifTime}>{format(new Date(n.timestamp), 'h:mm a')}</div>
                  </div>
                  <button style={s.dismissBtn} onClick={() => clearNotification(n.id)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, zIndex: 99998 },
  panel: {
    position: 'absolute', top: 36, right: 12, width: 340,
    maxHeight: 'calc(100vh - 100px)',
    borderRadius: 16, overflow: 'hidden',
    background: 'var(--bg-primary)',
    backdropFilter: 'blur(50px) saturate(200%)',
    WebkitBackdropFilter: 'blur(50px) saturate(200%)',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    display: 'flex', flexDirection: 'column',
  },
  dateSection: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--border-light)',
  },
  notifSection: {
    display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
  },
  notifHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px 8px',
  },
  clearBtn: {
    fontSize: 13, color: 'var(--accent)', cursor: 'pointer', fontWeight: 500,
    padding: '2px 8px', borderRadius: 4, border: 'none', background: 'none',
  },
  notifList: {
    overflowY: 'auto', padding: '4px 12px 12px',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  notifItem: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '12px 14px', borderRadius: 12,
    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
  },
  notifTitle: { fontSize: 13, fontWeight: 600 },
  notifMsg: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 },
  notifTime: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 },
  dismissBtn: {
    width: 24, height: 24, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-tertiary)', cursor: 'pointer', flexShrink: 0,
    background: 'none', border: 'none', padding: 0,
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '32px 0',
  },
};

export default NotificationCenter;
