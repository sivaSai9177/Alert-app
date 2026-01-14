import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getRuntimeConfig, updateRuntimeConfig, clearRuntimeConfig } from '@/lib/core/runtime-config';
import { clearEnvCache } from '@/lib/core/unified-env';
import { Container } from '@/components/universal/Container';
import { VStack } from '@/components/universal/Stack';
import { Card } from '@/components/universal/Card';
import { Button } from '@/components/universal/Button';
import { Input } from '@/components/universal/Input';
import { log } from '@/lib/core/logger';

export default function DevConfigScreen() {
  const router = useRouter();
  const [config, setConfig] = useState(getRuntimeConfig());
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [wsUrl, setWsUrl] = useState(config.wsUrl);
  
  useEffect(() => {
    const currentConfig = getRuntimeConfig();
    setConfig(currentConfig);
    setApiUrl(currentConfig.apiUrl);
    setWsUrl(currentConfig.wsUrl);
  }, []);
  
  const handleSave = async () => {
    try {
      await updateRuntimeConfig({
        apiUrl,
        wsUrl,
        isPhysicalDevice: !apiUrl.includes('localhost'),
        detectedIp: apiUrl.match(/http:\/\/([^:]+):/)?.[1] || 'localhost',
      });
      
      // Clear caches
      clearEnvCache();
      
      Alert.alert('Success', 'Configuration saved. Please restart the app for changes to take effect.');
      
      // Navigate back to home
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to save configuration');
      log.error('Failed to save config', 'DEV_CONFIG', error);
    }
  };
  
  const handleReset = async () => {
    try {
      await clearRuntimeConfig();
      clearEnvCache();
      Alert.alert('Success', 'Configuration reset. Please restart the app.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset configuration');
    }
  };
  
  const detectIP = () => {
    // Try to get IP from various sources
    const expoExtra = Constants.expoConfig?.extra || (Constants as any).manifest?.extra;
    const manifestUrl = Constants.expoConfig?.hostUri || 
                       (Constants as any).manifest?.hostUri ||
                       (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    
    let detectedIp = 'localhost';
    
    if (expoExtra?.detectedIp) {
      detectedIp = expoExtra.detectedIp;
    } else if (manifestUrl && !manifestUrl.includes('localhost')) {
      detectedIp = manifestUrl.split(':')[0];
    }
    
    setApiUrl(`http://${detectedIp}:8081`);
    setWsUrl(`ws://${detectedIp}:3001`);
  };
  
  return (
    <Container>
      <VStack p={4} spacing={4}>
        <Card>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              Development Configuration
            </Text>
            
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              Configure API endpoints for iOS physical device testing
            </Text>
            
            <VStack spacing={4}>
              <View>
                <Text style={{ marginBottom: 4, fontWeight: '600' }}>API URL:</Text>
                <Input
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  placeholder="http://192.168.1.9:8081"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View>
                <Text style={{ marginBottom: 4, fontWeight: '600' }}>WebSocket URL:</Text>
                <Input
                  value={wsUrl}
                  onChangeText={setWsUrl}
                  placeholder="ws://192.168.1.9:3001"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <Button onPress={detectIP} variant="outline">
                Auto-Detect IP
              </Button>
              
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Current Config:
                </Text>
                <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>
                  {JSON.stringify(config, null, 2)}
                </Text>
              </View>
              
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Environment Info:
                </Text>
                <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>
                  Platform: {Platform.OS}{'\n'}
                  Is Device: {Constants.isDevice ? 'Yes' : 'No'}{'\n'}
                  Expo Config: {JSON.stringify(Constants.expoConfig?.extra, null, 2)}
                </Text>
              </View>
              
              <VStack spacing={2} style={{ marginTop: 16 }}>
                <Button onPress={handleSave}>
                  Save Configuration
                </Button>
                
                <Button onPress={handleReset} variant="outline">
                  Reset to Default
                </Button>
                
                <Button onPress={() => router.back()} variant="ghost">
                  Cancel
                </Button>
              </VStack>
            </VStack>
          </View>
        </Card>
      </VStack>
    </Container>
  );
}