import React, { useState, useEffect } from 'react';
import { WindowState } from '../../store/useStore';
import ToolsIframeApp from './ToolsIframeApp';
import mammoth from 'mammoth';

const DocumentApp: React.FC<{ window: WindowState }> = ({ window: win }) => {
  if (!win.filePath) {
    return <ToolsIframeApp window={win} src="/repos/Tools-Hub/tools/document.html" />;
  }
  return <DocumentViewer filePath={win.filePath} />;
};

const DocumentViewer: React.FC<{ filePath: string }> = ({ filePath }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileName = filePath.split('/').pop() || 'Document';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const url = `http://localhost:3001/api/fs/serve?path=${encodeURIComponent(filePath)}`;

  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        // PDFs use native browser viewer
        if (ext === 'pdf') {
          setLoading(false);
          return;
        }

        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
      } catch (err) {
        console.error('Document parse error:', err);
        setError('Could not parse this document');
      }
      setLoading(false);
    };
    loadDocument();
  }, [filePath, ext, url]);

  if (loading) return <div style={s.loading}><div style={s.spinner} /><p>Loading document...</p></div>;
  if (error) return <div style={s.error}>{error}</div>;

  // PDF via native browser
  if (ext === 'pdf') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f1419' }}>
        <div style={s.header}>
          <div style={{ ...s.fileIcon, background: 'rgba(239,68,68,0.1)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8ed', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
            <div style={{ fontSize: 11, color: '#6b6b7b' }}>PDF document</div>
          </div>
          <a href={url} download={fileName} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, background: '#2a2a35', color: '#e8e8ed', textDecoration: 'none', border: '1px solid #3a3a45' }}>Download</a>
        </div>
        <iframe src={url} style={{ flex: 1, width: '100%', border: 'none', background: '#525659' }} title={fileName} />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f1419', color: '#e8e8ed' }}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ ...s.fileIcon, background: 'rgba(59,130,246,0.1)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
          <div style={{ fontSize: 11, color: '#6b6b7b' }}>Document</div>
        </div>
      </div>

      {/* Page */}
      <div style={{ flex: 1, overflow: 'auto', padding: '30px 40px', background: '#0a0e14' }}>
        <style>{`
          .webos-doc-page {
            width: 100%;
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff !important;
            color: #1a1a1a !important;
            border-radius: 8px;
            min-height: 1000px;
            box-shadow: 0 10px 60px rgba(0,0,0,0.6);
            padding: 72px;
            font-family: "Calibri", "Helvetica Neue", sans-serif;
            font-size: 15px;
            line-height: 1.75;
          }
          .webos-doc-page * { color: inherit; background: inherit; }
          .webos-doc-page h1 { font-size: 32px; font-weight: 700; margin: 24px 0 14px; color: #111 !important; line-height: 1.2; }
          .webos-doc-page h2 { font-size: 24px; font-weight: 700; margin: 20px 0 12px; color: #222 !important; line-height: 1.3; }
          .webos-doc-page h3 { font-size: 19px; font-weight: 600; margin: 16px 0 10px; color: #333 !important; }
          .webos-doc-page h4 { font-size: 16px; font-weight: 600; margin: 14px 0 8px; color: #333 !important; }
          .webos-doc-page p { margin: 10px 0; color: #1a1a1a !important; }
          .webos-doc-page img { max-width: 100%; height: auto; display: block; margin: 16px auto; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background: transparent !important; }
          .webos-doc-page table { border-collapse: collapse; margin: 14px 0; width: 100%; background: #ffffff !important; }
          .webos-doc-page td, .webos-doc-page th { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; color: #1a1a1a !important; background: #ffffff !important; }
          .webos-doc-page th { background: #f3f4f6 !important; font-weight: 600; }
          .webos-doc-page tr:nth-child(even) td { background: #f9fafb !important; }
          .webos-doc-page ul, .webos-doc-page ol { margin: 10px 0; padding-left: 32px; color: #1a1a1a !important; }
          .webos-doc-page li { margin: 6px 0; color: #1a1a1a !important; }
          .webos-doc-page blockquote { border-left: 4px solid #6366f1; padding: 8px 20px; margin: 14px 0; color: #555 !important; font-style: italic; background: #f9fafb !important; border-radius: 4px; }
          .webos-doc-page code { background: #f3f4f6 !important; padding: 2px 6px; border-radius: 3px; font-family: 'SF Mono', Monaco, monospace; font-size: 0.9em; color: #c2410c !important; }
          .webos-doc-page pre { background: #1f2937 !important; color: #e5e7eb !important; padding: 14px; border-radius: 6px; overflow-x: auto; font-family: 'SF Mono', Monaco, monospace; font-size: 13px; }
          .webos-doc-page a { color: #2563eb !important; text-decoration: underline; }
          .webos-doc-page strong, .webos-doc-page b { font-weight: 700; color: inherit !important; }
          .webos-doc-page em, .webos-doc-page i { font-style: italic; color: inherit !important; }
          .webos-doc-page hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
        `}</style>
        <div className="webos-doc-page" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #2a2a35', background: '#151820', color: '#e8e8ed' },
  fileIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loading: { height: '100%', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 14, background: '#0f1419', color: '#6b6b7b' },
  spinner: { width: 32, height: 32, border: '3px solid #2a2a35', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  error: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1419', color: '#ef4444', padding: 20, textAlign: 'center' as const },
};

export default DocumentApp;
