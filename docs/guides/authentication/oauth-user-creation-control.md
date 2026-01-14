# OAuth User Creation Control in Better Auth

This guide explains how to control whether new users are automatically created when they sign in with OAuth providers (like Google) in Better Auth.

## Default Behavior

By default, Better Auth automatically creates a new user account when someone signs in with an OAuth provider for the first time. This is convenient for most applications but may not be suitable for all use cases.

## Preventing Automatic User Creation

To prevent automatic user creation during OAuth sign-in, you can use the `signIn.before` callback in your Better Auth configuration. This callback is called before the sign-in process completes and gives you the opportunity to:

1. Reject the sign-in attempt
2. Modify user data
3. Add custom logic

### Implementation Options

#### Option 1: Throw an Error (Recommended)

This approach provides clear feedback to the user about why they can't sign in:

```typescript
// In lib/auth/auth.ts
export const auth = betterAuth({
  // ... other config
  callbacks: {
    signIn: {
      async before({ user, isNewUser }) {
        // Prevent new users from being created via OAuth
        if (isNewUser) {
          throw new Error("User does not exist. Please sign up first.");
        }
        // Existing users can sign in normally
      },
    },
  },
});
```

#### Option 2: Return False

This approach silently prevents the sign-in without throwing an error:

```typescript
// In lib/auth/auth.ts
export const auth = betterAuth({
  // ... other config
  callbacks: {
    signIn: {
      async before({ user, isNewUser }) {
        // Prevent new users from being created via OAuth
        if (isNewUser) {
          return false; // Sign-in will be cancelled
        }
        // Existing users can sign in normally
      },
    },
  },
});
```

#### Option 3: Conditional Logic

You can also implement more complex logic based on your requirements:

```typescript
// In lib/auth/auth.ts
export const auth = betterAuth({
  // ... other config
  callbacks: {
    signIn: {
      async before({ user, isNewUser, provider }) {
        // Only allow OAuth sign-ups from specific domains
        if (isNewUser && provider === 'google') {
          const emailDomain = user.email?.split('@')[1];
          const allowedDomains = ['company.com', 'partner.com'];
          
          if (!allowedDomains.includes(emailDomain)) {
            throw new Error("Sign-ups are restricted to authorized domains.");
          }
        }
      },
    },
  },
});
```

## Current Implementation

The current implementation in this project (Option 2) allows OAuth user creation but requires profile completion:

```typescript
if (isNewUser) {
  // Set a temporary role that indicates profile completion is needed
  user.role = 'guest'; // Temporary role until they complete profile
  // New OAuth users need to complete their profile
  user.needsProfileCompletion = true;
}
```

This approach:
- Allows users to sign in with OAuth
- Creates their account automatically
- Redirects them to complete their profile before accessing the app
- Assigns a temporary 'guest' role until profile completion

## Handling Errors in the Frontend

When preventing OAuth sign-ups, handle the error appropriately in your frontend:

```typescript
// In your login component
const handleGoogleSignIn = async () => {
  try {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/auth-callback',
    });
  } catch (error) {
    if (error.message.includes("User does not exist")) {
      // Show a message directing users to sign up first
      alert("Please sign up for an account before using Google sign-in.");
      // Optionally redirect to signup page
      router.push('/register');
    } else {
      // Handle other errors
      console.error("Sign-in failed:", error);
    }
  }
};
```

## Creating a Separate Registration Flow

If you prevent automatic OAuth user creation, you'll need a separate registration flow:

```typescript
// In your registration component
const handleGoogleSignUp = async () => {
  try {
    // First, create the user account with email/password
    await authClient.signUp.email({
      email: userEmail,
      password: temporaryPassword,
      name: userName,
      // ... other fields
    });
    
    // Then link their Google account
    await authClient.linkAccount.google({
      callbackURL: '/auth-callback',
    });
  } catch (error) {
    console.error("Registration failed:", error);
  }
};
```

## Best Practices

1. **Clear User Communication**: If preventing OAuth sign-ups, clearly communicate this to users
2. **Consistent Experience**: Ensure the restriction applies consistently across all OAuth providers
3. **Fallback Options**: Provide alternative sign-up methods if OAuth creation is disabled
4. **Error Handling**: Implement proper error handling and user-friendly messages
5. **Logging**: Log authentication attempts for security monitoring

## Security Considerations

Preventing automatic OAuth user creation can enhance security by:
- Requiring explicit user registration
- Allowing for additional verification steps
- Preventing unauthorized access from unknown OAuth accounts
- Enabling pre-approval workflows for new users

However, it may also:
- Reduce user convenience
- Increase friction in the onboarding process
- Require additional development effort

Choose the approach that best fits your application's security requirements and user experience goals.