import React, { useRef, useTransition, memo } from 'react';
import { Platform, FlatList, ViewToken } from 'react-native';
import {
  Card,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Box,
  ScrollContainer,
} from '@/components/universal';
import { goldenSpacing, goldenShadows, goldenDimensions, goldenAnimations, healthcareColors } from '@/lib/design-system/golden-ratio';
import { useTheme } from '@/lib/theme/theme-provider';
import { api } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { log } from '@/lib/core/logger';
import { showSuccessAlert, showErrorAlert } from '@/lib/core/alert';
import { HealthcareUserRole } from '@/types/healthcare';

// Alert card item component with memo for performance
const AlertCardItem = memo(({ 
  alert, 
  onAcknowledge, 
  onResolve,
  canAcknowledge,
  canResolve,
  index 
}: {
  alert: any;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  canAcknowledge: boolean;
  canResolve: boolean;
  index: number;
}) => {
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();
  
  const getUrgencyColor = (urgency: number) => {
    if (urgency <= 2) return healthcareColors.emergency;
    if (urgency === 3) return healthcareColors.warning;
    return healthcareColors.info;
  };
  
  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      'cardiac': '❤️',
      'code-blue': '🔵',
      'fall': '🚶',
      'fire': '🔥',
      'security': '🔒',
      'medical-emergency': '🚨',
    };
    return icons[type] || '⚠️';
  };
  
  return (
    <Card
      padding={goldenSpacing.lg}
      gap={goldenSpacing.md}
      shadow={goldenShadows.md}
      style={{
        height: goldenDimensions.heights.large,
        borderLeftWidth: 3,
        borderLeftColor: getUrgencyColor(alert.urgency),
        opacity: alert.resolved ? 0.7 : 1,
        // Staggered animation
        ...(Platform.OS === 'web' && {
          animation: `slideIn ${goldenAnimations.durations.fast}ms ${
            index * goldenAnimations.stagger.fast
          }ms ${goldenAnimations.easeGolden} forwards`,
          opacity: 0,
        }),
      }}
    >
      {/* Header Row */}
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={goldenSpacing.md} alignItems="center">
          <Text size="2xl">{getAlertIcon(alert.alertType)}</Text>
          <VStack gap={goldenSpacing.xxs}>
            <HStack gap={goldenSpacing.sm}>
              <Text weight="bold" size="lg">Room {alert.roomNumber}</Text>
              <Badge
                variant={alert.urgency >= 4 ? "destructive" : alert.urgency >= 3 ? "secondary" : "default"}
                size="sm"
              >
                Urgency {alert.urgency}
              </Badge>
            </HStack>
            <Text size="sm" colorTheme="mutedForeground">
              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
            </Text>
          </VStack>
        </HStack>
        
        {/* Status Badges */}
        <VStack gap={goldenSpacing.xs} alignItems="flex-end">
          {alert.resolved ? (
            <Badge variant="outline" size="sm">
              ✓ Resolved
            </Badge>
          ) : alert.acknowledged ? (
            <Badge variant="secondary" size="sm">
              ✓ Acknowledged
            </Badge>
          ) : (
            <Badge variant="destructive" size="sm">
              New Alert
            </Badge>
          )}
        </VStack>
      </HStack>
      
      {/* Alert Details */}
      {alert.description && (
        <Text size="sm" numberOfLines={2}>
          {alert.description}
        </Text>
      )}
      
      {/* Metadata */}
      <HStack gap={goldenSpacing.md} flexWrap="wrap">
        <Text size="xs" colorTheme="mutedForeground">
          Created by {alert.createdByName}
        </Text>
        {alert.acknowledged && (
          <Text size="xs" colorTheme="mutedForeground">
            • Ack by {alert.acknowledgedByName}
          </Text>
        )}
        {alert.resolved && (
          <Text size="xs" colorTheme="mutedForeground">
            • Resolved by {alert.resolvedByName}
          </Text>
        )}
      </HStack>
      
      {/* Action Buttons */}
      {!alert.resolved && (
        <HStack gap={goldenSpacing.md} marginTop={goldenSpacing.sm}>
          {!alert.acknowledged && canAcknowledge && (
            <Button
              variant="solid"
              size="sm"
              style={{ flex: 1.618 }}
              onPress={() => {
                startTransition(() => {
                  onAcknowledge(alert.id);
                });
              }}
              isLoading={isPending}
            >
              Acknowledge
            </Button>
          )}
          {alert.acknowledged && canResolve && (
            <Button
              variant="solid"
              size="sm"
              style={{ flex: 1 }}
              onPress={() => {
                startTransition(() => {
                  onResolve(alert.id);
                });
              }}
              isLoading={isPending}
            >
              Resolve
            </Button>
          )}
        </HStack>
      )}
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.alert.id === nextProps.alert.id &&
    prevProps.alert.acknowledged === nextProps.alert.acknowledged &&
    prevProps.alert.resolved === nextProps.alert.resolved &&
    prevProps.index === nextProps.index
  );
});

AlertCardItem.displayName = 'AlertCardItem';

