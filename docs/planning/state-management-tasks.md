# 🏪 State Management Tasks - Zustand Implementation

## 📊 Module Status
- **Current Grade**: D (40% complete)
- **Target Grade**: A (100% complete)
- **Priority**: 🔴 Critical
- **Estimated Time**: 16 hours
- **Dependencies**: None (foundational module)

## 🎯 Objective
Replace the current mixed React Context + Zustand pattern with a pure, optimized Zustand store implementation following the OPTIMIZED_AUTH_FLOW_GUIDE.md specifications.

## 🚨 Critical Issues Identified
1. **Anti-pattern**: Mixing React Context with Zustand creates confusion
2. **Incomplete Store**: Missing 90% of documented auth store features
3. **No Security**: Missing session monitoring, 2FA, audit trails
4. **Poor Performance**: No optimizations for mobile/web platforms

## 📋 Task Breakdown

### **Task 1: Remove React Context Anti-pattern** 
**Priority**: 🔴 Critical | **Time**: 2h | **Status**: ❌ Not Started

**Description**: Completely remove the React Context pattern from useAuth.tsx and replace with pure Zustand implementation.

**Current Issues**:
```typescript
// BAD: Current mixed pattern in hooks/useAuth.tsx
const AuthContext = createContext<AuthContextType>();
const user = useAuthStore((state) => state.user);
```

**Target Implementation**:
```typescript
// GOOD: Pure Zustand hook
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    logout: store.logout,
    hasPermission: store.hasPermission,
  };
};
```

**Acceptance Criteria**:
- [ ] Remove all React Context code from hooks/useAuth.tsx
- [ ] Implement pure Zustand selectors
- [ ] No createContext, useContext, or Provider patterns
- [ ] All components use direct Zustand hooks
- [ ] Tests pass without React Context wrapper

**Files to Modify**:
- `hooks/useAuth.tsx` - Complete rewrite
- `app/_layout.tsx` - Remove AuthProvider wrapper
- All components using AuthContext

---

### **Task 2: Implement Complete Auth Store**
**Priority**: 🔴 Critical | **Time**: 8h | **Status**: ❌ Not Started

**Description**: Implement the complete auth store specification from OPTIMIZED_AUTH_FLOW_GUIDE.md with all security features.

**Current Issues**:
- Basic store with minimal state
- No session management
- Missing security features
- No permission system

**Target Implementation**:
```typescript
// Complete store with all features from guide
interface AuthState {
  // Core state
  user: HospitalUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  
  // Session management
  sessionExpiry: Date | null;
  lastActivity: Date;
  
  // Security features
  loginAttempts: number;
  isLocked: boolean;
  lockoutUntil: Date | null;
  
  // 2FA support
  requires2FA: boolean;
  has2FAEnabled: boolean;
}
```

**Required Features**:
1. **Session Management**:
   - [ ] Automatic session refresh
   - [ ] Inactivity timeout (30 minutes)
   - [ ] Session expiry handling
   - [ ] Activity tracking

2. **Security Features**:
   - [ ] Account lockout after 5 failed attempts
   - [ ] Login attempt tracking
   - [ ] Automatic unlock after timeout
   - [ ] Session monitoring

3. **2FA Support**:
   - [ ] 2FA state management
   - [ ] QR code generation flow
   - [ ] Verification code handling
   - [ ] 2FA enable/disable

4. **Permission System**:
   - [ ] Role-based permission checking
   - [ ] Resource access validation
   - [ ] Permission caching

**Acceptance Criteria**:
- [ ] All features from OPTIMIZED_AUTH_FLOW_GUIDE.md implemented
- [ ] Session automatically refreshes before expiry
- [ ] Account locks after 5 failed login attempts
- [ ] Inactivity timeout logs user out after 30 minutes
- [ ] Permission system works for all roles
- [ ] 2FA state properly managed
- [ ] All methods properly typed with TypeScript

**Files to Create/Modify**:
- `lib/stores/auth-store.ts` - Complete implementation
- `hooks/useAuth.tsx` - Simplified hooks
- `hooks/useAuthGuard.tsx` - Permission checking hook

---

### **Task 3: Platform-Specific Storage Implementation**
**Priority**: 🔴 Critical | **Time**: 3h | **Status**: ❌ Not Started

**Description**: Implement secure, platform-specific storage for tokens and session data.

**Current Issues**:
- Basic AsyncStorage usage
- No secure token storage
- Platform differences not handled

**Target Implementation**:
```typescript
// Secure storage abstraction
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }
  },
};
```

**Required Features**:
- [ ] Secure token storage (SecureStore for mobile, localStorage for web)
- [ ] Session data persistence with proper partializing
- [ ] Automatic cleanup on logout
- [ ] Error handling for storage failures

**Acceptance Criteria**:
- [ ] Tokens stored in SecureStore on mobile
- [ ] Session data persisted across app restarts
- [ ] Sensitive data excluded from persistence (tokens, passwords)
- [ ] Proper error handling for storage operations
- [ ] Storage automatically cleared on logout

**Files to Modify**:
- `lib/stores/auth-store.ts` - Add storage configuration
- `lib/secure-storage.ts` - Create storage abstraction

