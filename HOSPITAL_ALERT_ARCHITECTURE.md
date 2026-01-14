# Hospital Alert System - Technical Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   iOS App       │   Android App   │      Web App               │
│  (React Native) │ (React Native)  │   (React + Expo)           │
└────────┬────────┴────────┬────────┴────────┬──────────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                    ┌──────▼──────┐
                    │   tRPC API   │
                    │  (Type-safe) │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼─────┐
│ Auth Service │  │ Alert Service   │  │WebSocket  │
│(Better Auth) │  │ (Business Logic)│  │(Socket.io)│
└───────┬──────┘  └────────┬────────┘  └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │  Database   │
                    └─────────────┘
```

## 📊 Database Architecture

### Core Tables Structure

```sql
-- Enhanced users table for healthcare
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('operator', 'doctor', 'nurse', 'head_doctor', 'admin'),
  hospital_id UUID REFERENCES hospitals(id),
  license_number VARCHAR(100),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Hospital/Organization
hospitals (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_info JSONB,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Main alerts table
alerts (
  id UUID PRIMARY KEY,
  room_number VARCHAR(10) NOT NULL,
  alert_type ENUM('cardiac_arrest', 'code_blue', 'fire', 'security', 'medical_emergency'),
  urgency_level INTEGER CHECK (urgency_level BETWEEN 1 AND 5),
  description TEXT,
  created_by UUID REFERENCES users(id),
  hospital_id UUID REFERENCES hospitals(id),
  status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  escalation_level INTEGER DEFAULT 1,
  next_escalation_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
)

-- Escalation tracking
alert_escalations (
  id UUID PRIMARY KEY,
  alert_id UUID REFERENCES alerts(id),
  from_tier INTEGER,
  to_tier INTEGER,
  escalated_at TIMESTAMP DEFAULT NOW(),
  reason VARCHAR(255) DEFAULT 'timeout'
)

-- Acknowledgment tracking
alert_acknowledgments (
  id UUID PRIMARY KEY,
  alert_id UUID REFERENCES alerts(id),
  user_id UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP DEFAULT NOW(),
  response_time_seconds INTEGER
)

-- Push notification logs
notification_logs (
  id UUID PRIMARY KEY,
  alert_id UUID REFERENCES alerts(id),
  user_id UUID REFERENCES users(id),
  notification_type ENUM('push', 'in_app', 'websocket'),
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  status ENUM('sent', 'delivered', 'failed', 'opened')
)

-- Audit logs for compliance
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB
)
```

## 🔐 Authentication & Authorization Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  tRPC    │────▶│  Better  │
│   App    │◀────│   API    │◀────│   Auth   │
└──────────┘     └──────────┘     └──────────┘
     │                 │                 │
     │   JWT Token    │   Validate      │
     └────────────────┴─────────────────┘
                       │
                ┌──────▼──────┐
                │   Role &    │
                │ Permission  │
                │   Check     │
                └─────────────┘
```

### Role-Based Access Control (RBAC)

```typescript
const rolePermissions = {
  admin: ['*'], // All permissions
  operator: ['create_alerts', 'view_alerts', 'view_logs'],
  doctor: ['view_alerts', 'acknowledge_alerts', 'view_logs'],
  nurse: ['view_alerts', 'acknowledge_alerts', 'view_logs'],
  head_doctor: ['view_alerts', 'acknowledge_alerts', 'view_logs', 'view_analytics']
};
```

## 🔔 Alert Flow Architecture

### 1. Alert Creation Flow
```
Operator → Create Alert → Validate → Save to DB → Trigger Notifications
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ Notification │
                                  │   Service    │
                                  └──────┬──────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
              Push Notification    WebSocket Event      In-App Alert
```

### 2. Escalation Flow
```
Alert Created → Start Timer (2 min)
      │
      ▼
Timer Expires → Check Acknowledgments
      │              │
      │              ▼
      │         If Acknowledged → Stop
      │              
      ▼
Not Acknowledged → Escalate to Next Tier
      │
      ▼
Notify New Recipients → Reset Timer
      │
      ▼
Repeat Until Acknowledged or All Tiers Exhausted
```

### 3. Acknowledgment Flow
```
User Receives Alert → View Details → Tap Acknowledge
                           │
                           ▼
                    Update Alert Status
                           │
                           ▼
                    Stop Escalation Timer
                           │
                           ▼
                    Notify Other Users
                           │
                           ▼
                    Log Response Time
```

## 🚀 Real-time Architecture

### WebSocket Events
```typescript
// Server -> Client Events
interface ServerToClientEvents {
  'alert:new': (alert: Alert) => void;
  'alert:acknowledged': (data: { alertId: string, userId: string }) => void;
  'alert:escalated': (data: { alertId: string, newTier: number }) => void;
  'alert:resolved': (alertId: string) => void;
}

// Client -> Server Events
interface ClientToServerEvents {
  'join:role': (role: UserRole) => void;
  'leave:role': (role: UserRole) => void;
  'alert:acknowledge': (alertId: string) => void;
}
```

