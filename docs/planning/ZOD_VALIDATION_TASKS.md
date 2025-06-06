# 🛡️ Zod Validation Tasks - Runtime Type Safety

## 📊 Module Status
- **Current Grade**: C (Basic validation only)
- **Target Grade**: A (100% complete)
- **Priority**: 🟠 High
- **Estimated Time**: 6 hours
- **Dependencies**: Cross-cutting (affects all modules)

## 🎯 Objective
Implement comprehensive Zod v4 validation schemas for runtime type safety and enhanced error handling across the entire application, ensuring healthcare-grade data validation.

## 🚨 Issues Identified
1. **Basic Validation**: Only basic Zod usage in some tRPC procedures
2. **No Centralized Schemas**: Validation logic scattered across codebase
3. **Missing Healthcare Validation**: No medical-specific validation rules
4. **Poor Error Messages**: Generic validation errors without context
5. **No Client-Side Validation**: Server-only validation patterns

## 📋 Task Breakdown

### **Task 1: Create Comprehensive Validation Schemas**
**Priority**: 🟠 High | **Time**: 3h | **Status**: ❌ Not Started

**Description**: Create centralized Zod schemas for all data types with healthcare-specific validation rules.

**Target Implementation**:
```typescript
// lib/validations/auth.ts
import { z } from 'zod';

// Healthcare-specific validation helpers
const medicalLicenseSchema = z.string()
  .regex(/^[A-Z]{2}\d{6,8}$/, 'Invalid medical license format (e.g., MD123456)')
  .optional();

const phoneSchema = z.string()
  .regex(/^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/, 'Invalid phone number format')
  .transform(val => val.replace(/\D/g, ''));

// Enhanced authentication schemas
export const signInSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim()
    .max(254, 'Email address too long'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  rememberMe: z.boolean().optional().default(false),
  deviceId: z.string().uuid().optional(),
});

export const signUpSchema = z.object({
  // Personal information
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
    .trim(),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  
  // Healthcare-specific fields
  role: z.enum(['operator', 'doctor', 'nurse', 'head_doctor'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  department: z.string()
    .min(1, 'Department is required')
    .max(50, 'Department name too long')
    .trim(),
  hospitalId: z.string()
    .uuid('Invalid hospital ID'),
  licenseNumber: medicalLicenseSchema,
  specialization: z.string()
    .max(100, 'Specialization too long')
    .optional(),
  phone: phoneSchema.optional(),
  
  // Emergency contact
  emergencyContact: z.object({
    name: z.string().min(2).max(100),
    phone: phoneSchema,
    relationship: z.enum(['spouse', 'parent', 'sibling', 'child', 'other']),
  }).optional(),
}).refine(data => {
  // Doctor and Head Doctor must have license number
  if (['doctor', 'head_doctor'].includes(data.role) && !data.licenseNumber) {
    return false;
  }
  return true;
}, {
  message: 'Medical license number is required for doctors',
  path: ['licenseNumber'],
});

// 2FA schemas
export const setup2FASchema = z.object({
  secret: z.string().length(32, 'Invalid 2FA secret'),
  qrCode: z.string().url('Invalid QR code URL'),
});

export const verify2FASchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
  backupCode: z.string()
    .length(8, 'Backup code must be 8 characters')
    .optional(),
}).refine(data => data.code || data.backupCode, {
  message: 'Either verification code or backup code is required',
});

// Session management schemas
export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string().min(32),
  deviceId: z.string().uuid(),
  deviceName: z.string().max(100),
  platform: z.enum(['ios', 'android', 'web']),
  ipAddress: z.string().ip(),
  userAgent: z.string().max(500),
  createdAt: z.date(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean(),
});

// Error response schema
export const authErrorSchema = z.object({
  code: z.enum([
    'INVALID_CREDENTIALS',
    'ACCOUNT_LOCKED',
    'SESSION_EXPIRED', 
    'TWO_FACTOR_REQUIRED',
    'RATE_LIMITED',
    'VALIDATION_ERROR',
  ]),
  message: z.string(),
  field: z.string().optional(),
  details: z.record(z.any()).optional(),
});

// Export inferred types
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type Setup2FAInput = z.infer<typeof setup2FASchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type SessionData = z.infer<typeof sessionSchema>;
export type AuthError = z.infer<typeof authErrorSchema>;
```

