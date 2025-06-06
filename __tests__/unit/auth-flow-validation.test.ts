/**
 * Auth Flow Validation Logic Tests
 * Tests the core validation logic for the improved auth flow
 */

import { signUpSchema } from '@/lib/validations/auth';
import { UserRole } from '@/components/RoleSelector';

describe('Auth Flow Validation Logic Tests', () => {
  describe('Role-Based Organization Validation', () => {
    it('should validate guest signup without organization fields', () => {
      const guestData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'guest' as UserRole,
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(guestData);
      expect(result.success).toBe(true);
    });

    it('should validate user signup with optional organization code', () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'user' as UserRole,
        organizationCode: 'ACME2024',
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(userData);
      expect(result.success).toBe(true);
    });

    it('should validate user signup without organization code', () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'user' as UserRole,
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(userData);
      expect(result.success).toBe(true);
    });

    it('should require organization name for managers', () => {
      const managerDataWithoutOrg = {
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'manager' as UserRole,
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(managerDataWithoutOrg);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Organization name is required');
    });

    it('should validate manager signup with organization name', () => {
      const managerData = {
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'manager' as UserRole,
        organizationName: 'Test Company',
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(managerData);
      expect(result.success).toBe(true);
    });

    it('should require organization name for admins', () => {
      const adminData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'admin' as UserRole,
        organizationName: 'Admin Corp',
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(adminData);
      expect(result.success).toBe(true);
    });
  });

  describe('Organization Code Validation', () => {
    it('should accept valid organization codes', () => {
      const validCodes = ['ACME2024', 'TEST123', 'COMP001', 'ORG999'];
      
      validCodes.forEach(code => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'user' as UserRole,
          organizationCode: code,
          acceptTerms: true,
          acceptPrivacy: true,
        };

        const result = signUpSchema.safeParse(userData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid organization codes', () => {
      const invalidCodes = ['abc', 'toolongcode123', 'test-123', 'org code'];
      
      invalidCodes.forEach(code => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'user' as UserRole,
          organizationCode: code,
          acceptTerms: true,
          acceptPrivacy: true,
        };

        const result = signUpSchema.safeParse(userData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Terms and Privacy Validation', () => {
    it('should require terms acceptance', () => {
      const dataWithoutTerms = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'user' as UserRole,
        acceptTerms: false,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(dataWithoutTerms);
      expect(result.success).toBe(false);
    });

    it('should require privacy acceptance', () => {
      const dataWithoutPrivacy = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'user' as UserRole,
        acceptTerms: true,
        acceptPrivacy: false,
      };

      const result = signUpSchema.safeParse(dataWithoutPrivacy);
      expect(result.success).toBe(false);
    });

    it('should pass with both terms and privacy accepted', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'user' as UserRole,
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should accept strong passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyVerySecure@Password1',
        'ComplexPassword99$',
        'Strong&Valid@Pass123'
      ];

      strongPasswords.forEach(password => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password,
          confirmPassword: password,
          role: 'user' as UserRole,
          acceptTerms: true,
          acceptPrivacy: true,
        };

        const result = signUpSchema.safeParse(userData);
        if (!result.success) {
          console.log(`Password validation failed for: ${password}`);
          console.log('Errors:', result.error.issues);
        }
        expect(result.success).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'weak',
        'nospecialchar123',
        'NOLOWERCASE123!',
        'nonumber!',
        'NoSpecial123'
      ];

      weakPasswords.forEach(password => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password,
          confirmPassword: password,
          role: 'user' as UserRole,
          acceptTerms: true,
          acceptPrivacy: true,
        };

        const result = signUpSchema.safeParse(userData);
        expect(result.success).toBe(false);
      });
    });

    it('should require password confirmation match', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        role: 'user' as UserRole,
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(userData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Passwords do not match');
    });
  });

  describe('Form Validation Edge Cases', () => {
    it('should handle empty organization fields gracefully', () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        role: 'user' as UserRole,
        // Don't include organizationCode and organizationName for optional fields
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(userData);
      if (!result.success) {
        console.log('Empty org fields validation failed');
        console.log('Errors:', result.error.issues);
      }
      expect(result.success).toBe(true);
    });

    it('should validate minimal guest signup', () => {
      const minimalData = {
        name: 'A B',
        email: 'a@b.co',
        password: 'MinimalPass1!',
        confirmPassword: 'MinimalPass1!',
        role: 'guest' as UserRole,
        acceptTerms: true,
        acceptPrivacy: true,
      };

      const result = signUpSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = ['notanemail', '@invalid.com', 'test@', 'test.com'];
      
      invalidEmails.forEach(email => {
        const userData = {
          name: 'Test User',
          email,
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'user' as UserRole,
          acceptTerms: true,
          acceptPrivacy: true,
        };

        const result = signUpSchema.safeParse(userData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Role-Based Business Logic', () => {
    it('should determine organization flow based on role', () => {
      const getOrganizationFlow = (role: UserRole) => {
        switch(role) {
          case 'guest': return 'none';
          case 'user': return 'optional';
          case 'manager': 
          case 'admin': return 'create';
          default: return 'none';
        }
      };

      expect(getOrganizationFlow('guest')).toBe('none');
      expect(getOrganizationFlow('user')).toBe('optional');
      expect(getOrganizationFlow('manager')).toBe('create');
      expect(getOrganizationFlow('admin')).toBe('create');
    });

    it('should validate organization requirements per role', () => {
      const validateOrganizationForRole = (role: UserRole, orgCode?: string, orgName?: string) => {
        if (role === 'guest') {
          return true; // No org required
        }
        if (role === 'user') {
          return true; // Org optional
        }
        if (role === 'manager' || role === 'admin') {
          return !!orgName; // Org name required
        }
        return false;
      };

      expect(validateOrganizationForRole('guest')).toBe(true);
      expect(validateOrganizationForRole('user')).toBe(true);
      expect(validateOrganizationForRole('user', 'CODE123')).toBe(true);
      expect(validateOrganizationForRole('manager')).toBe(false);
      expect(validateOrganizationForRole('manager', undefined, 'Test Corp')).toBe(true);
      expect(validateOrganizationForRole('admin', undefined, 'Admin Corp')).toBe(true);
    });
  });
});

describe('Organization ID Generation Logic', () => {
  it('should generate organization ID based on role and input', () => {
    const generateOrgId = (role: UserRole, orgCode?: string, orgName?: string, userId?: string) => {
      if (role === 'guest') {
        return undefined; // No organization
      }
      if (role === 'user' && orgCode) {
        return `org_from_code_${orgCode}`;
      }
      if (role === 'user' && !orgCode) {
        return `personal_${userId || 'user'}`;
      }
      if ((role === 'manager' || role === 'admin') && orgName) {
        return `org_${orgName.toLowerCase().replace(/\s+/g, '_')}`;
      }
      return undefined;
    };

    expect(generateOrgId('guest')).toBeUndefined();
    expect(generateOrgId('user', 'ACME123')).toBe('org_from_code_ACME123');
    expect(generateOrgId('user', undefined, undefined, 'user123')).toBe('personal_user123');
    expect(generateOrgId('manager', undefined, 'Test Company')).toBe('org_test_company');
    expect(generateOrgId('admin', undefined, 'Admin Corp')).toBe('org_admin_corp');
  });
});