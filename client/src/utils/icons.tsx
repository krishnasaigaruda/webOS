import React from 'react';

// Custom webOS logo
export const WebOSLogo: React.FC<{ size?: number; color?: string }> = ({ size = 32, color }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="logoGrad1" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="logoGrad2" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#logoGrad1)" />
    <circle cx="32" cy="28" r="12" fill="none" stroke="white" strokeWidth="2.5" opacity="0.9" />
    <path d="M26 28 L30 32 L38 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="16" y="44" width="32" height="3" rx="1.5" fill="white" opacity="0.7" />
    <rect x="22" y="50" width="20" height="3" rx="1.5" fill="white" opacity="0.4" />
  </svg>
);

// macOS Apple logo replacement
export const AppleLogo: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.182 4.426c-.63.753-1.667 1.337-2.482 1.288-.117-.815.297-1.678.926-2.382C10.256 2.628 11.31 2.088 12 2c.1.854-.247 1.697-.818 2.426zM11.166 5.95c-1.382-.08-2.553.786-3.208.786-.67 0-1.67-.746-2.774-.724C3.706 6.034 2.336 7.01 1.6 8.466c-1.508 2.89-.388 7.166 1.06 9.516.72 1.155 1.575 2.428 2.702 2.38 1.092-.048 1.496-.697 2.81-.697s1.682.697 2.822.673c1.17-.024 1.9-1.152 2.614-2.315.822-1.323 1.156-2.61 1.18-2.676-.024-.024-2.27-.876-2.294-3.47-.024-2.166 1.764-3.208 1.848-3.256-1.012-1.49-2.586-1.655-3.142-1.695l-.034.024z"/>
  </svg>
);

interface IconProps {
  size?: number;
  className?: string;
}

// macOS-style app icons as SVG components
export const FinderIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#finderGrad)" />
    <defs><linearGradient id="finderGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#4FC3F7" /><stop offset="1" stopColor="#1E88E5" /></linearGradient></defs>
    <rect x="14" y="18" width="36" height="28" rx="3" fill="white" opacity="0.95" />
    <rect x="14" y="18" width="36" height="8" rx="3" fill="#E0E0E0" />
    <circle cx="20" cy="22" r="2" fill="#FF5F56" />
    <circle cx="27" cy="22" r="2" fill="#FFBD2E" />
    <circle cx="34" cy="22" r="2" fill="#27C93F" />
    <path d="M22 32 L26 38 L32 29 L36 34 L42 28" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#1a1a1a" />
    <rect x="8" y="8" width="48" height="48" rx="6" fill="#2d2d2d" />
    <path d="M18 26 L26 32 L18 38" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="30" y1="38" x2="44" y2="38" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const TextEditIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#textGrad)" />
    <defs><linearGradient id="textGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#FFCA28" /><stop offset="1" stopColor="#FF8F00" /></linearGradient></defs>
    <rect x="14" y="12" width="36" height="40" rx="3" fill="white" />
    <path d="M22 22 L42 22M22 30 L38 30M22 38 L42 38M22 46 L32 46" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 12 L24 22 L16 22Z" fill="#E65100" opacity="0.3" />
  </svg>
);

export const CodeEditorIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#codeGrad)" />
    <defs><linearGradient id="codeGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#0078d4" /><stop offset="1" stopColor="#005a9e" /></linearGradient></defs>
    <path d="M24 22 L16 32 L24 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 22 L48 32 L40 42" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="36" y1="18" x2="28" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export const CalculatorIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#333" />
    <rect x="12" y="10" width="40" height="14" rx="4" fill="#FF9500" />
    <text x="42" y="22" fill="white" fontSize="14" fontWeight="300" textAnchor="middle">123</text>
    {[0,1,2].map(r => [0,1,2].map(c => (
      <rect key={`${r}${c}`} x={14 + c * 13} y={28 + r * 11} width="10" height="8" rx="2" fill={c === 2 ? '#FF9500' : '#555'} />
    )))}
    <rect x="14" y="50" width="23" height="8" rx="2" fill="#555" />
    <rect x="40" y="50" width="10" height="8" rx="2" fill="#FF9500" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 48 }) => {
  const day = new Date().getDate().toString();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="14" fill="white" />
      <rect x="0" y="0" width="64" height="20" rx="14" fill="#FF3B30" />
      <rect x="0" y="10" width="64" height="10" fill="#FF3B30" />
      <text x="32" y="15" fill="white" fontSize="10" fontWeight="600" textAnchor="middle">{new Date().toLocaleDateString('en', { weekday: 'long' }).toUpperCase()}</text>
      <text x="32" y="48" fill="#1a1a1a" fontSize="28" fontWeight="300" textAnchor="middle">{day}</text>
    </svg>
  );
};

