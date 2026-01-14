/**
 * Server Startup Services
 * Initialize background services when the server starts
 */

import { escalationTimerService } from './escalation-timer';
import { log } from '@/lib/core/logger';
import { createWebSocketServer, shutdownWebSocketServer } from '../websocket/server';

// Use global flags to prevent multiple initializations across hot reloads
const getGlobalFlag = (key: string): boolean => {
  return (global as any)[key] || false;
};

const setGlobalFlag = (key: string, value: boolean): void => {
  (global as any)[key] = value;
};

export function initializeBackgroundServices() {
  log.info('Initializing background services', 'SERVER');

  // Debug environment variables
  log.info('WebSocket configuration', 'SERVER', {
    EXPO_PUBLIC_ENABLE_WS: process.env.EXPO_PUBLIC_ENABLE_WS,
    EXPO_PUBLIC_WS_PORT: process.env.EXPO_PUBLIC_WS_PORT,
    wsServerStarted: getGlobalFlag('__wsServerStarted')
  });

  // Start WebSocket server for real-time subscriptions
  if (!getGlobalFlag('__wsServerStarted') && process.env.EXPO_PUBLIC_ENABLE_WS === 'true') {
    const wsPort = parseInt(process.env.EXPO_PUBLIC_WS_PORT || '3001');
    
    createWebSocketServer(wsPort)
      .then(() => {
        setGlobalFlag('__wsServerStarted', true);
        log.info('WebSocket server initialized', 'SERVER', { port: wsPort });
      })
      .catch((error) => {
        if (error.message.includes('already in use')) {
          log.warn('WebSocket server already running on port', 'SERVER', { port: wsPort });
          // Don't set the flag to true since we didn't actually start it
        } else {
          log.error('Failed to start WebSocket server', 'SERVER', error);
        }
      });
  } else {
    log.info('WebSocket server not started', 'SERVER', {
      reason: getGlobalFlag('__wsServerStarted') ? 'Already started' : 'WebSocket disabled'
    });
  }

  // Start escalation timer service
  try {
    escalationTimerService.start();
    log.info('Escalation timer service started', 'SERVER');
  } catch (error) {
    log.error('Failed to start escalation timer service', 'SERVER', error);
  }

  // Add other background services here as needed
  // e.g., notification service, cleanup service, etc.
}

export function shutdownBackgroundServices() {
  log.info('Shutting down background services', 'SERVER');

  // Stop WebSocket server
  if (getGlobalFlag('__wsServerStarted')) {
    try {
      shutdownWebSocketServer();
      setGlobalFlag('__wsServerStarted', false);
      log.info('WebSocket server stopped', 'SERVER');
    } catch (error) {
      log.error('Failed to stop WebSocket server', 'SERVER', error);
    }
  }

  // Stop escalation timer service
  try {
    escalationTimerService.stop();
    log.info('Escalation timer service stopped', 'SERVER');
  } catch (error) {
    log.error('Failed to stop escalation timer service', 'SERVER', error);
  }

  // Stop other background services here
}

// Handle graceful shutdown - register only once
if (!getGlobalFlag('__shutdownHandlersRegistered')) {
  process.on('SIGTERM', () => {
    log.info('SIGTERM received, shutting down gracefully', 'SERVER');
    shutdownBackgroundServices();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    log.info('SIGINT received, shutting down gracefully', 'SERVER');
    shutdownBackgroundServices();
    process.exit(0);
  });
  
  setGlobalFlag('__shutdownHandlersRegistered', true);
}