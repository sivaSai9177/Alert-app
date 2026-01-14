import React, { useState } from "react";
import {
  View,
  ScrollView,
  Platform,
  Dimensions,
  Pressable,
} from "react-native";
import { useTheme } from "@/lib/theme/theme-provider";
import { useSpacing } from "@/contexts/SpacingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { Box } from "./Box";
import { Text } from "./Text";
import { HStack, VStack } from "./Stack";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Separator } from "./Separator";
import { designSystem } from "@/lib/design-system";

interface DashboardProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  children?: NavItem[];
}

export function Dashboard01({ children, user }: DashboardProps) {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get screen dimensions
  const { width: screenWidth } = Dimensions.get("window");
  const isDesktop = Platform.OS === "web" && screenWidth >= 1024;
  const isTablet = Platform.OS === "web" && screenWidth >= 768 && screenWidth < 1024;
  const isMobile = !isDesktop && !isTablet;

  // Responsive sidebar width
  const sidebarWidth = isSidebarOpen ? (isDesktop ? 280 : 256) : 64;

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [
      {
        title: "Dashboard",
        href: "/(home)",
        icon: "home",
      },
      {
        title: "Analytics",
        href: "/(home)/analytics",
        icon: "analytics",
        badge: "12",
      },
      {
        title: "Projects",
        href: "/(home)/projects",
        icon: "folder",
        children: [
          { title: "All Projects", href: "/(home)/projects", icon: "folder-open" },
          { title: "Recent", href: "/(home)/projects/recent", icon: "time" },
          { title: "Archived", href: "/(home)/projects/archived", icon: "archive" },
        ],
      },
      {
        title: "Team",
        href: "/(home)/team",
        icon: "people",
        badge: "3",
      },
    ];

    // Add healthcare items for healthcare users
    if (["doctor", "nurse", "head_doctor", "operator"].includes(user?.role || "")) {
      items.push({
        title: "Healthcare",
        href: "/(home)/healthcare-dashboard",
        icon: "medkit",
        children: [
          { title: "Patients", href: "/(home)/patients", icon: "person" },
          { title: "Alerts", href: "/(home)/alerts", icon: "alert-circle" },
          { title: "Reports", href: "/(home)/reports", icon: "document-text" },
        ],
      });
    }

    // Add admin items
    if (user?.role === "admin") {
      items.push({
        title: "Admin",
        href: "/(home)/admin",
        icon: "shield-checkmark",
        children: [
          { title: "Users", href: "/(home)/admin/users", icon: "people-circle" },
          { title: "Settings", href: "/(home)/admin/settings", icon: "settings" },
          { title: "Logs", href: "/(home)/admin/logs", icon: "list" },
        ],
      });
    }

    items.push(
      { title: "Messages", href: "/(home)/messages", icon: "mail", badge: "5" },
      { title: "Settings", href: "/(home)/settings", icon: "settings-outline" }
    );

    return items;
  };

  const navItems = getNavItems();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === "/(home)" && (pathname === "/(home)" || pathname === "/(home)/index")) {
      return true;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = isActiveRoute(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);

    return (
      <View key={item.title}>
        <Pressable
          onPress={() => {
            if (hasChildren && isSidebarOpen) {
              toggleExpanded(item.title);
            } else {
              router.push(item.href as any);
            }
          }}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[2],
            marginHorizontal: spacing[3],
            marginBottom: spacing[1],
            borderRadius: spacing[2],
            backgroundColor: isActive
              ? theme.primary + "15"
              : pressed
              ? theme.muted
              : "transparent",
            ...(Platform.OS === "web" && {
              transition: "all 0.2s ease",
              cursor: "pointer",
            }),
          })}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={isActive ? theme.primary : theme.mutedForeground}
            style={{ marginRight: isSidebarOpen ? spacing[3] : 0 }}
          />
          
          {isSidebarOpen && (
            <>
              <Text
                size="sm"
                weight={isActive ? "medium" : "normal"}
                style={{
                  flex: 1,
                  color: isActive ? theme.primary : theme.foreground,
                }}
              >
                {item.title}
              </Text>
              
              {item.badge && (
                <Badge size="sm" variant="secondary">
                  {item.badge}
                </Badge>
              )}
              
              {hasChildren && (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.mutedForeground}
                  style={{
                    transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
                    ...(Platform.OS === "web" && {
                      transition: "transform 0.2s ease",
                    }),
                  }}
                />
              )}
            </>
          )}
        </Pressable>

        {hasChildren && isExpanded && isSidebarOpen && (
          <View style={{ marginBottom: spacing[2] }}>
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: theme.background }}>
      {/* Sidebar */}
      <View
        style={{
          width: sidebarWidth,
          backgroundColor: theme.card,
          borderRightWidth: 1,
          borderRightColor: theme.border,
          ...(Platform.OS === "web" && {
            transition: "width 0.3s ease",
          }),
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing[8] }}
        >
          {/* Logo and Toggle */}
          <HStack
            alignItems="center"
            justifyContent="space-between"
            p={3}
            borderBottomWidth={1}
            borderTheme="border"
          >
            {isSidebarOpen ? (
              <HStack alignItems="center" spacing={3}>
                <Box
                  width={32}
                  height={32}
                  rounded="lg"
                  bgTheme="primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="cube" size={20} color={theme.primaryForeground} />
                </Box>
                <Text size="lg" weight="semibold">
                  Acme Inc
                </Text>
              </HStack>
            ) : (
              <Box
                width={32}
                height={32}
                rounded="lg"
                bgTheme="primary"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="cube" size={20} color={theme.primaryForeground} />
              </Box>
            )}
            
            {isDesktop && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Ionicons
                  name={isSidebarOpen ? "chevron-back" : "chevron-forward"}
                  size={16}
                  color={theme.foreground}
                />
              </Button>
            )}
          </HStack>

          {/* Search (when expanded) */}
          {isSidebarOpen && (
            <Box p={3}>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={
                  <Ionicons name="search" size={16} color={theme.mutedForeground} />
                }
              />
            </Box>
          )}

          {/* Navigation */}
          <VStack py={2}>
            {navItems.map((item) => renderNavItem(item))}
          </VStack>

          {/* Bottom Section */}
          {isSidebarOpen && (
            <VStack p={3} mt="auto">
              <Separator mb={3} />
              
              {/* Upgrade Card */}
              <Card mb={3}>
                <CardContent p={3}>
                  <HStack alignItems="center" spacing={2} mb={2}>
                    <Ionicons name="star" size={16} color={theme.primary} />
                    <Text size="sm" weight="semibold">
                      Upgrade to Pro
                    </Text>
                  </HStack>
                  <Text size="xs" colorTheme="mutedForeground" mb={3}>
                    Unlock all features and get unlimited access to our support team.
                  </Text>
                  <Button size="sm" fullWidth>
                    Upgrade
                  </Button>
                </CardContent>
              </Card>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Pressable
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing[3],
                      padding: spacing[2],
                      borderRadius: spacing[2],
                      backgroundColor: pressed ? theme.muted : "transparent",
                      ...(Platform.OS === "web" && {
                        transition: "all 0.15s ease",
                        cursor: "pointer",
                      }),
                    })}
                  >
                    <Avatar
                      name={user?.name || "User"}
                      size="sm"
                      source={user?.avatar ? { uri: user.avatar } : undefined}
                    />
                    <VStack spacing={0} flex={1}>
                      <Text size="sm" weight="medium" numberOfLines={1}>
                        {user?.name || "User"}
                      </Text>
                      <Text size="xs" colorTheme="mutedForeground" numberOfLines={1}>
                        {user?.email || "user@example.com"}
                      </Text>
                    </VStack>
                    <Ionicons name="ellipsis-horizontal" size={16} color={theme.mutedForeground} />
                  </Pressable>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" minWidth={200}>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onPress={() => router.push("/(home)/settings")}>
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="person-outline" size={16} color={theme.foreground} />
                      <Text>Profile</Text>
                    </HStack>
                  </DropdownMenuItem>
                  <DropdownMenuItem onPress={() => router.push("/(home)/settings")}>
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="settings-outline" size={16} color={theme.foreground} />
                      <Text>Settings</Text>
                    </HStack>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onPress={() => {}}>
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="log-out-outline" size={16} color={theme.foreground} />
                      <Text>Log out</Text>
                    </HStack>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </VStack>
          )}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            height: 60,
            backgroundColor: theme.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            paddingHorizontal: spacing[6],
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <HStack alignItems="center" spacing={4}>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Ionicons name="menu" size={20} color={theme.foreground} />
              </Button>
            )}
            
            {/* Breadcrumbs */}
            <HStack alignItems="center" spacing={2}>
              <Text size="sm" colorTheme="mutedForeground">
                Dashboard
              </Text>
              <Ionicons name="chevron-forward" size={12} color={theme.mutedForeground} />
              <Text size="sm" weight="medium">
                Overview
              </Text>
            </HStack>
          </HStack>

          {/* Header Actions */}
          <HStack alignItems="center" spacing={2}>
            <Button variant="ghost" size="sm">
              <Ionicons name="search" size={18} color={theme.foreground} />
            </Button>
            
            <Button variant="ghost" size="sm">
              <View>
                <Ionicons name="notifications-outline" size={18} color={theme.foreground} />
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.destructive,
                  }}
                />
              </View>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Avatar
                    name={user?.name || "User"}
                    size="sm"
                    source={user?.avatar ? { uri: user.avatar } : undefined}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => router.push("/(home)/settings")}>
                  <Text>Settings</Text>
                </DropdownMenuItem>
                <DropdownMenuItem onPress={() => {}}>
                  <Text>Support</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => {}}>
                  <Text>Log out</Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </HStack>
        </View>

        {/* Page Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}