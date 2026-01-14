/**
 * Healthcare Store
 * Manages real-time healthcare state with Zustand
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { log } from '@/lib/core/logger';

// Types
interface Alert {
  id: string;
  alertType: string;
  urgency: number;
  roomNumber: string;
  patientId?: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  hospitalId: string;
}

interface VitalSigns {
  heartRate?: number;
  oxygen?: number;
  systolic?: number;
  diastolic?: number;
  temperature?: number;
  lastUpdated: Date;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  room: string;
  mrn: string;
  vitals?: VitalSigns;
  alerts: Alert[];
}

interface Metrics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  averageResponseTime: number;
  staffOnDuty: number;
  criticalPatients: number;
  lastUpdated: Date;
}

interface HealthcareState {
  // Alert state
  alerts: Alert[];
  activeAlertIds: Set<string>;
  acknowledgedAlertIds: Set<string>;
  
  // Patient state
  patients: Map<string, Patient>;
  criticalPatientIds: Set<string>;
  
  // Metrics state
  metrics: Metrics | null;
  
  // UI state
  selectedAlertId: string | null;
  selectedPatientId: string | null;
  expandedAlertIds: Set<string>;
  expandedPatientIds: Set<string>;
  
  // Real-time connection state
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastSync: Date | null;
  
  // Actions
  // Alert actions
  addAlert: (alert: Alert) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  acknowledgeAlert: (alertId: string, userId: string) => void;
  resolveAlert: (alertId: string, userId: string) => void;
  removeAlert: (alertId: string) => void;
  
  // Patient actions
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  updateVitals: (patientId: string, vitals: VitalSigns) => void;
  
  // Metrics actions
  updateMetrics: (metrics: Metrics) => void;
  
  // UI actions
  selectAlert: (alertId: string | null) => void;
  selectPatient: (patientId: string | null) => void;
  toggleAlertExpanded: (alertId: string) => void;
  togglePatientExpanded: (patientId: string) => void;
  
  // Connection actions
  setConnectionStatus: (status: HealthcareState['connectionStatus']) => void;
  updateLastSync: () => void;
  
  // Batch updates
  batchUpdateAlerts: (alerts: Alert[]) => void;
  clearStaleData: () => void;
  reset: () => void;
}

// Storage configuration
const storage = Platform.OS === 'web' 
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => AsyncStorage);

// Initial state
const initialState = {
  alerts: [],
  activeAlertIds: new Set<string>(),
  acknowledgedAlertIds: new Set<string>(),
  patients: new Map<string, Patient>(),
  criticalPatientIds: new Set<string>(),
  metrics: null,
  selectedAlertId: null,
  selectedPatientId: null,
  expandedAlertIds: new Set<string>(),
  expandedPatientIds: new Set<string>(),
  isConnected: false,
  connectionStatus: 'disconnected' as const,
  lastSync: null,
};

// Create store with middleware
export const useHealthcareStore = create<HealthcareState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Alert actions
        addAlert: (alert) => set((state) => {
          const existingIndex = state.alerts.findIndex(a => a.id === alert.id);
          if (existingIndex >= 0) {
            state.alerts[existingIndex] = alert;
          } else {
            state.alerts.push(alert);
          }
          
          if (!alert.resolved) {
            state.activeAlertIds.add(alert.id);
          } else {
            state.activeAlertIds.delete(alert.id);
          }
          
          if (alert.acknowledged) {
            state.acknowledgedAlertIds.add(alert.id);
          }
          
          log.debug('Alert added to store', 'HEALTHCARE_STORE', { alertId: alert.id });
        }),
        
        updateAlert: (alertId, updates) => set((state) => {
          const alertIndex = state.alerts.findIndex(a => a.id === alertId);
          if (alertIndex >= 0) {
            Object.assign(state.alerts[alertIndex], updates);
            
            const alert = state.alerts[alertIndex];
            if (alert.resolved) {
              state.activeAlertIds.delete(alertId);
            }
            if (alert.acknowledged) {
              state.acknowledgedAlertIds.add(alertId);
            }
          }
        }),
        
        acknowledgeAlert: (alertId, userId) => set((state) => {
          const alertIndex = state.alerts.findIndex(a => a.id === alertId);
          if (alertIndex >= 0) {
            state.alerts[alertIndex].acknowledged = true;
            state.alerts[alertIndex].acknowledgedAt = new Date();
            state.alerts[alertIndex].acknowledgedBy = userId;
            state.acknowledgedAlertIds.add(alertId);
          }
        }),
        
        resolveAlert: (alertId, userId) => set((state) => {
          const alertIndex = state.alerts.findIndex(a => a.id === alertId);
          if (alertIndex >= 0) {
            state.alerts[alertIndex].resolved = true;
            state.alerts[alertIndex].resolvedAt = new Date();
            state.alerts[alertIndex].resolvedBy = userId;
            state.activeAlertIds.delete(alertId);
          }
        }),
        
        removeAlert: (alertId) => set((state) => {
          state.alerts = state.alerts.filter(a => a.id !== alertId);
          state.activeAlertIds.delete(alertId);
          state.acknowledgedAlertIds.delete(alertId);
        }),
        
        // Patient actions
        updatePatient: (patientId, updates) => set((state) => {
          const existing = state.patients.get(patientId);
          if (existing) {
            state.patients.set(patientId, { ...existing, ...updates });
          } else {
            state.patients.set(patientId, updates as Patient);
          }
        }),
        
        updateVitals: (patientId, vitals) => set((state) => {
          const patient = state.patients.get(patientId);
          if (patient) {
            patient.vitals = vitals;
            
            // Check for critical vitals
            const isCritical = 
              (vitals.heartRate && (vitals.heartRate < 40 || vitals.heartRate > 150)) ||
              (vitals.oxygen && vitals.oxygen < 90) ||
              (vitals.systolic && (vitals.systolic < 90 || vitals.systolic > 180));
            
            if (isCritical) {
              state.criticalPatientIds.add(patientId);
            } else {
              state.criticalPatientIds.delete(patientId);
            }
          }
        }),
        
        // Metrics actions
        updateMetrics: (metrics) => set((state) => {
          state.metrics = metrics;
        }),
        
        // UI actions
        selectAlert: (alertId) => set((state) => {
          state.selectedAlertId = alertId;
        }),
        
        selectPatient: (patientId) => set((state) => {
          state.selectedPatientId = patientId;
        }),
        
        toggleAlertExpanded: (alertId) => set((state) => {
          if (state.expandedAlertIds.has(alertId)) {
            state.expandedAlertIds.delete(alertId);
          } else {
            state.expandedAlertIds.add(alertId);
          }
        }),
        
        togglePatientExpanded: (patientId) => set((state) => {
          if (state.expandedPatientIds.has(patientId)) {
            state.expandedPatientIds.delete(patientId);
          } else {
            state.expandedPatientIds.add(patientId);
          }
        }),
        
        // Connection actions
        setConnectionStatus: (status) => set((state) => {
          state.connectionStatus = status;
          state.isConnected = status === 'connected';
        }),
        
        updateLastSync: () => set((state) => {
          state.lastSync = new Date();
        }),
        
        // Batch updates
        batchUpdateAlerts: (alerts) => set((state) => {
          state.alerts = alerts;
          state.activeAlertIds.clear();
          state.acknowledgedAlertIds.clear();
          
          alerts.forEach(alert => {
            if (!alert.resolved) {
              state.activeAlertIds.add(alert.id);
            }
            if (alert.acknowledged) {
              state.acknowledgedAlertIds.add(alert.id);
            }
          });
        }),
        
        clearStaleData: () => set((state) => {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          // Remove resolved alerts older than 1 hour
          state.alerts = state.alerts.filter(alert => 
            !alert.resolved || alert.resolvedAt! > oneHourAgo
          );
          
          // Clear removed alert IDs from sets
          const alertIds = new Set(state.alerts.map(a => a.id));
          state.activeAlertIds = new Set([...state.activeAlertIds].filter(id => alertIds.has(id)));
          state.acknowledgedAlertIds = new Set([...state.acknowledgedAlertIds].filter(id => alertIds.has(id)));
        }),
        
        reset: () => set(initialState),
      })),
      {
        name: 'healthcare-store',
        storage,
        partialize: (state) => ({
          // Only persist UI preferences, not real-time data
          expandedAlertIds: state.expandedAlertIds,
          expandedPatientIds: state.expandedPatientIds,
        }),
      }
    )
  )
);

// Selectors
export const healthcareSelectors = {
  getActiveAlerts: (state: HealthcareState) => 
    state.alerts.filter(a => !a.resolved),
  
  getAcknowledgedAlerts: (state: HealthcareState) => 
    state.alerts.filter(a => a.acknowledged && !a.resolved),
  
  getUnacknowledgedAlerts: (state: HealthcareState) => 
    state.alerts.filter(a => !a.acknowledged && !a.resolved),
  
  getCriticalAlerts: (state: HealthcareState) => 
    state.alerts.filter(a => a.urgency >= 4 && !a.resolved),
  
  getAlertById: (state: HealthcareState, id: string) => 
    state.alerts.find(a => a.id === id),
  
  getPatientById: (state: HealthcareState, id: string) => 
    state.patients.get(id),
  
  getCriticalPatients: (state: HealthcareState) => 
    Array.from(state.criticalPatientIds).map(id => state.patients.get(id)).filter(Boolean),
  
  getConnectionHealth: (state: HealthcareState) => ({
    isConnected: state.isConnected,
    status: state.connectionStatus,
    lastSync: state.lastSync,
    isStale: state.lastSync ? Date.now() - state.lastSync.getTime() > 60000 : true,
  }),
};