export const SettingsIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#settGrad)" />
    <defs><linearGradient id="settGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#78909C" /><stop offset="1" stopColor="#455A64" /></linearGradient></defs>
    <circle cx="32" cy="32" r="10" fill="none" stroke="white" strokeWidth="2.5" />
    <circle cx="32" cy="32" r="4" fill="white" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      return <line key={i} x1={32 + Math.cos(rad) * 12} y1={32 + Math.sin(rad) * 12} x2={32 + Math.cos(rad) * 17} y2={32 + Math.sin(rad) * 17} stroke="white" strokeWidth="3" strokeLinecap="round" />;
    })}
  </svg>
);

export const BrowserIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#browseGrad)" />
    <defs><linearGradient id="browseGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#4285F4" /><stop offset="0.33" stopColor="#EA4335" /><stop offset="0.66" stopColor="#FBBC05" /><stop offset="1" stopColor="#34A853" /></linearGradient></defs>
    <circle cx="32" cy="32" r="16" fill="none" stroke="white" strokeWidth="2" />
    <ellipse cx="32" cy="32" rx="8" ry="16" fill="none" stroke="white" strokeWidth="1.5" />
    <line x1="16" y1="26" x2="48" y2="26" stroke="white" strokeWidth="1.5" />
    <line x1="16" y1="38" x2="48" y2="38" stroke="white" strokeWidth="1.5" />
    <line x1="32" y1="16" x2="32" y2="48" stroke="white" strokeWidth="1.5" />
  </svg>
);

export const PhotosIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#photoGrad)" />
    <defs><linearGradient id="photoGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#FF6B6B" /><stop offset="0.5" stopColor="#FFE66D" /><stop offset="1" stopColor="#4ECDC4" /></linearGradient></defs>
    <circle cx="32" cy="30" r="14" fill="none" stroke="white" strokeWidth="2.5" />
    <circle cx="32" cy="30" r="6" fill="white" opacity="0.5" />
    <path d="M16 46 L26 36 L34 42 L40 36 L48 46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.2" />
  </svg>
);

export const AIChatIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#aiGrad)" />
    <defs><linearGradient id="aiGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#7C3AED" /><stop offset="1" stopColor="#DB2777" /></linearGradient></defs>
    <circle cx="32" cy="28" r="12" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="27" cy="26" r="2" fill="white" />
    <circle cx="37" cy="26" r="2" fill="white" />
    <path d="M26 32 Q32 37 38 32" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20 40 L32 48 L44 40" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="20" cy="18" r="3" fill="white" opacity="0.4" />
    <circle cx="44" cy="18" r="2" fill="white" opacity="0.3" />
  </svg>
);

export const NotesIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#notesGrad)" />
    <defs><linearGradient id="notesGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#FFF59D" /><stop offset="1" stopColor="#FBC02D" /></linearGradient></defs>
    <rect x="14" y="12" width="36" height="40" rx="3" fill="white" />
    <path d="M20 22 L44 22M20 30 L40 30M20 38 L44 38M20 46 L34 46" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const WeatherIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#weatherGrad)" />
    <defs><linearGradient id="weatherGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#4FC3F7" /><stop offset="1" stopColor="#0288D1" /></linearGradient></defs>
    <circle cx="28" cy="24" r="10" fill="#FFD54F" />
    <path d="M18 36 Q22 30, 30 32 Q32 26, 40 28 Q48 28, 48 34 Q48 40, 40 40 L22 40 Q16 40, 16 36 Q16 32, 18 36Z" fill="white" opacity="0.9" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#1a1a1a" />
    <circle cx="32" cy="32" r="20" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="32" cy="32" r="2" fill="white" />
    <line x1="32" y1="32" x2="32" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="32" x2="42" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="32" x2="38" y2="40" stroke="#FF3B30" strokeWidth="1" strokeLinecap="round" />
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i) => {
      const r = (a * Math.PI) / 180;
      return <line key={i} x1={32+Math.cos(r)*17} y1={32+Math.sin(r)*17} x2={32+Math.cos(r)*19} y2={32+Math.sin(r)*19} stroke="white" strokeWidth={a%90===0?2:1} strokeLinecap="round" />;
    })}
  </svg>
);

