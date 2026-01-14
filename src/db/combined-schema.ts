// Re-export base schema
export * from './schema';

// Re-export healthcare schema
export * from './healthcare-schema';

// Combined schema for migrations
import * as baseSchema from './schema';
import * as healthcareSchema from './healthcare-schema';

export const schema = {
  ...baseSchema,
  ...healthcareSchema.healthcareTables,
};