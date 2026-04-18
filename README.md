# webOS

A complete operating system that runs in your browser. Real file management, AI assistant, 30+ apps, and full device support for Mac, iPad, and iPhone.

![webOS](https://img.shields.io/badge/platform-Mac%20%7C%20iPad%20%7C%20iPhone-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933)

## What is webOS?

webOS is a full desktop experience built for the browser. It has a menu bar, dock, overlapping windows, a real file system sandbox, an AI assistant, and 30+ functional apps — not just UI shells, but apps that actually work with real files, real APIs, and real data.

On Mac, it looks and feels like macOS. On iPad and iPhone, it automatically switches to a touch-optimized iOS-style interface with a home screen, fullscreen apps, and swipe gestures.

## Features

- **Real file management** — files live on your Mac's filesystem in a sandboxed folder you choose. Symlink-based imports, trash, rename, multi-select, live refresh across apps.
- **AI Assistant** — powered by Pollinations AI. Chat, code, brainstorm, analyze.
- **30+ built-in apps** — Finder, TextEdit, Code Editor (Monaco), Terminal, Calculator, Calendar, Notes, Reminders, Clock, Weather, Photos, Camera, Music, Video Player, Browser, Maps, Dictionary, Spreadsheet, Document viewer, 3D Model Viewer, Activity Monitor, Settings, and more.
- **App Store** — 15+ installable apps including Drawing Pad, Whiteboard, Translator, Voice Recorder, Chess, 2048, Snake, Tic Tac Toe, Memory, Quiz, Typing Test, and more.
- **Session files** — save your entire state (windows, theme, reminders, layout) to a `.webos` file. Load it on any device to pick up exactly where you left off.
- **Notification system** — toast notifications with sound, works even when apps are closed.
- **Customizable** — 9 wallpapers, 10 accent colors, dark/light themes, configurable dock.
- **iPad & iPhone support** — auto-detects device type. Touch-optimized UI, swipe-down Control Center, floating back button, no-duplicate photo import, iOS-native action sheets.
- **Security sandbox** — all file operations are jailed inside your chosen webOS folder. Path traversal is blocked server-side.

## Architecture

```
webOS/
├── client/                 # React + TypeScript frontend (port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── apps/       # 30+ app components (shared between Mac and mobile)
│   │   │   ├── desktop/    # Mac UI: Desktop, Dock, MenuBar, WindowManager
│   │   │   ├── mobile/     # iPad/iPhone UI: HomeScreen, AppView, MobileShell
│   │   │   ├── system/     # SetupWizard, ControlCenter, NotificationCenter
│   │   │   └── landing/    # Marketing page + auth flow
│   │   ├── store/          # Zustand state management + IndexedDB persistence
│   │   ├── hooks/          # useDeviceType (Mac vs iPad vs iPhone detection)
│   │   └── utils/          # API client, app registry, icons, host rewriting
│   └── public/
│       └── repos/Tools-Hub/tools/  # 60+ HTML tool apps (iframe-based)
│
└── server/                 # Node.js + Express backend (port 3001)
    └── index.js            # File system API, AppleScript integration, web proxy,
                            # session files, AI proxy, system controls
```

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **macOS** (the server uses AppleScript for native folder pickers, Wi-Fi control, etc.)

### Setup

```bash
# Clone the repo(if you aldready didnt download)
git clone https://github.com/krishnasaigaruda/webOS.git
cd Path to webOS

# Install client dependencies (if you dont have)
cd client #(once you are in webos folder)
npm install

# Start the server (in a separate terminal)
cd /server #(once you are in webos folder)
node index.js
# → "webOS Server running on port 3001"

# Start the client
cd ../client
npm start
# → opens http://localhost:3000
```

### First launch

1. The marketing page opens. Click **Get Started**.
2. Choose **Create New Profile** or **Load Existing Profile** (`.webos` file).
3. Pick a nickname and choose where to save your session file.
4. The Setup Wizard asks you to pick a folder on your Mac — this becomes your webOS sandbox. All files you create or import live here.
5. You're in. The Dock at the bottom has your apps, the Menu Bar at the top has system actions.

## Running on iPad / iPhone

webOS auto-detects iPads and iPhones and switches to a touch-optimized interface.

### Setup

1. Both your Mac and iPad/iPhone must be on the **same Wi-Fi network**.
2. Start both servers on your Mac (see Quick Start above).
3. Find your Mac's local IP:
   ```bash
   ipconfig getifaddr en0
   ```
4. On your iPad/iPhone, open Chrome or Safari and go to:
   ```
   http://<your-mac-ip>:3000
   ```
5. The mobile UI loads automatically. No install, no cable, no code on the iPad.

### How it works

Your Mac runs the server. The iPad is just a browser viewing a web page hosted by your Mac. All files live on the Mac. The iPad sends requests over Wi-Fi, and the Mac processes them.

### Mobile UI differences

| Feature | Mac | iPad/iPhone |
|---------|-----|-------------|
| Layout | Dock + overlapping windows | Home screen + fullscreen apps |
| Navigation | Click window title bars | Floating back button |
| Control Center | Click menu bar icon | Swipe down from top or tap battery/Wi-Fi icons |
| File import | Native macOS folder picker (AppleScript) | HTML file input (iOS Files/Photos picker) |
| Apps | All 30+ apps | Filtered list (no Terminal, Code Editor, etc.) |
| Session files | Native Save/Load dialog | Load via file picker, auto-save to server |

### Known limitations on iPad/iPhone

- **Camera requires HTTPS.** iOS blocks `getUserMedia` over plain HTTP from non-localhost origins. To use the Camera app on iPad, set up HTTPS with [mkcert](https://github.com/FiloSottile/mkcert) or use a tunnel.
- **Files save to the Mac, not the iPad.** Web pages cannot write to the iOS filesystem. Imported files are stored on your Mac at `~/webOS-<nickname>/`. Use the webOS Files app to browse them.
- **Favicon caching.** After first visit, clear browser cache to see the webOS tab icon instead of the default.

## Apps

### Built-in (Mac)

| App | Description |
|-----|-------------|
| Finder | File manager with sidebar, breadcrumbs, multi-select, import, trash |
| TextEdit | Text editor with auto-save to sandbox |
| Code Editor | Monaco-powered editor, 20+ languages |
| Terminal | Command line with sandbox access |
| Calculator | Full calculator with history |
| Calendar | Monthly calendar view |
| Notes | Quick notes with persistence |
| Reminders | Scheduled reminders with notification sounds (work when app is closed) |
| To Do | Task manager with active/completed sections |
| Clock | World clock with time display |
| Timer | Timer + Stopwatch with alarm |
| Weather | Current conditions + 7-day forecast with SVG icons, F/C toggle |
| Photos | Library + Camera Roll tabs, image and video viewer |
| Camera | Photo + video capture, mirrored selfie, saves to Camera Roll |
| Music | Audio player with library scan |
| Video Player | Native HTML5 video with custom controls |
| Web Browser | Google search via iframe |
| Maps | OpenStreetMap-based map viewer |
| Dictionary | Word definitions and pronunciation |
| AI Assistant | Chat with Pollinations AI |
| Spreadsheet | XLSX/CSV viewer with sheet tabs |
| Document | DOCX viewer (mammoth.js) + PDF viewer |
| 3D Model Viewer | GLB/GLTF viewer (Google model-viewer) |
| Activity Monitor | Real CPU/memory/disk stats + webOS apps tab |
| Settings | Theme, wallpaper, accent color, network, notifications, about |
| Help | Documentation and FAQ |
| App Store | Discover and install additional apps |

### Installable (App Store)

Chess, 2048, Snake, Tic Tac Toe, Memory, Drawing Pad, Whiteboard, Translate, Voice Recorder, Quiz, Typing Test, Coin Flip, Dice Roller, Graph Plotter, Periodic Table, Metronome, Guitar Tuner, Password Generator, QR Generator

### Mobile-only overrides

On iPad/iPhone, these apps use touch-optimized native implementations instead of the desktop versions: Files, Settings, Notes, To Do, Calculator, Photos, Video Player, Music, Reminders, Clock, Weather, TextEdit, Timer, Help, App Store.

## Session Files (.webos)

webOS can save your entire state — open windows, theme, wallpaper, reminders, user profile — to a `.webos` file (plain JSON). This file auto-syncs as you use webOS.

- **Mac:** On sign-in, you choose where to save the `.webos` file via a native Save dialog.
- **iPad:** Load a `.webos` file from the iOS Files app, or start fresh. Auto-saves to the server.
- **Cross-device:** Save a `.webos` file on Mac, transfer it to iPad via iCloud/AirDrop, load it — everything restores.

## File System

All files are sandboxed inside a folder you choose during setup. The server enforces path jailing via `safePath()` — no request can read or write outside the sandbox.

- **Imports are symlinks.** When you import a file from your Mac, webOS creates a symlink, not a copy. The original stays where it is.
- **Trash is internal.** Deleted files go to `.webos-trash/` inside the sandbox. Emptying trash removes them permanently.
- **Live refresh.** Every mutating API call dispatches a `webos-fs-changed` event. Open Finder windows and Photos update in real time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Zustand |
| Code Editor | Monaco Editor |
| Persistence | IndexedDB (UI state), filesystem (files), localStorage (reminders) |
| Backend | Node.js, Express, multer |
| Native integration | AppleScript via `osascript` (folder pickers, Wi-Fi, volume, trash) |
| AI | Pollinations.ai API |
| Document parsing | mammoth.js (DOCX), XLSX library (spreadsheets) |
| Icons | Custom SVG icons (no emojis) |
| Mobile detection | UA + `navigator.maxTouchPoints` + query-string override |
| Cross-device networking | Fetch URL rewriting via prototype patching (`hostRewrite.ts`) |

## Development

### Testing mobile UI on Mac

Append a query parameter to force the mobile layout:

```
http://localhost:3000?forceMobile=ipad
http://localhost:3000?forceMobile=iphone
```

### Project structure conventions

- **Desktop components** live in `src/components/desktop/` and `src/components/apps/`.
- **Mobile components** live in `src/components/mobile/` and `src/components/mobile/apps/`.
- **Mobile app overrides** are registered in `MobileAppRenderer.tsx`. Any app not in the override map falls back to the shared desktop component.
- **Tools Hub apps** are standalone HTML files in `public/repos/Tools-Hub/tools/`. They run inside iframes via `ToolsIframeApp`.
- **All SVG icons** are in `src/utils/icons.tsx`. No emojis anywhere in the UI.

### Adding a new app

1. Create the component in `src/components/apps/YourApp.tsx`.
2. Register it in `src/utils/appRegistry.ts`.
3. Add it to the component map in `src/components/apps/AppRenderer.tsx`.
4. Add an SVG icon in `src/utils/icons.tsx`.
5. (Optional) Create a mobile override in `src/components/mobile/apps/MobileYourApp.tsx` and register it in `MobileAppRenderer.tsx`.
6. (Optional) Add it to the App Store list in `AppStoreApp.tsx`.

## License

MIT
