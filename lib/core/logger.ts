/**
 * Simple Logger Implementation for Development
 * Fallback logger to prevent import errors during development
 */

interface LoggerInterface {
  info: (message: string, context?: string, data?: any) => void;
  error: (message: string, context?: string, error?: any) => void;
  warn: (message: string, context?: string, data?: any) => void;
  debug: (message: string, context?: string, data?: any) => void;
  auth: {
    login: (message: string, data?: any) => void;
    signup: (message: string, data?: any) => void;
    logout: (message: string, data?: any) => void;
    oauth: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
    debug: (message: string, data?: any) => void;
    info: (message: string, data?: any) => void;
  };
  api: {
    request: (message: string, data?: any) => void;
    response: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
  };
  store: {
    update: (message: string, data?: any) => void;
    debug: (message: string, data?: any) => void;
  };
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugMode = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';

function formatLog(level: string, message: string, context?: string, data?: any): void {
  if (!isDevelopment) return;
  
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '';
  const logMessage = `${timestamp} ${level.toUpperCase()} ${prefix} ${message}`;
  
  if (level === 'error') {
    console.error(logMessage, data || '');
  } else if (level === 'warn') {
    console.warn(logMessage, data || '');
  } else if (level === 'debug' && isDebugMode) {
    console.debug(logMessage, data || '');
  } else if (level === 'info') {
    console.info(logMessage, data || '');
  }
}

export const log: LoggerInterface = {
  info: (message: string, context?: string, data?: any) => 
    formatLog('info', message, context, data),
  
  error: (message: string, context?: string, error?: any) => 
    formatLog('error', message, context, error),
  
  warn: (message: string, context?: string, data?: any) => 
    formatLog('warn', message, context, data),
  
  debug: (message: string, context?: string, data?: any) => 
    formatLog('debug', message, context, data),

  auth: {
    login: (message: string, data?: any) => 
      formatLog('info', message, 'AUTH', data),
    
    signup: (message: string, data?: any) => 
      formatLog('info', message, 'AUTH', data),
    
    logout: (message: string, data?: any) => 
      formatLog('info', message, 'AUTH', data),
    
    oauth: (message: string, data?: any) => 
      formatLog('info', message, 'OAUTH', data),
    
    error: (message: string, error?: any) => 
      formatLog('error', message, 'AUTH', error),
    
    debug: (message: string, data?: any) => 
      formatLog('debug', message, 'AUTH', data),
      
    info: (message: string, data?: any) => 
      formatLog('info', message, 'AUTH', data),
  },

  api: {
    request: (message: string, data?: any) => 
      formatLog('debug', message, 'API', data),
    
    response: (message: string, data?: any) => 
      formatLog('debug', message, 'API', data),
    
    error: (message: string, error?: any) => 
      formatLog('error', message, 'API', error),
  },

  store: {
    update: (message: string, data?: any) => 
      formatLog('debug', message, 'STORE', data),
    
    debug: (message: string, data?: any) => 
      formatLog('debug', message, 'STORE', data),
  },
};

export default log;