import React, { useState, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';
import * as XLSX from 'xlsx';

const SpreadsheetApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  if (!win.filePath) {
    return <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/spreadsheet.html" />;
  }
  return <SpreadsheetViewer filePath={win.filePath} />;
};

const SpreadsheetViewer: React.FC<{ filePath: string }> = ({ filePath }) => {
  const [data, setData] = useState<Record<string, any[][]> | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileName = filePath.split('/').pop() || 'Spreadsheet';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  useEffect(() => {
    const parseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(filePath)}`;
        const response = await fetch(url);

        let workbook: XLSX.WorkBook;
        if (ext === 'csv' || ext === 'tsv') {
          const text = await response.text();
          workbook = XLSX.read(text, { type: 'string' });
        } else {
          const arrayBuffer = await response.arrayBuffer();
          workbook = XLSX.read(arrayBuffer, { type: 'array' });
        }

        setSheets(workbook.SheetNames);
        const allData: Record<string, any[][]> = {};
        workbook.SheetNames.forEach(name => {
          allData[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }) as any[][];
        });
        setData(allData);
      } catch (err: any) {
        console.error('Spreadsheet parse error:', err);
        setError('Unable to parse this spreadsheet file.');
      }
      setLoading(false);
    };
    parseData();
  }, [filePath, ext]);

  if (loading) return <div style={s.loading}><div style={s.spinner} /><span>Loading spreadsheet...</span></div>;
  if (error) return <div style={s.error}>{error}</div>;
  if (!data) return <div style={s.loading}>No data</div>;

  const currentSheetName = sheets[activeSheet];
  const currentData = data[currentSheetName] || [];
  const maxCols = Math.max(...currentData.map(row => Array.isArray(row) ? row.length : 1), 1);
  const normalizedData = currentData.map(row => {
    const arr = Array.isArray(row) ? row : [row];
    while (arr.length < maxCols) arr.push('');
    return arr;
  });

  const colLetter = (i: number) => {
    let name = '';
    i++;
    while (i > 0) {
      const mod = (i - 1) % 26;
      name = String.fromCharCode(65 + mod) + name;
      i = Math.floor((i - 1) / 26);
    }
    return name;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f1419', color: '#e8e8ed' }}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.fileIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
          <div style={{ fontSize: 11, color: '#6b6b7b' }}>
            {currentData.length} rows · {maxCols} columns{sheets.length > 1 ? ` · ${sheets.length} sheets` : ''}
          </div>
        </div>
      </div>

      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div style={s.sheetTabs}>
          {sheets.map((sheet, i) => (
            <button key={i}
              style={{
                ...s.sheetTab,
                background: i === activeSheet ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.03)',
                color: i === activeSheet ? '#fff' : '#b8b8c8',
                borderColor: i === activeSheet ? 'transparent' : '#2a2a35',
              }}
              onClick={() => setActiveSheet(i)}>
              {sheet}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, background: '#151820', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ ...cellStyle, ...headerStyle, minWidth: 40, position: 'sticky', top: 0, left: 0, zIndex: 3 }}>#</th>
              {Array.from({ length: maxCols }, (_, i) => (
                <th key={i} style={{ ...cellStyle, ...headerStyle, minWidth: 100, position: 'sticky', top: 0, zIndex: 2 }}>
                  {colLetter(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedData.map((row, i) => (
              <tr key={i}>
                <td style={{ ...cellStyle, ...rowNumStyle, position: 'sticky', left: 0, zIndex: 1 }}>{i + 1}</td>
                {row.map((cell, j) => (
                  <td key={j} style={{
                    ...cellStyle,
                    background: i % 2 === 0 ? '#151820' : '#191d26',
                    color: !isNaN(Number(cell)) && cell !== '' ? '#10b981' : '#e8e8ed',
                    textAlign: !isNaN(Number(cell)) && cell !== '' ? 'right' : 'left',
                  }}>
                    {cell !== undefined && cell !== null ? String(cell) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #24283b',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 300,
};
const headerStyle: React.CSSProperties = {
  background: '#1e2230',
  color: '#10b981',
  fontWeight: 700,
  textAlign: 'center',
};
const rowNumStyle: React.CSSProperties = {
  background: '#1e2230',
  color: '#6b6b7b',
  fontWeight: 600,
  textAlign: 'center',
  minWidth: 40,
};

const s: Record<string, React.CSSProperties> = {
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #2a2a35', background: '#151820' },
  fileIcon: { width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sheetTabs: { display: 'flex', gap: 6, padding: '10px 16px', background: '#151820', borderBottom: '1px solid #2a2a35', overflowX: 'auto' },
  sheetTab: { padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', whiteSpace: 'nowrap' },
  loading: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#0f1419', color: '#6b6b7b' },
  spinner: { width: 32, height: 32, border: '3px solid #2a2a35', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  error: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1419', color: '#ef4444', padding: 20, textAlign: 'center' as const },
};

export default SpreadsheetApp;
