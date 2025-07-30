import React, { Component, ReactNode } from 'react';

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-bg-primary text-text-primary font-mono p-6 border border-neon-orange/30">
          <div className="space-y-4">
            <div className="text-neon-orange text-lg font-bold">
              ⚠️ COMPONENT ERROR
            </div>
            
            <div className="bg-bg-secondary p-4 border border-glass-border">
              <div className="text-sm text-text-secondary mb-2">ERROR MESSAGE:</div>
              <div className="text-neon-orange text-sm font-mono">
                {this.state.error?.message || 'Unknown error occurred'}
              </div>
            </div>

            {this.state.errorInfo && (
              <div className="bg-bg-secondary p-4 border border-glass-border">
                <div className="text-sm text-text-secondary mb-2">STACK TRACE:</div>
                <pre className="text-xs text-text-muted overflow-auto max-h-32">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="bg-neon-teal/20 text-neon-teal border border-neon-teal/30 px-4 py-2 text-sm font-mono hover:bg-neon-teal/30 transition-colors"
            >
              RETRY COMPONENT
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}