import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { log } from '@/lib/core/logger';

// Configure how notifications should be presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  ios?: {
    status: Notifications.IosAuthorizationStatus;
    allowsAlert: boolean;
    allowsSound: boolean;
    allowsBadge: boolean;
  };
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Check current notification permission status
   */
  async checkPermissionStatus(): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        if (!('Notification' in window)) {
          return 'unsupported';
        }
        return Notification.permission;
      } else {
        const { status } = await Notifications.getPermissionsAsync();
        return status;
      }
    } catch (error) {
      log.error('Failed to check permission status', 'NOTIFICATIONS', error);
      return 'undetermined';
    }
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      // Handle web browser notifications separately
      if (Platform.OS === 'web') {
        if (!('Notification' in window)) {
          throw new Error('This browser does not support notifications');
        }

        const permission = await Notification.requestPermission();
        return {
          granted: permission === 'granted',
          canAskAgain: permission === 'default',
        };
      }

      // Check if we're on a physical device (for native)
      if (!Device.isDevice) {
        log.warn('Push notifications only work on physical devices', 'NOTIFICATIONS');
        throw new Error('Must use physical device for push notifications');
      }

      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        log.warn('Permission to receive notifications was denied', 'NOTIFICATIONS');
        return {
          granted: false,
          canAskAgain: true,
        };
      }

      // Get detailed iOS permissions if on iOS
      if (Platform.OS === 'ios') {
        const settings = await Notifications.getPermissionsAsync();
        return {
          granted: true,
          canAskAgain: false,
          ios: settings.ios,
        };
      }

      return {
        granted: true,
        canAskAgain: false,
      };
    } catch (error) {
      log.error('Failed to request notification permissions', 'NOTIFICATIONS', error);
      throw error;
    }
  }

  /**
   * Get the Expo push token for this device
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (this.expoPushToken) {
        return this.expoPushToken;
      }

      // Push tokens are not available on web
      if (Platform.OS === 'web') {
        log.info('Push tokens are not available on web', 'NOTIFICATIONS');
        return null;
      }

      if (!Device.isDevice) {
        log.warn('Push tokens are only available on physical devices', 'NOTIFICATIONS');
        return null;
      }

      // Check for project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      if (!projectId) {
        log.warn('Project ID not found. Push notifications may not work correctly.', 'NOTIFICATIONS');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      this.expoPushToken = token.data;
      log.info('Expo push token obtained', 'NOTIFICATIONS', { token: this.expoPushToken });
      return this.expoPushToken;
    } catch (error) {
      log.error('Failed to get Expo push token', 'NOTIFICATIONS', error);
      return null;
    }
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      // Local notifications don't work on web
      if (Platform.OS === 'web') {
        throw new Error('Local notifications are not supported on web. Use showTestNotification() instead.');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#FF1493', // Pink color to match theme
        },
        trigger: trigger || null, // null means immediate
      });

      log.info('Local notification scheduled', 'NOTIFICATIONS', { notificationId, title });
      return notificationId;
    } catch (error) {
      log.error('Failed to schedule local notification', 'NOTIFICATIONS', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        log.warn('Cannot cancel notifications on web', 'NOTIFICATIONS');
        return;
      }

      await Notifications.cancelScheduledNotificationAsync(notificationId);
      log.info('Notification cancelled', 'NOTIFICATIONS', { notificationId });
    } catch (error) {
      log.error('Failed to cancel notification', 'NOTIFICATIONS', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        log.warn('Cannot cancel notifications on web', 'NOTIFICATIONS');
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      log.info('All notifications cancelled', 'NOTIFICATIONS');
    } catch (error) {
      log.error('Failed to cancel all notifications', 'NOTIFICATIONS', error);
      throw error;
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    // Notification listeners don't work on web
    if (Platform.OS === 'web') {
      log.info('Notification listeners are not available on web', 'NOTIFICATIONS');
      return;
    }

    // Remove existing listeners
    this.removeNotificationListeners();

    // Listen for notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      log.info('Notification received', 'NOTIFICATIONS', {
        title: notification.request.content.title,
        body: notification.request.content.body,
      });
      onNotificationReceived?.(notification);
    });

    // Listen for when user interacts with notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      log.info('Notification response received', 'NOTIFICATIONS', {
        actionIdentifier: response.actionIdentifier,
        notification: response.notification.request.content.title,
      });
      onNotificationResponse?.(response);
    });
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      if (Platform.OS === 'web') {
        log.info('Scheduled notifications are not available on web', 'NOTIFICATIONS');
        return [];
      }

      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      log.info('Retrieved scheduled notifications', 'NOTIFICATIONS', {
        count: notifications.length,
      });
      return notifications;
    } catch (error) {
      log.error('Failed to get scheduled notifications', 'NOTIFICATIONS', error);
      throw error;
    }
  }

  /**
   * Set badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const success = await Notifications.setBadgeCountAsync(count);
        log.info('Badge count set', 'NOTIFICATIONS', { count, success });
        return success;
      }
      return false;
    } catch (error) {
      log.error('Failed to set badge count', 'NOTIFICATIONS', error);
      return false;
    }
  }

  /**
   * Get badge count (iOS only)
   */
  async getBadgeCount(): Promise<number> {
    try {
      if (Platform.OS === 'ios') {
        const count = await Notifications.getBadgeCountAsync();
        return count;
      }
      return 0;
    } catch (error) {
      log.error('Failed to get badge count', 'NOTIFICATIONS', error);
      return 0;
    }
  }

  /**
   * Show a test notification
   */
  async showTestNotification(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use browser Notification API for web
        if (!('Notification' in window)) {
          throw new Error('This browser does not support notifications');
        }

        if (Notification.permission !== 'granted') {
          throw new Error('Notification permission not granted');
        }

        // Use a data URL for the icon to avoid path issues
        const iconDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRjE0OTMiLz4KPHBhdGggZD0iTTI0IDE4QzI0IDE2LjkgMjQuOSAxNiAyNiAxNkgzOEMzOS4xIDE2IDQwIDE2LjkgNDAgMThWMzRDNDAgMzUuMSAzOS4xIDM2IDM4IDM2SDM2VjQwLjdDMzYgNDEuNCAzNS40IDQyIDM0LjcgNDJDMzQuNSA0MiAzNC4zIDQxLjkgMzQuMiA0MS44TDI4IDM2SDI2QzI0LjkgMzYgMjQgMzUuMSAyNCAzNFYxOFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjI4IiBjeT0iMjYiIHI9IjIiIGZpbGw9IiNGRjE0OTMiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNiIgcj0iMiIgZmlsbD0iI0ZGMTQ5MyIvPgo8Y2lyY2xlIGN4PSIzNiIgY3k9IjI2IiByPSIyIiBmaWxsPSIjRkYxNDkzIi8+Cjwvc3ZnPg==';
        
        try {
          const notification = new Notification('🎉 Notifications Enabled!', {
            body: 'You will now receive notifications from our app. This is a test notification.',
            icon: iconDataUrl,
            badge: iconDataUrl,
            tag: 'test-notification',
            requireInteraction: false,
            data: { test: true, timestamp: Date.now() },
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          notification.onshow = () => {
            log.info('Web notification displayed', 'NOTIFICATIONS');
          };

          notification.onerror = (event) => {
            log.error('Web notification error', 'NOTIFICATIONS', event);
          };

          // Also show an in-app notification as a fallback
          this.showInAppNotification(
            '🎉 Notifications Enabled!',
            'You will now receive notifications from our app. This is a test notification.'
          );

          log.info('Web notification created successfully', 'NOTIFICATIONS', {
            permission: Notification.permission,
            tag: 'test-notification',
          });
        } catch (error) {
          log.error('Failed to create web notification', 'NOTIFICATIONS', error);
          // Show in-app notification as fallback
          this.showInAppNotification(
            '🎉 Notifications Enabled!',
            'Browser notifications are enabled but may be blocked by your system settings.'
          );
        }
      } else {
        // Use Expo notifications for native platforms
        await this.scheduleLocalNotification(
          '🎉 Notifications Enabled!',
          'You will now receive notifications from our app. This is a test notification.',
          { test: true, timestamp: Date.now() }
        );
      }
    } catch (error) {
      log.error('Failed to show test notification', 'NOTIFICATIONS', error);
      throw error;
    }
  }

  /**
   * Show an in-app notification (as a fallback when system notifications don't appear)
   */
  private showInAppNotification(title: string, message: string): void {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Create a notification element
      const notificationEl = document.createElement('div');
      notificationEl.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #FF1493;
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-width: 350px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: slideIn 0.3s ease-out;
        ">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 16px;">${title}</div>
          <div style="font-size: 14px; opacity: 0.9;">${message}</div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">&times;</button>
        </div>
        <style>
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        </style>
      `;
      
      document.body.appendChild(notificationEl);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        notificationEl.style.animation = 'slideOut 0.3s ease-in';
        notificationEl.style.animationFillMode = 'forwards';
        setTimeout(() => notificationEl.remove(), 300);
      }, 5000);
      
      // Add slide out animation
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  /**
   * Configure notification categories (for interactive notifications)
   */
  async setNotificationCategories(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        log.info('Notification categories are not available on web', 'NOTIFICATIONS');
        return;
      }

      await Notifications.setNotificationCategoryAsync('message', [
        {
          identifier: 'reply',
          buttonTitle: 'Reply',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
      log.info('Notification categories configured', 'NOTIFICATIONS');
    } catch (error) {
      log.error('Failed to set notification categories', 'NOTIFICATIONS', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();