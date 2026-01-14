-- Add indexes for healthcare performance optimization

-- Alerts table indexes
CREATE INDEX IF NOT EXISTS idx_alerts_hospital_status ON alerts(hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_urgency_level ON alerts(urgency_level DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_next_escalation ON alerts(next_escalation_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged_by ON alerts(acknowledged_by) WHERE acknowledged_by IS NOT NULL;

-- Alert escalations indexes
CREATE INDEX IF NOT EXISTS idx_alert_escalations_alert_id ON alert_escalations(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_escalations_escalated_at ON alert_escalations(escalated_at DESC);

-- Alert acknowledgments indexes
CREATE INDEX IF NOT EXISTS idx_alert_acknowledgments_alert_id ON alert_acknowledgments(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_acknowledgments_user_id ON alert_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_acknowledgments_response_time ON alert_acknowledgments(response_time_seconds);

-- Notification logs indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_alert_user ON notification_logs(alert_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status) WHERE status != 'delivered';

-- Healthcare audit logs indexes
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_user_timestamp ON healthcare_audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_entity ON healthcare_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_action ON healthcare_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_healthcare_audit_logs_hospital_id ON healthcare_audit_logs(hospital_id) WHERE hospital_id IS NOT NULL;

-- Healthcare users indexes
CREATE INDEX IF NOT EXISTS idx_healthcare_users_hospital_id ON healthcare_users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_users_on_duty ON healthcare_users(is_on_duty) WHERE is_on_duty = true;

-- Users table indexes (for healthcare queries)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IN ('operator', 'doctor', 'nurse', 'head_doctor');
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id) WHERE organization_id IS NOT NULL;