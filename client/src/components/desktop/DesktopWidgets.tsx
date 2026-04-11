import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import { format } from 'date-fns';

const WEATHER_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫',
  51: '🌦', 61: '🌧', 63: '🌧', 65: '🌧', 71: '🌨', 80: '🌦', 95: '⛈',
};

const DesktopWidgets: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const { openWindow } = useStore();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.weather().then(setWeather).catch(() => {});
  }, []);

  const weatherCode = weather?.current?.weather_code ?? 0;
  const weatherIcon = WEATHER_ICONS[weatherCode] || '🌤';
  const temp = weather?.current?.temperature_2m;

  return (
    <div style={styles.container}>
      {/* Clock */}
      <div style={styles.clockWidget} onClick={() => openWindow('clock', 'Clock', 'clock')}>
        <div style={styles.time}>
          {format(time, 'h:mm')}
        </div>
        <div style={styles.ampm}>{format(time, 'a')}</div>
      </div>

      {/* Date */}
      <div style={styles.dateWidget} onClick={() => openWindow('calendar', 'Calendar', 'calendar')}>
        <div style={styles.dayOfWeek}>{format(time, 'EEEE')}</div>
        <div style={styles.fullDate}>{format(time, 'MMMM d, yyyy')}</div>
      </div>

      {/* Weather */}
      {weather?.current && (
        <div style={styles.weatherWidget} onClick={() => openWindow('weather', 'Weather', 'weather')}>
          <span style={{ fontSize: 32 }}>{weatherIcon}</span>
          <div>
            <div style={styles.temp}>{temp ? `${Math.round(temp)}°` : '--°'}</div>
            <div style={styles.location}>San Francisco</div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -55%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'none',
    zIndex: 1,
  },
  clockWidget: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    pointerEvents: 'auto',
    cursor: 'pointer',
  },
  time: {
    fontSize: 96,
    fontWeight: 200,
    color: '#fff',
    textShadow: '0 2px 20px rgba(0,0,0,0.4)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  ampm: {
    fontSize: 28,
    fontWeight: 300,
    color: 'rgba(255,255,255,0.7)',
    textShadow: '0 1px 10px rgba(0,0,0,0.3)',
    marginBottom: 8,
  },
  dateWidget: {
    textAlign: 'center',
    pointerEvents: 'auto',
    cursor: 'pointer',
  },
  dayOfWeek: {
    fontSize: 22,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.9)',
    textShadow: '0 1px 10px rgba(0,0,0,0.3)',
  },
  fullDate: {
    fontSize: 16,
    fontWeight: 400,
    color: 'rgba(255,255,255,0.6)',
    textShadow: '0 1px 8px rgba(0,0,0,0.3)',
    marginTop: 2,
  },
  weatherWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    padding: '10px 20px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)',
    pointerEvents: 'auto',
    cursor: 'pointer',
  },
  temp: {
    fontSize: 24,
    fontWeight: 300,
    color: '#fff',
    textShadow: '0 1px 6px rgba(0,0,0,0.2)',
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
};

export default DesktopWidgets;
