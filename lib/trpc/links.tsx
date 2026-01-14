/**
 * tRPC Link Configurations
 * Handles HTTP and WebSocket links for tRPC client
 */

import { httpBatchLink, splitLink, TRPCLink } from '@trpc/client';
import { wsLink, createWSClient } from '@trpc/client';
import { Platform } from 'react-native';
import { getApiUrl } from '@/lib/core/unified-env';
import { getAuthHeaders } from '@/lib/auth/auth-client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '@/src/server/routers';
import { log } from '@/lib/core/logger';
import { getStore } from '@/lib/stores/auth-store';

// WebSocket client instance
let wsClient: ReturnType<typeof createWSClient> | null = null;

// Create WebSocket URL
function getWebSocketUrl(): string {
  const apiUrl = getApiUrl();
  // Convert http to ws, https to wss
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  // Use port 3001 for WebSocket server
  const url = new URL(wsUrl);
  url.port = process.env.EXPO_PUBLIC_WS_PORT || '3001';
  url.pathname = '';
  
  return url.toString();
}

// Create WebSocket client with reconnection logic
export function createReconnectingWSClient(): ReturnType<typeof createWSClient> {
  if (wsClient) {
    return wsClient;
  }

  const wsUrl = getWebSocketUrl();
  let reconnectTimer: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const maxReconnectDelay = 30000; // 30 seconds

  const client = createWSClient({
    url: async () => {
      // Get auth token
      const store = getStore();
      const token = store.getState().sessionToken;
      
      if (token) {
        return `${wsUrl}?token=${encodeURIComponent(token)}`;
      }
      
      return wsUrl;
    },
    onOpen: () => {
      log.info('WebSocket connected', 'WS_CLIENT', { url: wsUrl });
      reconnectAttempts = 0;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    },
    onClose: (cause) => {
      log.warn('WebSocket disconnected', 'WS_CLIENT', { cause });
      
      // Don't reconnect if manually closed
      if (cause?.code === 1000) return;
      
      scheduleReconnect();
    },
    onError: (error) => {
      log.error('WebSocket error', 'WS_CLIENT', error);
    },
  });

  function scheduleReconnect() {
    if (reconnectAttempts >= maxReconnectAttempts) {
      log.error('Max WebSocket reconnection attempts reached', 'WS_CLIENT');
      return;
    }

    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay);
    
    log.info('Scheduling WebSocket reconnect', 'WS_CLIENT', {
      attempt: reconnectAttempts,
      delay,
    });
    
    reconnectTimer = setTimeout(() => {
      client.reconnect();
    }, delay);
  }

  wsClient = client;
  return client;
}

// Create HTTP batch link
export function createHttpBatchLink() {
  // Get initial URL
  const getUrl = () => {
    const apiUrl = getApiUrl();
    return `${apiUrl}/api/trpc`;
  };
  
  return httpBatchLink<AppRouter>({
    url: getUrl(),
    async headers() {
      const headers = await getAuthHeaders();
      return {
        ...headers,
        'x-trpc-source': Platform.OS,
      };
    },
    transformer: undefined,
  });
}

// Create WebSocket link
export function createWebSocketLink() {
  const client = createReconnectingWSClient();
  
  return wsLink<AppRouter>({
    client,
  });
}

// Create split link that routes subscriptions to WebSocket
export function createSplitLink(): TRPCLink<AppRouter> {
  // Check if WebSocket is available
  const isWebSocketAvailable = Platform.OS === 'web' || process.env.EXPO_PUBLIC_ENABLE_WS === 'true';
  
  if (!isWebSocketAvailable) {
    log.info('WebSocket not available, using HTTP only', 'TRPC_LINKS');
    return createHttpBatchLink();
  }
  
  return splitLink({
    condition: (op) => {
      // Route subscriptions to WebSocket
      return op.type === 'subscription';
    },
    true: createWebSocketLink(),
    false: createHttpBatchLink(),
  });
}

// Cleanup function
export function closeWebSocketConnection() {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
}