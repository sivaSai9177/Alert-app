import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { View, ActivityIndicator, Text } from "react-native";

export default function Index() {
  const { user, isAuthenticated, hasHydrated } = useAuth();
  
    isAuthenticated, 
    hasHydrated, 
    user: user?.email,
    role: user?.role,
    needsProfileCompletion: user?.needsProfileCompletion,
    timestamp: new Date().toISOString()
  });
  
  // Show loading while auth state is being hydrated
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Loading auth state...</Text>
      </View>
    );
  }
  
  // Redirect based on authentication state
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }
  
  // Check if profile needs completion
  if (user.needsProfileCompletion || user.role === 'guest') {
    return <Redirect href="/(auth)/complete-profile" />;
  }
  
  // Check for healthcare roles
  const healthcareRoles = ['doctor', 'nurse', 'head_doctor'];
  const operatorRole = ['operator'];
  
  if (user.role && operatorRole.includes(user.role)) {
    return <Redirect href="/(home)/operator-dashboard" />;
  } else if (user.role && healthcareRoles.includes(user.role)) {
    return <Redirect href="/(home)/healthcare-dashboard" />;
  }
  
  // User is authenticated with complete profile
  return <Redirect href="/(home)" />;
}