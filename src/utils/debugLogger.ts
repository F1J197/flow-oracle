/**
 * Debug Logger for Application Initialization
 * Provides detailed logging for troubleshooting white screen issues
 */

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private isEnabled = true;

  log(level: LogEntry['level'], category: string, message: string, data?: any) {
    if (!this.isEnabled) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stack: level === 'error' ? new Error().stack : undefined
    };

    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with formatting
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  getLogs(category?: string, level?: LogEntry['level']): LogEntry[] {
    let filtered = this.logs;
    
    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    
    return filtered;
  }

  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  clear() {
    this.logs = [];
    console.clear();
  }

  disable() {
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const debugLogger = new DebugLogger();

// Helper functions for common categories
export const appLogger = {
  initialization: (message: string, data?: any) => debugLogger.info('APP_INIT', message, data),
  routing: (message: string, data?: any) => debugLogger.info('ROUTING', message, data),
  error: (message: string, data?: any) => debugLogger.error('APP_ERROR', message, data),
};

export const engineLogger = {
  registry: (message: string, data?: any) => debugLogger.info('ENGINE_REGISTRY', message, data),
  execution: (message: string, data?: any) => debugLogger.info('ENGINE_EXEC', message, data),
  error: (message: string, data?: any) => debugLogger.error('ENGINE_ERROR', message, data),
};

export const hookLogger = {
  mount: (hookName: string, data?: any) => debugLogger.debug('HOOK_MOUNT', `${hookName} mounting`, data),
  unmount: (hookName: string, data?: any) => debugLogger.debug('HOOK_UNMOUNT', `${hookName} unmounting`, data),
  effect: (hookName: string, message: string, data?: any) => debugLogger.debug('HOOK_EFFECT', `${hookName}: ${message}`, data),
  error: (hookName: string, message: string, data?: any) => debugLogger.error('HOOK_ERROR', `${hookName}: ${message}`, data),
};
