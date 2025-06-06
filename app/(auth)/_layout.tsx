import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Box } from "@/components/universal";
import { Platform } from "react-native";
import { useTheme } from "@/lib/theme/theme-provider";

export default function AuthLayout() {
  const { isAuthenticated, user, hasHydrated } = useAuth();
  const theme = useTheme();
  
  // Wait for auth state to be ready
  if (!hasHydrated) {
    return null;
  }
  
  // If authenticated and profile complete, redirect to home
  if (isAuthenticated && user && !user.needsProfileCompletion && user.role !== 'guest') {
    return <Redirect href="/(home)" />;
  }
  
  return (
    <Box 
      flex={1} 
      bgTheme="muted" 
      style={Platform.OS === 'web' ? { minHeight: '100vh' } as any : undefined}
    >
      <Stack
        screenOptions={{
          headerShown: Platform.OS !== 'web',
          contentStyle: {
            backgroundColor: "transparent",
          },
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: theme.foreground,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{
            title: 'Login',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen 
          name="register" 
          options={{
            title: 'Create Account',
            headerBackTitle: 'Login',
          }}
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{
            title: 'Forgot Password',
            headerBackTitle: 'Login',
          }}
        />
        <Stack.Screen 
          name="complete-profile" 
          options={{
            title: 'Complete Profile',
            headerBackVisible: false,
          }}
        />
      </Stack>
    </Box>
  );
}