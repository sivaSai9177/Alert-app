# 📋 Module Workflow Documentation & Implementation Guide

## 🎯 Module Implementation Workflows

### 🔐 Authentication Module Workflows

#### Workflow 1: User Registration Flow
```yaml
Trigger: User clicks "Sign Up"
Actors: New User, System

Steps:
  1. User Input:
     - Email validation (RFC 5322)
     - Password strength check (min 8 chars, 1 upper, 1 number)
     - Role selection (operator/doctor/nurse)
     
  2. Frontend Processing:
     Code: /app/(auth)/register.tsx
     - Form validation using react-hook-form
     - Show real-time validation feedback
     - Disable submit until valid
     
  3. API Call:
     Endpoint: api.auth.signUp
     Payload: { email, password, role, name }
     
  4. Backend Processing:
     Code: /src/server/routers/auth.ts
     - Check email uniqueness
     - Hash password (bcrypt, 10 rounds)
     - Create user record
     - Generate verification token
     - Send verification email (future)
     
  5. Response Handling:
     Success: 
       - Create session
       - Store token
       - Redirect to profile completion
     Error:
       - Show specific error message
       - Retain form data
       - Log error for monitoring

Validation Rules:
  - Email: Must be unique, valid format
  - Password: Min 8 chars, complexity rules
  - Role: Must be valid healthcare role
  
Error Scenarios:
  - Duplicate email: "Email already registered"
  - Weak password: Show strength indicator
  - Network error: "Unable to connect. Please try again."
  - Server error: "Something went wrong. Please try again."
```

#### Workflow 2: OAuth Login Flow (Google)
```yaml
Trigger: User clicks "Sign in with Google"
Actors: User, Google OAuth, System

Steps:
  1. OAuth Initiation:
     Code: /components/GoogleSignInButton.tsx
     - Open OAuth popup/redirect
     - Request profile scope
     
  2. Google Authentication:
     - User authenticates with Google
     - Google redirects with auth code
     
  3. Callback Processing:
     Code: /app/auth-callback.tsx
     - Extract auth code
     - Exchange for tokens
     
  4. Backend Processing:
     Code: /src/server/routers/auth.ts
     - Verify Google tokens
     - Check if user exists
     - If new: Create user with needsProfileCompletion
     - If existing: Update last login
     
  5. Profile Check:
     If needsProfileCompletion:
       - Redirect to /complete-profile
     Else:
       - Redirect to role-based dashboard
       
Special Considerations:
  - Mobile: Use expo-auth-session
  - Web: Use popup/redirect flow
  - Handle popup blockers gracefully
```

#### Workflow 3: Session Management
```yaml
Background Process: Continuous
Actors: System, User

Token Refresh Flow:
  1. Check token expiry every 5 minutes
  2. If expires in < 10 minutes:
     - Call api.auth.refreshToken
     - Update stored token
     - Reset expiry timer
     
  3. If refresh fails:
     - Clear auth state
     - Redirect to login
     - Show "Session expired" message

Multi-Device Session:
  1. Track device fingerprint
  2. Store device name/type
  3. Allow user to view active sessions
  4. Provide "Logout from all devices" option
  
Security Measures:
  - Rotate refresh tokens on use
  - Invalidate old tokens
  - Track suspicious activity
  - Geographic anomaly detection
```

---

### 🚨 Alert Management Module Workflows

