import { create } from 'zustand';
import { saveState, loadState } from '../utils/persistence';
import { registerApp, AppDefinition } from '../utils/appRegistry';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  desktop: number;
  icon: string;
  filePath?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  timestamp: Date;
  read: boolean;
  app?: string;
}

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string;
  created: string;
  mimeType: string;
}

interface OSStore {
  // Auth
  isLoggedIn: boolean;
  justLoggedIn: boolean;
  currentUser: { name: string; email: string; avatar: string } | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  clearJustLoggedIn: () => void;

  // Session file path (.webos) — if set, state auto-syncs to this file
  sessionFilePath: string | null;
  setSessionFilePath: (path: string | null) => void;

  // Windows
  windows: WindowState[];
  nextZIndex: number;
  openWindow: (appId: string, title: string, icon: string, opts?: Partial<WindowState>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;

  // Desktop
  currentDesktop: number;
  desktopCount: number;
  setCurrentDesktop: (n: number) => void;
  addDesktop: () => void;
  removeDesktop: (n: number) => void;

  // System
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Control Center
  showControlCenter: boolean;
  toggleControlCenter: () => void;
  wifi: boolean;
  bluetooth: boolean;
  doNotDisturb: boolean;
  airplaneMode: boolean;
  brightness: number;
  volume: number;
  toggleWifi: () => void;
  toggleBluetooth: () => void;
  toggleDoNotDisturb: () => void;
  toggleAirplaneMode: () => void;
  setBrightness: (v: number) => void;
  setVolume: (v: number) => void;

  // Privacy & Security
  cameraAccess: boolean;
  microphoneAccess: boolean;
  locationServices: boolean;
  toggleCameraAccess: () => void;
  toggleMicrophoneAccess: () => void;
  toggleLocationServices: () => void;

  // Spotlight
  showSpotlight: boolean;
  toggleSpotlight: () => void;

  // Notification Center
  showNotificationCenter: boolean;
  toggleNotificationCenter: () => void;

  // Context Menu
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;
  showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  hideContextMenu: () => void;

  // Theme
  theme: 'light' | 'dark';
  accentColor: string;
  wallpaper: string;
  toggleTheme: () => void;
  setAccentColor: (c: string) => void;
  setWallpaper: (w: string) => void;

  // Widgets
  showWidgets: boolean;
  toggleWidgets: () => void;

  // Dock
  dockApps: string[];
  setDockApps: (apps: string[]) => void;
}

export interface ContextMenuItem {
  label: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
  submenu?: ContextMenuItem[];
  icon?: string;
  shortcut?: string;
}

let windowCounter = 0;

export const useStore = create<OSStore>((set, get) => ({
  // Auth
  isLoggedIn: false,
  currentUser: null,
  justLoggedIn: false,
  login: (name, email) => {
    // Mark as fresh login - triggers setup wizard
    (window as any).__webos_fresh_login = true;
    set({
      isLoggedIn: true,
      currentUser: { name, email, avatar: name.charAt(0).toUpperCase() },
      justLoggedIn: true,
    });
  },
  clearJustLoggedIn: () => set({ justLoggedIn: false }),
  logout: () => set({
    isLoggedIn: false,
    currentUser: null,
    windows: [],
    showControlCenter: false,
    showSpotlight: false,
    showNotificationCenter: false,
    showWidgets: false,
    sessionFilePath: null,
  }),

  sessionFilePath: null,
  setSessionFilePath: (path) => set({ sessionFilePath: path }),

  // Windows
  windows: [],
  nextZIndex: 100,
  openWindow: (appId, title, icon, opts = {}) => {
    const id = `window-${++windowCounter}`;
    const state = get();
    const offset = (state.windows.length % 10) * 30;
    const newWindow: WindowState = {
      id,
      appId,
      title,
      x: opts.x ?? 100 + offset,
      y: opts.y ?? 50 + offset,
      width: opts.width ?? 800,
      height: opts.height ?? 600,
      minWidth: opts.minWidth ?? 400,
      minHeight: opts.minHeight ?? 300,
      isMinimized: false,
      isMaximized: false,
      isActive: true,
      zIndex: state.nextZIndex,
      desktop: state.currentDesktop,
      icon,
      filePath: opts.filePath,
    };
    set(s => ({
      windows: [...s.windows.map(w => ({ ...w, isActive: false })), newWindow],
      nextZIndex: s.nextZIndex + 1
    }));
    return id;
  },
  closeWindow: (id) => set(s => ({
    windows: s.windows.filter(w => w.id !== id)
  })),
  minimizeWindow: (id) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, isMinimized: true, isActive: false } : w)
  })),
  maximizeWindow: (id) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, isMaximized: true } : w)
  })),
  restoreWindow: (id) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, isMaximized: false, isMinimized: false, isActive: true, zIndex: s.nextZIndex } : { ...w, isActive: false }),
    nextZIndex: s.nextZIndex + 1
  })),
  focusWindow: (id) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, isActive: true, zIndex: s.nextZIndex, isMinimized: false } : { ...w, isActive: false }),
    nextZIndex: s.nextZIndex + 1
  })),
  updateWindow: (id, updates) => set(s => ({
    windows: s.windows.map(w => w.id === id ? { ...w, ...updates } : w)
  })),

  // Desktop
  currentDesktop: 0,
  desktopCount: 3,
  setCurrentDesktop: (n) => set({ currentDesktop: n }),
  addDesktop: () => set(s => ({ desktopCount: s.desktopCount + 1 })),
  removeDesktop: (n) => set(s => ({
    desktopCount: Math.max(1, s.desktopCount - 1),
    currentDesktop: s.currentDesktop >= s.desktopCount - 1 ? s.desktopCount - 2 : s.currentDesktop
  })),

  // Notifications
  notifications: [],
  addNotification: (n) => set(s => ({
    notifications: [{ ...n, id: `notif-${Date.now()}`, timestamp: new Date(), read: false }, ...s.notifications]
  })),
  clearNotification: (id) => set(s => ({
    notifications: s.notifications.filter(n => n.id !== id)
  })),
  clearAllNotifications: () => set({ notifications: [] }),

  // Control Center
  showControlCenter: false,
  toggleControlCenter: () => set(s => ({ showControlCenter: !s.showControlCenter, showNotificationCenter: false, showSpotlight: false })),
  wifi: true,
  bluetooth: true,
  doNotDisturb: false,
  airplaneMode: false,
  brightness: 100,
  volume: 75,
  toggleWifi: () => set(s => ({ wifi: !s.wifi })),
  toggleBluetooth: () => set(s => ({ bluetooth: !s.bluetooth })),
  toggleDoNotDisturb: () => set(s => ({ doNotDisturb: !s.doNotDisturb })),
  toggleAirplaneMode: () => set(s => ({ airplaneMode: !s.airplaneMode })),
  setBrightness: (v) => set({ brightness: v }),
  setVolume: (v) => set({ volume: v }),

  // Privacy & Security
  cameraAccess: true,
  microphoneAccess: true,
  locationServices: false,
  toggleCameraAccess: () => set(s => ({ cameraAccess: !s.cameraAccess })),
  toggleMicrophoneAccess: () => set(s => ({ microphoneAccess: !s.microphoneAccess })),
  toggleLocationServices: () => set(s => ({ locationServices: !s.locationServices })),

  // Spotlight
  showSpotlight: false,
  toggleSpotlight: () => set(s => ({ showSpotlight: !s.showSpotlight, showControlCenter: false, showNotificationCenter: false })),

  // Notification Center
  showNotificationCenter: false,
  toggleNotificationCenter: () => set(s => ({ showNotificationCenter: !s.showNotificationCenter, showControlCenter: false, showSpotlight: false })),

  // Context Menu
  contextMenu: null,
  showContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
  hideContextMenu: () => set({ contextMenu: null }),

  // Theme
  theme: 'light',
  accentColor: '#007AFF',
  wallpaper: 'default',
  toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
  setAccentColor: (c) => set({ accentColor: c }),
  setWallpaper: (w) => set({ wallpaper: w }),

  // Widgets
  showWidgets: false,
  toggleWidgets: () => set(s => ({ showWidgets: !s.showWidgets })),

  // Dock
  dockApps: ['finder', 'textedit', 'code-editor', 'calculator', 'calendar', 'browser', 'photos', 'ai-chat', 'music', 'settings'],
  setDockApps: (apps) => set({ dockApps: apps }),
}));

