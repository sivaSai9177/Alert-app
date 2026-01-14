import { z } from 'zod';
import { 
  router, 
  protectedProcedure, 
  createPermissionProcedure,
  adminProcedure 
} from '../trpc';
import { db } from '@/src/db';
import { 
  alerts, 
  alertEscalations, 
  alertAcknowledgments,
  notificationLogs,
  healthcareAuditLogs,
  healthcareUsers
} from '@/src/db/healthcare-schema';
import { users } from '@/src/db/schema';
import { eq, and, desc, or, gte, lte } from 'drizzle-orm';
import { 
  CreateAlertSchema, 
  AcknowledgeAlertSchema,
  UpdateUserRoleSchema,
  HealthcareProfileSchema,
  HEALTHCARE_ESCALATION_TIERS,
  AlertStatus
} from '@/types/healthcare';
import { log } from '@/lib/core/logger';
import { escalationTimerService } from '../services/escalation-timer';
import { 
  realtimeEvents,
  alertEventHelpers,
  startMockDataGenerator
} from '../services/realtime-events';
import { observable } from '@trpc/server/observable';

// Create permission-based procedures for healthcare roles
const operatorProcedure = createPermissionProcedure('create_alerts');
const doctorProcedure = createPermissionProcedure('acknowledge_alerts');
const viewAlertsProcedure = createPermissionProcedure('view_alerts');

