#!/usr/bin/env bun
/**
 * Debug login flow
 */

import { authClient } from '@/lib/auth/auth-client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { log } from '@/lib/core/logger';

async function debugLogin() {
  console.log('🔍 Debugging login flow...\n');
  
  // Check current auth state
  const authState = useAuthStore.getState();
  console.log('Current auth state:', {
    isAuthenticated: authState.isAuthenticated,
    hasUser: !!authState.user,
    userEmail: authState.user?.email,
    hasHydrated: authState.hasHydrated,
  });
  
  // Try to get session from auth client
  try {
    console.log('\n📡 Fetching session from auth client...');
    const session = await authClient.getSession();
    console.log('Session response:', JSON.stringify(session, null, 2));
    
    if (session && 'data' in session && session.data) {
      console.log('\n✅ Session data found:', {
        hasSession: !!session.data.session,
        hasUser: !!session.data.user,
        userEmail: session.data.user?.email,
      });
    } else {
      console.log('\n❌ No session data found');
    }
  } catch (error) {
    console.error('\n❌ Error fetching session:', error);
  }
  
  // Check if auth store is updating
  console.log('\n🔄 Testing auth store update...');
  const testUser = {
    id: 'test-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    organizationId: 'org-123',
    organizationName: 'Test Org',
    department: 'Engineering',
    needsProfileCompletion: false,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const testSession = {
    id: 'session-123',
    token: 'test-token',
    userId: 'test-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  
  // Update auth store
  authState.updateAuth(testUser, testSession);
  
  // Check if update worked
  const newState = useAuthStore.getState();
  console.log('Updated auth state:', {
    isAuthenticated: newState.isAuthenticated,
    hasUser: !!newState.user,
    userEmail: newState.user?.email,
  });
  
  // Reset auth state
  console.log('\n🧹 Resetting auth state...');
  authState.logout();
  
  console.log('\n✅ Debug complete');
}

// Run the debug script
debugLogin().catch(console.error);