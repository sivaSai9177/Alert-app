# Email Validation Implementation

## Overview

The application implements real-time email validation during login to provide immediate feedback about whether an email exists in the system. This feature enhances user experience by preventing unnecessary password entry attempts for non-existent accounts.

## Features

- ✅ Real-time email existence checking
- ✅ 500ms debounce to reduce API calls
- ✅ Zod-based email format validation
- ✅ Visual feedback with success/error states
- ✅ Loading indicators during validation
- ✅ Caching to prevent redundant checks

## Technical Implementation

### Frontend (Login Screen)

```typescript
// Email validation using Zod
const emailSchema = z.string().email();
const [shouldCheckEmail, setShouldCheckEmail] = React.useState(false);
const [hasInteractedWithEmail, setHasInteractedWithEmail] = React.useState(false);

// Validate email with Zod
const isValidEmail = React.useMemo(() => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}, [email]);

// Debounced email check with refs to avoid closure issues
const emailRef = React.useRef(email);
const isValidEmailRef = React.useRef(isValidEmail);

const debouncedEmailCheck = React.useMemo(
  () => debounce(() => {
    const currentEmail = emailRef.current;
    const currentIsValid = isValidEmailRef.current;
    
    if (currentIsValid) {
      setShouldCheckEmail(true);
    }
  }, 500), // 500ms debounce delay
  []
);
```

### API Endpoint (tRPC)

```typescript
// Check if email exists in database
checkEmailExists: publicProcedure
  .input(z.object({
    email: z.string().email(),
  }))
  .output(z.object({
    exists: z.boolean(),
    isAvailable: z.boolean(),
  }))
  .query(async ({ input }) => {
    const [existingUser] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, input.email.toLowerCase()))
      .limit(1);
    
    return {
      exists: !!existingUser,
      isAvailable: !existingUser,
    };
  }),
```

## User Experience Flow

1. User starts typing email address
2. Email format is validated using Zod schema
3. Once valid email format is detected:
   - 500ms debounce timer starts
   - After timer expires, API call is made
4. During API call:
   - "Checking..." text appears
   - Input remains interactive
5. After API response:
   - ✅ Green border if email exists
   - ❌ Red border if email doesn't exist
   - Appropriate message displayed below input

## Visual States

### Input States
- **Default**: Standard border color
- **Checking**: Shows "Checking..." text in right element
- **Success**: Green border when email exists
- **Error**: Red border when email doesn't exist or format is invalid

### Messages
- **Email found**: "Email found - please enter your password"
- **Email not found**: "Email not found - please check or sign up"

## Performance Optimizations

1. **Debouncing**: 500ms delay prevents excessive API calls while typing
2. **Caching**: TanStack Query caches results for 30 seconds
3. **Ref Usage**: Prevents stale closure issues in debounced function
4. **Conditional Query**: Query only executes when email is valid

## Error Handling

- Network errors are caught and logged
- Invalid email formats are validated client-side
- API errors return safe defaults
- User-friendly error messages displayed

## Configuration

```typescript
// Query configuration
{
  enabled: shouldQueryEmail,
  retry: false,
  staleTime: 30000, // Cache for 30 seconds
  gcTime: 60000, // Keep in cache for 1 minute
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
}
```

## Usage Example

```tsx
<Input
  label="Email"
  placeholder="your@email.com"
  error={form.formState.errors.email?.message}
  success={hasInteractedWithEmail && !form.formState.errors.email && !!email && emailCheckData?.exists === true}
  value={form.watch("email")}
  onChangeText={(value) => {
    form.setValue("email", value);
    setHasInteractedWithEmail(true);
  }}
  rightElement={
    form.formState.touchedFields.email && form.watch("email") ? (
      isCheckingEmail ? (
        <Text size="xs" colorTheme="mutedForeground">Checking...</Text>
      ) : emailCheckData ? (
        <ValidationIcon 
          status={
            form.formState.errors.email ? 'error' : 
            emailCheckData.exists ? 'success' : 
            'error'
          } 
        />
      ) : null
    ) : null
  }
/>
```

## Future Enhancements

- [ ] Add email suggestions for common typos
- [ ] Implement gravatar integration for existing users
- [ ] Add password strength indicator
- [ ] Support for checking username availability
- [ ] Rate limiting for security

## Related Documentation

- [Authentication Flow](./AUTH_FLOW_IMPROVEMENTS_SUMMARY.md)
- [Form Validation](./FORM_VALIDATION_IMPROVEMENTS.md)
- [Universal Input Component](./components/universal/Input.tsx)