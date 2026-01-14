#!/usr/bin/env bun
import { db } from '@/src/db';
import { user } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { log } from '@/lib/core/logger';

async function setupHealthcareDemo() {
  try {
    log.info('Setting up healthcare demo data...', 'SETUP');
    
    // First, create the healthcare tables if they don't exist
    const tables = [
      // Hospitals table
      `CREATE TABLE IF NOT EXISTS hospitals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        contact_info JSONB,
        settings JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      // Healthcare users extension
      `CREATE TABLE IF NOT EXISTS healthcare_users (
        user_id UUID PRIMARY KEY REFERENCES users(id),
        hospital_id UUID NOT NULL,
        license_number VARCHAR(100),
        department VARCHAR(100),
        specialization VARCHAR(100),
        is_on_duty BOOLEAN DEFAULT false,
        shift_start_time TIMESTAMP,
        shift_end_time TIMESTAMP
      )`,
      
      // Alerts table
      `CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_number VARCHAR(10) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        urgency_level INTEGER NOT NULL,
        description TEXT,
        created_by UUID REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active' NOT NULL,
        acknowledged_by UUID REFERENCES users(id),
        acknowledged_at TIMESTAMP,
        escalation_level INTEGER DEFAULT 1,
        next_escalation_at TIMESTAMP,
        resolved_at TIMESTAMP,
        hospital_id UUID NOT NULL
      )`,
    ];
    
    // Create tables one by one
    for (const tableSQL of tables) {
      try {
        await db.execute(sql.raw(tableSQL));
      } catch (error) {
        log.warn(`Table might already exist: ${error.message}`, 'SETUP');
      }
    }
    
    // Insert default hospital
    await db.execute(sql`
      INSERT INTO hospitals (id, name, address, contact_info)
      VALUES (
        'f155b026-01bd-4212-94f3-e7aedef2801d',
        'Dubai Central Hospital',
        '123 Healthcare Blvd, Dubai, UAE',
        '{"phone": "+971-4-123-4567", "email": "admin@dubaihospital.ae"}'::jsonb
      ) ON CONFLICT (id) DO NOTHING
    `);
    
    log.info('Hospital created', 'SETUP');
    
    // Update existing users to have healthcare roles
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
      FROM users 
      WHERE role IN ('operator', 'doctor', 'nurse', 'head_doctor')
      ON CONFLICT (user_id) DO UPDATE SET
        hospital_id = EXCLUDED.hospital_id,
        department = EXCLUDED.department
    `);
    
    log.info('Healthcare profiles created', 'SETUP');
    
    // Get operator user ID
    const [operator] = await db.select().from(user).where(eq(user.role, 'operator')).limit(1);
    
    if (operator) {
      // Create sample alerts
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
            NOW() - INTERVAL '${Math.floor(Math.random() * 30)} minutes'
          )
        `);
      }
      
      log.info('Sample alerts created', 'SETUP');
    }
    
    log.info('Healthcare demo setup completed!', 'SETUP');
    log.info('', 'SETUP');
    log.info('DEMO CREDENTIALS:', 'SETUP');
    log.info('================', 'SETUP');
    log.info('Operator: johncena@gmail.com (any password)', 'SETUP');
    log.info('Nurse: doremon@gmail.com (any password)', 'SETUP');
    log.info('Doctor: johndoe@gmail.com (any password)', 'SETUP');
    log.info('Head Doctor: saipramod273@gmail.com (any password)', 'SETUP');
    log.info('', 'SETUP');
    log.info('Note: Login with any of these emails. The system will check the role.', 'SETUP');
    
    process.exit(0);
  } catch (error) {
    log.error('Failed to setup healthcare demo', 'SETUP', error);
    process.exit(1);
  }
}

// Run the setup
setupHealthcareDemo();