**Hospital & Department Schemas**:
```typescript
// lib/validations/hospitals.ts
import { z } from 'zod';

export const hospitalSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .min(2, 'Hospital name must be at least 2 characters')
    .max(200, 'Hospital name too long')
    .trim(),
  address: z.object({
    street: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    state: z.string().length(2, 'State must be 2-letter code'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().length(2).default('US'),
  }),
  phone: phoneSchema,
  licenseNumber: z.string()
    .regex(/^[A-Z0-9]{6,12}$/, 'Invalid hospital license number'),
  accreditation: z.array(z.enum(['JCAHO', 'CMS', 'HIPAA', 'HITECH'])),
  isActive: z.boolean().default(true),
  settings: z.object({
    alertTimeout: z.number().int().min(30).max(600).default(120), // seconds
    escalationLevels: z.number().int().min(2).max(5).default(3),
    maxConcurrentSessions: z.number().int().min(1).max(10).default(5),
    sessionTimeout: z.number().int().min(1800).max(28800).default(28800), // 8 hours
  }),
});

export const departmentSchema = z.object({
  id: z.string().uuid(),
  hospitalId: z.string().uuid(),
  name: z.string().min(2).max(100).trim(),
  code: z.string()
    .min(2, 'Department code must be at least 2 characters')
    .max(10, 'Department code too long')
    .regex(/^[A-Z0-9]+$/, 'Department code must be uppercase letters and numbers')
    .transform(val => val.toUpperCase()),
  type: z.enum([
    'EMERGENCY', 'ICU', 'SURGERY', 'CARDIOLOGY', 'NEUROLOGY',
    'PEDIATRICS', 'MATERNITY', 'ONCOLOGY', 'RADIOLOGY', 'LABORATORY'
  ]),
  floor: z.number().int().min(-5).max(50),
  capacity: z.number().int().min(1).max(1000),
  isActive: z.boolean().default(true),
});
```

**Alert System Schemas (Phase 2 Prep)**:
```typescript
// lib/validations/alerts.ts
import { z } from 'zod';

export const alertSchema = z.object({
  id: z.string().uuid(),
  hospitalId: z.string().uuid(),
  departmentId: z.string().uuid(),
  
  // Alert content
  title: z.string()
    .min(3, 'Alert title must be at least 3 characters')
    .max(100, 'Alert title too long')
    .trim(),
  description: z.string()
    .max(500, 'Alert description too long')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Invalid priority level' })
  }),
  alertType: z.enum([
    'medical_emergency', 'cardiac_arrest', 'fire', 'security',
    'evacuation', 'hazmat', 'patient_missing', 'equipment_failure'
  ]),
  roomNumber: z.string()
    .regex(/^[A-Z0-9\-]+$/, 'Invalid room number format')
    .max(20, 'Room number too long')
    .optional(),
  
  // Status and timing
  status: z.enum(['active', 'acknowledged', 'resolved', 'cancelled'])
    .default('active'),
  escalationLevel: z.number().int().min(0).max(5).default(0),
  
  // User tracking
  createdBy: z.string().uuid(),
  acknowledgedBy: z.string().uuid().optional(),
  acknowledgedAt: z.date().optional(),
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.date().optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().optional(),
  
  // Additional context
  metadata: z.record(z.any()).optional(),
}).refine(data => {
  // Critical alerts must have room number
  if (data.priority === 'critical' && !data.roomNumber) {
    return false;
  }
  return true;
}, {
  message: 'Room number is required for critical alerts',
  path: ['roomNumber'],
});

export const createAlertSchema = alertSchema.omit({
  id: true,
  status: true,
  escalationLevel: true,
  acknowledgedBy: true,
  acknowledgedAt: true,
  resolvedBy: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
});
```

**Acceptance Criteria**:
- [ ] All data types have comprehensive Zod schemas
- [ ] Healthcare-specific validation rules implemented
- [ ] Error messages are user-friendly and specific
- [ ] Schemas support data transformation and sanitization
- [ ] TypeScript types properly inferred from schemas
- [ ] Cross-field validation rules implemented
- [ ] Optional fields handled correctly

**Files to Create**:
- `lib/validations/auth.ts`
- `lib/validations/hospitals.ts` 
- `lib/validations/alerts.ts`
- `lib/validations/common.ts` - Shared schemas
- `lib/validations/index.ts` - Barrel exports

---

### **Task 2: Client-Side Form Validation**
**Priority**: 🟡 Medium | **Time**: 2h | **Status**: ❌ Not Started

**Description**: Implement client-side form validation using React Hook Form with Zod resolvers for immediate user feedback.

