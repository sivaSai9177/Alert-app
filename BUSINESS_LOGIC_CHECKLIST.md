# Business Logic Procedures Checklist & Frontend Integration Guide

## 📋 Complete Procedures Checklist

### ✅ Implemented Procedures

#### 🔐 Authentication & Authorization (19/22 procedures)
- [x] **signIn** - Email/password login with rate limiting
- [x] **signUp** - Registration with role selection
- [x] **getSession** - Current session retrieval
- [x] **getMe** - Get authenticated user data
- [x] **socialSignIn** - OAuth provider login
- [x] **completeProfile** - Profile completion for OAuth users
- [x] **updateProfile** - Update user profile
- [x] **signOut** - Logout functionality
- [x] **checkEmail** - Email availability check
- [ ] **enableTwoFactor** - 2FA setup (placeholder)
- [ ] **verifyTwoFactor** - 2FA verification (placeholder)
- [x] **getAuditLogs** - Audit trail retrieval (admin)
- [x] **forcePasswordReset** - Admin force password reset
- [x] **getActiveSessions** - View active sessions
- [x] **revokeSession** - Revoke specific session
- [x] **listUsers** - User management (manager+)
- [x] **updateUserRole** - Change user roles (admin)
- [x] **getAnalytics** - Analytics data (permission-based)
- [x] **checkEmailExists** - Database email check
- [ ] **forgotPassword** - Password reset flow
- [ ] **resetPassword** - Complete password reset
- [ ] **verifyEmail** - Email verification

#### 👨‍💼 Admin Management (5/8 procedures)
- [x] **listUsers** - Advanced user listing with filters
- [x] **updateUserRole** - Role management with safety
- [x] **getAnalytics** - System-wide analytics
- [x] **getAuditLogs** - Comprehensive audit trail
- [x] **toggleUserStatus** - Suspend/activate users
- [ ] **exportData** - Export user/system data
- [ ] **bulkUserOperations** - Batch user updates
- [ ] **systemSettings** - Global settings management

#### 🏥 Healthcare Core (13/25 procedures)
- [x] **createAlert** - Create medical alerts
- [x] **getActiveAlerts** - View active alerts
- [x] **acknowledgeAlert** - Acknowledge alerts
- [x] **resolveAlert** - Resolve acknowledged alerts
- [x] **getAlertHistory** - Historical alert data
- [x] **updateHealthcareProfile** - Healthcare profile updates
- [x] **updateUserRole** - Healthcare role updates
- [x] **getOnDutyStatus** - Check duty status
- [x] **toggleOnDuty** - Clock in/out
- [x] **getEscalationStatus** - Check escalation timer
- [x] **getEscalationHistory** - View escalation events
- [x] **triggerEscalation** - Manual escalation (admin)
- [x] **getActiveEscalations** - Dashboard summary
- [ ] **subscribeToAlerts** - WebSocket subscriptions
- [ ] **subscribeToAlert** - Single alert subscription
- [ ] **getAlertStatistics** - Alert analytics
- [ ] **getStaffSchedule** - View staff schedules
- [ ] **updateSchedule** - Manage schedules
- [ ] **getShiftHandover** - Shift notes
- [ ] **createHandoverNote** - Add handover notes
- [ ] **getDepartmentAlerts** - Department filtering
- [ ] **getPatientAlerts** - Patient-specific alerts
- [ ] **exportAlertReport** - PDF/CSV exports
- [ ] **batchAcknowledge** - Bulk acknowledgments
- [ ] **getResponseMetrics** - Performance metrics

### ❌ Missing Procedures (Per PRD)

#### 🔔 Notification System
- [ ] **registerPushToken** - Store device push tokens
- [ ] **updateNotificationPreferences** - User notification settings
- [ ] **sendTestNotification** - Test push notifications
- [ ] **getNotificationHistory** - View sent notifications
- [ ] **markNotificationRead** - Mark as read

#### 👥 Team Management
- [ ] **createTeam** - Create medical teams
- [ ] **updateTeam** - Manage team members
- [ ] **getTeamAlerts** - Team-specific alerts
- [ ] **assignAlertToTeam** - Route alerts to teams

#### 📊 Analytics & Reporting
- [ ] **generateReport** - Custom report generation
- [ ] **scheduleReport** - Automated reports
- [ ] **getComplianceReport** - HIPAA compliance metrics
- [ ] **getDepartmentMetrics** - Department performance

#### 🏥 Hospital Management
- [ ] **createHospital** - Multi-hospital support
- [ ] **updateHospitalSettings** - Hospital configuration
- [ ] **getHospitalMetrics** - Hospital-wide analytics
- [ ] **manageHospitalStaff** - Staff assignment

