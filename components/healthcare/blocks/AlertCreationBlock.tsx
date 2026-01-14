import React, { useState, useTransition, useDeferredValue, useOptimistic } from 'react';
import { Platform } from 'react-native';
import { 
  Card, 
  VStack, 
  HStack, 
  Text, 
  Input, 
  Button, 
  Grid,
  ScrollContainer,
  Box,
  Badge,
} from '@/components/universal';
import { goldenSpacing, goldenShadows, goldenAnimations, goldenDimensions, healthcareColors } from '@/lib/design-system/golden-ratio';
import { useTheme } from '@/lib/theme/theme-provider';
import { useAuthStore } from '@/lib/stores/auth-store';
import { api } from '@/lib/trpc';
import { z } from 'zod';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { log } from '@/lib/core/logger';
import { showErrorAlert, showSuccessAlert } from '@/lib/core/alert';

// Import healthcare types
import { 
  AlertType, 
  CreateAlertSchema, 
  CreateAlertInput,
  ALERT_TYPE_CONFIG,
  URGENCY_LEVEL_CONFIG 
} from '@/types/healthcare';

// Alert template type
interface AlertTemplate {
  id: string;
  type: AlertType;
  icon: string;
  label: string;
  color: string;
  defaultUrgency: number;
  defaultDescription?: string;
}

// Default alert templates based on ALERT_TYPE_CONFIG
const defaultTemplates: AlertTemplate[] = [
  { 
    id: 'cardiac_arrest', 
    type: 'cardiac_arrest', 
    icon: ALERT_TYPE_CONFIG.cardiac_arrest.icon, 
    label: 'Cardiac', 
    color: ALERT_TYPE_CONFIG.cardiac_arrest.color, 
    defaultUrgency: ALERT_TYPE_CONFIG.cardiac_arrest.defaultUrgency 
  },
  { 
    id: 'code_blue', 
    type: 'code_blue', 
    icon: ALERT_TYPE_CONFIG.code_blue.icon, 
    label: 'Code Blue', 
    color: ALERT_TYPE_CONFIG.code_blue.color, 
    defaultUrgency: ALERT_TYPE_CONFIG.code_blue.defaultUrgency 
  },
  { 
    id: 'fire', 
    type: 'fire', 
    icon: ALERT_TYPE_CONFIG.fire.icon, 
    label: 'Fire', 
    color: ALERT_TYPE_CONFIG.fire.color, 
    defaultUrgency: ALERT_TYPE_CONFIG.fire.defaultUrgency 
  },
  { 
    id: 'security', 
    type: 'security', 
    icon: ALERT_TYPE_CONFIG.security.icon, 
    label: 'Security', 
    color: ALERT_TYPE_CONFIG.security.color, 
    defaultUrgency: ALERT_TYPE_CONFIG.security.defaultUrgency 
  },
  { 
    id: 'medical_emergency', 
    type: 'medical_emergency', 
    icon: ALERT_TYPE_CONFIG.medical_emergency.icon, 
    label: 'Medical', 
    color: ALERT_TYPE_CONFIG.medical_emergency.color, 
    defaultUrgency: ALERT_TYPE_CONFIG.medical_emergency.defaultUrgency 
  },
];

// Zustand store for alert creation
interface AlertCreationState {
  formData: Partial<CreateAlertInput>;
  isVoiceRecording: boolean;
  templates: AlertTemplate[];
  updateFormData: (data: Partial<CreateAlertInput>) => void;
  resetForm: () => void;
  setVoiceRecording: (recording: boolean) => void;
  applyTemplate: (templateId: string) => void;
}

const useAlertCreationStore = create<AlertCreationState>()(
  devtools(
    persist(
      immer((set) => ({
        formData: {},
        isVoiceRecording: false,
        templates: defaultTemplates,
        
        updateFormData: (data) =>
          set((state) => {
            Object.assign(state.formData, data);
          }),
          
        resetForm: () =>
          set((state) => {
            state.formData = {};
          }),
          
        setVoiceRecording: (recording) =>
          set((state) => {
            state.isVoiceRecording = recording;
          }),
          
        applyTemplate: (templateId) =>
          set((state) => {
            const template = state.templates.find(t => t.id === templateId);
            if (template) {
              state.formData = {
                ...state.formData,
                alertType: template.type,
                urgencyLevel: template.defaultUrgency,
                description: template.defaultDescription,
              };
            }
          }),
      })),
      {
        name: 'alert-creation',
        partialize: (state) => ({ formData: state.formData }),
      }
    )
  )
);

