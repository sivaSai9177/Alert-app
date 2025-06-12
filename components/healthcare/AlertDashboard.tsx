import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { 
  VStack, 
  HStack,
  Text, 
  Button, 
  Container,
  Card,
  Badge,
  Alert as AlertComponent,
  Box,
  Separator,
} from '@/components/universal';
import { api } from '@/lib/api/trpc';
import { 
  HealthcareUserRole,
  ALERT_TYPE_CONFIG, 
  URGENCY_LEVEL_CONFIG,
  type Alert,
} from '@/types/healthcare';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTheme } from '@/lib/theme/provider';
import { showErrorAlert } from '@/lib/core/alert';
import { log } from '@/lib/core/debug/logger';
import { EscalationTimer, EscalationSummary } from './EscalationTimer';
import { useAlertSubscription } from '@/hooks/healthcare';

import { useFadeAnimation, useScaleAnimation, useEntranceAnimation } from '@/lib/ui/animations/hooks';
import { haptic } from '@/lib/ui/haptics';
import { SpacingScale } from '@/lib/design';

interface AlertDashboardProps {
  role: HealthcareUserRole;
  hospitalId: string;
}

export function AlertDashboard({ role, hospitalId }: AlertDashboardProps) {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  
  // Animation hooks
  const { animatedStyle: dashboardFadeStyle, fadeIn: fadeInDashboard } = useFadeAnimation({ duration: 400 });
  const { animatedStyle: statsScaleStyle, scaleIn: scaleInStats } = useScaleAnimation({ 
    initialScale: 0.9, 
    finalScale: 1,
    springConfig: 'gentle' 
  });
  
  // Subscribe to real-time updates
  useAlertSubscription({
    hospitalId,
    onAlertCreated: (event) => {
      log.info('New alert created', 'ALERT_DASHBOARD', event);
      haptic('notification');
      // Trigger re-animation
      fadeInDashboard();
    },
    onAlertEscalated: (event) => {
      log.info('Alert escalated', 'ALERT_DASHBOARD', event);
      haptic('warning');
    },
    showNotifications: true,
  });
  
  // Entrance animations
  useEffect(() => {
    fadeInDashboard();
    scaleInStats();
  }, []);
  
  // Fetch active alerts (will be refreshed by subscription)
  const { data, refetch, isLoading } = api.healthcare.getActiveAlerts.useQuery({
    hospitalId,
    limit: 50,
  }, {
    refetchInterval: 30000, // Reduced interval since we have subscriptions
  });
  
  // Acknowledge alert mutation
  const acknowledgeMutation = api.healthcare.acknowledgeAlert.useMutation({
    onSuccess: () => {
      log.info('Alert acknowledged', 'HEALTHCARE_UI', { alertId: selectedAlert });
      refetch();
      setSelectedAlert(null);
    },
    onError: (error) => {
      log.error('Failed to acknowledge alert', 'HEALTHCARE_UI', error);
      showErrorAlert('Failed to Acknowledge', error.message);
    },
  });
  
  // Resolve alert mutation
  const resolveMutation = api.healthcare.resolveAlert.useMutation({
    onSuccess: () => {
      log.info('Alert resolved', 'HEALTHCARE_UI', { alertId: selectedAlert });
      refetch();
      setSelectedAlert(null);
    },
    onError: (error) => {
      log.error('Failed to resolve alert', 'HEALTHCARE_UI', error);
      showErrorAlert('Failed to Resolve', error.message);
    },
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Handle acknowledge
  const handleAcknowledge = (alertId: string, notes?: string) => {
    acknowledgeMutation.mutate({
      alertId,
      notes,
    });
  };
  
  // Handle resolve
  const handleResolve = (alertId: string, resolution: string) => {
    resolveMutation.mutate({
      alertId,
      resolution,
    });
  };
  
  // Group alerts by status
  const activeAlerts = data?.alerts.filter(a => a.alert.status === 'active') || [];
  const acknowledgedAlerts = data?.alerts.filter(a => a.alert.status === 'acknowledged') || [];
  
  // Can the user acknowledge alerts?
  const canAcknowledge = ['doctor', 'nurse', 'head_doctor', 'admin'].includes(role);
  const canResolve = ['doctor', 'head_doctor', 'admin'].includes(role);
  
  const AlertItem: React.FC<{ alertData: any; index: number }> = ({ alertData, index }) => {
    const alert = alertData.alert;
    const isSelected = selectedAlert === alert.id;
    const config = ALERT_TYPE_CONFIG[alert.alertType];
    const urgencyConfig = URGENCY_LEVEL_CONFIG[alert.urgencyLevel];
    
    // Stagger animation for list items
    const { animatedStyle: alertEntranceStyle } = useEntranceAnimation({
      type: 'slide',
      delay: index * 50,
      duration: 300,
    });
    
    return (
      <Animated.View key={alert.id} style={alertEntranceStyle}>
        <Pressable
          onPress={() => {
            haptic('light');
            setSelectedAlert(isSelected ? null : alert.id);
          }}
        >
          <Card
          style={{
            borderLeftWidth: 4,
            borderLeftColor: urgencyConfig.color,
            marginBottom: 12,
            opacity: alert.status === 'acknowledged' ? 0.8 : 1,
          }}
        >
          <VStack spacing={2}>
            {/* Header */}
            <HStack spacing={2} align="center">
              <Text size="2xl">{config?.icon}</Text>
              <VStack flex={1}>
                <HStack spacing={2} align="center">
                  <Text weight="bold" size="lg">
                    Room {alert.roomNumber}
                  </Text>
                  <Badge
                    variant={alert.urgencyLevel <= 2 ? 'destructive' : 'default'}
                    style={{
                      backgroundColor: urgencyConfig.color + '20',
                      borderColor: urgencyConfig.color,
                    }}
                  >
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{ color: urgencyConfig.color }}
                    >
                      {urgencyConfig.label}
                    </Text>
                  </Badge>
                </HStack>
                <Text size="sm" colorTheme="mutedForeground">
                  {alert.alertType.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </VStack>
              
              {/* Status Badge */}
              {alert.status === 'acknowledged' && (
                <Badge variant="secondary">
                  <Text size="xs">Acknowledged</Text>
                </Badge>
              )}
            </HStack>
            
            {/* Alert Details */}
            {alert.description && (
              <Text size="sm" colorTheme="mutedForeground">
                {alert.description}
              </Text>
            )}
            
            {/* Metadata */}
            <HStack spacing={3}>
              <Text size="xs" colorTheme="mutedForeground">
                Created {formatDistanceToNow(new Date(alert.createdAt))} ago
              </Text>
              {alertData.creator && (
                <Text size="xs" colorTheme="mutedForeground">
                  by {alertData.creator.name}
                </Text>
              )}
            </HStack>
            
            {/* Acknowledged Info */}
            {alert.acknowledgedAt && alertData.acknowledgedBy && (
              <Box
                p={2 as SpacingScale}
                rounded="md"
                style={{ backgroundColor: theme.muted }}
              >
                <Text size="xs">
                  Acknowledged by {alertData.acknowledgedBy.name} at{' '}
                  {new Date(alert.acknowledgedAt).toLocaleTimeString()}
                </Text>
              </Box>
            )}
            
            {/* Escalation Timer - Only for active alerts */}
            {alert.status === 'active' && (
              <EscalationTimer
                alertId={alert.id}
                currentTier={alert.currentEscalationTier || 1}
                nextEscalationAt={alert.nextEscalationAt}
                isAdmin={role === 'admin'}
                onManualEscalate={() => {
                  // TODO: Implement manual escalation
                  log.info('Manual escalation requested', 'HEALTHCARE', { alertId: alert.id });
                }}
              />
            )}
            
            {/* Escalation Warning */}
            {alert.currentEscalationTier > 1 && (
              <AlertComponent variant="primary" colorScheme="destructive">
                <Text size="sm" weight="semibold">
                  ⚠️ Escalated to Tier {alert.currentEscalationTier}
                </Text>
              </AlertComponent>
            )}
            
            {/* Actions */}
            {isSelected && alert.status === 'active' && canAcknowledge && (
              <VStack spacing={2} style={{ marginTop: 8 }}>
                <Separator />
                <Button
                  onPress={() => handleAcknowledge(alert.id)}
                  variant="outline"
                  size="lg"
                  disabled={acknowledgeMutation.isPending}
                >
                  {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Acknowledge Alert'}
                </Button>
              </VStack>
            )}
            
            {isSelected && alert.status === 'acknowledged' && canResolve && (
              <VStack spacing={2} style={{ marginTop: 8 }}>
                <Separator />
                <Button
                  onPress={() => {
                    // In production, show a dialog to enter resolution notes
                    handleResolve(alert.id, 'Situation resolved successfully');
                  }}
                  variant="secondary"
                  disabled={resolveMutation.isPending}
                >
                  {resolveMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
                </Button>
              </VStack>
            )}
          </VStack>
        </Card>
        </Pressable>
      </Animated.View>
    );
  };
  
  if (isLoading && !data) {
    return (
      <Container>
        <VStack spacing={4} p={4 as SpacingScale} align="center" justify="center" style={{ flex: 1 }}>
          <Text>Loading alerts...</Text>
        </VStack>
      </Container>
    );
  }
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Animated.View style={dashboardFadeStyle}>
        <VStack spacing={4} p={4 as SpacingScale}>
          {/* Summary Stats */}
          <Animated.View style={statsScaleStyle}>
            <HStack spacing={3}>
              <Card style={{ flex: 1 }}>
                <VStack align="center">
                  <Text size="3xl" weight="bold" style={{ color: theme.destructive }}>
                    {activeAlerts.length}
                  </Text>
                  <Text size="sm" colorTheme="mutedForeground">Active Alerts</Text>
                </VStack>
              </Card>
              <Card style={{ flex: 1 }}>
                <VStack align="center">
                  <Text size="3xl" weight="bold" style={{ color: theme.warning }}>
                    {acknowledgedAlerts.length}
                  </Text>
                  <Text size="sm" colorTheme="mutedForeground">In Progress</Text>
                </VStack>
              </Card>
            </HStack>
          </Animated.View>
        
        {/* Escalation Summary */}
        {activeAlerts.length > 0 && (
          <EscalationSummary hospitalId={hospitalId} />
        )}
        
        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <VStack spacing={2}>
            <HStack align="center" spacing={2}>
              <Text size="lg" weight="bold">Active Alerts</Text>
              <Badge variant="error">
                <Text size="xs" weight="bold" style={{ color: theme.background }}>
                  {activeAlerts.length}
                </Text>
              </Badge>
            </HStack>
            {activeAlerts.map((alert, index) => <AlertItem key={alert.alert.id} alertData={alert} index={index} />)}
          </VStack>
        )}
        
        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <VStack spacing={2}>
            <Text size="lg" weight="bold">In Progress</Text>
            {acknowledgedAlerts.map((alert, index) => <AlertItem key={alert.alert.id} alertData={alert} index={index} />)}
          </VStack>
        )}
        
        {/* Empty State */}
        {activeAlerts.length === 0 && acknowledgedAlerts.length === 0 && (
          <Card>
            <VStack spacing={3} align="center" p={4 as SpacingScale}>
              <Text size="4xl">✅</Text>
              <Text size="lg" weight="semibold">All Clear</Text>
              <Text colorTheme="mutedForeground" align="center">
                No active alerts at this time.
              </Text>
            </VStack>
          </Card>
        )}
        
        {/* Role-specific Actions */}
        {role === 'operator' && (
          <Button
            onPress={() => router.push('/(home)/create-alert')}
            variant="solid"
            colorScheme="destructive"
            size="lg"
          >
            Create New Alert
          </Button>
        )}
        </VStack>
      </Animated.View>
    </ScrollView>
  );
}

// Helper function for time formatting
function formatDistanceToNow(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}