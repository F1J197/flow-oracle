import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { debugLogger } from '@/utils/debugLogger';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error details
    debugLogger.error('ErrorBoundary caught error', error.message);

    // Report to external service in production
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Placeholder for external error reporting
    if (process.env.NODE_ENV === 'production') {
      console.error('Production error:', { error, errorInfo });
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1
      });
    } else {
      // Too many retries, suggest reload
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleDownloadLogs = () => {
    const logs = debugLogger.exportLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquidity-terminal-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert className="border-red-500 bg-black text-white">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-500 font-semibold">
              {this.props.fallbackTitle || 'Terminal Error'}
            </AlertTitle>
            <AlertDescription className="text-gray-300 mt-2">
              A critical error occurred in the LIQUIDITY² Terminal. 
              Please try refreshing or contact support if the issue persists.
            </AlertDescription>
            
            {this.props.showDetails && this.state.error && (
              <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
                <p className="text-xs text-red-400 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={this.handleRetry}
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={this.handleReload}
                className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-black"
              >
                Reload
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={this.handleDownloadLogs}
                className="border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black"
              >
                <Download className="w-3 h-3 mr-1" />
                Logs
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }
}