/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TRPCProvider } from '@/lib/trpc';
import SignupScreen from '@/app/(auth)/signup';

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    updateAuth: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
  }),
}));

jest.mock('@/lib/core/alert', () => ({
  showErrorAlert: jest.fn(),
  showSuccessAlert: jest.fn(),
}));

jest.mock('@/lib/trpc', () => ({
  api: {
    auth: {
      signUp: {
        useMutation: () => ({
          mutateAsync: jest.fn().mockResolvedValue({
            success: true,
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
          }),
          isPending: false,
        }),
      },
    },
  },
  TRPCProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock router
jest.mock('expo-router', () => ({
  Link: ({ children, href, asChild }: any) => {
    if (asChild) {
      return React.cloneElement(children, { href });
    }
    return <div data-href={href}>{children}</div>;
  },
}));

// Mock components
jest.mock('@/components/GoogleSignInButton', () => ({
  GoogleSignInButton: () => <div data-testid="google-signin-button">Continue with Google</div>,
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

describe('Auth Flow Improvements Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const renderSignupScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TRPCProvider>
          <SignupScreen />
        </TRPCProvider>
      </QueryClientProvider>
    );
  };

  describe('Role-Based Organization Flow', () => {
    it('should show no organization field for guest users', async () => {
      const { getByText, queryByLabelText } = renderSignupScreen();
      
      // Select guest role
      const guestOption = getByText('Guest');
      fireEvent.press(guestOption);
      
      await waitFor(() => {
        // Should not show organization fields
        expect(queryByLabelText(/organization/i)).toBeNull();
      });
    });

    it('should show optional organization code for regular users', async () => {
      const { getByText, getByLabelText } = renderSignupScreen();
      
      // Select user role (default)
      const userOption = getByText('Individual User');
      fireEvent.press(userOption);
      
      await waitFor(() => {
        // Should show optional organization code
        expect(getByLabelText(/organization code.*optional/i)).toBeTruthy();
      });
    });

    it('should show organization creation for managers/admins', async () => {
      const { getByText, getByLabelText } = renderSignupScreen();
      
      // Select manager role
      const managerOption = getByText('Team Manager');
      fireEvent.press(managerOption);
      
      await waitFor(() => {
        // Should show organization name field
        expect(getByLabelText(/organization name/i)).toBeTruthy();
      });
    });
  });

  describe('Form Validation and Button State', () => {
    it('should keep button disabled until all required fields are filled', async () => {
      const { getByLabelText, getByRole, getByText } = renderSignupScreen();
      
      const submitButton = getByRole('button', { name: /create account/i });
      expect(submitButton.props.disabled).toBe(true);
      
      // Fill required fields
      fireEvent.changeText(getByLabelText(/full name/i), 'John Doe');
      fireEvent.changeText(getByLabelText(/email/i), 'john@example.com');
      fireEvent.changeText(getByLabelText(/^password$/i), 'SecurePass123!');
      fireEvent.changeText(getByLabelText(/confirm password/i), 'SecurePass123!');
      
      // Accept terms and privacy
      const termsCheckbox = getByText(/terms of service/i).closest('TouchableOpacity');
      const privacyCheckbox = getByText(/privacy policy/i).closest('TouchableOpacity');
      
      fireEvent.press(termsCheckbox);
      fireEvent.press(privacyCheckbox);
      
      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(false);
      });
    });

    it('should enable button when switching roles and form is valid', async () => {
      const { getByLabelText, getByRole, getByText } = renderSignupScreen();
      
      // Fill all fields first
      fireEvent.changeText(getByLabelText(/full name/i), 'Jane Doe');
      fireEvent.changeText(getByLabelText(/email/i), 'jane@example.com');
      fireEvent.changeText(getByLabelText(/^password$/i), 'SecurePass123!');
      fireEvent.changeText(getByLabelText(/confirm password/i), 'SecurePass123!');
      
      // Accept terms
      const termsCheckbox = getByText(/terms of service/i).closest('TouchableOpacity');
      const privacyCheckbox = getByText(/privacy policy/i).closest('TouchableOpacity');
      fireEvent.press(termsCheckbox);
      fireEvent.press(privacyCheckbox);
      
      // Switch to manager role
      const managerOption = getByText('Team Manager');
      fireEvent.press(managerOption);
      
      // Fill organization name
      await waitFor(() => {
        const orgNameField = getByLabelText(/organization name/i);
        fireEvent.changeText(orgNameField, 'Test Company');
      });
      
      const submitButton = getByRole('button', { name: /create account/i });
      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(false);
      });
    });
  });

  describe('Input Field Improvements', () => {
    it('should show proper validation states for inputs', async () => {
      const { getByLabelText } = renderSignupScreen();
      
      const emailInput = getByLabelText(/email/i);
      
      // Test invalid email
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        // Should show error styling (border color change)
        expect(emailInput.props.style).toMatchObject(
          expect.objectContaining({
            borderColor: expect.stringContaining('#ef4444') // Error red
          })
        );
      });
      
      // Test valid email
      fireEvent.changeText(emailInput, 'valid@example.com');
      
      await waitFor(() => {
        // Should show normal/success styling
        expect(emailInput.props.style).not.toMatchObject(
          expect.objectContaining({
            borderColor: expect.stringContaining('#ef4444')
          })
        );
      });
    });

    it('should show password strength indicators', async () => {
      const { getByLabelText, getByText } = renderSignupScreen();
      
      const passwordInput = getByLabelText(/^password$/i);
      
      // Enter weak password
      fireEvent.changeText(passwordInput, 'weak');
      
      await waitFor(() => {
        expect(getByText(/12\+ characters/i)).toBeTruthy();
        expect(getByText(/uppercase/i)).toBeTruthy();
        expect(getByText(/lowercase/i)).toBeTruthy();
        expect(getByText(/number/i)).toBeTruthy();
        expect(getByText(/special/i)).toBeTruthy();
      });
    });
  });

  describe('Platform-Aware Components', () => {
    it('should render role selector cards properly', async () => {
      const { getByText } = renderSignupScreen();
      
      // Check all role options are present
      expect(getByText('Guest')).toBeTruthy();
      expect(getByText('Individual User')).toBeTruthy();
      expect(getByText('Team Manager')).toBeTruthy();
      expect(getByText('Organization Admin')).toBeTruthy();
      
      // Check descriptions are shown
      expect(getByText(/browse and explore/i)).toBeTruthy();
      expect(getByText(/personal workspace/i)).toBeTruthy();
      expect(getByText(/manage team members/i)).toBeTruthy();
      expect(getByText(/full organization management/i)).toBeTruthy();
    });

    it('should show proper visual feedback for role selection', async () => {
      const { getByText } = renderSignupScreen();
      
      const userRole = getByText('Individual User');
      fireEvent.press(userRole);
      
      await waitFor(() => {
        // Should show selection indicator (checkmark)
        const parentCard = userRole.closest('TouchableOpacity');
        expect(parentCard?.props.children.props.children.props.children[1].props.children[0].props.children[1]).toBeTruthy();
      });
    });
  });

  describe('Organization ID UUID Improvements', () => {
    it('should accept organization codes instead of UUIDs for users', async () => {
      const { getByText, getByLabelText } = renderSignupScreen();
      
      // Select user role
      const userOption = getByText('Individual User');
      fireEvent.press(userOption);
      
      await waitFor(() => {
        const orgCodeField = getByLabelText(/organization code/i);
        
        // Should accept simple code format
        fireEvent.changeText(orgCodeField, 'ACME2024');
        expect(orgCodeField.props.value).toBe('ACME2024');
        
        // Should auto-uppercase
        fireEvent.changeText(orgCodeField, 'test123');
        expect(orgCodeField.props.value).toBe('TEST123');
      });
    });

    it('should show organization creation flow for managers', async () => {
      const { getByText, getByLabelText } = renderSignupScreen();
      
      const managerOption = getByText('Team Manager');
      fireEvent.press(managerOption);
      
      await waitFor(() => {
        // Should show organization name field instead of code
        expect(getByLabelText(/organization name/i)).toBeTruthy();
        expect(getByText(/creating new organization/i)).toBeTruthy();
        expect(getByText(/unique organization code will be generated/i)).toBeTruthy();
      });
    });
  });

  describe('Error Handling and User Feedback', () => {
    it('should show validation errors for required fields', async () => {
      const { getByLabelText, getByRole, getByText } = renderSignupScreen();
      
      // Try to submit empty form
      const submitButton = getByRole('button', { name: /create account/i });
      
      // Button should be disabled with empty form
      expect(submitButton.props.disabled).toBe(true);
      
      // Fill only some fields to trigger partial validation
      fireEvent.changeText(getByLabelText(/full name/i), 'A'); // Too short
      
      await waitFor(() => {
        // Should show validation error
        expect(getByText(/name must be at least 2 characters/i)).toBeTruthy();
      });
    });

    it('should provide helpful hints for organization fields', async () => {
      const { getByText } = renderSignupScreen();
      
      // Check user role hint
      const userOption = getByText('Individual User');
      fireEvent.press(userOption);
      
      await waitFor(() => {
        expect(getByText(/don't have a code\? no problem/i)).toBeTruthy();
      });
      
      // Check manager role hint
      const managerOption = getByText('Team Manager');
      fireEvent.press(managerOption);
      
      await waitFor(() => {
        expect(getByText(/you'll be able to invite team members/i)).toBeTruthy();
      });
    });
  });
});