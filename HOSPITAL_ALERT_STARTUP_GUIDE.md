# 🏥 Hospital Alert System - Startup & Health Check Guide

## 🚀 Quick Start Commands

### 1. **Recommended: One-Command Healthcare Setup**
```bash
# This single command does everything:
bun run local:healthcare

# What it does:
# ✅ Starts Docker PostgreSQL
# ✅ Sets up healthcare database tables
# ✅ Creates demo users (operator, nurse, doctor)
# ✅ Creates sample alerts
# ✅ Starts Expo in local mode
```

### 2. **Alternative: OAuth-Friendly Setup**
```bash
# For Google OAuth testing
./scripts/fix-oauth-local.sh

# Access at: http://localhost:8081
# Mobile: exp://localhost:8081
```

### 3. **Manual Step-by-Step**
```bash
# Step 1: Start database
bun db:local:up

# Step 2: Push schema (including healthcare tables)
bun db:push:local

# Step 3: Setup healthcare demo data
bun run healthcare:setup:local

# Step 4: Start Expo
bun run local
```

---

## 🏥 Health Check Commands

### 1. **Quick Health Status**
```bash
# API Health
bun api:health

# Comprehensive health check
bun run scripts/health-check.ts

# Database status
docker ps | grep postgres

# Check healthcare tables
bun db:studio:local
# Look for: alerts, healthcare_users, hospitals tables
```

### 2. **Test Healthcare Endpoints**
```bash
# Test all healthcare API endpoints
bun run scripts/test-healthcare-endpoints.ts

# Expected output:
# ✅ Auth endpoints working
# ✅ Healthcare endpoints accessible
# ✅ WebSocket subscriptions ready
```

### 3. **Verify Demo Users**
```bash
# Check if demo users exist
bun run scripts/check-user-status.ts

# Demo credentials:
# Operator: johncena@gmail.com (password: johncena)
# Nurse: doremon@gmail.com (password: doremon)
# Doctor: johndoe@gmail.com (password: johndoe)
# Head Doctor: saipramod273@gmail.com (password: saipramod273)
```

---

## 📊 Complete Health Check Dashboard

### Run Full System Check
```bash
# 1. Environment & Dependencies
bun run scripts/health-check.ts

# 2. Network Configuration
bun run scripts/check-network.ts

# 3. API Health
bun run scripts/check-api-health.ts

# 4. Database Connection
bun run scripts/check-environment.ts

# 5. Build Environment
bun run scripts/check-build-environment.ts
```

### Expected Health Status
```
✅ PASS: Database connection active
✅ PASS: Healthcare tables created
✅ PASS: Demo users exist
✅ PASS: API endpoints responding
✅ PASS: WebSocket ready
✅ PASS: Auth system functional
⚠️  WARN: Push notifications not configured (expected for local)
⚠️  WARN: Escalation timer not started (needs manual start)
```

---

## 🔍 Verify Hospital Alert Features

### 1. **Check Database Schema**
```bash
# Open database GUI
bun db:studio:local

# Verify these tables exist:
- hospitals (organization data)
- healthcare_users (extended user profiles)
- alerts (emergency alerts)
- alert_escalations (escalation tracking)
- alert_acknowledgments (response tracking)
- notification_logs (delivery logs)
- healthcare_audit_logs (HIPAA compliance)
```

### 2. **Test Alert Creation Flow**
```bash
# 1. Start app
bun run local:healthcare

# 2. Login as operator
# Email: johncena@gmail.com
# Password: johncena

# 3. Navigate to Operator Dashboard
# 4. Create test alert:
#    - Room: 301
#    - Type: Cardiac Arrest
#    - Urgency: 1 (Critical)

# 5. Check real-time updates
# Login as nurse in another window
```

### 3. **Verify Real-time Features**
```bash
# Check WebSocket connection
# In browser console:
# - Open Network tab
# - Filter by WS
# - Should see active WebSocket connection

# Test subscription
# Create alert as operator
# Should see immediate update in nurse dashboard
```

---

## 🚨 Common Issues & Fixes

### 1. **"No development build" Error**
```bash
# Solution: Force Expo Go mode
EXPO_GO=1 bun run local:healthcare
```

### 2. **Database Connection Failed**
```bash
# Check Docker is running
docker ps

# If no postgres container:
bun db:local:up

# Reset if needed:
bun db:local:reset
bun run healthcare:setup:local
```

### 3. **OAuth Not Working**
```bash
# OAuth requires localhost (not IP)
./scripts/fix-oauth-local.sh

# OR use ngrok for stable URL:
bun ngrok:start
```

### 4. **Healthcare Tables Missing**
```bash
# Push schema first
bun db:push:local

# Then setup healthcare
bun run healthcare:setup:local

# Verify in studio
bun db:studio:local
```

### 5. **Demo Users Not Working**
```bash
# Recreate demo users
bun run scripts/create-healthcare-users.ts

# Or full reset:
bun db:local:reset
bun run local:healthcare
```

---

## ⚡ Performance Metrics

### Expected Performance
```yaml
API Response Times:
  - Auth endpoints: < 100ms
  - Alert creation: < 200ms
  - Alert query: < 50ms
  - WebSocket latency: < 100ms

Database Queries:
  - User lookup: < 10ms
  - Alert insert: < 20ms
  - Escalation check: < 15ms

UI Responsiveness:
  - Screen navigation: < 100ms
  - Alert list render: < 200ms
  - Form submission: < 300ms
```

### Check Performance
```bash
# API performance
bun run scripts/test-api-endpoints.ts

# Database performance
bun db:studio:local
# Check query execution times

# Bundle size
bun run build
# Check output size
```

---

## 🔧 Advanced Debugging

### 1. **Enable Debug Mode**
```bash
# Start with debug logging
DEBUG=* bun run local:healthcare

# Or specific modules:
DEBUG=trpc:* bun run local:healthcare
DEBUG=auth:* bun run local:healthcare
```

### 2. **Check Logs**
```bash
# API logs
docker logs -f my-expo-api

# Database logs
docker logs -f my-expo-postgres

# Mobile logs
bun logs:ios
bun logs:android
```

### 3. **Monitor Real-time Events**
```bash
# In app, enable debug panel:
# Settings > Developer Options > Show Debug Panel

# Shows:
# - WebSocket events
# - API calls
# - State changes
# - Performance metrics
```

---

## 📋 Health Check Checklist

Before considering the app healthy, verify:

- [ ] Database is running (`docker ps`)
- [ ] Healthcare tables exist (`bun db:studio:local`)
- [ ] Demo users can login
- [ ] Operator can create alerts
- [ ] Nurses/Doctors see alerts in real-time
- [ ] Acknowledgment updates alert status
- [ ] Escalation timer shows countdown
- [ ] Audit logs are being created
- [ ] No console errors
- [ ] Performance metrics are acceptable

---

## 🚀 Next Steps After Health Check

1. **Start Escalation Timer Service**
   ```typescript
   // Add to server startup
   import { escalationTimerService } from './escalation-timer';
   escalationTimerService.start();
   ```

2. **Test Full Alert Lifecycle**
   - Create alert
   - Wait for escalation (2 minutes)
   - Verify escalation notification
   - Acknowledge and verify timer stops

3. **Configure Push Notifications**
   - Set up Expo push tokens
   - Test notification delivery
   - Configure critical alert sounds

---

*Last Updated: January 8, 2025*  
*For production deployment, see DEPLOYMENT_GUIDE.md*