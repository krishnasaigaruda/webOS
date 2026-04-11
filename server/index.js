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
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const HOME = process.env.HOME || '/Users/krishna';
const WEBOS_ROOT = path.join(HOME, 'Documents');

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = req.body.path || WEBOS_ROOT;
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// ============= FILE SYSTEM API =============

// List directory
app.get('/api/fs/list', (req, res) => {
  const dirPath = req.query.path || HOME;
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const result = items
      .filter(item => !item.name.startsWith('.'))
      .map(item => {
        const fullPath = path.join(dirPath, item.name);
        let stats;
        try { stats = fs.lstatSync(fullPath); } catch { stats = null; }
        // Treat .app bundles as files (not navigable directories)
        const isApp = item.name.endsWith('.app');
        const isDir = item.isDirectory() || (item.isSymbolicLink() && stats?.isDirectory());
        return {
          name: item.name,
          path: fullPath,
          isDirectory: isApp ? false : isDir,
          size: stats?.size || 0,
          modified: stats?.mtime || new Date(),
          created: stats?.birthtime || new Date(),
          mimeType: isDir ? 'directory' : mime.lookup(item.name) || 'application/octet-stream'
        };
      });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read file
app.get('/api/fs/read', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Path required' });
  try {
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const forceText = req.query.text === 'true';
    const isTextLike = mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/javascript' || mimeType === 'application/xml' || mimeType === 'application/x-yaml';

    // Always try to read as text first
    if (isTextLike || forceText) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return res.json({ content, mimeType });
      } catch {
        // If utf-8 fails, try latin1 (reads any byte)
        try {
          const content = fs.readFileSync(filePath, 'latin1');
          return res.json({ content, mimeType });
        } catch {
          return res.json({ content: '[Binary file - cannot display as text]', mimeType });
        }
      }
    }

    // For non-text types without forceText, try text first then fall back to sendFile
    try {
      const buf = fs.readFileSync(filePath);
      // Check if first 1000 bytes have null bytes (binary indicator)
      const hasNull = buf.slice(0, 1000).includes(0);
      if (!hasNull) {
        return res.json({ content: buf.toString('utf-8'), mimeType });
      }
      return res.sendFile(filePath);
    } catch {
      return res.sendFile(filePath);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Write file
app.post('/api/fs/write', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Path required' });
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create directory
app.post('/api/fs/mkdir', (req, res) => {
  const { path: dirPath } = req.body;
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file/directory
app.delete('/api/fs/delete', (req, res) => {
  const filePath = req.query.path;
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      fs.rmSync(filePath, { recursive: true });
    } else {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rename/move
app.post('/api/fs/rename', (req, res) => {
  const { oldPath, newPath } = req.body;
  try {
    fs.renameSync(oldPath, newPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Copy
app.post('/api/fs/copy', (req, res) => {
  const { source, destination } = req.body;
  try {
    fs.cpSync(source, destination, { recursive: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload file
app.post('/api/fs/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, path: req.file.path });
});

// Serve files for preview
app.get('/api/fs/serve', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Path required' });
  try {
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get file info
app.get('/api/fs/info', (req, res) => {
  const filePath = req.query.path;
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
    res.status(500).json({ error: err.message });
  }
});

// Search files
app.get('/api/fs/search', (req, res) => {
  const { query, path: searchPath } = req.query;
  const dir = searchPath || HOME;
  const results = [];

  function searchDir(dirPath, depth = 0) {
    if (depth > 10 || results.length > 200) return;
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        const fullPath = path.join(dirPath, item.name);
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            name: item.name,
            path: fullPath,
            isDirectory: item.isDirectory()
          });
        }
        if (item.isDirectory()) {
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
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    user: os.userInfo().username,
    homeDir: HOME
  });
});

// Execute command (for terminal)
app.post('/api/system/exec', (req, res) => {
  const { command, cwd } = req.body;
  exec(command, { cwd: cwd || HOME, timeout: 30000, maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    res.json({
      stdout: stdout || '',
      stderr: stderr || '',
      error: err ? err.message : null,
      exitCode: err ? err.code : 0
    });
  });
});

// ============= SYSTEM CONTROL API =============

// WiFi control (macOS)
app.post('/api/system/wifi', (req, res) => {
  const { enabled } = req.body;
  const cmd = enabled ? 'networksetup -setairportpower en0 on' : 'networksetup -setairportpower en0 off';
  exec(cmd, (err) => {
    if (err) return res.status(500).json({ error: err.message });
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

// Volume control
app.post('/api/system/volume', (req, res) => {
  const { level } = req.body;
  exec(`osascript -e "set volume output volume ${level}"`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
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

// This endpoint is used by both the AI chat app AND the Orbix iframe
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  try {
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
    let text = await response.text();
    text = cleanAIResponse(text);
    if (text) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(text);
    } else {
      res.status(502).send('AI service returned empty response. Try again.');
    }
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(502).send('AI service unavailable. Try again.');
  }
});

// Also keep /api/ai/chat for backward compat
app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;
  try {
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
    let text = await response.text();
    text = cleanAIResponse(text);
    res.json({ response: text || 'No response from AI.', model: 'pollinations' });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, path: filePath });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`webOS Server running on port ${PORT}`);
});
