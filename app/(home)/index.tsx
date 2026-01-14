import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading1,
  Heading2,
  HStack,
  ScrollContainer,
  Separator,
  SimpleBreadcrumb,
  Text,
  VStack,
} from "@/components/universal";
import { AreaChartInteractive } from "@/components/universal/charts";
import { useAuth } from "@/hooks/useAuth";
import { log } from "@/lib/core/logger";
import { spacing, SpacingScale } from "@/lib/design-system";
import { useTheme } from "@/lib/theme/theme-provider";
import { useRouter } from "expo-router";
import React, { useState, useCallback, useTransition, useDeferredValue, useEffect, useMemo } from "react";
import { Alert, Platform, RefreshControl, ScrollView, Animated, View, Dimensions, Easing } from "react-native";

// Shimmer effect component for loading state
const ShimmerPlaceholder = ({ width = "100%", height = 20, borderRadius = 4 }) => {
  const theme = useTheme();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: theme.muted,
        opacity,
      }}
    />
  );
};

// Generic dashboard metrics component
const DashboardMetrics = ({ metrics }: { metrics: any[] }) => {
  const theme = useTheme();
  return (
    <Box
      flexDirection="row"
      flexWrap="wrap"
      gap={4 as SpacingScale}
      mb={4 as SpacingScale}
    >
      {metrics.map((metric, index) => (
        <Box key={index} flex={1} minWidth="45%">
          <Card>
            <CardContent p={4 as SpacingScale}>
              <Text size="2xl" weight="bold" colorTheme="foreground">
                {metric.value}
              </Text>
              <Text
                size="sm"
                colorTheme="mutedForeground"
                mt={1 as SpacingScale}
              >
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
  
  // Healthcare users can access the main dashboard but might want to navigate to their specialized dashboard
  const [refreshing, setRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [refreshKey, setRefreshKey] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  // You can use tRPC queries here to fetch real data
  // const { data: dashboardData } = api.dashboard.getMetrics.useQuery();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Animate content while refreshing
    Animated.sequence([
      // Pull down effect
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 15,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]),
      // Hold position
      Animated.delay(100),
    ]).start();

    // Simulate data refresh
    startTransition(() => {
      // In a real app, you would fetch new data here
      // Example: await api.dashboard.refresh.mutate()
      
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        
        // Bounce back animation
        Animated.sequence([
          // Overshoot
          Animated.parallel([
            Animated.spring(fadeAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: -5,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          ]),
          // Settle
          Animated.spring(translateY, {
            toValue: 0,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
          })
        ]).start();
        
        setRefreshing(false);
        log.info('Dashboard refreshed', 'HOME', { timestamp: new Date().toISOString() });
        
        // Haptic feedback on iOS
        if (Platform.OS === 'ios') {
          // @ts-ignore
          if (window.navigator?.vibrate) {
            window.navigator.vibrate(10);
          }
        }
      }, 1500);
    });
  }, [fadeAnim, translateY]);

  // Memoize metrics based on user role
  const metrics = useMemo(() => {
    switch (user?.role) {
      case "admin":
        return [
          { label: "Total Users", value: "1,234" },
          { label: "Active Sessions", value: "89" },
          { label: "System Health", value: "98%" },
          { label: "Daily Events", value: "3.2k" },
        ];
      case "manager":
        return [
          { label: "Team Members", value: "12" },
          { label: "Active Projects", value: "5" },
          { label: "Completion Rate", value: "87%" },
          { label: "Pending Reviews", value: "3" },
        ];
      default:
        return [
          { label: "My Tasks", value: "8" },
          { label: "Completed", value: "24" },
          { label: "In Progress", value: "3" },
          { label: "This Week", value: "12" },
        ];
    }
  }, [user?.role]);

  // Memoize quick actions based on user role
  const quickActions = useMemo(() => {
    const commonActions = [
      {
        label: "View Profile",
        onPress: () => router.push("/(home)/settings"),
      },
      {
        label: "Browse Features",
        onPress: () => router.push("/(home)/explore"),
      },
    ];

    switch (user?.role) {
      case "admin":
        return [
          {
            label: "Admin Dashboard",
            onPress: () => {
              log.info("Admin dashboard clicked", "HOME");
              router.push("/(home)/admin");
            },
            variant: "solid" as const,
          },
          {
            label: "View System Logs",
            onPress: () => {
              log.info("View logs clicked", "HOME");
              Alert.alert(
                "Coming Soon",
                "System logs will be available in the next update."
              );
            },
          },
          ...commonActions,
        ];
      case "manager":
        return [
          {
            label: "Team Dashboard",
            onPress: () => {
              log.info("Team dashboard clicked", "HOME");
              Alert.alert(
                "Coming Soon",
                "Team dashboard will be available in the next update."
              );
            },
            variant: "solid" as const,
          },
          {
            label: "Review Requests",
            onPress: () => {
              log.info("Review requests clicked", "HOME");
              Alert.alert(
                "Coming Soon",
                "Review requests will be available in the next update."
              );
            },
          },
          ...commonActions,
        ];
      case "doctor":
      case "nurse":
      case "head_doctor":
        return [
          {
            label: "Healthcare Dashboard",
            onPress: () => {
              log.info("Healthcare dashboard clicked", "HOME");
              router.push("/(home)/healthcare-dashboard");
            },
            variant: "solid" as const,
          },
          ...commonActions,
        ];
      case "operator":
        return [
          {
            label: "Operator Dashboard",
            onPress: () => {
              log.info("Operator dashboard clicked", "HOME");
              router.push("/(home)/operator-dashboard");
            },
            variant: "solid" as const,
          },
          ...commonActions,
        ];
      default:
        return [
          {
            label: "Create New Task",
            onPress: () => {
              log.info("Create task clicked", "HOME");
              Alert.alert(
                "Coming Soon",
                "Task creation will be available in the next update."
              );
            },
            variant: "solid" as const,
          },
          ...commonActions,
        ];
    }
  }, [user?.role, router]);

  const deferredMetrics = useDeferredValue(metrics);
  const deferredActions = useDeferredValue(quickActions);

  const dashboardContent = (
    <>
          {/* Header */}
          <HStack
            justifyContent="space-between"
            alignItems="center"
            mb={6 as SpacingScale}
          >
            <Box flex={1}>
              <Heading1>Dashboard</Heading1>
              <Text
                size="base"
                colorTheme="mutedForeground"
                mt={1 as SpacingScale}
              >
                Welcome back, {user?.name || "User"}
              </Text>
            </Box>
            <Avatar
              source={user?.image ? { uri: user.image } : undefined}
              name={user?.name || "User"}
              size="lg"
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
                  <Text
                    size="sm"
                    colorTheme="mutedForeground"
                    mt={1 as SpacingScale}
                  >
                    {user?.organizationName || "Personal Account"}
                  </Text>
                </Box>
                <Box
                  bgTheme={
                    user?.role === "admin"
                      ? "destructive"
                      : user?.role === "manager"
                      ? "primary"
                      : user?.role === "user"
                      ? "accent"
                      : "muted"
                  }
                  px={3 as SpacingScale}
                  py={1.5 as SpacingScale}
                  rounded="full"
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    colorTheme={
                      user?.role === "guest"
                        ? "mutedForeground"
                        : "primaryForeground"
                    }
                  >
                    {(user?.role || "user").toUpperCase()}
                  </Text>
                </Box>
              </HStack>
            </CardContent>
          </Card>

          {/* Visitor Analytics Chart */}
          <AreaChartInteractive key={refreshKey} />

          {/* Metrics Dashboard */}
          <Heading2 mb={4 as SpacingScale} mt={6 as SpacingScale}>Overview</Heading2>
          <DashboardMetrics metrics={deferredMetrics} />

          {/* Quick Actions */}
          <QuickActions actions={deferredActions} />

          {/* Dev Tools */}
          <Card mb={4 as SpacingScale}>
            <CardHeader>
              <CardTitle>Development Tools</CardTitle>
              <CardDescription>
                Test various components and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VStack spacing={2}>
                <Button
                  variant="secondary"
                  onPress={() => router.push("/(home)/demo-universal")}
                  fullWidth
                >
                  View Universal Components Demo
                </Button>

                <Button
                  variant="outline"
                  onPress={() => router.push("/(home)/sidebar-test")}
                  fullWidth
                >
                  Test Sidebar Implementation
                </Button>
              </VStack>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <VStack spacing={3}>
                <HStack
                  justifyContent="space-between"
                  py={2 as SpacingScale}
                  borderBottomWidth={1}
                  borderTheme="border"
                >
                  <Box flex={1}>
                    <Text colorTheme="mutedForeground">
                      Logged in successfully
                    </Text>
                  </Box>
                  <Text size="xs" colorTheme="mutedForeground">
                    Just now
                  </Text>
                </HStack>
                <HStack
                  justifyContent="space-between"
                  py={2 as SpacingScale}
                  borderBottomWidth={1}
                  borderTheme="border"
                >
                  <Box flex={1}>
                    <Text colorTheme="mutedForeground">Profile updated</Text>
                  </Box>
                  <Text size="xs" colorTheme="mutedForeground">
                    2 hours ago
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" py={2 as SpacingScale}>
                  <Box flex={1}>
                    <Text colorTheme="mutedForeground">Account created</Text>
                  </Box>
                  <Text size="xs" colorTheme="mutedForeground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Today"}
                  </Text>
                </HStack>
              </VStack>
            </CardContent>
          </Card>
    </>
  );

  // For mobile, use ScrollView with RefreshControl
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
              colors={[theme.primary, theme.secondary, theme.accent]}
              progressBackgroundColor={theme.card}
              progressViewOffset={Platform.OS === 'ios' ? -20 : 20}
              size="large"
              title={refreshing ? "Refreshing..." : "Pull to refresh"}
              titleColor={theme.mutedForeground}
            />
          }
        >
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY }],
              flex: 1 
            }}
          >
            <VStack p={0} spacing={0}>
              <VStack p={4 as SpacingScale} spacing={4}>
                {dashboardContent}
              </VStack>
            </VStack>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // For web, use ScrollContainer
  return (
    <ScrollContainer safe>
      <VStack p={0} spacing={0}>
        {/* Header with Breadcrumbs */}
        <Box
          px={4 as SpacingScale}
          py={3 as SpacingScale}
          borderBottomWidth={1}
          borderTheme="border"
        >
          <SimpleBreadcrumb
            items={[{ label: "Dashboard", current: true }]}
            showHome={false}
          />
        </Box>

        <VStack p={4 as SpacingScale} spacing={4}>
          {dashboardContent}
        </VStack>
      </VStack>
    </ScrollContainer>
  );
}
