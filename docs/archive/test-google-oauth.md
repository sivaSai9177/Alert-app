# Testing Google OAuth with Better Auth

## Quick Test Steps

### 1. Start the Development Server
```bash
npm start
```

### 2. Test on Web
- Press `w` to open in web browser
- Navigate to the login screen
- Click "Continue with Google"
- You should be redirected to Google's OAuth page
- After authorization, you should be logged in

### 3. Test on Mobile (iOS/Android)
- Press `i` for iOS or `a` for Android
- Navigate to the login screen
- Click "Continue with Google"
- A web browser should open with Google's OAuth page
- After authorization, you should be redirected back to the app
- Check that you're logged in

## Expected Console Logs

### Successful Flow:
```
[GoogleSignInButton] Starting Google sign-in...
[GoogleSignInButton] Platform: ios/android
[GoogleSignInButton] OAuth request initiated
[GoogleSignInButton] Sign in successful
[AUTH PROVIDER] Session update: { hasSession: true, hasError: false, isPending: false }
```

### Common Issues:

1. **"Access blocked" error**: 
   - Make sure you're using the web OAuth client ID for development
   - Check that redirect URIs are properly configured in Google Console

2. **Session not updating after OAuth**:
   - Check that the Expo plugin is properly configured
   - Verify the app scheme matches in all places

3. **Redirect not working on mobile**:
   - Ensure deep linking is set up correctly
   - Check that `expostarter://` scheme is registered

## Debug Information

The implementation includes extensive logging. Check the console for:
- OAuth URL being generated
- Callback URL received
- Session updates
- Any error messages

## Next Steps

If OAuth is working:
1. Test sign out functionality
2. Verify session persistence across app restarts
3. Test error scenarios (cancelled auth, network errors)
4. Deploy and test with production OAuth clients