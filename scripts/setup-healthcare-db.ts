#!/usr/bin/env bun
import { db } from '@/src/db';
import { sql } from 'drizzle-orm';
import { log } from '@/lib/core/logger';

async function setupHealthcareDatabase() {
  try {
    log.info('Setting up healthcare database schema...', 'DB_SETUP');
    
    // Create healthcare tables
    await db.execute(sql`
      -- Healthcare user extensions
      CREATE TABLE IF NOT EXISTS healthcare_users (
        user_id UUID PRIMARY KEY REFERENCES users(id),
        hospital_id UUID NOT NULL,
        license_number VARCHAR(100),
        department VARCHAR(100),
        specialization VARCHAR(100),
        is_on_duty BOOLEAN DEFAULT false,
        shift_start_time TIMESTAMP,
        shift_end_time TIMESTAMP
      );
      
      -- Hospitals table
      CREATE TABLE IF NOT EXISTS hospitals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        contact_info JSONB,
        settings JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Insert a default hospital for demo
      INSERT INTO hospitals (id, name, address, contact_info)
      VALUES (
        'f155b026-01bd-4212-94f3-e7aedef2801d',
        'Dubai Central Hospital',
        '123 Healthcare Blvd, Dubai, UAE',
        '{"phone": "+971-4-123-4567", "email": "admin@dubaihospital.ae"}'::jsonb
      ) ON CONFLICT (id) DO NOTHING;
      
      -- Alerts table
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_number VARCHAR(10) NOT NULL,
        alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('cardiac_arrest', 'code_blue', 'fire', 'security', 'medical_emergency')),
        urgency_level INTEGER NOT NULL CHECK (urgency_level BETWEEN 1 AND 5),
        description TEXT,
        created_by UUID REFERENCES users(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'acknowledged', 'resolved')),
        acknowledged_by UUID REFERENCES users(id),
        acknowledged_at TIMESTAMP,
        escalation_level INTEGER DEFAULT 1,
        next_escalation_at TIMESTAMP,
        resolved_at TIMESTAMP,
        hospital_id UUID REFERENCES hospitals(id) NOT NULL
      );
      
      -- Alert escalations
      CREATE TABLE IF NOT EXISTS alert_escalations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_id UUID REFERENCES alerts(id) NOT NULL,
        from_role VARCHAR(50) NOT NULL,
        to_role VARCHAR(50) NOT NULL,
        escalated_at TIMESTAMP DEFAULT NOW(),
        reason VARCHAR(255)
      );
      
      -- Alert acknowledgments
      CREATE TABLE IF NOT EXISTS alert_acknowledgments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_id UUID REFERENCES alerts(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        acknowledged_at TIMESTAMP DEFAULT NOW(),
        response_time_seconds INTEGER,
        notes TEXT
      );
      
      -- Notification logs
      CREATE TABLE IF NOT EXISTS notification_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_id UUID REFERENCES alerts(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('push', 'sms', 'email', 'in_app')),
        sent_at TIMESTAMP DEFAULT NOW(),
        delivered_at TIMESTAMP,
        opened_at TIMESTAMP,
        status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'opened')),
        error_message TEXT
      );
      
      -- Healthcare audit logs
      CREATE TABLE IF NOT EXISTS healthcare_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        action VARCHAR(100) NOT NULL CHECK (action IN ('alert_created', 'alert_acknowledged', 'alert_escalated', 'alert_resolved', 'user_login', 'user_logout', 'permission_changed', 'role_changed')),
        entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('alert', 'user', 'system', 'permission')),
        entity_id UUID NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        hospital_id UUID REFERENCES hospitals(id)
      );
      
      -- Departments
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        hospital_id UUID REFERENCES hospitals(id) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        head_doctor_id UUID REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Insert default departments
      INSERT INTO departments (hospital_id, name, description)
      VALUES 
        ('f155b026-01bd-4212-94f3-e7aedef2801d', 'Emergency', 'Emergency Department'),
        ('f155b026-01bd-4212-94f3-e7aedef2801d', 'ICU', 'Intensive Care Unit'),
        ('f155b026-01bd-4212-94f3-e7aedef2801d', 'Cardiology', 'Cardiology Department'),
        ('f155b026-01bd-4212-94f3-e7aedef2801d', 'General Ward', 'General Patient Ward')
      ON CONFLICT DO NOTHING;
      
      -- Shift schedules
      CREATE TABLE IF NOT EXISTS shift_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        hospital_id UUID REFERENCES hospitals(id) NOT NULL,
        department_id UUID REFERENCES departments(id),
        shift_date TIMESTAMP NOT NULL,
        shift_start_time TIMESTAMP NOT NULL,
        shift_end_time TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Alert metrics
      CREATE TABLE IF NOT EXISTS alert_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        hospital_id UUID REFERENCES hospitals(id) NOT NULL,
        date TIMESTAMP NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        total_alerts INTEGER DEFAULT 0,
        average_response_time INTEGER,
        average_resolution_time INTEGER,
        escalation_count INTEGER DEFAULT 0,
        acknowledged_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_alerts_hospital_status ON alerts(hospital_id, status);
      CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_healthcare_users_hospital ON healthcare_users(hospital_id);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_alert ON notification_logs(alert_id);
      CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_user ON healthcare_audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_timestamp ON healthcare_audit_logs(timestamp DESC);
    `);
    
    log.info('Healthcare database schema created successfully', 'DB_SETUP');
    
    // Create demo healthcare users
    log.info('Creating demo healthcare users...', 'DB_SETUP');
    
    await db.execute(sql`
      -- Update existing users to have healthcare roles
      UPDATE users SET role = 'operator' WHERE email = 'operator@hospital.com';
      UPDATE users SET role = 'doctor' WHERE email = 'doctor@hospital.com';
      UPDATE users SET role = 'nurse' WHERE email = 'nurse@hospital.com';
      UPDATE users SET role = 'head_doctor' WHERE email = 'head.doctor@hospital.com';
      
      -- Add healthcare profiles for these users
      INSERT INTO healthcare_users (user_id, hospital_id, license_number, department, specialization)
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
        END,
        CASE 
          WHEN role = 'doctor' THEN 'Emergency Medicine'
          WHEN role = 'head_doctor' THEN 'Cardiology'
          ELSE NULL
        END
      FROM users 
      WHERE role IN ('operator', 'doctor', 'nurse', 'head_doctor')
      ON CONFLICT (user_id) DO UPDATE SET
        hospital_id = EXCLUDED.hospital_id,
        department = EXCLUDED.department;
    `);
    
    log.info('Demo healthcare users created', 'DB_SETUP');
    
    // Create some sample alerts for testing
    log.info('Creating sample alerts...', 'DB_SETUP');
    
    await db.execute(sql`
      -- Insert sample alerts (only if no alerts exist)
      INSERT INTO alerts (room_number, alert_type, urgency_level, description, created_by, hospital_id, created_at, status)
      SELECT 
        room_number,
        alert_type,
        urgency_level,
        description,
        (SELECT id FROM users WHERE role = 'operator' LIMIT 1),
        'f155b026-01bd-4212-94f3-e7aedef2801d',
        created_at,
        status
      FROM (
        VALUES 
          ('ICU-3', 'cardiac_arrest', 1, 'Patient in cardiac arrest, immediate response required', NOW() - INTERVAL '10 minutes', 'active'),
          ('ER-12', 'code_blue', 2, 'Code blue called for patient', NOW() - INTERVAL '25 minutes', 'acknowledged'),
          ('301', 'medical_emergency', 3, 'Patient experiencing severe chest pain', NOW() - INTERVAL '1 hour', 'resolved')
      ) AS sample_alerts(room_number, alert_type, urgency_level, description, created_at, status)
      WHERE NOT EXISTS (SELECT 1 FROM alerts LIMIT 1);
    `);
    
    log.info('Sample alerts created', 'DB_SETUP');
    
    log.info('Healthcare database setup completed successfully!', 'DB_SETUP');
    
    process.exit(0);
  } catch (error) {
    log.error('Failed to setup healthcare database', 'DB_SETUP', error);
    process.exit(1);
  }
}

// Run the setup
setupHealthcareDatabase();