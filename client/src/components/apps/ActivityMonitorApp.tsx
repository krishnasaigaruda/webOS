import React, { useState, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { api } from '../../utils/api';

const ActivityMonitorApp: React.FC<{ window: WindowState }> = () => {
  const [sysInfo, setSysInfo] = useState<any>(null);
  const [tab, setTab] = useState<'cpu' | 'memory' | 'processes'>('cpu');
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(0));
  const { windows } = useStore();

  useEffect(() => {
    api.system.info().then(setSysInfo).catch(() => {});
    const interval = setInterval(() => {
      const usage = Math.random() * 30 + 10;
      setCpuHistory(prev => [...prev.slice(1), usage]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const memUsed = sysInfo ? ((sysInfo.totalMemory - sysInfo.freeMemory) / sysInfo.totalMemory * 100).toFixed(1) : 0;
  const memTotal = sysInfo ? (sysInfo.totalMemory / (1024 ** 3)).toFixed(1) : 0;
  const memFree = sysInfo ? (sysInfo.freeMemory / (1024 ** 3)).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={styles.tabs}>
        {(['cpu', 'memory', 'processes'] as const).map(t => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }} onClick={() => setTab(t)}>
            {t === 'cpu' ? 'CPU' : t === 'memory' ? 'Memory' : 'Processes'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'cpu' && (
          <div>
            <h3 style={{ marginBottom: 12 }}>CPU Usage</h3>
            {/* Mini chart */}
            <div style={styles.chart}>
              <svg width="100%" height="120" viewBox="0 0 300 120">
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M0,120 ${cpuHistory.map((v, i) => `L${i * 10},${120 - v * 1.2}`).join(' ')} L300,120 Z`}
                  fill="url(#cpuGrad)"
                />
                <path
                  d={`M0,${120 - cpuHistory[0] * 1.2} ${cpuHistory.map((v, i) => `L${i * 10},${120 - v * 1.2}`).join(' ')}`}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div style={styles.stat}>
              <span>Current CPU</span>
              <span style={{ fontWeight: 600 }}>{cpuHistory[cpuHistory.length - 1].toFixed(1)}%</span>
            </div>
            <div style={styles.stat}>
              <span>CPU Cores</span>
              <span>{sysInfo?.cpus || '--'}</span>
            </div>
            <div style={styles.stat}>
              <span>Architecture</span>
              <span>{sysInfo?.arch || '--'}</span>
            </div>
            <div style={styles.stat}>
              <span>System Uptime</span>
              <span>{sysInfo ? formatUptime(sysInfo.uptime) : '--'}</span>
            </div>
          </div>
        )}

        {tab === 'memory' && (
          <div>
            <h3 style={{ marginBottom: 12 }}>Memory Usage</h3>
            <div style={styles.memBar}>
              <div style={{ ...styles.memUsed, width: `${memUsed}%` }} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 14 }}>{memUsed}% Used</div>
            <div style={styles.stat}><span>Total Memory</span><span>{memTotal} GB</span></div>
            <div style={styles.stat}><span>Free Memory</span><span>{memFree} GB</span></div>
            <div style={styles.stat}><span>Used Memory</span><span>{(Number(memTotal) - Number(memFree)).toFixed(1)} GB</span></div>
          </div>
        )}

        {tab === 'processes' && (
          <div>
            <h3 style={{ marginBottom: 12 }}>Running Applications ({windows.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={styles.th}>App</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {windows.map(w => (
                  <tr key={w.id} style={styles.tr}>
                    <td style={styles.td}>{w.icon} {w.appId}</td>
                    <td style={styles.td}>{w.title}</td>
                    <td style={styles.td}>
                      <span style={{ color: w.isMinimized ? 'var(--warning)' : 'var(--success)' }}>
                        {w.isMinimized ? 'Minimized' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

const styles: Record<string, React.CSSProperties> = {
  tabs: { display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' },
  tab: { flex: 1, padding: '8px', textAlign: 'center', fontSize: 13, cursor: 'pointer', borderBottom: '2px solid transparent', color: 'var(--text-secondary)' },
  activeTab: { borderBottomColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 600 },
  chart: { background: 'var(--bg-secondary)', borderRadius: 8, padding: 8, marginBottom: 16, border: '1px solid var(--border)' },
  stat: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 },
  memBar: { height: 20, background: 'var(--bg-tertiary)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  memUsed: { height: '100%', background: 'linear-gradient(90deg, var(--success), var(--warning))', borderRadius: 10, transition: 'width 0.3s' },
  th: { padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '8px 12px', fontSize: 13 },
};

export default ActivityMonitorApp;
