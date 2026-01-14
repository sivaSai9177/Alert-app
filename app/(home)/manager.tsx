import React from "react";
import { ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme/theme-provider";
import { SpacingScale } from "@/lib/design-system";
import { useRequireRole } from "@/components/ProtectedRoute";
import { Ionicons } from "@expo/vector-icons";
import {
  Container,
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
  Button,
  Badge,
  Avatar,
  SimpleBreadcrumb,
  Separator,
  Sidebar07Trigger,
  ScrollContainer,
} from "@/components/universal";

export default function ManagerDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { hasAccess, isLoading } = useRequireRole(["manager", "admin"], "/(home)");
  const { user } = useAuth();

  if (!hasAccess || isLoading) {
    return null;
  }

  return (
    <ScrollContainer safe>
      <VStack p={0} spacing={0}>
        {/* Header with Toggle and Breadcrumbs - Only on Web */}
        {Platform.OS === 'web' && (
          <Box px={4 as SpacingScale} py={3 as SpacingScale} borderBottomWidth={1} borderTheme="border">
            <HStack alignItems="center" spacing={2} mb={2 as SpacingScale}>
              <Sidebar07Trigger />
              <Separator orientation="vertical" style={{ height: 24 }} />
              <SimpleBreadcrumb
                items={[
                  { label: 'Team', current: true }
                ]}
                showHome={true}
                homeLabel="Dashboard"
                homeHref="/(home)"
              />
            </HStack>
          </Box>
        )}

        <VStack p={4 as SpacingScale} spacing={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center" mb={6 as SpacingScale}>
            <Box flex={1}>
              <Heading1>Team Dashboard</Heading1>
              <Text size="base" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                Welcome back, {user?.name || 'Manager'}
              </Text>
            </Box>
            <Avatar 
              source={user?.image ? { uri: user.image } : undefined}
              name={user?.name || 'Manager'}
              size="lg"
            />
          </HStack>

          {/* Stats Overview */}
          <Box flexDirection="row" flexWrap="wrap" gap={4 as SpacingScale} mb={4 as SpacingScale}>
            <Box flex={1} minWidth={150}>
              <Card>
                <CardContent p={4 as SpacingScale}>
                  <Text size="2xl" weight="bold" colorTheme="foreground">
                    12
                  </Text>
                  <Text size="sm" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                    Team Members
                  </Text>
                </CardContent>
              </Card>
            </Box>
            
            <Box flex={1} minWidth={150}>
              <Card>
                <CardContent p={4 as SpacingScale}>
                  <Text size="2xl" weight="bold" colorTheme="foreground">
                    5
                  </Text>
                  <Text size="sm" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                    Active Projects
                  </Text>
                </CardContent>
              </Card>
            </Box>
            
            <Box flex={1} minWidth={150}>
              <Card>
                <CardContent p={4 as SpacingScale}>
                  <Text size="2xl" weight="bold" colorTheme="foreground">
                    87%
                  </Text>
                  <Text size="sm" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                    Completion Rate
                  </Text>
                </CardContent>
              </Card>
            </Box>
            
            <Box flex={1} minWidth={150}>
              <Card>
                <CardContent p={4 as SpacingScale}>
                  <Text size="2xl" weight="bold" colorTheme="foreground">
                    3
                  </Text>
                  <Text size="sm" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                    Pending Reviews
                  </Text>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Card mb={4 as SpacingScale}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <VStack spacing={2}>
                <Button
                  variant="solid"
                  fullWidth
                  onPress={() => alert('Coming Soon')}
                >
                  View Team Members
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => alert('Coming Soon')}
                >
                  Create New Project
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => alert('Coming Soon')}
                >
                  Review Pending Tasks
                </Button>
              </VStack>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Recent updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <VStack spacing={3}>
                <HStack justifyContent="space-between" py={2 as SpacingScale} borderBottomWidth={1} borderTheme="border">
                  <Box flex={1}>
                    <Text colorTheme="mutedForeground">John completed task #123</Text>
                  </Box>
                  <Text size="xs" colorTheme="mutedForeground">2 hours ago</Text>
                </HStack>
                <HStack justifyContent="space-between" py={2 as SpacingScale} borderBottomWidth={1} borderTheme="border">
                  <Box flex={1}>
                    <Text colorTheme="mutedForeground">Sarah submitted report for review</Text>
                  </Box>
                  <Text size="xs" colorTheme="mutedForeground">4 hours ago</Text>
                </HStack>
                <HStack justifyContent="space-between" py={2 as SpacingScale}>
                  <Box flex={1}>
                    <Text colorTheme="mutedForeground">New project milestone reached</Text>
                  </Box>
                  <Text size="xs" colorTheme="mutedForeground">Yesterday</Text>
                </HStack>
              </VStack>
            </CardContent>
          </Card>
                </VStack>
      </VStack>
    </ScrollContainer>
  );
}