import React, { useState, useRef, useEffect } from 'react';
import { WindowState, useStore } from '../../store/useStore';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AIChatApp: React.FC<{ window: WindowState }> = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m the webOS AI Assistant powered by AI. Ask me anything - I can help with code, writing, math, ideas, and more.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { openWindow } = useStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Check for local app commands first
    const lower = input.toLowerCase();
    if (lower.startsWith('open ')) {
      const appMap: Record<string, string> = {
        'finder': 'finder', 'calculator': 'calculator', 'calendar': 'calendar',
        'notes': 'notes', 'code editor': 'code-editor', 'settings': 'settings',
        'browser': 'browser', 'weather': 'weather', 'photos': 'photos',
        'music': 'music', 'reminders': 'reminders', 'clock': 'clock',
        'dictionary': 'dictionary', 'camera': 'camera', 'maps': 'maps',
        'tools': 'tools-hub', 'app store': 'app-store', 'help': 'help',
      };
      const appName = lower.replace('open ', '');
      for (const [name, id] of Object.entries(appMap)) {
        if (appName.includes(name)) {
          openWindow(id, name, id);
          setMessages([...newMessages, { role: 'assistant', content: `Opened ${name}.` }]);
          setLoading(false);
          return;
        }
      }
    }

    // Use server proxy to Pollinations.ai
    try {
      const apiMessages = [
        { role: 'system', content: 'You are webOS AI Assistant, a helpful AI built into a web-based operating system. Be concise, friendly, and helpful. You can help with code, writing, math, explanations, brainstorming, and more. Format responses with markdown. Keep responses focused.' },
        ...newMessages.filter(m => m.role !== 'system').slice(-10).map(m => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const text = await response.text();
      setMessages([...newMessages, { role: 'assistant', content: text || 'Sorry, I couldn\'t generate a response.' }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection error. Make sure the webOS server is running.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="6"/><circle cx="9" cy="9" r="1" fill="white" stroke="none"/><circle cx="15" cy="9" r="1" fill="white" stroke="none"/><path d="M9 13q3 3 6 0"/><path d="M8 18l4 4 4-4" strokeWidth="1.5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>AI Assistant</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{loading ? 'Thinking...' : 'Powered by AI'}</div>
          </div>
        </div>
        <button style={s.clearBtn} onClick={() => setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help?' }])}>Clear</button>
      </div>

      {/* Messages */}
      <div style={s.messageArea}>
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div style={{
              ...s.bubble,
              background: msg.role === 'user' ? '#2563eb' : '#1e293b',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              maxWidth: '85%',
            }}>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: formatMd(msg.content) }} />
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <div style={{ ...s.bubble, background: '#1e293b', borderRadius: '16px 16px 16px 4px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ ...s.dot, animationDelay: '0s' }} />
                <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                <span style={{ ...s.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <input style={s.input} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask me anything..." disabled={loading} />
        <button style={{ ...s.sendBtn, opacity: input.trim() && !loading ? 1 : 0.4 }}
          onClick={sendMessage} disabled={!input.trim() || loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>
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
  bubble: { padding: '10px 14px', fontSize: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, background: '#64748b', animation: 'pulse 1s infinite', display: 'inline-block' },
  inputArea: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #1e293b' },
  input: { flex: 1, padding: '10px 16px', borderRadius: 20, border: '1px solid #334155', background: '#1e293b', outline: 'none', fontSize: 14, color: '#e2e8f0' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', flexShrink: 0 },
};

export default AIChatApp;
