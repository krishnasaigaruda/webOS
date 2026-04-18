import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '../../../store/useStore';

type Mode = 'timer' | 'stopwatch';

const MobileTimer: React.FC<{ window: WindowState }> = () => {
  const [mode, setMode] = useState<Mode>('timer');
  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Stopwatch state
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  const startTimer = () => {
    const total = timerMinutes * 60 + timerSeconds;
    if (total <= 0) return;
    setTimerRemaining(total);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (!timerRunning) return;
    timerRef.current = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          playAlarm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const cancelTimer = () => {
    setTimerRunning(false);
    setTimerRemaining(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Stopwatch
  useEffect(() => {
    if (!swRunning) return;
    swRef.current = setInterval(() => setSwTime(t => t + 10), 10);
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  const resetStopwatch = () => { setSwTime(0); setSwRunning(false); setLaps([]); };
  const addLap = () => { setLaps(prev => [swTime, ...prev]); };

  const playAlarm = () => {
    try {
      const ctx = new AudioContext();
      [0, 0.3, 0.6, 0.9, 1.2].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880; osc.type = 'sine'; gain.gain.value = 0.3;
        osc.start(ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.2);
        osc.stop(ctx.currentTime + offset + 0.25);
      });
    } catch {}
  };

  const fmtTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const fmtSw = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff' }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: 16 }}>
        <TabBtn active={mode === 'timer'} onClick={() => setMode('timer')}>Timer</TabBtn>
        <TabBtn active={mode === 'stopwatch'} onClick={() => setMode('stopwatch')}>Stopwatch</TabBtn>
      </div>

      {mode === 'timer' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {timerRunning || timerRemaining > 0 ? (
            <>
              <div style={{ fontSize: 80, fontWeight: 200, fontVariantNumeric: 'tabular-nums' }}>{fmtTimer(timerRemaining)}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <RoundBtn color="#333" label="Cancel" onClick={cancelTimer} />
                <RoundBtn color={timerRunning ? '#ff9500' : '#34c759'}
                  label={timerRunning ? 'Pause' : 'Resume'}
                  onClick={() => setTimerRunning(!timerRunning)} />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#8e8e93', display: 'block', marginBottom: 4 }}>Minutes</label>
                  <input type="number" min={0} max={99} value={timerMinutes} onChange={e => setTimerMinutes(Math.max(0, Number(e.target.value)))}
                    style={numInput} />
                </div>
                <span style={{ fontSize: 36, fontWeight: 200, marginTop: 18 }}>:</span>
                <div>
                  <label style={{ fontSize: 12, color: '#8e8e93', display: 'block', marginBottom: 4 }}>Seconds</label>
                  <input type="number" min={0} max={59} value={timerSeconds} onChange={e => setTimerSeconds(Math.min(59, Math.max(0, Number(e.target.value))))}
                    style={numInput} />
                </div>
              </div>
              <RoundBtn color="#34c759" label="Start" onClick={startTimer} />
            </>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 200, fontVariantNumeric: 'tabular-nums' }}>{fmtSw(swTime)}</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <RoundBtn color="#333" label={swTime > 0 ? 'Reset' : 'Lap'} onClick={swTime > 0 && !swRunning ? resetStopwatch : addLap} />
            <RoundBtn color={swRunning ? '#ff3b30' : '#34c759'}
              label={swRunning ? 'Stop' : 'Start'}
              onClick={() => setSwRunning(!swRunning)} />
          </div>
          {laps.length > 0 && (
            <div style={{ width: '100%', flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              {laps.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: '#8e8e93' }}>Lap {laps.length - i}</span>
                  <span>{fmtSw(l)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick}
    style={{ padding: '8px 24px', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
      background: active ? '#fff' : 'rgba(255,255,255,0.1)', color: active ? '#000' : '#fff' }}>
    {children}
  </button>
);

const RoundBtn: React.FC<{ color: string; label: string; onClick: () => void }> = ({ color, label, onClick }) => (
  <button type="button" onClick={onClick}
    style={{ width: 80, height: 80, borderRadius: 40, background: color, color: '#fff', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
    {label}
  </button>
);

const numInput: React.CSSProperties = {
  width: 80, padding: '12px', borderRadius: 10, border: '1px solid #333', background: '#1c1c1e', color: '#fff',
  fontSize: 28, fontWeight: 300, textAlign: 'center', outline: 'none', fontVariantNumeric: 'tabular-nums',
};

export default MobileTimer;