#### Workflow 1: Alert Creation (Operator)
```yaml
Trigger: Operator clicks "Create Alert"
Actors: Operator, System, Medical Staff

Steps:
  1. Form Display:
     Code: /components/healthcare/AlertCreationForm.tsx
     Required Fields:
       - Room Number (alphanumeric, max 10)
       - Alert Type (dropdown)
       - Urgency Level (1-5 scale)
       - Description (optional, max 500 chars)
       
  2. Quick Actions:
     - Preset buttons for common alerts
     - "Code Blue - Room [X]" one-click
     - Recent rooms dropdown
     
  3. Validation:
     - Room number format check
     - Prevent duplicate active alerts
     - Confirm if high urgency
     
  4. Submission:
     Code: api.alerts.create
     - Optimistic UI update
     - Show "Sending..." status
     
  5. Backend Processing:
     Code: /src/server/routers/healthcare.ts
     Process:
       a. Validate operator permissions
       b. Create alert record
       c. Determine target recipients by role
       d. Trigger notification service
       e. Start escalation timer
       f. Log audit trail
       
  6. Real-time Distribution:
     - WebSocket broadcast to online users
     - Push notifications to offline users
     - Update all dashboards
     
  7. Confirmation:
     - Show "Alert sent to X recipients"
     - Display alert ID for reference
     - Auto-close form after 3 seconds

Performance Requirements:
  - Form to submission: < 5 seconds
  - Notification delivery: < 3 seconds
  - WebSocket update: < 500ms
```

#### Workflow 2: Alert Acknowledgment
```yaml
Trigger: Medical staff receives alert
Actors: Doctor/Nurse, System

Mobile Flow:
  1. Push Notification:
     - Sound: Urgent tone for critical
     - Vibration: Pattern based on urgency
     - Actions: "Acknowledge" / "View"
     
  2. Quick Acknowledge:
     - Swipe or tap action button
     - No app open required
     - Sends acknowledgment immediately
     
  3. In-App Acknowledge:
     Code: /components/healthcare/AlertDashboard.tsx
     - Large acknowledge button
     - Shows who else acknowledged
     - Optional notes field
     
Web Flow:
  1. Desktop Notification:
     - Browser notification with actions
     - Tab flashing for urgency
     - Sound alert
     
  2. Dashboard Update:
     - Alert appears at top
     - Pulsing animation for new
     - One-click acknowledge

Backend Processing:
  Code: api.alerts.acknowledge
  1. Verify user can acknowledge
  2. Record acknowledgment + timestamp
  3. Calculate response time
  4. Stop escalation if applicable
  5. Notify others of acknowledgment
  6. Update metrics

Post-Acknowledgment:
  - Move alert to "Acknowledged" section
  - Show response time badge
  - Allow status updates
  - Track until resolved
```

#### Workflow 3: Alert Resolution
```yaml
Trigger: Alert handler marks as resolved
Actors: Medical Staff, System

Steps:
  1. Resolution Options:
     - "Resolved - Patient Stable"
     - "Resolved - False Alarm"  
     - "Resolved - Transferred"
     - "Custom Resolution"
     
  2. Required Information:
     - Resolution type
     - Brief notes (min 10 chars)
     - Time spent (auto-calculated)
     
  3. Confirmation:
     - Double confirm for critical alerts
     - Cannot undo resolution
     
  4. System Updates:
     - Close alert record
     - Stop all escalations
     - Archive for reporting
     - Update metrics
     - Notify all participants
     
  5. Analytics Update:
     - Response time metrics
     - Resolution time metrics
     - Alert type statistics
     - Department performance
```

---

### ⏰ Escalation Module Workflows

#### Workflow 1: Automatic Escalation
```yaml
Trigger: Timer expiration without acknowledgment
Actors: System

Escalation Chain:
  Tier 1 (0-2 min): Nurses in department
  Tier 2 (2-5 min): Doctors in department  
  Tier 3 (5-7 min): Head of department
  Tier 4 (7+ min): All available staff

Process:
  1. Timer Start:
     Code: /src/server/services/escalation-timer.ts
     - Set timer for current tier
     - Store in Redis with alert ID
     
  2. Timer Check (every 10 sec):
     - Get expired timers from Redis
     - Check alert acknowledgment status
     - Process unacknowledged alerts
     
  3. Escalation Execution:
     For each unacknowledged alert:
       a. Identify next tier recipients
       b. Send escalation notifications
       c. Update alert escalation level
       d. Set new timer for next tier
       e. Log escalation event
       
  4. Notification Format:
     "ESCALATED: [Original Alert]
      Not acknowledged for X minutes
      Please respond immediately"
      
  5. Final Escalation:
     - Broadcast to all staff
     - Trigger admin alerts
     - Log critical incident
     - Page on-call staff

Special Rules:
  - Critical alerts: Shorter timers (1 min per tier)
  - Night shift: Include on-call staff earlier
  - Holidays: Adjusted escalation paths
```

