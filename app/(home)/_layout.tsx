import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useTheme } from "@/lib/theme/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, Slot, Redirect } from "expo-router";
import React from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { WebTabBar } from "@/components/WebTabBar";

export default function TabLayout() {
  const theme = useTheme();
  const { isAuthenticated, hasHydrated } = useAuth();
  
  // Wait for auth state to be loaded
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  // Use custom tab bar on web to prevent page reloads
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <WebTabBar />
      </View>
    );
  }
  
  // Use native tabs on mobile
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="_admin"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="_manager"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}