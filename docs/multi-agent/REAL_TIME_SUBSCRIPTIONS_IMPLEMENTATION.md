# Real-time Subscriptions Implementation Guide

## Overview
This document provides a comprehensive guide for implementing real-time subscriptions using WebSockets in the Hospital Alert System MVP.

## Architecture Overview

### Core Technologies
- **tRPC**: Type-safe API layer with subscription support
- **WebSockets**: Real-time bidirectional communication
- **Zustand**: Client-side state management
- **EventEmitter**: Server-side event distribution
- **TanStack Query**: Cache management and optimistic updates

### System Components

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Native   │     │      Web        │     │   Expo Go       │
│     Client      │     │     Client      │     │    Client       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    tRPC Split Link      │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
        ┌───────┴────────┐              ┌────────┴───────┐
        │  HTTP Batch    │              │   WebSocket    │
        │     Link       │              │     Link       │
        └───────┬────────┘              └────────┬───────┘
                │                                 │
        ┌───────┴────────┐              ┌────────┴───────┐
        │ tRPC Server    │              │  WS Server     │
        │  (Port 8081)   │              │  (Port 3001)   │
        └───────┬────────┘              └────────┬───────┘
                │                                 │
                └─────────────┬───────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │  Event Emitter     │
                    └─────────┬──────────┘
                              │
                    ┌─────────┴──────────┐
                    │    Database        │
                    └────────────────────┘
```

## Implementation Details

### 1. WebSocket Server Setup

#### Server Configuration (`/src/server/websocket/server.ts`)
```typescript
export async function createWebSocketServer(port: number = 3001) {
  const wss = new WebSocketServer({ port });
  
  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: async (opts) => {
      // Extract auth token
      const token = extractToken(opts.req);
      const session = await authenticateToken(token);
      
      return {
        ...createBaseContext(opts.req),
        user: session?.user,
        connectionId: crypto.randomUUID(),
      };
    },
  });
  
  // Handle connection lifecycle
  wss.on('connection', (ws, req) => {
    connectionManager.addConnection(ws, req);
  });
  
  return { wss, handler };
}
```

### 2. Connection Management

#### Connection Manager (`/src/server/websocket/connection-manager.ts`)
```typescript
interface Connection {
  id: string;
  ws: WebSocket;
  userId?: string;
  role?: string;
  hospitalId: string;
  isAlive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

class ConnectionManager {
  private connections = new Map<string, Connection>();
  
  addConnection(connection: Connection) {
    this.connections.set(connection.id, connection);
    this.mapUserConnection(connection.userId, connection.id);
  }
  
  broadcastToHospital(hospitalId: string, data: any) {
    const connections = this.getHospitalConnections(hospitalId);
    connections.forEach(conn => {
      conn.ws.send(JSON.stringify(data));
    });
  }
  
  startHeartbeat() {
    setInterval(() => {
      this.connections.forEach((conn) => {
        if (!conn.isAlive) {
          this.removeConnection(conn.id);
          return;
        }
        conn.isAlive = false;
        conn.ws.ping();
      });
    }, 30000);
  }
}
```

### 3. Real-time Event System

#### Event Service (`/src/server/services/realtime-events.ts`)
```typescript
class RealtimeEventService extends EventEmitter {
  emitAlertCreated(hospitalId: string, alert: any, userId: string) {
    const event = {
      type: 'alert.created',
      data: { hospitalId, alert, userId },
      timestamp: new Date(),
    };
    
    this.emit(`hospital:${hospitalId}:alerts`, event);
  }
  
  subscribeToHospitalAlerts(hospitalId: string, callback: Function) {
    this.on(`hospital:${hospitalId}:alerts`, callback);
    return () => this.off(`hospital:${hospitalId}:alerts`, callback);
  }
}
```

### 4. Client-side Integration

#### tRPC Client Configuration (`/lib/trpc/links.tsx`)
```typescript
export function createSplitLink() {
  return splitLink({
    condition: (op) => op.type === 'subscription',
    true: createWebSocketLink(),
    false: createHttpBatchLink(),
  });
}

function createWebSocketLink() {
  const wsClient = createWSClient({
    url: getWebSocketUrl(),
    onOpen: () => log.info('WebSocket connected'),
    reconnect: true,
    reconnectInterval: 3000,
  });
  
  return wsLink({ client: wsClient });
}
```

### 5. React Components with Subscriptions

#### Alert List Component
```typescript
export const AlertListBlock = ({ hospitalId }) => {
  const queryClient = api.useUtils();
  
  // Subscribe to real-time alerts
  const { data: subscriptionData } = api.healthcare.subscribeToAlerts.useSubscription(
    { hospitalId },
    {
      enabled: !!hospitalId && process.env.EXPO_PUBLIC_ENABLE_WS === 'true',
      onData: (event) => {
        // Invalidate cache to refetch latest data
        queryClient.healthcare.getActiveAlerts.invalidate();
        
        // Show notification
        if (event.type === 'alert.created') {
          showNotification('New Alert', event.data.alert);
        }
      },
    }
  );
  
  // Regular query with cache
  const { data: alerts } = api.healthcare.getActiveAlerts.useQuery(
    { hospitalId },
    { refetchInterval: 30000 } // Fallback polling
  );
  
  return <AlertList alerts={alerts} />;
};
```

### 6. State Management with Zustand

#### Healthcare Store (`/lib/stores/healthcare-store.ts`)
```typescript
interface HealthcareState {
  alerts: Alert[];
  activeAlertIds: Set<string>;
  
