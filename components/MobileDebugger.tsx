import React, { useState, useEffect } from 'react';
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

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  data?: any;
  source?: string;
}

const LOG_COLORS = {
  error: '#ef4444',
  warn: '#f59e0b',
  info: '#3b82f6',
  debug: '#10b981',
};

export function MobileDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info' | 'debug'>('all');
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only show in development
    if (!__DEV__) return;

    // Intercept console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    const addLog = (level: LogEntry['level'], args: any[]) => {
      const message = args
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      const newLog: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36),
        timestamp: new Date(),
        level,
        message,
        data: args.length > 1 ? args.slice(1) : undefined,
        source: new Error().stack?.split('\n')[3]?.trim(),
      };

      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
      }, 0);
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('info', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args);
    };

    console.debug = (...args) => {
      originalConsole.debug(...args);
      addLog('debug', args);
    };

    // Cleanup
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    };
  }, []);

  if (!__DEV__) return null;

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setLogs([]) }
      ]
    );
  };

  const exportLogs = () => {
    const logText = logs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
    
    Alert.alert(
      'Export Logs',
      'Copy the logs from the console output',
      [{ text: 'OK' }]
    );
    console.log('=== EXPORTED LOGS ===\n' + logText + '\n=== END LOGS ===');
  };

  return (
    <>
      {/* Floating Debug Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.floatingButtonText}>🐛</Text>
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
              Role: {user?.role || 'N/A'} | 
              Auth: {isAuthenticated ? '✅' : '❌'}
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
                  {level.toUpperCase()} ({logs.filter(l => level === 'all' || l.level === level).length})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={clearLogs}>
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={exportLogs}>
              <Text style={styles.actionButtonText}>Export</Text>
            </TouchableOpacity>
          </View>

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
                  <Text style={styles.logMessage} numberOfLines={3}>
                    {log.message}
                  </Text>
                  {log.source && (
                    <Text style={styles.logSource} numberOfLines={1}>
                      {log.source}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Environment Info */}
          <View style={styles.envInfo}>
            <Text style={styles.envInfoText}>
              Platform: {Platform.OS} | 
              API: {process.env.EXPO_PUBLIC_API_URL || 'Not set'} | 
              Env: {process.env.EXPO_PUBLIC_ENVIRONMENT || 'Not set'}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  floatingButtonText: {
    fontSize: 24,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  logSource: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  envInfo: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  envInfoText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});