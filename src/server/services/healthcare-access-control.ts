import { z } from 'zod';
import { Role } from './access-control';
import { HealthcareUserRole } from '@/types/healthcare';

// Extend ResourceType for healthcare
export enum HealthcareResourceType {
  ALERT = 'alert',
  PATIENT = 'patient',
  MEDICAL_RECORD = 'medical_record',
  DEPARTMENT = 'department',
  HOSPITAL = 'hospital',
  SHIFT = 'shift',
}

// Healthcare-specific actions
export enum HealthcareAction {
  CREATE_ALERT = 'create_alert',
  ACKNOWLEDGE_ALERT = 'acknowledge_alert',
  RESOLVE_ALERT = 'resolve_alert',
  VIEW_ALERTS = 'view_alerts',
  VIEW_PATIENTS = 'view_patients',
  MANAGE_DEPARTMENTS = 'manage_departments',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SHIFTS = 'manage_shifts',
}

// Map healthcare roles to their permissions
export const HEALTHCARE_ROLE_PERMISSIONS: Record<HealthcareUserRole, string[]> = {
  admin: ['*'], // All permissions
  head_doctor: [
    'view_patients',
    'acknowledge_alerts',
    'resolve_alerts',
    'view_alerts',
    'view_analytics',
    'manage_departments',
    'manage_shifts',
  ],
  doctor: [
    'view_patients',
    'acknowledge_alerts',
    'resolve_alerts',
    'view_alerts',
  ],
  nurse: [
    'acknowledge_alerts',
    'view_alerts',
    'view_patients',
  ],
  operator: [
    'create_alerts',
    'view_alerts',
  ],
};

// Define permission requirements for healthcare actions
export const HEALTHCARE_ACTION_PERMISSIONS = {
  createAlert: ['create_alerts'],
  acknowledgeAlert: ['acknowledge_alerts'],
  resolveAlert: ['resolve_alerts'],
  viewAlerts: ['view_alerts'],
  viewPatients: ['view_patients'],
  manageDepartments: ['manage_departments'],
  viewAnalytics: ['view_analytics'],
  manageShifts: ['manage_shifts'],
};

// Check if a healthcare role has a specific permission
export function hasHealthcarePermission(
  role: HealthcareUserRole,
  permission: string
): boolean {
  const rolePermissions = HEALTHCARE_ROLE_PERMISSIONS[role];
  
  // Admin has all permissions
  if (rolePermissions.includes('*')) {
    return true;
  }
  
  return rolePermissions.includes(permission);
}

// Check if a healthcare role can perform a specific action
export function canPerformHealthcareAction(
  role: HealthcareUserRole,
  action: keyof typeof HEALTHCARE_ACTION_PERMISSIONS
): boolean {
  const requiredPermissions = HEALTHCARE_ACTION_PERMISSIONS[action];
  
  // Check if the role has any of the required permissions
  return requiredPermissions.some(permission => 
    hasHealthcarePermission(role, permission)
  );
}

// Get all permissions for a healthcare role
export function getHealthcareRolePermissions(role: HealthcareUserRole): string[] {
  return HEALTHCARE_ROLE_PERMISSIONS[role] || [];
}

// Check if a role can escalate alerts
export function canEscalateAlerts(role: HealthcareUserRole): boolean {
  return ['admin', 'head_doctor'].includes(role);
}

// Check if a role can create alerts
export function canCreateAlerts(role: HealthcareUserRole): boolean {
  return hasHealthcarePermission(role, 'create_alerts');
}

// Check if a role can acknowledge alerts
export function canAcknowledgeAlerts(role: HealthcareUserRole): boolean {
  return hasHealthcarePermission(role, 'acknowledge_alerts');
}

// Check if a role can view patient data
export function canViewPatients(role: HealthcareUserRole): boolean {
  return hasHealthcarePermission(role, 'view_patients');
}

// Get escalation hierarchy for a given role
export function getEscalationHierarchy(role: HealthcareUserRole): HealthcareUserRole[] {
  const hierarchy: Record<HealthcareUserRole, HealthcareUserRole[]> = {
    nurse: ['doctor', 'head_doctor'],
    doctor: ['head_doctor'],
    head_doctor: [],
    operator: ['nurse', 'doctor', 'head_doctor'],
    admin: [],
  };
  
  return hierarchy[role] || [];
}

// Check if a role is on duty (mock implementation)
export async function isUserOnDuty(userId: string): Promise<boolean> {
  // In production, this would check the database
  // For now, return true for demo purposes
  return true;
}

// Healthcare access utility functions
export const healthcareAccessUtils = {
  /**
   * Check if user can create alerts
   */
  canCreateAlert(role: HealthcareUserRole): boolean {
    return canCreateAlerts(role);
  },

  /**
   * Check if user can acknowledge alerts
   */
  canAcknowledgeAlert(role: HealthcareUserRole): boolean {
    return canAcknowledgeAlerts(role);
  },

  /**
   * Check if user can resolve alerts
   */
  canResolveAlert(role: HealthcareUserRole): boolean {
    return hasHealthcarePermission(role, 'resolve_alerts');
  },

  /**
   * Check if user can view analytics
   */
  canViewAnalytics(role: HealthcareUserRole): boolean {
    return hasHealthcarePermission(role, 'view_analytics');
  },

  /**
   * Check if user can manage departments
   */
  canManageDepartments(role: HealthcareUserRole): boolean {
    return hasHealthcarePermission(role, 'manage_departments');
  },

  /**
   * Get user capabilities based on healthcare role
   */
  getUserCapabilities(role: HealthcareUserRole): Record<string, boolean> {
    return {
      canCreateAlerts: canCreateAlerts(role),
      canAcknowledgeAlerts: canAcknowledgeAlerts(role),
      canResolveAlerts: hasHealthcarePermission(role, 'resolve_alerts'),
      canViewAlerts: hasHealthcarePermission(role, 'view_alerts'),
      canViewPatients: canViewPatients(role),
      canViewAnalytics: hasHealthcarePermission(role, 'view_analytics'),
      canManageDepartments: hasHealthcarePermission(role, 'manage_departments'),
      canManageShifts: hasHealthcarePermission(role, 'manage_shifts'),
      canEscalateAlerts: canEscalateAlerts(role),
    };
  },

  /**
   * Get next escalation role
   */
  getNextEscalationRole(currentRole: HealthcareUserRole): HealthcareUserRole | null {
    const hierarchy = getEscalationHierarchy(currentRole);
    return hierarchy.length > 0 ? hierarchy[0] : null;
  },
};