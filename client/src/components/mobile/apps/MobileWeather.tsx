import React, { useEffect, useState } from 'react';
import { WindowState } from '../../../store/useStore';
import { api } from '../../../utils/api';

const WMO_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Clear Sky', icon: 'sun' },
  1: { desc: 'Mainly Clear', icon: 'sun' },
  2: { desc: 'Partly Cloudy', icon: 'cloud-sun' },
  3: { desc: 'Overcast', icon: 'cloud' },
  45: { desc: 'Fog', icon: 'fog' },
  48: { desc: 'Rime Fog', icon: 'fog' },
  51: { desc: 'Light Drizzle', icon: 'rain' },
  53: { desc: 'Drizzle', icon: 'rain' },
  55: { desc: 'Heavy Drizzle', icon: 'rain' },
  61: { desc: 'Light Rain', icon: 'rain' },
  63: { desc: 'Rain', icon: 'rain' },
  65: { desc: 'Heavy Rain', icon: 'rain' },
  71: { desc: 'Light Snow', icon: 'snow' },
  73: { desc: 'Snow', icon: 'snow' },
  75: { desc: 'Heavy Snow', icon: 'snow' },
  80: { desc: 'Rain Showers', icon: 'rain' },
  81: { desc: 'Moderate Rain', icon: 'rain' },
  82: { desc: 'Violent Rain', icon: 'rain' },
  95: { desc: 'Thunderstorm', icon: 'storm' },
  96: { desc: 'Thunderstorm + Hail', icon: 'storm' },
  99: { desc: 'Thunderstorm + Heavy Hail', icon: 'storm' },
};

const WeatherIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 64 }) => {
  const s = size;
  if (type === 'sun') return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="14" fill="#fbbf24" />
      <g stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="4" x2="32" y2="12" /><line x1="32" y1="52" x2="32" y2="60" />
        <line x1="4" y1="32" x2="12" y2="32" /><line x1="52" y1="32" x2="60" y2="32" />
        <line x1="12" y1="12" x2="17" y2="17" /><line x1="47" y1="47" x2="52" y2="52" />
        <line x1="52" y1="12" x2="47" y2="17" /><line x1="17" y1="47" x2="12" y2="52" />
      </g>
    </svg>
  );
  if (type === 'cloud-sun') return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <circle cx="22" cy="22" r="10" fill="#fbbf24" />
      <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
        <line x1="22" y1="6" x2="22" y2="10" /><line x1="6" y1="22" x2="10" y2="22" />
        <line x1="10" y1="10" x2="13" y2="13" /><line x1="34" y1="10" x2="31" y2="13" />
        <line x1="10" y1="34" x2="13" y2="31" />
      </g>
      <path d="M22 38h28a10 10 0 100-20 1 1 0 00-1 0 14 14 0 00-27 6 8 8 0 000 14z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
    </svg>
  );
  if (type === 'cloud') return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <path d="M16 42h32a12 12 0 100-24 1 1 0 00-1 0 16 16 0 00-31 8 10 10 0 000 16z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
    </svg>
  );
  if (type === 'rain') return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <path d="M16 34h32a12 12 0 100-24 1 1 0 00-1 0 16 16 0 00-31 8 10 10 0 000 16z" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      <g stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="40" x2="22" y2="48" /><line x1="32" y1="42" x2="30" y2="50" /><line x1="40" y1="40" x2="38" y2="48" />
        <line x1="28" y1="50" x2="26" y2="56" /><line x1="36" y1="50" x2="34" y2="56" />
      </g>
    </svg>
  );
  if (type === 'snow') return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <path d="M16 34h32a12 12 0 100-24 1 1 0 00-1 0 16 16 0 00-31 8 10 10 0 000 16z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      <g fill="#93c5fd"><circle cx="24" cy="44" r="2.5"/><circle cx="32" cy="48" r="2.5"/><circle cx="40" cy="44" r="2.5"/><circle cx="28" cy="54" r="2"/><circle cx="36" cy="54" r="2"/></g>
    </svg>
  );
  if (type === 'storm') return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <path d="M16 30h32a12 12 0 100-20 1 1 0 00-1 0 16 16 0 00-31 6 10 10 0 000 14z" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
      <path d="M30 34l-4 12h8l-4 12" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (type === 'fog') return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="24" x2="52" y2="24" /><line x1="16" y1="32" x2="48" y2="32" />
      <line x1="12" y1="40" x2="52" y2="40" /><line x1="20" y1="48" x2="44" y2="48" />
    </svg>
  );
  return <svg width={s} height={s} viewBox="0 0 64 64" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="32" cy="32" r="14" /></svg>;
};

const toF = (c: number) => Math.round(c * 9 / 5 + 32);