**Target Implementation**:
```typescript
// hooks/useValidatedForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function useValidatedForm<T extends z.ZodType>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange',
  });
}

// components/auth/SignInForm.tsx
import { useValidatedForm } from '@/hooks/useValidatedForm';
import { signInSchema } from '@/lib/validations/auth';

export function SignInForm() {
  const form = useValidatedForm(signInSchema, {
    rememberMe: false,
  });
  
  const onSubmit = form.handleSubmit(async (data) => {
    // Data is automatically validated and typed
    await trpc.auth.signIn.mutate(data);
  });
  
  return (
    <form onSubmit={onSubmit}>
      <input
        {...form.register('email')}
        placeholder="Email"
        className={form.formState.errors.email ? 'error' : ''}
      />
      {form.formState.errors.email && (
        <span className="error-message">
          {form.formState.errors.email.message}
        </span>
      )}
      
      <input
        {...form.register('password')}
        type="password"
        placeholder="Password"
      />
      {form.formState.errors.password && (
        <span className="error-message">
          {form.formState.errors.password.message}
        </span>
      )}
      
      <button 
        type="submit" 
        disabled={form.formState.isSubmitting}
      >
        Sign In
      </button>
    </form>
  );
}
```

**Acceptance Criteria**:
- [ ] All forms use Zod schemas for validation
- [ ] Real-time validation feedback on field blur
- [ ] Error messages displayed inline
- [ ] Form submission blocked if validation fails
- [ ] Loading states properly managed
- [ ] Accessibility attributes for form validation

**Files to Create/Modify**:
- `hooks/useValidatedForm.ts`
- All form components in `components/auth/`
- Form validation utilities

---

### **Task 3: API Error Handling Enhancement**
**Priority**: 🟡 Medium | **Time**: 1h | **Status**: ❌ Not Started

**Description**: Enhance API error handling to provide structured, Zod-validated error responses with field-level feedback.

**Target Implementation**:
```typescript
// lib/api-errors.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const validationErrorSchema = z.object({
  code: z.literal('VALIDATION_ERROR'),
  message: z.string(),
  fieldErrors: z.record(z.array(z.string())),
  formErrors: z.array(z.string()),
});

export function createValidationError(
  zodError: z.ZodError,
  message = 'Validation failed'
): TRPCError {
  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];
  
  zodError.errors.forEach(error => {
    if (error.path.length > 0) {
      const field = error.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(error.message);
    } else {
      formErrors.push(error.message);
    }
  });
  
  return new TRPCError({
    code: 'BAD_REQUEST',
    message,
    cause: {
      code: 'VALIDATION_ERROR',
      fieldErrors,
      formErrors,
    },
  });
}

// tRPC procedure with enhanced error handling
export const signUpProcedure = publicProcedure
  .input(signUpSchema)
  .mutation(async ({ input }) => {
    try {
      // Validation automatically handled by tRPC + Zod
      return await createUser(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createValidationError(error);
      }
      throw error;
    }
  });
```

**Acceptance Criteria**:
- [ ] Structured error responses with field-level details
- [ ] Zod validation errors properly formatted
- [ ] Client can display field-specific error messages
- [ ] Error codes standardized across API
- [ ] Error logging maintains structure

---

## 🧪 Testing Requirements

### **Validation Testing**
- [ ] Schema validation tests for all data types
- [ ] Edge case testing (boundary values, invalid formats)
- [ ] Cross-field validation testing
- [ ] Error message accuracy verification
- [ ] Type inference testing

### **Form Testing**
- [ ] Client-side validation behavior
- [ ] Form submission with invalid data
- [ ] Error message display
- [ ] Real-time validation feedback

### **API Testing**
- [ ] tRPC procedure validation
- [ ] Error response structure
- [ ] Field-level error handling
- [ ] Performance impact of validation

## 🎯 Success Criteria

### **Technical Success**
- [ ] All data validated with Zod schemas
- [ ] Runtime type safety achieved
- [ ] Comprehensive error handling
- [ ] Form validation working on all platforms
- [ ] Performance impact <5ms per validation

### **User Experience Success**
- [ ] Clear, actionable error messages
- [ ] Real-time validation feedback
- [ ] No data loss on validation errors
- [ ] Accessible error presentation

## 📚 Zod v4 Features Utilized

### **Advanced Validation**
- [ ] Custom error messages
- [ ] Data transformation and sanitization
- [ ] Cross-field validation with `refine()`
- [ ] Conditional validation
- [ ] Error mapping and localization

### **Type Safety**
- [ ] Inferred TypeScript types
- [ ] Runtime type checking
- [ ] Schema composition and extension
- [ ] Union and intersection types

### **Performance**
- [ ] Schema caching
- [ ] Lazy validation where appropriate
- [ ] Minimal runtime overhead

## 📝 Documentation Updates

### **Files to Update**:
- [ ] README.md - Add Zod validation section
- [ ] API documentation with schema examples
- [ ] Form development guidelines
- [ ] Error handling patterns

## 🔗 References

- [Zod v4 Documentation](https://zod.dev/v4)
- [React Hook Form + Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [tRPC Input Validation](https://trpc.io/docs/server/validators)

---

**Next Steps**: Implement Task 1 (Comprehensive Schemas) first as it provides the foundation for all other validation work across the application.