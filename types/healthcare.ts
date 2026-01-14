import { z } from 'zod';

// Healthcare User Roles
export const HealthcareUserRole = z.enum([
  'operator',
  'doctor', 
  'nurse',
  'head_doctor',
  'admin'
]);

export type HealthcareUserRole = z.infer<typeof HealthcareUserRole>;

// Alert Types
export const AlertType = z.enum([
  'cardiac_arrest',
  'code_blue',
  'fire',
  'security',
  'medical_emergency'
]);

export type AlertType = z.infer<typeof AlertType>;

// Urgency Levels
export const UrgencyLevel = z.union([
  z.literal(1), // Critical
  z.literal(2), // High
  z.literal(3), // Medium
  z.literal(4), // Low
  z.literal(5), // Information
]);

export type UrgencyLevel = z.infer<typeof UrgencyLevel>;

// Alert Status
export const AlertStatus = z.enum([
  'active',
  'acknowledged',
  'resolved'
]);

export type AlertStatus = z.infer<typeof AlertStatus>;

// Notification Types
export const NotificationType = z.enum([
  'push',
  'sms',
  'email',
  'in_app'
]);

export type NotificationType = z.infer<typeof NotificationType>;

// Healthcare Role Permissions
export const healthcareRolePermissions: Record<HealthcareUserRole, string[]> = {
  admin: ['*'], // Admin can access everything
  head_doctor: ['view_patients', 'acknowledge_alerts', 'view_analytics', 'manage_users', 'manage_departments'],
  doctor: ['view_patients', 'acknowledge_alerts', 'view_alerts'],
  nurse: ['acknowledge_alerts', 'view_alerts', 'view_tasks'],
  operator: ['create_alerts', 'view_alerts', 'view_logs'],
};

// Escalation Configuration
export interface EscalationConfig {
  role: HealthcareUserRole;
  timeout_minutes: number;
  next_tier: HealthcareUserRole | 'all_staff';
  notification_template: string;
}

export const HEALTHCARE_ESCALATION_TIERS: EscalationConfig[] = [
  { 
    role: 'nurse', 
    timeout_minutes: 2, 
    next_tier: 'doctor', 
    notification_template: 'tier_1_escalation' 
  },
  { 
    role: 'doctor', 
    timeout_minutes: 3, 
    next_tier: 'head_doctor', 
    notification_template: 'tier_2_escalation' 
  },
  { 
    role: 'head_doctor', 
    timeout_minutes: 2, 
    next_tier: 'all_staff', 
    notification_template: 'tier_3_escalation' 
  }
];

// Alert Type Configuration
export const ALERT_TYPE_CONFIG = {
  cardiac_arrest: {
    defaultUrgency: 1,
    color: '#FF0000',
    icon: '🚨',
    sound: 'critical',
    requiresConfirmation: true,
  },
  code_blue: {
    defaultUrgency: 2,
    color: '#0000FF',
    icon: '🚑',
    sound: 'urgent',
    requiresConfirmation: true,
  },
  fire: {
    defaultUrgency: 1,
    color: '#FF4500',
    icon: '🔥',
    sound: 'critical',
    requiresConfirmation: true,
  },
  security: {
    defaultUrgency: 2,
    color: '#800080',
    icon: '🔒',
    sound: 'urgent',
    requiresConfirmation: true,
  },
  medical_emergency: {
    defaultUrgency: 3,
    color: '#FFA500',
    icon: '⚕️',
    sound: 'normal',
    requiresConfirmation: false,
  },
};

// Urgency Level Configuration
export const URGENCY_LEVEL_CONFIG = {
  1: { label: 'Critical', color: '#FF0000', textColor: '#FFFFFF' },
  2: { label: 'High', color: '#FF4500', textColor: '#FFFFFF' },
  3: { label: 'Medium', color: '#FFA500', textColor: '#000000' },
  4: { label: 'Low', color: '#32CD32', textColor: '#000000' },
  5: { label: 'Information', color: '#4169E1', textColor: '#FFFFFF' },
};

// Healthcare-specific validation schemas
export const CreateAlertSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required").max(10),
  alertType: AlertType,
  urgencyLevel: UrgencyLevel,
  description: z.string().optional(),
  hospitalId: z.string().uuid(),
});

export const AcknowledgeAlertSchema = z.object({
  alertId: z.string().uuid(),
  notes: z.string().optional(),
});

export const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: HealthcareUserRole,
  hospitalId: z.string().uuid(),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
});

// Healthcare User Profile Schema
export const HealthcareProfileSchema = z.object({
  hospitalId: z.string().uuid(),
  licenseNumber: z.string().min(5, "License number must be at least 5 characters"),
  department: z.string().min(2, "Department is required"),
  specialization: z.string().optional(),
  isOnDuty: z.boolean().default(false),
});

// Type exports
export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;
export type AcknowledgeAlertInput = z.infer<typeof AcknowledgeAlertSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type HealthcareProfileInput = z.infer<typeof HealthcareProfileSchema>;