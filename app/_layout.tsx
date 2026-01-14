import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import "@/lib/core/crypto";
import "@/lib/core/suppress-warnings";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedDebugPanel } from "@/components/EnhancedDebugPanel";
import { SyncProvider } from "@/components/SyncProvider";
import { ColorSchemeProvider } from "@/contexts/ColorSchemeContext";
import { SpacingProvider } from "@/contexts/SpacingContext";
import { EnhancedThemeProvider } from "@/lib/theme/enhanced-theme-provider";
import { TRPCProvider } from "@/lib/trpc";
import { initializeSecureStorage } from "@/lib/core/secure-storage";
import { logEnvironment, clearEnvCache } from "@/lib/core/unified-env";
import { initializeRuntimeConfig } from "@/lib/core/runtime-config";
import { log } from "@/lib/core/logger";
import "./global.css";

// Only import reanimated on native platforms
if (Platform.OS !== 'web') {
  require("react-native-reanimated");
}

// Initialize runtime configuration early
if (__DEV__) {
  initializeRuntimeConfig().then(() => {
    log.info('Runtime config initialized', 'ROOT_LAYOUT');
  });
}

// Log environment configuration early
if (__DEV__) {
  // Clear cache and log environment
  setTimeout(() => {
    clearEnvCache(); // Clear any stale cache
    log.info('App starting - logging environment', 'ROOT_LAYOUT');
    logEnvironment();
  }, 100);
}

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Debug component to track mount/unmount (disabled to reduce console noise)
const LayoutDebugger = () => {
  return null;
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [storageReady, setStorageReady] = useState(Platform.OS === 'web');
  const [runtimeConfigReady, setRuntimeConfigReady] = useState(false);

  useEffect(() => {
    // Initialize runtime config and storage on mobile
    const initializeApp = async () => {
      try {
        // Initialize runtime config first
        await initializeRuntimeConfig();
        setRuntimeConfigReady(true);
        
        // Then initialize storage on mobile
        if (Platform.OS !== 'web') {
          await initializeSecureStorage();
        }
        setStorageReady(true);
      } catch (error) {
        log.error('Failed to initialize app', 'ROOT_LAYOUT', error);
        // Still set ready to prevent app from hanging
        setRuntimeConfigReady(true);
        setStorageReady(true);
      }
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    if (loaded && storageReady && runtimeConfigReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, storageReady, runtimeConfigReady]);

  // Wait for everything to be ready
  if (!loaded || !storageReady || !runtimeConfigReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ColorSchemeProvider>
          <SpacingProvider>
            <TRPCProvider>
              <SyncProvider>
                <EnhancedThemeProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    {/* Entry point */}
                    <Stack.Screen name="index" />
                    
                    {/* Public routes - always accessible */}
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="auth-callback" />
                    
                    {/* Protected routes - always render, guards in the layout */}
                    <Stack.Screen name="(home)" />
                    
                    {/* 404 handler */}
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style="auto" />
                  <EnhancedDebugPanel />
                  <LayoutDebugger />
                </EnhancedThemeProvider>
              </SyncProvider>
            </TRPCProvider>
          </SpacingProvider>
        </ColorSchemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
