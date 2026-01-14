/**
 * Realtime Event Service
 * Central event emitter for pub/sub pattern used by WebSocket subscriptions
 */

import { EventEmitter } from 'events';
import { log } from '@/lib/core/logger';

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: Date;
  targetUsers?: string[];
  targetRoles?: string[];
  hospitalId?: string;
}

export interface AlertEvent extends RealtimeEvent {
  type: 'alert.created' | 'alert.acknowledged' | 'alert.resolved' | 'alert.escalated';
  data: {
    hospitalId: string;
    alert: any;
    userId?: string;
    alertId?: string;
  };
}

export interface VitalsEvent extends RealtimeEvent {
  type: 'vitals.update';
  data: {
    patientId: string;
    vitals: any;
    critical?: boolean;
  };
}

export interface MetricsEvent extends RealtimeEvent {
  type: 'metrics.update';
  data: {
    hospitalId: string;
    metrics: any;
  };
}

class RealtimeEventService extends EventEmitter {
  private static instance: RealtimeEventService;

  private constructor() {
    super();
    this.setMaxListeners(100); // Increase for many concurrent connections
    log.info('Realtime event service initialized', 'REALTIME');
  }

  static getInstance(): RealtimeEventService {
    if (!RealtimeEventService.instance) {
      RealtimeEventService.instance = new RealtimeEventService();
    }
    return RealtimeEventService.instance;
  }

  // Healthcare-specific events
  emitAlertCreated(hospitalId: string, alert: any, userId: string) {
    const event: AlertEvent = {
      type: 'alert.created',
      data: { hospitalId, alert, userId },
      timestamp: new Date(),
      hospitalId,
    };
    
    this.emit('alert.created', event);
    this.emit(`hospital:${hospitalId}:alerts`, event);
    
    log.info('Alert created event emitted', 'REALTIME', {
      hospitalId,
      alertId: alert.id,
      userId,
    });
  }

  emitAlertAcknowledged(hospitalId: string, alertId: string, userId: string) {
    const event: AlertEvent = {
      type: 'alert.acknowledged',
      data: { hospitalId, alertId, userId },
      timestamp: new Date(),
      hospitalId,
    };
    
    this.emit('alert.acknowledged', event);
    this.emit(`hospital:${hospitalId}:alerts`, event);
    
    log.info('Alert acknowledged event emitted', 'REALTIME', {
      hospitalId,
      alertId,
      userId,
    });
  }

  emitAlertResolved(hospitalId: string, alertId: string, userId: string) {
    const event: AlertEvent = {
      type: 'alert.resolved',
      data: { hospitalId, alertId, userId },
      timestamp: new Date(),
      hospitalId,
    };
    
    this.emit('alert.resolved', event);
    this.emit(`hospital:${hospitalId}:alerts`, event);
    
    log.info('Alert resolved event emitted', 'REALTIME', {
      hospitalId,
      alertId,
      userId,
    });
  }

  emitAlertEscalated(hospitalId: string, alertId: string, fromTier: number, toTier: number) {
    const event: AlertEvent = {
      type: 'alert.escalated',
      data: { 
        hospitalId, 
        alertId,
        alert: { fromTier, toTier }
      },
      timestamp: new Date(),
      hospitalId,
    };
    
    this.emit('alert.escalated', event);
    this.emit(`hospital:${hospitalId}:alerts`, event);
    
    log.info('Alert escalated event emitted', 'REALTIME', {
      hospitalId,
      alertId,
      fromTier,
      toTier,
    });
  }

  emitVitalsUpdate(patientId: string, vitals: any, hospitalId: string) {
    const event: VitalsEvent = {
      type: 'vitals.update',
      data: { 
        patientId, 
        vitals,
        critical: this.checkCriticalVitals(vitals)
      },
      timestamp: new Date(),
      hospitalId,
    };
    
    this.emit('vitals.update', event);
    this.emit(`patient:${patientId}:vitals`, event);
    this.emit(`hospital:${hospitalId}:vitals`, event);
    
    log.debug('Vitals update event emitted', 'REALTIME', {
      patientId,
      hospitalId,
      critical: event.data.critical,
    });
  }

  emitMetricsUpdate(hospitalId: string, metrics: any) {
    const event: MetricsEvent = {
      type: 'metrics.update',
      data: { hospitalId, metrics },
      timestamp: new Date(),
      hospitalId,
    };
    
    this.emit('metrics.update', event);
    this.emit(`hospital:${hospitalId}:metrics`, event);
    
    log.debug('Metrics update event emitted', 'REALTIME', { hospitalId });
  }

