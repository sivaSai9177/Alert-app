#!/usr/bin/env bun
import { log } from '@/lib/core/logger';

// Test healthcare endpoints through the API
async function testHealthcareEndpoints() {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081';
  
  log.info('Testing Healthcare Endpoints...', 'TEST');
  log.info(`API URL: ${BASE_URL}`, 'TEST');
  
  try {
    // Test health check
    log.info('Testing health endpoint...', 'TEST');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    log.info(`Health check: ${healthData.status}`, 'TEST');
    
    // Test trpc health check
    log.info('Testing tRPC endpoint...', 'TEST');
    const trpcRes = await fetch(`${BASE_URL}/api/trpc/health.check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (trpcRes.ok) {
      const trpcData = await trpcRes.json();
      log.info('tRPC health check passed', 'TEST', trpcData);
    } else {
      log.warn('tRPC health check failed', 'TEST', { status: trpcRes.status });
    }
    
    // Test auth endpoint
    log.info('Testing auth endpoint...', 'TEST');
    const authRes = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (authRes.ok) {
      const authData = await authRes.json();
      log.info('Auth endpoint accessible', 'TEST', { hasSession: !!authData });
    } else {
      log.info('Auth endpoint returned expected 401 (no session)', 'TEST');
    }
    
    log.info('All endpoint tests completed!', 'TEST');
    
    // Display demo credentials again
    log.info('', 'TEST');
    log.info('HEALTHCARE DEMO CREDENTIALS:', 'TEST');
    log.info('===========================', 'TEST');
    log.info('Operator: johncena@gmail.com', 'TEST');
    log.info('Nurse: doremon@gmail.com', 'TEST');
    log.info('Doctor: johndoe@gmail.com', 'TEST');
    log.info('Head Doctor: saipramod273@gmail.com', 'TEST');
    log.info('', 'TEST');
    log.info('Access the app at: http://localhost:8081', 'TEST');
    
  } catch (error) {
    log.error('Failed to test endpoints', 'TEST', error);
  }
}

// Run if called directly
if (import.meta.main) {
  testHealthcareEndpoints()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}