// ============= IndexedDB Persistence =============

// Keys to persist
const PERSIST_KEYS = [
  'isLoggedIn', 'currentUser', 'theme', 'accentColor', 'wallpaper',
  'dockApps', 'wifi', 'bluetooth', 'doNotDisturb', 'airplaneMode',
  'brightness', 'volume', 'notifications', 'desktopCount', 'currentDesktop',
  'cameraAccess', 'microphoneAccess', 'locationServices',
] as const;

// Debounced save
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function buildSnapshot(): Record<string, any> {
  const state = useStore.getState();
  const snap: Record<string, any> = {};
  for (const key of PERSIST_KEYS) {
    snap[key] = (state as any)[key];
  }
  snap['savedWindows'] = state.windows.map(w => ({
    appId: w.appId, title: w.title, x: w.x, y: w.y,
    width: w.width, height: w.height, minWidth: w.minWidth, minHeight: w.minHeight,
    isMinimized: w.isMinimized, isMaximized: w.isMaximized,
    desktop: w.desktop, icon: w.icon, filePath: w.filePath,
  }));
  // Include reminders (stored in localStorage separately)
  try {
    const reminders = localStorage.getItem('webos-reminders');
    if (reminders) snap['reminders'] = JSON.parse(reminders);
  } catch {}
  return snap;
}

function persistState() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const snapshot = buildSnapshot();
    for (const [key, value] of Object.entries(snapshot)) {
      if (key !== 'reminders') saveState(key, value);
    }
    // Also sync to the .webos session file if one is active
    const sessionPath = useStore.getState().sessionFilePath;
    if (sessionPath) {
      try {
        fetch('http://localhost:3001/api/session/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: sessionPath, data: snapshot }),
        }).catch(() => {});
      } catch {}
    }
  }, 500);
}