  private checkCriticalVitals(vitals: any): boolean {
    // Check for critical vital signs
    const criticalConditions = [
      vitals.heartRate && (vitals.heartRate < 40 || vitals.heartRate > 150),
      vitals.oxygen && vitals.oxygen < 90,
      vitals.systolic && (vitals.systolic < 90 || vitals.systolic > 180),
      vitals.diastolic && (vitals.diastolic < 60 || vitals.diastolic > 120),
      vitals.temperature && (vitals.temperature < 95 || vitals.temperature > 104),
    ];
    
    return criticalConditions.some(condition => condition === true);
  }

  // Mock data generator for development
  startMockDataGenerator() {
    if (process.env.NODE_ENV !== 'development') return;
    
    log.info('Starting mock data generator', 'REALTIME');
    
    // Generate random vital updates every 5-10 seconds
    setInterval(() => {
      const patientId = `patient-${Math.floor(Math.random() * 3) + 1}`;
      const vitals = {
        heartRate: 60 + Math.floor(Math.random() * 40),
        oxygen: 90 + Math.floor(Math.random() * 10),
        systolic: 110 + Math.floor(Math.random() * 30),
        diastolic: 70 + Math.floor(Math.random() * 20),
        temperature: 97 + Math.random() * 2,
      };
      
      this.emitVitalsUpdate(patientId, vitals, 'hospital-1');
    }, 5000 + Math.random() * 5000);
    
    // Generate random alert escalations every 30-60 seconds
    setInterval(() => {
      const alertId = `alert-${Math.floor(Math.random() * 10) + 1}`;
      const fromTier = Math.floor(Math.random() * 2) + 1;
      const toTier = fromTier + 1;
      
      this.emitAlertEscalated('hospital-1', alertId, fromTier, toTier);
    }, 30000 + Math.random() * 30000);
  }
}

export const realtimeEvents = RealtimeEventService.getInstance();

// Helper functions for consistent event emission
export const alertEventHelpers = {
  emitAlertCreated: async (alert: any) => {
    realtimeEvents.emitAlertCreated(alert.hospitalId, alert, alert.createdBy);
  },

  emitAlertAcknowledged: async (alertId: string, hospitalId: string, acknowledgedBy: string) => {
    realtimeEvents.emitAlertAcknowledged(hospitalId, alertId, acknowledgedBy);
  },

  emitAlertResolved: async (alertId: string, hospitalId: string, resolvedBy: string, resolution?: string) => {
    realtimeEvents.emitAlertResolved(hospitalId, alertId, resolvedBy);
  },

  emitAlertEscalated: async (alertId: string, hospitalId: string, fromTier: number, toTier: number) => {
    realtimeEvents.emitAlertEscalated(hospitalId, alertId, fromTier, toTier);
  },
};

// Subscribe to hospital alerts
export function subscribeToHospitalAlerts(hospitalId: string, callback: (event: any) => void) {
  const handler = (event: any) => callback(event);
  
  realtimeEvents.on(`hospital:${hospitalId}:alerts`, handler);
  
  return () => {
    realtimeEvents.off(`hospital:${hospitalId}:alerts`, handler);
  };
}

// Subscribe to metrics
export function subscribeToMetrics(hospitalId: string, callback: (event: any) => void) {
  const handler = (event: any) => callback(event);
  
  realtimeEvents.on(`hospital:${hospitalId}:metrics`, handler);
  
  return () => {
    realtimeEvents.off(`hospital:${hospitalId}:metrics`, handler);
  };
}

// Subscribe to patient vitals
export function subscribeToPatientVitals(patientId: string, callback: (event: any) => void) {
  const handler = (event: any) => callback(event);
  
  realtimeEvents.on(`patient:${patientId}:vitals`, handler);
  
  return () => {
    realtimeEvents.off(`patient:${patientId}:vitals`, handler);
  };
}

// Export mock data generator
export { RealtimeEventService };
export function startMockDataGenerator() {
  realtimeEvents.startMockDataGenerator();
}

// Add these methods to the realtimeEvents instance for easier access
Object.assign(realtimeEvents, {
  subscribeToHospitalAlerts,
  subscribeToMetrics,
  subscribeToPatientVitals,
});