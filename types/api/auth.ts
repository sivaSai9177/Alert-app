// Auth API types - specific to API layer
import type { UserRole, CustomUser } from '../auth';

export type { UserRole, CustomUser };

// API-specific auth types
export interface AuthResponse {
  user: CustomUser | null;
  session: any;
  success: boolean;
  error?: string;
}