# OAuth to Profile Completion Flow

## Overview

This document describes the complete flow from Google OAuth sign-in to profile completion and home screen navigation.

## Flow Diagram

```
1. User clicks "Continue with Google"
   ↓
2. Google OAuth Authentication
   ↓
3. Callback to app with user data
   ↓
4. Check needsProfileCompletion flag
   ↓
5. If true → Profile Completion Screen
   If false → Home Screen
   ↓
6. After profile completion → Home Screen
```

## Implementation Details

### 1. Google OAuth Sign-In

**Component**: `GoogleSignInButton.tsx`

- **Web**: Redirects to Google OAuth with callback URL
- **Mobile**: Uses Expo Auth Session with proxy URL
- Logs authentication flow for debugging

### 2. OAuth Callback Processing

**Web**: `/auth-callback` route
**Mobile**: `/api/auth/google-mobile-callback` endpoint

Both paths:
1. Create/update user in database
2. Set `needsProfileCompletion: true` for new users
3. Return user data with session

### 3. Profile Completion Check

**Component**: `auth-callback.tsx`

```typescript
if (sessionData.user.needsProfileCompletion) {
  router.replace('/(auth)/complete-profile');
} else {
  router.replace('/(home)');
}
```

### 4. Enhanced Profile Completion

**Component**: `ProfileCompletionFlowEnhanced.tsx`

Features:
- **Multi-step wizard** (3 steps)
- **Progress indicator**
- **Field validation** with Zod
- **Keyboard-aware scrolling**
- **Success confirmation**

#### Step 1: Basic Information
- Display Name
- Role (required)
- Job Title

#### Step 2: Organization Details
- Organization Name
- Organization ID
- Department

#### Step 3: Contact & Bio
- Phone Number
- Bio (500 char limit)

### 5. Profile Update Process

**Endpoint**: `trpc.auth.updateProfile`

1. Validates input data
2. Updates user in database
3. Sets `needsProfileCompletion: false`
4. Logs audit trail
5. Returns updated user

### 6. Post-Completion Navigation

After successful profile update:
1. Refetch session to get updated user data
2. Update auth store with new user info
3. Show success alert
4. Navigate to home screen

## Database Schema

New fields added to support enhanced profile:

```sql
-- user table additions
organizationName: text("organization_name"),
jobTitle: text("job_title"),
bio: text("bio"),
```

Existing fields used:
- `phoneNumber`
- `department`
- `role`
- `organizationId`
- `needsProfileCompletion`

## Error Handling

1. **Validation Errors**: Shows inline field errors
2. **Network Errors**: Alert with retry option
3. **Auth Failures**: Redirect to login

## Security Considerations

1. **PKCE** used for mobile OAuth
2. **Session validation** after OAuth
3. **Audit logging** for profile updates
4. **Input validation** with Zod schemas

## Testing Checklist

### Web Flow
- [ ] Google OAuth redirects correctly
- [ ] New users see profile completion
- [ ] Existing users go to home
- [ ] Profile data saves correctly
- [ ] Navigation works after completion

### Mobile Flow
- [ ] Expo proxy URL works
- [ ] OAuth browser opens correctly
- [ ] Callback processes successfully
- [ ] Profile completion loads
- [ ] All steps navigate properly

### Edge Cases
- [ ] Skip functionality (if enabled)
- [ ] Validation errors display
- [ ] Network failure handling
- [ ] Back button behavior
- [ ] Form data persistence

## User Experience Enhancements

1. **Welcome Message**: Shows user's email
2. **Progress Tracking**: Visual step indicator
3. **Field Hints**: Placeholder examples
4. **Optional Fields**: Clearly marked
5. **Success Feedback**: Confirmation alert

## Configuration

### Google Console Settings
```
Required Authorized redirect URIs:
- http://localhost:8081/api/auth/callback/google (Web)
- https://auth.expo.io/@anonymous/my-expo (Legacy)
- https://auth.expo.io/@anonymous/my-expo/auth/callback/google (Legacy)
- https://auth.expo.io/@anonymous/expo-fullstack-starter (Mobile Base)
- https://auth.expo.io/@anonymous/expo-fullstack-starter/auth/callback/google (Mobile Callback)
```

### Environment Variables
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
```

## Future Enhancements

1. **Profile Photo Upload**: Add avatar selection
2. **Social Links**: LinkedIn, GitHub profiles
3. **Team Invites**: If creating organization
4. **Preferences**: Theme, notifications
5. **Verification**: Email/phone verification