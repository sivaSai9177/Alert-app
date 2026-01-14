# Healthcare Blocks Implementation Examples

## 🚀 Technology Stack Integration

### Core Libraries
- **React 19**: Concurrent features, Suspense, Transitions
- **TanStack Query**: Server state management
- **Zustand**: Client state management
- **Zod**: Runtime type validation
- **tRPC**: Type-safe API calls

## 🏥 Alert Creation Block Implementation

### Zod Schemas
```typescript
import { z } from 'zod';

// Alert validation schemas
export const alertTypeSchema = z.enum([
  'cardiac',
  'code-blue',
  'fall',
  'fire',
  'security',
  'medical-emergency'
]);

export const createAlertSchema = z.object({
  roomNumber: z.string().regex(/^\d{3}$/, 'Room number must be 3 digits'),
  alertType: alertTypeSchema,
  urgency: z.number().min(1).max(5).default(3),
  description: z.string().optional(),
  departmentId: z.string().uuid(),
  hospitalId: z.string().uuid(),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
```

### Zustand Store
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';

interface AlertCreationState {
  // Form state
  formData: Partial<CreateAlertInput>;
  isVoiceRecording: boolean;
  
  // Actions
  updateFormData: (data: Partial<CreateAlertInput>) => void;
  resetForm: () => void;
  setVoiceRecording: (recording: boolean) => void;
  
  // Quick templates
  templates: AlertTemplate[];
  applyTemplate: (templateId: string) => void;
}

