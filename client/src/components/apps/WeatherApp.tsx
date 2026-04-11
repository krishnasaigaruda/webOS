import React, { useState, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import { api } from '../../utils/api';

const WEATHER_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Fog', icon: '🌫' },
  48: { desc: 'Rime fog', icon: '🌫' },
  51: { desc: 'Light drizzle', icon: '🌦' },
  61: { desc: 'Slight rain', icon: '🌧' },
  63: { desc: 'Moderate rain', icon: '🌧' },
  65: { desc: 'Heavy rain', icon: '🌧' },
  71: { desc: 'Slight snow', icon: '🌨' },
  80: { desc: 'Slight showers', icon: '🌦' },
  95: { desc: 'Thunderstorm', icon: '⛈' },
};

const WeatherApp: React.FC<{ window: WindowState }> = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.weather().then(data => { setWeather(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0f172a', color: '#94a3b8' }}>Loading weather...</div>;
  if (!weather?.current) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0f172a', color: '#94a3b8' }}>Unable to load weather</div>;

  const code = weather.current.weather_code;
  const info = WEATHER_CODES[code] || WEATHER_CODES[0];
  const temp = Math.round(weather.current.temperature_2m);
  const isNight = new Date().getHours() > 18 || new Date().getHours() < 6;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: isNight ? 'linear-gradient(180deg, #0f172a, #1e1b4b)' : 'linear-gradient(180deg, #3b82f6, #1e40af)', color: '#fff' }}>
      {/* Current */}
      <div style={{ textAlign: 'center', padding: '40px 20px 30px' }}>
        <div style={{ fontSize: 72 }}>{info.icon}</div>
        <div style={{ fontSize: 80, fontWeight: 200, lineHeight: 1 }}>{temp}°</div>
        <div style={{ fontSize: 18, opacity: 0.8, marginTop: 8 }}>{info.desc}</div>
        <div style={{ fontSize: 14, opacity: 0.5, marginTop: 4 }}>San Francisco</div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 20px 24px' }}>
        {[
          { label: 'Wind', value: `${Math.round(weather.current.wind_speed_10m)} km/h`, icon: '💨' },
          { label: 'Humidity', value: `${weather.current.relative_humidity_2m}%`, icon: '💧' },
        ].map((d, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 24px', background: 'rgba(255,255,255,0.1)', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: 24 }}>{d.icon}</span>
            <span style={{ fontSize: 20, fontWeight: 300 }}>{d.value}</span>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{d.label}</span>
          </div>
        ))}
      </div>

      {/* Forecast */}
      {weather.daily && (
        <div style={{ margin: '0 16px', padding: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>7-Day Forecast</div>
          {weather.daily.temperature_2m_max?.map((max: number, i: number) => {
            const dayCode = weather.daily.weather_code?.[i] || 0;
            const dayInfo = WEATHER_CODES[dayCode] || WEATHER_CODES[0];
            const date = new Date(Date.now() + i * 86400000);
            const min = weather.daily.temperature_2m_min[i];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <span style={{ width: 44, fontSize: 14, fontWeight: i === 0 ? 600 : 400 }}>
                  {i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{dayInfo.icon}</span>
                <span style={{ width: 32, textAlign: 'right', opacity: 0.5, fontSize: 14 }}>{Math.round(min)}°</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', height: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg, #60a5fa, #f59e0b)',
                    left: `${Math.max(0, (min + 10) / 50 * 100)}%`,
                    right: `${Math.max(0, 100 - (Math.round(max) + 10) / 50 * 100)}%`,
                  }} />
                </div>
                <span style={{ width: 32, fontSize: 14 }}>{Math.round(max)}°</span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
};

export default WeatherApp;
