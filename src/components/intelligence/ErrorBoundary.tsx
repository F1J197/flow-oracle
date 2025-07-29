import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // Log the error
    console.error('Intelligence Engine Error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-tile p-6 border border-critical/30 bg-critical/5">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-critical" />
            <h3 className="text-lg font-semibold text-critical">
              Intelligence Engine Error
            </h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-text-secondary text-sm">
              An error occurred in the Intelligence Engine. The system will attempt to recover automatically.
            </p>
            
            {this.state.error && (
              <div className="bg-bg-secondary p-3 rounded font-mono text-xs text-text-muted">
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}
            
            <button
              onClick={this.handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-btc-primary/20 hover:bg-btc-primary/30 border border-btc-primary/30 rounded text-btc-primary text-sm transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Engine</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}