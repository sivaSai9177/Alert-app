import React, { useState } from 'react';
import { View, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  VStack, 
  Text, 
  Button, 
  Input, 
  Container,
  Card,
  Select,
  Alert,
  HStack,
  Box,
} from '@/components/universal';
import { api } from '@/lib/trpc';
import { 
  AlertType, 
  UrgencyLevel, 
  ALERT_TYPE_CONFIG, 
  URGENCY_LEVEL_CONFIG,
  type CreateAlertInput,
} from '@/types/healthcare';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTheme } from '@/lib/theme/theme-provider';
import { showErrorAlert } from '@/lib/core/alert';
import { log } from '@/lib/core/logger';

interface AlertCreationFormProps {
  hospitalId: string;
}

export function AlertCreationForm({ hospitalId }: AlertCreationFormProps) {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  
  // Form state
  const [roomNumber, setRoomNumber] = useState('');
  const [alertType, setAlertType] = useState<AlertType | ''>('');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel | ''>('');
  const [description, setDescription] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Create alert mutation
  const createAlertMutation = api.healthcare.createAlert.useMutation({
    onSuccess: () => {
      log.info('Alert created successfully', 'HEALTHCARE_UI', {
        alertType,
        urgencyLevel,
        roomNumber,
      });
      
      // Reset form
      setRoomNumber('');
      setAlertType('');
      setUrgencyLevel('');
      setDescription('');
      setShowConfirmation(false);
      
      // Navigate to alerts dashboard
      router.push('/(home)/');
    },
    onError: (error) => {
      log.error('Failed to create alert', 'HEALTHCARE_UI', error);
      showErrorAlert('Failed to Create Alert', error.message);
    },
  });
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!roomNumber || !alertType || !urgencyLevel) {
      showErrorAlert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    // Show confirmation for critical alerts
    const config = ALERT_TYPE_CONFIG[alertType as AlertType];
    if (config?.requiresConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    // Submit alert
    submitAlert();
  };
  
  const submitAlert = () => {
    const alertData: CreateAlertInput = {
      roomNumber: roomNumber.toUpperCase(),
      alertType: alertType as AlertType,
      urgencyLevel: urgencyLevel as UrgencyLevel,
      description: description.trim(),
      hospitalId,
    };
    
    createAlertMutation.mutate(alertData);
  };
  
  // Auto-set urgency level based on alert type
  const handleAlertTypeChange = (type: string) => {
    setAlertType(type as AlertType);
    
    // Set default urgency level based on alert type
    const config = ALERT_TYPE_CONFIG[type as AlertType];
    if (config?.defaultUrgency) {
      setUrgencyLevel(config.defaultUrgency);
    }
  };
  
  const isLoading = createAlertMutation.isPending;
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <VStack spacing={4} p={4}>
          {/* Alert Type Selection */}
          <Card>
            <VStack spacing={3}>
              <Text weight="semibold" size="lg">Alert Type *</Text>
              <Select
                value={alertType}
                onValueChange={handleAlertTypeChange}
                placeholder="Select alert type"
                items={[
                  { label: '🚨 Cardiac Arrest', value: 'cardiac_arrest' },
                  { label: '🚑 Code Blue', value: 'code_blue' },
                  { label: '🔥 Fire Alert', value: 'fire' },
                  { label: '🔒 Security Alert', value: 'security' },
                  { label: '⚕️ Medical Emergency', value: 'medical_emergency' },
                ]}
              />
            </VStack>
          </Card>
          
          {/* Room Number */}
          <Card>
            <VStack spacing={3}>
              <Text weight="semibold" size="lg">Room Number *</Text>
              <Input
                value={roomNumber}
                onChangeText={setRoomNumber}
                placeholder="e.g., 301, ICU-2, ER-1"
                autoCapitalize="characters"
                maxLength={10}
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  height: 60,
                }}
              />
            </VStack>
          </Card>
          
          {/* Urgency Level */}
          <Card>
            <VStack spacing={3}>
              <Text weight="semibold" size="lg">Urgency Level *</Text>
              <Select
                value={String(urgencyLevel)}
                onValueChange={(value) => setUrgencyLevel(Number(value) as UrgencyLevel)}
                placeholder="Select urgency level"
                items={[
                  { label: '🔴 Critical - Immediate Response', value: '1' },
                  { label: '🟠 High - Urgent', value: '2' },
                  { label: '🟡 Medium - Soon', value: '3' },
                  { label: '🟢 Low - When Available', value: '4' },
                  { label: '🔵 Information Only', value: '5' },
                ]}
              />
              
              {urgencyLevel && (
                <Box
                  p={2}
                  rounded="md"
                  style={{
                    backgroundColor: URGENCY_LEVEL_CONFIG[urgencyLevel].color + '20',
                  }}
                >
                  <Text
                    size="sm"
                    style={{
                      color: URGENCY_LEVEL_CONFIG[urgencyLevel].color,
                    }}
                  >
                    {URGENCY_LEVEL_CONFIG[urgencyLevel].label} Priority
                  </Text>
                </Box>
              )}
            </VStack>
          </Card>
          
          {/* Description */}
          <Card>
            <VStack spacing={3}>
              <Text weight="semibold" size="lg">Additional Information</Text>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the situation..."
                multiline
                numberOfLines={3}
                maxLength={500}
                style={{
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
              />
              <Text size="xs" colorTheme="mutedForeground">
                {description.length}/500 characters
              </Text>
            </VStack>
          </Card>
          
          {/* Alert Preview */}
          {roomNumber && alertType && urgencyLevel && (
            <Alert variant="default">
              <VStack spacing={2}>
                <Text weight="bold">Alert Preview:</Text>
                <Text size="sm">
                  {ALERT_TYPE_CONFIG[alertType as AlertType]?.icon} {alertType.replace('_', ' ').toUpperCase()} - Room {roomNumber}
                </Text>
                <Text size="sm" colorTheme="mutedForeground">
                  Urgency: {URGENCY_LEVEL_CONFIG[urgencyLevel].label}
                </Text>
                {description && (
                  <Text size="sm" colorTheme="mutedForeground">
                    {description}
                  </Text>
                )}
              </VStack>
            </Alert>
          )}
          
          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            variant="destructive"
            size="lg"
            disabled={!roomNumber || !alertType || !urgencyLevel || isLoading}
            style={{
              height: 60,
              opacity: (!roomNumber || !alertType || !urgencyLevel) ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Creating Alert...' : 'CREATE ALERT'}
          </Button>
          
          {/* Confirmation Dialog */}
          {showConfirmation && (
            <Card
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.background + 'F0',
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <Card>
                <VStack spacing={4}>
                  <Text size="xl" weight="bold" align="center">
                    Confirm {alertType.replace('_', ' ').toUpperCase()}
                  </Text>
                  
                  <Alert variant="destructive">
                    <Text weight="semibold">
                      You are about to create a {URGENCY_LEVEL_CONFIG[urgencyLevel as UrgencyLevel].label} priority alert.
                    </Text>
                    <Text size="sm" style={{ marginTop: 8 }}>
                      This will immediately notify all available medical staff.
                    </Text>
                  </Alert>
                  
                  <VStack spacing={2}>
                    <Text weight="semibold">Room: {roomNumber}</Text>
                    <Text>Type: {alertType.replace('_', ' ')}</Text>
                    <Text>Urgency: {URGENCY_LEVEL_CONFIG[urgencyLevel as UrgencyLevel].label}</Text>
                    {description && <Text size="sm">Details: {description}</Text>}
                  </VStack>
                  
                  <HStack spacing={3}>
                    <Button
                      onPress={() => setShowConfirmation(false)}
                      variant="outline"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onPress={() => {
                        setShowConfirmation(false);
                        submitAlert();
                      }}
                      variant="destructive"
                      style={{ flex: 1 }}
                      disabled={isLoading}
                    >
                      Confirm Alert
                    </Button>
                  </HStack>
                </VStack>
              </Card>
            </Card>
          )}
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}