import React, { useState, useEffect, useRef } from 'react';
import { WindowState, useStore } from '../../store/useStore';

interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  repeat: 'none' | 'daily' | 'weekly';
  enabled: boolean;
  fired: boolean;
}

const RemindersApp: React.FC<{ window: WindowState }> = () => {
  const { addNotification } = useStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRepeat, setNewRepeat] = useState<'none' | 'daily' | 'weekly'>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedIdsRef = useRef<Set<string>>(new Set());

  // Check reminders every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0];

      setReminders(prev => {
        let changed = false;
        const updated = prev.map(r => {
          if (r.enabled && !r.fired && r.time === currentTime && r.date === currentDate && !firedIdsRef.current.has(r.id)) {
            firedIdsRef.current.add(r.id);
            addNotification({ title: 'Reminder', message: r.title, app: 'reminders' });
            playSound();
            changed = true;
            return { ...r, fired: true };
          }
          return r;
        });
        return changed ? updated : prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [addNotification]); // eslint-disable-line

  const playSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 0.8);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        osc2.type = 'sine';
        gain2.gain.value = 0.3;
        osc2.start();
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);
        osc2.stop(ctx.currentTime + 1.6);
      }, 300);
    } catch {}
  };

  const addReminder = () => {
    if (!newTitle.trim()) return;
    setReminders(prev => [...prev, {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      date: newDate,
      repeat: newRepeat,
      enabled: true,
      fired: false,
    }]);
    addNotification({ title: 'Reminder Set', message: `"${newTitle}" scheduled for ${newDate} at ${newTime}`, app: 'reminders' });
    setNewTitle('');
    setShowAdd(false);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const upcoming = reminders.filter(r => r.enabled && !r.fired).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = reminders.filter(r => r.fired);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a', color: '#e2e8f0' }}>
      <audio ref={audioRef} />

      {/* Header */}
      <div style={st.header}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Reminders</h2>
        <button style={st.addBtn} onClick={() => setShowAdd(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={st.form}>
          <input style={st.input} placeholder="Reminder title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...st.input, flex: 1 }} type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            <input style={{ ...st.input, width: 100 }} type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
          </div>
          <select style={st.input} value={newRepeat} onChange={e => setNewRepeat(e.target.value as any)}>
            <option value="none">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={st.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
            <button style={st.saveBtn} onClick={addReminder}>Add Reminder</button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {upcoming.length === 0 && past.length === 0 && !showAdd && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, opacity: 0.4 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="24" cy="24" r="18"/><path d="M24 14v12l8 4" strokeLinecap="round"/></svg>
            <p style={{ fontSize: 14 }}>No reminders</p>
            <p style={{ fontSize: 12 }}>Tap + to add one</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <div style={st.sectionLabel}>Upcoming</div>
            {upcoming.map(r => (
              <div key={r.id} style={st.item}>
                <button style={{ ...st.toggle, background: r.enabled ? '#2563eb' : '#334155' }} onClick={() => toggleReminder(r.id)}>
                  <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute', top: 2, left: r.enabled ? 18 : 2, transition: 'left 0.2s' }} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {r.time}
                    {r.repeat !== 'none' && <span style={{ marginLeft: 6, color: '#60a5fa' }}>{r.repeat}</span>}
                  </div>
                </div>
                <button style={st.deleteBtn} onClick={() => deleteReminder(r.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
                </button>
              </div>
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <div style={st.sectionLabel}>Completed</div>
            {past.map(r => (
              <div key={r.id} style={{ ...st.item, opacity: 0.5 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="#34d399"><circle cx="9" cy="9" r="8"/><path d="M5.5 9l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, textDecoration: 'line-through' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.time}</div>
                </div>
                <button style={st.deleteBtn} onClick={() => deleteReminder(r.id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Test button */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #1e293b' }}>
        <button style={{ ...st.cancelBtn, width: '100%', fontSize: 12 }} onClick={playSound}>
          Test notification sound
        </button>
      </div>
    </div>
  );
};

const st: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 12px', borderBottom: '1px solid #1e293b' },
  addBtn: { width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', border: 'none' },
  form: { padding: 16, display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid #1e293b', background: '#1e293b' },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', fontSize: 13, outline: 'none', width: '100%' },
  cancelBtn: { padding: '6px 16px', borderRadius: 6, fontSize: 13, border: '1px solid #475569', background: 'transparent', color: '#94a3b8', cursor: 'pointer' },
  saveBtn: { padding: '6px 16px', borderRadius: 6, fontSize: 13, background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600, border: 'none' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, padding: '12px 0 6px' },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #1e293b' },
  toggle: { width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', border: 'none', flexShrink: 0, transition: 'background 0.2s' },
  deleteBtn: { color: '#94a3b8', cursor: 'pointer', padding: 4, border: 'none', background: 'none' },
};

export default RemindersApp;
