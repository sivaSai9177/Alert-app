# Google Auth Profile Completion - Manual Test Scenarios

## Overview
This document outlines manual test scenarios for the Google OAuth login flow with profile completion functionality.

## Prerequisites
- Google OAuth credentials configured in `.env`
- Database schema pushed with `needsProfileCompletion` field
- App running on localhost:8081

## Test Scenarios

### Scenario 1: New Google User First-Time Login
**Objective**: Verify new Google users are prompted to complete their profile

**Steps**:
1. Open app in browser or mobile
2. Click "Sign in with Google"
3. Complete Google OAuth flow with a NEW Google account
4. Verify redirect to `/complete-profile` screen
5. Fill out profile form:
   - Select role (admin/manager/user/guest)
   - Enter organization ID (optional)
   - Enter phone number (optional) 
   - Enter department (optional)
6. Click "Complete Profile"
7. Verify redirect to home screen
8. Verify user data is saved with `needsProfileCompletion: false`

**Expected Results**:
- ✅ New user created with `needsProfileCompletion: true`
- ✅ Redirected to profile completion screen
- ✅ Form validates and submits successfully
- ✅ User data updated with selected role and info
- ✅ `needsProfileCompletion` set to `false`
- ✅ Redirected to home screen

### Scenario 2: Existing Google User Login
**Objective**: Verify existing Google users skip profile completion

**Steps**:
1. Use same Google account from Scenario 1
2. Sign out and sign in again with Google
3. Verify direct redirect to home screen (skip profile completion)

**Expected Results**:
- ✅ User recognized as existing
- ✅ Direct redirect to home screen
- ✅ No profile completion screen shown

### Scenario 3: Profile Completion Form Validation
**Objective**: Test form validation and error handling

**Steps**:
1. Create new Google account
2. Reach profile completion screen
3. Test validation:
   - Try submitting without role selection
   - Enter invalid phone number format
   - Test with empty optional fields
   - Test with valid data

**Expected Results**:
- ✅ Role field is required
- ✅ Phone number validation works
- ✅ Optional fields can be empty
- ✅ Valid form submits successfully

### Scenario 4: Skip Profile Completion
**Objective**: Test skip functionality (if enabled)

**Steps**:
1. Create new Google account
2. Reach profile completion screen
3. Click "Skip for Now" (if showSkip=true)
4. Verify redirect to home screen

**Expected Results**:
- ✅ Skip button works when enabled
- ✅ User redirected to home
- ✅ Profile remains incomplete

### Scenario 5: Error Handling
**Objective**: Test error scenarios

**Steps**:
1. Simulate network error during profile update
2. Test with invalid Google OAuth response
3. Test with expired session

**Expected Results**:
- ✅ Error messages displayed appropriately
- ✅ User can retry after errors
- ✅ App handles edge cases gracefully

### Scenario 6: Mobile vs Web Behavior
**Objective**: Verify consistent behavior across platforms

**Steps**:
1. Test complete flow on iOS simulator
2. Test complete flow on Android simulator  
3. Test complete flow on web browser
4. Compare behavior and UI

**Expected Results**:
- ✅ Consistent behavior across platforms
- ✅ Google OAuth works on all platforms
- ✅ UI adapts appropriately to platform

## Database Verification Queries

After each test, verify database state:

```sql
-- Check user creation
SELECT id, email, name, role, needs_profile_completion, created_at 
FROM user 
WHERE email = 'test-email@gmail.com';

-- Check session creation
SELECT id, user_id, expires_at, created_at 
FROM session 
WHERE user_id = 'user-id-here';

-- Check Google account linking
SELECT id, provider_id, user_id, created_at 
FROM account 
WHERE user_id = 'user-id-here' AND provider_id = 'google';
```

## Performance Testing

### Load Testing
- Test with 100+ concurrent Google sign-ins
- Monitor database performance
- Check memory usage during profile completion

### Response Time Testing
- Measure OAuth callback response time
- Measure profile update response time
- Verify acceptable performance under load

## Security Testing

### OAuth Security
- Verify CSRF protection in OAuth flow
- Test with invalid OAuth tokens
- Verify secure redirect URI validation

### Data Security
- Verify sensitive data is not logged
- Check secure storage of tokens
- Verify proper session management

## Regression Testing Checklist

Before each release, verify:
- [ ] New Google users see profile completion
- [ ] Existing users skip profile completion  
- [ ] Profile updates save correctly
- [ ] All platforms work consistently
- [ ] Error handling works properly
- [ ] Performance is acceptable
- [ ] Security measures are effective

## Test Data Cleanup

After testing:
```sql
-- Clean up test users
DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email LIKE '%test%');
DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email LIKE '%test%');
DELETE FROM user WHERE email LIKE '%test%';
```

## Common Issues and Solutions

### Issue: OAuth redirect fails
**Solution**: Check redirect URIs in Google Console match your app configuration

### Issue: Profile completion not showing
**Solution**: Verify `needsProfileCompletion` flag is set correctly in mobile OAuth callback

### Issue: Form validation errors
**Solution**: Check Zod schemas and validation logic

### Issue: Database errors
**Solution**: Verify schema is up-to-date with `bun run db:push`

## Automated Test Coverage

Current automated tests cover:
- ✅ Profile completion logic
- ✅ Form validation
- ✅ Error handling
- ✅ Navigation flows
- ✅ State management

Manual testing focuses on:
- 🔍 End-to-end OAuth integration
- 🔍 Cross-platform behavior
- 🔍 Real Google OAuth responses
- 🔍 Database integration
- 🔍 Performance under load