export const RemindersIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#remGrad)" />
    <defs><linearGradient id="remGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#42A5F5" /><stop offset="1" stopColor="#1565C0" /></linearGradient></defs>
    <circle cx="22" cy="24" r="6" fill="none" stroke="white" strokeWidth="2" />
    <path d="M19 24 L21 26 L25 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="32" y1="24" x2="48" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <circle cx="22" cy="40" r="6" fill="none" stroke="white" strokeWidth="2" />
    <line x1="32" y1="40" x2="44" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export const DictionaryIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#dictGrad)" />
    <defs><linearGradient id="dictGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#8D6E63" /><stop offset="1" stopColor="#4E342E" /></linearGradient></defs>
    <rect x="16" y="10" width="32" height="44" rx="3" fill="#F5F5DC" />
    <rect x="16" y="10" width="6" height="44" rx="2" fill="#D7CCC8" />
    <text x="36" y="36" fill="#4E342E" fontSize="18" fontWeight="700" textAnchor="middle">Aa</text>
  </svg>
);

export const SpreadsheetIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#sheetGrad)" />
    <defs><linearGradient id="sheetGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#66BB6A" /><stop offset="1" stopColor="#2E7D32" /></linearGradient></defs>
    <rect x="12" y="14" width="40" height="36" rx="3" fill="white" opacity="0.95" />
    {[0,1,2,3].map(r => <line key={`h${r}`} x1="12" y1={22+r*8} x2="52" y2={22+r*8} stroke="#C8E6C9" strokeWidth="1" />)}
    {[0,1,2].map(c => <line key={`v${c}`} x1={22+c*10} y1="14" x2={22+c*10} y2="50" stroke="#C8E6C9" strokeWidth="1" />)}
  </svg>
);

export const PresentationIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#presGrad)" />
    <defs><linearGradient id="presGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#FF7043" /><stop offset="1" stopColor="#D84315" /></linearGradient></defs>
    <rect x="12" y="14" width="40" height="28" rx="3" fill="white" opacity="0.95" />
    <line x1="32" y1="42" x2="32" y2="52" stroke="white" strokeWidth="2" />
    <line x1="24" y1="52" x2="40" y2="52" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <polygon points="28,24 28,36 38,30" fill="#FF7043" />
  </svg>
);

export const DocumentIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#docGrad)" />
    <defs><linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#42A5F5" /><stop offset="1" stopColor="#1565C0" /></linearGradient></defs>
    <rect x="16" y="10" width="32" height="44" rx="3" fill="white" />
    <path d="M36 10 L48 22 L36 22Z" fill="#BBDEFB" />
    <path d="M22 30 L42 30M22 36 L38 36M22 42 L42 42M22 48 L32 48" stroke="#90CAF9" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#camGrad)" />
    <defs><linearGradient id="camGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#78909C" /><stop offset="1" stopColor="#37474F" /></linearGradient></defs>
    <rect x="12" y="22" width="40" height="28" rx="4" fill="white" opacity="0.15" stroke="white" strokeWidth="2" />
    <circle cx="32" cy="36" r="10" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="32" cy="36" r="6" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
    <rect x="24" y="16" width="16" height="8" rx="2" fill="white" opacity="0.3" />
  </svg>
);

export const MusicIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#musicGrad)" />
    <defs><linearGradient id="musicGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#EC407A" /><stop offset="1" stopColor="#AD1457" /></linearGradient></defs>
    <circle cx="24" cy="42" r="8" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="40" cy="38" r="8" fill="none" stroke="white" strokeWidth="2" />
    <line x1="32" y1="42" x2="32" y2="16" stroke="white" strokeWidth="2" />
    <line x1="48" y1="38" x2="48" y2="12" stroke="white" strokeWidth="2" />
    <line x1="32" y1="16" x2="48" y2="12" stroke="white" strokeWidth="2" />
  </svg>
);

export const MapsIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#mapGrad)" />
    <defs><linearGradient id="mapGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#66BB6A" /><stop offset="1" stopColor="#2E7D32" /></linearGradient></defs>
    <path d="M22 14 L22 50 L32 44 L42 50 L42 14 L32 20Z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    <line x1="32" y1="20" x2="32" y2="44" stroke="white" strokeWidth="1.5" />
    <circle cx="32" cy="30" r="4" fill="#FF5252" stroke="white" strokeWidth="1.5" />
  </svg>
);

