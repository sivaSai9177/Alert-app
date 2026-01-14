/**
 * Alert Subscription Service
 * Handles real-time alert updates using tRPC subscriptions
 */

import { EventEmitter } from 'events';
import { observable } from '@trpc/server/observable';
import { db } from '@/src/db';
import { alerts, alertEscalations, alertAcknowledgments } from '@/src/db/healthcare-schema';
import { eq } from 'drizzle-orm';
import { log } from '@/lib/core/logger';

// Event types for alerts
export type AlertEventType = 
  | 'alert.created'
  | 'alert.acknowledged'
  | 'alert.resolved'
  | 'alert.escalated'
  | 'alert.updated';

export interface AlertEvent {
  type: AlertEventType;
  alertId: string;
  hospitalId: string;
  data: any;
  timestamp: Date;
}

// Create a global event emitter for alert events
class AlertEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners to handle multiple subscriptions
    this.setMaxListeners(100);
  }

  emitAlertEvent(event: AlertEvent) {
    // Emit to hospital-specific channel
    this.emit(`hospital:${event.hospitalId}`, event);
    
    // Emit to alert-specific channel
    this.emit(`alert:${event.alertId}`, event);
    
    // Emit to global channel
    this.emit('alert:*', event);
    
    log.info('Alert event emitted', 'ALERT_EVENTS', {
      type: event.type,
      alertId: event.alertId,
      hospitalId: event.hospitalId,
    });
  }
}

// Export singleton instance
export const alertEvents = new AlertEventEmitter();

/**
 * Subscribe to alerts for a specific hospital
 */
export function subscribeToHospitalAlerts(hospitalId: string, signal?: AbortSignal) {
  return observable<AlertEvent>((emit) => {
    const handler = (event: AlertEvent) => {
      emit.next(event);
    };

    // Subscribe to hospital-specific events
    alertEvents.on(`hospital:${hospitalId}`, handler);
    
    // Cleanup on unsubscribe or abort
    const cleanup = () => {
      alertEvents.off(`hospital:${hospitalId}`, handler);
    };

    signal?.addEventListener('abort', cleanup);
    
    return {
      unsubscribe: cleanup,
    };
  });
}

/**
 * Subscribe to a specific alert
 */
export function subscribeToAlert(alertId: string, signal?: AbortSignal) {
  return observable<AlertEvent>((emit) => {
    const handler = (event: AlertEvent) => {
      emit.next(event);
    };

    // Subscribe to alert-specific events
    alertEvents.on(`alert:${alertId}`, handler);
    
    // Cleanup on unsubscribe or abort
    const cleanup = () => {
      alertEvents.off(`alert:${alertId}`, handler);
    };

    signal?.addEventListener('abort', cleanup);
    
    return {
      unsubscribe: cleanup,
    };
  });
}

/**
 * Helper functions to emit events
 */
export const alertEventHelpers = {
  emitAlertCreated: async (alert: any) => {
    alertEvents.emitAlertEvent({
      type: 'alert.created',
      alertId: alert.id,
      hospitalId: alert.hospitalId,
      data: alert,
      timestamp: new Date(),
    });
  },

  emitAlertAcknowledged: async (alertId: string, hospitalId: string, acknowledgedBy: string) => {
    alertEvents.emitAlertEvent({
      type: 'alert.acknowledged',
      alertId,
      hospitalId,
      data: { acknowledgedBy, acknowledgedAt: new Date() },
      timestamp: new Date(),
    });
  },

  emitAlertResolved: async (alertId: string, hospitalId: string, resolvedBy: string, resolution: string) => {
    alertEvents.emitAlertEvent({
      type: 'alert.resolved',
      alertId,
      hospitalId,
      data: { resolvedBy, resolution, resolvedAt: new Date() },
      timestamp: new Date(),
    });
  },

  emitAlertEscalated: async (alertId: string, hospitalId: string, fromTier: number, toTier: number) => {
    alertEvents.emitAlertEvent({
      type: 'alert.escalated',
      alertId,
      hospitalId,
      data: { fromTier, toTier, escalatedAt: new Date() },
      timestamp: new Date(),
    });
  },

  emitAlertUpdated: async (alertId: string, hospitalId: string, updates: any) => {
    alertEvents.emitAlertEvent({
      type: 'alert.updated',
      alertId,
      hospitalId,
      data: updates,
      timestamp: new Date(),
    });
  },
};

/**
 * Enhanced subscription with tracked events for reconnection support
 */
export async function* trackedHospitalAlerts(hospitalId: string, lastEventId?: string) {
  // If lastEventId provided, fetch missed events first
  if (lastEventId) {
    // Fetch events that occurred after lastEventId
    // This would require storing events in database with timestamps
    log.info('Fetching missed events', 'ALERT_EVENTS', { hospitalId, lastEventId });
  }

  // Create a queue to handle events
  const eventQueue: AlertEvent[] = [];
  let resolveNext: ((value: IteratorResult<AlertEvent>) => void) | null = null;

  const handler = (event: AlertEvent) => {
    if (resolveNext) {
      resolveNext({ value: event, done: false });
      resolveNext = null;
    } else {
      eventQueue.push(event);
    }
  };

  // Subscribe to events
  alertEvents.on(`hospital:${hospitalId}`, handler);

  try {
    while (true) {
      if (eventQueue.length > 0) {
        yield eventQueue.shift()!;
      } else {
        // Wait for next event
        yield await new Promise<AlertEvent>((resolve) => {
          resolveNext = (result) => {
            if (!result.done) {
              resolve(result.value);
            }
          };
        });
      }
    }
  } finally {
    // Cleanup
    alertEvents.off(`hospital:${hospitalId}`, handler);
  }
}