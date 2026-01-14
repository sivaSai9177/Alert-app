import { useEffect, useRef, useState, useCallback } from 'react';
import { log } from '@/lib/core/logger';
import { getApiUrl } from '@/lib/core/unified-env';

interface SSEOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export function useSSESubscription(endpoint: string, options: SSEOptions = {}) {
  const {
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const url = `${apiUrl}${endpoint}`;
      
      log.info('Connecting to SSE endpoint', 'SSE_HOOK', { url });
      
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });
      
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = () => {
        log.info('SSE connection opened', 'SSE_HOOK');
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnect?.();
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          log.debug('SSE message received', 'SSE_HOOK', data);
          onMessage?.(data);
        } catch (error) {
          log.error('Error parsing SSE message', 'SSE_HOOK', error);
          onError?.(error as Error);
        }
      };
      
      eventSource.onerror = (error) => {
        log.error('SSE connection error', 'SSE_HOOK', error);
        setIsConnected(false);
        onError?.(new Error('SSE connection error'));
        
        // Clean up
        eventSource.close();
        eventSourceRef.current = null;
        onDisconnect?.();
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
          log.info(`Reconnecting in ${delay}ms...`, 'SSE_HOOK', { attempt: reconnectAttempts + 1 });
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else {
          log.error('Max reconnection attempts reached', 'SSE_HOOK');
        }
      };
    } catch (error) {
      log.error('Error creating SSE connection', 'SSE_HOOK', error);
      onError?.(error as Error);
    }
  }, [endpoint, onMessage, onError, onConnect, onDisconnect, reconnectAttempts, reconnectDelay, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      log.info('Closing SSE connection', 'SSE_HOOK');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnect?.();
    }
  }, [onDisconnect]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
    reconnect: () => {
      setReconnectAttempts(0);
      disconnect();
      connect();
    },
    disconnect,
  };
}

// Hook specifically for alert subscriptions
export function useAlertSSESubscription(onAlertUpdate?: (alert: any) => void) {
  return useSSESubscription('/api/sse/alerts', {
    onMessage: (data) => {
      if (data.type === 'alert' && onAlertUpdate) {
        onAlertUpdate(data.data);
      }
    },
    onConnect: () => {
      log.info('Connected to alert SSE stream', 'ALERT_SSE');
    },
    onDisconnect: () => {
      log.info('Disconnected from alert SSE stream', 'ALERT_SSE');
    },
    onError: (error) => {
      log.error('Alert SSE error', 'ALERT_SSE', error);
    },
  });
}