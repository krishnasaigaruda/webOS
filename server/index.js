const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const chokidar = require('chokidar');
const http = require('http');
const { Server } = require('socket.io');
const mime = require('mime-types');

const app = express();
const server = http.createServer(app);
// CORS — only allow requests from the webOS client (localhost:3000 or LAN IP:3000)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, curl, mobile apps)
    if (!origin) return callback(null, true);
    // Allow localhost and any LAN IP on port 3000
    if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS blocked'));
  },
};
const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const HOME = process.env.HOME || '/Users/krishna';
// Config file stores the user-chosen "My Files" folder path
const CONFIG_PATH = path.join(HOME, '.webos-config.json');

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveConfig(cfg) {
  try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); return true; } catch { return false; }
}

// Get the current webOS root (user-chosen folder, or unset)
function getWebosRoot() {
  const cfg = getConfig();
  return cfg.webosRoot || null;
}

// Hidden trash folder inside the sandbox
function getWebosTrash() {
  const root = getWebosRoot();
  return root ? path.join(root, '.webos-trash') : null;
}

// Check if a path is inside the sandbox (prevents path traversal)
function isInSandbox(p) {
  const root = getWebosRoot();
  if (!root) return false;
  const resolved = path.resolve(p);
  const rootResolved = path.resolve(root);
  return resolved === rootResolved || resolved.startsWith(rootResolved + path.sep);
}

// Resolve a path and verify it's inside the sandbox. Returns null if not.
function safePath(p) {
  if (!p) return null;
  try {
    const resolved = path.resolve(p);
    if (isInSandbox(resolved)) return resolved;
    return null;
  } catch { return null; }
}

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = safePath(req.body.path) || getWebosRoot();
    if (dest) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal (e.g. ../../etc/crontab)
    const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._\-() ]/g, '_');
    cb(null, safe || `upload-${Date.now()}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// ============= FILE SYSTEM API =============

// Get webOS root (returns null if not yet configured)
app.get('/api/fs/root', (req, res) => {
  res.json({ root: getWebosRoot() });
});

// Set the webOS root (called during setup)
app.post('/api/fs/set-root', (req, res) => {
  const { path: rootPath } = req.body;
  if (!rootPath) return res.status(400).json({ error: 'Path required' });
  try {
    // Create the folder if it doesn't exist
    fs.mkdirSync(rootPath, { recursive: true });
    // Create the hidden trash folder
    const trashPath = path.join(rootPath, '.webos-trash');
    fs.mkdirSync(trashPath, { recursive: true });
    // Save config
    saveConfig({ webosRoot: rootPath });
    res.json({ success: true, root: rootPath });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Create a default webOS root — used by mobile setup flow (no AppleScript picker).
// Creates ~/webOS-<nickname>/ and sets it as the sandbox root.
app.post('/api/fs/create-default-root', (req, res) => {
  const { nickname } = req.body || {};
  if (!nickname || typeof nickname !== 'string') return res.status(400).json({ error: 'nickname required' });
  try {
    const home = require('os').homedir();
    const safeNick = nickname.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 30) || 'user';
    const rootPath = path.join(home, `webOS-${safeNick}`);
    fs.mkdirSync(rootPath, { recursive: true });
    const trashPath = path.join(rootPath, '.webos-trash');
    fs.mkdirSync(trashPath, { recursive: true });
    const photosPath = path.join(rootPath, 'Photos');
    fs.mkdirSync(photosPath, { recursive: true });
    saveConfig({ webosRoot: rootPath });
    res.json({ success: true, root: rootPath });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// List webOS trash
app.get('/api/fs/trash-list', (req, res) => {
  const trashPath = getWebosTrash();
  if (!trashPath || !fs.existsSync(trashPath)) return res.json([]);
  try {
    const items = fs.readdirSync(trashPath, { withFileTypes: true });
    const result = items.map(item => {
      const fullPath = path.join(trashPath, item.name);
      let stats;
      try { stats = fs.lstatSync(fullPath); } catch { stats = null; }
      const isDir = item.isDirectory() || (item.isSymbolicLink() && stats?.isDirectory());
      return {
        name: item.name,
        path: fullPath,
        isDirectory: isDir,
        size: stats?.size || 0,
        modified: stats?.mtime || new Date(),
        created: stats?.birthtime || new Date(),
        mimeType: isDir ? 'directory' : mime.lookup(item.name) || 'application/octet-stream',
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Empty webOS trash (only removes symlinks and items in the trash folder)
app.post('/api/fs/trash-empty', (req, res) => {
  const trashPath = getWebosTrash();
  if (!trashPath) return res.json({ success: false });
  try {
    const items = fs.readdirSync(trashPath);
    for (const item of items) {
      const itemPath = path.join(trashPath, item);
      const stat = fs.lstatSync(itemPath);
      if (stat.isSymbolicLink() || stat.isFile()) {
        fs.unlinkSync(itemPath);
      } else if (stat.isDirectory()) {
        fs.rmSync(itemPath, { recursive: true });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Native macOS folder picker using AppleScript
app.post('/api/fs/pick-folder', (req, res) => {
  // Sanitize prompt text to prevent AppleScript injection
  const rawPrompt = (req.body || {}).prompt || 'Choose a folder';
  const promptText = rawPrompt.replace(/["\\'`;$(){}|&<>]/g, '').slice(0, 200);
  const script = `POSIX path of (choose folder with prompt "${promptText}")`;
  exec(`osascript -e '${script}'`, (err, stdout) => {
    if (err) return res.json({ cancelled: true });
    const selectedPath = stdout.trim();
    if (!selectedPath) return res.json({ cancelled: true });
    // Strip trailing slash
    const cleanPath = selectedPath.endsWith('/') ? selectedPath.slice(0, -1) : selectedPath;
    res.json({ path: cleanPath, name: path.basename(cleanPath) });
  });
});

