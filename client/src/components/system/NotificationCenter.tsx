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
    <div style={styles.overlay} onClick={toggleNotificationCenter}>
      <div
        className="animate-slideDown glass"
        style={styles.panel}
        onClick={e => e.stopPropagation()}
      >
        {/* Date */}
        <div style={styles.dateSection}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{format(time, 'EEEE')}</div>
          <div style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-secondary)' }}>
            {format(time, 'MMMM d')}
          </div>
        </div>

        {/* Notifications */}
        <div style={styles.notifSection}>
          <div style={styles.notifHeader}>
            <span style={{ fontWeight: 600 }}>Notifications</span>
            {notifications.length > 0 && (
              <button style={styles.clearBtn} onClick={clearAllNotifications}>Clear All</button>
            )}
          </div>
          <div style={styles.notifList}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" opacity="0.4"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No Notifications</span>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={styles.notifItem}>
                  <div style={styles.notifItemHeader}>
                    <span><strong>{n.title}</strong></span>
                    <button
                      style={{ fontSize: 14, opacity: 0.5, padding: '0 4px' }}
                      onClick={() => clearNotification(n.id)}
                    >✕</button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {format(new Date(n.timestamp), 'h:mm a')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 99998,
  },
  panel: {
    position: 'absolute',
    top: 36,
    right: 12,
    width: 340,
    maxHeight: 'calc(100vh - 100px)',
    padding: 16,
    borderRadius: 16,
    background: 'var(--bg-primary)',
    backdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    overflowY: 'auto',
  },
  dateSection: {
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    paddingBottom: 16,
  },
  notifSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
  },
  clearBtn: {
    fontSize: 12,
    color: 'var(--accent)',
    cursor: 'pointer',
    fontWeight: 500,
  },
  notifList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  notifItem: {
    padding: 12,
    background: 'var(--bg-tertiary)',
    borderRadius: 12,
  },
  notifItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 32,
  },
};

export default NotificationCenter;
