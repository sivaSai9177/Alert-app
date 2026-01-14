# Hospital Alert MVP - Task Index & Commands

**Updated**: January 9, 2025  
**Time**: Morning  
**Deadline**: Today Afternoon

---

## 🎯 Final Sprint Task Index

### 1. UX Polish Tasks

#### 1.1 Healthcare Blocks Consistency
```bash
# Files to check and update
code components/healthcare/blocks/AlertListBlock.tsx
code components/healthcare/blocks/AlertCreationBlock.tsx  
code components/healthcare/blocks/MetricsOverviewBlock.tsx
code components/healthcare/blocks/PatientCardBlock.tsx

# Key updates needed:
- Loading skeletons
- Fade-in animations
- Consistent shadows
- Empty states
- Pull-to-refresh
```

#### 1.2 Touch Optimization
```bash
# Check touch targets in:
code app/(home)/operator-dashboard.tsx
code app/(home)/healthcare-dashboard.tsx
code components/healthcare/AlertCreationForm.tsx

# Minimum 44px height for all touchable elements
```

#### 1.3 Visual Polish
```bash
# Update theme colors for urgency levels
code lib/design-system/golden-ratio.ts
code constants/theme/Colors.ts

# Urgency color system:
const urgencyColors = {
  1: '#FF0000', // Critical - Red
  2: '#FF6B00', // High - Orange  
  3: '#FFB800', // Medium - Yellow
  4: '#4CAF50', // Low - Green
  5: '#2196F3', // Info - Blue
};
```

### 2. Performance Tasks

#### 2.1 List Optimization
```bash
# Optimize AlertListBlock
code components/healthcare/blocks/AlertListBlock.tsx

# Add these optimizations:
- React.memo with custom comparison
- keyExtractor optimization
- getItemLayout implementation
- removeClippedSubviews={true}
```

#### 2.2 Re-render Prevention
```bash
# Files to optimize:
code hooks/useAlertSubscription.tsx
code lib/stores/healthcare-store.ts

# Implement:
- useMemo for expensive calculations
- useCallback for event handlers
- Proper dependency arrays
```

### 3. Edge Case Handling

#### 3.1 Network Error Handling
```bash
# Add to all API calls:
code src/server/routers/healthcare.ts
code lib/trpc.tsx

# Implement:
- Network status detection
- Retry mechanisms
- Offline queue
```

#### 3.2 Session Management
```bash
# Update auth handling:
code lib/auth/auth-client.ts
code components/ProtectedRoute.tsx

# Add:
- Token refresh logic
- Session expiry handling
- Grace period for renewals
```

### 4. Testing Commands

```bash
# Run all tests
bun test

# Test specific features
bun test AlertCreation
bun test Escalation
bun test Authentication

# Manual testing checklist
# 1. Create alert as operator
# 2. Acknowledge as nurse
# 3. Let alert escalate
# 4. Resolve as doctor
# 5. Check audit logs
```

### 5. Documentation Tasks

#### 5.1 Quick Start Guides
```bash
# Create operator guide
code docs/quick-start/operator-guide.md

# Create medical staff guide  
code docs/quick-start/medical-staff-guide.md

# Include:
- Screenshots
- Step-by-step instructions
- Common scenarios
- Troubleshooting
```

#### 5.2 API Documentation
```bash
# Document all endpoints
code docs/api/healthcare-endpoints.md

# Include:
- Request/response examples
- Authentication requirements
- Rate limits
- Error codes
```

### 6. Production Build

#### 6.1 Environment Setup
```bash
# Create production env
cp .env.local .env.production

# Update values:
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_URL=https://api.hospital-alerts.com
DATABASE_URL=postgresql://prod_connection_string
```

#### 6.2 Build Commands
```bash
# Clean build cache
rm -rf .expo
rm -rf node_modules/.cache

# Install dependencies
bun install --production

# iOS build
eas build --platform ios --profile production

# Android build
eas build --platform android --profile production

# Web build
bun run build:web
```

---

## 🚀 Quick Development Commands

### Start Development
```bash
# With local database and healthcare setup
bun run local:healthcare

# iOS physical device
bun run ios:healthcare

# Android device
bun run android

# Web only
bun run web
```

### Database Commands
```bash
# Reset database
bun run db:reset

# Run migrations
bun run db:migrate

# Open database GUI
bun run db:studio

# Create healthcare demo data
bun run scripts/setup-healthcare-demo.ts
```

### Testing Commands
```bash
# Unit tests
bun test:unit

# Integration tests
bun test:integration

# E2E tests
bun test:e2e

# Test coverage
bun test:coverage
```

### Debugging Commands
```bash
# Check API health
bun run scripts/check-api-health.ts

# Debug auth issues
bun run scripts/debug-mobile-auth.ts

# Check websocket connection
bun run scripts/test-websocket.ts

# View logs
bun run logs
```

---

## 📋 Pre-Launch Checklist

### Code Quality
- [ ] No console.log statements
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] ESLint clean
- [ ] Bundle size < 5MB

### Features
- [ ] Operator can create alerts
- [ ] Medical staff receive alerts
- [ ] Acknowledgment works
- [ ] Escalation triggers
- [ ] Audit logs capture all actions

### Performance
- [ ] 60fps scrolling
- [ ] < 2s initial load
- [ ] < 100ms API responses
- [ ] Smooth animations
- [ ] No memory leaks

### Security
- [ ] HTTPS only
- [ ] Secure headers
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention

### Documentation
- [ ] README updated
- [ ] API docs complete
- [ ] User guides ready
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 🔥 Hot Fixes

### If auth breaks:
```bash
# Clear auth state
bun run scripts/reset-auth.ts

# Check session
bun run scripts/check-user-status.ts
```

### If database errors:
```bash
# Reset and migrate
bun run db:reset
bun run db:migrate
bun run scripts/setup-healthcare-local.ts
```

### If iOS device can't connect:
```bash
# Use iOS-specific command
bun run ios:healthcare

# Or manually set IP
export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.X
bun start
```

---

## 📞 Emergency Contacts

- **Lead Developer**: Check CLAUDE.md
- **GitHub Issues**: https://github.com/sivaSai9177/Alert-app/issues
- **Documentation**: /docs/index.md
- **Status Updates**: /MVP_FINAL_STATUS_JAN_2025.md

---

**Remember**: We ship TODAY! Focus on essentials only. 🚀