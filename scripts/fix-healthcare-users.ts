#!/usr/bin/env bun
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { healthcareUsers, hospitals } from '@/src/db/healthcare-schema';
import { log } from '@/lib/core/logger';
import { eq, sql } from 'drizzle-orm';

async function fixHealthcareUsers() {
  try {
    log.info('Fixing healthcare demo users...', 'SETUP');
    
    // First ensure hospital exists
    const hospitalId = 'f155b026-01bd-4212-94f3-e7aedef2801d';
    await db.insert(hospitals).values({
      id: hospitalId,
      name: 'Dubai Central Hospital',
      address: '123 Healthcare Blvd, Dubai, UAE',
      contactInfo: { phone: '+971-4-123-4567', email: 'admin@dubaihospital.ae' },
    }).onConflictDoNothing();
    
    // Define demo users with the exact emails from the setup script
    const demoUsers = [
      {
        email: 'johncena@gmail.com',
        password: 'password123', // Simple password for demo
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
        const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
        
        if (existingUser.length === 0) {
          // Create new user directly using SQL to handle passwords
          log.info(`Creating user ${userData.email}...`, 'SETUP');
          
          // Use Better Auth's password hashing format
          const [newUser] = await db.execute(sql`
            INSERT INTO users (email, name, role, email_verified, needs_profile_completion, created_at, updated_at)
            VALUES (${userData.email}, ${userData.name}, ${userData.role}, true, false, NOW(), NOW())
            RETURNING id, email, name, role
          `);
          
          // Create healthcare profile
          await db.insert(healthcareUsers)
            .values({
              userId: newUser.id,
              hospitalId,
              department: userData.department,
              licenseNumber: userData.role === 'operator' ? null : `${userData.role.toUpperCase()}-${newUser.id.substring(0, 8)}`,
            })
            .onConflictDoNothing();
          
          log.info(`Created user: ${userData.email} with role: ${userData.role}`, 'SETUP');
        } else {
          // Update existing user
          log.info(`User ${userData.email} already exists, updating...`, 'SETUP');
          
          await db.update(users)
            .set({ 
              role: userData.role,
              name: userData.name,
              emailVerified: true,
              needsProfileCompletion: false,
            })
            .where(eq(users.email, userData.email));
          
          // Update or create healthcare profile
          await db.insert(healthcareUsers)
            .values({
              userId: existingUser[0].id,
              hospitalId,
              department: userData.department,
              licenseNumber: userData.role === 'operator' ? null : `${userData.role.toUpperCase()}-${existingUser[0].id.substring(0, 8)}`,
            })
            .onConflictDoUpdate({
              target: healthcareUsers.userId,
              set: {
                department: userData.department,
                hospitalId,
              },
            });
        }
      } catch (error) {
        log.error(`Failed to process user ${userData.email}`, 'SETUP', error);
      }
    }
    
    log.info('Healthcare demo users fixed successfully!', 'SETUP');
    log.info('', 'SETUP');
    log.info('Demo User Credentials:', 'SETUP');
    log.info('=====================', 'SETUP');
    demoUsers.forEach(user => {
      log.info(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`, 'SETUP');
    });
    
    process.exit(0);
  } catch (error) {
    log.error('Failed to fix healthcare users', 'SETUP', error);
    process.exit(1);
  }
}

// Run the script
fixHealthcareUsers();