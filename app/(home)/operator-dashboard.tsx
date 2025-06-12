import React, { Suspense } from 'react';
import { Platform, ScrollView } from 'react-native';
import { 
  Container, 
  VStack, 
  HStack,
  Text, 
  Card, 
  Button,
  Box,
  Heading1,
  Badge,
  Skeleton,
  SimpleBreadcrumb,
  SidebarTrigger,
  Separator,
} from '@/components/universal';
import { 
  AlertCreationBlock, 
  AlertListBlock
} from '@/components/healthcare/blocks';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter , Redirect } from 'expo-router';
import { useTheme } from '@/lib/theme/provider';
import { log } from '@/lib/core/debug/logger';

// Loading skeleton for suspense
const DashboardSkeleton = () => {
  return (
    <VStack gap={goldenSpacing.lg}>
      <Skeleton height={goldenDimensions.heights.huge} />
      <Skeleton height={goldenDimensions.heights.xlarge} />
    </VStack>
  );
};

export default function OperatorDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const theme = useTheme();
  
  // Check if user is an operator
  if (!user || user.role !== 'operator') {
    log.warn('Non-operator tried to access operator dashboard', 'OPERATOR_DASHBOARD', { 
      userId: user?.id, 
      role: user?.role 
    });
    return <Redirect href="/(home)/" />;
  }
  
  // For demo, use a placeholder hospital ID
  const hospitalId = 'f155b026-01bd-4212-94f3-e7aedef2801d';
  
  const content = (
    <VStack gap={goldenSpacing.xl}>
      {/* Header */}
      <VStack gap={goldenSpacing.md}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack gap={goldenSpacing.xs}>
            <Heading1>Emergency Alert Center</Heading1>
            <Text colorTheme="mutedForeground">
              Create and manage emergency alerts for medical staff
            </Text>
          </VStack>
          <Badge variant="error" size="large">
            <Text weight="semibold">OPERATOR MODE</Text>
          </Badge>
        </HStack>
      </VStack>
      
      {/* Quick Stats */}
      <HStack gap={goldenSpacing.md}>
        <Card style={{ flex: 1 }} padding={goldenSpacing.lg}>
          <VStack alignItems="center" gap={goldenSpacing.sm}>
            <Text size="3xl" weight="bold" colorTheme="destructive">5</Text>
            <Text size="sm" colorTheme="mutedForeground">Active Alerts</Text>
          </VStack>
        </Card>
        <Card style={{ flex: 1 }} padding={goldenSpacing.lg}>
          <VStack alignItems="center" gap={goldenSpacing.sm}>
            <Text size="3xl" weight="bold" colorTheme="success">2.3m</Text>
            <Text size="sm" colorTheme="mutedForeground">Avg Response</Text>
          </VStack>
        </Card>
        <Card style={{ flex: 1 }} padding={goldenSpacing.lg}>
          <VStack alignItems="center" gap={goldenSpacing.sm}>
            <Text size="3xl" weight="bold" colorTheme="primary">24</Text>
            <Text size="sm" colorTheme="mutedForeground">Staff Online</Text>
          </VStack>
        </Card>
      </HStack>
      
      {/* Alert Creation Section */}
      <VStack gap={goldenSpacing.lg}>
        <Text size="xl" weight="bold">Create New Alert</Text>
        <Suspense fallback={<Skeleton height={goldenDimensions.heights.huge} />}>
          <AlertCreationBlock hospitalId={hospitalId} />
        </Suspense>
      </VStack>
      
      {/* Active Alerts Section */}
      <VStack gap={goldenSpacing.lg}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text size="xl" weight="bold">Active Alerts</Text>
          <Button
            variant="outline"
            size="small"
            onPress={() => router.push('/(home)/healthcare-dashboard')}
          >
            View All Alerts
          </Button>
        </HStack>
        <Suspense fallback={<DashboardSkeleton />}>
          <AlertListBlock 
            hospitalId={hospitalId} 
            role="operator"
            showResolved={false}
            maxHeight={goldenDimensions.heights.massive}
          />
        </Suspense>
      </VStack>
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
    <Container>
      <VStack p={0} spacing={0}>
        {/* Header with Toggle and Breadcrumbs */}
        <Box
          px={goldenSpacing.lg}
          py={goldenSpacing.md}
          borderBottomWidth={1}
          borderTheme="border"
        >
          <HStack alignItems="center" spacing={goldenSpacing.sm} mb={goldenSpacing.sm}>
            <SidebarTrigger />
            <Separator orientation="vertical" style={{ height: 24 }} />
            <SimpleBreadcrumb
              items={[
                { label: "Healthcare", href: "/(home)/healthcare-dashboard" },
                { label: "Operator Dashboard", current: true }
              ]}
              showHome={false}
            />
          </HStack>
        </Box>
        
        <ScrollView>
          <VStack p={goldenSpacing.xl} gap={goldenSpacing.xl}>
            {content}
          </VStack>
        </ScrollView>
      </VStack>
    </Container>
  );
}