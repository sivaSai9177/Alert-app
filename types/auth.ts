import { User as BetterAuthUser } from "better-auth/types";

// Extend the Better Auth User type with our custom fields
export interface CustomUser extends BetterAuthUser {
  role: string;
  organizationId?: string;
  organizationName?: string;
  needsProfileCompletion?: boolean;
}

// Update the module declaration to use our custom user type
declare module "better-auth/types" {
  interface User {
    role: string;
    organizationId?: string;
    organizationName?: string;
    needsProfileCompletion?: boolean;
  }
}

export type UserRole = "admin" | "manager" | "user" | "guest";

// Re-export the Zod schema and type from validations for consistency
export { UserRole as UserRoleSchema, type UserRole as UserRoleType } from "../lib/validations/auth";