  // Actions
  addAlert: (alert: Alert) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  acknowledgeAlert: (alertId: string, userId: string) => void;
}

export const useHealthcareStore = create<HealthcareState>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        alerts: [],
        activeAlertIds: new Set(),
        
        addAlert: (alert) => set((state) => {
          const index = state.alerts.findIndex(a => a.id === alert.id);
          if (index >= 0) {
            state.alerts[index] = alert;
          } else {
            state.alerts.push(alert);
          }
          
          if (!alert.resolved) {
            state.activeAlertIds.add(alert.id);
          }
        }),
      }))
    )
  )
);
```

## Best Practices

### 1. Authentication
- Always validate tokens on WebSocket connections
- Include user context in subscription handlers
- Implement role-based event filtering

### 2. Error Handling
```typescript
const subscription = api.alerts.subscribe.useSubscription(
  { hospitalId },
  {
    onError: (error) => {
      log.error('Subscription error', error);
      // Fall back to polling
      startPolling();
    },
  }
);
```

### 3. Optimistic Updates
```typescript
const acknowledgeMutation = api.alerts.acknowledge.useMutation({
  onMutate: async ({ alertId }) => {
    // Optimistically update UI
    queryClient.setQueryData(['alerts'], (old) => {
      return updateAlertStatus(old, alertId, 'acknowledged');
    });
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['alerts'], context.previousData);
  },
});
```

### 4. Connection Management
- Implement heartbeat/ping-pong
- Handle reconnection gracefully
- Queue messages during disconnection
- Clean up subscriptions on unmount

### 5. Performance Optimization
- Debounce high-frequency updates
- Use selective subscriptions
- Implement proper caching strategies
- Batch related updates

## Testing Strategy

### 1. Unit Tests
```typescript
describe('WebSocket Subscriptions', () => {
  it('should receive real-time alert updates', async () => {
    const mockWs = createMockWebSocket();
    const { result } = renderHook(() => 
      api.alerts.subscribe.useSubscription({ hospitalId: 'test' })
    );
    
    mockWs.simulateMessage({
      type: 'alert.created',
      data: mockAlert,
    });
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockAlert);
    });
  });
});
```

### 2. Integration Tests
- Test WebSocket connection lifecycle
- Verify authentication flow
- Test event propagation
- Validate reconnection logic

### 3. E2E Tests
- Multi-client synchronization
- Network failure scenarios
- High-load testing
- Cross-platform compatibility

## Monitoring and Debugging

### 1. Logging
```typescript
// Server-side
log.info('WebSocket connection established', {
  connectionId,
  userId,
  hospitalId,
});

// Client-side
log.debug('Subscription event received', {
  type: event.type,
  timestamp: event.timestamp,
});
```

### 2. Metrics
- Active connections count
- Message throughput
- Connection duration
- Error rates
- Reconnection frequency

### 3. Debug Tools
- Chrome DevTools WebSocket inspector
- React Query Devtools
- Zustand DevTools
- Custom debug panel in app

## Production Considerations

### 1. Scaling
- Use Redis for pub/sub across servers
- Implement sticky sessions
- Load balance WebSocket connections
- Consider using Socket.IO for scaling

### 2. Security
- Implement rate limiting
- Validate all incoming messages
- Use secure WebSocket (wss://)
- Regular token rotation

### 3. Reliability
- Implement message acknowledgments
- Store critical events for replay
- Handle network interruptions
- Graceful degradation to polling

## Troubleshooting Guide

### Common Issues

#### WebSocket Won't Connect
1. Check EXPO_PUBLIC_ENABLE_WS=true
2. Verify port 3001 is available
3. Check firewall settings
4. Validate authentication tokens

#### Events Not Received
1. Check subscription is active
2. Verify event emission on server
3. Check user permissions
4. Look for connection drops

#### Memory Leaks
1. Ensure cleanup on unmount
2. Remove event listeners
3. Clear intervals/timeouts
4. Check for circular references

## Summary

This implementation provides a robust, scalable real-time communication system that:
- Works across all platforms (iOS, Android, Web)
- Handles authentication and authorization
- Provides optimistic updates
- Falls back gracefully
- Scales for production use