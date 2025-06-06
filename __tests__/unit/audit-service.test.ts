import { describe, it, expect } from '@jest/globals';

// Simple test for audit service types and exports
describe('Audit Service', () => {
  it('should export audit enums and types', async () => {
    const auditModule = await import('@/src/server/services/audit');
    
    expect(auditModule.AuditAction).toBeDefined();
    expect(auditModule.AuditOutcome).toBeDefined();
    expect(auditModule.AuditSeverity).toBeDefined();
    expect(auditModule.auditService).toBeDefined();
  });

  it('should have correct audit action values', async () => {
    const { AuditAction } = await import('@/src/server/services/audit');
    
    expect(AuditAction.LOGIN).toBe('LOGIN');
    expect(AuditAction.LOGOUT).toBe('LOGOUT');
    expect(AuditAction.USER_CREATED).toBe('USER_CREATED');
    expect(AuditAction.DATA_VIEWED).toBe('DATA_VIEWED');
  });

  it('should have correct audit outcome values', async () => {
    const { AuditOutcome } = await import('@/src/server/services/audit');
    
    expect(AuditOutcome.SUCCESS).toBe('SUCCESS');
    expect(AuditOutcome.FAILURE).toBe('FAILURE');
    expect(AuditOutcome.PARTIAL_SUCCESS).toBe('PARTIAL_SUCCESS');
  });

  it('should have correct audit severity values', async () => {
    const { AuditSeverity } = await import('@/src/server/services/audit');
    
    expect(AuditSeverity.INFO).toBe('INFO');
    expect(AuditSeverity.WARNING).toBe('WARNING');
    expect(AuditSeverity.ERROR).toBe('ERROR');
    expect(AuditSeverity.CRITICAL).toBe('CRITICAL');
  });
});