### Room-Based Broadcasting
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Operator   │     │   Doctor    │     │    Nurse    │
│    Room     │     │    Room     │     │    Room     │
└─────┬───────┘     └──────┬──────┘     └──────┬──────┘
      │                    │                    │
      └────────────────────┴────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  WebSocket  │
                    │   Server    │
                    └─────────────┘
```

## 📱 Push Notification Architecture

### iOS Critical Alerts
```swift
// Requires special entitlement from Apple
{
  "aps": {
    "alert": {
      "title": "URGENT: Cardiac Arrest - Room 301",
      "body": "Immediate medical attention required"
    },
    "sound": {
      "critical": 1,
      "name": "urgent-medical.aiff",
      "volume": 1.0
    },
    "interruption-level": "critical"
  }
}
```

### Android High Priority Channel
```kotlin
NotificationChannel(
  "medical_emergency",
  "Medical Emergencies",
  NotificationManager.IMPORTANCE_HIGH
).apply {
  setBypassDnd(true)
  setSound(urgentSound, audioAttributes)
  enableVibration(true)
  vibrationPattern = longArrayOf(0, 250, 250, 250)
}
```

## 🔄 Background Services

### Escalation Timer Service
```typescript
class EscalationService {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  startEscalationTimer(alertId: string, currentTier: number) {
    const timeout = this.getTimeoutForTier(currentTier);
    
    const timer = setTimeout(() => {
      this.escalateAlert(alertId, currentTier);
    }, timeout);
    
    this.timers.set(alertId, timer);
  }
  
  stopEscalationTimer(alertId: string) {
    const timer = this.timers.get(alertId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(alertId);
    }
  }
}
```

## 🛡️ Security Architecture

### API Security Layers
1. **Transport Security**: TLS 1.3+ encryption
2. **Authentication**: JWT tokens with short expiry
3. **Authorization**: Role-based middleware checks
4. **Rate Limiting**: Prevent abuse and DoS
5. **Input Validation**: Zod schemas for all inputs
6. **Audit Logging**: Track all sensitive operations

### Data Protection
```typescript
// Encrypted fields in database
const encryptedFields = {
  users: ['license_number'],
  alerts: ['description'], // If contains patient info
  audit_logs: ['metadata']
};

// Automatic PII redaction in logs
const redactPII = (data: any) => {
  // Redact sensitive fields before logging
  const sensitive = ['password', 'license_number', 'ssn'];
  return redactFields(data, sensitive);
};
```

## 📈 Performance Considerations

### Caching Strategy
```typescript
// Redis caching for frequently accessed data
const cacheKeys = {
  userRoles: 'user:roles:{userId}',
  activeAlerts: 'alerts:active:{hospitalId}',
  userPermissions: 'user:permissions:{userId}'
};

// Cache TTLs
const cacheTTL = {
  userRoles: 3600,      // 1 hour
  activeAlerts: 30,     // 30 seconds
  userPermissions: 1800 // 30 minutes
};
```

### Database Optimization
1. **Indexes**:
   - alerts(hospital_id, status, created_at)
   - alerts(created_by, created_at)
   - notification_logs(alert_id, user_id)
   
2. **Partitioning**:
   - Partition audit_logs by month
   - Archive resolved alerts after 30 days

3. **Connection Pooling**:
   - Min connections: 10
   - Max connections: 100
   - Idle timeout: 30 seconds

## 🚦 Monitoring & Observability

### Key Metrics to Track
```typescript
interface SystemMetrics {
  // Performance
  alertCreationTime: number;       // Target: < 200ms
  notificationDeliveryTime: number; // Target: < 5s
  acknowledgmentRate: number;       // Target: > 95%
  
  // Reliability
  systemUptime: number;            // Target: 99.9%
  failedNotifications: number;     // Target: < 1%
  
  // Business
  averageResponseTime: number;     // Target: < 2 min
  escalationRate: number;          // Target: < 20%
}
```

### Logging Strategy
1. **Application Logs**: Structured JSON with correlation IDs
2. **Audit Logs**: Immutable compliance records
3. **Performance Logs**: Response times, query performance
4. **Error Logs**: Exceptions with full context

## 🏃 Deployment Architecture

### Production Environment
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Load      │────▶│   App       │────▶│  Database   │
│  Balancer   │     │  Servers    │     │  Cluster    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │             ┌──────┴──────┐            │
       │             │  WebSocket  │            │
       │             │   Servers   │            │
       │             └─────────────┘            │
       │                                        │
       └────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │    CDN      │
                    │(Static Assets)│
                    └─────────────┘
```

### Scaling Strategy
1. **Horizontal Scaling**: Add app servers as needed
2. **Database Replication**: Read replicas for reporting
3. **WebSocket Clustering**: Redis adapter for Socket.io
4. **Auto-scaling**: Based on CPU and connection metrics

---

*This architecture is designed to handle hospital-scale emergency alerts with high reliability, security, and performance.*