export const useAlertCreationStore = create<AlertCreationState>()(
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
                urgency: template.defaultUrgency,
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
```

### React 19 Component with tRPC
```tsx
import { useState, useTransition, useDeferredValue, useOptimistic } from 'react';
import { api } from '@/lib/trpc';
import { useAlertCreationStore } from '@/stores/alert-creation';
import { createAlertSchema } from '@/validations/alert';

export const AlertCreationBlock = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  
  // Zustand store
  const { formData, updateFormData, resetForm, applyTemplate } = useAlertCreationStore();
  
  // React 19 - Deferred search for room suggestions
  const [roomSearch, setRoomSearch] = useState('');
  const deferredRoomSearch = useDeferredValue(roomSearch);
  
  // TanStack Query - Room suggestions
  const { data: roomSuggestions } = api.rooms.search.useQuery(
    { query: deferredRoomSearch },
    { 
      enabled: deferredRoomSearch.length >= 2,
      staleTime: 30000, // 30 seconds
    }
  );
  
  // tRPC mutation with optimistic updates
  const createAlertMutation = api.healthcare.createAlert.useMutation({
    onMutate: async (newAlert) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['healthcare.getActiveAlerts'] });
      
      const previousAlerts = queryClient.getQueryData(['healthcare.getActiveAlerts']);
      
      queryClient.setQueryData(['healthcare.getActiveAlerts'], (old) => {
        return {
          ...old,
          alerts: [
            {
              ...newAlert,
              id: 'temp-' + Date.now(),
              status: 'pending',
              createdAt: new Date(),
              createdBy: user?.id,
            },
            ...(old?.alerts || [])
          ]
        };
      });
      
      return { previousAlerts };
    },
    onError: (err, newAlert, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['healthcare.getActiveAlerts'], 
        context?.previousAlerts
      );
      showErrorAlert('Failed to create alert', err.message);
    },
    onSuccess: (data) => {
      resetForm();
      showSuccessAlert('Alert created successfully');
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['healthcare.getActiveAlerts'] });
    },
  });
  
  // Form validation with Zod
  const validateAndSubmit = () => {
    startTransition(() => {
      try {
        const validatedData = createAlertSchema.parse({
          ...formData,
          hospitalId: user?.organizationId,
          departmentId: user?.departmentId,
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
    (_, newTemplate: string) => newTemplate
  );
  
  return (
    <Card
      padding={goldenSpacing.xl}
      gap={goldenSpacing.xxl}
      shadow={goldenShadows.lg}
      style={{
        minHeight: 377,
        backgroundColor: theme.emergency + '10',
      }}
    >
      {/* Room Number with Autocomplete */}
      <VStack gap={goldenSpacing.md}>
        <Input
          label="Room Number *"
          value={formData.roomNumber || ''}
          onChange={(value) => {
            setRoomSearch(value);
            updateFormData({ roomNumber: value });
          }}
          placeholder="302"
          keyboardType="numeric"
          maxLength={3}
          size="large"
          autoFocus
          error={formData.roomNumber && !createAlertSchema.shape.roomNumber.safeParse(formData.roomNumber).success}
        />
        
        {/* Room suggestions with React 19 deferred rendering */}
        {roomSuggestions && roomSuggestions.length > 0 && (
          <ScrollContainer horizontal>
            <HStack gap={goldenSpacing.sm}>
              {roomSuggestions.map((room) => (
                <Button
                  key={room.id}
                  variant="outline"
                  size="small"
                  onPress={() => {
                    updateFormData({ roomNumber: room.number });
                    setRoomSearch('');
                  }}
                >
                  {room.number} - {room.wing}
                </Button>
              ))}
            </HStack>
          </ScrollContainer>
        )}
      </VStack>
      
      {/* Alert Type Selection with Optimistic Updates */}
      <VStack gap={goldenSpacing.md}>
        <Text weight="medium">Alert Type *</Text>
        <Grid columns="1fr 1fr" gap={goldenSpacing.md}>
          {alertTypes.map((type) => (
            <AlertTypeButton
              key={type.id}
              type={type.id}
              icon={type.icon}
              label={type.label}
              color={type.color}
              selected={optimisticTemplate === type.id}
              onPress={() => {
                setOptimisticTemplate(type.id);
                startTransition(() => {
                  applyTemplate(type.id);
                });
              }}
            />
          ))}
        </Grid>
      </VStack>
      
      {/* Voice Recording with Web Audio API */}
      <VStack gap={goldenSpacing.sm}>
        <Text weight="medium">Additional Details</Text>
        <HStack gap={goldenSpacing.md}>
          <Input
            placeholder="Type or use voice..."
            value={formData.description || ''}
            onChange={(value) => updateFormData({ description: value })}
            multiline
            numberOfLines={2}
            style={{ flex: 1 }}
          />
          <VoiceRecordButton
            isRecording={isVoiceRecording}
            onTranscription={(text) => {
              updateFormData({ 
                description: (formData.description || '') + ' ' + text 
              });
            }}
          />
        </HStack>
      </VStack>
      
      {/* Submit with Loading State */}
      <HStack gap={goldenSpacing.md} height={89}>
        <Button
          size="large"
          variant="emergency"
          style={{ flex: 1.618 }}
          onPress={validateAndSubmit}
          loading={isPending || createAlertMutation.isPending}
          disabled={!formData.roomNumber || !formData.alertType}
        >
          {isPending ? 'Creating Alert...' : 'Send Alert →'}
        </Button>
        <Button
          size="large"
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
```

## 📊 Dashboard Metrics Block Implementation

### TanStack Query with Suspense
```tsx
import { Suspense, useDeferredValue, useTransition } from 'react';
import { api } from '@/lib/trpc';
import { useMetricsStore } from '@/stores/metrics';

// Metrics store with Zustand
const useMetricsStore = create<MetricsState>()(
  devtools(
    subscribeWithSelector((set) => ({
      timeRange: '24h',
      department: 'all',
      refreshInterval: 5000,
      
      setTimeRange: (range) => set({ timeRange: range }),
      setDepartment: (dept) => set({ department: dept }),
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
    }))
  )
);

// Main component with Suspense boundary
export const MetricsDashboard = () => {
  return (
    <ErrorBoundary fallback={<MetricsError />}>
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsContent />
      </Suspense>
    </ErrorBoundary>
  );
};

// Content component with data fetching
const MetricsContent = () => {
  const { timeRange, department, refreshInterval } = useMetricsStore();
  const [isPending, startTransition] = useTransition();
  
  // Deferred values for smooth interactions
  const deferredTimeRange = useDeferredValue(timeRange);
  const deferredDepartment = useDeferredValue(department);
  
  // TanStack Query with tRPC
  const { data: metrics } = api.analytics.getMetrics.useSuspenseQuery(
    {
      timeRange: deferredTimeRange,
      department: deferredDepartment,
      hospitalId: user?.organizationId!,
    },
    {
      refetchInterval: refreshInterval,
      refetchIntervalInBackground: true,
    }
  );
  
  // Real-time subscription
  api.analytics.subscribeToMetrics.useSubscription(
    { hospitalId: user?.organizationId! },
    {
      onData: (update) => {
        // Update specific metrics without full refetch
        queryClient.setQueryData(
          ['analytics.getMetrics', { timeRange, department }],
          (old) => ({
            ...old,
            activeAlerts: update.activeAlerts,
            staffOnline: update.staffOnline,
          })
        );
      },
    }
  );
  
  return (
    <Grid
      columns="1.618fr 1fr 0.618fr"
      gap={goldenSpacing.lg}
      style={{ minHeight: 233 }}
    >
      {/* Primary Metric with Animation */}
      <PrimaryMetricCard
        value={metrics.activeAlerts}
        trend={metrics.trend}
        capacity={metrics.capacity}
        isPending={isPending}
      />
      
      {/* Secondary Metrics */}
      <VStack gap={goldenSpacing.md}>
        <ResponseTimeCard
          avgResponse={metrics.avgResponse}
          responseScore={metrics.responseScore}
        />
        <StaffOnlineCard
          staffOnline={metrics.staffOnline}
          totalStaff={metrics.totalStaff}
        />
      </VStack>
      
      {/* Mini Stats with Virtualization */}
      <VirtualizedMiniStats
        stats={[
          { label: 'Critical', value: metrics.critical, color: theme.emergency },
          { label: 'Urgent', value: metrics.urgent, color: theme.warning },
          { label: 'Standard', value: metrics.standard, color: theme.info },
          { label: 'Resolved', value: metrics.resolved, color: theme.success },
        ]}
      />
    </Grid>
  );
};

// Virtualized mini stats for performance
const VirtualizedMiniStats = ({ stats }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: stats.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34, // Fibonacci
    overscan: 2,
  });
  
  return (
    <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MiniStat {...stats[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🏥 Patient Information Block with Real-time Updates

### Patient Store with Middleware
```typescript
import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

interface PatientState {
  selectedPatientId: string | null;
  expandedCards: Set<string>;
  vitalFilter: VitalType;
  medicationView: 'schedule' | 'list';
  
  // Actions
  selectPatient: (id: string) => void;
  toggleCardExpansion: (id: string) => void;
  setVitalFilter: (type: VitalType) => void;
  setMedicationView: (view: 'schedule' | 'list') => void;
}

export const usePatientStore = create<PatientState>()(
  devtools(
    subscribeWithSelector((set) => ({
      selectedPatientId: null,
      expandedCards: new Set(),
      vitalFilter: 'all',
      medicationView: 'schedule',
      
      selectPatient: (id) => set({ selectedPatientId: id }),
      
      toggleCardExpansion: (id) =>
        set((state) => {
          const newExpanded = new Set(state.expandedCards);
          if (newExpanded.has(id)) {
            newExpanded.delete(id);
          } else {
            newExpanded.add(id);
          }
          return { expandedCards: newExpanded };
        }),
        
      setVitalFilter: (type) => set({ vitalFilter: type }),
      setMedicationView: (view) => set({ medicationView: view }),
    })),
    {
      name: 'patient-store',
    }
  )
);

// Subscribe to specific changes
usePatientStore.subscribe(
  (state) => state.selectedPatientId,
  (patientId) => {
    if (patientId) {
      // Prefetch patient data when selected
      queryClient.prefetchQuery({
        queryKey: ['patient.getDetails', { patientId }],
        queryFn: () => api.patient.getDetails.query({ patientId }),
      });
    }
  }
);
```

### Patient Card with Optimistic Updates
```tsx
export const PatientCardBlock = ({ patientId, onViewDetails }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  
  // Zustand store
  const { expandedCards, toggleCardExpansion } = usePatientStore(
    (state) => ({
      expandedCards: state.expandedCards,
      toggleCardExpansion: state.toggleCardExpansion,
    }),
    shallow
  );
  
  const isExpanded = expandedCards.has(patientId);
  
  // Patient data with suspense
  const { data: patient } = api.patient.getDetails.useSuspenseQuery(
    { patientId },
    {
      staleTime: 30000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Real-time vital signs subscription
  api.patient.subscribeToVitals.useSubscription(
    { patientId },
    {
      onData: (vitals) => {
        // Update cache with new vitals
        queryClient.setQueryData(
          ['patient.getDetails', { patientId }],
          (old) => ({
            ...old,
            vitals: vitals,
            lastUpdated: new Date(),
          })
        );
        
        // Check for critical values
        if (checkCriticalVitals(vitals)) {
          showUrgentNotification('Critical Vitals', `Patient ${patient.name} has critical vitals`);
        }
      },
    }
  );
  
  // Acknowledge alert mutation
  const acknowledgeMutation = api.healthcare.acknowledgePatientAlert.useMutation({
    onMutate: async ({ alertId }) => {
      // Optimistic update
      const optimisticUpdate = {
        alertId,
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: user?.id,
      };
      
      queryClient.setQueryData(
        ['patient.getDetails', { patientId }],
        (old) => ({
          ...old,
          alerts: old.alerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, ...optimisticUpdate }
              : alert
          ),
        })
      );
      
      return { previousData: queryClient.getQueryData(['patient.getDetails', { patientId }]) };
    },
    onError: (err, variables, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(
          ['patient.getDetails', { patientId }],
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['patient.getDetails', { patientId }],
      });
    },
  });
  
  return (
    <Card
      padding={goldenSpacing.xl}
      shadow={goldenShadows.md}
      style={{
        height: isExpanded ? 377 : 144,
        transition: `all ${goldenAnimations.normal}ms ${goldenAnimations.easeGolden}`,
      }}
    >
      {/* Header with React 19 transitions */}
      <HStack gap={goldenSpacing.lg} height={89}>
        <Avatar
          size={89}
          source={patient.photo}
          fallback={patient.initials}
        />
        
        <VStack flex={1} gap={goldenSpacing.sm}>
          <HStack justifyContent="space-between">
            <Heading4>{patient.name}</Heading4>
            <HStack gap={goldenSpacing.sm}>
              {patient.alerts.map((alert) => (
                <AlertIndicator
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => {
                    startTransition(() => {
                      acknowledgeMutation.mutate({ alertId: alert.id });
                    });
                  }}
                />
              ))}
            </HStack>
          </HStack>
          
          <PatientBadges patient={patient} />
        </VStack>
        
        <Button
          variant="ghost"
          size="icon"
          onPress={() => {
            startTransition(() => {
              toggleCardExpansion(patientId);
            });
          }}
          loading={isPending}
        >
          {isExpanded ? '⌃' : '⌄'}
        </Button>
      </HStack>
      
      {/* Expanded content with lazy loading */}
      {isExpanded && (
        <Suspense fallback={<VitalsSkeleton />}>
          <ExpandedPatientContent patientId={patientId} />
        </Suspense>
      )}
    </Card>
  );
};

// Lazy loaded expanded content
const ExpandedPatientContent = ({ patientId }) => {
  const { data: vitals } = api.patient.getVitalsHistory.useSuspenseQuery(
    { patientId, timeRange: '24h' },
    {
      staleTime: 60000, // 1 minute
    }
  );
  
  return (
    <>
      <Separator marginVertical={goldenSpacing.lg} />
      
      <VStack gap={goldenSpacing.md}>
        <Text weight="medium">Current Vitals</Text>
        <VitalsGrid vitals={vitals.current} history={vitals.history} />
      </VStack>
      
      <QuickActionsBar patientId={patientId} />
    </>
  );
};
```

## 🔄 Real-time Alert Subscription Implementation

### WebSocket Integration with tRPC
```tsx
export const useAlertSubscriptions = (hospitalId: string) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();
  
  // Subscribe to all hospital alerts
  api.healthcare.subscribeToAlerts.useSubscription(
    { hospitalId },
    {
      onData: (event) => {
        switch (event.type) {
          case 'alert.created':
            handleNewAlert(event.data);
            break;
            
          case 'alert.acknowledged':
            handleAlertAcknowledged(event.data);
            break;
            
          case 'alert.escalated':
            handleAlertEscalated(event.data);
            break;
            
          case 'alert.resolved':
            handleAlertResolved(event.data);
            break;
        }
      },
      onError: (error) => {
        console.error('Subscription error:', error);
        // Implement reconnection logic
      },
    }
  );
  
  const handleNewAlert = (alert: Alert) => {
    // Update cache
    queryClient.setQueryData(
      ['healthcare.getActiveAlerts'],
      (old) => ({
        ...old,
        alerts: [alert, ...(old?.alerts || [])],
      })
    );
    
    // Show notification
    showNotification({
      title: `New ${alert.type} Alert`,
      body: `Room ${alert.room} - ${alert.description}`,
      priority: alert.urgency,
      actions: [
        {
          label: 'Acknowledge',
          action: () => acknowledgeAlert(alert.id),
        },
      ],
    });
    
    // Play sound for critical alerts
    if (alert.urgency >= 4) {
      playAlertSound(alert.type);
    }
  };
  
  const handleAlertEscalated = (alert: Alert) => {
    // Force UI update for escalated alerts
    queryClient.setQueryData(
      ['healthcare.getActiveAlerts'],
      (old) => ({
        ...old,
        alerts: old?.alerts.map((a) =>
          a.id === alert.id
            ? { ...a, escalated: true, escalationLevel: alert.escalationLevel }
            : a
        ),
      })
    );
    
    // Show urgent notification
    showUrgentNotification({
      title: 'ALERT ESCALATED',
      body: `${alert.type} in Room ${alert.room} requires immediate attention`,
      persistent: true,
      sound: 'escalation',
    });
  };
};
```

## 📱 Performance Optimizations

### Virtual List for Large Data Sets
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualizedAlertList = ({ alerts }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: alerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 144, // Alert card height
    overscan: 5,
    getItemKey: (index) => alerts[index].id,
  });
  
  return (
    <div
      ref={parentRef}
      style={{
        height: '100%',
        overflow: 'auto',
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const alert = alerts[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <AlertCard alert={alert} index={virtualRow.index} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

## 🎯 Error Handling and Offline Support

### Offline Queue with Zustand
```typescript
interface OfflineQueueState {
  queue: QueuedAction[];
  isOnline: boolean;
  
  addToQueue: (action: QueuedAction) => void;
  processQueue: () => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
}

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: navigator.onLine,
      
      addToQueue: (action) =>
        set((state) => ({
          queue: [...state.queue, { ...action, id: nanoid(), timestamp: Date.now() }],
        })),
        
      processQueue: async () => {
        const { queue, isOnline } = get();
        if (!isOnline || queue.length === 0) return;
        
        const processed: string[] = [];
        
        for (const action of queue) {
          try {
            await processAction(action);
            processed.push(action.id);
          } catch (error) {
            console.error('Failed to process queued action:', error);
            // Keep in queue for retry
          }
        }
        
        set((state) => ({
          queue: state.queue.filter((a) => !processed.includes(a.id)),
        }));
      },
      
      setOnlineStatus: (online) => {
        set({ isOnline: online });
        if (online) {
          get().processQueue();
        }
      },
    }),
    {
      name: 'offline-queue',
    }
  )
);

// Monitor online status
window.addEventListener('online', () => {
  useOfflineQueue.getState().setOnlineStatus(true);
});

window.addEventListener('offline', () => {
  useOfflineQueue.getState().setOnlineStatus(false);
});
```

---

*These implementations leverage the full power of React 19, TanStack Query, Zustand, Zod, and tRPC for a robust, type-safe healthcare application.*