#### Workflow 2: Manual Escalation Override
```yaml
Trigger: User manually escalates alert
Actors: Authorized User, System

Authorization:
  - Operators: Can escalate own alerts
  - Doctors: Can escalate any alert
  - Head Doctor: Full escalation control

Steps:
  1. Escalation UI:
     - "Escalate Now" button on alert
     - Select target tier or role
     - Required reason (dropdown + text)
     
  2. Validation:
     - Check user permissions
     - Prevent down-escalation
     - Confirm if skipping tiers
     
  3. Processing:
     - Cancel automatic timer
     - Send to selected recipients
     - Mark as manually escalated
     - Log reason and actor
     
  4. Tracking:
     - Show "Manually Escalated" badge
     - Display escalation reason
     - Audit trail visible
```

---

### 📢 Notification Module Workflows

#### Workflow 1: Push Notification Setup
```yaml
Trigger: App first launch / Settings
Actors: User, System

iOS Flow:
  1. Permission Request:
     - Explain why needed (safety critical)
     - Request notification permission
     - Request critical alerts (special)
     
  2. Token Registration:
     - Get Expo push token
     - Associate with user/device
     - Store in database
     
  3. Configuration:
     - Set notification categories
     - Define action buttons
     - Configure sounds

Android Flow:
  1. Channel Setup:
     - Create urgency channels (1-5)
     - Set importance levels
     - Configure sounds/vibration
     
  2. Permission Handling:
     - Auto-granted on install
     - Check battery optimization
     - Request exemption if needed

Fallback:
  - If push fails: Use WebSocket
  - If WebSocket fails: Show in-app
  - Always store for later delivery
```

#### Workflow 2: Notification Delivery
```yaml
Trigger: Alert created/escalated
Actors: System

Multi-Channel Delivery:
  1. Recipient Resolution:
     Code: /src/server/services/notification.service.ts
     - Get users by role/department
     - Check user availability
     - Get notification preferences
     
  2. Channel Selection:
     Priority Order:
       1. Push (if token + online < 1hr)
       2. WebSocket (if connected)
       3. In-app (store for next login)
       4. SMS (future - critical only)
       
  3. Message Formatting:
     Code: /src/server/services/notification.templates.ts
     Template Variables:
       - Alert type and urgency
       - Room number
       - Time created
       - Escalation status
       
  4. Delivery Tracking:
     For each notification:
       - Log send attempt
       - Track delivery status
       - Monitor open rates
       - Retry if failed
       
  5. Retry Logic:
     - Attempt 1: Immediate
     - Attempt 2: After 30 seconds
     - Attempt 3: After 2 minutes
     - Mark failed after 3 attempts

Critical Alert Handling:
  iOS:
    - Use critical alert entitlement
    - Override Do Not Disturb
    - Play loud sound
    - Require acknowledgment
    
  Android:
    - Use importance HIGH
    - Heads-up notification
    - Insistent sound
    - Fullscreen intent
```

---

### 📊 Dashboard Module Workflows

#### Workflow 1: Role-Based Dashboard Loading
```yaml
Trigger: User login / Navigate to dashboard
Actors: User, System

Data Loading Strategy:
  1. Initial Load:
     Parallel Queries:
       - Active alerts for role
       - Personal metrics
       - Department statistics
       - Recent activity
       
  2. Progressive Enhancement:
     - Show skeleton UI immediately
     - Load critical data first
     - Background load analytics
     - Lazy load historical data
     
  3. Real-time Subscription:
     Code: /hooks/useDashboardSubscription.ts
     Subscribe to:
       - New alerts for role
       - Alert status changes
       - Metric updates
       - System announcements

Role-Specific Views:

Operator Dashboard:
  - Alert creation stats
  - Active alerts list
  - Response time overview
  - Quick create button

Doctor Dashboard:
  - Assigned alerts
  - Patient locations
  - Escalation warnings
  - Team availability

Nurse Dashboard:
  - Department alerts
  - Task priorities
  - Shift information
  - Quick actions

Admin Dashboard:
  - System metrics
  - User activity
  - Performance graphs
  - Settings access
```

