import React, { useState, useEffect } from 'react';
import { WindowState } from '../../../store/useStore';
import { saveState, loadState } from '../../../utils/persistence';

interface Task { id: string; text: string; done: boolean; }

const STORAGE_KEY = 'webos-mobile-todo';

const MobileToDo: React.FC<{ window: WindowState }> = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState(STORAGE_KEY).then(v => {
      if (Array.isArray(v)) setTasks(v);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveState(STORAGE_KEY, tasks).catch(() => {});
  }, [tasks, loaded]);

  const add = () => {
    if (!input.trim()) return;
    setTasks([{ id: Date.now().toString(), text: input.trim(), done: false }, ...tasks]);
    setInput('');
  };

  const toggle = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f2f2f7' }}>
      <div style={{ padding: '16px 16px 12px', background: '#fff', borderBottom: '1px solid #e5e5ea' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px', color: '#1c1c1e' }}>To Do</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
            placeholder="Add a task…"
            style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1px solid #e5e5ea', background: '#f2f2f7', fontSize: 15, outline: 'none' }}
          />
          <button onClick={add} style={{ padding: '11px 18px', borderRadius: 10, background: '#007aff', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Add</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#8e8e93' }}>
            <div style={{ marginBottom: 10, opacity: 0.4 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></div>
            <div style={{ fontSize: 15 }}>No tasks yet</div>
          </div>
        ) : (
          <>
            {active.length > 0 && <Group title="Active" tasks={active} onToggle={toggle} onRemove={remove} />}
            {done.length > 0 && <Group title="Completed" tasks={done} onToggle={toggle} onRemove={remove} />}
          </>
        )}
      </div>
    </div>
  );
};

const Group: React.FC<{ title: string; tasks: Task[]; onToggle: (id: string) => void; onRemove: (id: string) => void }> = ({ title, tasks, onToggle, onRemove }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 13, color: '#8e8e93', padding: '14px 16px 6px', textTransform: 'uppercase' }}>{title}</div>
    <div style={{ background: '#fff' }}>
      {tasks.map((t, i) => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < tasks.length - 1 ? '1px solid #f2f2f7' : 'none' }}>
          <button onClick={() => onToggle(t.id)} style={{
            width: 24, height: 24, borderRadius: 12,
            border: t.done ? 'none' : '2px solid #c7c7cc',
            background: t.done ? '#34c759' : 'transparent',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {t.done && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3 3 7-7"/></svg>}
          </button>
          <div style={{ flex: 1, fontSize: 15, color: t.done ? '#8e8e93' : '#1c1c1e', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</div>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 18, cursor: 'pointer', padding: 4 }}>×</button>
        </div>
      ))}
    </div>
  </div>
);

export default MobileToDo;
