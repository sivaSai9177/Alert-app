import { z } from 'zod';

// Common validation schemas used across the application

// Basic data types
export const idSchema = z.string().uuid('Invalid ID format');
export const nanoidSchema = z.string().min(1, 'ID is required');
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim()
  .max(254, 'Email address too long');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .transform(val => val.replace(/\D/g, ''));

export const urlSchema = z.string()
  .url('Please enter a valid URL')
  .max(2048, 'URL too long');

// Text validation
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
  .trim();

export const descriptionSchema = z.string()
  .max(1000, 'Description cannot exceed 1000 characters')
  .trim()
  .optional();

export const titleSchema = z.string()
  .min(1, 'Title is required')
  .max(200, 'Title cannot exceed 200 characters')
  .trim();

// Password validation
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters for security compliance')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  );

// Date validation
export const dateSchema = z.coerce.date()
  .refine(date => date <= new Date(), 'Date cannot be in the future');

export const futureDateSchema = z.coerce.date()
  .refine(date => date >= new Date(), 'Date must be in the future');

export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(data => data.startDate <= data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// File validation
export const fileTypeSchema = z.enum([
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
]);

export const fileSizeSchema = z.number()
  .min(1, 'File cannot be empty')
  .max(10 * 1024 * 1024, 'File cannot exceed 10MB'); // 10MB limit

export const imageFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: fileSizeSchema,
  type: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

// Pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Search query too long').trim(),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape,
});

// Address validation
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters').max(200, 'Street address too long'),
  city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City name too long'),
  state: z.string().length(2, 'State must be 2-letter code').toUpperCase(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  country: z.string().length(2, 'Country must be 2-letter code').toUpperCase().default('US'),
});

// Contact information
export const contactInfoSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
  website: urlSchema.optional(),
  address: addressSchema.optional(),
});

// Social media links
export const socialLinksSchema = z.object({
  website: urlSchema.optional(),
  linkedin: urlSchema.optional(),
  twitter: urlSchema.optional(),
  facebook: urlSchema.optional(),
  instagram: urlSchema.optional(),
});

// Metadata schemas
export const metadataSchema = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.record(z.any()),
]));

export const tagsSchema = z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed');

// Status enums
export const statusSchema = z.enum(['active', 'inactive', 'pending', 'suspended', 'deleted']);

export const prioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const visibilitySchema = z.enum(['public', 'private', 'internal', 'restricted']);

// Environment validation
export const environmentSchema = z.enum(['development', 'staging', 'production']);

// API response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export const apiResponseSchema = z.union([successResponseSchema, errorResponseSchema]);

// Audit trail schemas
export const auditActionSchema = z.enum([
  'CREATE', 'READ', 'UPDATE', 'DELETE',
  'LOGIN', 'LOGOUT', 'ACCESS', 'EXPORT',
  'APPROVE', 'REJECT', 'SUBMIT', 'CANCEL'
]);

export const auditSeveritySchema = z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']);

// Configuration schemas
export const configKeySchema = z.string()
  .min(1, 'Config key is required')
  .max(100, 'Config key too long')
  .regex(/^[A-Z_][A-Z0-9_]*$/, 'Config key must be uppercase with underscores');

export const configValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.record(z.any()),
]);

// Notification schemas
export const notificationTypeSchema = z.enum([
  'info', 'success', 'warning', 'error',
  'system', 'security', 'business', 'marketing'
]);

export const notificationChannelSchema = z.enum([
  'email', 'sms', 'push', 'in_app', 'webhook'
]);

// Time-based schemas
export const timezoneSchema = z.string()
  .regex(/^[A-Za-z]+\/[A-Za-z_]+$/, 'Invalid timezone format')
  .default('UTC');

export const durationSchema = z.object({
  value: z.number().positive('Duration must be positive'),
  unit: z.enum(['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years']),
});

// Security schemas
export const ipAddressSchema = z.string()
  .ip('Invalid IP address');

export const userAgentSchema = z.string()
  .min(1, 'User agent is required')
  .max(500, 'User agent too long');

export const platformSchema = z.enum(['ios', 'android', 'web', 'desktop']);

export const deviceInfoSchema = z.object({
  platform: platformSchema,
  deviceId: z.string().optional(),
  deviceName: z.string().max(100, 'Device name too long').optional(),
  userAgent: userAgentSchema,
  ipAddress: ipAddressSchema,
  timezone: timezoneSchema.optional(),
  language: z.string().length(2, 'Language must be 2-letter code').optional(),
});

// Business-specific schemas
export const departmentSchema = z.string()
  .min(2, 'Department name must be at least 2 characters')
  .max(100, 'Department name too long')
  .trim();

export const roleSchema = z.enum(['admin', 'manager', 'user', 'guest', 'operator', 'doctor', 'nurse', 'head_doctor']);

export const permissionSchema = z.string()
  .min(1, 'Permission is required')
  .max(100, 'Permission name too long')
  .regex(/^[a-z_]+$/, 'Permission must be lowercase with underscores');

// Content schemas
export const contentTypeSchema = z.enum([
  'text', 'html', 'markdown', 'json',
  'image', 'video', 'audio', 'document'
]);

export const mimeTypeSchema = z.string()
  .regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/, 'Invalid MIME type');

// Location schemas
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const locationSchema = z.object({
  country: z.string().length(2, 'Country must be 2-letter code'),
  region: z.string().optional(),
  city: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
  timezone: timezoneSchema.optional(),
});

// Export types for TypeScript
export type ID = z.infer<typeof idSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Phone = z.infer<typeof phoneSchema>;
export type Name = z.infer<typeof nameSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type Address = z.infer<typeof addressSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type Search = z.infer<typeof searchSchema>;
export type Status = z.infer<typeof statusSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type Role = z.infer<typeof roleSchema>;
export type DeviceInfo = z.infer<typeof deviceInfoSchema>;
export type Location = z.infer<typeof locationSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;

// Validation helpers
export const validateOptional = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.undefined()]);

export const validateArray = <T extends z.ZodTypeAny>(schema: T, minLength = 0, maxLength = 100) =>
  z.array(schema).min(minLength).max(maxLength);

export const validateEnum = <T extends string>(values: T[]) =>
  z.enum(values as [T, ...T[]]);

// Common transformations
export const trimAndLowercase = z.string().trim().toLowerCase();
export const trimAndUppercase = z.string().trim().toUpperCase();
export const trimAndTitleCase = z.string().trim().transform(val => 
  val.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
);

// Date helpers
export const startOfDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const endOfDay = (date: Date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};