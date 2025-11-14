import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.state = { hasError: true, error, errorInfo };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '2rem auto',
          background: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#991b1b', marginBottom: '1rem' }}>
            ⚠️ Si è verificato un errore
          </h1>
          <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
            Ci scusiamo per l'inconveniente. Prova a ricaricare la pagina.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Ricarica Pagina
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#991b1b', fontWeight: '600' }}>
                Dettagli tecnici (solo in sviluppo)
              </summary>
              <pre style={{
                background: '#1f2937',
                color: '#f3f4f6',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.875rem',
                marginTop: '1rem'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
