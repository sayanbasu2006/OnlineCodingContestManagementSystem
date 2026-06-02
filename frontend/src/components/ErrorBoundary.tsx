import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error captured by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <span className="error-boundary-icon">🔥</span>
            <div className="error-boundary-header">
              <h1>Something Went Wrong</h1>
              <p>
                An unexpected error occurred in CodeArena. You can try reloading the application
                or return back to the main dashboard.
              </p>
            </div>
            <div className="error-boundary-actions">
              <button className="btn-primary" onClick={this.handleReload}>
                🔄 Reload App
              </button>
              <a href="/" className="btn-secondary" style={{ textDecoration: 'none', lineHeight: '2.4rem', padding: '0.8rem 2rem', borderRadius: '12px' }}>
                🏠 Go to Dashboard
              </a>
            </div>
            {this.state.error && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && <pre>{this.state.errorInfo.componentStack}</pre>}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
