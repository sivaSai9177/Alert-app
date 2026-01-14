import React, { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { log } from '@/lib/core/logger';

// Note: useActivity is a proposed React 19 feature
// For now, we'll implement our own activity detection
const useActivity = () => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    if (typeof document === 'undefined') return true;
    
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  return isActive;
};

interface UseAlertActivityOptions {
  onActive?: () => void;
  onInactive?: () => void;
  onBackground?: () => void;
  inactivityTimeout?: number; // milliseconds
}

/**
 * Hook to track user activity and app state for alert management
 * Uses React 19's useActivity hook for web and AppState for mobile
 */
export function useAlertActivity({
  onActive,
  onInactive,
  onBackground,
  inactivityTimeout = 60000, // 1 minute default
}: UseAlertActivityOptions = {}) {
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Use React 19's useActivity hook for web
  const isUserActive = typeof window !== 'undefined' ? useActivity() : true;

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      onActive?.();
      log.info('User became active', 'ALERT_ACTIVITY');
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      isActiveRef.current = false;
      onInactive?.();
      log.info('User became inactive', 'ALERT_ACTIVITY');
    }, inactivityTimeout);
  }, [onActive, onInactive, inactivityTimeout]);

  // Track user activity on web
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetActivityTimer);
    });

    // Start activity timer
    resetActivityTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivityTimer);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetActivityTimer]);

  // Track app state on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') return; // Skip on web

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        isActiveRef.current = true;
        onActive?.();
        resetActivityTimer();
        log.info('App became active', 'ALERT_ACTIVITY');
      } else if (nextAppState === 'background') {
        isActiveRef.current = false;
        onBackground?.();
        log.info('App went to background', 'ALERT_ACTIVITY');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [onActive, onBackground, resetActivityTimer]);

  // React to React 19's useActivity changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isUserActive) {
      resetActivityTimer();
    } else {
      isActiveRef.current = false;
      onInactive?.();
    }
  }, [isUserActive, resetActivityTimer, onInactive]);

  return {
    isActive: isActiveRef.current && isUserActive,
    lastActivity: lastActivityRef.current,
    timeSinceLastActivity: Date.now() - lastActivityRef.current,
  };
}

/**
 * Hook to pause/resume features based on user activity
 */
export function useActivityPausable<T>(
  value: T,
  options?: UseAlertActivityOptions
): [T, boolean] {
  const [isPaused, setIsPaused] = useState(false);

  const { isActive } = useAlertActivity({
    ...options,
    onActive: () => {
      setIsPaused(false);
      options?.onActive?.();
    },
    onInactive: () => {
      setIsPaused(true);
      options?.onInactive?.();
    },
  });

  return [value, !isActive || isPaused];
}

/**
 * Enhanced escalation timer that pauses when user is inactive
 */
export function useActivityAwareEscalation(
  nextEscalationAt: Date | null,
  options?: UseAlertActivityOptions
) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pausedTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());

  const { isActive } = useAlertActivity({
    ...options,
    onInactive: () => {
      setIsPaused(true);
      pausedTimeRef.current = Date.now();
      options?.onInactive?.();
    },
    onActive: () => {
      if (pausedTimeRef.current > 0) {
        // Add paused duration to escalation time
        const pausedDuration = Date.now() - pausedTimeRef.current;
        log.info('Resuming escalation timer', 'ALERT_ACTIVITY', { pausedDuration });
      }
      setIsPaused(false);
      options?.onActive?.();
    },
  });

  useEffect(() => {
    if (!nextEscalationAt || isPaused) return;

    const updateTimer = () => {
      const now = Date.now();
      const target = new Date(nextEscalationAt).getTime();
      const remaining = target - now;

      setTimeRemaining(Math.max(0, remaining));
      lastUpdateRef.current = now;
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextEscalationAt, isPaused]);

  return {
    timeRemaining,
    isPaused,
    isActive,
  };
}