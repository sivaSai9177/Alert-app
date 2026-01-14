import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { api } from '@/lib/trpc';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Progress,
  Badge,
  Button,
  Card
} from '@/components/universal';
import { useTheme } from '@/lib/theme/theme-provider';
import { Ionicons } from '@expo/vector-icons';
import { log } from '@/lib/core/logger';
import { useActivityAwareEscalation } from '@/hooks/useAlertActivity';

interface EscalationTimerProps {
  alertId: string;
  currentTier: number;
  nextEscalationAt: Date | null;
  onManualEscalate?: () => void;
  isAdmin?: boolean;
}

export function EscalationTimer({ 
  alertId, 
  currentTier, 
  nextEscalationAt,
  onManualEscalate,
  isAdmin = false
}: EscalationTimerProps) {
  const theme = useTheme();
  const [showPausedNotice, setShowPausedNotice] = useState(false);

  // Get escalation status
  const { data: escalationStatus } = api.healthcare.getEscalationStatus.useQuery(
    { alertId },
    { 
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: !!alertId 
    }
  );

  // Use activity-aware escalation timer
  const { timeRemaining, isPaused, isActive } = useActivityAwareEscalation(
    nextEscalationAt,
    {
      onInactive: () => {
        setShowPausedNotice(true);
        log.info('Escalation timer paused due to inactivity', 'ESCALATION_TIMER', { alertId });
      },
      onActive: () => {
        setShowPausedNotice(false);
        log.info('Escalation timer resumed', 'ESCALATION_TIMER', { alertId });
      },
      inactivityTimeout: 30000, // 30 seconds
    }
  );

  const isOverdue = timeRemaining === 0;

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'Overdue';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Get tier color
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return theme.warning;
      case 2: return theme.destructive;
      case 3: return theme.destructive;
      default: return theme.primary;
    }
  };

  // Get tier label
  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return 'Nurses';
      case 2: return 'Doctors';
      case 3: return 'Department Head';
      default: return 'Unknown';
    }
  };

  // Calculate progress
  const progress = escalationStatus?.timeUntilNextEscalation && escalationStatus?.currentTierConfig
    ? 1 - (escalationStatus.timeUntilNextEscalation / (escalationStatus.currentTierConfig.timeout_minutes * 60 * 1000))
    : 0;

  return (
    <Card p={3} borderWidth={1} borderTheme="border">
      <VStack spacing={3}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack spacing={2} alignItems="center">
            <Ionicons 
              name="timer-outline" 
              size={20} 
              color={getTierColor(currentTier)} 
            />
            <Text size="sm" weight="semibold">
              Escalation Timer
            </Text>
          </HStack>
          <Badge 
            variant={isOverdue ? "destructive" : "default"}
            size="sm"
          >
            Tier {currentTier} - {getTierLabel(currentTier)}
          </Badge>
        </HStack>

        {/* Timer Display */}
        {timeRemaining !== null && (
          <VStack spacing={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack spacing={1} alignItems="center">
                <Text size="xs" colorTheme="mutedForeground">
                  Next escalation in:
                </Text>
                {isPaused && (
                  <Badge variant="outline" size="sm">
                    <HStack spacing={1} alignItems="center">
                      <Ionicons name="pause-circle" size={12} color={theme.warning} />
                      <Text size="xs">Paused</Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>
              <Text 
                size="lg" 
                weight="bold" 
                style={{ 
                  color: isOverdue ? theme.destructive : isPaused ? theme.warning : theme.foreground 
                }}
              >
                {formatTimeRemaining(timeRemaining)}
              </Text>
            </HStack>

            {/* Progress Bar */}
            <Progress 
              value={progress * 100} 
              className="h-2"
              style={{
                backgroundColor: theme.muted,
                opacity: isPaused ? 0.5 : 1,
              }}
            />
            
            {/* Paused Notice */}
            {showPausedNotice && (
              <Box 
                p={2} 
                bgTheme="warning" 
                rounded="sm"
                style={{ opacity: 0.1 }}
              >
                <Text size="xs" style={{ textAlign: 'center' }}>
                  Timer paused due to inactivity
                </Text>
              </Box>
            )}
          </VStack>
        )}

        {/* Max Tier Reached */}
        {!nextEscalationAt && currentTier >= 3 && (
          <Box 
            p={2} 
            bgTheme="muted" 
            rounded="md"
            borderWidth={1}
            borderTheme="border"
          >
            <Text size="sm" colorTheme="mutedForeground" style={{ textAlign: 'center' }}>
              Maximum escalation tier reached
            </Text>
          </Box>
        )}

        {/* Manual Escalation (Admin Only) */}
        {isAdmin && onManualEscalate && currentTier < 3 && (
          <Button
            size="sm"
            variant="outline"
            onPress={onManualEscalate}
            fullWidth
          >
            <HStack spacing={2} alignItems="center">
              <Ionicons name="arrow-up-circle-outline" size={16} color={theme.primary} />
              <Text size="sm">Manual Escalate</Text>
            </HStack>
          </Button>
        )}

        {/* Escalation Info */}
        {escalationStatus?.canEscalate && (
          <Box 
            p={2} 
            bgTheme="accent" 
            rounded="md"
            borderWidth={1}
            borderTheme="border"
          >
            <Text size="xs" colorTheme="mutedForeground">
              Will notify: {getTierLabel(currentTier + 1)}
            </Text>
          </Box>
        )}
      </VStack>
    </Card>
  );
}

// Escalation Summary Component for Dashboard
interface EscalationSummaryProps {
  hospitalId: string;
}

export function EscalationSummary({ hospitalId }: EscalationSummaryProps) {
  const theme = useTheme();
  
  const { data: escalations, isLoading } = api.healthcare.getActiveEscalations.useQuery(
    { hospitalId },
    { 
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: !!hospitalId 
    }
  );

  if (isLoading) {
    return (
      <Card p={4}>
        <Text colorTheme="mutedForeground">Loading escalations...</Text>
      </Card>
    );
  }

  if (!escalations) {
    return null;
  }

  return (
    <Card p={4}>
      <VStack spacing={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text size="lg" weight="semibold">Escalation Overview</Text>
          <Badge variant="default" size="lg">
            {escalations.totalActive} Active
          </Badge>
        </HStack>

        {/* Quick Stats */}
        <HStack spacing={3} flexWrap="wrap">
          {escalations.overdue > 0 && (
            <Badge variant="destructive" size="sm">
              {escalations.overdue} Overdue
            </Badge>
          )}
          {escalations.nextEscalationIn5Minutes > 0 && (
            <Badge variant="warning" size="sm">
              {escalations.nextEscalationIn5Minutes} Escalating Soon
            </Badge>
          )}
        </HStack>

        {/* Tier Breakdown */}
        <VStack spacing={2}>
          {Object.entries(escalations.byTier).map(([tier, alerts]) => (
            <Box key={tier} p={2} bgTheme="muted" rounded="md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text size="sm" weight="medium">
                  Tier {tier} ({getTierLabel(parseInt(tier))})
                </Text>
                <Badge size="sm" variant="outline">
                  {(alerts as any[]).length} alerts
                </Badge>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

// Helper function to get tier label
function getTierLabel(tier: number): string {
  switch (tier) {
    case 1: return 'Nurses';
    case 2: return 'Doctors';
    case 3: return 'Department Head';
    default: return 'Unknown';
  }
}