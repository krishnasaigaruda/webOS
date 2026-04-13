import React, { useState, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import * as XLSX from 'xlsx';

const DataAnalyzerApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const [data, setData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!win.filePath);
  const [error, setError] = useState('');
  const [view, setView] = useState<'table' | 'stats' | 'chart'>('table');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const fileName = win.filePath?.split('/').pop() || 'Data';

  useEffect(() => {
    if (!win.filePath) return;
    const loadFile = async () => {
      setLoading(true);
      try {
        const url = `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(win.filePath!)}`;
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as any[][];
        if (rows.length > 0) {
          setHeaders(rows[0].map(String));
          setData(rows.slice(1));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load file');
      }
      setLoading(false);
    };
    loadFile();
  }, [win.filePath]);

  if (!win.filePath) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#e2e8f0', gap: 16, padding: 24 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.3">
          <rect x="14" y="40" width="10" height="22" rx="2" fill="#f59e0b"/>
          <rect x="28" y="28" width="10" height="34" rx="2" fill="#ef4444"/>
          <rect x="42" y="20" width="10" height="42" rx="2" fill="#8b5cf6"/>
          <rect x="56" y="12" width="10" height="50" rx="2" fill="#3b82f6"/>
        </svg>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Data Analyzer</h2>
        <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>Open a CSV, XLSX, or TSV file from Finder to analyze it.</p>
      </div>
    );
  }

  if (loading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#64748b' }}>Analyzing file...</div>;
  if (error) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ef4444' }}>Error: {error}</div>;

  // Compute statistics
  const stats = headers.map((h, col) => {
    const values = data.map(row => row[col]).filter(v => v !== '' && v !== null && v !== undefined);
    const nums = values.map(v => Number(v)).filter(v => !isNaN(v));
    const isNumeric = nums.length > 0 && nums.length >= values.length * 0.5;
    if (isNumeric) {
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      const sorted = [...nums].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      return {
        type: 'numeric',
        count: values.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        sum: sum.toFixed(2),
      };
    } else {
      const unique = new Set(values.map(String));
      return {
        type: 'categorical',
        count: values.length,
        unique: unique.size,
        top: Array.from(unique).slice(0, 5).join(', '),
      };
    }
  });

  const sorted = sortCol !== null
    ? [...data].sort((a, b) => {
        const av = a[sortCol!]; const bv = b[sortCol!];
        const an = Number(av); const bn = Number(bv);
        const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  const numericCols = stats.map((s, i) => s.type === 'numeric' ? i : -1).filter(i => i >= 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f97316"><rect x="3" y="14" width="4" height="7" rx="1"/><rect x="10" y="10" width="4" height="11" rx="1"/><rect x="17" y="5" width="4" height="16" rx="1"/></svg>
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{fileName}</span>
        <div style={{ display: 'flex', gap: 2, background: '#0f172a', borderRadius: 6, padding: 2 }}>
          {(['table', 'stats', 'chart'] as const).map(v => (
            <button key={v} style={{ padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: view === v ? '#f97316' : 'transparent', color: view === v ? '#fff' : '#94a3b8' }}
              onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {view === 'table' && (
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ ...dCellStyle, background: '#1e293b', color: '#64748b', fontWeight: 600, width: 40, position: 'sticky', top: 0 }}>#</th>
                {headers.map((h, i) => (
                  <th key={i} style={{ ...dCellStyle, background: '#1e293b', color: '#f97316', fontWeight: 600, cursor: 'pointer', position: 'sticky', top: 0 }}
                    onClick={() => {
                      if (sortCol === i) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortCol(i); setSortDir('asc'); }
                    }}>
                    {h} {sortCol === i ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 500).map((row, i) => (
                <tr key={i}>
                  <td style={{ ...dCellStyle, background: '#1e293b', color: '#64748b', textAlign: 'center' }}>{i + 1}</td>
                  {headers.map((_, col) => {
                    const v = row[col];
                    const isNum = !isNaN(Number(v)) && v !== '';
                    return (
                      <td key={col} style={{ ...dCellStyle, color: isNum ? '#f97316' : '#e2e8f0', textAlign: isNum ? 'right' : 'left' }}>
                        {v !== undefined && v !== '' ? String(v) : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === 'stats' && (
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {stats.map((s: any, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 12, background: '#1e293b', border: '1px solid #334155' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{headers[i]}</div>
                <div style={{ fontSize: 11, color: s.type === 'numeric' ? '#f97316' : '#8b5cf6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{s.type}</div>
                {s.type === 'numeric' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div>Min: <strong style={{ color: '#f97316' }}>{s.min}</strong></div>
                    <div>Max: <strong style={{ color: '#f97316' }}>{s.max}</strong></div>
                    <div>Mean: <strong style={{ color: '#f97316' }}>{s.mean}</strong></div>
                    <div>Median: <strong style={{ color: '#f97316' }}>{s.median}</strong></div>
                    <div>Sum: <strong style={{ color: '#f97316' }}>{s.sum}</strong></div>
                    <div>Count: <strong style={{ color: '#f97316' }}>{s.count}</strong></div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12 }}>
                    <div>Count: <strong>{s.count}</strong></div>
                    <div>Unique: <strong>{s.unique}</strong></div>
                    <div style={{ marginTop: 6, color: '#94a3b8' }}>Top values: {s.top}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'chart' && (
          <div style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Bar Charts</h3>
            {numericCols.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No numeric columns to chart</div>
            ) : numericCols.slice(0, 3).map(col => {
              const nums = data.slice(0, 30).map(row => Number(row[col]) || 0);
              const max = Math.max(...nums, 1);
              return (
                <div key={col} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f97316', marginBottom: 10 }}>{headers[col]}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {nums.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#64748b', width: 30, textAlign: 'right' }}>{i + 1}</span>
                        <div style={{ flex: 1, height: 18, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(v / max) * 100}%`, background: 'linear-gradient(90deg, #f97316, #ef4444)', borderRadius: 4, transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#f97316', width: 60, fontVariantNumeric: 'tabular-nums' }}>{v.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 16px', fontSize: 11, color: '#64748b', background: '#0f172a', borderTop: '1px solid #1e293b' }}>
        <span>{data.length} rows × {headers.length} columns</span>
        <span>{fileName}</span>
      </div>
    </div>
  );
};

const dCellStyle: React.CSSProperties = {
  padding: '5px 10px',
  border: '1px solid #1e293b',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 200,
};

export default DataAnalyzerApp;
