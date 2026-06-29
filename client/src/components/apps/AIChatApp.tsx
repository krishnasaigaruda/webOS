import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WindowState, useStore, saveInstalledApps } from '../../store/useStore';
import { api } from '../../utils/api';
import { APP_REGISTRY, registerApp, getAllApps } from '../../utils/appRegistry';
import { STORE_APPS } from './AppStoreApp';

// ============================================================================
// webOS AI Agent
// ----------------------------------------------------------------------------
// The assistant can operate webOS the way a person would: list/read/search
// files, write & edit them, create folders, move/copy/delete, open apps and
// files, change the theme, etc. Read-only steps run automatically so the agent
// can "see"; every step that changes something pauses and asks you to Accept
// or Reject it first — exactly like accept-edits in Claude Code.
// ============================================================================

const API = 'http://localhost:3001/api';

type ActionStatus = 'pending' | 'running' | 'done' | 'rejected' | 'error';

type Step =
  | { kind: 'user'; text: string }
  | { kind: 'assistant'; text: string }
  | { kind: 'thought'; text: string }
  | {
      kind: 'action';
      tool: string;
      args: any;
      explain: string;
      status: ActionStatus;
      result?: string;
    };

interface ToolDef {
  readOnly: boolean;
  // Human label shown in the step / approval card
  explain: (args: any, resolve: (p: string) => string) => string;
  // Runs the action; returns a short observation string for the model
  run: (args: any, ctx: ToolCtx) => Promise<string>;
}

interface ToolCtx {
  resolve: (p: string) => string;
  root: string;
  openWindow: ReturnType<typeof useStore.getState>['openWindow'];
  store: typeof useStore;
}

// ---- file-type → app mapping (mirrors Finder's double-click behaviour) ----
const EXT_APP: Array<[RegExp, string]> = [
  [/\.(glb|gltf|obj|stl|fbx)$/i, 'model-viewer'],
  [/\.(png|jpe?g|gif|webp|bmp|svg|heic)$/i, 'photos'],
  [/\.(mp3|wav|ogg|m4a|flac|aac)$/i, 'music'],
  [/\.(mp4|webm|mov|avi|mkv)$/i, 'video-player'],
  [/\.(csv|xlsx|xls)$/i, 'spreadsheet'],
  [/\.(pdf)$/i, 'document'],
  [/\.(docx?|rtf)$/i, 'document'],
  [/\.(html?|css|js|jsx|ts|tsx|json|py|java|c|cpp|h|go|rs|rb|php|sh|yml|yaml|xml|sql)$/i, 'code-editor'],
];
const appForFile = (name: string): string => {
  for (const [re, app] of EXT_APP) if (re.test(name)) return app;
  return 'textedit';
};

const base = (p: string) => p.replace(/\/+$/, '').split('/').pop() || p;
const short = (s: string, n = 600) => (s.length > n ? s.slice(0, n) + `… (${s.length} chars total)` : s);