// Native macOS file picker (supports files AND folders with multiple selection)
app.post('/api/fs/pick-files', (req, res) => {
  const { prompt: promptText = 'Choose files or folders' } = req.body || {};
  // `choose file` with `invisibles` option lets the user navigate folders and pick files.
  // For folder selection, we use `choose file name` won't work; instead we use this combined approach:
  // Use `choose file` with "Use `Package` contents" = no, allowing folder navigation/selection.
  const script = [
    `try`,
    `  set fileList to choose file with prompt "${promptText}" with multiple selections allowed without invisibles`,
    `  set output to ""`,
    `  repeat with f in fileList`,
    `    set output to output & POSIX path of f & linefeed`,
    `  end repeat`,
    `  return output`,
    `on error errMsg number errNum`,
    `  if errNum is -128 then`,
    `    return "__CANCELLED__"`,
    `  end if`,
    `  return ""`,
    `end try`,
  ];
  const args = script.map(line => `-e '${line.replace(/'/g, "'\\''")}'`).join(' ');
  exec(`osascript ${args}`, (err, stdout) => {
    if (err || stdout.trim() === '__CANCELLED__') return res.json({ cancelled: true });
    const paths = stdout.trim().split('\n').filter(p => p.trim());
    res.json({ paths });
  });
});

// Native macOS picker for files OR folders - presents choice then picks accordingly
app.post('/api/fs/pick-any', (req, res) => {
  const { type = 'files' } = req.body || {};
  let script;
  if (type === 'folders') {
    script = [
      `try`,
      `  set folderList to choose folder with prompt "Choose folders" with multiple selections allowed`,
      `  set output to ""`,
      `  repeat with f in folderList`,
      `    set output to output & POSIX path of f & linefeed`,
      `  end repeat`,
      `  return output`,
      `on error errMsg number errNum`,
      `  return "__CANCELLED__"`,
      `end try`,
    ];
  } else {
    script = [
      `try`,
      `  set fileList to choose file with prompt "Choose files" with multiple selections allowed without invisibles`,
      `  set output to ""`,
      `  repeat with f in fileList`,
      `    set output to output & POSIX path of f & linefeed`,
      `  end repeat`,
      `  return output`,
      `on error errMsg number errNum`,
      `  return "__CANCELLED__"`,
      `end try`,
    ];
  }
  const args = script.map(line => `-e '${line.replace(/'/g, "'\\''")}'`).join(' ');
  exec(`osascript ${args}`, (err, stdout) => {
    if (err || stdout.trim() === '__CANCELLED__') return res.json({ cancelled: true });
    const paths = stdout.trim().split('\n').filter(p => p.trim());
    res.json({ paths });
  });
});