// Main alert list block
export const AlertListBlock = ({ 
  hospitalId, 
  role,
  showResolved = false,
  maxHeight,
  scrollEnabled = true 
}: { 
  hospitalId: string;
  role: HealthcareUserRole;
  showResolved?: boolean;
  maxHeight?: number;
  scrollEnabled?: boolean;
}) => {
  const theme = useTheme();
  const queryClient = api.useUtils();
  const listRef = useRef<FlatList>(null);
  
  // Permissions based on role
  const canAcknowledge = ['nurse', 'doctor', 'head_doctor', 'admin'].includes(role);
  const canResolve = ['doctor', 'head_doctor', 'admin'].includes(role);
  
  // Fetch active alerts
  const { data, isLoading, refetch } = api.healthcare.getActiveAlerts.useQuery(
    { includeResolved: showResolved },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      refetchIntervalInBackground: true,
    }
  );
  
  // Acknowledge mutation
  const acknowledgeMutation = api.healthcare.acknowledgeAlert.useMutation({
    onMutate: async ({ alertId }) => {
      await queryClient.healthcare.getActiveAlerts.cancel();
      const previousData = queryClient.healthcare.getActiveAlerts.getData();
      
      queryClient.healthcare.getActiveAlerts.setData(
        { includeResolved: showResolved },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            alerts: old.alerts.map((alert) =>
              alert.id === alertId
                ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
                : alert
            ),
          };
        }
      );
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.healthcare.getActiveAlerts.setData(
          { includeResolved: showResolved },
          context.previousData
        );
      }
      showErrorAlert('Failed to acknowledge alert', err.message);
    },
    onSuccess: () => {
      showSuccessAlert('Alert acknowledged');
      queryClient.healthcare.getActiveAlerts.invalidate();
    },
  });
  
  // Resolve mutation
  const resolveMutation = api.healthcare.resolveAlert.useMutation({
    onMutate: async ({ alertId }) => {
      await queryClient.healthcare.getActiveAlerts.cancel();
      const previousData = queryClient.healthcare.getActiveAlerts.getData();
      
      queryClient.healthcare.getActiveAlerts.setData(
        { includeResolved: showResolved },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            alerts: old.alerts.map((alert) =>
              alert.id === alertId
                ? { ...alert, resolved: true, resolvedAt: new Date() }
                : alert
            ),
          };
        }
      );
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.healthcare.getActiveAlerts.setData(
          { includeResolved: showResolved },
          context.previousData
        );
      }
      showErrorAlert('Failed to resolve alert', err.message);
    },
    onSuccess: () => {
      showSuccessAlert('Alert resolved');
      queryClient.healthcare.getActiveAlerts.invalidate();
    },
  });
  
  // Real-time subscription for WebSocket updates
  const { data: subscriptionData } = api.healthcare.subscribeToAlerts.useSubscription(
    { hospitalId },
    {
      enabled: !!hospitalId && process.env.EXPO_PUBLIC_ENABLE_WS === 'true',
      onData: (event) => {
        log.info('Alert subscription event', 'ALERT_LIST', { event });
        
        // Update query cache with new data
        queryClient.healthcare.getActiveAlerts.invalidate();
        
        // Show notification for new alerts
        if (event.type === 'alert.created') {
          showSuccessAlert('New Alert', `New alert in room ${event.data.alert.roomNumber}`);
        }
      },
      onError: (error) => {
        log.error('Alert subscription error', 'ALERT_LIST', error);
        // Subscription failed, polling will continue as fallback
      },
    }
  );
  
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <AlertCardItem
      alert={item}
      onAcknowledge={(id) => acknowledgeMutation.mutate({ alertId: id })}
      onResolve={(id) => resolveMutation.mutate({ alertId: id })}
      canAcknowledge={canAcknowledge}
      canResolve={canResolve}
      index={index}
    />
  );
  
  const keyExtractor = (item: any) => item.id;
  
  if (isLoading) {
    return (
      <VStack gap={goldenSpacing.md}>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            padding={goldenSpacing.lg}
            style={{
              height: goldenDimensions.heights.large,
              backgroundColor: theme.muted,
              opacity: 0.5,
            }}
          />
        ))}
      </VStack>
    );
  }
  
  const alerts = data?.alerts || [];
  
  if (alerts.length === 0) {
    return (
      <Card
        padding={goldenSpacing.xxl}
        style={{
          minHeight: goldenDimensions.heights.xlarge,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <VStack gap={goldenSpacing.md} alignItems="center">
          <Text size="4xl">✅</Text>
          <Text size="lg" weight="medium">No Active Alerts</Text>
          <Text colorTheme="mutedForeground" align="center">
            All alerts have been handled
          </Text>
        </VStack>
      </Card>
    );
  }
  
  // Use FlatList for native, regular mapping for web
  if (Platform.OS !== 'web') {
    // If scrolling is disabled, render items directly without FlatList
    if (!scrollEnabled) {
      return (
        <VStack gap={goldenSpacing.md}>
          {alerts.map((alert, index) => (
            <AlertCardItem
              key={alert.id}
              alert={alert}
              onAcknowledge={(id) => acknowledgeMutation.mutate({ alertId: id })}
              onResolve={(id) => resolveMutation.mutate({ alertId: id })}
              canAcknowledge={canAcknowledge}
              canResolve={canResolve}
              index={index}
            />
          ))}
        </VStack>
      );
    }
    
    return (
      <FlatList
        ref={listRef}
        data={alerts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          gap: goldenSpacing.md,
        }}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        removeClippedSubviews={true}
        style={{
          maxHeight: maxHeight || goldenDimensions.heights.massive,
        }}
      />
    );
  }
  
  // Web version with CSS animations
  return (
    <ScrollContainer
      style={{ 
        maxHeight: maxHeight || goldenDimensions.heights.massive,
      }}
      showsVerticalScrollIndicator={false}
    >
      <VStack gap={goldenSpacing.md}>
        {alerts.map((alert, index) => (
          <AlertCardItem
            key={alert.id}
            alert={alert}
            onAcknowledge={(id) => acknowledgeMutation.mutate({ alertId: id })}
            onResolve={(id) => resolveMutation.mutate({ alertId: id })}
            canAcknowledge={canAcknowledge}
            canResolve={canResolve}
            index={index}
          />
        ))}
      </VStack>
    </ScrollContainer>
  );
};