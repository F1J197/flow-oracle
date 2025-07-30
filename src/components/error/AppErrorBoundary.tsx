import React, { Component, ErrorInfo, ReactNode } from 'react';
import { debugLogger } from '@/utils/debugLogger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bug, Download } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class AppErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

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
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    debugLogger.error('ERROR_BOUNDARY', 'React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    this.setState({
      error,
      errorInfo
    });

    // Report to external service if needed
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Could integrate with error reporting service here
    console.error('Error reported to boundary:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      debugLogger.info('ERROR_BOUNDARY', `Retrying application (attempt ${this.state.retryCount + 1})`);
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      debugLogger.warn('ERROR_BOUNDARY', 'Max retries reached, requiring page reload');
      window.location.reload();
    }
  };

  private handleReload = () => {
    debugLogger.info('ERROR_BOUNDARY', 'Manual page reload triggered');
    window.location.reload();
  };

  private handleDownloadLogs = () => {
    const logs = debugLogger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liquidity2-debug-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle = "Application Error", showDetails = true } = this.props;
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertTitle>{fallbackTitle}</AlertTitle>
              <AlertDescription>
                The application encountered an unexpected error. You can try to recover or reload the page.
              </AlertDescription>
            </Alert>

            {showDetails && this.state.error && (
              <div className="bg-card p-4 rounded-lg border">
                <h3 className="font-mono text-sm font-medium mb-2">Error Details:</h3>
                <pre className="text-xs text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-muted-foreground cursor-pointer">Stack Trace</summary>
                    <pre className="text-xs text-muted-foreground mt-2 overflow-auto max-h-60 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              {canRetry && (
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}
              
              <Button onClick={this.handleReload} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              
              <Button onClick={this.handleDownloadLogs} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Debug Logs
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Error ID: {Date.now()}</p>
              <p>Retry Count: {this.state.retryCount}/{this.maxRetries}</p>
              <p>Time: {new Date().toISOString()}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}