export const ActivityMonitorIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#actGrad)" />
    <defs><linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#26C6DA" /><stop offset="1" stopColor="#00838F" /></linearGradient></defs>
    <path d="M12 40 L20 40 L24 20 L30 48 L36 28 L40 40 L52 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ScreenRecorderIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#333" />
    <circle cx="32" cy="32" r="16" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="32" cy="32" r="8" fill="#FF3B30" />
  </svg>
);

export const ScreenshotIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#ssGrad)" />
    <defs><linearGradient id="ssGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#7E57C2" /><stop offset="1" stopColor="#4527A0" /></linearGradient></defs>
    <rect x="14" y="14" width="36" height="36" rx="4" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" />
    <path d="M28 18 L28 14 L14 14 L14 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 50 L36 50 L50 50 L50 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UniversalPreviewIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#upGrad)" />
    <defs><linearGradient id="upGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#5C6BC0" /><stop offset="1" stopColor="#283593" /></linearGradient></defs>
    <circle cx="32" cy="32" r="14" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="32" cy="32" r="6" fill="white" opacity="0.4" />
    <circle cx="32" cy="32" r="2" fill="white" />
    <path d="M14 32 Q23 22 32 32 Q41 42 50 32" stroke="white" strokeWidth="2" fill="none" />
  </svg>
);

export const DataAnalyzerIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#daGrad)" />
    <defs><linearGradient id="daGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#FF6F00" /><stop offset="1" stopColor="#E65100" /></linearGradient></defs>
    <rect x="14" y="36" width="8" height="16" rx="2" fill="white" opacity="0.7" />
    <rect x="24" y="28" width="8" height="24" rx="2" fill="white" opacity="0.8" />
    <rect x="34" y="20" width="8" height="32" rx="2" fill="white" opacity="0.9" />
    <rect x="44" y="14" width="8" height="38" rx="2" fill="white" />
  </svg>
);

export const ToolsHubIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#toolGrad)" />
    <defs><linearGradient id="toolGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#546E7A" /><stop offset="1" stopColor="#263238" /></linearGradient></defs>
    <path d="M24 20 L24 44 L18 44 L32 54 L46 44 L40 44 L40 20Z" fill="white" opacity="0.2" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="32" cy="30" r="6" fill="none" stroke="white" strokeWidth="2" />
    <path d="M36 34 L42 40" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#trashGrad)" />
    <defs><linearGradient id="trashGrad" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#78909C" /><stop offset="1" stopColor="#455A64" /></linearGradient></defs>
    <rect x="18" y="20" width="28" height="32" rx="3" fill="none" stroke="white" strokeWidth="2" />
    <line x1="14" y1="20" x2="50" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="14" x2="38" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="28" x2="26" y2="44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="32" y1="28" x2="32" y2="44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="38" y1="28" x2="38" y2="44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Helper to generate simple app icons with a gradient background
const mkIcon = (color: string, paths: string, hasStroke: boolean, text?: string): React.FC<IconProps> => {
  const Comp: React.FC<IconProps> = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="14" fill={color} />
      {paths && <path d={paths} fill={hasStroke ? 'none' : 'white'} stroke={hasStroke ? 'white' : 'none'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />}
      {text && <text x="32" y="40" fill="white" fontSize={text.length > 2 ? '16' : '24'} fontWeight="700" textAnchor="middle">{text}</text>}
      {!paths && !text && <circle cx="32" cy="32" r="12" fill="none" stroke="white" strokeWidth="2.5" opacity="0.9" />}
    </svg>
  );
  return Comp;
};

const VideoPlayerIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#vpGr)" />
    <defs><linearGradient id="vpGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#ef4444"/><stop offset="1" stopColor="#dc2626"/></linearGradient></defs>
    <rect x="12" y="18" width="40" height="28" rx="3" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="2"/>
    <path d="M26 26 L26 38 L40 32 Z" fill="white"/>
  </svg>
);

const ModelViewerIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#mvGr)" />
    <defs><linearGradient id="mvGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
    <path d="M32 12 L50 22 L50 42 L32 52 L14 42 L14 22 Z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M32 12 L32 32 L50 22" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M32 32 L14 22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 32 L32 52" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const HelpIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#helpGr)" />
    <defs><linearGradient id="helpGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#5B86E5" /><stop offset="1" stopColor="#36D1DC" /></linearGradient></defs>
    <circle cx="32" cy="28" r="12" fill="none" stroke="white" strokeWidth="2.5"/>
    <path d="M28 24c0-3 2-5 4-5s4 2 4 4c0 2-2 3-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="32" cy="37" r="1.5" fill="white"/>
    <rect x="18" y="46" width="28" height="3" rx="1.5" fill="white" opacity="0.5"/>
    <rect x="24" y="52" width="16" height="2" rx="1" fill="white" opacity="0.3"/>
  </svg>
);

const TodoIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#todoGr)" />
    <defs><linearGradient id="todoGr" x1="0" y1="0" x2="0" y2="64"><stop stopColor="#FF9500" /><stop offset="1" stopColor="#FF6B00" /></linearGradient></defs>
    <circle cx="22" cy="22" r="5" fill="none" stroke="white" strokeWidth="2"/>
    <path d="M19.5 22 L21 23.5 L24.5 20" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="32" y1="22" x2="48" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    <circle cx="22" cy="34" r="5" fill="none" stroke="white" strokeWidth="2"/>
    <line x1="32" y1="34" x2="44" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
    <circle cx="22" cy="46" r="5" fill="none" stroke="white" strokeWidth="2"/>
    <line x1="32" y1="46" x2="46" y2="46" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
  </svg>
);

export const AppStoreIconComponent: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#storeGrad)" />
    <defs><linearGradient id="storeGrad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#2196F3" /><stop offset="1" stopColor="#0D47A1" /></linearGradient></defs>
    <text x="32" y="40" fill="white" fontSize="30" fontWeight="700" textAnchor="middle">A</text>
    <circle cx="42" cy="20" r="6" fill="#FF5252" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const TimerIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#tiGr)" />
    <defs><linearGradient id="tiGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#f97316"/><stop offset="1" stopColor="#ef4444"/></linearGradient></defs>
    <circle cx="32" cy="34" r="16" stroke="white" strokeWidth="2.5"/>
    <path d="M32 24v10l6 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26 14h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M32 14v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChessIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#chGr)" />
    <defs><linearGradient id="chGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#1e293b"/><stop offset="1" stopColor="#334155"/></linearGradient></defs>
    <rect x="14" y="14" width="36" height="36" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="14" y="14" width="9" height="9" fill="rgba(255,255,255,0.3)"/>
    <rect x="32" y="14" width="9" height="9" fill="rgba(255,255,255,0.3)"/>
    <rect x="23" y="23" width="9" height="9" fill="rgba(255,255,255,0.3)"/>
    <rect x="41" y="23" width="9" height="9" fill="rgba(255,255,255,0.3)"/>
    <rect x="14" y="32" width="9" height="9" fill="rgba(255,255,255,0.3)"/>
    <rect x="32" y="32" width="9" height="9" fill="rgba(255,255,255,0.3)"/>
    <text x="32" y="38" fill="white" fontSize="18" textAnchor="middle" fontWeight="400">&#9822;</text>
  </svg>
);

const Game2048IconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#edc22e" />
    <rect x="12" y="12" width="17" height="17" rx="3" fill="rgba(0,0,0,0.15)"/>
    <rect x="35" y="12" width="17" height="17" rx="3" fill="rgba(0,0,0,0.15)"/>
    <rect x="12" y="35" width="17" height="17" rx="3" fill="rgba(0,0,0,0.15)"/>
    <rect x="35" y="35" width="17" height="17" rx="3" fill="rgba(0,0,0,0.1)"/>
    <text x="21" y="25" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">2</text>
    <text x="43" y="25" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">4</text>
    <text x="21" y="48" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">64</text>
    <text x="43" y="48" fill="white" fontSize="7" fontWeight="800" textAnchor="middle">2048</text>
  </svg>
);

const SnakeIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#snGr)" />
    <defs><linearGradient id="snGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#059669"/><stop offset="1" stopColor="#10b981"/></linearGradient></defs>
    <path d="M16 40h8v-16h8v16h8v-24h8v24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="48" cy="16" r="4" fill="#ef4444"/>
  </svg>
);

const TicTacToeIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#ttGr)" />
    <defs><linearGradient id="ttGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#818cf8"/></linearGradient></defs>
    <line x1="26" y1="14" x2="26" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
    <line x1="38" y1="14" x2="38" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
    <line x1="14" y1="26" x2="50" y2="26" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
    <line x1="14" y1="38" x2="50" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
    <circle cx="20" cy="20" r="4" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M34 16l8 8M42 16l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="44" r="4" stroke="white" strokeWidth="2" fill="none"/>
  </svg>
);

