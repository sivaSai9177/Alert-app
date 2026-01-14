/**
 * Healthcare Blocks Library
 * Golden ratio-based UI blocks for the healthcare alert system
 */

// Alert Management Blocks
export { AlertCreationBlock } from './AlertCreationBlock';
export { AlertListBlock } from './AlertListBlock';

// Dashboard Blocks  
export { MetricsOverviewBlock } from './MetricsOverviewBlock';

// Patient Information Blocks
export { PatientCardBlock } from './PatientCardBlock';

// Re-export golden ratio constants for block usage
export { 
  goldenSpacing, 
  goldenShadows, 
  goldenDimensions, 
  goldenAnimations,
  goldenTypography,
  healthcareColors,
  PHI 
} from '@/lib/design-system/golden-ratio';