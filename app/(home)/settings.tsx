import React, { useState, useEffect } from 'react';
import { Alert, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ScrollContainer, 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading1,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Avatar,
  SimpleBreadcrumb,
  Separator,
  SidebarTrigger
} from '@/components/universal';
import { DarkModeToggle } from '@/components/blocks/theme/DarkModeToggle/DarkModeToggle';
import { SpacingDensitySelector } from '@/components/blocks/theme/DensitySelector/SpacingDensitySelector';
import { ThemeSelector } from '@/components/blocks/theme/ThemeSelector/ThemeSelector';
import { useAuth } from '@/hooks/useAuth';
import { log } from '@/lib/core/debug/logger';
import { useTheme } from '@/lib/theme/provider';
import { notificationService } from '@/lib/ui/notifications/service';
import { SpacingScale } from '@/lib/design';
import { SignOutButton } from '@/components/blocks/auth';
import { signOut } from '@/lib/auth/signout-manager';

export default function SettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [notificationPermission, setNotificationPermission] = useState<string>('undetermined');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Check notification permission status on mount
  useEffect(() => {
    checkNotificationPermission();
    
    // Set up notification listeners
    notificationService.setupNotificationListeners(
      (notification) => {
        // Handle notification received while app is in foreground
        log.info('Notification received in foreground', 'SETTINGS', {
          title: notification.request.content.title,
        });
      },
      (response) => {
        // Handle notification response (user tapped on notification)
        log.info('User interacted with notification', 'SETTINGS', {
          actionIdentifier: response.actionIdentifier,
        });
      }
    );

    return () => {
      // Clean up listeners
      notificationService.removeNotificationListeners();
    };
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const status = await notificationService.checkPermissionStatus();
      setNotificationPermission(status);
    } catch (error) {
      log.error('Failed to check notification permission', 'SETTINGS', error);
    }
  };


  const handleSignOut = async () => {
    console.log('handleSignOut called');
    
    try {
      // Direct signout without confirmation
      await signOut({
        reason: 'user_initiated',
        showAlert: false,
        redirectTo: '/(auth)/login'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API fails, we should still log out locally
      router.replace('/(auth)/login');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Coming Soon", "Account deletion will be implemented in the next update.");
          }
        }
      ]
    );
  };

  return (
    <ScrollContainer safe>
      <VStack p={0} spacing={0}>
        {/* Header with Toggle and Breadcrumbs - Only on Web */}
        {Platform.OS === 'web' && (
          <Box px={4 as SpacingScale} py={3 as SpacingScale} borderBottomWidth={1} borderTheme="border">
            <HStack alignItems="center" spacing={2} mb={2}>
              <SidebarTrigger />
              <Separator orientation="vertical" style={{ height: 24 }} />
              <SimpleBreadcrumb
                items={[
                  { label: 'Settings', current: true }
                ]}
                showHome={true}
                homeLabel="Dashboard"
                homeHref="/(home)"
              />
            </HStack>
          </Box>
        )}

        <VStack p={4 as SpacingScale} spacing={4}>
          <Heading1 mb={6}>
            Settings
          </Heading1>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <HStack spacing={4} alignItems="center">
              <Avatar 
                source={user?.image ? { uri: user.image } : undefined}
                name={user?.name || 'User'}
                size="xl"
              />
              <Box flex={1}>
                <CardTitle>{user?.name || 'User'}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </Box>
            </HStack>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              fullWidth
              onPress={() => {
                Alert.alert("Coming Soon", "Profile editing will be available in the next update.");
              }}
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={3}>
              <Button
                variant="outline"
                fullWidth
                onPress={() => {
                  Alert.alert("Coming Soon", "Password change will be available in the next update.");
                }}
              >
                Change Password
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onPress={() => {
                  Alert.alert("Coming Soon", "Email preferences will be available in the next update.");
                }}
              >
                Email Preferences
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onPress={() => {
                  Alert.alert("Coming Soon", "Two-factor authentication will be available in the next update.");
                }}
              >
                Two-Factor Authentication
              </Button>
            </VStack>
          </CardContent>
        </Card>

        {/* Admin Section - Only show for admin users */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Administration</CardTitle>
              <CardDescription>Admin tools and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <VStack spacing={3}>
                <Button
                  variant="solid"
                  fullWidth
                  onPress={() => {
                    router.push('/(home)/admin');
                  }}
                >
                  Admin Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => {
                    Alert.alert("Coming Soon", "System settings will be available in the next update.");
                  }}
                >
                  System Settings
                </Button>
              </VStack>
            </CardContent>
          </Card>
        )}

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>Configure app behavior and appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={4}>
              <DarkModeToggle />
              
              <Box borderTopWidth={1} borderTheme="border" pt={4} mt={2}>
                <ThemeSelector />
              </Box>
              
              <Box borderTopWidth={1} borderTheme="border" pt={4} mt={2}>
                <SpacingDensitySelector />
              </Box>
              
              <Box borderTopWidth={1} borderTheme="border" pt={4} mt={2}>
                <VStack spacing={2}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text size="base" weight="medium" colorTheme="foreground">
                      Push Notifications
                    </Text>
                    <Text size="sm" colorTheme="mutedForeground">
                      {notificationPermission === 'granted' ? '✅ Enabled' : '❌ Disabled'}
                    </Text>
                  </HStack>
                  <Button
                    variant={notificationPermission === 'granted' ? 'outline' : 'solid'}
                    fullWidth
                    isLoading={isRequestingPermission}
                    onPress={async () => {
                      try {
                        setIsRequestingPermission(true);
                        
                        if (notificationPermission === 'granted') {
                          // Show test notification
                          await notificationService.showTestNotification();
                          Alert.alert(
                            'Test Notification Sent',
                            'Check your notification panel to see the test notification!'
                          );
                        } else {
                          // Request permission
                          const result = await notificationService.requestPermissions();
                          
                          if (result.granted) {
                            setNotificationPermission('granted');
                            
                            // Get push token
                            const token = await notificationService.getExpoPushToken();
                            log.info('Push token obtained', 'SETTINGS', { token });
                            
                            // Show test notification
                            await notificationService.showTestNotification();
                            
                            Alert.alert(
                              'Notifications Enabled!',
                              'You will now receive push notifications. A test notification has been sent.'
                            );
                          } else {
                            Alert.alert(
                              'Permission Denied',
                              Platform.OS === 'ios'
                                ? 'Please enable notifications in Settings > Notifications > [App Name]'
                                : 'Please enable notifications in your device settings.'
                            );
                          }
                        }
                      } catch (error: any) {
                        log.error('Notification setup failed', 'SETTINGS', error);
                        Alert.alert(
                          'Error',
                          error.message || 'Failed to set up notifications. Please try again.'
                        );
                      } finally {
                        setIsRequestingPermission(false);
                        checkNotificationPermission();
                      }
                    }}
                  >
                    {isRequestingPermission
                      ? 'Setting up...'
                      : notificationPermission === 'granted'
                        ? 'Send Test Notification'
                        : 'Enable Notifications'}
                  </Button>
                  {notificationPermission === 'granted' && (
                    <Text size="xs" colorTheme="mutedForeground" align="center">
                      Tap to send a test push notification to this device
                    </Text>
                  )}
                </VStack>
              </Box>
            </VStack>
          </CardContent>
        </Card>

        {/* Developer Options */}
        <Card>
          <CardHeader>
            <CardTitle>Developer Options</CardTitle>
            <CardDescription>Tools and demos for development</CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={3}>
              <Button
                variant="outline"
                fullWidth
                onPress={() => router.push('/(home)/demo-universal')}
              >
                Universal Components Demo
              </Button>
              <Text size="xs" colorTheme="mutedForeground" align="center">
                View Dialog and DropdownMenu examples
              </Text>
            </VStack>
          </CardContent>
        </Card>

        {/* Developer Options (only in development) */}
        {__DEV__ && (
          <Card>
            <CardHeader>
              <CardTitle>Developer Options</CardTitle>
              <CardDescription>Advanced options for development</CardDescription>
            </CardHeader>
            <CardContent>
              <VStack spacing={3}>
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => router.push('/(auth)/theme-test')}
                >
                  Theme Testing Playground
                </Button>
              </VStack>
            </CardContent>
          </Card>
        )}

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <VStack spacing={2}>
              <HStack justifyContent="space-between">
                <Text colorTheme="mutedForeground">Version</Text>
                <Text colorTheme="mutedForeground">1.0.0</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text colorTheme="mutedForeground">Environment</Text>
                <Text colorTheme="mutedForeground">Development</Text>
              </HStack>
            </VStack>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle colorTheme="destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={{ gap: 12 }}>
              <Button
                variant="destructive"
                fullWidth
                onPress={handleSignOut}
              >
                Sign Out
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onPress={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </View>
          </CardContent>
        </Card>
        </VStack>
      </VStack>
    </ScrollContainer>
  );
}