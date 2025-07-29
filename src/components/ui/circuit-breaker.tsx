import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  maxFailures?: number;
  timeout?: number;
  resetTimeout?: number;
  onStateChange?: (state: CircuitState) => void;
  className?: string;
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
  lastError?: Error;
}

export function CircuitBreaker({
  children,
  fallback,
  maxFailures = 5,
  timeout = 30000, // 30 seconds
  resetTimeout = 60000, // 1 minute
  onStateChange,
  className
}: CircuitBreakerProps) {
  const [circuitState, setCircuitState] = useState<CircuitBreakerState>({
    state: 'closed',
    failureCount: 0,
    lastFailureTime: 0
  });

  const [retryAttempt, setRetryAttempt] = useState(0);

  const updateState = useCallback((newState: Partial<CircuitBreakerState>) => {
    setCircuitState(prev => {
      const updated = { ...prev, ...newState };
      if (updated.state !== prev.state) {
        onStateChange?.(updated.state);
      }
      return updated;
    });
  }, [onStateChange]);

  // Auto-recovery logic
  useEffect(() => {
    if (circuitState.state === 'open' && circuitState.lastFailureTime > 0) {
      const timeSinceFailure = Date.now() - circuitState.lastFailureTime;
      
      if (timeSinceFailure >= resetTimeout) {
        updateState({ state: 'half-open' });
      } else {
        const timeoutId = setTimeout(() => {
          updateState({ state: 'half-open' });
        }, resetTimeout - timeSinceFailure);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [circuitState.state, circuitState.lastFailureTime, resetTimeout, updateState]);

  const handleFailure = useCallback((error: Error) => {
    const newFailureCount = circuitState.failureCount + 1;
    const newState: Partial<CircuitBreakerState> = {
      failureCount: newFailureCount,
      lastFailureTime: Date.now(),
      lastError: error
    };

    if (newFailureCount >= maxFailures) {
      newState.state = 'open';
    }

    updateState(newState);
  }, [circuitState.failureCount, maxFailures, updateState]);

  const handleSuccess = useCallback(() => {
    updateState({
      state: 'closed',
      failureCount: 0,
      lastFailureTime: 0,
      lastError: undefined
    });
  }, [updateState]);

  const handleRetry = useCallback(() => {
    setRetryAttempt(prev => prev + 1);
    updateState({ state: 'half-open' });
  }, [updateState]);

  const handleDismiss = useCallback(() => {
    updateState({
      state: 'closed',
      failureCount: 0,
      lastError: undefined
    });
  }, [updateState]);

  // Render circuit breaker UI based on state
  const renderCircuitState = () => {
    const { state, lastError } = circuitState;

    if (state === 'open') {
      return (
        <div className={cn("space-y-4", className)}>
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <div className="font-medium">Service Temporarily Unavailable</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Too many failures detected. System will retry automatically.
                </div>
                {lastError && (
                  <div className="text-xs text-red-400 mt-2 font-mono">
                    {lastError.message}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
          
          {fallback && (
            <div className="p-4 border border-glass-border rounded-lg bg-glass-bg">
              {fallback}
            </div>
          )}
        </div>
      );
    }

    if (state === 'half-open') {
      return (
        <div className={cn("space-y-4", className)}>
          <Alert className="border-yellow-500/20 bg-yellow-500/10">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <div className="font-medium">Attempting Recovery</div>
              <div className="text-sm text-muted-foreground">
                Testing service availability...
              </div>
            </AlertDescription>
          </Alert>
          {children}
        </div>
      );
    }

    return children;
  };

  return (
    <div className="circuit-breaker-container">
      {renderCircuitState()}
    </div>
  );
}

// Hook for manual circuit breaker control
export function useCircuitBreaker({
  maxFailures = 5,
  resetTimeout = 60000
}: {
  maxFailures?: number;
  resetTimeout?: number;
} = {}) {
  const [state, setState] = useState<CircuitBreakerState>({
    state: 'closed',
    failureCount: 0,
    lastFailureTime: 0
  });

  const recordFailure = useCallback((error: Error) => {
    const newFailureCount = state.failureCount + 1;
    setState(prev => ({
      ...prev,
      failureCount: newFailureCount,
      lastFailureTime: Date.now(),
      lastError: error,
      state: newFailureCount >= maxFailures ? 'open' : prev.state
    }));
  }, [state.failureCount, maxFailures]);

  const recordSuccess = useCallback(() => {
    setState({
      state: 'closed',
      failureCount: 0,
      lastFailureTime: 0
    });
  }, []);

  const canExecute = useCallback(() => {
    if (state.state === 'closed') return true;
    if (state.state === 'half-open') return true;
    
    // Check if we should transition from open to half-open
    const timeSinceFailure = Date.now() - state.lastFailureTime;
    if (timeSinceFailure >= resetTimeout) {
      setState(prev => ({ ...prev, state: 'half-open' }));
      return true;
    }
    
    return false;
  }, [state.state, state.lastFailureTime, resetTimeout]);

  return {
    state: state.state,
    canExecute,
    recordFailure,
    recordSuccess,
    failureCount: state.failureCount,
    lastError: state.lastError
  };
}