---

### **Task 4: Session Monitoring Implementation**
**Priority**: 🔴 Critical | **Time**: 3h | **Status**: ❌ Not Started

**Description**: Implement comprehensive session monitoring with automatic refresh and timeout handling.

**Current Issues**:
- No session monitoring
- No automatic refresh
- No inactivity detection

**Target Implementation**:
```typescript
// Session monitoring in store
startSessionMonitoring: () => {
  const timer = setInterval(() => {
    const state = get();
    const now = new Date();
    
    // Check session expiry
    if (state.sessionExpiry && now > state.sessionExpiry) {
      get().logout('session_expired');
      return;
    }
    
    // Check inactivity (30 minutes)
    const inactivityLimit = 30 * 60 * 1000;
    if (now.getTime() - state.lastActivity.getTime() > inactivityLimit) {
      get().logout('inactivity_timeout');
      return;
    }
    
    // Auto-refresh token (5 minutes before expiry)
    if (state.sessionExpiry) {
      const timeUntilExpiry = state.sessionExpiry.getTime() - now.getTime();
      if (timeUntilExpiry < 5 * 60 * 1000) {
        get().refreshSession();
      }
    }
  }, 60 * 1000); // Check every minute
},
```

**Required Features**:
- [ ] Automatic session refresh 5 minutes before expiry
- [ ] Inactivity timeout after 30 minutes
- [ ] Activity tracking on user interactions
- [ ] Session expiry detection
- [ ] Proper cleanup on logout

**Acceptance Criteria**:
- [ ] Session automatically refreshes without user action
- [ ] User logged out after 30 minutes of inactivity
- [ ] Activity tracked on app interactions
- [ ] Session monitoring starts on login, stops on logout
- [ ] No memory leaks from timers

**Files to Modify**:
- `lib/stores/auth-store.ts` - Add session monitoring methods
- `app/_layout.tsx` - Add activity listeners

---

## 🧪 Testing Requirements

### **Unit Tests**
- [ ] Auth store state mutations
- [ ] Session monitoring logic
- [ ] Permission checking methods
- [ ] Storage abstraction layer
- [ ] Error handling scenarios

### **Integration Tests**
- [ ] Login/logout flow
- [ ] Session refresh process
- [ ] Activity tracking
- [ ] Platform-specific storage
- [ ] 2FA flow integration

### **Test Files to Create/Update**:
- `__tests__/stores/auth-store.test.ts`
- `__tests__/hooks/useAuth.test.tsx`
- `__tests__/integration/auth-flow.test.tsx`

## 🔍 Quality Assurance

### **Pre-Implementation Checklist**
- [ ] Read OPTIMIZED_AUTH_FLOW_GUIDE.md completely
- [ ] Understand current implementation issues
- [ ] Plan implementation approach
- [ ] Set up test environment

### **Implementation Checklist**
- [ ] Follow TypeScript strict mode
- [ ] Implement comprehensive error handling
- [ ] Add detailed logging for debugging
- [ ] Test on both iOS and Android platforms
- [ ] Verify web compatibility

### **Post-Implementation Checklist**
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated

## 🚀 Performance Targets

### **Mobile Performance**
- Store hydration: <100ms
- State updates: <16ms (60fps)
- Storage operations: <50ms

### **Web Performance**
- Initial load: <200ms
- Navigation: <100ms
- Session refresh: <500ms

## 🔒 Security Requirements

### **Token Security**
- [ ] Tokens stored in SecureStore (mobile) / secure localStorage (web)
- [ ] No tokens in Redux DevTools or logs
- [ ] Automatic token cleanup on logout
- [ ] Token rotation on refresh

### **Session Security**
- [ ] Automatic logout on inactivity
- [ ] Session expiry enforcement
- [ ] Concurrent session handling
- [ ] Audit trail for all auth events

## 📝 Documentation Updates

### **Files to Update**:
- [ ] README.md - Update auth implementation status
- [ ] API documentation for new hooks
- [ ] Developer guide for state management patterns
- [ ] Security documentation for token handling

## 🎯 Success Criteria

### **Technical Success**
- [ ] Pure Zustand implementation (no React Context)
- [ ] All features from OPTIMIZED_AUTH_FLOW_GUIDE.md working
- [ ] Session monitoring and security working
- [ ] Platform-specific optimizations implemented
- [ ] 100% test coverage

### **Business Success**
- [ ] Authentication flow <3 seconds
- [ ] No user complaints about session timeouts
- [ ] Zero security incidents
- [ ] Seamless cross-platform experience

## 🔄 Implementation Order

1. **Task 1**: Remove React Context (foundation)
2. **Task 2**: Implement complete store (core functionality)
3. **Task 3**: Platform storage (security)
4. **Task 4**: Session monitoring (reliability)

## 📞 Support

**Questions/Issues**: Create issue in GitHub with "state-management" label
**Code Review**: Required for all tasks before merge
**Testing**: Full test suite must pass

---

**Next Steps**: Start with Task 1 (Remove React Context) as it's foundational for all other improvements.