// ----------------------------- the tool set --------------------------------
const TOOLS: Record<string, ToolDef> = {
  list_files: {
    readOnly: true,
    explain: (a) => `List files in “${a.path || '/'}”`,
    run: async (a, c) => {
      const items = await api.fs.list(c.resolve(a.path || ''));
      if (!Array.isArray(items)) return 'Error: could not list that folder.';
      if (!items.length) return '(empty folder)';
      return items.map((f: any) => `${f.isDirectory ? '[dir] ' : '      '}${f.name}`).join('\n');
    },
  },
  read_file: {
    readOnly: true,
    explain: (a) => `Read “${a.path}”`,
    run: async (a, c) => {
      const res = await api.fs.read(c.resolve(a.path));
      if (res?.content == null) return `Error: could not read ${a.path}.`;
      return short(String(res.content), 4000);
    },
  },
  search_files: {
    readOnly: true,
    explain: (a) => `Search for “${a.query}”`,
    run: async (a, c) => {
      const res = await api.fs.search(a.query, a.path ? c.resolve(a.path) : undefined);
      if (!Array.isArray(res) || !res.length) return 'No matches found.';
      return res.slice(0, 30).map((f: any) => f.path).join('\n');
    },
  },
  list_apps: {
    readOnly: true,
    explain: () => `Check which apps are installed`,
    run: async () => {
      const installedIds = new Set(getAllApps().map(a => a.id));
      const installable = STORE_APPS.filter(a => !installedIds.has(a.id));
      return `Already installed (open with open_app): ${Array.from(installedIds).join(', ')}\n\nNot yet installed (use install_app): ${installable.map(a => a.id).join(', ') || '(none — every store app is already installed)'}`;
    },
  },

  write_file: {
    readOnly: false,
    explain: (a) => `Create / overwrite “${a.path}” (${(a.content || '').length} chars)`,
    run: async (a, c) => {
      await api.fs.write(c.resolve(a.path), a.content ?? '');
      return `Wrote ${a.path}.`;
    },
  },
  edit_file: {
    readOnly: false,
    explain: (a) => `Edit “${a.path}” — replace text`,
    run: async (a, c) => {
      const p = c.resolve(a.path);
      const res = await api.fs.read(p);
      if (res?.content == null) return `Error: cannot read ${a.path} to edit.`;
      const content = String(res.content);
      if (a.find && !content.includes(a.find)) return `Error: the text to replace was not found in ${a.path}.`;
      const next = a.find ? content.replace(a.find, a.replace ?? '') : (a.replace ?? content);
      await api.fs.write(p, next);
      return `Edited ${a.path}.`;
    },
  },
  create_folder: {
    readOnly: false,
    explain: (a) => `Create folder “${a.path}”`,
    run: async (a, c) => {
      await api.fs.mkdir(c.resolve(a.path));
      return `Created folder ${a.path}.`;
    },
  },
  delete: {
    readOnly: false,
    explain: (a) => `Delete “${a.path}” (moves to Trash)`,
    run: async (a, c) => {
      await api.fs.delete(c.resolve(a.path));
      return `Deleted ${a.path}.`;
    },
  },
  rename: {
    readOnly: false,
    explain: (a) => `Move / rename “${a.path}” → “${a.newPath}”`,
    run: async (a, c) => {
      await api.fs.rename(c.resolve(a.path), c.resolve(a.newPath));
      return `Renamed to ${a.newPath}.`;
    },
  },
  copy: {
    readOnly: false,
    explain: (a) => `Copy “${a.path}” → “${a.dest}”`,
    run: async (a, c) => {
      await api.fs.copy(c.resolve(a.path), c.resolve(a.dest));
      return `Copied to ${a.dest}.`;
    },
  },
  open_app: {
    readOnly: false,
    explain: (a) => `Open the ${APP_REGISTRY[a.app]?.name || a.app} app`,
    run: async (a, c) => {
      const def = APP_REGISTRY[a.app];
      if (!def) return `Error: no app called “${a.app}”. Known apps: ${Object.keys(APP_REGISTRY).join(', ')}.`;
      c.openWindow(def.id, def.name, def.icon, { width: def.defaultWidth, height: def.defaultHeight });
      return `Opened ${def.name}.`;
    },
  },
  install_app: {
    readOnly: false,
    explain: (a) => {
      const app = STORE_APPS.find(x => x.id === a.app);
      const already = getAllApps().some(x => x.id === a.app);
      return already
        ? `${app?.name || a.app} is already installed — nothing to do`
        : `Install ${app?.name || a.app} from the App Store`;
    },
    run: async (a, c) => {
      const app = STORE_APPS.find(x => x.id === a.app);
      if (!app) return `Error: no installable app "${a.app}". Installable ids: ${STORE_APPS.filter(x => !x.installed).map(x => x.id).join(', ')}.`;
      if (getAllApps().some(x => x.id === app.id)) return `${app.name} is already installed.`;
      registerApp({
        id: app.id,
        name: app.name,
        icon: app.id,
        category: app.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') as any,
        defaultWidth: 800,
        defaultHeight: 600,
        description: app.description,
      });
      saveInstalledApps(getAllApps());
      c.store.getState().addNotification({ title: 'App Store', message: `${app.name} installed successfully`, app: 'app-store' });
      return `Installed ${app.name}. It's now available in Spotlight, Finder, the Dock picker and the App Store.`;
    },
  },
  open_file: {
    readOnly: false,
    explain: (a) => `Open “${a.path}”`,
    run: async (a, c) => {
      const p = c.resolve(a.path);
      const name = base(p);
      const app = appForFile(name);
      c.openWindow(app, name, app, { filePath: p });
      return `Opened ${name} in ${APP_REGISTRY[app]?.name || app}.`;
    },
  },
  open_url: {
    readOnly: false,
    explain: (a) => `Open ${a.url} in the browser`,
    run: async (a, c) => {
      c.openWindow('browser', 'Web Browser', 'browser', { filePath: a.url });
      return `Opened ${a.url}.`;
    },
  },
  set_theme: {
    readOnly: false,
    explain: (a) => `Switch to ${a.mode} mode`,
    run: async (a, c) => {
      const cur = c.store.getState().theme;
      if (cur !== a.mode) c.store.getState().toggleTheme();
      return `Theme set to ${a.mode}.`;
    },
  },
};

