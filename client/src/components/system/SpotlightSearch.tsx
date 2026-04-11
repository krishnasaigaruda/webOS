import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { APP_REGISTRY, getAllApps } from '../../utils/appRegistry';
import { api } from '../../utils/api';
import { AppIcon } from '../../utils/icons';

const SpotlightSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleSpotlight, openWindow } = useStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query) {
      // Show top apps when empty
      setResults(getAllApps().slice(0, 8).map(app => ({
        type: 'app',
        icon: app.icon,
        name: app.name,
        description: app.description,
        appId: app.id,
      })));
      return;
    }

    const lower = query.toLowerCase();
    const appResults = getAllApps()
      .filter(app => app.name.toLowerCase().includes(lower) || app.description?.toLowerCase().includes(lower))
      .map(app => ({
        type: 'app',
        icon: app.icon,
        name: app.name,
        description: app.description,
        appId: app.id,
      }));

    // Search files
    api.fs.search(query).then(files => {
      const fileResults = files.slice(0, 5).map((f: any) => ({
        type: 'file',
        icon: f.isDirectory ? 'folder' : 'file',
        name: f.name,
        description: f.path,
        path: f.path,
        isDirectory: f.isDirectory,
      }));
      setResults([...appResults.slice(0, 5), ...fileResults]);
    }).catch(() => {
      setResults(appResults.slice(0, 8));
    });

    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      toggleSpotlight();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: any) => {
    if (!result) return;
    if (result.type === 'app') {
      const app = APP_REGISTRY[result.appId];
      openWindow(result.appId, app.name, app.icon, {
        width: app.defaultWidth,
        height: app.defaultHeight,
      });
    } else if (result.type === 'file') {
      if (result.isDirectory) {
        openWindow('finder', result.name, 'finder', { filePath: result.path });
      } else {
        openWindow('textedit', result.name, 'textedit', { filePath: result.path });
      }
    }
    toggleSpotlight();
  };

  return (
    <div style={styles.overlay} onClick={toggleSpotlight}>
      <div
        className="animate-scaleIn"
        style={styles.container}
        onClick={e => e.stopPropagation()}
      >
        <div style={styles.searchBar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            ref={inputRef}
            style={styles.input}
            placeholder="Spotlight Search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {results.length > 0 && (
          <div style={styles.results}>
            {results.map((result, i) => (
              <div
                key={i}
                style={{
                  ...styles.resultItem,
                  background: i === selectedIndex ? 'var(--accent)' : 'transparent',
                  color: i === selectedIndex ? '#fff' : 'var(--text-primary)',
                }}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {result.type === 'app' ? <AppIcon appId={result.appId} size={36} /> :
                    <svg width="32" height="32" viewBox="0 0 16 16"><path d={result.isDirectory ? "M1.5 4A1.5 1.5 0 013 2.5h3.5L8.5 5H13A1.5 1.5 0 0114.5 6.5v6A1.5 1.5 0 0113 14H3A1.5 1.5 0 011.5 12.5V4z" : "M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z"} fill={result.isDirectory ? "#64B5F6" : "#9CA3AF"}/></svg>}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {result.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    opacity: 0.6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {result.description}
                  </div>
                </div>
                <span style={{ fontSize: 12, opacity: 0.5 }}>{result.type === 'app' ? 'Application' : 'File'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 99998,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 160,
  },
  container: {
    width: 600,
    maxHeight: 500,
    background: 'var(--bg-primary)',
    backdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: 16,
    border: '1px solid var(--border)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
  },
  input: {
    flex: 1,
    border: 'none',
    background: 'none',
    outline: 'none',
    fontSize: 18,
    color: 'var(--text-primary)',
  },
  results: {
    overflowY: 'auto',
    padding: '4px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
  },
};

export default SpotlightSearch;
