import React from "react";
import { View, Platform, Pressable } from "react-native";
import { useTheme } from "@/lib/theme/theme-provider";
import { useSpacing } from "@/contexts/SpacingContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Box } from "./Box";
import { Text } from "./Text";
import { HStack } from "./Stack";
import { Button } from "./Button";
import { Input } from "./Input";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Sidebar07Trigger } from "./Sidebar07";

interface DashboardHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  showMobileMenu?: boolean;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title = "Dashboard",
  breadcrumbs = [],
  user,
  showMobileMenu = true,
  actions,
}: DashboardHeaderProps) {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const router = useRouter();

  return (
    <View
      style={{
        height: 64,
        backgroundColor: theme.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        paddingHorizontal: spacing[4],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left Side */}
      <HStack alignItems="center" spacing={3}>
        {/* Mobile Menu Trigger */}
        {showMobileMenu && Platform.OS !== "web" && (
          <Sidebar07Trigger />
        )}

        {/* Breadcrumbs */}
        <HStack alignItems="center" spacing={2}>
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <Ionicons
                    name="chevron-forward"
                    size={12}
                    color={theme.mutedForeground}
                  />
                )}
                {crumb.href ? (
                  <Pressable onPress={() => router.push(crumb.href as any)}>
                    <Text
                      size="sm"
                      colorTheme="mutedForeground"
                      style={{
                        ...(Platform.OS === "web" && {
                          cursor: "pointer",
                          textDecoration: "underline",
                        }),
                      }}
                    >
                      {crumb.label}
                    </Text>
                  </Pressable>
                ) : (
                  <Text size="sm" weight="medium">
                    {crumb.label}
                  </Text>
                )}
              </React.Fragment>
            ))
          ) : (
            <Text size="lg" weight="semibold">
              {title}
            </Text>
          )}
        </HStack>
      </HStack>

      {/* Right Side Actions */}
      <HStack alignItems="center" spacing={2}>
        {/* Custom Actions */}
        {actions}

        {/* Command/Search */}
        {Platform.OS === "web" && (
          <Button
            variant="outline"
            size="sm"
            style={{ minWidth: 200 }}
            onPress={() => {}}
          >
            <HStack alignItems="center" spacing={2} flex={1}>
              <Ionicons name="search" size={16} color={theme.mutedForeground} />
              <Text size="sm" colorTheme="mutedForeground" style={{ flex: 1 }}>
                Search...
              </Text>
              <HStack alignItems="center" spacing={1}>
                <Box
                  px={1.5}
                  py={0.5}
                  rounded="sm"
                  bgTheme="muted"
                  style={{ minWidth: 20 }}
                >
                  <Text size="xs" colorTheme="mutedForeground">
                    ⌘
                  </Text>
                </Box>
                <Box
                  px={1.5}
                  py={0.5}
                  rounded="sm"
                  bgTheme="muted"
                  style={{ minWidth: 20 }}
                >
                  <Text size="xs" colorTheme="mutedForeground">
                    K
                  </Text>
                </Box>
              </HStack>
            </HStack>
          </Button>
        )}

        {/* Mobile Search */}
        {Platform.OS !== "web" && (
          <Button variant="ghost" size="sm">
            <Ionicons name="search" size={20} color={theme.foreground} />
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="sm" style={{ position: "relative" }}>
          <Ionicons name="notifications-outline" size={20} color={theme.foreground} />
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.destructive,
              borderWidth: 2,
              borderColor: theme.background,
            }}
          />
        </Button>

        {/* User Menu */}
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
          <DropdownMenuContent align="end" minWidth={200}>
            <DropdownMenuLabel>
              <Text weight="medium">{user?.name || "User"}</Text>
              <Text size="xs" colorTheme="mutedForeground">
                {user?.email || "user@example.com"}
              </Text>
            </DropdownMenuLabel>
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
            <DropdownMenuItem onPress={() => {}}>
              <HStack spacing={2} alignItems="center">
                <Ionicons name="help-circle-outline" size={16} color={theme.foreground} />
                <Text>Support</Text>
              </HStack>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onPress={() => {
                const { logout } = useAuthStore.getState();
                logout();
                router.replace("/(auth)/login");
              }}
            >
              <HStack spacing={2} alignItems="center">
                <Ionicons name="log-out-outline" size={16} color={theme.foreground} />
                <Text>Log out</Text>
              </HStack>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </HStack>
    </View>
  );
}