export const healthcareRouter = router({
  // Create a new alert (operators only)
  createAlert: operatorProcedure
    .input(CreateAlertSchema)
    .mutation(async ({ input, ctx }) => {
      const { roomNumber, alertType, urgencyLevel, description, hospitalId } = input;
      
      try {
        // Create the alert
        const [newAlert] = await db.insert(alerts).values({
          roomNumber,
          alertType,
          urgencyLevel,
          description,
          createdBy: ctx.user.id,
          hospitalId,
          status: 'active',
          // Set escalation timer based on urgency
          nextEscalationAt: new Date(Date.now() + HEALTHCARE_ESCALATION_TIERS[0].timeout_minutes * 60 * 1000),
        }).returning();

        // Log the alert creation
        await db.insert(healthcareAuditLogs).values({
          userId: ctx.user.id,
          action: 'alert_created',
          entityType: 'alert',
          entityId: newAlert.id,
          hospitalId,
          metadata: {
            alertType,
            urgencyLevel,
            roomNumber,
          },
          ipAddress: ctx.headers?.['x-forwarded-for'] || ctx.headers?.['x-real-ip'],
          userAgent: ctx.headers?.['user-agent'],
        });

        // Emit alert created event
        await alertEventHelpers.emitAlertCreated(newAlert);

        log.info('Alert created', 'HEALTHCARE', {
          alertId: newAlert.id,
          alertType,
          urgencyLevel,
          roomNumber,
          createdBy: ctx.user.id,
        });

        return {
          success: true,
          alert: newAlert,
        };
      } catch (error) {
        log.error('Failed to create alert', 'HEALTHCARE', error);
        throw new Error('Failed to create alert');
      }
    }),

  // Get active alerts (based on user role)
  getActiveAlerts: viewAlertsProcedure
    .input(z.object({
      hospitalId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { hospitalId, limit, offset } = input;
      
      try {
        // Get active alerts for the hospital
        const activeAlerts = await db
          .select({
            alert: alerts,
            creator: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
            acknowledgedBy: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(alerts)
          .leftJoin(users, eq(alerts.createdBy, users.id))
          .leftJoin(users, eq(alerts.acknowledgedBy, users.id))
          .where(
            and(
              eq(alerts.hospitalId, hospitalId),
              or(
                eq(alerts.status, 'active'),
                eq(alerts.status, 'acknowledged')
              )
            )
          )
          .orderBy(desc(alerts.urgencyLevel), desc(alerts.createdAt))
          .limit(limit)
          .offset(offset);

        return {
          alerts: activeAlerts,
          total: activeAlerts.length,
        };
      } catch (error) {
        log.error('Failed to fetch active alerts', 'HEALTHCARE', error);
        throw new Error('Failed to fetch active alerts');
      }
    }),

  // Acknowledge an alert (doctors and nurses)
  acknowledgeAlert: doctorProcedure
    .input(AcknowledgeAlertSchema)
    .mutation(async ({ input, ctx }) => {
      const { alertId, notes } = input;
      
      try {
        // Get the alert
        const [alert] = await db
          .select()
          .from(alerts)
          .where(eq(alerts.id, alertId))
          .limit(1);

        if (!alert) {
          throw new Error('Alert not found');
        }

        if (alert.status !== 'active') {
          throw new Error('Alert is not active');
        }

        // Calculate response time
        const responseTimeSeconds = Math.floor(
          (Date.now() - alert.createdAt.getTime()) / 1000
        );

        // Update alert status
        await db
          .update(alerts)
          .set({
            status: 'acknowledged',
            acknowledgedBy: ctx.user.id,
            acknowledgedAt: new Date(),
          })
          .where(eq(alerts.id, alertId));

        // Create acknowledgment record
        await db.insert(alertAcknowledgments).values({
          alertId,
          userId: ctx.user.id,
          responseTimeSeconds,
          notes,
        });

        // Log the acknowledgment
        await db.insert(healthcareAuditLogs).values({
          userId: ctx.user.id,
          action: 'alert_acknowledged',
          entityType: 'alert',
          entityId: alertId,
          hospitalId: alert.hospitalId,
          metadata: {
            responseTimeSeconds,
            escalationLevel: alert.escalationLevel,
          },
          ipAddress: ctx.headers?.['x-forwarded-for'] || ctx.headers?.['x-real-ip'],
          userAgent: ctx.headers?.['user-agent'],
        });

        // Emit alert acknowledged event
        await alertEventHelpers.emitAlertAcknowledged(
          alertId,
          alert.hospitalId,
          ctx.user.id
        );

        log.info('Alert acknowledged', 'HEALTHCARE', {
          alertId,
          acknowledgedBy: ctx.user.id,
          responseTimeSeconds,
        });

        return {
          success: true,
          responseTimeSeconds,
        };
      } catch (error) {
        log.error('Failed to acknowledge alert', 'HEALTHCARE', error);
        throw error;
      }
    }),

  // Resolve an alert
  resolveAlert: doctorProcedure
    .input(z.object({
      alertId: z.string().uuid(),
      resolution: z.string().min(10, "Resolution notes must be at least 10 characters"),
    }))
    .mutation(async ({ input, ctx }) => {
      const { alertId, resolution } = input;
      
      try {
        // Update alert status
        const [resolvedAlert] = await db
          .update(alerts)
          .set({
            status: 'resolved',
            resolvedAt: new Date(),
            description: resolution,
          })
          .where(
            and(
              eq(alerts.id, alertId),
              eq(alerts.status, 'acknowledged')
            )
          )
          .returning();

        if (!resolvedAlert) {
          throw new Error('Alert not found or not acknowledged');
        }

        // Log the resolution
        await db.insert(healthcareAuditLogs).values({
          userId: ctx.user.id,
          action: 'alert_resolved',
          entityType: 'alert',
          entityId: alertId,
          hospitalId: resolvedAlert.hospitalId,
          metadata: {
            resolution,
            totalTimeSeconds: Math.floor(
              (resolvedAlert.resolvedAt.getTime() - resolvedAlert.createdAt.getTime()) / 1000
            ),
          },
          ipAddress: ctx.headers?.['x-forwarded-for'] || ctx.headers?.['x-real-ip'],
          userAgent: ctx.headers?.['user-agent'],
        });

        // Emit alert resolved event
        await alertEventHelpers.emitAlertResolved(
          alertId,
          resolvedAlert.hospitalId,
          ctx.user.id,
          resolution
        );

        return {
          success: true,
          alert: resolvedAlert,
        };
      } catch (error) {
        log.error('Failed to resolve alert', 'HEALTHCARE', error);
        throw error;
      }
    }),

  // Get alert history
  getAlertHistory: viewAlertsProcedure
    .input(z.object({
      hospitalId: z.string().uuid(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { hospitalId, startDate, endDate, limit, offset } = input;
      
      try {
        let query = db
          .select()
          .from(alerts)
          .where(eq(alerts.hospitalId, hospitalId));

        if (startDate) {
          query = query.where(gte(alerts.createdAt, startDate));
        }

        if (endDate) {
          query = query.where(lte(alerts.createdAt, endDate));
        }

        const alertHistory = await query
          .orderBy(desc(alerts.createdAt))
          .limit(limit)
          .offset(offset);

        return {
          alerts: alertHistory,
          total: alertHistory.length,
        };
      } catch (error) {
        log.error('Failed to fetch alert history', 'HEALTHCARE', error);
        throw new Error('Failed to fetch alert history');
      }
    }),

  // Update user healthcare profile
  updateHealthcareProfile: protectedProcedure
    .input(HealthcareProfileSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if healthcare user record exists
        const existing = await db
          .select()
          .from(healthcareUsers)
          .where(eq(healthcareUsers.userId, ctx.user.id))
          .limit(1);

        if (existing.length > 0) {
          // Update existing record
          await db
            .update(healthcareUsers)
            .set(input)
            .where(eq(healthcareUsers.userId, ctx.user.id));
        } else {
          // Create new record
          await db.insert(healthcareUsers).values({
            userId: ctx.user.id,
            ...input,
          });
        }

        return {
          success: true,
        };
      } catch (error) {
        log.error('Failed to update healthcare profile', 'HEALTHCARE', error);
        throw new Error('Failed to update healthcare profile');
      }
    }),

  // Admin: Update user role
  updateUserRole: adminProcedure
    .input(UpdateUserRoleSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId, role } = input;
      
      try {
        // Update user role
        await db
          .update(users)
          .set({ role })
          .where(eq(users.id, userId));

        // Log the role change
        await db.insert(healthcareAuditLogs).values({
          userId: ctx.user.id,
          action: 'role_changed',
          entityType: 'user',
          entityId: userId,
          hospitalId: input.hospitalId,
          metadata: {
            newRole: role,
            changedBy: ctx.user.id,
          },
          ipAddress: ctx.headers?.['x-forwarded-for'] || ctx.headers?.['x-real-ip'],
          userAgent: ctx.headers?.['user-agent'],
        });

        return {
          success: true,
        };
      } catch (error) {
        log.error('Failed to update user role', 'HEALTHCARE', error);
        throw new Error('Failed to update user role');
      }
    }),

  // Get user's current on-duty status
  getOnDutyStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const [healthcareUser] = await db
          .select()
          .from(healthcareUsers)
          .where(eq(healthcareUsers.userId, ctx.user.id))
          .limit(1);

        return {
          isOnDuty: healthcareUser?.isOnDuty || false,
          shiftStartTime: healthcareUser?.shiftStartTime,
          shiftEndTime: healthcareUser?.shiftEndTime,
        };
      } catch (error) {
        log.error('Failed to get on-duty status', 'HEALTHCARE', error);
        throw new Error('Failed to get on-duty status');
      }
    }),

  // Toggle on-duty status
  toggleOnDuty: protectedProcedure
    .input(z.object({
      isOnDuty: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const now = new Date();
        
        await db
          .update(healthcareUsers)
          .set({
            isOnDuty: input.isOnDuty,
            shiftStartTime: input.isOnDuty ? now : null,
            shiftEndTime: input.isOnDuty ? null : now,
          })
          .where(eq(healthcareUsers.userId, ctx.user.id));

        return {
          success: true,
          isOnDuty: input.isOnDuty,
        };
      } catch (error) {
        log.error('Failed to toggle on-duty status', 'HEALTHCARE', error);
        throw new Error('Failed to toggle on-duty status');
      }
    }),

  // Get escalation status for an alert
  getEscalationStatus: viewAlertsProcedure
    .input(z.object({
      alertId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      try {
        const status = await escalationTimerService.getEscalationStatus(input.alertId);
        return status;
      } catch (error) {
        log.error('Failed to get escalation status', 'HEALTHCARE', error);
        throw new Error('Failed to get escalation status');
      }
    }),

  // Get escalation history for an alert
  getEscalationHistory: viewAlertsProcedure
    .input(z.object({
      alertId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      try {
        const escalations = await db
          .select({
            escalation: alertEscalations,
            alertInfo: {
              id: alerts.id,
              roomNumber: alerts.roomNumber,
              alertType: alerts.alertType,
            },
          })
          .from(alertEscalations)
          .leftJoin(alerts, eq(alertEscalations.alertId, alerts.id))
          .where(eq(alertEscalations.alertId, input.alertId))
          .orderBy(desc(alertEscalations.escalatedAt));

        return {
          escalations,
          total: escalations.length,
        };
      } catch (error) {
        log.error('Failed to get escalation history', 'HEALTHCARE', error);
        throw new Error('Failed to get escalation history');
      }
    }),

  // Manually trigger escalation (admin only)
  triggerEscalation: adminProcedure
    .input(z.object({
      alertId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await escalationTimerService.triggerEscalation(input.alertId);
        
        // Log manual escalation
        await db.insert(healthcareAuditLogs).values({
          userId: ctx.user.id,
          action: 'manual_escalation',
          entityType: 'alert',
          entityId: input.alertId,
          hospitalId: ctx.user.organizationId,
          metadata: result,
          ipAddress: ctx.headers?.['x-forwarded-for'] || ctx.headers?.['x-real-ip'],
          userAgent: ctx.headers?.['user-agent'],
        });

        return result;
      } catch (error) {
        log.error('Failed to trigger manual escalation', 'HEALTHCARE', error);
        throw error;
      }
    }),

  // Get active escalations summary for dashboard
  getActiveEscalations: viewAlertsProcedure
    .input(z.object({
      hospitalId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      try {
        // Get all active alerts with their escalation status
        const activeAlerts = await db
          .select({
            id: alerts.id,
            roomNumber: alerts.roomNumber,
            alertType: alerts.alertType,
            urgencyLevel: alerts.urgencyLevel,
            currentEscalationTier: alerts.currentEscalationTier,
            nextEscalationAt: alerts.nextEscalationAt,
            createdAt: alerts.createdAt,
            acknowledgedAt: alerts.acknowledgedAt,
          })
          .from(alerts)
          .where(
            and(
              eq(alerts.hospitalId, input.hospitalId),
              eq(alerts.status, 'active')
            )
          )
          .orderBy(desc(alerts.currentEscalationTier), desc(alerts.urgencyLevel));

        // Calculate time until next escalation for each alert
        const alertsWithTiming = activeAlerts.map(alert => {
          const timeUntilEscalation = alert.nextEscalationAt
            ? Math.max(0, alert.nextEscalationAt.getTime() - Date.now())
            : null;

          return {
            ...alert,
            timeUntilEscalation,
            isOverdue: timeUntilEscalation === 0,
            minutesUntilEscalation: timeUntilEscalation ? Math.ceil(timeUntilEscalation / 60000) : null,
          };
        });

        // Group by escalation tier
        const byTier = alertsWithTiming.reduce((acc, alert) => {
          const tier = alert.currentEscalationTier;
          if (!acc[tier]) {
            acc[tier] = [];
          }
          acc[tier].push(alert);
          return acc;
        }, {} as Record<number, typeof alertsWithTiming>);

        return {
          totalActive: activeAlerts.length,
          byTier,
          overdue: alertsWithTiming.filter(a => a.isOverdue).length,
          nextEscalationIn5Minutes: alertsWithTiming.filter(
            a => a.minutesUntilEscalation && a.minutesUntilEscalation <= 5
          ).length,
        };
      } catch (error) {
        log.error('Failed to get active escalations', 'HEALTHCARE', error);
        throw new Error('Failed to get active escalations');
      }
    }),

  // Get metrics for dashboard
  getMetrics: viewAlertsProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '6h', '24h', '7d']).default('24h'),
      department: z.string().default('all'),
    }))
    .query(async ({ input }) => {
      try {
        // Mock metrics data (in a real app, this would aggregate from database)
        const activeAlerts = Math.floor(Math.random() * 10) + 5;
        const staffOnline = Math.floor(Math.random() * 20) + 15;
        
        const metrics = {
          // Primary metrics
          activeAlerts,
          alertsTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 20) - 10 : 0,
          alertCapacity: 50,
          
          // Response times
          avgResponseTime: parseFloat((Math.random() * 5 + 1).toFixed(1)),
          
          // Staff metrics
          staffOnline,
          totalStaff: 30,
          minStaffRequired: 15,
          
          // Alert breakdown
          criticalAlerts: Math.floor(activeAlerts * 0.2),
          urgentAlerts: Math.floor(activeAlerts * 0.3),
          standardAlerts: Math.floor(activeAlerts * 0.5),
          resolvedToday: Math.floor(Math.random() * 20) + 10,
          
          // Department stats
          departmentStats: [
            { id: 'emergency', name: 'Emergency', alerts: 3, responseRate: 0.95 },
            { id: 'icu', name: 'ICU', alerts: 2, responseRate: 0.98 },
            { id: 'cardiology', name: 'Cardiology', alerts: 1, responseRate: 0.92 },
            { id: 'general', name: 'General', alerts: 4, responseRate: 0.88 },
          ],
        };
        
        log.info('Metrics fetched', 'HEALTHCARE', {
          timeRange: input.timeRange,
          department: input.department,
        });
        
        return metrics;
      } catch (error) {
        log.error('Failed to fetch metrics', 'HEALTHCARE', error);
        throw new Error('Failed to fetch metrics');
      }
    }),
    
  // Get active alerts with more details
  getActiveAlerts: viewAlertsProcedure
    .input(z.object({
      includeResolved: z.boolean().default(false),
    }))
    .query(async ({ ctx }) => {
      try {
        // Mock enhanced alert data
        const mockAlerts = [
          {
            id: 'alert-1',
            roomNumber: '302',
            alertType: 'cardiac' as const,
            urgency: 5,
            description: 'Patient experiencing chest pain',
            status: 'active' as const,
            createdAt: new Date(Date.now() - 5 * 60 * 1000),
            createdBy: 'user-1',
            createdByName: 'Operator Smith',
            hospitalId: 'hospital-1',
            acknowledged: false,
            acknowledgedAt: null,
            acknowledgedBy: null,
            acknowledgedByName: null,
            resolved: false,
            resolvedAt: null,
            resolvedBy: null,
            resolvedByName: null,
          },
          {
            id: 'alert-2',
            roomNumber: '215',
            alertType: 'fall' as const,
            urgency: 3,
            description: 'Patient fall detected',
            status: 'acknowledged' as const,
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
            createdBy: 'user-2',
            createdByName: 'Operator Johnson',
            hospitalId: 'hospital-1',
            acknowledged: true,
            acknowledgedAt: new Date(Date.now() - 10 * 60 * 1000),
            acknowledgedBy: 'user-3',
            acknowledgedByName: 'Nurse Davis',
            resolved: false,
            resolvedAt: null,
            resolvedBy: null,
            resolvedByName: null,
          },
        ];
        
        const alerts = mockAlerts.filter(alert => 
          !alert.resolved || input.includeResolved
        );
        
        return {
          alerts,
          total: alerts.length,
        };
      } catch (error) {
        log.error('Failed to fetch active alerts', 'HEALTHCARE', error);
        throw new Error('Failed to fetch active alerts');
      }
    }),
    
  // Subscribe to alerts using real-time events
  subscribeToAlerts: viewAlertsProcedure
    .input(z.object({
      hospitalId: z.string().uuid(),
    }).optional())
    .subscription(({ input, ctx }) => {
      return observable<any>((emit) => {
        const hospitalId = input?.hospitalId || ctx.user.organizationId || 'hospital-1';
        
        log.info('Alert subscription started', 'HEALTHCARE', {
          userId: ctx.user.id,
          hospitalId,
        });
        
        // Subscribe to real-time alert events
        const unsubscribe = realtimeEvents.subscribeToHospitalAlerts(
          hospitalId,
          (event) => {
            emit.next({
              type: event.type,
              data: event.data,
              timestamp: event.timestamp,
            });
          }
        );
        
        // Start mock data generator in development
        if (process.env.NODE_ENV === 'development') {
          startMockDataGenerator();
        }
        
        // Cleanup on unsubscribe
        return () => {
          log.info('Alert subscription ended', 'HEALTHCARE', {
            userId: ctx.user.id,
            hospitalId,
          });
          unsubscribe();
        };
      });
    }),
    
  // Subscribe to metrics using real-time events
  subscribeToMetrics: viewAlertsProcedure
    .input(z.object({
      hospitalId: z.string().uuid(),
    }).optional())
    .subscription(({ input, ctx }) => {
      return observable<any>((emit) => {
        const hospitalId = input?.hospitalId || ctx.user.organizationId || 'hospital-1';
        
        log.info('Metrics subscription started', 'HEALTHCARE', {
          userId: ctx.user.id,
          hospitalId,
        });
        
        // Subscribe to real-time metrics events
        const unsubscribe = realtimeEvents.subscribeToMetrics(
          hospitalId,
          (event) => {
            emit.next(event.data);
          }
        );
        
        // Start mock data generator in development
        if (process.env.NODE_ENV === 'development') {
          startMockDataGenerator();
        }
        
        // Cleanup on unsubscribe
        return () => {
          log.info('Metrics subscription ended', 'HEALTHCARE', {
            userId: ctx.user.id,
            hospitalId,
          });
          unsubscribe();
        };
      });
    }),
    
  // Acknowledge patient alert (for patient card)
  acknowledgePatientAlert: doctorProcedure
    .input(z.object({
      alertId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // In a real app, this would update the database
        log.info('Patient alert acknowledged', 'HEALTHCARE', {
          alertId: input.alertId,
          userId: ctx.user.id,
        });
        
        return {
          success: true,
          alertId: input.alertId,
          acknowledged: true,
          acknowledgedAt: new Date(),
          acknowledgedBy: ctx.user.id,
        };
      } catch (error) {
        log.error('Failed to acknowledge patient alert', 'HEALTHCARE', error);
        throw new Error('Failed to acknowledge patient alert');
      }
    }),
});