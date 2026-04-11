import { create } from 'zustand';

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
  currentUser: { name: string; email: string; avatar: string } | null;
  login: (name: string, email: string) => void;
  logout: () => void;

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
  login: (name, email) => set({
    isLoggedIn: true,
    currentUser: { name, email, avatar: name.charAt(0).toUpperCase() }
  }),
  logout: () => set({
    isLoggedIn: false,
    currentUser: null,
    windows: [],
    showControlCenter: false,
    showSpotlight: false,
    showNotificationCenter: false,
    showWidgets: false
  }),

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
