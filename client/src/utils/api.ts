const API_BASE = 'http://localhost:3001/api';

export const api = {
  // File System
  fs: {
    list: (path: string) =>
      fetch(`${API_BASE}/fs/list?path=${encodeURIComponent(path)}`).then(r => r.json()),
    read: (path: string) =>
      fetch(`${API_BASE}/fs/read?path=${encodeURIComponent(path)}`).then(r => r.json()),
    write: (path: string, content: string) =>
      fetch(`${API_BASE}/fs/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content })
      }).then(r => r.json()),
    mkdir: (path: string) =>
      fetch(`${API_BASE}/fs/mkdir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      }).then(r => r.json()),
    delete: (path: string) =>
      fetch(`${API_BASE}/fs/delete?path=${encodeURIComponent(path)}`, { method: 'DELETE' }).then(r => r.json()),
    rename: (oldPath: string, newPath: string) =>
      fetch(`${API_BASE}/fs/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newPath })
      }).then(r => r.json()),
    copy: (source: string, destination: string) =>
      fetch(`${API_BASE}/fs/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination })
      }).then(r => r.json()),
    search: (query: string, path?: string) =>
      fetch(`${API_BASE}/fs/search?query=${encodeURIComponent(query)}${path ? `&path=${encodeURIComponent(path)}` : ''}`).then(r => r.json()),
    info: (path: string) =>
      fetch(`${API_BASE}/fs/info?path=${encodeURIComponent(path)}`).then(r => r.json()),
    serveUrl: (path: string) =>
      `${API_BASE}/fs/serve?path=${encodeURIComponent(path)}`,
  },

  // System
  system: {
    info: () => fetch(`${API_BASE}/system/info`).then(r => r.json()),
    exec: (command: string, cwd?: string) =>
      fetch(`${API_BASE}/system/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, cwd })
      }).then(r => r.json()),
    screenshot: () =>
      fetch(`${API_BASE}/system/screenshot`, { method: 'POST' }).then(r => r.json()),
    wifi: (enabled: boolean) =>
      fetch(`${API_BASE}/system/wifi`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) }).then(r => r.json()),
    bluetooth: (enabled: boolean) =>
      fetch(`${API_BASE}/system/bluetooth`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) }).then(r => r.json()),
    volume: (level: number) =>
      fetch(`${API_BASE}/system/volume`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level }) }).then(r => r.json()),
    dnd: (enabled: boolean) =>
      fetch(`${API_BASE}/system/dnd`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) }).then(r => r.json()),
  },

  // AI
  ai: {
    chat: (messages: Array<{ role: string; content: string }>) =>
      fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      }).then(r => r.json()),
  },

  // Dictionary
  dictionary: (word: string) =>
    fetch(`${API_BASE}/dictionary/${encodeURIComponent(word)}`).then(r => r.json()),

  // Weather
  weather: (lat?: number, lon?: number) =>
    fetch(`${API_BASE}/weather${lat ? `?lat=${lat}&lon=${lon}` : ''}`).then(r => r.json()),
};