#### Workflow 2: Metric Calculation
```yaml
Trigger: Every 1 minute / On demand
Actors: System

Metrics Pipeline:
  1. Data Collection:
     Code: /src/server/services/metrics.service.ts
     Sources:
       - Alert response times
       - Acknowledgment rates
       - Escalation frequency
       - User activity logs
       
  2. Calculation:
     Real-time Metrics:
       - Average response time (5 min window)
       - Active alert count
       - Online user count
       - Current escalations
       
     Historical Metrics:
       - Daily/weekly/monthly averages
       - Peak usage times
       - Department comparisons
       - Trend analysis
       
  3. Caching Strategy:
     - Real-time: Calculate on demand
     - Recent (1 hour): Cache 1 minute
     - Daily: Cache 1 hour
     - Historical: Cache 24 hours
     
  4. Optimization:
     - Use materialized views
     - Incremental calculations
     - Background processing
     - Result streaming
```

---

## 🔄 Cross-Module Workflows

### Workflow: Complete Alert Lifecycle
```yaml
Participants: All modules
Trigger: Alert creation to resolution

Flow:
  1. CREATE (Operator - Alert Module)
     ↓
  2. AUTHENTICATE (Auth Module validates operator)
     ↓
  3. DISTRIBUTE (Notification Module sends to nurses)
     ↓
  4. TIMER START (Escalation Module begins countdown)
     ↓
  5. ACKNOWLEDGE (Nurse - Alert Module)
     ↓
  6. TIMER STOP (Escalation Module cancels)
     ↓
  7. UPDATE DASHBOARDS (Dashboard Module refreshes)
     ↓
  8. WORK ALERT (Medical staff handles situation)
     ↓
  9. RESOLVE (Alert Module closes alert)
     ↓
  10. ANALYTICS (Dashboard Module updates metrics)

Parallel Processes:
  - Audit logging at each step
  - Real-time updates via WebSocket
  - Metric calculations
  - Error handling and recovery
```

---

## 🛠️ Implementation Patterns

### Pattern 1: Optimistic Updates
```typescript
// Frontend immediately updates UI
const createAlert = async (data: AlertData) => {
  // 1. Optimistic update
  const tempId = generateTempId();
  alertStore.addAlert({ ...data, id: tempId, status: 'sending' });
  
  try {
    // 2. API call
    const alert = await api.alerts.create.mutate(data);
    
    // 3. Replace temp with real
    alertStore.replaceAlert(tempId, alert);
  } catch (error) {
    // 4. Rollback on failure
    alertStore.removeAlert(tempId);
    showError('Failed to create alert');
  }
};
```

### Pattern 2: Retry with Backoff
```typescript
// Notification delivery with retry
const deliverNotification = async (
  userId: string, 
  message: NotificationMessage,
  attempt = 1
): Promise<void> => {
  try {
    await pushService.send(userId, message);
    await logDelivery(userId, message, 'success');
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await sleep(delay);
      return deliverNotification(userId, message, attempt + 1);
    } else {
      await logDelivery(userId, message, 'failed');
      await fallbackDelivery(userId, message);
    }
  }
};
```

### Pattern 3: Circuit Breaker
```typescript
// Prevent cascading failures
class NotificationCircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > RECOVERY_TIMEOUT) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= FAILURE_THRESHOLD) {
      this.state = 'open';
    }
  }
}
```

---

## 📋 Workflow Testing Checklist

### For Each Workflow:
- [ ] Happy path tested end-to-end
- [ ] Error scenarios handled gracefully
- [ ] Performance meets requirements
- [ ] Audit trail complete
- [ ] Real-time updates working
- [ ] Mobile and web platforms tested
- [ ] Role permissions enforced
- [ ] Escalation rules verified
- [ ] Notifications delivered
- [ ] Metrics calculated correctly

---

*Last Updated: January 8, 2025*  
*Workflow Version: 1.0*  
*Next Review: After MVP Testing*