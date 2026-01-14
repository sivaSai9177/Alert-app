import { eventEmitter } from '@/src/server/services/realtime-events';
import { log } from '@/lib/core/logger';

export async function GET(request: Request) {
  log.info('SSE connection established', 'SSE_ALERTS');
  
  const encoder = new TextEncoder();
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`));
      
      // Set up event listeners for different event types
      const handleAlert = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'alert', data })}\n\n`));
        } catch (error) {
          log.error('Error sending alert event', 'SSE_ALERTS', error);
        }
      };
      
      const handlePatient = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'patient', data })}\n\n`));
        } catch (error) {
          log.error('Error sending patient event', 'SSE_ALERTS', error);
        }
      };
      
      const handleMetrics = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'metrics', data })}\n\n`));
        } catch (error) {
          log.error('Error sending metrics event', 'SSE_ALERTS', error);
        }
      };
      
      // Subscribe to events
      eventEmitter.on('alert:created', handleAlert);
      eventEmitter.on('alert:updated', handleAlert);
      eventEmitter.on('alert:acknowledged', handleAlert);
      eventEmitter.on('alert:resolved', handleAlert);
      eventEmitter.on('patient:updated', handlePatient);
      eventEmitter.on('metrics:updated', handleMetrics);
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:heartbeat\n\n`));
        } catch (error) {
          // Connection closed, clean up
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        log.info('SSE connection closed', 'SSE_ALERTS');
        
        // Remove all event listeners
        eventEmitter.off('alert:created', handleAlert);
        eventEmitter.off('alert:updated', handleAlert);
        eventEmitter.off('alert:acknowledged', handleAlert);
        eventEmitter.off('alert:resolved', handleAlert);
        eventEmitter.off('patient:updated', handlePatient);
        eventEmitter.off('metrics:updated', handleMetrics);
        
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });
  
  // CORS headers
  const origin = request.headers.get('origin') || 'http://localhost:8081';
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}