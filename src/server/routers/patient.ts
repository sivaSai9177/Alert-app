import { z } from 'zod';
import { router, protectedProcedure, createPermissionProcedure } from '../trpc';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { log } from '@/lib/core/logger';
import { realtimeEvents, startMockDataGenerator } from '../services/realtime-events';
import { observable } from '@trpc/server/observable';

// Permission-based procedures
const viewPatientsProcedure = createPermissionProcedure('view_patients');
const managePatientsProcedure = createPermissionProcedure('manage_patients');

// Mock patient data structure (in a real app, this would be in the database)
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  room: string;
  department: string;
  primaryCondition?: string;
  photo?: string;
  flags: {
    dnr?: boolean;
    allergy?: boolean;
    fallRisk?: boolean;
  };
  alerts: Array<{
    id: string;
    type: string;
    priority: number;
    acknowledged: boolean;
  }>;
}

// Mock vitals data
interface Vitals {
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  oxygen: number;
  temperature: number;
  respiratoryRate: number;
  heartRateTrend?: 'up' | 'down' | 'stable';
  bloodPressureTrend?: 'up' | 'down' | 'stable';
  oxygenTrend?: 'up' | 'down' | 'stable';
  temperatureTrend?: 'up' | 'down' | 'stable';
  respiratoryRateTrend?: 'up' | 'down' | 'stable';
}

// Mock patient data generator
const generateMockPatient = (id: string): Patient => {
  const patients = [
    {
      id: 'patient-1',
      name: 'John Doe',
      age: 65,
      gender: 'Male',
      mrn: 'MRN001234',
      room: '302',
      department: 'Cardiology',
      primaryCondition: 'Acute MI',
      flags: { dnr: false, allergy: true },
      alerts: [
        { id: 'alert-1', type: 'critical', priority: 5, acknowledged: false }
      ]
    },
    {
      id: 'patient-2',
      name: 'Jane Smith',
      age: 72,
      gender: 'Female',
      mrn: 'MRN005678',
      room: '305',
      department: 'ICU',
      primaryCondition: 'Post-Op Recovery',
      flags: { dnr: true, fallRisk: true },
      alerts: []
    }
  ];
  
  return patients.find(p => p.id === id) || patients[0];
};

// Mock vitals generator
const generateMockVitals = (): Vitals => {
  const randomTrend = () => {
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable', 'stable', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
  };
  
  return {
    heartRate: 70 + Math.floor(Math.random() * 20),
    bloodPressure: {
      systolic: 110 + Math.floor(Math.random() * 30),
      diastolic: 70 + Math.floor(Math.random() * 20),
    },
    oxygen: 94 + Math.floor(Math.random() * 6),
    temperature: 36.5 + (Math.random() * 1.5),
    respiratoryRate: 14 + Math.floor(Math.random() * 8),
    heartRateTrend: randomTrend(),
    bloodPressureTrend: randomTrend(),
    oxygenTrend: randomTrend(),
    temperatureTrend: randomTrend(),
    respiratoryRateTrend: randomTrend(),
  };
};

export const patientRouter = router({
  // Get patient details
  getDetails: viewPatientsProcedure
    .input(z.object({
      patientId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const patient = generateMockPatient(input.patientId);
        
        log.info('Patient details fetched', 'PATIENT', {
          patientId: input.patientId,
        });
        
        return patient;
      } catch (error) {
        log.error('Failed to fetch patient details', 'PATIENT', error);
        throw new Error('Failed to fetch patient details');
      }
    }),
    
  // Get current vitals
  getCurrentVitals: viewPatientsProcedure
    .input(z.object({
      patientId: z.string(),
      filter: z.enum(['all', 'critical', 'warning', 'normal']).default('all'),
    }))
    .query(async ({ input }) => {
      try {
        const vitals = generateMockVitals();
        
        log.info('Patient vitals fetched', 'PATIENT', {
          patientId: input.patientId,
          filter: input.filter,
        });
        
        return vitals;
      } catch (error) {
        log.error('Failed to fetch patient vitals', 'PATIENT', error);
        throw new Error('Failed to fetch patient vitals');
      }
    }),
    
  // Get vitals history
  getVitalsHistory: viewPatientsProcedure
    .input(z.object({
      patientId: z.string(),
      timeRange: z.enum(['1h', '6h', '24h', '72h']).default('24h'),
    }))
    .query(async ({ input }) => {
      try {
        // Generate mock historical data
        const points = input.timeRange === '1h' ? 12 : 
                      input.timeRange === '6h' ? 36 :
                      input.timeRange === '24h' ? 48 : 72;
                      
        const history = Array.from({ length: points }, (_, i) => ({
          timestamp: new Date(Date.now() - (i * 60 * 60 * 1000 / (points / parseInt(input.timeRange)))),
          vitals: generateMockVitals(),
        }));
        
        return {
          current: generateMockVitals(),
          history,
        };
      } catch (error) {
        log.error('Failed to fetch vitals history', 'PATIENT', error);
        throw new Error('Failed to fetch vitals history');
      }
    }),
    
  // Subscribe to patient vitals using real-time events
  subscribeToVitals: viewPatientsProcedure
    .input(z.object({
      patientId: z.string(),
    }))
    .subscription(({ input }) => {
      return observable<any>((emit) => {
        log.info('Vitals subscription started', 'PATIENT', {
          patientId: input.patientId,
        });
        
        // Subscribe to real-time vitals events
        const unsubscribe = realtimeEvents.subscribeToPatientVitals(
          input.patientId,
          (event) => {
            emit.next(event.data.vitals);
          }
        );
        
        // Start mock data generator in development
        if (process.env.NODE_ENV === 'development') {
          startMockDataGenerator();
        }
        
        // Cleanup on unsubscribe
        return () => {
          log.info('Vitals subscription ended', 'PATIENT', {
            patientId: input.patientId,
          });
          unsubscribe();
        };
      });
    }),
    
  // Get patients list (for doctors)
  getMyPatients: viewPatientsProcedure
    .input(z.object({
      doctorId: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Return mock patients
        const patients = [
          generateMockPatient('patient-1'),
          generateMockPatient('patient-2'),
        ];
        
        return {
          patients,
          total: patients.length,
        };
      } catch (error) {
        log.error('Failed to fetch patients list', 'PATIENT', error);
        throw new Error('Failed to fetch patients list');
      }
    }),
});