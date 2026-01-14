import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useAuthStore } from '@/lib/stores/auth-store';
import { IconSymbol } from './ui/IconSymbol';

// Global log storage
export const DEBUG_LOGS: {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  data?: any;
}[] = [];

// Helper function to add logs
export const addDebugLog = (
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  data?: any
) => {
  DEBUG_LOGS.unshift({
    id: Date.now().toString() + Math.random().toString(36),
    timestamp: new Date(),
    level,
    message,
    data,
  });
  // Keep only last 100 logs
  if (DEBUG_LOGS.length > 100) {
    DEBUG_LOGS.pop();
  }
};

// Export for use in other components
export const debugLog = {
  error: (message: string, data?: any) => addDebugLog('error', message, data),
  warn: (message: string, data?: any) => addDebugLog('warn', message, data),
  info: (message: string, data?: any) => addDebugLog('info', message, data),
  debug: (message: string, data?: any) => addDebugLog('debug', message, data),
};

const LOG_COLORS = {
  error: '#ef4444',
  warn: '#f59e0b',
  info: '#3b82f6',
  debug: '#10b981',
};

export function SimpleMobileDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'debug'>('all');
  const { user, isAuthenticated } = useAuthStore();

  if (!__DEV__) return null;

  const filteredLogs = filter === 'all' 
    ? DEBUG_LOGS 
    : DEBUG_LOGS.filter(log => log.level === filter);

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive', 
          onPress: () => {
            DEBUG_LOGS.length = 0;
            setIsVisible(false);
          }
        }
      ]
    );
  };

  return (
    <>
      {/* Floating Debug Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.floatingButtonText}>🐛</Text>
        {DEBUG_LOGS.filter(l => l.level === 'error').length > 0 && (
          <View style={styles.errorBadge}>
            <Text style={styles.errorBadgeText}>
              {DEBUG_LOGS.filter(l => l.level === 'error').length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Debug Panel Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Debug Console</Text>
            <TouchableOpacity onPress={() => setIsVisible(false)}>
              <IconSymbol name="xmark.circle.fill" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
              User: {user?.email || 'Not logged in'} | 
              Auth: {isAuthenticated ? '✅' : '❌'} | 
              Env: {process.env.EXPO_PUBLIC_ENVIRONMENT || 'dev'}
            </Text>
          </View>

          {/* Filter Buttons */}
          <ScrollView 
            horizontal 
            style={styles.filterContainer}
            showsHorizontalScrollIndicator={false}
          >
            {(['all', 'error', 'warn', 'info', 'debug'] as const).map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.filterButton,
                  filter === level && styles.filterButtonActive,
                  level !== 'all' && { backgroundColor: LOG_COLORS[level] + '20' }
                ]}
                onPress={() => setFilter(level)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === level && styles.filterButtonTextActive
                ]}>
                  {level.toUpperCase()} ({DEBUG_LOGS.filter(l => level === 'all' || l.level === level).length})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Clear Button */}
          <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
            <Text style={styles.clearButtonText}>Clear All Logs</Text>
          </TouchableOpacity>

          {/* Logs */}
          <ScrollView style={styles.logsContainer}>
            {filteredLogs.length === 0 ? (
              <Text style={styles.noLogs}>No logs to display</Text>
            ) : (
              filteredLogs.map(log => (
                <TouchableOpacity
                  key={log.id}
                  style={[styles.logEntry, { borderLeftColor: LOG_COLORS[log.level] }]}
                  onPress={() => {
                    Alert.alert(
                      'Log Details',
                      log.message + (log.data ? '\n\nData: ' + JSON.stringify(log.data, null, 2) : ''),
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <View style={styles.logHeader}>
                    <Text style={[styles.logLevel, { color: LOG_COLORS[log.level] }]}>
                      {log.level.toUpperCase()}
                    </Text>
                    <Text style={styles.logTime}>
                      {log.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.logMessage} numberOfLines={2}>
                    {log.message}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* API Info */}
          <View style={styles.apiInfo}>
            <Text style={styles.apiInfoText}>
              API: {process.env.EXPO_PUBLIC_API_URL || 'Not set'}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5,
    zIndex: 9999,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  errorBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  errorBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  userInfo: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  userInfoText: {
    fontSize: 12,
    color: '#1e40af',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    maxHeight: 60,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearButton: {
    margin: 12,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    padding: 12,
  },
  noLogs: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#9ca3af',
  },
  logEntry: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  logMessage: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  apiInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  apiInfoText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});