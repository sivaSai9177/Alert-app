import { useEffect, useRef, useCallback, useOptimistic, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { log } from '@/lib/core/logger';
import { showSuccessAlert } from '@/lib/core/alert';
import { useAlertSSESubscription } from './useSSESubscription';

interface AlertEvent {
  type: 'alert.created' | 'alert.acknowledged' | 'alert.resolved' | 'alert.escalated';
  data: any;
  timestamp: Date;
  alertId?: string;
}

interface UseAlertSubscriptionOptions {
  hospitalId: string;
  onAlertCreated?: (event: AlertEvent) => void;
  onAlertAcknowledged?: (event: AlertEvent) => void;
  onAlertResolved?: (event: AlertEvent) => void;
  onAlertEscalated?: (event: AlertEvent) => void;
  showNotifications?: boolean;
}

export function useAlertSubscription({
  hospitalId,
  onAlertCreated,
  onAlertAcknowledged,
  onAlertResolved,
  onAlertEscalated,
  showNotifications = true,
}: UseAlertSubscriptionOptions) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const [useSSE, setUseSSE] = useState(true); // Try SSE first

  // Handle incoming events
  const handleEvent = useCallback((event: AlertEvent) => {
    log.info('Alert event received', 'ALERT_SUBSCRIPTION', event);

    // Invalidate relevant queries to trigger refetch
    queryClient.invalidateQueries({
      queryKey: [['healthcare', 'getActiveAlerts'], { input: { hospitalId } }],
    });

    // Also invalidate specific alert queries if needed
    queryClient.invalidateQueries({
      queryKey: [['healthcare', 'getEscalationStatus'], { input: { alertId: event.alertId } }],
    });

    // Show notifications if enabled
    if (showNotifications) {
      switch (event.type) {
        case 'alert.created':
          showSuccessAlert('New Alert', `New alert in room ${event.data.roomNumber}`);
          break;
        case 'alert.acknowledged':
          showSuccessAlert('Alert Acknowledged', 'An alert has been acknowledged');
          break;
        case 'alert.escalated':
          showSuccessAlert('Alert Escalated', `Alert escalated to tier ${event.data.toTier}`);
          break;
      }
    }

    // Call specific handlers
    switch (event.type) {
      case 'alert.created':
        onAlertCreated?.(event);
        break;
      case 'alert.acknowledged':
        onAlertAcknowledged?.(event);
        break;
      case 'alert.resolved':
        onAlertResolved?.(event);
        break;
      case 'alert.escalated':
        onAlertEscalated?.(event);
        break;
    }
  }, [
    queryClient,
    hospitalId,
    onAlertCreated,
    onAlertAcknowledged,
    onAlertResolved,
    onAlertEscalated,
    showNotifications,
  ]);

  // SSE subscription for real-time updates
  const { isConnected: isSSEConnected } = useAlertSSESubscription(
    useCallback((alertData: any) => {
      // Convert SSE data to AlertEvent format
      const event: AlertEvent = {
        type: alertData.type || 'alert.created',
        data: alertData,
        timestamp: new Date(alertData.timestamp || Date.now()),
        alertId: alertData.id,
      };
      handleEvent(event);
    }, [handleEvent])
  );

  // Fallback to polling if SSE fails
  useEffect(() => {
    if (!hospitalId) return;

    subscriptionRef.current = true;
    
    // If SSE is not connected after 5 seconds, fall back to polling
    const sseTimeout = setTimeout(() => {
      if (!isSSEConnected) {
        setUseSSE(false);
        log.info('Falling back to polling for real-time updates', 'ALERT_SUBSCRIPTION');
      }
    }, 5000);

    // Set up polling interval as fallback
    let interval: NodeJS.Timeout | null = null;
    if (!useSSE || !isSSEConnected) {
      log.info('Starting real-time alert monitoring', 'ALERT_SUBSCRIPTION', {
        hospitalId,
        method: 'polling',
      });
      
      interval = setInterval(() => {
        queryClient.invalidateQueries({
          queryKey: [['healthcare', 'getActiveAlerts'], { input: { hospitalId } }],
        });
      }, 3000); // Poll every 3 seconds for near real-time updates
    }

    return () => {
      clearTimeout(sseTimeout);
      if (interval) clearInterval(interval);
      subscriptionRef.current = false;
    };
  }, [hospitalId, queryClient, isSSEConnected, useSSE]);

  return {
    isSubscribed: !!subscriptionRef.current,
    isSSEConnected,
    connectionType: isSSEConnected ? 'sse' : 'polling',
  };
}

// Hook for single alert subscription
export function useAlertDetailSubscription(alertId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!alertId) return;

    log.debug('Starting alert detail monitoring', 'ALERT_DETAIL_SUBSCRIPTION', {
      alertId,
      method: 'polling',
    });

    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: [['healthcare', 'getEscalationStatus'], { input: { alertId } }],
      });
      
      queryClient.invalidateQueries({
        queryKey: [['healthcare', 'getEscalationHistory'], { input: { alertId } }],
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [alertId, queryClient]);

  return { isConnected: true };
}

// Hook for optimistic updates with React 19's useOptimistic
export function useOptimisticAlertUpdate() {
  const queryClient = useQueryClient();

  const updateAlertOptimistically = useCallback((
    alertId: string,
    updates: Partial<any>
  ) => {
    // Optimistically update the cache
    queryClient.setQueryData(
      [['healthcare', 'getActiveAlerts']],
      (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          alerts: oldData.alerts.map((alertData: any) =>
            alertData.alert.id === alertId
              ? { ...alertData, alert: { ...alertData.alert, ...updates } }
              : alertData
          ),
        };
      }
    );
  }, [queryClient]);

  return { updateAlertOptimistically };
}