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
    if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/javascript') {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ content, mimeType });
    } else {
      res.sendFile(filePath);
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
    if (depth > 5 || results.length > 50) return;
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

// ============= AI API =============

app.post('/api/ai/chat', async (req, res) => {
  const { messages } = req.body;
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  const lastMessage = messages[messages.length - 1]?.content || '';

  // Try OpenAI if key exists
  if (apiKey && process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages
      });
      return res.json({ response: completion.choices[0].message.content, model: 'gpt-4o-mini' });
    } catch (err) {
      console.error('OpenAI error:', err.message);
    }
  }

  // Smart local fallback - actually useful responses
  const lower = lastMessage.toLowerCase();
  let response = '';

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    response = "Hello! I'm the webOS AI Assistant. I can help you with:\n\n• **Open apps** — say \"open calculator\" or \"open code editor\"\n• **File operations** — \"create a file\", \"list documents\"\n• **Math** — \"what is 25 * 47?\"\n• **System info** — \"system info\", \"battery\", \"disk space\"\n• **Writing** — \"write a poem\", \"draft an email\"\n\nFor full AI capabilities, set your `OPENAI_API_KEY` environment variable.";
  } else if (lower.includes('what is') && lower.match(/[\d+\-*/()]/)) {
    try {
      const expr = lower.replace(/what is/i, '').replace(/[^0-9+\-*/().%\s]/g, '').trim();
      const result = Function('"use strict"; return (' + expr + ')')();
      response = `The answer is **${result}**`;
    } catch { response = "I couldn't calculate that. Please check the expression."; }
  } else if (lower.includes('time') || lower.includes('date')) {
    response = `The current date and time is **${new Date().toLocaleString()}**`;
  } else if (lower.includes('system info') || lower.includes('about this')) {
    const os = require('os');
    response = `**System Info:**\n• Hostname: ${os.hostname()}\n• Platform: ${os.platform()} ${os.arch()}\n• CPUs: ${os.cpus().length} cores\n• Memory: ${(os.totalmem()/1e9).toFixed(1)} GB total, ${(os.freemem()/1e9).toFixed(1)} GB free\n• Uptime: ${Math.floor(os.uptime()/3600)}h ${Math.floor((os.uptime()%3600)/60)}m`;
  } else if (lower.includes('list') && (lower.includes('file') || lower.includes('document'))) {
    try {
      const files = fs.readdirSync(path.join(HOME, 'Documents')).filter(f => !f.startsWith('.')).slice(0, 15);
      response = `**Files in Documents:**\n${files.map(f => '• ' + f).join('\n')}`;
    } catch { response = "I couldn't access the Documents folder."; }
  } else if (lower.includes('create') && lower.includes('file')) {
    response = "To create a file, I'd need to execute a command. You can:\n1. Open **Finder** and use the New File button\n2. Open **Code Editor** and save a new file\n3. Open **TextEdit** to write and save text";
  } else if (lower.includes('joke')) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs! 🪲",
      "There are only 10 types of people: those who understand binary and those who don't.",
      "A SQL query walks into a bar, sees two tables, and asks: 'Can I JOIN you?'",
      "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
    ];
    response = jokes[Math.floor(Math.random() * jokes.length)];
  } else if (lower.includes('weather')) {
    response = "Open the **Weather** app from the dock to see current conditions and forecasts! You can also check the widget panel.";
  } else {
    response = `I understand you're asking about: "${lastMessage}"\n\nI'm running in **offline mode** with basic capabilities. For full AI conversations, code help, and analysis:\n\n1. Set \`OPENAI_API_KEY=your-key\` in your environment\n2. Restart the webOS server\n\nMeanwhile, try asking me to:\n• Open an app\n• Do math calculations\n• Get system info\n• Tell a joke`;
  }

  res.json({ response, model: 'local' });
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
