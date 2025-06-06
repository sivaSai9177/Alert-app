import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/hooks/useAuth';
import { getLogHistory, clearLogHistory, LogLevel, LogEntry } from '@/lib/core/debug';
import { TanStackDebugInfo } from './TanStackDebugInfo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/IconSymbol';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/lib/theme/theme-provider';

const LOG_COLORS = {
  [LogLevel.ERROR]: '#ef4444',
  [LogLevel.WARN]: '#f59e0b',
  [LogLevel.INFO]: '#3b82f6',
  [LogLevel.DEBUG]: '#10b981',
};

export function EnhancedDebugPanel() {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<LogLevel>(LogLevel.DEBUG);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'tanstack'>('logs');
  const { user, isAuthenticated, hasHydrated } = useAuth();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const refreshLogs = useCallback(() => {
    setLogs(getLogHistory({ level: logFilter }));
  }, [logFilter]);

  // Auto-refresh logs every second when panel is open
  useEffect(() => {
    if (visible) {
      refreshLogs();
      const interval = setInterval(refreshLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [visible, refreshLogs]);

  if (!__DEV__) return null;

  const handleExport = async () => {
    const logText = logs
      .map(log => 
        `[${log.timestamp.toISOString()}] [${LogLevel[log.level]}] [${log.component}] ${log.message}${
          log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''
        }`
      )
      .join('\n\n');
    
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(logText);
        Alert.alert('Success', 'Logs copied to clipboard');
      } catch (err) {
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-logs-${Date.now()}.txt`;
        a.click();
      }
    } else {
      // React Native clipboard
      await Clipboard.setStringAsync(logText);
      Alert.alert('Success', 'Logs copied to clipboard');
    }
  };

  const copyLogEntry = async (log: LogEntry) => {
    const logText = `[${log.timestamp.toISOString()}] [${LogLevel[log.level]}] [${log.component}] ${log.message}${
      log.data ? '\nData: ' + JSON.stringify(log.data, null, 2) : ''
    }`;
    
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(logText);
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
      }
    } else {
      await Clipboard.setStringAsync(logText);
    }
    
    Alert.alert('Copied', 'Log entry copied to clipboard');
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = logFilter >= log.level;
    const matchesSearch = !searchQuery || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const errorCount = logs.filter(l => l.level === LogLevel.ERROR).length;

  return (
    <>
      {/* Floating Debug Button */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          backgroundColor: '#6366f1',
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 1000,
        }}
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>🐛</Text>
        {errorCount > 0 && (
          <View style={{
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
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
              {errorCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Debug Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          {/* iOS-style Navigation Bar */}
          <View style={[styles.header, { 
            height: insets.top + 44,
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.background + 'F0',
          }]}>
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={100}
                tint={theme.background === '#ffffff' ? 'light' : 'dark'}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            
            <View style={[styles.headerContent, { marginTop: insets.top }]}>
              {/* Left close button */}
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.closeButtonText, { color: '#007AFF' }]}>
                  Close
                </Text>
              </TouchableOpacity>
              
              {/* Center title */}
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.headerTitle, { color: theme.foreground }]}>
                  Debug Console
                </Text>
              </View>
              
              {/* Empty right side for balance */}
              <View style={{ width: 60 }} />
            </View>
          </View>

          {/* Main Content Container - positioned below header */}
          <View style={{ 
            flex: 1, 
            backgroundColor: '#f9fafb',
            marginTop: insets.top + 44, // Push content below header
          }}>

          {/* Auth State Info */}
          <View style={{
            backgroundColor: '#eff6ff',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#dbeafe',
          }}>
            <Text style={{ fontSize: 12, color: '#1e40af', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) }}>
              Auth: {isAuthenticated ? '✅' : '❌'} | Hydrated: {hasHydrated ? '✅' : '❌'} | User: {user?.email || 'None'} | Role: {user?.role || 'None'}
            </Text>
            <Text style={{ fontSize: 11, color: '#1e40af', marginTop: 4 }}>
              API: {process.env.EXPO_PUBLIC_API_URL || 'Not set'} | Env: {process.env.EXPO_PUBLIC_ENVIRONMENT || 'dev'}
            </Text>
          </View>

          {/* Tab Navigation */}
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: '#fff',
            paddingHorizontal: 12,
            paddingTop: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          }}>
            <TouchableOpacity
              onPress={() => setActiveTab('logs')}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: activeTab === 'logs' ? '#6366f1' : 'transparent',
              }}
            >
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600',
                color: activeTab === 'logs' ? '#6366f1' : '#6b7280',
              }}>
                Logs
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('tanstack')}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: activeTab === 'tanstack' ? '#6366f1' : 'transparent',
              }}
            >
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600',
                color: activeTab === 'tanstack' ? '#6366f1' : '#6b7280',
              }}>
                TanStack Query
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar (only for logs tab) */}
          {activeTab === 'logs' && (
            <View style={{ padding: 12, backgroundColor: '#fff' }}>
              <TextInput
                placeholder="Search logs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  backgroundColor: '#f3f4f6',
                  padding: 8,
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </View>
          )}

          {/* Filter and Actions (only for logs tab) */}
          {activeTab === 'logs' && (
            <View style={{ backgroundColor: '#fff', paddingBottom: 12 }}>
              {/* Log Level Filter */}
              <ScrollView 
                horizontal 
                style={{ paddingHorizontal: 12 }}
                showsHorizontalScrollIndicator={false}
              >
              {[LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setLogFilter(level)}
                  style={{
                    backgroundColor: logFilter >= level ? '#6366f1' : '#e5e7eb',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ 
                    color: logFilter >= level ? 'white' : '#6b7280',
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {LogLevel[level]} ({logs.filter(l => l.level === level).length})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginTop: 12, gap: 8 }}>
              <TouchableOpacity
                onPress={refreshLogs}
                style={{
                  backgroundColor: '#3b82f6',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  Refresh
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Clear Logs',
                    'Are you sure you want to clear all logs?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Clear', 
                        style: 'destructive',
                        onPress: () => {
                          clearLogHistory();
                          refreshLogs();
                        }
                      }
                    ]
                  );
                }}
                style={{
                  backgroundColor: '#ef4444',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  Clear
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleExport}
                style={{
                  backgroundColor: '#10b981',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  Copy All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          )}

          {/* Content Area */}
          <ScrollView style={{ flex: 1, padding: 12 }}>
            {activeTab === 'logs' ? (
              // Logs Tab Content
              filteredLogs.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 40, fontSize: 16, color: '#9ca3af' }}>
                  No logs to display
                </Text>
              ) : (
              filteredLogs.map((logEntry) => (
                <TouchableOpacity
                  key={logEntry.id}
                  onPress={() => copyLogEntry(logEntry)}
                  onLongPress={() => {
                    Alert.alert(
                      'Log Details',
                      `${logEntry.message}\n\nComponent: ${logEntry.component}${
                        logEntry.data ? '\n\nData: ' + JSON.stringify(logEntry.data, null, 2) : ''
                      }`,
                      [
                        { text: 'Copy', onPress: () => copyLogEntry(logEntry) },
                        { text: 'OK', style: 'cancel' }
                      ]
                    );
                  }}
                  style={{
                    backgroundColor: '#fff',
                    marginBottom: 8,
                    padding: 12,
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: LOG_COLORS[logEntry.level],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ 
                      fontSize: 11,
                      fontWeight: '600',
                      color: LOG_COLORS[logEntry.level],
                    }}>
                      {LogLevel[logEntry.level]} • {logEntry.component}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                      {logEntry.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>
                    {logEntry.message}
                  </Text>
                  {logEntry.data && (
                    <Text style={{
                      fontSize: 11,
                      color: '#6b7280',
                      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
                    }}>
                      {JSON.stringify(logEntry.data, null, 2)}
                    </Text>
                  )}
                  <Text style={{ 
                    fontSize: 10, 
                    color: '#9ca3af', 
                    marginTop: 4,
                    fontStyle: 'italic',
                  }}>
                    Tap to copy • Long press for details
                  </Text>
                </TouchableOpacity>
              ))
              )
            ) : (
              // TanStack Query Tab Content
              <TanStackDebugInfo />
            )}
          </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  closeButton: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '400',
  },
});