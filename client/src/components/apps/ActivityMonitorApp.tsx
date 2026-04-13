import React, { useState, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';
import { AppIcon } from '../../utils/icons';

interface SystemStats {
  cpu: { usage: number; perCore: number[]; count: number; model: string };
  memory: { total: number; free: number; used: number };
  uptime: number;
  processes: Array<{ user: string; pid: string; cpu: number; mem: number; command: string }>;
  disk: { total: string; used: string; free: string; percent: string };
  hostname: string;
  platform: string;
  arch: string;
}

const ActivityMonitorApp: React.FC<{ window: WindowState }> = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [tab, setTab] = useState<'webos' | 'cpu' | 'memory' | 'disk' | 'processes'>('webos');
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(40).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(Array(40).fill(0));
  const windows = useStore(s => s.windows);
  const closeWindow = useStore(s => s.closeWindow);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/system/stats');
      const data = await res.json();
      setStats(data);
      setCpuHistory(prev => [...prev.slice(1), data.cpu.usage]);
      const memPercent = Math.round((data.memory.used / data.memory.total) * 100);
      setMemHistory(prev => [...prev.slice(1), memPercent]);
    } catch {}
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const renderChart = (data: number[], color: string, label: string, value: string) => (
    <div style={{ background: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 300, color }}>{value}</span>
      </div>
      <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M0,80 ${data.map((v, i) => `L${i * (400 / (data.length - 1))},${80 - v * 0.8}`).join(' ')} L400,80 Z`} fill={`url(#grad-${label})`} />
        <path d={`M0,${80 - data[0] * 0.8} ${data.map((v, i) => `L${i * (400 / (data.length - 1))},${80 - v * 0.8}`).join(' ')}`} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );

  if (!stats) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0f172a', color: '#64748b' }}>Loading system stats...</div>;

  const memPercent = Math.round((stats.memory.used / stats.memory.total) * 100);
  const diskPercent = parseInt(stats.disk.percent) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Tabs */}
      <div style={st.tabs}>
        {(['webos', 'cpu', 'memory', 'disk', 'processes'] as const).map(t => (
          <button key={t} style={{ ...st.tab, ...(tab === t ? st.activeTab : {}) }} onClick={() => setTab(t)}>
            {t === 'webos' ? 'webOS Apps' : t === 'cpu' ? 'CPU' : t === 'memory' ? 'Memory' : t === 'disk' ? 'Disk' : 'Processes'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'webos' && (
          <div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
              {windows.length} {windows.length === 1 ? 'app window' : 'app windows'} running
            </div>
            {windows.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                No apps are currently running. Open apps from the dock.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={st.th}>App</th>
                    <th style={st.th}>Window</th>
                    <th style={{ ...st.th, textAlign: 'right' }}>State</th>
                    <th style={{ ...st.th, textAlign: 'right' }}>Memory</th>
                    <th style={{ ...st.th, textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {windows.map(w => {
                    // Estimate memory by window size (rough proxy - each px is ~0.5 bytes)
                    const estMem = Math.round((w.width * w.height * 0.5) / 1024);
                    return (
                      <tr key={w.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ ...st.td, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <AppIcon appId={w.appId} size={24} />
                          <span style={{ fontWeight: 500 }}>{w.appId}</span>
                        </td>
                        <td style={{ ...st.td, color: '#94a3b8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.title}</td>
                        <td style={{ ...st.td, textAlign: 'right' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: w.isMinimized ? '#f59e0b20' : w.isMaximized ? '#3b82f620' : '#22c55e20', color: w.isMinimized ? '#f59e0b' : w.isMaximized ? '#3b82f6' : '#22c55e' }}>
                            {w.isMinimized ? 'Minimized' : w.isMaximized ? 'Maximized' : 'Active'}
                          </span>
                        </td>
                        <td style={{ ...st.td, textAlign: 'right', color: '#a5b4fc' }}>{estMem} KB</td>
                        <td style={{ ...st.td, textAlign: 'right' }}>
                          <button style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', cursor: 'pointer' }}
                            onClick={() => closeWindow(w.id)}>Quit</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'cpu' && (
          <div>
            {renderChart(cpuHistory, '#3b82f6', 'CPU Usage', `${stats.cpu.usage}%`)}
            <div style={st.infoGrid}>
              <InfoRow label="Model" value={stats.cpu.model.split('@')[0].trim()} />
              <InfoRow label="Cores" value={`${stats.cpu.count}`} />
              <InfoRow label="Architecture" value={stats.arch} />
              <InfoRow label="System Uptime" value={formatUptime(stats.uptime)} />
            </div>
            {stats.cpu.perCore.length > 1 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Per Core</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                  {stats.cpu.perCore.map((usage, i) => (
                    <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 300, color: usage > 70 ? '#ef4444' : usage > 40 ? '#f59e0b' : '#3b82f6' }}>{usage}%</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Core {i}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'memory' && (
          <div>
            {renderChart(memHistory, '#8b5cf6', 'Memory Usage', `${memPercent}%`)}
            <div style={st.infoGrid}>
              <InfoRow label="Total" value={formatBytes(stats.memory.total)} />
              <InfoRow label="Used" value={formatBytes(stats.memory.used)} />
              <InfoRow label="Free" value={formatBytes(stats.memory.free)} />
            </div>
            <div style={{ marginTop: 16, background: '#1e293b', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Memory Pressure</div>
              <div style={{ height: 16, borderRadius: 8, background: '#334155', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${memPercent}%`, borderRadius: 8, background: memPercent > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : memPercent > 50 ? 'linear-gradient(90deg, #f59e0b, #eab308)' : 'linear-gradient(90deg, #22c55e, #16a34a)', transition: 'width 0.5s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#64748b' }}>
                <span>0 GB</span>
                <span>{formatBytes(stats.memory.total)}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'disk' && (
          <div>
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 20, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="#334155" strokeWidth="12" />
                  <circle cx="70" cy="70" r="60" fill="none" stroke={diskPercent > 80 ? '#ef4444' : '#3b82f6'} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${diskPercent * 3.77} 377`} transform="rotate(-90 70 70)" style={{ transition: 'stroke-dasharray 0.5s' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 300 }}>{stats.disk.percent}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Used</div>
                </div>
              </div>
            </div>
            <div style={st.infoGrid}>
              <InfoRow label="Total" value={stats.disk.total} />
              <InfoRow label="Used" value={stats.disk.used} />
              <InfoRow label="Available" value={stats.disk.free} />
              <InfoRow label="Hostname" value={stats.hostname} />
              <InfoRow label="Platform" value={`${stats.platform} ${stats.arch}`} />
            </div>
          </div>
        )}

        {tab === 'processes' && (
          <div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{stats.processes.length} processes</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={st.th}>PID</th>
                  <th style={st.th}>Process</th>
                  <th style={st.th}>User</th>
                  <th style={{ ...st.th, textAlign: 'right' }}>CPU</th>
                  <th style={{ ...st.th, textAlign: 'right' }}>MEM</th>
                </tr>
              </thead>
              <tbody>
                {stats.processes.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={st.td}>{p.pid}</td>
                    <td style={{ ...st.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{p.command}</td>
                    <td style={{ ...st.td, color: '#64748b' }}>{p.user}</td>
                    <td style={{ ...st.td, textAlign: 'right', color: p.cpu > 50 ? '#ef4444' : p.cpu > 10 ? '#f59e0b' : '#e2e8f0' }}>{p.cpu.toFixed(1)}%</td>
                    <td style={{ ...st.td, textAlign: 'right', color: p.mem > 10 ? '#f59e0b' : '#e2e8f0' }}>{p.mem.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 16, padding: '6px 16px', fontSize: 11, color: '#64748b', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
        <span>CPU: {stats.cpu.usage}%</span>
        <span>MEM: {memPercent}%</span>
        <span>Disk: {stats.disk.percent}</span>
        <span style={{ marginLeft: 'auto' }}>Uptime: {formatUptime(stats.uptime)}</span>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
    <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
  </div>
);

const st: Record<string, React.CSSProperties> = {
  tabs: { display: 'flex', borderBottom: '1px solid #1e293b', background: '#0f172a' },
  tab: { flex: 1, padding: '10px', textAlign: 'center', fontSize: 13, cursor: 'pointer', borderBottom: '2px solid transparent', color: '#64748b', background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#3b82f6', color: '#3b82f6', fontWeight: 600 },
  infoGrid: { background: '#1e293b', borderRadius: 10, padding: '4px 14px' },
  th: { padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #334155' },
  td: { padding: '6px 10px', fontSize: 12 },
};

export default ActivityMonitorApp;
