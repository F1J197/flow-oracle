/**
 * Production Logger - Safe logging utility for production environments
 * Replaces console.log statements with proper logging infrastructure
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private readonly isProduction = import.meta.env.PROD;

  static getInstance(): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger();
    }
    return ProductionLogger.instance;
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, data?: any, context?: string): void {
    if (!this.isProduction) {
      this.addLog(LogLevel.DEBUG, message, context, data);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.INFO, message, context, data);
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: any, context?: string): void {
    this.addLog(LogLevel.WARN, message, context, data);
  }

  /**
   * Log errors
   */
  error(message: string, error?: Error, context?: string): void {
    this.addLog(LogLevel.ERROR, message, context, undefined, error);
  }

  /**
   * Log critical errors that require immediate attention
   */
  critical(message: string, error?: Error, context?: string): void {
    this.addLog(LogLevel.CRITICAL, message, context, undefined, error);
    
    // In production, send critical errors to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring({
        level: 'critical',
        message,
        error: error?.message,
        stack: error?.stack,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Add log entry
   */
  private addLog(level: LogLevel, message: string, context?: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      data,
      error
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console in development
    if (!this.isProduction) {
      this.outputToConsole(entry);
    }
  }

  /**
   * Output log entry to console (development only)
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] ${LogLevel[entry.level]}`;
    const contextStr = entry.context ? ` [${entry.context}]` : '';
    const message = `${prefix}${contextStr}: ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.error || entry.data);
        break;
    }
  }

  /**
   * Send critical errors to monitoring service
   */
  private sendToMonitoring(data: any): void {
    // In a real production environment, this would send to
    // services like Sentry, LogRocket, or custom monitoring
    try {
      // Example: fetch('/api/monitoring/error', { method: 'POST', body: JSON.stringify(data) });
    } catch (error) {
      // Silent fail to prevent infinite loops
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level !== undefined) {
      filteredLogs = this.logs.filter(log => log.level >= level);
    }

    return filteredLogs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = ProductionLogger.getInstance();

// Convenience functions for common operations
export const logDebug = (message: string, data?: any, context?: string) => 
  logger.debug(message, data, context);

export const logInfo = (message: string, data?: any, context?: string) => 
  logger.info(message, data, context);

export const logWarn = (message: string, data?: any, context?: string) => 
  logger.warn(message, data, context);

export const logError = (message: string, error?: Error, context?: string) => 
  logger.error(message, error, context);

export const logCritical = (message: string, error?: Error, context?: string) => 
  logger.critical(message, error, context);

export default logger;