// Subscribe to all state changes
useStore.subscribe(persistState);

// Save installed apps list separately
export async function saveInstalledApps(apps: AppDefinition[]) {
  await saveState('installedApps', apps.map(a => ({
    id: a.id, name: a.name, icon: a.icon, category: a.category,
    defaultWidth: a.defaultWidth, defaultHeight: a.defaultHeight, description: a.description,
  })));
}

// Apply a loaded snapshot (from a .webos session file) to the store.
// Restores auth, UI state, windows, and reminders.
export function applySessionSnapshot(snapshot: Record<string, any>) {
  const newState: Record<string, any> = {};
  for (const key of PERSIST_KEYS) {
    if (snapshot[key] !== undefined) newState[key] = snapshot[key];
  }
  // Restore windows
  if (Array.isArray(snapshot.savedWindows) && snapshot.savedWindows.length > 0) {
    let zIdx = 100;
    const restored: WindowState[] = snapshot.savedWindows.map((w: any, i: number) => ({
      id: `restored-${i}-${Date.now()}`,
      appId: w.appId,
      title: w.title,
      x: w.x || 100,
      y: w.y || 50,
      width: w.width || 800,
      height: w.height || 600,
      minWidth: w.minWidth || 400,
      minHeight: w.minHeight || 300,
      isMinimized: w.isMinimized || false,
      isMaximized: w.isMaximized || false,
      isActive: i === snapshot.savedWindows.length - 1,
      zIndex: ++zIdx,
      desktop: w.desktop || 0,
      icon: w.icon || w.appId,
      filePath: w.filePath,
    }));
    newState.windows = restored;
    newState.nextZIndex = zIdx + 1;
  } else {
    newState.windows = [];
  }
  // Restore reminders to localStorage (where the checker reads them)
  try {
    if (Array.isArray(snapshot.reminders)) {
      localStorage.setItem('webos-reminders', JSON.stringify(snapshot.reminders));
    }
  } catch {}
  useStore.setState(newState as any);
}

// ============= Global Reminders Checker =============
// Runs regardless of whether Reminders app is open
const firedReminderIds = new Set<string>();

function checkReminders() {
  try {
    const raw = localStorage.getItem('webos-reminders');
    if (!raw) return;
    const reminders = JSON.parse(raw);
    if (!Array.isArray(reminders)) return;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDate = now.toISOString().split('T')[0];
    let changed = false;
    const updated = reminders.map((r: any) => {
      if (r.enabled && !r.fired && r.time === currentTime && r.date === currentDate && !firedReminderIds.has(r.id)) {
        firedReminderIds.add(r.id);
        const notif = { title: 'Reminder', message: r.title, app: 'reminders' };
        useStore.getState().addNotification(notif);
        // Also dispatch a direct DOM event so the toast component is guaranteed to hear about it
        try {
          window.dispatchEvent(new CustomEvent('webos-toast', { detail: notif }));
        } catch {}
        try {
          const ctx = new AudioContext();
          const playChime = (startOffset: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880; osc.type = 'sine'; gain.gain.value = 0.3;
            osc.start(ctx.currentTime + startOffset);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + 0.8);
            osc.stop(ctx.currentTime + startOffset + 0.8);
          };
          playChime(0);
          playChime(1.0); // Second chime ~1s after the first
        } catch {}
        changed = true;
        return { ...r, fired: true };
      }
      return r;
    });
    if (changed) {
      localStorage.setItem('webos-reminders', JSON.stringify(updated));
      window.dispatchEvent(new Event('webos-reminders-updated'));
    }
  } catch {}
}

if (typeof window !== 'undefined') {
  // Check every second so reminders fire within 1s of their target time
  setInterval(checkReminders, 1000);
}

// Restore state from IndexedDB on app load
export async function restoreState() {
  try {
    for (const key of PERSIST_KEYS) {
      const value = await loadState(key);
      if (value !== undefined) {
        useStore.setState({ [key]: value } as any);
      }
    }
    // Restore windows
    const savedWindows = await loadState('savedWindows');
    if (savedWindows && Array.isArray(savedWindows) && savedWindows.length > 0) {
      let zIdx = 100;
      const restoredWindows: WindowState[] = savedWindows.map((w: any, i: number) => ({
        id: `restored-${i}-${Date.now()}`,
        appId: w.appId,
        title: w.title,
        x: w.x || 100,
        y: w.y || 50,
        width: w.width || 800,
        height: w.height || 600,
        minWidth: w.minWidth || 400,
        minHeight: w.minHeight || 300,
        isMinimized: w.isMinimized || false,
        isMaximized: w.isMaximized || false,
        isActive: i === savedWindows.length - 1,
        zIndex: ++zIdx,
        desktop: w.desktop || 0,
        icon: w.icon || w.appId,
        filePath: w.filePath,
      }));
      useStore.setState({ windows: restoredWindows, nextZIndex: zIdx + 1 });
    }
    // Restore installed apps
    const installedApps = await loadState('installedApps');
    if (installedApps && Array.isArray(installedApps)) {
      for (const app of installedApps) {
        registerApp(app);
      }
    }
  } catch {}
}
