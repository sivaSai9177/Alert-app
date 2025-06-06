# Google OAuth with Profile Completion Flow

## Overview

This guide documents the implementation of Google OAuth authentication with automatic profile completion flow for new users.

## Implementation Details

### 1. Mobile OAuth Flow

The mobile OAuth flow has been updated to:

1. **Return `needsProfileCompletion` flag** - The `/api/auth/google-mobile-callback` endpoint now includes the `needsProfileCompletion` status in the response
2. **Navigate based on profile status** - The `GoogleSignInButton` component checks this flag and navigates to either:
   - `/(auth)/complete-profile` if profile completion is needed
   - `/(home)` if profile is already complete
3. **Update auth store** - The auth store is updated with user and session data immediately after successful OAuth

### 2. Web OAuth Flow

The web OAuth flow:

1. Uses Better Auth's built-in OAuth handling
2. Redirects to `/auth-callback` after successful authentication
3. The `auth-callback.tsx` component handles navigation based on `needsProfileCompletion`

### 3. Profile Completion

When users complete their profile:

1. The `ProfileCompletionFlow` component calls `trpc.auth.updateProfile`
2. The backend sets `needsProfileCompletion` to `false` when a role is selected
3. After successful update, users are redirected to the home screen

## Google OAuth Configuration

### Client ID Details
- **Client ID**: `59100460814-lvqieq6hjuhvhe0t3gue41cpbp499kr4.apps.googleusercontent.com`
- **Client Secret**: `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`

### Authorized Redirect URIs
1. **Web**: `http://localhost:8081/api/auth/callback/google`
2. **Mobile (Expo Proxy)**: `https://auth.expo.io/@anonymous/my-expo`
3. **Additional Mobile**: `https://auth.expo.io/@anonymous/my-expo/auth/callback/google`

### Authorized JavaScript Origins
- `http://localhost:8081`

## Testing Instructions

### Mobile Testing (iOS/Android)

1. **Start the development server**:
   ```bash
   bun start
   ```

2. **Test Google Sign-In**:
   - Tap "Continue with Google" button
   - Browser opens with Google OAuth
   - Sign in with Google account
   - App should redirect to profile completion if new user
   - Complete profile and submit
   - Should redirect to home screen

3. **Test returning user**:
   - Sign out
   - Sign in again with same Google account
   - Should go directly to home screen (no profile completion)

### Web Testing

1. **Start the web server**:
   ```bash
   bun run web
   ```

2. **Test Google Sign-In**:
   - Click "Continue with Google" button
   - Redirects to Google OAuth page
   - Sign in with Google account
   - Returns to `/auth-callback`
   - Redirects to profile completion if new user
   - Complete profile and submit
   - Should redirect to home screen

## Code Structure

### Key Components

1. **`GoogleSignInButton.tsx`**:
   - Handles both web and mobile OAuth flows
   - Updates auth store after successful authentication
   - Navigates based on `needsProfileCompletion`

2. **`google-mobile-callback+api.ts`**:
   - Exchanges OAuth code for tokens
   - Creates/updates user in database
   - Returns user data with `needsProfileCompletion` flag

3. **`ProfileCompletionFlow.tsx`**:
   - Collects additional user information
   - Updates user profile via tRPC
   - Navigates to home after completion

4. **`auth-callback.tsx`**:
   - Handles web OAuth callback
   - Checks authentication status
   - Redirects based on profile completion needs

## Environment Variables

Ensure these are set in your `.env` file:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=59100460814-lvqieq6hjuhvhe0t3gue41cpbp499kr4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Better Auth
BETTER_AUTH_BASE_URL=http://localhost:8081/api/auth
BETTER_AUTH_URL=http://localhost:8081
```

## Common Issues

1. **"redirect_uri_mismatch" error**:
   - Ensure all redirect URIs are added in Google Console
   - Wait 5-10 minutes after adding new URIs

2. **Profile completion not triggered**:
   - Check that new users have `needsProfileCompletion: true` in database
   - Verify the flag is returned in OAuth response

3. **Navigation not working**:
   - Ensure auth store is updated before navigation
   - Check that router is properly imported from expo-router

## Security Considerations

1. **PKCE Implementation**: Mobile OAuth uses PKCE for added security
2. **Secure Token Storage**: Tokens are stored in Expo SecureStore on mobile
3. **Session Management**: Sessions are managed by Better Auth with proper expiration