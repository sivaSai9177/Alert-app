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
  Sidebar07Trigger,
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
import React, { useState, useCallback, useTransition, useDeferredValue, useEffect, useMemo, lazy, Suspense } from "react";
import { Alert, Platform, RefreshControl, ScrollView, Animated, View, Dimensions, Easing } from "react-native";

// Lazy load heavy components
const LazyAreaChartInteractive = lazy(() => import("@/components/universal/charts/AreaChartInteractive").then(m => ({ default: m.AreaChartInteractive })));

// Memoized Shimmer component
const ShimmerPlaceholder = React.memo(({ width = "100%", height = 20, borderRadius = 4 }: any) => {
  const theme = useTheme();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
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
    );
    
    animation.start();
    return () => animation.stop();
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
});

// Memoized Dashboard Metrics component
const DashboardMetrics = React.memo(({ metrics }: { metrics: any[] }) => {
  return (
    <Box
      flexDirection="row"
      flexWrap="wrap"
      gap={4 as SpacingScale}
      mb={4 as SpacingScale}
    >
      {metrics.map((metric, index) => (
        <Box key={`metric-${index}`} flex={1} minWidth="45%">
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
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if metrics actually changed
  return JSON.stringify(prevProps.metrics) === JSON.stringify(nextProps.metrics);
});

// Memoized Quick Actions component
const QuickActions = React.memo(({ actions }: { actions: any[] }) => (
  <Card mb={4 as SpacingScale}>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
      <CardDescription>Common tasks and actions</CardDescription>
    </CardHeader>
    <CardContent>
      <VStack spacing={2}>
        {actions.map((action, index) => (
          <Button
            key={`action-${index}`}
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
));

// Activity item component
const ActivityItem = React.memo(({ text, time, isLast }: { text: string; time: string; isLast?: boolean }) => (
  <HStack
    justifyContent="space-between"
    py={2 as SpacingScale}
    borderBottomWidth={isLast ? 0 : 1}
    borderTheme="border"
  >
    <Box flex={1}>
      <Text colorTheme="mutedForeground">{text}</Text>
    </Box>
    <Text size="xs" colorTheme="mutedForeground">
      {time}
    </Text>
  </HStack>
));

export default function OptimizedHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  // Memoize healthcare role check
  const isHealthcareUser = useMemo(() => {
    const healthcareRoles = ['operator', 'doctor', 'nurse', 'head_doctor'];
    return user?.role && healthcareRoles.includes(user.role);
  }, [user?.role]);
  
  // Redirect healthcare users
  useEffect(() => {
    if (isHealthcareUser) {
      router.replace('/(home)/healthcare-dashboard');
    }
  }, [isHealthcareUser, router]);

  const [refreshing, setRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [refreshKey, setRefreshKey] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  // Memoized callback for refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Animate content while refreshing
    Animated.sequence([
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
      Animated.delay(100),
    ]).start();

    startTransition(() => {
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        
        Animated.sequence([
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
          Animated.spring(translateY, {
            toValue: 0,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
          })
        ]).start();
        
        setRefreshing(false);
        log.info('Dashboard refreshed', 'HOME', { timestamp: new Date().toISOString() });
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

  // Memoize quick actions with callbacks
  const handleViewProfile = useCallback(() => router.push("/(home)/settings"), [router]);
  const handleBrowseFeatures = useCallback(() => router.push("/(home)/explore"), [router]);
  const handleAdminDashboard = useCallback(() => {
    log.info("Admin dashboard clicked", "HOME");
    router.push("/(home)/admin");
  }, [router]);
  
  const handleComingSoon = useCallback((feature: string) => {
    log.info(`${feature} clicked`, "HOME");
    Alert.alert("Coming Soon", `${feature} will be available in the next update.`);
  }, []);

  const quickActions = useMemo(() => {
    const commonActions = [
      { label: "View Profile", onPress: handleViewProfile },
      { label: "Browse Features", onPress: handleBrowseFeatures },
    ];

    switch (user?.role) {
      case "admin":
        return [
          { label: "Admin Dashboard", onPress: handleAdminDashboard, variant: "solid" as const },
          { label: "View System Logs", onPress: () => handleComingSoon("System logs") },
          ...commonActions,
        ];
      case "manager":
        return [
          { label: "Team Dashboard", onPress: () => handleComingSoon("Team dashboard"), variant: "solid" as const },
          { label: "Review Requests", onPress: () => handleComingSoon("Review requests") },
          ...commonActions,
        ];
      default:
        return [
          { label: "Create New Task", onPress: () => handleComingSoon("Task creation"), variant: "solid" as const },
          ...commonActions,
        ];
    }
  }, [user?.role, handleViewProfile, handleBrowseFeatures, handleAdminDashboard, handleComingSoon]);

  // Use deferred values for non-critical updates
  const deferredMetrics = useDeferredValue(metrics);
  const deferredActions = useDeferredValue(quickActions);

  // Memoize user badge color
  const userBadgeColor = useMemo(() => {
    switch (user?.role) {
      case "admin": return "destructive";
      case "manager": return "primary";
      case "user": return "accent";
      default: return "muted";
    }
  }, [user?.role]);

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
              bgTheme={userBadgeColor}
              px={3 as SpacingScale}
              py={1.5 as SpacingScale}
              rounded="full"
            >
              <Text
                size="xs"
                weight="semibold"
                colorTheme={user?.role === "guest" ? "mutedForeground" : "primaryForeground"}
              >
                {(user?.role || "user").toUpperCase()}
              </Text>
            </Box>
          </HStack>
        </CardContent>
      </Card>

      {/* Visitor Analytics Chart with Suspense */}
      <Suspense fallback={<ShimmerPlaceholder height={300} />}>
        <LazyAreaChartInteractive key={refreshKey} />
      </Suspense>

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
            <ActivityItem text="Logged in successfully" time="Just now" />
            <ActivityItem text="Profile updated" time="2 hours ago" />
            <ActivityItem 
              text="Account created" 
              time={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Today"} 
              isLast 
            />
          </VStack>
        </CardContent>
      </Card>
    </>
  );

  // Platform-specific rendering
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

  // Web rendering
  return (
    <ScrollContainer safe>
      <VStack p={0} spacing={0}>
        <Box
          px={4 as SpacingScale}
          py={3 as SpacingScale}
          borderBottomWidth={1}
          borderTheme="border"
        >
          <HStack alignItems="center" spacing={2} mb={2 as SpacingScale}>
            <Sidebar07Trigger />
            <Separator orientation="vertical" style={{ height: 24 }} />
            <SimpleBreadcrumb
              items={[{ label: "Dashboard", current: true }]}
              showHome={false}
            />
          </HStack>
        </Box>

        <VStack p={4 as SpacingScale} spacing={4}>
          {dashboardContent}
        </VStack>
      </VStack>
    </ScrollContainer>
  );
}