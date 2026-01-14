/**
 * Server-safe logger that doesn't import React Native
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log context for categorization
export type LogContext = string;

// Log data structure
export interface LogData {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: any;
  error?: Error;
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  isDevelopment: boolean;
  enableJsonLogs: boolean;
}

// Default configuration
const config: LoggerConfig = {
  level: (process.env.EXPO_PUBLIC_LOG_LEVEL as LogLevel) || 'info',
  isDevelopment: process.env.NODE_ENV !== 'production',
  enableJsonLogs: process.env.EXPO_PUBLIC_LOG_FORMAT === 'json',
};

// Log level priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Check if we should log based on level
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
}

// Format log message
function formatLog(data: LogData): string {
  if (config.enableJsonLogs) {
    return JSON.stringify({
      ...data,
      error: data.error ? {
        message: data.error.message,
        stack: data.error.stack,
        name: data.error.name,
      } : undefined,
    });
  }

  // Terminal-friendly format with colors
  const levelColors: Record<LogLevel, string> = {
    debug: COLORS.dim,
    info: COLORS.blue,
    warn: COLORS.yellow,
    error: COLORS.red,
  };

  const color = levelColors[data.level];
  const contextStr = data.context ? `[${data.context}]` : '';
  const dataStr = data.data ? ` ${JSON.stringify(data.data)}` : '';
  const errorStr = data.error ? `\n${data.error.stack || data.error.message}` : '';

  return `${color}${data.timestamp} ${data.level.toUpperCase()} ${contextStr} ${data.message}${dataStr}${errorStr}${COLORS.reset}`;
}

// Core logging function
function logMessage(level: LogLevel, message: string, context?: LogContext, data?: any) {
  if (!shouldLog(level)) return;

  const logData: LogData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    data: data instanceof Error ? undefined : data,
    error: data instanceof Error ? data : undefined,
  };

  const formatted = formatLog(logData);

  // Output to console
  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

// Domain-specific logging helpers
const authLogger = {
  login: (message: string, data?: any) => logMessage('info', message, 'AUTH', data),
  signup: (message: string, data?: any) => logMessage('info', message, 'AUTH', data),
  logout: (message: string, data?: any) => logMessage('info', message, 'AUTH', data),
  oauth: (message: string, data?: any) => logMessage('info', message, 'AUTH_OAUTH', data),
  error: (message: string, error: any) => logMessage('error', message, 'AUTH', error),
  debug: (message: string, data?: any) => logMessage('debug', message, 'AUTH', data),
};

const apiLogger = {
  request: (message: string, data?: any) => logMessage('info', message, 'API', data),
  response: (message: string, data?: any) => logMessage('info', message, 'API', data),
  error: (message: string, error: any) => logMessage('error', message, 'API', error),
};

const storeLogger = {
  update: (message: string, data?: any) => logMessage('debug', message, 'STORE', data),
  error: (message: string, error: any) => logMessage('error', message, 'STORE', error),
  debug: (message: string, data?: any) => logMessage('debug', message, 'STORE', data),
};

// Main logger interface
export const log = {
  debug: (message: string, context?: LogContext, data?: any) => logMessage('debug', message, context, data),
  info: (message: string, context?: LogContext, data?: any) => logMessage('info', message, context, data),
  warn: (message: string, context?: LogContext, data?: any) => logMessage('warn', message, context, data),
  error: (message: string, context?: LogContext, error?: any) => logMessage('error', message, context, error),
  
  // Domain-specific loggers
  auth: authLogger,
  api: apiLogger,
  store: storeLogger,
};