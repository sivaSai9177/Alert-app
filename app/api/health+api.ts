import { ExpoRequest, ExpoResponse } from 'expo-router/server';
import { getCurrentEnvironment } from '@/lib/core/env-config';

export async function GET(request: ExpoRequest): Promise<ExpoResponse> {
  try {
    const environment = getCurrentEnvironment();
    
    // Basic health check response
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment,
      platform: 'expo',
      uptime: process.uptime ? process.uptime() : 0,
      memory: process.memoryUsage ? process.memoryUsage() : {},
    };
    
    return new ExpoResponse(JSON.stringify(health, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new ExpoResponse(
      JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}