/**
 * Error Handling Service - Phase 6: Standardized Error Handling
 * Centralized error handling for the Universal Data Proxy architecture
 */

export enum ErrorLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  component: string;
  operation: string;
  indicatorId?: string;
  provider?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  level: ErrorLevel;
  message: string;
  context: ErrorContext;
  stackTrace?: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errors: Map<string, ErrorReport> = new Map();
  private maxErrors = 1000; // Keep last 1000 errors

  private constructor() {}

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Log an error with context
   */
  logError(
    level: ErrorLevel,
    message: string,
    context: ErrorContext,
    error?: Error
  ): string {
    const errorId = this.generateErrorId();
    
    const errorReport: ErrorReport = {
      id: errorId,
      level,
      message,
      context,
      stackTrace: error?.stack,
      resolved: false,
      createdAt: new Date()
    };

    this.errors.set(errorId, errorReport);
    
    // Log to console with appropriate level
    this.logToConsole(errorReport, error);
    
    // Clean up old errors if we exceed max
    this.cleanupOldErrors();
    
    return errorId;
  }

  /**
   * Specialized logging methods for common scenarios
   */
  logDataFetchError(
    provider: string,
    indicatorId: string,
    operation: string,
    error: Error
  ): string {
    return this.logError(
      ErrorLevel.ERROR,
      `Data fetch failed: ${error.message}`,
      {
        component: 'DataService',
        operation,
        indicatorId,
        provider,
        timestamp: new Date(),
        metadata: { errorType: 'data_fetch_failure' }
      },
      error
    );
  }

  logRateLimitError(
    provider: string,
    operation: string,
    resetTime?: number
  ): string {
    return this.logError(
      ErrorLevel.WARN,
      `Rate limit exceeded for ${provider}`,
      {
        component: 'RateLimiter',
        operation,
        provider,
        timestamp: new Date(),
        metadata: { resetTime, errorType: 'rate_limit_exceeded' }
      }
    );
  }

  logValidationError(
    component: string,
    operation: string,
    validationErrors: string[]
  ): string {
    return this.logError(
      ErrorLevel.WARN,
      `Validation failed: ${validationErrors.join(', ')}`,
      {
        component,
        operation,
        timestamp: new Date(),
        metadata: { validationErrors, errorType: 'validation_failure' }
      }
    );
  }

  logDatabaseError(
    operation: string,
    error: Error,
    indicatorId?: string
  ): string {
    return this.logError(
      ErrorLevel.CRITICAL,
      `Database operation failed: ${error.message}`,
      {
        component: 'Database',
        operation,
        indicatorId,
        timestamp: new Date(),
        metadata: { errorType: 'database_error' }
      },
      error
    );
  }

  /**
   * Mark an error as resolved
   */
  resolveError(errorId: string): void {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date();
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byLevel: Record<ErrorLevel, number>;
    resolved: number;
    recent: number; // last hour
  } {
    const errors = Array.from(this.errors.values());
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return {
      total: errors.length,
      byLevel: {
        [ErrorLevel.INFO]: errors.filter(e => e.level === ErrorLevel.INFO).length,
        [ErrorLevel.WARN]: errors.filter(e => e.level === ErrorLevel.WARN).length,
        [ErrorLevel.ERROR]: errors.filter(e => e.level === ErrorLevel.ERROR).length,
        [ErrorLevel.CRITICAL]: errors.filter(e => e.level === ErrorLevel.CRITICAL).length,
      },
      resolved: errors.filter(e => e.resolved).length,
      recent: errors.filter(e => e.createdAt > oneHourAgo).length
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50): ErrorReport[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get errors by component
   */
  getErrorsByComponent(component: string): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(error => error.context.component === component)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get critical errors that need immediate attention
   */
  getCriticalErrors(): ErrorReport[] {
    return Array.from(this.errors.values())
      .filter(error => error.level === ErrorLevel.CRITICAL && !error.resolved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors.clear();
  }

  /**
   * Health check for error service
   */
  getHealthStatus(): {
    isHealthy: boolean;
    criticalErrorCount: number;
    recentErrorRate: number; // errors per minute in last hour
    recommendations: string[];
  } {
    const stats = this.getErrorStats();
    const criticalErrors = this.getCriticalErrors().length;
    const recentErrorRate = stats.recent / 60; // per minute
    
    const recommendations: string[] = [];
    
    if (criticalErrors > 0) {
      recommendations.push(`${criticalErrors} critical errors need immediate attention`);
    }
    
    if (recentErrorRate > 5) {
      recommendations.push('High error rate detected - check system stability');
    }
    
    const errorsByComponent = this.groupErrorsByComponent();
    for (const [component, count] of Object.entries(errorsByComponent)) {
      if (count > 10) {
        recommendations.push(`High error count in ${component} (${count} errors)`);
      }
    }

    return {
      isHealthy: criticalErrors === 0 && recentErrorRate < 2,
      criticalErrorCount: criticalErrors,
      recentErrorRate,
      recommendations
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logToConsole(errorReport: ErrorReport, error?: Error): void {
    const logMessage = `[${errorReport.level.toUpperCase()}] ${errorReport.context.component}:${errorReport.context.operation} - ${errorReport.message}`;
    
    switch (errorReport.level) {
      case ErrorLevel.CRITICAL:
        console.error(logMessage, error);
        break;
      case ErrorLevel.ERROR:
        console.error(logMessage, error);
        break;
      case ErrorLevel.WARN:
        console.warn(logMessage);
        break;
      case ErrorLevel.INFO:
        console.info(logMessage);
        break;
    }
  }

  private cleanupOldErrors(): void {
    if (this.errors.size > this.maxErrors) {
      const sortedErrors = Array.from(this.errors.entries())
        .sort((a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime());
      
      const toDelete = sortedErrors.slice(0, this.errors.size - this.maxErrors);
      toDelete.forEach(([id]) => this.errors.delete(id));
    }
  }

  private groupErrorsByComponent(): Record<string, number> {
    const groups: Record<string, number> = {};
    
    for (const error of this.errors.values()) {
      const component = error.context.component;
      groups[component] = (groups[component] || 0) + 1;
    }
    
    return groups;
  }
}

/**
 * Utility functions for error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: Omit<ErrorContext, 'timestamp'>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const errorHandler = ErrorHandlingService.getInstance();
    
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.logError(
        ErrorLevel.ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        { ...context, timestamp: new Date() },
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  };
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          reject(error);
          return;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  });
}

export default ErrorHandlingService;