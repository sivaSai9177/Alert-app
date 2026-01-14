import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View, Alert } from "react-native";

type UserRole = "admin" | "manager" | "user" | "guest";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles,
  fallback,
  unauthorizedFallback,
  redirectTo = "/(home)"
}: ProtectedRouteProps) {
  const { user, isLoading, hasHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only proceed if auth has hydrated and we haven't already redirected
    if (!hasHydrated || isLoading || hasRedirectedRef.current) {
      return;
    }
    
    if (user) {
      // Check if user needs to complete profile, but DON'T redirect if we're already on complete-profile
      if (user.needsProfileCompletion && pathname !== "/complete-profile") {
        hasRedirectedRef.current = true;
        router.replace("/(auth)/complete-profile");
        return;
      }
      
      // Check role-based access
      if (requiredRoles) {
        const hasAccess = requiredRoles.includes(user.role);
        if (!hasAccess) {
          hasRedirectedRef.current = true;
          Alert.alert("Access Denied", "You don't have permission to access this page");
          router.replace(redirectTo as any);
        }
      }
    }
  }, [user, isLoading, hasHydrated, requiredRoles, router, pathname, redirectTo]);

  if (isLoading || !hasHydrated) {
    return fallback || (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Auth protection is now handled at root level via Stack.Protected
  if (!user) {
    return null; // This shouldn't happen with root-level protection
  }

  // Role-based access control
  if (requiredRoles) {
    const hasAccess = requiredRoles.includes(user.role);
    if (!hasAccess) {
      return unauthorizedFallback || null; // Will redirect via useEffect
    }
  }

  return <>{children}</>;
}

// HOC version for easier usage
export function withProtectedRoute<T extends object>(
  Component: React.ComponentType<T>,
  requiredRoles?: UserRole[]
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for role-based access control (simplified)
export function useRequireRole(allowedRoles: UserRole[], redirectTo = "/(home)") {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      Alert.alert("Access Denied", "You don't have permission to access this page");
      router.replace(redirectTo as any);
    }
  }, [user, isLoading, router, allowedRoles, redirectTo]);

  return { 
    user, 
    isLoading, 
    hasAccess: user ? allowedRoles.includes(user.role) : false 
  };
}