import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import crypto polyfill early for React Native
import "@/lib/core/crypto";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedDebugPanel } from "@/components/EnhancedDebugPanel";
import { SyncProvider } from "@/components/SyncProvider";
import { ColorSchemeProvider } from "@/contexts/ColorSchemeContext";
import { SpacingProvider } from "@/contexts/SpacingContext";
import { ShadcnThemeProvider } from "@/lib/theme/theme-provider";
import { TRPCProvider } from "@/lib/trpc";
import "./global.css";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Debug component to track mount/unmount
const LayoutDebugger = () => {
  const mountRef = useRef(0);
  
  useEffect(() => {
    if (__DEV__) {
      mountRef.current += 1;
      console.log(`[ROOT LAYOUT] Mount #${mountRef.current} at ${new Date().toISOString()}`);
      
      return () => {
        console.log(`[ROOT LAYOUT] Unmount #${mountRef.current} at ${new Date().toISOString()}`);
      };
    }
  }, []);
  
  return null;
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Only wait for fonts to load - auth state is handled by the index route
  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ColorSchemeProvider>
          <SpacingProvider>
            <TRPCProvider>
              <SyncProvider>
                <ShadcnThemeProvider>
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
                </ShadcnThemeProvider>
              </SyncProvider>
            </TRPCProvider>
          </SpacingProvider>
        </ColorSchemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
