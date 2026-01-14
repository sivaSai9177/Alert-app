#!/usr/bin/env bun
import { db } from '@/src/db';
import { sql } from 'drizzle-orm';
import { log } from '@/lib/core/logger';
import { user } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

async function setupHealthcareLocal() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || 'postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev';
  const isLocal = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');
  
  log.info('Setting up healthcare tables...', 'SETUP');
  log.info(`Environment: ${process.env.APP_ENV || 'local'}`, 'SETUP');
  log.info(`Database: ${isLocal ? 'Local PostgreSQL' : 'Neon Cloud'}`, 'SETUP');
  log.info(`URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`, 'SETUP'); // Hide password
  
  try {
    // Create tables one by one to avoid multi-statement issues
    log.info('Creating hospitals table...', 'SETUP');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hospitals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        contact_info JSONB,
        settings JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    log.info('Creating healthcare_users table...', 'SETUP');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS healthcare_users (
        user_id TEXT PRIMARY KEY REFERENCES "user"(id),
        hospital_id UUID NOT NULL,
        license_number VARCHAR(100),
        department VARCHAR(100),
        specialization VARCHAR(100),
        is_on_duty BOOLEAN DEFAULT false,
        shift_start_time TIMESTAMP,
        shift_end_time TIMESTAMP
      )
    `);
    
    log.info('Creating alerts table...', 'SETUP');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_number VARCHAR(10) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        urgency_level INTEGER NOT NULL,
        description TEXT,
        created_by TEXT REFERENCES "user"(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active' NOT NULL,
        acknowledged_by TEXT REFERENCES "user"(id),
        acknowledged_at TIMESTAMP,
        escalation_level INTEGER DEFAULT 1,
        next_escalation_at TIMESTAMP,
        resolved_at TIMESTAMP,
        hospital_id UUID NOT NULL
      )
    `);
    
    log.info('Creating alert_escalations table...', 'SETUP');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS alert_escalations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_id UUID REFERENCES alerts(id) NOT NULL,
        escalated_from TEXT REFERENCES "user"(id),
        escalated_to TEXT REFERENCES "user"(id),
        escalation_level INTEGER NOT NULL,
        escalated_at TIMESTAMP DEFAULT NOW(),
        reason TEXT
      )
    `);
    
    log.info('Creating alert_responses table...', 'SETUP');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS alert_responses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_id UUID REFERENCES alerts(id) NOT NULL,
        responder_id TEXT REFERENCES "user"(id) NOT NULL,
        response_type VARCHAR(50) NOT NULL,
        response_time TIMESTAMP DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    log.info('All healthcare tables created successfully!', 'SETUP');
    
    // Insert default hospital
    log.info('Inserting default hospital...', 'SETUP');
    await db.execute(sql`
      INSERT INTO hospitals (id, name, address, contact_info)
      VALUES (
        'f155b026-01bd-4212-94f3-e7aedef2801d',
        'Dubai Central Hospital',
        '123 Healthcare Blvd, Dubai, UAE',
        '{"phone": "+971-4-123-4567", "email": "admin@dubaihospital.ae"}'::jsonb
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        contact_info = EXCLUDED.contact_info
    `);
    
    log.info('Hospital data inserted!', 'SETUP');
    
    // Now run the user update script
    log.info('Updating user roles for healthcare demo...', 'SETUP');
    
    const userUpdates = [
      { email: 'johncena@gmail.com', role: 'operator', name: 'John Operator' },
      { email: 'doremon@gmail.com', role: 'nurse', name: 'Nurse Doremon' },
      { email: 'johndoe@gmail.com', role: 'doctor', name: 'Dr. John Doe' },
      { email: 'saipramod273@gmail.com', role: 'head_doctor', name: 'Dr. Saipramod (Head)' },
    ];
    
    for (const update of userUpdates) {
      try {
        await db.update(user)
          .set({ 
            role: update.role,
            name: update.name 
          })
          .where(eq(user.email, update.email));
        
        log.info(`Updated ${update.email} to role: ${update.role}`, 'SETUP');
      } catch (error) {
        log.error(`Failed to update ${update.email}`, 'SETUP', error);
      }
    }
    
    // Create healthcare profiles
    log.info('Creating healthcare user profiles...', 'SETUP');
    await db.execute(sql`
      INSERT INTO healthcare_users (user_id, hospital_id, license_number, department)
      SELECT 
        id,
        'f155b026-01bd-4212-94f3-e7aedef2801d',
        CASE 
          WHEN role = 'doctor' THEN 'DOC-' || SUBSTRING(id::text, 1, 8)
          WHEN role = 'nurse' THEN 'NUR-' || SUBSTRING(id::text, 1, 8)
          WHEN role = 'head_doctor' THEN 'HDR-' || SUBSTRING(id::text, 1, 8)
          ELSE NULL
        END,
        CASE 
          WHEN role = 'doctor' THEN 'Emergency'
          WHEN role = 'nurse' THEN 'ICU'
          WHEN role = 'head_doctor' THEN 'Cardiology'
          WHEN role = 'operator' THEN 'Control Room'
          ELSE 'General'
        END
      FROM "user" 
      WHERE role IN ('operator', 'doctor', 'nurse', 'head_doctor')
      ON CONFLICT (user_id) DO UPDATE SET
        hospital_id = EXCLUDED.hospital_id,
        department = EXCLUDED.department
    `);
    
    log.info('Healthcare profiles created', 'SETUP');
    
    // Get operator user ID for creating sample alerts
    const [operator] = await db.select().from(user).where(eq(user.role, 'operator')).limit(1);
    
    if (operator) {
      log.info('Creating sample alerts...', 'SETUP');
      
      const alerts = [
        {
          room: 'ICU-3',
          type: 'cardiac_arrest',
          urgency: 1,
          desc: 'Patient in cardiac arrest, immediate response required',
          status: 'active'
        },
        {
          room: 'ER-12',
          type: 'code_blue',
          urgency: 2,
          desc: 'Code blue called for patient',
          status: 'active'
        },
        {
          room: '301',
          type: 'medical_emergency',
          urgency: 3,
          desc: 'Patient experiencing severe chest pain',
          status: 'active'
        }
      ];
      
      for (const alert of alerts) {
        const minutes = Math.floor(Math.random() * 30);
        await db.execute(sql`
          INSERT INTO alerts (
            room_number, 
            alert_type, 
            urgency_level, 
            description, 
            created_by, 
            hospital_id,
            status,
            created_at
          )
          VALUES (
            ${alert.room},
            ${alert.type},
            ${alert.urgency},
            ${alert.desc},
            ${operator.id},
            'f155b026-01bd-4212-94f3-e7aedef2801d',
            ${alert.status},
            NOW() - (${minutes} * INTERVAL '1 minute')
          )
        `);
      }
      
      log.info('Sample alerts created', 'SETUP');
    }
    
    log.info('Healthcare setup completed successfully!', 'SETUP');
    log.info('', 'SETUP');
    log.info('DEMO CREDENTIALS:', 'SETUP');
    log.info('================', 'SETUP');
    log.info('Operator: johncena@gmail.com (any password)', 'SETUP');
    log.info('Nurse: doremon@gmail.com (any password)', 'SETUP');
    log.info('Doctor: johndoe@gmail.com (any password)', 'SETUP');
    log.info('Head Doctor: saipramod273@gmail.com (any password)', 'SETUP');
    
  } catch (error) {
    log.error('Failed to setup healthcare tables', 'SETUP', error);
    throw error;
  }
}

// Only run if called directly
if (import.meta.main) {
  setupHealthcareLocal()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { setupHealthcareLocal };