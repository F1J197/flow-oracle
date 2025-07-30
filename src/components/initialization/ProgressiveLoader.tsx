import React, { useState, useEffect } from 'react';
import { debugLogger } from '@/utils/debugLogger';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

export interface LoadingStep {
  id: string;
  name: string;
  description: string;
  weight: number; // Relative weight for progress calculation
  timeout?: number; // Optional timeout in ms
}

export interface ProgressiveLoaderProps {
  steps: LoadingStep[];
  onStepComplete: (stepId: string) => Promise<void>;
  onComplete: () => void;
  onError: (error: Error, stepId?: string) => void;
  children: React.ReactNode;
  autoStart?: boolean;
  showProgress?: boolean;
  fallbackDelay?: number; // Delay before showing fallback UI
}

interface StepStatus {
  status: 'pending' | 'loading' | 'completed' | 'failed';
  error?: Error;
  startTime?: number;
  endTime?: number;
}

export function ProgressiveLoader({
  steps,
  onStepComplete,
  onComplete,
  onError,
  children,
  autoStart = true,
  showProgress = true,
  fallbackDelay = 10000 // 10 seconds
}: ProgressiveLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>(() =>
    steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: { status: 'pending' }
    }), {})
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Calculate overall progress
  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const completedWeight = steps.reduce((sum, step) => {
    const status = stepStatuses[step.id];
    return sum + (status.status === 'completed' ? step.weight : 0);
  }, 0);
  const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

  // Show fallback UI if loading takes too long
  useEffect(() => {
    if (!isCompleted && fallbackDelay > 0) {
      const timer = setTimeout(() => {
        debugLogger.warn('PROGRESSIVE_LOADER', `Showing fallback UI after ${fallbackDelay}ms`);
        setShowFallback(true);
      }, fallbackDelay);

      return () => clearTimeout(timer);
    }
  }, [isCompleted, fallbackDelay]);

  // Auto-start loading
  useEffect(() => {
    if (autoStart && currentStepIndex === -1) {
      startLoading();
    }
  }, [autoStart]);

  const startLoading = async () => {
    debugLogger.info('PROGRESSIVE_LOADER', 'Starting progressive loading', {
      stepsCount: steps.length,
      retryCount
    });

    setCurrentStepIndex(0);
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        debugLogger.debug('PROGRESSIVE_LOADER', `Starting step: ${step.name}`, {
          stepId: step.id,
          index: i,
          timeout: step.timeout
        });

        // Update step status to loading
        setStepStatuses(prev => ({
          ...prev,
          [step.id]: {
            status: 'loading',
            startTime: Date.now()
          }
        }));

        setCurrentStepIndex(i);

        // Execute step with optional timeout
        if (step.timeout) {
          await Promise.race([
            onStepComplete(step.id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Step ${step.name} timed out after ${step.timeout}ms`)), step.timeout)
            )
          ]);
        } else {
          await onStepComplete(step.id);
        }

        // Mark step as completed
        setStepStatuses(prev => ({
          ...prev,
          [step.id]: {
            status: 'completed',
            startTime: prev[step.id].startTime,
            endTime: Date.now()
          }
        }));

        debugLogger.debug('PROGRESSIVE_LOADER', `Completed step: ${step.name}`, {
          stepId: step.id,
          duration: Date.now() - (stepStatuses[step.id].startTime || 0)
        });

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        debugLogger.error('PROGRESSIVE_LOADER', `Failed step: ${step.name}`, {
          stepId: step.id,
          error: err.message,
          retryCount
        });

        // Mark step as failed
        setStepStatuses(prev => ({
          ...prev,
          [step.id]: {
            status: 'failed',
            error: err,
            startTime: prev[step.id].startTime,
            endTime: Date.now()
          }
        }));

        onError(err, step.id);
        return; // Stop loading on error
      }
    }

    // All steps completed
    debugLogger.info('PROGRESSIVE_LOADER', 'All loading steps completed', {
      totalDuration: Date.now() - (stepStatuses[steps[0]?.id]?.startTime || 0),
      retryCount
    });

    setIsCompleted(true);
    setCurrentStepIndex(-1);
    onComplete();
  };

  const handleRetry = () => {
    debugLogger.info('PROGRESSIVE_LOADER', 'Retrying progressive loading');
    
    setRetryCount(prev => prev + 1);
    setCurrentStepIndex(-1);
    setIsCompleted(false);
    setShowFallback(false);
    
    // Reset all step statuses
    setStepStatuses(steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: { status: 'pending' }
    }), {}));

    // Restart loading
    setTimeout(startLoading, 100);
  };

  const handleSkipToApp = () => {
    debugLogger.warn('PROGRESSIVE_LOADER', 'User skipped loading - showing app in potentially incomplete state');
    setIsCompleted(true);
    onComplete();
  };

  // Show completed app
  if (isCompleted) {
    return <>{children}</>;
  }

  // Show loading UI
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">LIQUIDITY²</h1>
          <p className="text-muted-foreground">Loading financial intelligence platform...</p>
        </div>

        {showProgress && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            <div className="space-y-2">
              {steps.map((step, index) => {
                const status = stepStatuses[step.id];
                const isCurrent = index === currentStepIndex;
                const isCompleted = status.status === 'completed';
                const isFailed = status.status === 'failed';
                
                return (
                  <div key={step.id} className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 flex items-center justify-center">
                      {isFailed ? (
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                      ) : isCompleted ? (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-muted" />
                      )}
                    </div>
                    <div className={`flex-1 ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-xs">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error handling */}
        {Object.values(stepStatuses).some(s => s.status === 'failed') && (
          <Alert variant="destructive">
            <AlertDescription>
              Loading failed. You can retry or continue with limited functionality.
            </AlertDescription>
          </Alert>
        )}

        {/* Fallback controls */}
        {(showFallback || Object.values(stepStatuses).some(s => s.status === 'failed')) && (
          <div className="flex gap-3">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            
            {showFallback && (
              <Button onClick={handleSkipToApp} variant="outline">
                Continue Anyway
              </Button>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          {retryCount > 0 && <p>Retry #{retryCount}</p>}
          <p>Progress: {Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}