const TOOL_DOCS = `
READ-ONLY tools (run automatically, no approval needed):
- list_files   { "path": "<dir, '' for root>" }
- read_file    { "path": "<file>" }
- search_files { "query": "<text>", "path": "<optional dir>" }
- list_apps    {}   // see which apps are installed vs still installable

ACTION tools (each one is shown to the user, who must Accept before it runs):
- write_file   { "path": "<file>", "content": "<full file contents>" }
- edit_file    { "path": "<file>", "find": "<exact text>", "replace": "<new text>" }
- create_folder{ "path": "<dir>" }
- delete       { "path": "<file or dir>" }
- rename       { "path": "<from>", "newPath": "<to>" }   // also used to move
- copy         { "path": "<from>", "dest": "<to>" }
- open_app     { "app": "<appId>" }
- install_app  { "app": "<appId from the store catalog>" }   // actually installs it
- open_file    { "path": "<file>" }
- open_url     { "url": "https://..." }
- set_theme    { "mode": "light" | "dark" }

FINISH:
- done         { "message": "<your reply to the user, markdown ok>" }`;

function buildSystemPrompt(root: string): string {
  const installedIds = new Set(getAllApps().map(a => a.id));
  const installed = Array.from(installedIds).join(', ');
  const installable = STORE_APPS.filter(a => !installedIds.has(a.id)).map(a => a.id);
  return `You are the webOS AI Agent — an assistant that can actually operate the operating system on the user's behalf, not just chat.

You work in a loop. On EACH turn you output EXACTLY ONE JSON object and NOTHING ELSE (no prose, no markdown fences, no chat wrapper). The shape is EXACTLY:
{ "thought": "<one short sentence on what you're doing & why>", "action": "<tool name>", "args": { ... } }

NEVER output OpenAI/chat-style fields. Do NOT use "role", "content", "reasoning", "tool_calls", "function", "message", or an array. Just the flat object above with the keys "thought", "action", "args".

After a read-only tool runs, you get an "Observation:" message and continue. Action tools are shown to the user with your thought as the explanation; the user clicks Accept or Reject, then you get the result. If rejected, do NOT retry the same thing — adapt or finish.

When the task is complete (or the user just wants a normal answer), use:
{ "action": "done", "args": { "message": "<reply>" } }

All paths are relative to the user's webOS folder (root: ${root}). Use "" or "/" for the root. Don't invent files — list_files / read_file first when unsure.

Already-installed apps (open with open_app, do NOT install these again): ${installed}
Still installable (use install_app, then open_app to launch): ${installable.join(', ') || '(none — everything is already installed)'}

Tools:${TOOL_DOCS}

Rules:
- ONE JSON object per turn, valid JSON, nothing outside it.
- Prefer reading/listing before writing so you act on real paths.
- Keep going until the user's request is fully handled, then call done.
- For a plain question that needs no system actions, answer directly with done.
- NEVER install an app that is already installed. To install "a random/any app", choose one ONLY from the "Still installable" list above (or call list_apps first to be sure), and if that list is empty, just say everything is already installed instead of installing.

Examples:
User: make a notes.txt on the desktop saying hello
{ "thought": "Create the file the user asked for", "action": "write_file", "args": { "path": "Desktop/notes.txt", "content": "hello" } }

User: what's in my Documents folder?
{ "thought": "List the Documents folder", "action": "list_files", "args": { "path": "Documents" } }

User: what is 2+2?
{ "thought": "Simple question, just answer", "action": "done", "args": { "message": "2 + 2 = **4**." } }`;
}

