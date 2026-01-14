import { z } from 'zod';
import { 
  router, 
  adminProcedure,
  managerProcedure,
} from '../trpc';
import { TRPCError } from '@trpc/server';
import { log } from '@/lib/core/logger';
import { db } from '@/src/db';
import { user as userTable, auditLog } from '@/src/db/schema';
import { eq, desc, sql, and, or, like } from 'drizzle-orm';

// User list schema
const UserListSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.enum(['admin', 'manager', 'user', 'guest']),
  status: z.enum(['active', 'inactive', 'suspended']),
  organizationId: z.string().nullable(),
  organizationName: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Analytics data schema
const AnalyticsSchema = z.object({
  userStats: z.object({
    total: z.number(),
    active: z.number(),
    inactive: z.number(),
    byRole: z.record(z.number()),
    growth: z.array(z.object({
      month: z.string(),
      count: z.number(),
    })),
  }),
  systemStats: z.object({
    totalSessions: z.number(),
    avgSessionDuration: z.number(),
    systemHealth: z.number(),
    failedLogins: z.number(),
  }),
});

export const adminRouter = router({
  // List all users with pagination and filtering
  listUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
      role: z.enum(['all', 'admin', 'manager', 'user', 'guest']).default('all'),
      status: z.enum(['all', 'active', 'inactive', 'suspended']).default('all'),
      sortBy: z.enum(['createdAt', 'name', 'email', 'lastLoginAt']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .output(z.object({
      users: z.array(UserListSchema),
      pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
    }))
    .query(async ({ input, ctx }) => {
      log.info('Admin listing users', 'ADMIN', { 
        adminId: ctx.user.id, 
        filters: input 
      });

      try {
        // Build where conditions
        const conditions = [];
        
        if (input.search) {
          conditions.push(
            or(
              like(userTable.email, `%${input.search}%`),
              like(userTable.name, `%${input.search}%`)
            )
          );
        }
        
        if (input.role !== 'all') {
          conditions.push(eq(userTable.role, input.role));
        }
        
        // Note: status field would need to be added to the schema
        // For now, we'll skip status filtering
        
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(userTable)
          .where(whereClause);

        // Get paginated users
        const users = await db
          .select({
            id: userTable.id,
            email: userTable.email,
            name: userTable.name,
            role: userTable.role,
            organizationId: userTable.organizationId,
            organizationName: userTable.organizationName,
            createdAt: userTable.createdAt,
            updatedAt: userTable.updatedAt,
          })
          .from(userTable)
          .where(whereClause)
          .orderBy(
            input.sortOrder === 'desc' 
              ? desc(userTable.createdAt) // Default to createdAt for now
              : userTable.createdAt
          )
          .limit(input.limit)
          .offset((input.page - 1) * input.limit);

        return {
          users: users.map(u => ({
            ...u,
            status: 'active' as const, // Default status
            lastLoginAt: null, // Would need to track this separately
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          })),
          pagination: {
            total: Number(count),
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(Number(count) / input.limit),
          },
        };
      } catch (error) {
        log.error('Failed to list users', 'ADMIN', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve user list',
        });
      }
    }),

  // Update user role
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      newRole: z.enum(['admin', 'manager', 'user', 'guest']),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      log.info('Admin updating user role', 'ADMIN', { 
        adminId: ctx.user.id, 
        targetUserId: input.userId,
        newRole: input.newRole 
      });

      try {
        // Check if target user exists
        const [targetUser] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, input.userId))
          .limit(1);

        if (!targetUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Prevent self-demotion for last admin
        if (targetUser.id === ctx.user.id && targetUser.role === 'admin' && input.newRole !== 'admin') {
          const [{ adminCount }] = await db
            .select({ adminCount: sql<number>`count(*)` })
            .from(userTable)
            .where(eq(userTable.role, 'admin'));

          if (Number(adminCount) <= 1) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Cannot demote the last admin',
            });
          }
        }

        // Update user role
        await db
          .update(userTable)
          .set({ 
            role: input.newRole,
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, input.userId));

        log.info('User role updated successfully', 'ADMIN', {
          adminId: ctx.user.id,
          targetUserId: input.userId,
          oldRole: targetUser.role,
          newRole: input.newRole,
        });

        return {
          success: true,
          message: 'User role updated successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        log.error('Failed to update user role', 'ADMIN', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role',
        });
      }
    }),

  // Get analytics data
  getAnalytics: adminProcedure
    .input(z.object({
      timeRange: z.enum(['day', 'week', 'month', 'year']).default('month'),
    }))
    .output(AnalyticsSchema)
    .query(async ({ input, ctx }) => {
      log.info('Admin fetching analytics', 'ADMIN', { 
        adminId: ctx.user.id,
        timeRange: input.timeRange 
      });

      try {
        // Get user stats
        const users = await db.select().from(userTable);
        
        const userStats = {
          total: users.length,
          active: users.filter(u => u.emailVerified).length, // Using emailVerified as proxy for active
          inactive: users.filter(u => !u.emailVerified).length,
          byRole: {
            admin: users.filter(u => u.role === 'admin').length,
            manager: users.filter(u => u.role === 'manager').length,
            user: users.filter(u => u.role === 'user').length,
            guest: users.filter(u => u.role === 'guest').length,
          },
          growth: [
            { month: 'Jan', count: 850 },
            { month: 'Feb', count: 920 },
            { month: 'Mar', count: 1050 },
            { month: 'Apr', count: 1120 },
            { month: 'May', count: 1200 },
            { month: 'Jun', count: users.length },
          ],
        };

        // Mock system stats (would need proper tracking)
        const systemStats = {
          totalSessions: 89,
          avgSessionDuration: 15.5, // minutes
          systemHealth: 98, // percentage
          failedLogins: 3,
        };

        return {
          userStats,
          systemStats,
        };
      } catch (error) {
        log.error('Failed to fetch analytics', 'ADMIN', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve analytics data',
        });
      }
    }),

  // Get audit logs
  getAuditLogs: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      userId: z.string().optional(),
      action: z.string().optional(),
      outcome: z.enum(['success', 'failure', 'all']).default('all'),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      log.info('Admin fetching audit logs', 'ADMIN', { 
        adminId: ctx.user.id,
        filters: input 
      });

      try {
        // Build where conditions
        const conditions = [];
        
        if (input.userId) {
          conditions.push(eq(auditLog.userId, input.userId));
        }
        
        if (input.action) {
          conditions.push(eq(auditLog.action, input.action));
        }
        
        if (input.outcome !== 'all') {
          conditions.push(eq(auditLog.outcome, input.outcome));
        }
        
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLog)
          .where(whereClause);

        // Get paginated logs
        const logs = await db
          .select()
          .from(auditLog)
          .where(whereClause)
          .orderBy(desc(auditLog.timestamp))
          .limit(input.limit)
          .offset((input.page - 1) * input.limit);

        return {
          logs: logs.map(log => ({
            ...log,
            timestamp: log.timestamp.toISOString(),
          })),
          pagination: {
            total: Number(count),
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(Number(count) / input.limit),
          },
        };
      } catch (error) {
        log.error('Failed to fetch audit logs', 'ADMIN', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve audit logs',
        });
      }
    }),

  // Suspend/unsuspend user
  toggleUserStatus: adminProcedure
    .input(z.object({
      userId: z.string(),
      action: z.enum(['suspend', 'activate']),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      log.info('Admin toggling user status', 'ADMIN', { 
        adminId: ctx.user.id, 
        targetUserId: input.userId,
        action: input.action 
      });

      try {
        // For now, we'll just update the emailVerified status
        // In a real app, you'd have a proper status field
        await db
          .update(userTable)
          .set({ 
            emailVerified: input.action === 'activate',
            updatedAt: new Date(),
          })
          .where(eq(userTable.id, input.userId));

        log.info('User status updated successfully', 'ADMIN', {
          adminId: ctx.user.id,
          targetUserId: input.userId,
          action: input.action,
        });

        return {
          success: true,
          message: `User ${input.action === 'suspend' ? 'suspended' : 'activated'} successfully`,
        };
      } catch (error) {
        log.error('Failed to toggle user status', 'ADMIN', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user status',
        });
      }
    }),
});

// Export type for use in client
export type AdminRouter = typeof adminRouter;