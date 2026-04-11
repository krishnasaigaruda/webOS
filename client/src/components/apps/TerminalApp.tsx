import React, { useState, useRef, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import { api } from '../../utils/api';

const TerminalApp: React.FC<{ window: WindowState }> = () => {
  const [lines, setLines] = useState<Array<{ type: 'input' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'webOS Terminal v1.0' },
    { type: 'output', text: 'Type "help" for available commands.\n' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [cwd, setCwd] = useState('/Users/krishna');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleSubmit = async () => {
    const cmd = currentInput.trim();
    if (!cmd) return;

    setLines(prev => [...prev, { type: 'input', text: `${cwd} $ ${cmd}` }]);
    setHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setCurrentInput('');

    // Built-in commands
    if (cmd === 'clear') {
      setLines([]);
      return;
    }
    if (cmd === 'help') {
      setLines(prev => [...prev, {
        type: 'output',
        text: 'Available commands: ls, cd, pwd, cat, echo, mkdir, touch, rm, cp, mv, clear, help\nAll standard bash/zsh commands are also supported.'
      }]);
      return;
    }
    if (cmd.startsWith('cd ')) {
      const dir = cmd.slice(3).trim().replace('~', '/Users/krishna');
      const newPath = dir.startsWith('/') ? dir : `${cwd}/${dir}`;
      try {
        const result = await api.system.exec(`cd "${newPath}" && pwd`, cwd);
        if (result.stdout) {
          setCwd(result.stdout.trim());
        } else if (result.error) {
          setLines(prev => [...prev, { type: 'error', text: result.stderr || result.error }]);
        }
      } catch (err: any) {
        setLines(prev => [...prev, { type: 'error', text: err.message }]);
      }
      return;
    }

    try {
      const result = await api.system.exec(cmd, cwd);
      if (result.stdout) {
        setLines(prev => [...prev, { type: 'output', text: result.stdout }]);
      }
      if (result.stderr) {
        setLines(prev => [...prev, { type: 'error', text: result.stderr }]);
      }
      if (result.error && !result.stderr) {
        setLines(prev => [...prev, { type: 'error', text: result.error }]);
      }
    } catch (err: any) {
      setLines(prev => [...prev, { type: 'error', text: `Error: ${err.message}` }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setCurrentInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setCurrentInput('');
        } else {
          setHistoryIdx(idx);
          setCurrentInput(history[idx]);
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      style={styles.container}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={styles.output}>
        {lines.map((line, i) => (
          <div key={i} style={{
            ...styles.line,
            color: line.type === 'error' ? '#FF3B30' : line.type === 'input' ? '#30D158' : '#f5f5f7',
          }}>
            <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {line.text}
            </pre>
          </div>
        ))}
        <div style={styles.inputLine}>
          <span style={{ color: '#30D158' }}>{cwd} $ </span>
          <input
            ref={inputRef}
            style={styles.input}
            value={currentInput}
            onChange={e => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    background: '#1a1a1a',
    fontFamily: "'SF Mono', 'Fira Code', Menlo, Monaco, monospace",
    fontSize: 13,
    cursor: 'text',
  },
  output: {
    height: '100%',
    overflowY: 'auto',
    padding: 12,
  },
  line: {
    lineHeight: 1.5,
  },
  inputLine: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1.5,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f5f5f7',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: 0,
    caretColor: '#fff',
  },
};

export default TerminalApp;