const MAX_STEPS = 30;

const AIChatApp: React.FC<{ window: WindowState }> = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [awaiting, setAwaiting] = useState(false); // waiting for Accept/Reject
  const bottomRef = useRef<HTMLDivElement>(null);
  const { openWindow } = useStore();

  // Refs that the async agent loop reads/writes synchronously.
  const stepsRef = useRef<Step[]>([]);
  const convoRef = useRef<Array<{ role: string; content: string }>>([]);
  const rootRef = useRef<string>('');
  const pendingRef = useRef<{ idx: number; tool: string; args: any } | null>(null);
  const iterRef = useRef(0);
  const correctionRef = useRef(0);

  useEffect(() => {
    fetch(`${API}/fs/root`).then(r => r.json()).then(d => { rootRef.current = d.root || ''; }).catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [steps, busy, awaiting]);

  const ctx: ToolCtx = {
    resolve: (p) => {
      const root = rootRef.current;
      if (!p || p === '/' || p === '') return root;
      if (root && p.startsWith(root)) return p;
      return `${root}/${p.replace(/^\/+/, '')}`;
    },
    root: rootRef.current,
    openWindow,
    store: useStore,
  };

  const setStepsBoth = (next: Step[]) => { stepsRef.current = next; setSteps(next); };
  const pushStep = (s: Step): number => {
    setStepsBoth([...stepsRef.current, s]);
    return stepsRef.current.length - 1;
  };
  const patchStep = (idx: number, patch: Partial<Extract<Step, { kind: 'action' }>>) => {
    setStepsBoth(stepsRef.current.map((s, i) => (i === idx ? ({ ...s, ...patch } as Step) : s)));
  };
  const observe = (text: string) => {
    convoRef.current.push({ role: 'user', content: `Observation:\n${text}\n\nContinue with the next JSON action.` });
  };

  // Ask the model for the next JSON action.
  const callModel = async (): Promise<string> => {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: convoRef.current }),
    });
    const text = (await res.text()).trim();
    if (!res.ok) throw new Error(res.status === 429 ? 'busy' : 'unavailable');
    return text;
  };

  // Pull the first balanced { ... } JSON object out of a model reply.
  const findJsonObject = (raw: string): any | null => {
    const t = raw.replace(/```(?:json)?/gi, '').trim();
    const start = t.indexOf('{');
    if (start === -1) return null;
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let i = start; i < t.length; i++) {
      const ch = t[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end === -1) return null;
    try { return JSON.parse(t.slice(start, end + 1)); } catch { return null; }
  };

  // Tolerate the many shapes models emit: our {action,args}, OpenAI-style
  // {tool_calls:[{function:{name,arguments}}]}, or a nested JSON string in content.
  const extractAction = (obj: any): { thought?: string; action: string; args: any } | null => {
    if (!obj || typeof obj !== 'object') return null;
    const thought = obj.thought || obj.reasoning || obj.thoughts;
    let action: any = obj.action || obj.tool || obj.name;
    let args: any = obj.args || obj.arguments || obj.parameters || obj.input;
    if (!action && Array.isArray(obj.tool_calls) && obj.tool_calls.length) {
      const tc = obj.tool_calls[0] || {};
      action = tc.function?.name || tc.name || tc.tool;
      let raw = tc.function?.arguments ?? tc.arguments ?? tc.args;
      if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch {} }
      args = raw || args;
    }
    if (!action && typeof obj.content === 'string') {
      const nested = findJsonObject(obj.content);
      if (nested) return extractAction(nested);
    }
    if (typeof args === 'string') { try { args = JSON.parse(args); } catch {} }
    if (typeof action === 'string') return { thought, action, args: args || {} };
    return null;
  };

  type Reply =
    | { type: 'action'; thought?: string; action: string; args: any }
    | { type: 'answer'; text: string }
    | { type: 'retry' };

  const parseReply = (raw: string): Reply => {
    const obj = findJsonObject(raw);
    if (!obj) return { type: 'answer', text: raw }; // plain prose
    const act = extractAction(obj);
    if (act) {
      if (act.action === 'done') return { type: 'answer', text: act.args?.message || act.args?.text || 'Done.' };
      return { type: 'action', ...act };
    }
    // JSON with no usable action — maybe a wrapped plain answer.
    const msg = obj.content ?? obj.message ?? obj.text ?? obj.answer ?? obj.response;
    if (typeof msg === 'string' && msg.trim() && !(Array.isArray(obj.tool_calls) && obj.tool_calls.length === 0 && (obj.reasoning || obj.thought))) {
      return { type: 'answer', text: msg };
    }
    return { type: 'retry' }; // botched action (e.g. reasoning + empty tool_calls)
  };

  // Core agent loop. Runs until it finishes or pauses for approval.
  const runStep = useCallback(async (): Promise<void> => {
    if (iterRef.current++ > MAX_STEPS) {
      pushStep({ kind: 'assistant', text: 'Stopped — this is taking too many steps. Could you narrow the request?' });
      setBusy(false);
      return;
    }
    setBusy(true);
    let reply: string;
    try {
      reply = await callModel();
    } catch (e: any) {
      pushStep({ kind: 'assistant', text: e?.message === 'busy' ? 'The AI is busy right now — wait a few seconds and try again.' : 'Connection error. Make sure the webOS server is running.' });
      setBusy(false);
      return;
    }
    convoRef.current.push({ role: 'assistant', content: reply });

    const parsed = parseReply(reply);

    if (parsed.type === 'answer') { pushStep({ kind: 'assistant', text: parsed.text }); setBusy(false); return; }

    if (parsed.type === 'retry') {
      if (correctionRef.current++ >= 3) {
        pushStep({ kind: 'assistant', text: "I'm having trouble deciding the next step. Could you rephrase the request or break it into smaller pieces?" });
        setBusy(false);
        return;
      }
      convoRef.current.push({ role: 'user', content: 'Your previous message was not a valid action. Reply with EXACTLY ONE JSON object, e.g. {"action":"open_app","args":{"app":"app-store"}} or {"action":"done","args":{"message":"..."}}. Do NOT include any other fields — no "role", "reasoning", "tool_calls", or "content".' });
      return runStep();
    }

    correctionRef.current = 0; // got a clean action

    const def = TOOLS[parsed.action];
    if (!def) {
      if (correctionRef.current++ >= 3) { pushStep({ kind: 'assistant', text: "I couldn't map that to an available action. Could you rephrase?" }); setBusy(false); return; }
      observe(`Error: unknown action "${parsed.action}". Use one of the documented tools only.`);
      return runStep();
    }

    if (parsed.thought) pushStep({ kind: 'thought', text: parsed.thought });
    const explain = def.explain(parsed.args, ctx.resolve);

    if (def.readOnly) {
      const idx = pushStep({ kind: 'action', tool: parsed.action, args: parsed.args, explain, status: 'running' });
      let result: string;
      try { result = await def.run(parsed.args, ctx); patchStep(idx, { status: 'done', result }); }
      catch (e: any) { result = `Error: ${e?.message || e}`; patchStep(idx, { status: 'error', result }); }
      observe(result);
      return runStep();
    }

    // Mutating action → pause and ask the user.
    const idx = pushStep({ kind: 'action', tool: parsed.action, args: parsed.args, explain, status: 'pending' });
    pendingRef.current = { idx, tool: parsed.action, args: parsed.args };
    setBusy(false);
    setAwaiting(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const approve = async () => {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    setAwaiting(false);
    patchStep(p.idx, { status: 'running' });
    const def = TOOLS[p.tool];
    let result: string;
    try { result = await def.run(p.args, ctx); patchStep(p.idx, { status: 'done', result }); }
    catch (e: any) { result = `Error: ${e?.message || e}`; patchStep(p.idx, { status: 'error', result }); }
    observe(`User APPROVED. ${result}`);
    runStep();
  };

  const reject = () => {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    setAwaiting(false);
    patchStep(p.idx, { status: 'rejected' });
    observe('User REJECTED this action. Do not retry it — either take a different approach or call done.');
    runStep();
  };

  const send = () => {
    if (!input.trim() || busy || awaiting) return;
    const text = input.trim();
    setInput('');
    pushStep({ kind: 'user', text });
    if (convoRef.current.length === 0) {
      convoRef.current.push({ role: 'system', content: buildSystemPrompt(rootRef.current) });
    }
    convoRef.current.push({ role: 'user', content: text });
    iterRef.current = 0;
    correctionRef.current = 0;
    runStep();
  };

  const clear = () => {
    pendingRef.current = null;
    convoRef.current = [];
    iterRef.current = 0;
    setAwaiting(false);
    setBusy(false);
    setStepsBoth([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="6" /><circle cx="9" cy="9" r="1" fill="white" stroke="none" /><circle cx="15" cy="9" r="1" fill="white" stroke="none" /><path d="M9 13q3 3 6 0" /><path d="M8 18l4 4 4-4" strokeWidth="1.5" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>AI Agent</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{awaiting ? 'Waiting for your approval…' : busy ? 'Working…' : 'Can operate webOS for you'}</div>
          </div>
        </div>
        <button style={s.clearBtn} onClick={clear}>Clear</button>
      </div>

      <div style={s.messageArea}>
        {steps.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 30, lineHeight: 1.7 }}>
            <div style={{ fontSize: 15, color: '#94a3b8', marginBottom: 8 }}>I can do things in webOS for you.</div>
            Ask me to create, edit, organise or open files, launch apps, and more.<br />
            I'll show each change and ask you to <b style={{ color: '#22c55e' }}>Accept</b> or <b style={{ color: '#ef4444' }}>Reject</b> it first.
            <div style={{ marginTop: 14, fontSize: 12 }}>
              <div style={s.eg}>“Make a folder called Trip and add a packing-list.txt in it”</div>
              <div style={s.eg}>“Read my notes.txt and summarise it”</div>
              <div style={s.eg}>“Open the Calculator and switch to dark mode”</div>
            </div>
          </div>
        )}

        {steps.map((step, i) => <StepView key={i} step={step} />)}

        {awaiting && pendingRef.current && (
          <div style={s.approveBar}>
            <button style={s.rejectBtn} onClick={reject}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              Reject
            </button>
            <button style={s.acceptBtn} onClick={approve}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              Accept
            </button>
          </div>
        )}

        {busy && (
          <div style={{ display: 'flex', gap: 5, padding: '8px 4px', alignItems: 'center', color: '#64748b', fontSize: 12 }}>
            <span style={{ ...s.dot, animationDelay: '0s' }} />
            <span style={{ ...s.dot, animationDelay: '0.2s' }} />
            <span style={{ ...s.dot, animationDelay: '0.4s' }} />
            <span style={{ marginLeft: 6 }}>thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={s.inputArea}>
        <input style={s.input} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={awaiting ? 'Accept or reject the step above…' : 'Ask me to do something…'}
          disabled={busy || awaiting} />
        <button style={{ ...s.sendBtn, opacity: input.trim() && !busy && !awaiting ? 1 : 0.4 }}
          onClick={send} disabled={!input.trim() || busy || awaiting}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
    </div>
  );
};

// ----------------------------- step rendering ------------------------------
const STATUS_META: Record<ActionStatus, { color: string; label: string }> = {
  pending: { color: '#f59e0b', label: 'Awaiting approval' },
  running: { color: '#3b82f6', label: 'Running…' },
  done: { color: '#22c55e', label: 'Done' },
  rejected: { color: '#ef4444', label: 'Rejected' },
  error: { color: '#ef4444', label: 'Failed' },
};

const StepView: React.FC<{ step: Step }> = ({ step }) => {
  if (step.kind === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <div style={{ ...s.bubble, background: '#2563eb', borderRadius: '16px 16px 4px 16px', maxWidth: '85%' }}>{step.text}</div>
      </div>
    );
  }
  if (step.kind === 'assistant') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
        <div style={{ ...s.bubble, background: '#1e293b', borderRadius: '16px 16px 16px 4px', maxWidth: '85%' }}
          dangerouslySetInnerHTML={{ __html: formatMd(step.text) }} />
      </div>
    );
  }
  if (step.kind === 'thought') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0 6px', color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6M12 17v6M4.2 4.2l4.3 4.3M15.5 15.5l4.3 4.3M1 12h6M17 12h6M4.2 19.8l4.3-4.3M15.5 8.5l4.3-4.3" /></svg>
        {step.text}
      </div>
    );
  }
  // action card
  const meta = STATUS_META[step.status];
  const isRead = TOOLS[step.tool]?.readOnly;
  return (
    <div style={{ ...s.card, borderColor: step.status === 'pending' ? '#f59e0b66' : '#334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: step.result || step.args ? 8 : 0 }}>
        <span style={{ ...s.toolTag, background: isRead ? '#1e293b' : '#3b0764', color: isRead ? '#94a3b8' : '#e9d5ff' }}>{step.tool}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{step.explain}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: meta.color }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: meta.color }} />
          {meta.label}
        </span>
      </div>
      {step.tool === 'write_file' && step.args?.content != null && (
        <pre style={s.codePreview}>{short(String(step.args.content), 700)}</pre>
      )}
      {step.tool === 'edit_file' && (
        <pre style={s.codePreview}>
          <span style={{ color: '#f87171' }}>- {short(String(step.args?.find ?? ''), 200)}</span>{'\n'}
          <span style={{ color: '#4ade80' }}>+ {short(String(step.args?.replace ?? ''), 200)}</span>
        </pre>
      )}
      {step.result && step.status !== 'rejected' && (
        <pre style={{ ...s.codePreview, color: step.status === 'error' ? '#fca5a5' : '#94a3b8' }}>{short(step.result, 500)}</pre>
      )}
    </div>
  );
};

function formatMd(text: string): string {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#0f172a;padding:10px;border-radius:8px;border:1px solid #334155;overflow-x:auto;margin:8px 0;font-size:12px;font-family:monospace"><code>$2</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br/>');
}

const s: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e293b' },
  clearBtn: { padding: '5px 14px', borderRadius: 6, fontSize: 12, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' },
  messageArea: { flex: 1, overflowY: 'auto', padding: 16 },
  bubble: { padding: '10px 14px', fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 },
  eg: { background: '#1e293b', borderRadius: 8, padding: '7px 11px', margin: '6px auto', maxWidth: 360, color: '#94a3b8', textAlign: 'left' },
  card: { background: '#111c30', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px', marginBottom: 10 },
  toolTag: { fontSize: 11, fontFamily: 'monospace', padding: '2px 7px', borderRadius: 5, flexShrink: 0 },
  codePreview: { background: '#0a1120', border: '1px solid #1e293b', borderRadius: 6, padding: 8, margin: 0, fontSize: 11.5, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflow: 'auto', color: '#cbd5e1' },
  approveBar: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 12 },
  acceptBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  rejectBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: '1px solid #7f1d1d', background: 'transparent', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  dot: { width: 6, height: 6, borderRadius: 3, background: '#64748b', animation: 'pulse 1s infinite', display: 'inline-block' },
  inputArea: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #1e293b' },
  input: { flex: 1, padding: '10px 16px', borderRadius: 20, border: '1px solid #334155', background: '#1e293b', outline: 'none', fontSize: 14, color: '#e2e8f0' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', flexShrink: 0 },
};

export default AIChatApp;
