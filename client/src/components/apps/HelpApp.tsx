import React, { useState } from 'react';
import { WindowState } from '../../store/useStore';

const sections = [
  { id: 'overview', title: 'Overview', content: `
**webOS** is a complete web-based operating system that runs in your browser. It provides a full desktop experience with real file system access, AI integration, and professional applications.

**Key Features:**
- Real file sync with your Mac filesystem
- AI-powered assistant (powered by Pollinations.ai)
- 25+ built-in applications
- Dark/Light themes with accent colors
- Customizable wallpapers
- Draggable, resizable windows
- Multiple desktop workspaces
- Spotlight search with recursive file search
- Control Center for quick settings
- Notification system
  `},
  { id: 'desktop', title: 'Desktop & Navigation', content: `
**Menu Bar** (top) - Click the webOS logo for system options. File, Edit, View, Go, Window, and Help menus provide app-specific actions.

**Dock** (bottom) - Your favorite apps. Click to open, right-click for options. Drag to rearrange. The trash can opens your Trash folder.

**Desktop Icons** - Click Macintosh HD, Documents, or Downloads to open Finder at those locations.

**Spotlight Search** - Press Cmd+Space or click the search icon. Search for apps and files recursively through all folders.

**Control Center** - Click the grid icon in the menu bar. Toggle Wi-Fi, Airplane Mode, Do Not Disturb, Dark Mode. Adjust volume.

**Notifications** - Click the date/time in the menu bar to see notifications.

**Windows** - Drag title bars to move. Drag edges to resize. Traffic light buttons: red=close, yellow=minimize, green=maximize. Double-click title bar to maximize/restore.
  `},
  { id: 'apps', title: 'Built-in Apps', content: `
**Finder** - Browse your Mac's file system. Create files/folders, rename, move to trash, search recursively. Switch between Files and webOS Apps tabs.

**TextEdit** - Open and edit any text file. Shows "Open File" screen with recent files. Save with custom file picker.

**Code Editor** - Monaco-powered editor when opening files, Tools Hub editor for standalone use. Syntax highlighting for 20+ languages.

**Calculator** - Full scientific calculator from Tools Hub.

**Calendar** - Monthly calendar with event management.

**Notes** - Quick note-taking app.

**To Do** - Task management with checklists.

**Reminders** - Time-based reminders with sound notifications.

**Clock** - World clock, timers, alarms, stopwatch.

**Weather** - Live weather data based on your location.

**Photos** - Browse images from your Mac. View in full size.

**Camera** - Take photos and record videos using your webcam.

**Music** - Music player from Tools Hub.

**Maps** - Interactive maps from Tools Hub.

**Dictionary** - Word definitions and pronunciation.

**Browser** - Built-in web browser with tabs and bookmarks.

**AI Assistant** - AI chat powered by Pollinations.ai. Can also open apps by command.

**Universal Preview** - Preview any file type from your UniversalPreview project.

**Data Analyzer** - Analyze CSV/JSON data with charts and statistics.

**Tools Hub** - 60+ tools: color picker, JSON formatter, regex tester, unit converter, and more.

**Settings** - Theme, wallpaper, accent color, network, sound, privacy, and about.

**App Store** - Browse and discover all available webOS apps.

**Activity Monitor** - View CPU, memory usage, and running app processes.

**Terminal** - Real command-line access to your Mac via the server.
  `},
  { id: 'files', title: 'File Management', content: `
**Opening Files** - Double-click in Finder, or right-click > Open With to choose an app.

**Open With** - Only shows compatible apps: TextEdit and Code Editor for text files, Photos for images, Universal Preview for any file.

**Creating Files** - Click the + buttons in Finder toolbar. A custom dialog appears (no browser prompts).

**Trash** - "Move to Trash" moves files to ~/.Trash (synced with Mac Trash). Right-click the Trash icon in dock to empty.

**Search** - Finder search is recursive - it searches inside subfolders up to 10 levels deep. Results show the full file path.

**File Icons** - Each file type has a unique colored icon with extension label. .app bundles show a special app icon.
  `},
  { id: 'shortcuts', title: 'Keyboard Shortcuts', content: `
**Cmd + Space** - Open Spotlight Search
**Cmd + W** - Close active window
**Cmd + M** - Minimize active window
**Cmd + N** - New window of active app
**Cmd + ,** - Open Settings

**In Text Editor:**
**Cmd + S** - Save file
**Cmd + Z** - Undo
**Cmd + Shift + Z** - Redo

**In Finder:**
Search bar - Type to recursively search files
  `},
  { id: 'server', title: 'Server & Setup', content: `
**Starting webOS:**
\`\`\`
cd /path/to/webOS
npm start
\`\`\`
This starts both the Node.js server (port 3001) and React dev server (port 3000).

**Server Features:**
- File system API (read, write, delete, rename, copy, search)
- System control (WiFi toggle, volume, DND)
- AI proxy endpoint
- WebSocket file watching
- Screenshot capture

**AI Setup:**
The AI Assistant uses Pollinations.ai by default (free, no key needed). For OpenAI, set \`OPENAI_API_KEY\` in your environment.

**File Sync:**
All file operations in webOS directly modify your Mac filesystem through the server.
  `},
];

const HelpApp: React.FC<{ window: WindowState }> = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const section = sections.find(s => s.id === activeSection);

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--window-content)', color: 'var(--text-primary)' }}>
      <div style={st.sidebar}>
        <div style={{ padding: '12px 14px', fontWeight: 700, fontSize: 15 }}>webOS Help</div>
        {sections.map(s => (
          <button key={s.id} style={{
            ...st.sidebarItem,
            background: activeSection === s.id ? 'var(--accent)' : 'transparent',
            color: activeSection === s.id ? '#fff' : 'var(--text-primary)',
          }} onClick={() => setActiveSection(s.id)}>
            {s.title}
          </button>
        ))}
      </div>
      <div style={st.content}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>{section?.title}</h1>
        <div style={{ fontSize: 14, lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: formatHelp(section?.content || '') }} />
      </div>
    </div>
  );
};

function formatHelp(text: string): string {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--input-bg);padding:12px;border-radius:8px;border:1px solid var(--border);overflow-x:auto;margin:8px 0;font-size:13px;font-family:monospace"><code>$2</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--input-bg);padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br/>');
}

const st: Record<string, React.CSSProperties> = {
  sidebar: { width: 200, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)', overflowY: 'auto', flexShrink: 0 },
  sidebarItem: { display: 'block', width: '100%', padding: '7px 14px', fontSize: 13, textAlign: 'left', cursor: 'pointer', borderRadius: 6, margin: '1px 6px', border: 'none' },
  content: { flex: 1, padding: 32, overflowY: 'auto' },
};

export default HelpApp;
