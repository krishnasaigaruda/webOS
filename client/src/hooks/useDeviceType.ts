export type DeviceType = 'desktop' | 'ipad' | 'iphone';

function computeDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';

  // Query-string override for testing on a Mac
  try {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('forceMobile');
    if (forced === 'iphone' || forced === 'ipad' || forced === 'desktop') {
      return forced;
    }
  } catch {}

  const ua = navigator.userAgent || '';
  const isIPhone = /iPhone/i.test(ua);
  // iPad on iOS 13+ reports as Macintosh; disambiguate via touch points.
  const isIPad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1);

  if (isIPhone) return 'iphone';
  if (isIPad) return 'ipad';
  return 'desktop';
}

const DEVICE_TYPE: DeviceType = computeDevice();

export function useDevice(): DeviceType {
  return DEVICE_TYPE;
}

export function isMobileDevice(): boolean {
  return DEVICE_TYPE === 'iphone' || DEVICE_TYPE === 'ipad';
}
