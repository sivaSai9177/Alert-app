import React, { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
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
  Button
} from '@/components/universal';
import { Avatar } from '@/components/Avatar';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SpacingDensitySelector } from '@/components/SpacingDensitySelector';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { log } from '@/lib/core/logger';
import { useTheme } from '@/lib/theme/theme-provider';
import { notificationService } from '@/lib/notifications/notification-service';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
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
      if (Platform.OS === 'web') {
        // Check browser notification permission
        if ('Notification' in window) {
          setNotificationPermission(Notification.permission);
        } else {
          setNotificationPermission('unsupported');
        }
      } else {
        // Check native notification permission
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationPermission(status);
      }
    } catch (error) {
      log.error('Failed to check notification permission', 'SETTINGS', error);
    }
  };

  const handleLogout = async () => {
    log.info('Logout initiated', 'SETTINGS', { user: user?.email });
    
    try {
      await logout('user_initiated');
      log.auth.logout('User logged out from settings', { trigger: 'manual' });
      log.info('Logout completed successfully', 'SETTINGS');
      
      // The home layout guard will automatically redirect when isAuthenticated becomes false
      log.info('Auth state cleared, home layout will redirect', 'SETTINGS');
    } catch (error: any) {
      log.error('Logout failed', 'SETTINGS', error);
      log.auth.error('Logout failed', error);
      
      // Even if logout fails (e.g., session already gone), we've cleared local state
      // The home layout guard will handle the redirect
      if (error?.message?.includes('Failed to get session')) {
        log.warn('Session already cleared on server, local state cleared', 'SETTINGS');
      } else {
        Alert.alert("Logout Notice", "You have been logged out");
      }
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
    <ScrollContainer safe headerTitle="Settings">
      <VStack p={4} spacing={4}>
        <Heading1 mb={6}>
          Settings
        </Heading1>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <HStack spacing={4} alignItems="center">
              <Avatar 
                image={user?.image}
                name={user?.name || 'User'}
                size={60}
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
            <VStack spacing={3}>
              <Button
                variant="solid"
                colorScheme="destructive"
                fullWidth
                onPress={handleLogout}
              >
                Sign Out
              </Button>
              
              <Button
                variant="outline"
                colorScheme="destructive"
                fullWidth
                onPress={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </VStack>
          </CardContent>
        </Card>
      </VStack>
    </ScrollContainer>
  );
}