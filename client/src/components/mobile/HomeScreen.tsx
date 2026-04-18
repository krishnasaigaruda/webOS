import React from 'react';
import { useStore } from '../../store/useStore';
import { useDevice } from '../../hooks/useDeviceType';
import { AppIcon } from '../../utils/icons';
import { getMobileApps } from './mobileAppRegistry';

const WALLPAPERS: Record<string, string> = {
  default: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 30%, #f0932b 60%, #ffbe76 100%)',
  ocean: 'linear-gradient(135deg, #0c2461 0%, #0a3d62 30%, #3c6382 60%, #60a3bc 100%)',
  forest: 'linear-gradient(135deg, #0a3d0a 0%, #1e5128 30%, #4e9f3d 60%, #89b868 100%)',
  aurora: 'linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 50%, #0f9b8e 80%, #44bd6e 100%)',
  cosmic: 'linear-gradient(135deg, #000428 0%, #1a0533 30%, #2d1b69 60%, #004e92 100%)',
  rose: 'linear-gradient(135deg, #2c003e 0%, #512b58 30%, #8b4367 60%, #d9727b 100%)',
  minimal: 'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)',
  midnight: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a2e 100%)',
};

const HomeScreen: React.FC = () => {
  const device = useDevice();
  const openWindow = useStore(s => s.openWindow);
  const wallpaper = useStore(s => s.wallpaper);
  const apps = getMobileApps();

  const columns = device === 'iphone' ? 4 : 6;
  const iconSize = device === 'iphone' ? 60 : 72;

  const bg = WALLPAPERS[wallpaper] || WALLPAPERS.default;

  const launch = (appId: string, name: string, icon: string) => {
    openWindow(appId, name, icon);
  };

  return (
    <div
      className="mobile-home-screen"
      style={{
        position: 'absolute',
        inset: 0,
        background: bg,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'calc(env(safe-area-inset-top) + 52px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: device === 'iphone' ? 18 : 28,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {apps.map(app => (
          <button
            key={app.id}
            onClick={() => launch(app.id, app.name, app.icon)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <div
              style={{
                width: iconSize,
                height: iconSize,
                borderRadius: iconSize * 0.22,
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              <AppIcon appId={app.id} size={iconSize} />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: iconSize + 10,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {app.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
