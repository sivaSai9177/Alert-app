import React, { Suspense, useTransition, useDeferredValue } from 'react';
import { Platform, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  VStack, 
  HStack,
  Text, 
  Button, 
  Card,
  Box,
  Heading1,
  Avatar,
  Badge,
  Separator,
  Skeleton,
  Grid,
} from '@/components/universal';
import { 
  AlertCreationBlock,
  AlertListBlock,
  MetricsOverviewBlock,
  PatientCardBlock,
  goldenSpacing,
  goldenDimensions,
  goldenShadows,
  healthcareColors,
} from '@/components/healthcare/blocks';
import { AlertDashboard } from '@/components/healthcare/AlertDashboard';
import { AlertCreationForm } from '@/components/healthcare/AlertCreationForm';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTheme } from '@/lib/theme/theme-provider';
import { HealthcareUserRole } from '@/types/healthcare';
import { log } from '@/lib/core/logger';
import { api } from '@/lib/trpc';

export default function HealthcareDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showCreateAlert, setShowCreateAlert] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  
  // For demo, use a placeholder hospital ID
  const hospitalId = 'f155b026-01bd-4212-94f3-e7aedef2801d';
  
  // Get on-duty status
  const { data: onDutyStatus } = api.healthcare.getOnDutyStatus.useQuery();
  
  // Toggle on-duty status
  const toggleOnDutyMutation = api.healthcare.toggleOnDuty.useMutation({
    onSuccess: () => {
      log.info('On-duty status toggled', 'HEALTHCARE_UI');
    },
  });
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    startTransition(() => {
      // Refresh data here
      setTimeout(() => setRefreshing(false), 1500);
    });
  }, []);
  
  // Get role-specific content
  const getRoleContent = () => {
    const role = user?.role as HealthcareUserRole;
    
    switch (role) {
      case 'operator':
        return (
          <>
            {!showCreateAlert ? (
              <VStack gap={goldenSpacing.xl}>
                <Card
                  padding={goldenSpacing.xl}
                  gap={goldenSpacing.lg}
                  shadow={goldenShadows.lg}
                >
                  <VStack gap={goldenSpacing.md} alignItems="center">
                    <Text size="4xl">🚨</Text>
                    <Text size="xl" weight="bold">Alert Center</Text>
                    <Text colorTheme="mutedForeground" align="center">
                      Create emergency alerts to notify medical staff
                    </Text>
                    <Button
                      onPress={() => setShowCreateAlert(true)}
                      variant="destructive"
                      size="lg"
                      fullWidth
                    >
                      Create New Alert
                    </Button>
                  </VStack>
                </Card>
                
                <Separator />
                
                <VStack gap={goldenSpacing.lg}>
                  <Text size="xl" weight="bold">Recent Alerts</Text>
                  <Suspense fallback={<Skeleton height={goldenDimensions.heights.xlarge} />}>
                    <AlertListBlock 
                      hospitalId={hospitalId} 
                      role={role}
                      showResolved={false}
                      maxHeight={goldenDimensions.heights.massive}
                    />
                  </Suspense>
                </VStack>
              </VStack>
            ) : (
              <VStack gap={goldenSpacing.xl}>
                <HStack alignItems="center" gap={goldenSpacing.sm}>
                  <Button
                    onPress={() => setShowCreateAlert(false)}
                    variant="ghost"
                    size="sm"
                  >
                    ← Back
                  </Button>
                  <Text size="xl" weight="bold">Create Alert</Text>
                </HStack>
                <Suspense fallback={<Skeleton height={goldenDimensions.heights.huge} />}>
                  <AlertCreationBlock hospitalId={hospitalId} />
                </Suspense>
              </VStack>
            )}
          </>
        );
        
      case 'doctor':
      case 'nurse':
      case 'head_doctor':
        return (
          <VStack gap={goldenSpacing.xl}>
            {/* On-Duty Status Card */}
            <Card
              padding={goldenSpacing.lg}
              shadow={goldenShadows.md}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack gap={goldenSpacing.xs}>
                  <Text weight="semibold">Duty Status</Text>
                  <Text size="sm" colorTheme="mutedForeground">
                    {onDutyStatus?.isOnDuty ? 'Currently on duty' : 'Off duty'}
                  </Text>
                </VStack>
                <Button
                  onPress={() => {
                    startTransition(() => {
                      toggleOnDutyMutation.mutate({
                        isOnDuty: !onDutyStatus?.isOnDuty
                      });
                    });
                  }}
                  variant={onDutyStatus?.isOnDuty ? 'destructive' : 'secondary'}
                  size="small"
                  loading={isPending}
                >
                  {onDutyStatus?.isOnDuty ? 'End Shift' : 'Start Shift'}
                </Button>
              </HStack>
            </Card>
            
            {/* Metrics Overview */}
            <Suspense fallback={<Skeleton height={goldenDimensions.heights.xlarge} />}>
              <MetricsOverviewBlock hospitalId={hospitalId} />
            </Suspense>
            
            {/* Active Alerts */}
            <VStack gap={goldenSpacing.lg}>
              <Text size="xl" weight="bold">Active Alerts</Text>
              <Suspense fallback={<Skeleton height={goldenDimensions.heights.xlarge} />}>
                <AlertListBlock 
                  hospitalId={hospitalId} 
                  role={role}
                  showResolved={false}
                />
              </Suspense>
            </VStack>
            
            {/* Patient Cards for doctors */}
            {(role === 'doctor' || role === 'head_doctor') && (
              <VStack gap={goldenSpacing.lg}>
                <Text size="xl" weight="bold">My Patients</Text>
                <Grid columns={Platform.OS === 'web' ? 2 : 1} gap={goldenSpacing.lg}>
                  <Suspense fallback={<Skeleton height={goldenDimensions.heights.large} />}>
                    <PatientCardBlock patientId="patient-1" />
                  </Suspense>
                  <Suspense fallback={<Skeleton height={goldenDimensions.heights.large} />}>
                    <PatientCardBlock patientId="patient-2" />
                  </Suspense>
                </Grid>
              </VStack>
            )}
          </VStack>
        );
        
      case 'admin':
        return (
          <VStack gap={goldenSpacing.xl}>
            {/* System Metrics Overview */}
            <Suspense fallback={<Skeleton height={goldenDimensions.heights.xlarge} />}>
              <MetricsOverviewBlock hospitalId={hospitalId} />
            </Suspense>
            
            {/* Admin Actions */}
            <Card
              padding={goldenSpacing.xl}
              gap={goldenSpacing.lg}
              shadow={goldenShadows.md}
            >
              <VStack gap={goldenSpacing.md}>
                <Text weight="bold" size="lg">System Actions</Text>
                <Grid columns={Platform.OS === 'web' ? 2 : 1} gap={goldenSpacing.md}>
                  <Button
                    onPress={() => router.push('/(home)/admin')}
                    variant="outline"
                    fullWidth
                  >
                    User Management
                  </Button>
                  <Button
                    onPress={() => {
                      startTransition(() => {
                        log.info('View analytics clicked', 'HEALTHCARE_UI');
                      });
                    }}
                    variant="outline"
                    fullWidth
                  >
                    View Analytics
                  </Button>
                  <Button
                    onPress={() => {
                      startTransition(() => {
                        log.info('System settings clicked', 'HEALTHCARE_UI');
                      });
                    }}
                    variant="outline"
                    fullWidth
                  >
                    System Settings
                  </Button>
                  <Button
                    onPress={() => {
                      startTransition(() => {
                        log.info('Export reports clicked', 'HEALTHCARE_UI');
                      });
                    }}
                    variant="outline"
                    fullWidth
                  >
                    Export Reports
                  </Button>
                </Grid>
              </VStack>
            </Card>
            
            {/* All Alerts with resolved */}
            <VStack gap={goldenSpacing.lg}>
              <Text size="xl" weight="bold">All System Alerts</Text>
              <Suspense fallback={<Skeleton height={goldenDimensions.heights.xlarge} />}>
                <AlertListBlock 
                  hospitalId={hospitalId} 
                  role={role}
                  showResolved={true}
                />
              </Suspense>
            </VStack>
          </VStack>
        );
        
      default:
        return (
          <Card>
            <VStack spacing={3} align="center" p={4}>
              <Text size="4xl">👋</Text>
              <Text size="lg" weight="bold">Welcome to Hospital Alert System</Text>
              <Text colorTheme="mutedForeground" align="center">
                Please complete your profile to access the system
              </Text>
              <Button
                onPress={() => router.push('/(home)/settings')}
                variant="default"
              >
                Complete Profile
              </Button>
            </VStack>
          </Card>
        );
    }
  };
  
  const content = (
    <VStack gap={goldenSpacing.xl}>
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center">
        <Box flex={1}>
          <Heading1>Hospital Alert System</Heading1>
          <Text colorTheme="mutedForeground">
            {user?.name || 'Healthcare Professional'}
          </Text>
        </Box>
        <Avatar
          source={user?.image ? { uri: user.image } : undefined}
          name={user?.name || 'User'}
          size={goldenDimensions.heights.medium}
        />
      </HStack>
      
      {/* Role Badge */}
      <Card
        padding={goldenSpacing.lg}
        shadow={goldenShadows.sm}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <Box>
            <Text weight="semibold">{user?.email}</Text>
            <Text size="sm" colorTheme="mutedForeground">
              {user?.organizationName || 'Hospital System'}
            </Text>
          </Box>
          <Badge
            variant={
              user?.role === 'admin' ? 'destructive' :
              user?.role === 'head_doctor' ? 'default' :
              user?.role === 'doctor' ? 'secondary' :
              user?.role === 'nurse' ? 'outline' :
              'outline'
            }
            size="lg"
          >
            <Text size="sm" weight="semibold">
              {(user?.role || 'user').replace('_', ' ').toUpperCase()}
            </Text>
          </Badge>
        </HStack>
      </Card>
      
      <Separator />
      
      {/* Role-specific content */}
      {getRoleContent()}
    </VStack>
  );
  
  // Mobile view
  if (Platform.OS !== 'web') {
    const SafeAreaView = require('react-native-safe-area-context').SafeAreaView;
    
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          <VStack p={goldenSpacing.lg} gap={goldenSpacing.lg}>
            {content}
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Web view
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack p={goldenSpacing.xl} gap={goldenSpacing.xl}>
        {content}
      </VStack>
    </ScrollView>
  );
}