// Alert type button component
const AlertTypeButton = ({ type, icon, label, color, selected, onPress }: {
  type: string;
  icon: string;
  label: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const theme = useTheme();
  
  return (
    <Button
      onPress={onPress}
      variant={selected ? "solid" : "outline"}
      style={{
        height: goldenDimensions.heights.medium,
        backgroundColor: selected ? color : 'transparent',
        borderColor: color,
        borderWidth: 2,
      }}
    >
      <VStack spacing={goldenSpacing.xs} alignItems="center">
        <Text size="2xl">{icon}</Text>
        <Text size="sm" weight="medium" colorTheme={selected ? "inverse" : "foreground"}>
          {label}
        </Text>
      </VStack>
    </Button>
  );
};

// Main alert creation block
export const AlertCreationBlock = ({ hospitalId }: { hospitalId: string }) => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const queryClient = api.useUtils();
  
  // Zustand store
  const { formData, updateFormData, resetForm, applyTemplate, templates } = useAlertCreationStore();
  
  // React 19 - Deferred search for room suggestions
  const [roomSearch, setRoomSearch] = useState('');
  const deferredRoomSearch = useDeferredValue(roomSearch);
  
  // TanStack Query - Room suggestions (commented out as endpoint might not exist yet)
  // const { data: roomSuggestions } = api.rooms.search.useQuery(
  //   { query: deferredRoomSearch },
  //   { 
  //     enabled: deferredRoomSearch.length >= 2,
  //     staleTime: 30000,
  //   }
  // );
  
  // tRPC mutation with optimistic updates
  const createAlertMutation = api.healthcare.createAlert.useMutation({
    onMutate: async (newAlert) => {
      // Cancel queries
      await queryClient.healthcare.getActiveAlerts.cancel();
      
      // Snapshot previous value
      const previousAlerts = queryClient.healthcare.getActiveAlerts.getData();
      
      // Optimistically update
      queryClient.healthcare.getActiveAlerts.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          alerts: [
            {
              ...newAlert,
              id: 'temp-' + Date.now(),
              status: 'pending',
              createdAt: new Date(),
              createdBy: user?.id || '',
              createdByName: user?.name || 'Unknown',
              acknowledged: false,
              acknowledgedAt: null,
              acknowledgedBy: null,
              acknowledgedByName: null,
              resolved: false,
              resolvedAt: null,
              resolvedBy: null,
              resolvedByName: null,
            },
            ...old.alerts
          ]
        };
      });
      
      return { previousAlerts };
    },
    onError: (err, newAlert, context) => {
      // Rollback on error
      if (context?.previousAlerts) {
        queryClient.healthcare.getActiveAlerts.setData(undefined, context.previousAlerts);
      }
      showErrorAlert('Failed to create alert', err.message);
    },
    onSuccess: (data) => {
      resetForm();
      showSuccessAlert('Alert created successfully');
      
      // Invalidate and refetch
      queryClient.healthcare.getActiveAlerts.invalidate();
    },
  });
  
  // Form validation with Zod
  const validateAndSubmit = () => {
    startTransition(() => {
      try {
        const validatedData = CreateAlertSchema.parse({
          ...formData,
          hospitalId,
        });
        
        createAlertMutation.mutate(validatedData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const firstError = error.errors[0];
          showErrorAlert('Validation Error', firstError.message);
        }
      }
    });
  };
  
  // React 19 - Optimistic UI for template selection
  const [optimisticTemplate, setOptimisticTemplate] = useOptimistic(
    formData.alertType,
    (_, newTemplate: string) => newTemplate as AlertType
  );
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.xxl}
      shadow={goldenShadows.lg}
      style={{
        minHeight: goldenDimensions.heights.huge,
        backgroundColor: theme.card,
      }}
    >
      {/* Room Number with Autocomplete */}
      <VStack gap={goldenSpacing.md}>
        <Input
          label="Room Number *"
          value={formData.roomNumber || ''}
          onChangeText={(value) => {
            setRoomSearch(value);
            updateFormData({ roomNumber: value });
          }}
          placeholder="302"
          keyboardType="numeric"
          maxLength={3}
          size="large"
          autoFocus
          error={formData.roomNumber && !CreateAlertSchema.shape.roomNumber.safeParse(formData.roomNumber).success}
        />
        
        {/* Room suggestions placeholder */}
        {roomSearch.length >= 2 && (
          <Text size="sm" colorTheme="mutedForeground">
            Type full 3-digit room number
          </Text>
        )}
      </VStack>
      
      {/* Alert Type Selection with Optimistic Updates */}
      <VStack gap={goldenSpacing.md}>
        <Text weight="medium">Alert Type *</Text>
        <Grid columns={Platform.OS === 'web' ? 3 : 2} gap={goldenSpacing.md}>
          {templates.map((template) => (
            <AlertTypeButton
              key={template.id}
              type={template.id}
              icon={template.icon}
              label={template.label}
              color={template.color}
              selected={optimisticTemplate === template.type}
              onPress={() => {
                setOptimisticTemplate(template.type);
                startTransition(() => {
                  applyTemplate(template.id);
                });
              }}
            />
          ))}
        </Grid>
      </VStack>
      
      {/* Additional Details */}
      <VStack gap={goldenSpacing.sm}>
        <Text weight="medium">Additional Details</Text>
        <Input
          placeholder="Type additional information..."
          value={formData.description || ''}
          onChangeText={(value) => updateFormData({ description: value })}
          multiline
          numberOfLines={2}
          style={{ minHeight: goldenDimensions.heights.medium }}
        />
      </VStack>
      
      {/* Urgency Level */}
      {formData.alertType && (
        <VStack gap={goldenSpacing.sm}>
          <Text weight="medium">Urgency Level</Text>
          <HStack gap={goldenSpacing.md}>
            {[1, 2, 3, 4, 5].map((level) => {
              const urgencyConfig = URGENCY_LEVEL_CONFIG[level as keyof typeof URGENCY_LEVEL_CONFIG];
              return (
                <Button
                  key={level}
                  variant={formData.urgencyLevel === level ? "solid" : "outline"}
                  size="sm"
                  onPress={() => updateFormData({ urgencyLevel: level as 1 | 2 | 3 | 4 | 5 })}
                  style={{
                    backgroundColor: formData.urgencyLevel === level 
                      ? urgencyConfig.color
                      : 'transparent',
                    borderColor: urgencyConfig.color,
                  }}
                >
                  <Text 
                    size="xs" 
                    weight="medium"
                    style={{ 
                      color: formData.urgencyLevel === level 
                        ? urgencyConfig.textColor 
                        : urgencyConfig.color 
                    }}
                  >
                    {urgencyConfig.label}
                  </Text>
                </Button>
              );
            })}
          </HStack>
        </VStack>
      )}
      
      {/* Submit with Loading State */}
      <HStack gap={goldenSpacing.md} style={{ height: goldenDimensions.heights.medium }}>
        <Button
          size="lg"
          variant="solid"
          colorScheme="destructive"
          style={{ flex: PHI }}
          onPress={validateAndSubmit}
          isLoading={isPending || createAlertMutation.isPending}
          disabled={!formData.roomNumber || !formData.alertType}
        >
          {isPending ? 'Creating Alert...' : 'Send Alert →'}
        </Button>
        <Button
          size="lg"
          variant="outline"
          style={{ flex: 1 }}
          onPress={() => {
            startTransition(() => {
              resetForm();
            });
          }}
        >
          Cancel
        </Button>
      </HStack>
    </Card>
  );
};

// Re-export PHI constant
const PHI = 1.618;