#### 🔌 Integration APIs
- [ ] **syncWithEMR** - Electronic Medical Records sync
- [ ] **importPatientData** - Bulk patient import
- [ ] **exportToHL7** - Standard healthcare format
- [ ] **connectPagerSystem** - Legacy pager integration

## 🎯 Frontend Integration Guide

### 1. Authentication Flow

```typescript
// app/(auth)/login.tsx
const LoginScreen = () => {
  const signInMutation = api.auth.signIn.useMutation({
    onSuccess: (data) => {
      // Store session
      authStore.updateAuth(data.user, data.session);
      
      // Check if profile completion needed
      if (data.user.needsProfileCompletion) {
        router.push('/complete-profile');
      } else {
        // Route based on role
        const roleRoutes = {
          operator: '/(home)/operator-dashboard',
          doctor: '/(home)/healthcare-dashboard',
          nurse: '/(home)/healthcare-dashboard',
          head_doctor: '/(home)/healthcare-dashboard',
          admin: '/(home)/admin'
        };
        router.replace(roleRoutes[data.user.role] || '/(home)');
      }
    },
    onError: (error) => {
      showErrorAlert('Login Failed', error.message);
    }
  });

  const handleLogin = (values: LoginForm) => {
    signInMutation.mutate(values);
  };
};
```

### 2. Alert Creation (Operator Only)

```typescript
// app/(home)/operator-dashboard.tsx
const OperatorDashboard = () => {
  const { user } = useAuthStore();
  const createAlertMutation = api.healthcare.createAlert.useMutation({
    onSuccess: () => {
      showSuccessAlert('Alert Created', 'Medical staff have been notified');
      // Reset form
    },
    onError: (error) => {
      showErrorAlert('Failed to Create Alert', error.message);
    }
  });

  // Only operators can create alerts
  if (user?.role !== 'operator') {
    return <AccessDenied />;
  }

  return (
    <AlertCreationForm 
      onSubmit={(data) => createAlertMutation.mutate({
        ...data,
        hospitalId: user.organizationId // Hospital ID from user
      })}
      isLoading={createAlertMutation.isLoading}
    />
  );
};
```

### 3. Alert Dashboard (Healthcare Staff)

```typescript
// components/healthcare/AlertDashboard.tsx
const AlertDashboard = () => {
  const { user } = useAuthStore();
  
  // Fetch active alerts
  const { data, refetch } = api.healthcare.getActiveAlerts.useQuery({
    hospitalId: user?.organizationId || '',
    limit: 50
  }, {
    enabled: !!user?.organizationId,
    refetchInterval: 5000 // Poll every 5 seconds
  });

  // Subscribe to real-time updates (when implemented)
  useAlertSubscription({
    hospitalId: user?.organizationId || '',
    onAlertCreated: () => refetch(),
    onAlertAcknowledged: () => refetch(),
    onAlertEscalated: () => refetch(),
  });

  // Acknowledge mutation
  const acknowledgeMutation = api.healthcare.acknowledgeAlert.useMutation({
    onSuccess: () => {
      refetch();
      showSuccessAlert('Alert Acknowledged', 'You are now responsible for this alert');
    }
  });

  // Resolve mutation
  const resolveMutation = api.healthcare.resolveAlert.useMutation({
    onSuccess: () => {
      refetch();
      showSuccessAlert('Alert Resolved', 'Great work!');
    }
  });

  return (
    <AlertList 
      alerts={data?.alerts || []}
      onAcknowledge={(alertId, notes) => 
        acknowledgeMutation.mutate({ alertId, notes })
      }
      onResolve={(alertId, resolution) => 
        resolveMutation.mutate({ alertId, resolution })
      }
      userRole={user?.role}
    />
  );
};
```

### 4. Admin User Management

```typescript
// app/(home)/admin.tsx
const AdminDashboard = () => {
  const [filters, setFilters] = useState({ role: '', search: '' });
  
  // List users with filters
  const { data } = api.admin.listUsers.useQuery({
    page: 1,
    limit: 20,
    ...filters
  });

  // Update role mutation
  const updateRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['admin.listUsers']);
      showSuccessAlert('Role Updated', 'User role has been changed');
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = api.admin.toggleUserStatus.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['admin.listUsers']);
    }
  });

  return (
    <UserManagementTable 
      users={data?.users || []}
      onUpdateRole={(userId, newRole, reason) => 
        updateRoleMutation.mutate({ userId, newRole, reason })
      }
      onToggleStatus={(userId, action, reason) =>
        toggleStatusMutation.mutate({ userId, action, reason })
      }
    />
  );
};
```

### 5. Profile Completion Flow

