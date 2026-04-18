export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  category: 'productivity' | 'utilities' | 'media' | 'system' | 'ai' | 'development';
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  description?: string;
}

export const APP_REGISTRY: Record<string, AppDefinition> = {
  'finder': { id: 'finder', name: 'Finder', icon: 'finder', category: 'system', defaultWidth: 900, defaultHeight: 600, description: 'Browse and manage your files' },
  'textedit': { id: 'textedit', name: 'TextEdit', icon: 'textedit', category: 'productivity', defaultWidth: 700, defaultHeight: 500, description: 'Simple text editor' },
  'terminal': { id: 'terminal', name: 'Terminal', icon: 'terminal', category: 'development', defaultWidth: 700, defaultHeight: 450, description: 'Command line interface' },
  'code-editor': { id: 'code-editor', name: 'Code Editor', icon: 'code-editor', category: 'development', defaultWidth: 1000, defaultHeight: 700, description: 'Professional code editor' },
  'calculator': { id: 'calculator', name: 'Calculator', icon: 'calculator', category: 'utilities', defaultWidth: 320, defaultHeight: 500, minWidth: 320, minHeight: 500, description: 'Perform calculations' },
  'calendar': { id: 'calendar', name: 'Calendar', icon: 'calendar', category: 'productivity', defaultWidth: 800, defaultHeight: 600, description: 'Calendar and events' },
  'todo': { id: 'todo', name: 'To Do', icon: 'todo', category: 'productivity', defaultWidth: 400, defaultHeight: 550, description: 'Keep track of tasks' },
  'reminders': { id: 'reminders', name: 'Reminders', icon: 'reminders', category: 'productivity', defaultWidth: 450, defaultHeight: 550, description: 'Set reminders with notifications' },
  'notes': { id: 'notes', name: 'Notes', icon: 'notes', category: 'productivity', defaultWidth: 600, defaultHeight: 500, description: 'Quick notes and lists' },
  'clock': { id: 'clock', name: 'Clock', icon: 'clock', category: 'utilities', defaultWidth: 400, defaultHeight: 500, description: 'World clock, timer, alarm' },
  'weather': { id: 'weather', name: 'Weather', icon: 'weather', category: 'utilities', defaultWidth: 500, defaultHeight: 550, description: 'Current weather and forecast' },
  'photos': { id: 'photos', name: 'Photos', icon: 'photos', category: 'media', defaultWidth: 900, defaultHeight: 600, description: 'View and organize photos' },
  'browser': { id: 'browser', name: 'Web Browser', icon: 'browser', category: 'utilities', defaultWidth: 1000, defaultHeight: 700, description: 'Browse the web' },
  'settings': { id: 'settings', name: 'Settings', icon: 'settings', category: 'system', defaultWidth: 800, defaultHeight: 600, description: 'System preferences' },
  'ai-chat': { id: 'ai-chat', name: 'AI Assistant', icon: 'ai-chat', category: 'ai', defaultWidth: 500, defaultHeight: 650, description: 'AI-powered assistant' },
  'dictionary': { id: 'dictionary', name: 'Dictionary', icon: 'dictionary', category: 'utilities', defaultWidth: 550, defaultHeight: 500, description: 'Look up word definitions' },
  'spreadsheet': { id: 'spreadsheet', name: 'Spreadsheet', icon: 'spreadsheet', category: 'productivity', defaultWidth: 1000, defaultHeight: 650, description: 'Create and edit spreadsheets' },
  'document': { id: 'document', name: 'Document', icon: 'document', category: 'productivity', defaultWidth: 800, defaultHeight: 700, description: 'Rich text document editor' },
  'data-analyzer': { id: 'data-analyzer', name: 'Data Analyzer', icon: 'data-analyzer', category: 'ai', defaultWidth: 900, defaultHeight: 650, description: 'Analyze and visualize data' },
  'universal-preview': { id: 'universal-preview', name: 'Universal Preview', icon: 'universal-preview', category: 'utilities', defaultWidth: 800, defaultHeight: 600, description: 'Preview any file type' },
  'camera': { id: 'camera', name: 'Camera', icon: 'camera', category: 'media', defaultWidth: 640, defaultHeight: 520, description: 'Take photos and videos' },
  'music': { id: 'music', name: 'Music', icon: 'music', category: 'media', defaultWidth: 600, defaultHeight: 500, description: 'Play and manage music' },
  'maps': { id: 'maps', name: 'Maps', icon: 'maps', category: 'utilities', defaultWidth: 900, defaultHeight: 650, description: 'Explore maps' },
  'activity-monitor': { id: 'activity-monitor', name: 'Activity Monitor', icon: 'activity-monitor', category: 'system', defaultWidth: 700, defaultHeight: 450, description: 'Monitor system resources' },
  'help': { id: 'help', name: 'Help', icon: 'help', category: 'system', defaultWidth: 800, defaultHeight: 600, description: 'webOS help and documentation' },
  'model-viewer': { id: 'model-viewer', name: '3D Model Viewer', icon: 'model-viewer', category: 'media', defaultWidth: 900, defaultHeight: 650, description: 'View 3D models (glb, gltf, obj, stl, fbx)' },
  'video-player': { id: 'video-player', name: 'Video Player', icon: 'video-player', category: 'media', defaultWidth: 900, defaultHeight: 650, description: 'Play video files' },
  'app-store': { id: 'app-store', name: 'App Store', icon: 'app-store', category: 'system', defaultWidth: 900, defaultHeight: 650, description: 'Discover and install apps' },
  'timer': { id: 'timer', name: 'Timer', icon: 'timer', category: 'utilities', defaultWidth: 400, defaultHeight: 500, description: 'Timer and stopwatch' },
  'chess': { id: 'chess', name: 'Chess', icon: 'chess', category: 'media', defaultWidth: 480, defaultHeight: 560, description: 'Play chess' },
  '2048': { id: '2048', name: '2048', icon: '2048', category: 'media', defaultWidth: 400, defaultHeight: 520, description: 'Slide tiles to reach 2048' },
  'snake': { id: 'snake', name: 'Snake', icon: 'snake', category: 'media', defaultWidth: 400, defaultHeight: 520, description: 'Classic snake game' },
  'tic-tac-toe': { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: 'tic-tac-toe', category: 'media', defaultWidth: 380, defaultHeight: 460, description: 'Play tic-tac-toe' },
  'memory-game': { id: 'memory-game', name: 'Memory', icon: 'memory-game', category: 'media', defaultWidth: 400, defaultHeight: 480, description: 'Match pairs memory game' },
  'drawing-pad': { id: 'drawing-pad', name: 'Drawing Pad', icon: 'drawing-pad', category: 'media', defaultWidth: 700, defaultHeight: 500, description: 'Digital drawing canvas' },
  'translator': { id: 'translator', name: 'Translate', icon: 'translator', category: 'utilities', defaultWidth: 500, defaultHeight: 450, description: 'Translate between languages' },
};

export const getApp = (id: string): AppDefinition | undefined => APP_REGISTRY[id];
export const getAllApps = (): AppDefinition[] => Object.values(APP_REGISTRY);
export const getAppsByCategory = (category: string): AppDefinition[] =>
  Object.values(APP_REGISTRY).filter(app => app.category === category);

// Dynamically register an app (used by App Store on install)
export const registerApp = (app: AppDefinition) => {
  APP_REGISTRY[app.id] = app;
};
