import React, { useState, useEffect } from 'react';
import { WindowState, useStore } from '../../../store/useStore';

interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  repeat: 'none' | 'daily' | 'weekly';
  enabled: boolean;
  fired: boolean;
}

const KEY = 'webos-reminders';

const loadReminders = (): Reminder[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
};

const saveReminders = (r: Reminder[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(r)); } catch {}
};

const MobileReminders: React.FC<{ window: WindowState }> = () => {
  const { addNotification } = useStore();
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly'>('none');

  useEffect(() => {
    const h = () => setReminders(loadReminders());
    window.addEventListener('webos-reminders-updated', h);
    return () => window.removeEventListener('webos-reminders-updated', h);
  }, []);

  const persist = (next: Reminder[]) => { setReminders(next); saveReminders(next); };

  const addReminder = () => {
    if (!title.trim()) return;
    const r: Reminder = {
      id: Date.now().toString(),
      title: title.trim(),
      time, date, repeat,
      enabled: true, fired: false,
    };
    persist([r, ...reminders]);
    addNotification({ title: 'Reminders', message: `Set for ${date} at ${time}`, app: 'reminders' });
    setTitle('');
    setShowAdd(false);
  };

  const toggle = (id: string) => persist(reminders.map(r => r.id === id ? { ...r, fired: !r.fired } : r));
  const remove = (id: string) => persist(reminders.filter(r => r.id !== id));

  const upcoming = reminders.filter(r => !r.fired);
  const completed = reminders.filter(r => r.fired);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f2f2f7', color: '#1c1c1e' }}>
      <div style={{ padding: '16px 16px 12px', background: '#fff', borderBottom: '1px solid #e5e5ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#ff9500' }}>Reminders</h1>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ width: 36, height: 36, borderRadius: 18, background: '#ff9500', color: '#fff', border: 'none', fontSize: 22, fontWeight: 300, cursor: 'pointer', lineHeight: 1 }}>
          {showAdd ? '×' : '+'}
        </button>
      </div>

      {showAdd && (
        <div style={{ padding: 16, background: '#fff', borderBottom: '1px solid #e5e5ea', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New reminder…"
            style={{ padding: 12, borderRadius: 10, border: '1px solid #e5e5ea', fontSize: 15, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e5ea', fontSize: 14, outline: 'none' }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ width: 110, padding: 10, borderRadius: 10, border: '1px solid #e5e5ea', fontSize: 14, outline: 'none' }} />
          </div>
          <select value={repeat} onChange={e => setRepeat(e.target.value as any)}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e5ea', fontSize: 14, outline: 'none', background: '#fff' }}>
            <option value="none">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <button onClick={addReminder} disabled={!title.trim()}
            style={{ padding: 12, borderRadius: 10, background: title.trim() ? '#ff9500' : '#e5e5ea', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: title.trim() ? 'pointer' : 'not-allowed' }}>
            Add Reminder
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {upcoming.length === 0 && completed.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#8e8e93' }}>
            <div style={{ marginBottom: 10, opacity: 0.4 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5"/><path d="M5 3L2 6M22 6l-3-3"/></svg></div>
            <div style={{ fontSize: 15 }}>No reminders</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tap + to add one</div>
          </div>
        )}
        {upcoming.length > 0 && <Section title="Upcoming" items={upcoming} onToggle={toggle} onRemove={remove} />}
        {completed.length > 0 && <Section title="Completed" items={completed} onToggle={toggle} onRemove={remove} />}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; items: Reminder[]; onToggle: (id: string) => void; onRemove: (id: string) => void }> = ({ title, items, onToggle, onRemove }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 13, color: '#8e8e93', padding: '14px 16px 6px', textTransform: 'uppercase' }}>{title}</div>
    <div style={{ background: '#fff' }}>
      {items.map((r, i) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < items.length - 1 ? '1px solid #f2f2f7' : 'none' }}>
          <button onClick={() => onToggle(r.id)}
            style={{ width: 26, height: 26, borderRadius: 13, border: r.fired ? 'none' : '2px solid #c7c7cc', background: r.fired ? '#ff9500' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {r.fired && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3 3 7-7"/></svg>}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: r.fired ? '#8e8e93' : '#1c1c1e', textDecoration: r.fired ? 'line-through' : 'none' }}>{r.title}</div>
            <div style={{ fontSize: 12, color: '#8e8e93', marginTop: 2 }}>
              {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {r.time}
              {r.repeat !== 'none' && ` · ${r.repeat}`}
            </div>
          </div>
          <button onClick={() => onRemove(r.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 18, cursor: 'pointer', padding: 4 }}>×</button>
        </div>
      ))}
    </div>
  </div>
);

export default MobileReminders;
