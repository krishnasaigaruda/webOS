import { APP_REGISTRY, AppDefinition } from '../../utils/appRegistry';

// Apps that don't make sense on iPhone/iPad and are hidden from the mobile home screen.
const BLOCKLIST = new Set<string>([
  'terminal',
  'code-editor',
  'activity-monitor',
  'data-analyzer',
  'tools-hub',
  'textedit',
  'music',
  'model-viewer',
  'video-player',
  'voice-recorder',
  'spreadsheet',
  'document',
  'screen-recorder',
  'screenshot',
]);

export function getMobileApps(): AppDefinition[] {
  return Object.values(APP_REGISTRY).filter(a => !BLOCKLIST.has(a.id));
}

export function isMobileAllowedApp(appId: string): boolean {
  return !BLOCKLIST.has(appId);
}