// Browse Mac filesystem for import (user explicitly picks folders)
// This is the ONLY endpoint that can see outside the sandbox
app.get('/api/fs/browse', (req, res) => {
  const dirPath = req.query.path || HOME;
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = items
      .filter(item => !item.name.startsWith('.'))
      .map(item => {
        const fullPath = path.join(dirPath, item.name);
        let stats;
        try { stats = fs.lstatSync(fullPath); } catch { stats = null; }
        const isApp = item.name.endsWith('.app');
        const isDir = item.isDirectory() || (item.isSymbolicLink() && stats?.isDirectory());
        return {
          name: item.name, path: fullPath,
          isDirectory: isApp ? false : isDir,
          size: stats?.size || 0,
          modified: stats?.mtime || new Date(),
          mimeType: isDir ? 'directory' : mime.lookup(item.name) || 'application/octet-stream'
        };
      });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Import a file or folder from the Mac into the webOS sandbox (creates symlink)
app.post('/api/fs/import', (req, res) => {
  let { source, name } = req.body;
  if (!source || !name) return res.status(400).json({ error: 'source and name required' });
  // Strip trailing slashes (AppleScript folder picker adds them)
  source = source.replace(/\/+$/, '');
  const root = getWebosRoot();
  if (!root) return res.status(400).json({ error: 'webOS not configured' });
  try {
    // Verify source exists
    if (!fs.existsSync(source)) {
      return res.status(404).json({ error: `Source not found: ${source}` });
    }
    // Ensure the parent directory exists in the sandbox
    const dest = path.join(root, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    // Remove existing symlink/file at destination if present
    try { fs.lstatSync(dest); fs.rmSync(dest, { recursive: true, force: true }); } catch {}
    // Create a symlink so the user can work with the real file
    fs.symlinkSync(source, dest);
    res.json({ success: true, path: dest });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Remove an imported item (just removes the symlink, NOT the original file)
app.post('/api/fs/unimport', (req, res) => {
  const { name } = req.body;
  const root = getWebosRoot();
  if (!root) return res.status(400).json({ error: 'webOS not configured' });
  const p = safePath(path.join(root, name));
  if (!p) return res.status(403).json({ error: 'Outside sandbox' });
  try {
    const stat = fs.lstatSync(p);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(p);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Not an imported item' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// List directory (JAILED to webOS sandbox)
app.get('/api/fs/list', (req, res) => {
  const root = getWebosRoot();
  if (!root) return res.json([]);
  const requestedPath = req.query.path || root;
  const dirPath = safePath(requestedPath);
  if (!dirPath) {
    return res.status(403).json({ error: 'Access denied: path outside webOS sandbox' });
  }
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = items
      // Hide dot files AND the webOS trash folder
      .filter(item => !item.name.startsWith('.') && item.name !== '.webos-trash')
      .map(item => {
        const fullPath = path.join(dirPath, item.name);
        // For symlinks, follow to the target to check if it's a directory
        let targetStats;
        try { targetStats = fs.statSync(fullPath); } catch { targetStats = null; }
        let lstats;
        try { lstats = fs.lstatSync(fullPath); } catch { lstats = null; }
        const isApp = item.name.endsWith('.app');
        const isDir = targetStats?.isDirectory() || false;
        return {
          name: item.name,
          path: fullPath,
          isDirectory: isApp ? false : isDir,
          size: targetStats?.size || lstats?.size || 0,
          modified: targetStats?.mtime || lstats?.mtime || new Date(),
          created: targetStats?.birthtime || lstats?.birthtime || new Date(),
          mimeType: isDir ? 'directory' : mime.lookup(item.name) || 'application/octet-stream'
        };
      });
    res.json(result);
  } catch (err) {
    // Fallback for protected directories like ~/.Trash - use ls command
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      exec(`ls -1 "${dirPath}" 2>/dev/null`, (execErr, stdout) => {
        if (execErr || !stdout.trim()) return res.json([]);
        const names = stdout.trim().split('\n').filter(n => n && !n.startsWith('.'));
        const result = names.map(name => {
          const fullPath = path.join(dirPath, name);
          const isApp = name.endsWith('.app');
          let isDir = false;
          let size = 0;
          try {
            const s = fs.lstatSync(fullPath);
            isDir = s.isDirectory();
            size = s.size;
          } catch {}
          return { name, path: fullPath, isDirectory: isApp ? false : isDir, size, modified: new Date(), created: new Date(), mimeType: isDir ? 'directory' : mime.lookup(name) || 'application/octet-stream' };
        });
        res.json(result);
      });
      return;
    }
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Read file
app.get('/api/fs/read', (req, res) => {
  const filePath = safePath(req.query.path);
  if (!filePath) return res.status(403).json({ error: 'Access denied' });
  try {
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const forceText = req.query.text === 'true';
    const isTextLike = mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/javascript' || mimeType === 'application/xml' || mimeType === 'application/x-yaml';

    // Check file size first - truncate large files
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB safe limit for display
    const truncated = fileSize > MAX_SIZE;

    const readTruncated = (encoding) => {
      if (!truncated) return fs.readFileSync(filePath, encoding);
      // Read only first MAX_SIZE bytes
      const fd = fs.openSync(filePath, 'r');
      const buf = Buffer.alloc(MAX_SIZE);
      fs.readSync(fd, buf, 0, MAX_SIZE, 0);
      fs.closeSync(fd);
      return buf.toString(encoding);
    };

    if (isTextLike || forceText) {
      try {
        const content = readTruncated('utf-8');
        return res.json({ content, mimeType, size: fileSize, truncated });
      } catch {
        try {
          const content = readTruncated('latin1');
          return res.json({ content, mimeType, size: fileSize, truncated });
        } catch {
          return res.json({ content: '[Binary file - cannot display as text]', mimeType, size: fileSize });
        }
      }
    }

    try {
      if (truncated) {
        const content = readTruncated('utf-8');
        return res.json({ content, mimeType, size: fileSize, truncated: true });
      }
      const buf = fs.readFileSync(filePath);
      const hasNull = Array.from(buf.subarray(0, 1000)).includes(0);
      if (!hasNull) {
        return res.json({ content: buf.toString('utf-8'), mimeType, size: fileSize });
      }
      return res.sendFile(filePath);
    } catch {
      return res.sendFile(filePath);
    }
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Write file (supports utf-8 text or base64-encoded binary via { encoding: 'base64' })
app.post('/api/fs/write', (req, res) => {
  const filePath = safePath(req.body.path);
  if (!filePath) return res.status(403).json({ error: 'Access denied' });
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const content = req.body.content || '';
    if (req.body.encoding === 'base64') {
      // Strip data URL prefix if present (e.g. "data:image/png;base64,...")
      const cleaned = content.replace(/^data:[^;]+;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(cleaned, 'base64'));
    } else {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
    res.json({ success: true, path: filePath });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Create directory
app.post('/api/fs/mkdir', (req, res) => {
  const dirPath = safePath(req.body.path);
  if (!dirPath) return res.status(403).json({ error: 'Access denied' });
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Delete file/directory
app.delete('/api/fs/delete', (req, res) => {
  const filePath = safePath(req.query.path);
  if (!filePath) return res.status(403).json({ error: 'Access denied' });
  try {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(filePath); // Removes the symlink, not the target
    } else if (stats.isDirectory()) {
      fs.rmSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Rename/move
app.post('/api/fs/rename', (req, res) => {
  const oldPath = safePath(req.body.oldPath);
  const newPath = safePath(req.body.newPath);
  if (!oldPath || !newPath) return res.status(403).json({ error: 'Access denied' });
  try {
    fs.renameSync(oldPath, newPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Copy
app.post('/api/fs/copy', (req, res) => {
  const source = safePath(req.body.source);
  const destination = safePath(req.body.destination);
  if (!source || !destination) return res.status(403).json({ error: 'Access denied' });
  try {
    fs.cpSync(source, destination, { recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Upload file
app.post('/api/fs/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, path: req.file.path });
});

// Serve files for preview
app.get('/api/fs/serve', (req, res) => {
  const filePath = safePath(req.query.path);
  if (!filePath) return res.status(403).json({ error: 'Access denied' });
  try {
    // Resolve symlinks to real path so sendFile works correctly
    const realPath = fs.realpathSync(filePath);
    res.sendFile(realPath);
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Get file info
app.get('/api/fs/info', (req, res) => {
  const filePath = safePath(req.query.path);
  if (!filePath) return res.status(403).json({ error: 'Access denied' });
  try {
    const stats = fs.statSync(filePath);
    res.json({
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      isDirectory: stats.isDirectory(),
      modified: stats.mtime,
      created: stats.birthtime,
      mimeType: stats.isDirectory() ? 'directory' : mime.lookup(filePath) || 'application/octet-stream'
    });
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Search files (jailed to sandbox)
app.get('/api/fs/search', (req, res) => {
  const { query, path: searchPath } = req.query;
  if (!query || typeof query !== 'string') return res.json([]);
  const dir = safePath(searchPath) || getWebosRoot();
  if (!dir) return res.json([]);
  const results = [];
  const visited = new Set(); // prevent symlink loops
  const startTime = Date.now();

  function searchDir(dirPath, depth = 0) {
    // Depth limit, result limit, and 3-second timeout
    if (depth > 8 || results.length >= 100 || Date.now() - startTime > 3000) return;
    try {
      // Resolve real path to detect symlink loops
      const realPath = fs.realpathSync(dirPath);
      if (visited.has(realPath)) return;
      visited.add(realPath);
      // Skip symlinks pointing outside the sandbox
      const root = getWebosRoot();
      if (root && !realPath.startsWith(root)) return;

      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        if (results.length >= 100) return;
        const fullPath = path.join(dirPath, item.name);
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            name: item.name,
            path: fullPath,
            isDirectory: item.isDirectory()
          });
        }
        if (item.isDirectory() && !item.isSymbolicLink()) {
          searchDir(fullPath, depth + 1);
        }
      }
    } catch {}
  }

  searchDir(dir);
  res.json(results);
});

// ============= SYSTEM API =============

// Get system info
app.get('/api/system/info', (req, res) => {
  const os = require('os');
  // Only expose non-sensitive system info
  res.json({
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
  });
});

// Get real-time system stats
app.get('/api/system/stats', (req, res) => {
  const os = require('os');
  // Get CPU usage
  const cpus = os.cpus();
  const cpuUsage = cpus.map(cpu => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    return Math.round(((total - idle) / total) * 100);
  });
  const avgCpu = Math.round(cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length);

  // Get top processes via ps
  exec('ps aux --sort=-%cpu 2>/dev/null || ps aux -r 2>/dev/null | head -16', (err, stdout) => {
    let processes = [];
    if (stdout) {
      const lines = stdout.trim().split('\n');
      const header = lines[0];
      processes = lines.slice(1, 16).map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          user: parts[0],
          pid: parts[1],
          cpu: parseFloat(parts[2]) || 0,
          mem: parseFloat(parts[3]) || 0,
          command: parts.slice(10).join(' ').split('/').pop() || parts.slice(10).join(' '),
        };
      }).filter(p => p.command);
    }

    // Disk usage
    exec('df -h / | tail -1', (err2, diskOut) => {
      let disk = { total: '0', used: '0', free: '0', percent: '0%' };
      if (diskOut) {
        const parts = diskOut.trim().split(/\s+/);
        disk = { total: parts[1] || '0', used: parts[2] || '0', free: parts[3] || '0', percent: parts[4] || '0%' };
      }

      res.json({
        cpu: { usage: avgCpu, perCore: cpuUsage, count: cpus.length, model: cpus[0]?.model || '' },
        memory: { total: os.totalmem(), free: os.freemem(), used: os.totalmem() - os.freemem() },
        uptime: os.uptime(),
        processes,
        disk,
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
      });
    });
  });
});


// ============= TRASH API (uses AppleScript for macOS permissions) =============

app.get('/api/trash/list', (req, res) => {
  exec(`osascript -e 'set output to ""
tell application "Finder"
  set trashItems to every item of trash
  repeat with i in trashItems
    set itemName to name of i
    set itemKind to kind of i
    set output to output & itemName & "|||" & itemKind & "\\n"
  end repeat
end tell
return output'`, (err, stdout) => {
    if (err) return res.json([]);
    const lines = stdout.trim().split('\n').filter(l => l.trim());
    const items = lines.map(line => {
      const [name, kind] = line.split('|||');
      const isDir = kind && (kind.toLowerCase().includes('folder') || kind.toLowerCase().includes('directory'));
      return {
        name: (name || '').trim(),
        path: path.join(HOME, '.Trash', (name || '').trim()),
        isDirectory: isDir || false,
        size: 0,
        modified: new Date(),
        created: new Date(),
        mimeType: isDir ? 'directory' : mime.lookup((name || '').trim()) || 'application/octet-stream',
      };
    }).filter(i => i.name);
    res.json(items);
  });
});

app.post('/api/trash/empty', (req, res) => {
  exec(`osascript -e 'tell application "Finder" to empty trash'`, (err) => {
    res.json({ success: !err });
  });
});

// ============= SYSTEM CONTROL API =============

// WiFi control (macOS)
app.post('/api/system/wifi', (req, res) => {
  const { enabled } = req.body;
  const cmd = enabled ? 'networksetup -setairportpower en0 on' : 'networksetup -setairportpower en0 off';
  exec(cmd, (err) => {
    if (err) return res.status(500).json({ error: 'Operation failed' });
    res.json({ success: true, enabled });
  });
});

// Bluetooth control (macOS)
app.post('/api/system/bluetooth', (req, res) => {
  const { enabled } = req.body;
  const cmd = enabled
    ? 'defaults write /Library/Preferences/com.apple.Bluetooth ControllerPowerState -int 1 && killall -HUP blued'
    : 'defaults write /Library/Preferences/com.apple.Bluetooth ControllerPowerState -int 0 && killall -HUP blued';
  exec(cmd, (err) => {
    // Bluetooth commands may require sudo, so we try but don't fail hard
    res.json({ success: true, enabled });
  });
});

// Volume control — validate input is a number to prevent command injection
app.post('/api/system/volume', (req, res) => {
  const level = parseInt(req.body.level, 10);
  if (isNaN(level) || level < 0 || level > 100) return res.status(400).json({ error: 'level must be 0-100' });
  exec(`osascript -e "set volume output volume ${level}"`, (err) => {
    if (err) return res.status(500).json({ error: 'Volume change failed' });
    res.json({ success: true, level });
  });
});

// Brightness control
app.post('/api/system/brightness', (req, res) => {
  const { level } = req.body;
  // brightness control requires external tool on macOS
  res.json({ success: true, level });
});

// Do Not Disturb
app.post('/api/system/dnd', (req, res) => {
  const { enabled } = req.body;
  const cmd = enabled
    ? 'defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean true && killall NotificationCenter 2>/dev/null; true'
    : 'defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean false && killall NotificationCenter 2>/dev/null; true';
  exec(cmd, () => {
    res.json({ success: true, enabled });
  });
});

// ============= SESSION FILES (.webos profile files) =============

// Native macOS Save dialog for picking a .webos file location
app.post('/api/session/pick-save', (req, res) => {
  // Sanitize defaultName to prevent AppleScript injection
  const rawName = (req.body || {}).defaultName || 'session1.webos';
  const defaultName = rawName.replace(/["\\'`;$(){}|&<>]/g, '').slice(0, 100);
  const script = `POSIX path of (choose file name with prompt "Save webOS session as" default name "${defaultName}")`;
  exec(`osascript -e '${script}'`, (err, stdout) => {
    if (err) return res.json({ cancelled: true });
    let p = stdout.trim();
    if (!p) return res.json({ cancelled: true });
    // Ensure .webos extension
    if (!p.toLowerCase().endsWith('.webos')) p = p + '.webos';
    res.json({ path: p });
  });
});

// Native macOS Open dialog for picking an existing .webos file
// Restricts the file picker to only show .webos files as selectable.
app.post('/api/session/pick-load', (req, res) => {
  const script = `POSIX path of (choose file with prompt "Open webOS session file" of type {"webos"})`;
  exec(`osascript -e '${script}'`, (err, stdout) => {
    if (err) return res.json({ cancelled: true });
    const p = stdout.trim();
    if (!p) return res.json({ cancelled: true });
    res.json({ path: p });
  });
});

// Write session data — restricted to .webos files in safe locations
app.post('/api/session/save', (req, res) => {
  const { path: filePath, data } = req.body || {};
  if (!filePath || typeof filePath !== 'string') return res.status(400).json({ error: 'path required' });
  // Session files must end in .webos and cannot write to system directories
  if (!filePath.endsWith('.webos')) return res.status(403).json({ error: 'Session files must end in .webos' });
  const resolved = path.resolve(filePath);
  const BLOCKED_DIRS = ['/etc', '/System', '/Library', '/usr', '/bin', '/sbin', '/var', '/tmp'];
  if (BLOCKED_DIRS.some(d => resolved.startsWith(d))) return res.status(403).json({ error: 'Cannot save to system directories' });
  try {
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Save failed' });
  }
});

// Read a session file — restricted to .webos files only
app.get('/api/session/load', (req, res) => {
  const filePath = req.query.path;
  if (!filePath || typeof filePath !== 'string') return res.status(400).json({ error: 'path required' });
  if (!filePath.endsWith('.webos')) return res.status(403).json({ error: 'Can only load .webos session files' });
  const resolved = path.resolve(filePath);
  const BLOCKED_DIRS = ['/etc', '/System', '/Library', '/usr', '/bin', '/sbin', '/var'];
  if (BLOCKED_DIRS.some(d => resolved.startsWith(d))) return res.status(403).json({ error: 'Access denied' });
  try {
    const content = fs.readFileSync(resolved, 'utf-8');
    res.json({ success: true, data: JSON.parse(content) });
  } catch (err) {
    res.status(500).json({ error: 'Could not read session file' });
  }
});

// ============= WEB PROXY (bypass X-Frame-Options for browser) =============

app.get('/api/proxy', async (req, res) => {
  let url = req.query.url;
  if (!url) return res.status(400).send('URL required');

  // SSRF protection — block internal/private IPs and non-HTTP protocols
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return res.status(403).send('Only HTTP(S) URLs allowed');
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' ||
        host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.') ||
        host === '169.254.169.254' || host.endsWith('.local') || host === '[::1]') {
      return res.status(403).send('Internal addresses are blocked');
    }
  } catch { return res.status(400).send('Invalid URL'); }

  // Unwrap DuckDuckGo redirect links
  if (url.includes('duckduckgo.com/l/') || url.includes('/l/?uddg=')) {
    try {
      const u = new URL(url);
      const uddg = u.searchParams.get('uddg');
      if (uddg) url = decodeURIComponent(uddg);
    } catch {}
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
      },
      redirect: 'follow',
    });
    const contentType = response.headers.get('content-type') || 'text/html';

    // CSS: rewrite url(...) references through the proxy
    if (contentType.includes('text/css')) {
      let css = await response.text();
      const finalCssUrl = response.url || url;
      const cssProxy = (rawUrl) => {
        try {
          const abs = new URL(rawUrl, finalCssUrl).href;
          if (!/^https?:/i.test(abs)) return rawUrl;
          return `http://localhost:${PORT}/api/proxy?url=${encodeURIComponent(abs)}`;
        } catch { return rawUrl; }
      };
      css = css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, q, val) => {
        if (/^(data:|#)/i.test(val)) return m;
        return `url(${q}${cssProxy(val)}${q})`;
      });
      css = css.replace(/@import\s+(['"])([^'"]+)\1/gi, (m, q, val) => {
        return `@import ${q}${cssProxy(val)}${q}`;
      });
      res.setHeader('Content-Type', 'text/css');
      res.send(css);
      return;
    }

    // If it's not HTML (image, JS, font, etc.) just pipe it through
    if (!contentType.includes('text/html')) {
      const buf = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.send(Buffer.from(buf));
      return;
    }

    let body = await response.text();
    const finalUrl = response.url || url;
    const baseUrl = new URL(finalUrl);
    const base = `${baseUrl.protocol}//${baseUrl.host}`;
    const PROXY_ORIGIN = `http://localhost:${PORT}`;
    const PROXY_PREFIX = `${PROXY_ORIGIN}/api/proxy?url=`;

    // Remove any existing <base> tags — they break our fully-qualified rewrites
    body = body.replace(/<base[^>]*>/gi, '');

    // Helper: convert any URL (absolute, protocol-relative, root-relative, relative)
    // into a fully-qualified proxy URL.
    const toProxy = (rawUrl) => {
      try {
        const abs = new URL(rawUrl, finalUrl).href;
        if (!/^https?:/i.test(abs)) return rawUrl; // data:, mailto:, javascript:
        return PROXY_PREFIX + encodeURIComponent(abs);
      } catch { return rawUrl; }
    };

    // Rewrite href/src/action attributes in HTML
    body = body.replace(/(href|src|action)=(["'])([^"'#][^"']*)\2/gi, (m, attr, q, val) => {
      if (/^(javascript:|mailto:|data:|blob:|#)/i.test(val)) return m;
      return `${attr}=${q}${toProxy(val)}${q}`;
    });
    // Rewrite srcset (images with multiple resolutions)
    body = body.replace(/srcset=(["'])([^"']+)\1/gi, (m, q, val) => {
      const rewritten = val.split(',').map(part => {
        const trimmed = part.trim();
        const spaceIdx = trimmed.search(/\s/);
        const u = spaceIdx >= 0 ? trimmed.slice(0, spaceIdx) : trimmed;
        const rest = spaceIdx >= 0 ? trimmed.slice(spaceIdx) : '';
        return toProxy(u) + rest;
      }).join(', ');
      return `srcset=${q}${rewritten}${q}`;
    });
    // Rewrite CSS url(...) references in inline <style> blocks and style="" attributes
    body = body.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, q, val) => {
      if (/^(data:|blob:|#)/i.test(val)) return m;
      return `url(${q}${toProxy(val)}${q})`;
    });

    // Strip CSP and X-Frame-Options meta tags
    body = body.replace(/<meta[^>]*http-equiv=["']?(Content-Security-Policy|X-Frame-Options)["']?[^>]*>/gi, '');
    // Neutralize frame-busting scripts (top != self redirects)
    body = body.replace(/if\s*\(\s*(window\.)?top\s*(!==|!=)\s*(window\.)?self\s*\)/gi, 'if (false)');
    body = body.replace(/(window\.)?top\.location/gi, 'window.location');

    // Inject runtime click/navigation interceptor so JS-driven nav also stays in the proxy.
    // Escape </script> in interpolated values to prevent XSS via crafted URLs.
    const safeBase = JSON.stringify(base).replace(/<\//g, '<\\/');
    const safeFinalUrl = JSON.stringify(finalUrl).replace(/<\//g, '<\\/');
    const interceptor = `
<script>
(function(){
  var PROXY = 'http://localhost:${PORT}/api/proxy?url=';
  var BASE = ${safeBase};
  var CURRENT = ${safeFinalUrl};
  // Tell parent window which page we're currently on (so it can update URL bar)
  try { window.parent.postMessage({ type: 'webos-browser-nav', url: CURRENT }, '*'); } catch(e){}
  function absolutize(url){
    try { return new URL(url, BASE).href; } catch(e) { return url; }
  }
  function wrap(url){
    if (!url) return url;
    if (url.indexOf(PROXY) === 0 || url.indexOf('/api/proxy') === 0) return url;
    if (url.indexOf('javascript:') === 0 || url.indexOf('mailto:') === 0 || url.indexOf('#') === 0 || url.indexOf('data:') === 0) return url;
    var abs = absolutize(url);
    if (!/^https?:/i.test(abs)) return url;
    return PROXY + encodeURIComponent(abs);
  }
  // Intercept all clicks on anchors (including dynamically inserted ones)
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a || !a.href) return;
    var href = a.getAttribute('href');
    if (!href) return;
    var wrapped = wrap(href);
    if (wrapped !== href) {
      e.preventDefault();
      window.location.href = wrapped;
    }
  }, true);
  // Intercept form submissions
  document.addEventListener('submit', function(e){
    var f = e.target;
    if (!f || !f.action) return;
    var method = (f.method || 'get').toLowerCase();
    if (method !== 'get') return; // POST: let through, server side will handle (rare)
    e.preventDefault();
    var params = new URLSearchParams(new FormData(f)).toString();
    var act = absolutize(f.action);
    var sep = act.indexOf('?') >= 0 ? '&' : '?';
    window.location.href = PROXY + encodeURIComponent(act + sep + params);
  }, true);
  // Hijack window.open
  var _open = window.open;
  window.open = function(url){ if (url) window.location.href = wrap(url); return null; };
  // Hijack location assignments via setter
  try {
    var origAssign = window.location.assign.bind(window.location);
    window.location.assign = function(url){ origAssign(wrap(url)); };
    var origReplace = window.location.replace.bind(window.location);
    window.location.replace = function(url){ origReplace(wrap(url)); };
  } catch(e){}
})();
</script>`;
    if (body.includes('</body>')) {
      body = body.replace('</body>', interceptor + '</body>');
    } else {
      body += interceptor;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Remove frame-busting headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.send(body);
  } catch (err) {
    // If the failed request was for an asset (js/css/image/font), return an
    // empty body with the matching MIME type so the browser doesn't log
    // "MIME type 'text/html' is not executable" errors.
    const lower = (url || '').toLowerCase().split('?')[0];
    const mimeByExt = {
      '.js': 'application/javascript', '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
      '.json': 'application/json',
    };
    const ext = Object.keys(mimeByExt).find(e => lower.endsWith(e));
    if (ext) {
      res.setHeader('Content-Type', mimeByExt[ext]);
      res.status(502).send('');
      return;
    }
    res.status(502).send(`<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#94a3b8"><div style="text-align:center"><h2>Cannot load this page</h2><p>${err.message}</p><p style="opacity:0.5">${url}</p></div></body></html>`);
  }
});

// ============= AI API (Pollinations.ai proxy, same as Orbix AI) =============

function cleanAIResponse(text) {
  text = text.trim();
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  text = text.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '').trim();
  // Strip pollinations ads
  const lines = text.split('\n');
  const cleaned = lines.filter(l =>
    !(l.toLowerCase().includes('pollinations.ai') && l.trim().length < 200) &&
    !['---', '***', '___'].includes(l.trim())
  );
  while (cleaned.length && !cleaned[cleaned.length - 1].trim()) cleaned.pop();
  return cleaned.join('\n').trim();
}

// Calls the Pollinations text API, retrying when the anonymous queue is full
// (HTTP 429). Pollinations returns its errors as a JSON body even with a 429
// status, so we must detect those instead of forwarding them as the AI reply.
async function fetchAICompletion(messages) {
  const maxAttempts = 4;
  let lastError = '';
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const payload = JSON.stringify({
      messages,
      model: 'openai',
      seed: Math.floor(Math.random() * 999999),
    });
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    const raw = await response.text();

    // Pollinations signals errors via a JSON body like {"error":"...","status":429}
    const looksLikeError = !response.ok || /^\s*\{\s*"error"\s*:/.test(raw);
    if (looksLikeError) {
      let rateLimited = response.status === 429;
      try {
        const j = JSON.parse(raw);
        if (j.status === 429 || /queue full|rate limit|too many/i.test(j.error || '')) rateLimited = true;
        lastError = j.error || raw;
      } catch { lastError = raw; }

      // The anonymous queue allows 1 in-flight request; a short backoff usually clears it.
      if (rateLimited && attempt < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      return { ok: false, rateLimited, error: lastError };
    }

    const text = cleanAIResponse(raw);
    if (text) return { ok: true, text };
    lastError = 'empty response';
  }
  return { ok: false, rateLimited: false, error: lastError };
}

// This endpoint is used by both the AI chat app AND the Orbix iframe
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const result = await fetchAICompletion(messages);
    if (result.ok) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(result.text);
    }
    if (result.rateLimited) {
      return res.status(429).send('The AI is busy right now (rate limit reached). Please wait a few seconds and try again.');
    }
    return res.status(502).send('AI service is temporarily unavailable. Please try again.');
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(502).send('AI service unavailable. Try again.');
  }
});

// Also keep /api/ai/chat for backward compat
app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;
  try {
    const result = await fetchAICompletion(messages);
    if (result.ok) {
      return res.json({ response: result.text, model: 'pollinations' });
    }
    res.json({
      response: result.rateLimited
        ? 'The AI is busy right now (rate limit reached). Please wait a few seconds and try again.'
        : 'AI service is temporarily unavailable. Please try again.',
      model: 'error',
    });
  } catch (err) {
    res.json({ response: 'AI service unavailable. Check your internet connection.', model: 'error' });
  }
});

// Dictionary API
app.get('/api/dictionary/:word', async (req, res) => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${req.params.word}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Weather API (using open-meteo, no key needed)
app.get('/api/weather', async (req, res) => {
  try {
    const { lat = 37.7749, lon = -122.4194 } = req.query;
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Operation failed' });
  }
});

// ============= WEBSOCKET FOR FILE WATCHING =============

io.on('connection', (socket) => {
  console.log('Client connected');
  let watcher;

  socket.on('watch', (dirPath) => {
    if (watcher) watcher.close();
    watcher = chokidar.watch(dirPath, {
      ignored: /(^|[\/\\])\./,
      persistent: true,
      depth: 1
    });

    watcher.on('add', p => socket.emit('fs-change', { type: 'add', path: p }));
    watcher.on('unlink', p => socket.emit('fs-change', { type: 'unlink', path: p }));
    watcher.on('addDir', p => socket.emit('fs-change', { type: 'addDir', path: p }));
    watcher.on('unlinkDir', p => socket.emit('fs-change', { type: 'unlinkDir', path: p }));
    watcher.on('change', p => socket.emit('fs-change', { type: 'change', path: p }));
  });

  socket.on('disconnect', () => {
    if (watcher) watcher.close();
    console.log('Client disconnected');
  });
});

// ============= SCREENSHOT API =============
app.post('/api/system/screenshot', (req, res) => {
  const filePath = path.join(HOME, 'Desktop', `Screenshot_${Date.now()}.png`);
  exec(`screencapture -x "${filePath}"`, (err) => {
    if (err) return res.status(500).json({ error: 'Operation failed' });
    res.json({ success: true, path: filePath });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`webOS Server running on port ${PORT}`);
});