```typescript
// app/(auth)/complete-profile.tsx
const CompleteProfileScreen = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const completeMutation = api.auth.completeProfile.useMutation({
    onSuccess: (data) => {
      // Update auth store
      authStore.updateUser({
        ...user,
        needsProfileCompletion: false,
        organizationId: data.organizationId,
        ...data.user
      });
      
      // Navigate to appropriate dashboard
      const roleRoutes = {
        operator: '/(home)/operator-dashboard',
        doctor: '/(home)/healthcare-dashboard',
        nurse: '/(home)/healthcare-dashboard',
        head_doctor: '/(home)/healthcare-dashboard',
        admin: '/(home)/admin'
      };
      
      router.replace(roleRoutes[user.role] || '/(home)');
    }
  });

  return (
    <ProfileCompletionForm 
      onSubmit={(values) => completeMutation.mutate(values)}
      isLoading={completeMutation.isLoading}
      defaultValues={{
        name: user?.name || '',
        email: user?.email || ''
      }}
    />
  );
};
```

### 6. Real-time Updates (When Implemented)

```typescript
// hooks/useAlertSubscription.tsx
export function useAlertSubscription(options: SubscriptionOptions) {
  const queryClient = useQueryClient();
  
  // This will use WebSocket when implemented
  const subscription = api.healthcare.subscribeToAlerts.useSubscription({
    hospitalId: options.hospitalId
  }, {
    onData: (event) => {
      switch (event.type) {
        case 'alert.created':
          // Show notification
          showNotification('New Alert', event.data.description);
          // Invalidate queries
          queryClient.invalidateQueries(['healthcare.getActiveAlerts']);
          // Call handler
          options.onAlertCreated?.(event);
          break;
          
        case 'alert.escalated':
          // Urgent notification
          showUrgentNotification('Alert Escalated', 'Immediate response required');
          queryClient.invalidateQueries(['healthcare.getActiveAlerts']);
          options.onAlertEscalated?.(event);
          break;
      }
    }
  });

  return subscription;
}
```

### 7. Error Handling Pattern

```typescript
// lib/utils/api-error-handler.ts
export const handleApiError = (error: TRPCClientError<AppRouter>) => {
  // Parse error type
  const errorCode = error.data?.code;
  
  switch (errorCode) {
    case 'UNAUTHORIZED':
      // Redirect to login
      router.replace('/login');
      break;
      
    case 'FORBIDDEN':
      showErrorAlert('Access Denied', 'You do not have permission for this action');
      break;
      
    case 'RATE_LIMITED':
      showErrorAlert('Too Many Requests', 'Please wait before trying again');
      break;
      
    case 'VALIDATION_ERROR':
      // Show field-specific errors
      return error.data.zodError;
      
    default:
      showErrorAlert('Error', error.message);
  }
};
```

### 8. Optimistic Updates

```typescript
// For better UX on acknowledgments
const acknowledgeMutation = api.healthcare.acknowledgeAlert.useMutation({
  onMutate: async ({ alertId }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['healthcare.getActiveAlerts']);
    
    // Snapshot previous value
    const previousAlerts = queryClient.getQueryData(['healthcare.getActiveAlerts']);
    
    // Optimistically update
    queryClient.setQueryData(['healthcare.getActiveAlerts'], (old) => {
      return {
        ...old,
        alerts: old.alerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged', acknowledgedBy: user.id }
            : alert
        )
      };
    });
    
    return { previousAlerts };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['healthcare.getActiveAlerts'], context.previousAlerts);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries(['healthcare.getActiveAlerts']);
  }
});
```

## 🚀 Implementation Priority

### Phase 1: Core Completion (Week 1)
1. [ ] Password reset flow (forgotPassword, resetPassword)
2. [ ] Email verification
3. [ ] WebSocket subscriptions for real-time
4. [ ] Push notification registration

### Phase 2: Healthcare Features (Week 2)
1. [ ] Alert statistics and analytics
2. [ ] Shift scheduling system
3. [ ] Department-based filtering
4. [ ] Batch operations

### Phase 3: Advanced Features (Week 3)
1. [ ] Team management
2. [ ] Custom report generation
3. [ ] Multi-hospital support
4. [ ] Integration APIs

### Phase 4: Production Ready (Week 4)
1. [ ] Two-factor authentication
2. [ ] Compliance reporting
3. [ ] Data export features
4. [ ] System settings management

## 📝 Frontend Best Practices

1. **Always check permissions** before showing UI elements
2. **Use optimistic updates** for better perceived performance
3. **Implement proper loading states** with skeletons
4. **Handle all error cases** with user-friendly messages
5. **Cache aggressively** but invalidate smartly
6. **Use role-based routing** to prevent unauthorized access
7. **Implement offline queue** for critical operations
8. **Add haptic feedback** for mobile interactions
9. **Use large touch targets** (min 44px) for emergency UI
10. **Test under stress conditions** (multiple alerts, poor network)