const MemoryIconComp: React.FC<IconProps> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="url(#meGr)" />
    <defs><linearGradient id="meGr" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs>
    <rect x="12" y="12" width="17" height="17" rx="3" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
    <rect x="35" y="12" width="17" height="17" rx="3" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
    <rect x="12" y="35" width="17" height="17" rx="3" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
    <rect x="35" y="35" width="17" height="17" rx="3" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
    <text x="21" y="24" fill="white" fontSize="12" textAnchor="middle">&#9733;</text>
    <text x="43" y="24" fill="white" fontSize="10" textAnchor="middle">?</text>
    <text x="21" y="48" fill="white" fontSize="10" textAnchor="middle">?</text>
    <text x="43" y="48" fill="white" fontSize="12" textAnchor="middle">&#9733;</text>
  </svg>
);

// Icon registry - maps app IDs to icon components
export const APP_ICONS: Record<string, React.FC<IconProps>> = {
  'finder': FinderIcon,
  'terminal': TerminalIcon,
  'textedit': TextEditIcon,
  'code-editor': CodeEditorIcon,
  'calculator': CalculatorIcon,
  'calendar': CalendarIcon,
  'settings': SettingsIcon,
  'browser': BrowserIcon,
  'photos': PhotosIcon,
  'ai-chat': AIChatIcon,
  'notes': NotesIcon,
  'weather': WeatherIcon,
  'clock': ClockIcon,
  'reminders': RemindersIcon,
  'dictionary': DictionaryIcon,
  'spreadsheet': SpreadsheetIcon,
  'presentation': PresentationIcon,
  'document': DocumentIcon,
  'camera': CameraIcon,
  'music': MusicIcon,
  'maps': MapsIcon,
  'activity-monitor': ActivityMonitorIcon,
  'screen-recorder': ScreenRecorderIcon,
  'screenshot': ScreenshotIcon,
  'universal-preview': UniversalPreviewIcon,
  'data-analyzer': DataAnalyzerIcon,
  'tools-hub': ToolsHubIcon,
  'app-store': AppStoreIconComponent,
  'todo': TodoIconComp,
  'help': HelpIconComp,
  'model-viewer': ModelViewerIconComp,
  'video-player': VideoPlayerIconComp,
  'typing-test': mkIcon('#F59E0B', 'M16 20h32M22 32h20M18 44h28', false, 'Aa'),
  'drawing-pad': mkIcon('#EC4899', 'M20 44L40 20M36 24l4-4 4 4-4 4', false),
  'whiteboard': mkIcon('#94A3B8', 'M12 12h40v40H12zM20 28h24M20 36h16', true),
  'quiz': mkIcon('#8B5CF6', '', false, '?!'),
  'periodic-table': mkIcon('#06B6D4', 'M14 14h12v12H14zM26 14h12v12H26zM38 14h12v12H38zM14 26h12v12H14zM26 26h12v12H26z', true),
  'metronome': mkIcon('#EF4444', 'M32 16v28M22 48h20M32 16l10 20', false),
  'password-gen': mkIcon('#10B981', 'M20 28h24M20 36h16', true, '***'),
  'qr-generator': mkIcon('#1F2937', 'M16 16h12v12H16zM36 16h12v12H36zM16 36h12v12H16zM36 40h4v4h-4zM44 36h4v4h-4zM40 44h8v4h-8z', true),
  'translator': mkIcon('#3B82F6', '', false, 'Aa'),
  'coin-flip': mkIcon('#D97706', '', false, '$'),
  'dice-roller': mkIcon('#DC2626', 'M16 16h32v32H16z', true, '...'),
  'graph-plotter': mkIcon('#7C3AED', 'M16 48L28 28L36 36L48 16', false),
  'voice-recorder': mkIcon('#EF4444', '', false),
  'tuner': mkIcon('#A855F7', 'M20 32h24M32 20v24', false),
  'timer': TimerIconComp,
  'chess': ChessIconComp,
  '2048': Game2048IconComp,
  'snake': SnakeIconComp,
  'tic-tac-toe': TicTacToeIconComp,
  'memory-game': MemoryIconComp,
};

export const AppIcon: React.FC<{ appId: string; size?: number }> = ({ appId, size = 48 }) => {
  const Icon = APP_ICONS[appId];
  if (Icon) return <Icon size={size} />;
  // Fallback
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="14" fill="#888" />
      <text x="32" y="38" fill="white" fontSize="20" textAnchor="middle" fontWeight="600">?</text>
    </svg>
  );
};
