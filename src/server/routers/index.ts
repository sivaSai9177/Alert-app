import { router } from '../trpc';
import { authRouter } from './auth';
import { adminRouter } from './admin';
import { healthcareRouter } from './healthcare';
import { patientRouter } from './patient';

export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  healthcare: healthcareRouter,
  patient: patientRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;