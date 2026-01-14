#!/usr/bin/env bun
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { healthcareUsers } from '@/src/db/healthcare-schema';
import { auth } from '@/lib/auth/auth-server';
import { log } from '@/lib/core/logger';

async function createHealthcareUsers() {
  try {
    log.info('Creating healthcare demo users...', 'SETUP');
    
    const hospitalId = 'f155b026-01bd-4212-94f3-e7aedef2801d';
    
    // Define demo users
    const demoUsers = [
      {
        email: 'operator@hospital.com',
        password: 'OperatorPass123!',
        name: 'Sarah Operator',
        role: 'operator' as const,
        department: 'Control Room',
        licenseNumber: null,
      },
      {
        email: 'nurse@hospital.com',
        password: 'NursePass123!',
        name: 'Emily Nurse',
        role: 'nurse' as const,
        department: 'ICU',
        licenseNumber: 'NUR-12345',
      },
      {
        email: 'doctor@hospital.com',
        password: 'DoctorPass123!',
        name: 'Dr. John Smith',
        role: 'doctor' as const,
        department: 'Emergency',
        licenseNumber: 'DOC-67890',
        specialization: 'Emergency Medicine',
      },
      {
        email: 'head.doctor@hospital.com',
        password: 'HeadDocPass123!',
        name: 'Dr. Maria Johnson',
        role: 'head_doctor' as const,
        department: 'Cardiology',
        licenseNumber: 'HDR-11111',
        specialization: 'Cardiology',
      },
      {
        email: 'admin@hospital.com',
        password: 'AdminPass123!',
        name: 'System Admin',
        role: 'admin' as const,
        department: 'IT Department',
        licenseNumber: null,
      },
    ];
    
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
        
        if (existingUser.length > 0) {
          log.info(`User ${userData.email} already exists, updating role...`, 'SETUP');
          
          // Update user role
          await db.update(users)
            .set({ role: userData.role })
            .where(eq(users.email, userData.email));
          
          // Update or create healthcare profile
          await db.insert(healthcareUsers)
            .values({
              userId: existingUser[0].id,
              hospitalId,
              department: userData.department,
              licenseNumber: userData.licenseNumber,
              specialization: userData.specialization,
            })
            .onConflictDoUpdate({
              target: healthcareUsers.userId,
              set: {
                department: userData.department,
                licenseNumber: userData.licenseNumber,
                specialization: userData.specialization,
              },
            });
        } else {
          // Create new user using Better Auth
          log.info(`Creating user ${userData.email}...`, 'SETUP');
          
          const newUser = await auth.api.signUpEmail({
            body: {
              email: userData.email,
              password: userData.password,
              name: userData.name,
            },
          });
          
          if (newUser.user) {
            // Update user role
            await db.update(users)
              .set({ 
                role: userData.role,
                emailVerified: true,
                needsProfileCompletion: false,
              })
              .where(eq(users.id, newUser.user.id));
            
            // Create healthcare profile
            await db.insert(healthcareUsers)
              .values({
                userId: newUser.user.id,
                hospitalId,
                department: userData.department,
                licenseNumber: userData.licenseNumber,
                specialization: userData.specialization,
              });
            
            log.info(`Created user: ${userData.email} with role: ${userData.role}`, 'SETUP');
          }
        }
      } catch (error) {
        log.error(`Failed to create user ${userData.email}`, 'SETUP', error);
      }
    }
    
    log.info('Healthcare demo users created successfully!', 'SETUP');
    log.info('', 'SETUP');
    log.info('Demo User Credentials:', 'SETUP');
    log.info('=====================', 'SETUP');
    demoUsers.forEach(user => {
      log.info(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`, 'SETUP');
    });
    log.info('', 'SETUP');
    
    process.exit(0);
  } catch (error) {
    log.error('Failed to create healthcare users', 'SETUP', error);
    process.exit(1);
  }
}

// Add missing import
import { eq } from 'drizzle-orm';

// Run the script
createHealthcareUsers();