import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

class MobileErrorBoundary extends React.Component<
  { appName?: string; children: React.ReactNode },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[webOS] App crashed:', error, errorInfo);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          background: '#0f172a',
          color: '#e2e8f0',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: 12 }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {this.props.appName ? `${this.props.appName} crashed` : 'Something went wrong'}
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, maxWidth: 300, lineHeight: 1.55 }}>
            This app hit an error on this device. Go back to the home screen and try a different app.
          </p>
          {this.state.error && (
            <pre style={{
              fontSize: 11,
              color: '#f87171',
              background: 'rgba(248,113,113,0.08)',
              padding: '10px 14px',
              borderRadius: 8,
              maxWidth: '100%',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              marginBottom: 16,
            }}>
              {String(this.state.error.message || this.state.error)}
            </pre>
          )}
          <button onClick={this.reset} style={{
            padding: '10px 22px',
            borderRadius: 10,
            background: '#2563eb',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default MobileErrorBoundary;
