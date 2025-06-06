import React from "react";
import { 
  ScrollContainer,
  Box,
  VStack,
  HStack,
  Text,
  Heading1,
  Heading2,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button
} from "@/components/universal";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "react-native";
import { log } from "@/lib/core/logger";
import { useRouter } from "expo-router";
import { api } from "@/lib/trpc";
import { useTheme } from "@/lib/theme/theme-provider";
import { SpacingScale } from "@/lib/design-system";

// Generic dashboard metrics component
const DashboardMetrics = ({ metrics }: { metrics: any[] }) => {
  const theme = useTheme();
  return (
    <Box flexDirection="row" flexWrap="wrap" gap={4 as SpacingScale} mb={4 as SpacingScale}>
      {metrics.map((metric, index) => (
        <Box key={index} flex={1} minWidth="45%">
          <Card>
            <CardContent p={4 as SpacingScale}>
              <Text size="2xl" weight="bold" colorTheme="foreground">
                {metric.value}
              </Text>
              <Text size="sm" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                {metric.label}
              </Text>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

// Quick actions component
const QuickActions = ({ actions }: { actions: any[] }) => (
  <Card mb={4 as SpacingScale}>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
      <CardDescription>Common tasks and actions</CardDescription>
    </CardHeader>
    <CardContent>
      <VStack spacing={2}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            fullWidth
            onPress={action.onPress}
          >
            {action.label}
          </Button>
        ))}
      </VStack>
    </CardContent>
  </Card>
);

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // You can use tRPC queries here to fetch real data
  // const { data: dashboardData } = api.dashboard.getMetrics.useQuery();

  // Define metrics based on user role
  const getMetricsByRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Total Users', value: '1,234' },
          { label: 'Active Sessions', value: '89' },
          { label: 'System Health', value: '98%' },
          { label: 'Daily Events', value: '3.2k' },
        ];
      case 'manager':
        return [
          { label: 'Team Members', value: '12' },
          { label: 'Active Projects', value: '5' },
          { label: 'Completion Rate', value: '87%' },
          { label: 'Pending Reviews', value: '3' },
        ];
      default:
        return [
          { label: 'My Tasks', value: '8' },
          { label: 'Completed', value: '24' },
          { label: 'In Progress', value: '3' },
          { label: 'This Week', value: '12' },
        ];
    }
  };

  // Define quick actions based on user role
  const getQuickActionsByRole = () => {
    const commonActions = [
      {
        label: 'View Profile',
        onPress: () => router.push('/(home)/settings'),
      },
      {
        label: 'Browse Features',
        onPress: () => router.push('/(home)/explore'),
      },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          {
            label: 'Manage Users',
            onPress: () => {
              log.info('Manage users clicked', 'HOME');
              Alert.alert('Coming Soon', 'User management will be available in the next update.');
            },
            variant: 'solid' as const,
          },
          {
            label: 'View System Logs',
            onPress: () => {
              log.info('View logs clicked', 'HOME');
              Alert.alert('Coming Soon', 'System logs will be available in the next update.');
            },
          },
          ...commonActions,
        ];
      case 'manager':
        return [
          {
            label: 'Team Dashboard',
            onPress: () => {
              log.info('Team dashboard clicked', 'HOME');
              Alert.alert('Coming Soon', 'Team dashboard will be available in the next update.');
            },
            variant: 'solid' as const,
          },
          {
            label: 'Review Requests',
            onPress: () => {
              log.info('Review requests clicked', 'HOME');
              Alert.alert('Coming Soon', 'Review requests will be available in the next update.');
            },
          },
          ...commonActions,
        ];
      default:
        return [
          {
            label: 'Create New Task',
            onPress: () => {
              log.info('Create task clicked', 'HOME');
              Alert.alert('Coming Soon', 'Task creation will be available in the next update.');
            },
            variant: 'solid' as const,
          },
          ...commonActions,
        ];
    }
  };

  const metrics = getMetricsByRole();
  const quickActions = getQuickActionsByRole();

  return (
    <ScrollContainer safe headerTitle="Dashboard">
      <VStack p={4 as SpacingScale} spacing={4}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" mb={6 as SpacingScale}>
          <Box flex={1}>
            <Heading1>Dashboard</Heading1>
            <Text size="base" colorTheme="mutedForeground" mt={1 as SpacingScale}>
              Welcome back, {user?.name || 'User'}
            </Text>
          </Box>
          <Avatar 
            image={user?.image}
            name={user?.name}
            size={48}
          />
        </HStack>

        {/* User Info Card */}
        <Card mb={4 as SpacingScale}>
          <CardContent p={4 as SpacingScale}>
            <HStack justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Text size="lg" weight="semibold" colorTheme="foreground">
                  {user?.email}
                </Text>
                <Text size="sm" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                  {user?.organizationName || 'Personal Account'}
                </Text>
              </Box>
              <Box 
                bgTheme={user?.role === 'admin' ? 'destructive' : user?.role === 'manager' ? 'primary' : user?.role === 'user' ? 'accent' : 'muted'}
                px={3 as SpacingScale}
                py={1.5 as SpacingScale}
                rounded="full"
              >
                <Text 
                  size="xs" 
                  weight="semibold" 
                  colorTheme={user?.role === 'guest' ? 'mutedForeground' : 'primaryForeground'}
                >
                  {(user?.role || 'user').toUpperCase()}
                </Text>
              </Box>
            </HStack>
          </CardContent>
        </Card>

        {/* Metrics Dashboard */}
        <Heading2 mb={4 as SpacingScale}>Overview</Heading2>
        <DashboardMetrics metrics={metrics} />

        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={3}>
              <HStack justifyContent="space-between" py={2 as SpacingScale} borderBottomWidth={1} borderTheme="border">
                <Box flex={1}><Text colorTheme="mutedForeground">Logged in successfully</Text></Box>
                <Text size="xs" colorTheme="mutedForeground">Just now</Text>
              </HStack>
              <HStack justifyContent="space-between" py={2 as SpacingScale} borderBottomWidth={1} borderTheme="border">
                <Box flex={1}><Text colorTheme="mutedForeground">Profile updated</Text></Box>
                <Text size="xs" colorTheme="mutedForeground">2 hours ago</Text>
              </HStack>
              <HStack justifyContent="space-between" py={2 as SpacingScale}>
                <Box flex={1}><Text colorTheme="mutedForeground">Account created</Text></Box>
                <Text size="xs" colorTheme="mutedForeground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                </Text>
              </HStack>
            </VStack>
          </CardContent>
        </Card>
      </VStack>
    </ScrollContainer>
  );
}