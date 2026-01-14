/**
 * Cross-platform WebSocket client
 * Provides a unified WebSocket implementation for React Native and Web
 */

import { Platform } from 'react-native';
import { log } from '@/lib/core/logger';

export interface WebSocketClient {
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  readyState: number;
  url: string;
  send(data: string | ArrayBuffer | Blob): void;
  close(code?: number, reason?: string): void;
}

// WebSocket ready states
export const WS_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const;

/**
 * Creates a cross-platform WebSocket client
 */
export function createWebSocketClient(url: string): WebSocketClient {
  log.info('Creating WebSocket client', 'WS_CLIENT', { url, platform: Platform.OS });
  
  if (Platform.OS === 'web') {
    // Use native browser WebSocket
    return new WebSocket(url) as WebSocketClient;
  } else {
    // React Native WebSocket implementation
    // React Native's WebSocket is already cross-platform compatible
    const ws = new WebSocket(url);
    
    // Add platform-specific handling if needed
    const originalOnMessage = ws.onmessage;
    ws.onmessage = (event) => {
      // React Native WebSocket messages come as strings
      // Parse them if they're JSON
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          event.data = parsed;
        } catch {
          // Not JSON, keep as string
        }
      }
      
      if (originalOnMessage) {
        originalOnMessage.call(ws, event);
      }
    };
    
    return ws as unknown as WebSocketClient;
  }
}

/**
 * WebSocket connection manager with reconnection logic
 */
export class ReconnectingWebSocket {
  private ws: WebSocketClient | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private maxReconnectInterval = 30000; // Max 30 seconds
  private reconnectDecay = 1.5; // Exponential backoff
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: string[] = [];
  private isReconnecting = false;
  
  // Event handlers
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onreconnect: (() => void) | null = null;
  
  constructor(url: string) {
    this.url = url;
    this.connect();
  }
  
  private connect() {
    try {
      this.ws = createWebSocketClient(this.url);
      this.setupEventHandlers();
    } catch (error) {
      log.error('Failed to create WebSocket', 'WS_CLIENT', error);
      this.scheduleReconnect();
    }
  }
  
  private setupEventHandlers() {
    if (!this.ws) return;
    
    this.ws.onopen = (event) => {
      log.info('WebSocket connected', 'WS_CLIENT', { url: this.url });
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      
      // Send queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.send(message);
        }
      }
      
      if (this.onopen) {
        this.onopen(event);
      }
      
      if (this.reconnectAttempts > 0 && this.onreconnect) {
        this.onreconnect();
      }
    };
    
    this.ws.onmessage = (event) => {
      if (this.onmessage) {
        this.onmessage(event);
      }
    };
    
    this.ws.onerror = (event) => {
      log.error('WebSocket error', 'WS_CLIENT', { url: this.url });
      if (this.onerror) {
        this.onerror(event);
      }
    };
    
    this.ws.onclose = (event) => {
      log.info('WebSocket closed', 'WS_CLIENT', { 
        url: this.url, 
        code: event.code, 
        reason: event.reason 
      });
      
      if (this.onclose) {
        this.onclose(event);
      }
      
      // Don't reconnect if closed intentionally
      if (event.code !== 1000 && event.code !== 1001) {
        this.scheduleReconnect();
      }
    };
  }
  
  private scheduleReconnect() {
    if (this.isReconnecting) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log.error('Max reconnection attempts reached', 'WS_CLIENT', { 
        url: this.url,
        attempts: this.reconnectAttempts 
      });
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    const timeout = Math.min(
      this.reconnectInterval * Math.pow(this.reconnectDecay, this.reconnectAttempts - 1),
      this.maxReconnectInterval
    );
    
    log.info('Scheduling reconnect', 'WS_CLIENT', { 
      url: this.url,
      attempt: this.reconnectAttempts,
      timeout 
    });
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, timeout);
  }
  
  public send(data: string | ArrayBuffer | Blob) {
    if (this.ws && this.ws.readyState === WS_READY_STATE.OPEN) {
      this.ws.send(data);
    } else {
      // Queue message if not connected
      if (typeof data === 'string') {
        this.messageQueue.push(data);
        log.debug('Message queued for sending', 'WS_CLIENT', { 
          queueLength: this.messageQueue.length 
        });
      }
    }
  }
  
  public close(code?: number, reason?: string) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.isReconnecting = false;
    this.messageQueue = [];
    
    if (this.ws) {
      this.ws.close(code, reason);
      this.ws = null;
    }
  }
  
  public get readyState(): number {
    return this.ws?.readyState ?? WS_READY_STATE.CLOSED;
  }
  
  public get bufferedAmount(): number {
    // Return approximate buffered amount based on queue
    return this.messageQueue.length;
  }
}

/**
 * Create a WebSocket link for tRPC with authentication
 */
export function createAuthenticatedWebSocket(url: string, getToken: () => Promise<string | null>) {
  let ws: ReconnectingWebSocket | null = null;
  let authenticated = false;
  
  const connect = async () => {
    const token = await getToken();
    const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    
    ws = new ReconnectingWebSocket(wsUrl);
    
    ws.onopen = () => {
      authenticated = false;
      // Send authentication message if needed
      if (token) {
        ws?.send(JSON.stringify({
          type: 'auth',
          token,
        }));
      }
    };
    
    ws.onmessage = (event) => {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      if (data.type === 'auth_success') {
        authenticated = true;
        log.info('WebSocket authenticated', 'WS_CLIENT');
      } else if (data.type === 'auth_error') {
        log.error('WebSocket authentication failed', 'WS_CLIENT', data);
        ws?.close(1008, 'Authentication failed');
      }
    };
    
    return ws;
  };
  
  return {
    connect,
    disconnect: () => {
      ws?.close(1000, 'Client disconnect');
      ws = null;
    },
    isAuthenticated: () => authenticated,
  };
}