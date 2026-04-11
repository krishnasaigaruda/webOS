import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import { format } from 'date-fns';

const WidgetPanel: React.FC = () => {
  const { toggleWidgets } = useStore();
  const [weather, setWeather] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.weather().then(setWeather).catch(() => {});
  }, []);

  const weatherCode = weather?.current?.weather_code || 0;
  const weatherIcon = weatherCode <= 1 ? '☀️' : weatherCode <= 3 ? '⛅' : weatherCode <= 48 ? '🌫️' : weatherCode <= 67 ? '🌧️' : '⛈️';
  const temp = weather?.current?.temperature_2m;

  return (
    <div style={styles.overlay} onClick={toggleWidgets}>
      <div
        className="animate-slideDown"
        style={styles.panel}
        onClick={e => e.stopPropagation()}
      >
        {/* Clock Widget */}
        <div style={styles.widget}>
          <div style={{ fontSize: 48, fontWeight: 200, fontVariantNumeric: 'tabular-nums' }}>
            {format(time, 'h:mm')}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {format(time, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Weather Widget */}
        <div style={styles.widget}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 40 }}>{weatherIcon}</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 300 }}>
                {temp ? `${Math.round(temp)}°C` : '--°C'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>San Francisco</div>
            </div>
          </div>
          {weather?.daily && (
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {weather.daily.temperature_2m_max?.slice(0, 5).map((max: number, i: number) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 12 }}>
                  <div style={{ color: 'var(--text-tertiary)' }}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.now() + i * 86400000).getDay()]}</div>
                  <div>{Math.round(max)}°</div>
                  <div style={{ color: 'var(--text-tertiary)' }}>{Math.round(weather.daily.temperature_2m_min[i])}°</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Notes Widget */}
        <div style={styles.widget}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Quick Note</div>
          <textarea
            style={styles.noteInput}
            placeholder="Type a quick note..."
            rows={3}
          />
        </div>

        {/* Battery Widget */}
        <div style={styles.widget}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>
            <span>Battery: 85%</span>
            <div style={{
              flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{ width: '85%', height: '100%', background: 'var(--success)', borderRadius: 4 }} />
            </div>
          </div>
        </div>

        {/* Calendar Widget */}
        <div style={styles.widget}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Upcoming</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No upcoming events</div>
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
    width: 320,
    maxHeight: 'calc(100vh - 100px)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    overflowY: 'auto',
  },
  widget: {
    padding: 16,
    borderRadius: 16,
    background: 'var(--bg-primary)',
    backdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  noteInput: {
    width: '100%',
    border: 'none',
    background: 'var(--bg-tertiary)',
    borderRadius: 8,
    padding: 8,
    resize: 'none',
    outline: 'none',
    fontSize: 13,
    color: 'var(--text-primary)',
  },
};

export default WidgetPanel;
