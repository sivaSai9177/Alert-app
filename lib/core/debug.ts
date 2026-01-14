// lib/core/debug.ts
import { Platform } from 'react-native';

// Debug levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

// Current log level - can be configured via environment or settings
const currentLogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;

// Color codes for console output
const LOG_COLORS = {
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.INFO]: '\x1b[36m',  // Cyan
  [LogLevel.DEBUG]: '\x1b[32m', // Green
  [LogLevel.TRACE]: '\x1b[90m', // Gray
};

const RESET_COLOR = '\x1b[0m';

// Log entry type
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  id?: string;
}

// Log storage for debugging
const LOG_STORAGE: LogEntry[] = [];

const MAX_LOG_STORAGE = 1000;

// Enhanced logger class
class Logger {
  private component: string;

  constructor(component: string) {
    this.component = component;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (level > currentLogLevel) return;

    const timestamp = new Date();
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36),
      timestamp,
      level,
      component: this.component,
      message,
      data,
    };

    // Store log entry
    LOG_STORAGE.push(logEntry);
    if (LOG_STORAGE.length > MAX_LOG_STORAGE) {
      LOG_STORAGE.shift();
    }

    // Format log message
    const prefix = `[${timestamp.toISOString()}] [${LogLevel[level]}] [${this.component}]`;
    const color = Platform.OS === 'web' ? LOG_COLORS[level] : '';
    const resetColor = Platform.OS === 'web' ? RESET_COLOR : '';

    // Console output
    const consoleMessage = `${color}${prefix} ${message}${resetColor}`;
    
    switch (level) {
      case LogLevel.ERROR:
        if (data !== undefined && data !== null) {
          console.error(consoleMessage, data);
        } else {
          console.error(consoleMessage);
        }
        break;
      case LogLevel.WARN:
        if (data !== undefined && data !== null) {
          console.warn(consoleMessage, data);
        } else {
          console.warn(consoleMessage);
        }
        break;
      default:
        if (data !== undefined && data !== null) {
          console.log(consoleMessage, data);
        } else {
          console.log(consoleMessage);
        }
    }

    // In production, send to error reporting service
    if (!__DEV__ && level <= LogLevel.ERROR) {
      this.reportError(message, data, level);
    }
  }

  private reportError(message: string, data: any, level: LogLevel) {
    // TODO: Integrate with crash reporting service (e.g., Sentry, Bugsnag)
    // For now, just log to console
    console.error('Production error:', { component: this.component, message, data, level });
  }

  error(message: string, error?: Error | any) {
    this.log(LogLevel.ERROR, message, error);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  trace(message: string, data?: any) {
    this.log(LogLevel.TRACE, message, data);
  }

  // Performance timing
  time(label: string) {
    if (__DEV__) {
      console.time(`[${this.component}] ${label}`);
    }
  }

  timeEnd(label: string) {
    if (__DEV__) {
      console.timeEnd(`[${this.component}] ${label}`);
    }
  }

  // Group related logs
  group(label: string) {
    if (__DEV__) {
      console.group(`[${this.component}] ${label}`);
    }
  }

  groupEnd() {
    if (__DEV__) {
      console.groupEnd();
    }
  }
}

// Factory function to create loggers
export function createLogger(component: string): Logger {
  return new Logger(component);
}

// Export log storage for debugging tools
export function getLogHistory(filter?: {
  component?: string;
  level?: LogLevel;
  startTime?: Date;
  endTime?: Date;
}) {
  let logs = [...LOG_STORAGE];

  if (filter?.component) {
    logs = logs.filter(log => log.component === filter.component);
  }

  if (filter?.level !== undefined) {
    logs = logs.filter(log => log.level <= filter.level);
  }

  if (filter?.startTime) {
    logs = logs.filter(log => log.timestamp >= filter.startTime);
  }

  if (filter?.endTime) {
    logs = logs.filter(log => log.timestamp <= filter.endTime);
  }

  return logs;
}

// Clear log history
export function clearLogHistory() {
  LOG_STORAGE.length = 0;
}

// Export log history as text
export function exportLogs(): string {
  return LOG_STORAGE.map(log => {
    const timestamp = log.timestamp.toISOString();
    const level = LogLevel[log.level];
    const data = log.data ? JSON.stringify(log.data, null, 2) : '';
    return `[${timestamp}] [${level}] [${log.component}] ${log.message} ${data}`;
  }).join('\n');
}

// Network request interceptor for debugging
export function setupNetworkDebugging() {
  if (!__DEV__) return;

  const logger = createLogger('Network');

  // Intercept fetch
  const originalFetch = global.fetch;
  global.fetch = async function(...args) {
    const [url, options] = args;
    const method = options?.method || 'GET';
    
    logger.debug(`${method} ${url}`, {
      headers: options?.headers,
      body: options?.body,
    });

    const startTime = Date.now();

    try {
      const response = await originalFetch.apply(this, args);
      const duration = Date.now() - startTime;
      
      logger.debug(`${method} ${url} - ${response.status} (${duration}ms)`, {
        status: response.status,
        statusText: response.statusText,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`${method} ${url} - Failed (${duration}ms)`, error);
      throw error;
    }
  };
}

// Authentication flow debugging
export function createAuthLogger() {
  const logger = createLogger('Auth');
  
  return {
    logOAuthStart: (provider: string) => {
      logger.info(`Starting OAuth flow with ${provider}`);
    },
    
    logOAuthCallback: (provider: string, success: boolean, error?: any) => {
      if (success) {
        logger.info(`OAuth callback successful for ${provider}`);
      } else {
        logger.error(`OAuth callback failed for ${provider}`, error);
      }
    },
    
    logProfileCompletion: (needsCompletion: boolean) => {
      logger.info(`Profile completion required: ${needsCompletion}`);
    },
    
    logSessionUpdate: (user: any, session: any) => {
      logger.debug('Session updated', { userId: user?.id, sessionId: session?.id });
    },
    
    logNavigationDecision: (destination: string, reason: string) => {
      logger.info(`Navigating to ${destination}: ${reason}`);
    },
  };
}

// Initialize network debugging in development
if (__DEV__) {
  setupNetworkDebugging();
}