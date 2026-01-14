#!/usr/bin/env bun
import { db } from '@/src/db';
import { user, account, session, verification } from '@/src/db/schema';
import { healthcareUsers, hospitals } from '@/src/db/healthcare-schema';
import { log } from '@/lib/core/logger';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Generate unique ID
function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Simple password hashing for demo purposes
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'better-auth-salt').digest('hex');
}

async function setupDemoUsers() {
  try {
    log.info('Setting up healthcare demo users directly in database...', 'SETUP');
    
    // First ensure hospital exists
    const hospitalId = 'f155b026-01bd-4212-94f3-e7aedef2801d';
    await db.insert(hospitals).values({
      id: hospitalId,
      name: 'Dubai Central Hospital',
      address: '123 Healthcare Blvd, Dubai, UAE',
      contactInfo: { phone: '+971-4-123-4567', email: 'admin@dubaihospital.ae' },
    }).onConflictDoNothing();
    
    // Define demo users
    const demoUsers = [
      {
        email: 'johncena@gmail.com',
        password: 'password123',
        name: 'John Operator',
        role: 'operator' as const,
        department: 'Control Room',
      },
      {
        email: 'doremon@gmail.com',
        password: 'password123',
        name: 'Nurse Doremon',
        role: 'nurse' as const,
        department: 'ICU',
      },
      {
        email: 'johndoe@gmail.com',
        password: 'password123',
        name: 'Dr. John Doe',
        role: 'doctor' as const,
        department: 'Emergency',
      },
      {
        email: 'saipramod273@gmail.com',
        password: 'password123',
        name: 'Dr. Saipramod (Head)',
        role: 'head_doctor' as const,
        department: 'Cardiology',
      },
    ];
    
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await db.select().from(user).where(eq(user.email, userData.email)).limit(1);
        
        let userId: string;
        
        if (existingUser.length === 0) {
          // Create new user
          log.info(`Creating user ${userData.email}...`, 'SETUP');
          
          const newUserId = generateId();
          const [newUser] = await db.insert(user)
            .values({
              id: newUserId,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              emailVerified: true,
              needsProfileCompletion: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          
          userId = newUser.id;
          
          // Create account for password login
          await db.insert(account)
            .values({
              id: generateId(),
              userId: newUser.id,
              accountId: userData.email,
              providerId: 'credential',
              password: hashPassword(userData.password),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoNothing();
          
          log.info(`Created user: ${userData.email} with role: ${userData.role}`, 'SETUP');
        } else {
          // Update existing user
          userId = existingUser[0].id;
          log.info(`User ${userData.email} already exists, updating...`, 'SETUP');
          
          await db.update(user)
            .set({ 
              role: userData.role,
              name: userData.name,
              emailVerified: true,
              needsProfileCompletion: false,
            })
            .where(eq(user.email, userData.email));
        }
        
        // Create or update healthcare profile
        await db.insert(healthcareUsers)
          .values({
            userId,
            hospitalId,
            department: userData.department,
            licenseNumber: userData.role === 'operator' ? null : `${userData.role.toUpperCase()}-${userId.substring(0, 8)}`,
          })
          .onConflictDoUpdate({
            target: healthcareUsers.userId,
            set: {
              department: userData.department,
              hospitalId,
            },
          });
          
      } catch (error) {
        log.error(`Failed to process user ${userData.email}`, 'SETUP', error);
      }
    }
    
    log.info('Healthcare demo users setup completed!', 'SETUP');
    log.info('', 'SETUP');
    log.info('Demo User Credentials:', 'SETUP');
    log.info('=====================', 'SETUP');
    demoUsers.forEach(user => {
      log.info(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`, 'SETUP');
    });
    
    process.exit(0);
  } catch (error) {
    log.error('Failed to setup demo users', 'SETUP', error);
    process.exit(1);
  }
}

// Run the script
setupDemoUsers();