const MobileWeather: React.FC<{ window: WindowState }> = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<'C' | 'F'>('F');

  useEffect(() => {
    (async () => {
      try {
        let coords: { lat?: number; lon?: number } = {};
        if (navigator.geolocation) {
          try {
            const pos = await new Promise<GeolocationPosition>((res, rej) =>
              navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
            );
            coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          } catch {}
        }
        const w = await api.weather(coords.lat, coords.lon);
        setData(w);
      } catch (e: any) {
        setError(e.message || 'Failed to load weather');
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={centered}>Loading weather...</div>;
  if (error || !data) return <div style={centered}>Weather unavailable</div>;

  const current = data.current || {};
  const daily = data.daily || {};
  const temp = current.temperature_2m ?? data.temperature ?? data.temp ?? '---';
  const feels = current.apparent_temperature ?? data.feels_like;
  const code = current.weather_code ?? 0;
  const wmo = WMO_CODES[code] || { desc: 'Unknown', icon: 'cloud' };
  const city = data.location || data.city || 'Current Location';
  const rawHigh = daily.temperature_2m_max?.[0];
  const rawLow = daily.temperature_2m_min?.[0];
  const d = (v: number | undefined) => v === undefined ? undefined : (unit === 'F' ? toF(v) : Math.round(v));
  const dispTemp = typeof temp === 'number' ? (unit === 'F' ? toF(temp) : Math.round(temp)) : temp;
  const dispFeels = feels !== undefined ? (unit === 'F' ? toF(feels) : Math.round(feels)) : undefined;
  const high = d(rawHigh);
  const low = d(rawLow);

  // 7-day forecast
  const forecast: { day: string; high: number; low: number; code: number }[] = [];
  if (daily.time && daily.temperature_2m_max) {
    for (let i = 1; i < Math.min(daily.time.length, 8); i++) {
      const dt = new Date(daily.time[i]);
      const rawH = daily.temperature_2m_max[i];
      const rawL = daily.temperature_2m_min[i];
      forecast.push({
        day: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        high: unit === 'F' ? toF(rawH) : Math.round(rawH),
        low: unit === 'F' ? toF(rawL) : Math.round(rawL),
        code: daily.weather_code?.[i] ?? 0,
      });
    }
  }

  const bgGradient = code <= 1 ? 'linear-gradient(180deg, #4da6ff 0%, #87CEEB 50%, #1e3a8a 100%)'
    : code <= 3 ? 'linear-gradient(180deg, #6b7280 0%, #9ca3af 50%, #374151 100%)'
    : code >= 61 && code <= 65 ? 'linear-gradient(180deg, #374151 0%, #4b5563 50%, #1f2937 100%)'
    : 'linear-gradient(180deg, #4da6ff 0%, #60a5fa 50%, #1e3a8a 100%)';

  return (
    <div style={{ height: '100%', background: bgGradient, color: '#fff', overflowY: 'auto' }}>
      {/* Current */}
      {/* F/C toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.3)' }}>
          <button type="button" onClick={() => setUnit('F')} style={{ padding: '6px 14px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: unit === 'F' ? 'rgba(255,255,255,0.3)' : 'transparent', color: '#fff' }}>F</button>
          <button type="button" onClick={() => setUnit('C')} style={{ padding: '6px 14px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: unit === 'C' ? 'rgba(255,255,255,0.3)' : 'transparent', color: '#fff' }}>C</button>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '10px 24px 20px' }}>
        <div style={{ fontSize: 18, fontWeight: 500, opacity: 0.9 }}>{city}</div>
        <div style={{ fontSize: 96, fontWeight: 200, letterSpacing: '-0.05em', lineHeight: 1, margin: '8px 0' }}>
          {dispTemp}°
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <WeatherIcon type={wmo.icon} size={48} />
          <span style={{ fontSize: 18, fontWeight: 500 }}>{wmo.desc}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 16, opacity: 0.85 }}>
          {high !== undefined && <span>H: {Math.round(high)}°</span>}
          {low !== undefined && <span>L: {Math.round(low)}°</span>}
        </div>
        {dispFeels !== undefined && <div style={{ fontSize: 14, opacity: 0.7, marginTop: 8 }}>Feels like {dispFeels}°</div>}
      </div>

      {/* 7-day forecast */}
      {forecast.length > 0 && (
        <div style={{ margin: '0 16px 20px', padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 }}>7-Day Forecast</div>
          {forecast.map((f, i) => {
            const fwmo = WMO_CODES[f.code] || { desc: '', icon: 'cloud' };
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ width: 50, fontSize: 15, fontWeight: 500 }}>{f.day}</span>
                <WeatherIcon type={fwmo.icon} size={28} />
                <div style={{ flex: 1 }} />
                <span style={{ width: 40, textAlign: 'right', fontSize: 15, opacity: 0.6 }}>{f.low}°</span>
                <div style={{ width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 8px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20%', right: '20%', top: 0, bottom: 0, borderRadius: 2, background: 'linear-gradient(90deg, #60a5fa, #fbbf24)' }} />
                </div>
                <span style={{ width: 40, fontSize: 15, fontWeight: 600 }}>{f.high}°</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const centered: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #4da6ff 0%, #1e3a8a 100%)',
  color: '#fff',
  fontSize: 15,
};

export default MobileWeather;
