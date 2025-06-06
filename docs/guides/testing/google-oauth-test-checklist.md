# Google OAuth with Profile Completion - Test Checklist

## Test Environment Setup ✅
- [x] Debug logging implemented with createAuthLogger
- [x] Error boundary added for better error handling
- [x] Debug panel component for monitoring auth state
- [x] Network request interceptor for debugging

## Web OAuth Flow Testing

### New User Flow
1. [ ] Open app in web browser (http://localhost:8081)
2. [ ] Navigate to login screen
3. [ ] Click "Continue with Google" button
4. [ ] Verify redirect to Google OAuth page
5. [ ] Sign in with Google account
6. [ ] Verify redirect back to app
7. [ ] Check if redirected to profile completion screen
8. [ ] Fill in profile details:
   - [ ] Select role
   - [ ] Enter organization ID (optional)
   - [ ] Enter phone number (optional)
   - [ ] Enter department (optional)
9. [ ] Submit profile completion
10. [ ] Verify redirect to home screen
11. [ ] Check auth state in debug panel

### Returning User Flow
1. [ ] Sign out from the app
2. [ ] Click "Continue with Google" again
3. [ ] Sign in with same Google account
4. [ ] Verify direct redirect to home screen (no profile completion)
5. [ ] Check auth state shows needsProfileCompletion: false

## Mobile OAuth Flow Testing

### iOS Testing
1. [ ] Open app in iOS Simulator
2. [ ] Navigate to login screen
3. [ ] Click "Continue with Google" button
4. [ ] Verify browser opens with Google OAuth
5. [ ] Sign in with Google account
6. [ ] Verify redirect back to app
7. [ ] Check if redirected to profile completion screen
8. [ ] Complete profile and submit
9. [ ] Verify redirect to home screen

### Android Testing
1. [ ] Open app in Android Emulator
2. [ ] Repeat iOS testing steps
3. [ ] Verify same behavior

## Debug Panel Verification
1. [ ] Open debug panel (blue bug button)
2. [ ] Check auth state section shows:
   - [ ] Authenticated: true/false
   - [ ] User ID present
   - [ ] Email present
   - [ ] Role present
   - [ ] needsProfileCompletion status
   - [ ] Session ID present
3. [ ] Check logs section for:
   - [ ] OAuth start log
   - [ ] OAuth callback success/failure
   - [ ] Profile completion status
   - [ ] Navigation decisions

## Error Handling Testing
1. [ ] Test with invalid Google credentials
2. [ ] Test network failure during OAuth
3. [ ] Test canceling OAuth flow
4. [ ] Verify error boundary catches crashes
5. [ ] Check error alerts show appropriate messages

## Edge Cases
1. [ ] Test rapid clicking of Google sign-in button
2. [ ] Test backgrounding app during OAuth
3. [ ] Test with expired session
4. [ ] Test profile completion with invalid data
5. [ ] Test navigation back during profile completion

## Performance Monitoring
1. [ ] Check console for performance warnings
2. [ ] Monitor network requests in debug panel
3. [ ] Verify no duplicate API calls
4. [ ] Check for memory leaks in auth flow

## Security Verification
1. [ ] Verify PKCE is used for mobile OAuth
2. [ ] Check tokens are stored securely
3. [ ] Verify no sensitive data in logs
4. [ ] Check OAuth state parameter is used

## Expected Logs in Debug Panel

### Successful New User Flow:
```
[Auth] Starting OAuth flow with google
[Auth] OAuth callback successful for google
[Auth] Session updated
[Auth] Profile completion required: true
[Auth] Navigating to /(auth)/complete-profile: User needs profile completion
[Auth] Profile updated successfully
[Auth] Navigating to /(home): Profile completion successful
```

### Successful Returning User Flow:
```
[Auth] Starting OAuth flow with google
[Auth] OAuth callback successful for google
[Auth] Session updated
[Auth] Profile completion required: false
[Auth] Navigating to /(home): User profile complete
```

## Notes
- Google Client ID: 59100460814-lvqieq6hjuhvhe0t3gue41cpbp499kr4.apps.googleusercontent.com
- Test with both new and existing Google accounts
- Monitor debug panel throughout testing
- Export logs if any issues occur