/**
 * tRPC Logging Middleware
 * Simple implementation for development
 */

import { log } from './logger';

export const trpcLogger = {
  // Basic logging methods
  logRequest: (path: string, input: any) => {
    log.api.request(`tRPC ${path}`, { input });
  },
  
  logResponse: (path: string, result: any, duration: number) => {
    log.api.response(`tRPC ${path} completed`, { 
      duration: `${duration}ms`,
      hasResult: !!result 
    });
  },
  
  logError: (path: string, error: any) => {
    log.api.error(`tRPC ${path} failed`, error);
  },

  // Enhanced logging methods expected by middleware
  logRequestStart: (path: string, type: string, ctx: any, input: any, requestId: string) => {
    log.api.request(`tRPC ${type.toUpperCase()} ${path} started`, { 
      requestId,
      hasInput: !!input,
      userId: ctx.session?.user?.id,
      userAgent: ctx.req?.headers?.get?.('user-agent')?.substring(0, 100)
    });
  },

  logRequestSuccess: (path: string, type: string, result: any, durationMs: number, requestId: string) => {
    log.api.response(`tRPC ${type.toUpperCase()} ${path} completed`, { 
      requestId,
      durationMs,
      hasResult: !!result,
      resultSize: typeof result === 'object' ? JSON.stringify(result).length : 0
    });
  },

  logRequestError: (path: string, type: string, error: any, durationMs: number, requestId: string) => {
    log.api.error(`tRPC ${type.toUpperCase()} ${path} failed`, {
      requestId,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
      errorCode: error?.code || 'UNKNOWN'
    });
  },

  // Auth event logging
  logAuthEvent: (event: string, path: string, ctx: any, details?: any) => {
    log.auth.debug(`Auth event: ${event}`, {
      path,
      event,
      userId: ctx.session?.user?.id,
      userRole: (ctx.session?.user as any)?.role,
      ...details
    });
  }
};

export default trpcLogger;