import React from "react";
import { TouchableOpacity, Pressable, Platform, KeyboardAvoidingView, Dimensions, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import debounce from 'lodash.debounce';
import { useAuth } from "@/hooks/useAuth";
import { toAppUser } from "@/lib/stores/auth-store";
import { api } from "@/lib/trpc";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { showErrorAlert, showSuccessAlert } from "@/lib/core/alert";
import { log } from "@/lib/core/logger";
import { generateUUID } from "@/lib/core/crypto";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { RoleSelector, UserRole, roleOptions } from "@/components/RoleSelector";
import { OrganizationField } from "@/components/OrganizationField";
import { useTheme } from "@/lib/theme/theme-provider";
import { ValidationIcon } from "@/components/ui/ValidationIcon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Box } from "@/components/universal/Box";
import { Text, Heading1, Caption } from "@/components/universal/Text";
import { VStack, HStack } from "@/components/universal/Stack";
import { Button } from "@/components/universal/Button";
import { Input } from "@/components/universal/Input";
import { Card, CardContent } from "@/components/universal/Card";
import { Checkbox } from "@/components/universal/Checkbox";
import { Container } from "@/components/universal/Container";
import { ScrollContainer } from "@/components/universal/ScrollContainer";
import { UniversalLink, TextLink } from "@/components/universal/Link";
import { BorderRadius, SpacingScale } from "@/lib/design-system";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Social button icons
const SocialIcons = {
  meta: (
    <Text size="xl" colorTheme="foreground" weight="bold">f</Text>
  ),
  x: (
    <Text size="xl" colorTheme="foreground" weight="bold">𝕏</Text>
  ),
};

export default function SignupScreenV2() {
  const { updateAuth, setLoading, setError } = useAuth();
  const theme = useTheme();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [screenWidth, setScreenWidth] = React.useState(SCREEN_WIDTH);
  const [checkingEmail, setCheckingEmail] = React.useState(false);
  const [hasInteractedWithEmail, setHasInteractedWithEmail] = React.useState(false);
  const [shouldCheckEmail, setShouldCheckEmail] = React.useState(false);
  
  // Update screen width on resize (web)
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => {
        setScreenWidth(Dimensions.get('window').width);
      };
      
      const subscription = Dimensions.addEventListener('change', handleResize);
      return () => subscription?.remove();
    }
  }, []);
  
  const isTabletOrDesktop = screenWidth >= 768;

  // Use tRPC mutation for sign up
  const signUpMutation = api.auth.signUp.useMutation({
    onSuccess: (data: any) => {
      log.auth.signup('Sign up successful via tRPC', { userId: data.user?.id });
      setLoading(false);
      if (data.user) {
        const formRole = form.getValues('role') as 'admin' | 'manager' | 'user' | 'guest';
        const appUser = toAppUser(data.user, formRole || 'user');
        if (!appUser.organizationId && form.getValues('organizationId')) {
          appUser.organizationId = form.getValues('organizationId');
        }

        const session = {
          id: generateUUID(),
          token: 'new-user-session',
          userId: appUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        updateAuth(appUser, session);
        showSuccessAlert("Account Created", "Welcome to the app!");
      }
    },
    onError: (error) => {
      log.auth.error('Sign up failed', error);
      setLoading(false);
      setError(error.message);
      showErrorAlert("Signup Failed", error.message || "Failed to create account. Please try again.");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      organizationCode: undefined,
      organizationName: undefined,
      organizationId: undefined,
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  React.useEffect(() => {
    form.setValue('role', selectedRole);
    form.trigger('role');
  }, [selectedRole]);

  const acceptTerms = form.watch('acceptTerms');
  const acceptPrivacy = form.watch('acceptPrivacy');
  const formValues = form.watch();
  const email = form.watch('email');
  
  // Email validation using Zod
  const emailSchema = z.string().email();
  
  // Validate email with Zod
  const isValidEmail = React.useMemo(() => {
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  }, [email]);
  
  // Only enable query when all conditions are met
  const enableQuery = shouldCheckEmail && isValidEmail && hasInteractedWithEmail;
  
  // Use the query hook to check if email exists
  const checkEmailQuery = api.auth.checkEmailExists.useQuery(
    { email: enableQuery ? email : 'noreply@example.com' },
    {
      enabled: enableQuery,
      retry: false,
      staleTime: 30000,
      gcTime: 60000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );
  
  // Debounced email check
  const emailRef = React.useRef(email);
  const isValidEmailRef = React.useRef(isValidEmail);
  
  React.useEffect(() => {
    emailRef.current = email;
    isValidEmailRef.current = isValidEmail;
  }, [email, isValidEmail]);
  
  const debouncedEmailCheck = React.useMemo(
    () => debounce(() => {
      const currentEmail = emailRef.current;
      const currentIsValid = isValidEmailRef.current;
      
      if (currentIsValid) {
        setShouldCheckEmail(true);
      }
    }, 500),
    []
  );
  
  // Trigger email check when email changes
  React.useEffect(() => {
    setShouldCheckEmail(false);
    
    if (hasInteractedWithEmail && isValidEmail && email.length > 0) {
      debouncedEmailCheck();
    } else {
      debouncedEmailCheck.cancel();
    }
    
    return () => {
      debouncedEmailCheck.cancel();
    };
  }, [email, isValidEmail, hasInteractedWithEmail, debouncedEmailCheck]);
  
  // For UI consistency
  const emailCheckData = enableQuery && checkEmailQuery.data ? checkEmailQuery.data as { exists: boolean; isAvailable: boolean } : null;
  const isCheckingEmail = enableQuery && checkEmailQuery.isFetching;
  
  const hasValidValues = React.useMemo(() => {
    const { name, email, password, confirmPassword, role } = formValues;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasName = name && name.length >= 2;
    const hasValidEmail = email && emailRegex.test(email);
    const hasPassword = password && password.length >= 12;
    const passwordsMatch = password === confirmPassword;
    const hasRole = !!role;
    const emailNotTaken = !emailCheckData?.exists; // Email should not already exist
    
    return hasName && hasValidEmail && hasPassword && passwordsMatch && hasRole && acceptTerms && acceptPrivacy && emailNotTaken;
  }, [formValues, acceptTerms, acceptPrivacy, emailCheckData]);

  const onSubmit = async (data: SignUpInput) => {
    log.auth.signup('Starting signup attempt', { email: data.email });
    
    if (!form.formState.isValid) {
      log.auth.debug('Form has validation errors, preventing submission', { 
        errors: form.formState.errors 
      });
      showErrorAlert("Invalid Form", "Please fix the validation errors before submitting.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const submissionData: any = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        acceptTerms: data.acceptTerms,
        acceptPrivacy: data.acceptPrivacy,
        organizationId: data.organizationId || undefined,
      };

      if (data.role === 'user' && data.organizationCode) {
        submissionData.organizationCode = data.organizationCode;
      }
      
      if ((data.role === 'manager' || data.role === 'admin') && data.organizationName) {
        submissionData.organizationName = data.organizationName;
      }

      await signUpMutation.mutateAsync(submissionData);
      
    } catch (error: any) {
      log.auth.error('Signup error', error);
      setLoading(false);
      setError(error.message || "Failed to create account");
      form.setValue("password", "");
      form.setValue("confirmPassword", "");
    }
  };

  const handleSocialAuth = (provider: 'meta' | 'x') => {
    showErrorAlert("Coming Soon", `${provider === 'meta' ? 'Meta' : 'X'} signup will be available soon!`);
  };

  const cardContent = (
    <Card 
      shadow="xl"
      bgTheme="card"
      borderTheme="border"
      style={{
        width: '100%',
        maxWidth: isTabletOrDesktop ? 900 : 400,
        ...(Platform.OS === 'web' && {
          maxHeight: isTabletOrDesktop ? '90vh' : '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        } as any),
      }}
    >
      {/* Web sticky header */}
      {Platform.OS === 'web' && (
        <Box 
          bgTheme="card" 
          borderBottomWidth={1} 
          borderTheme="border"
          px={isTabletOrDesktop ? 8 : 6}
          py={4}
          style={{
            position: 'sticky' as any,
            top: 0,
            zIndex: 10,
          }}
        >
          <Box alignItems="center">
            <Heading1>Create Account</Heading1>
            <Text size="sm" colorTheme="mutedForeground">
              Get started with your new account
            </Text>
          </Box>
        </Box>
      )}
      
      {/* Scrollable content */}
      <ScrollView
        style={{ 
          flex: 1,
        }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Box pt={isTabletOrDesktop ? 6 : 4} px={isTabletOrDesktop ? 8 : 6} pb={isTabletOrDesktop ? 4 : 3}>
          <VStack spacing={4}>
            {/* Form content without header */}
            <Box>
              {/* Row 1: Name and Email */}
              <HStack spacing={3} mb={3} flexDirection={isTabletOrDesktop ? "row" : "column"}>
                {/* Name Field */}
                <Box flex={1}>
                  <VStack spacing={2}>
                    <Text size="sm" weight="medium" colorTheme="foreground">
                      Full Name
                    </Text>
                    <Input
                      placeholder="John Doe"
                      autoComplete="name"
                      error={form.formState.errors.name?.message}
                      success={form.formState.touchedFields.name && !form.formState.errors.name && !!form.watch('name')}
                      value={form.watch('name')}
                      onChangeText={(text) => {
                        form.setValue('name', text);
                        if (form.formState.touchedFields.name) {
                          form.trigger('name');
                        }
                      }}
                      onBlur={() => form.trigger('name')}
                      leftElement={
                        <IconSymbol name="person.fill" size={20} color={theme.mutedForeground} />
                      }
                      rightElement={
                        form.formState.touchedFields.name && form.watch('name') ? (
                          <ValidationIcon status={form.formState.errors.name ? 'error' : 'success'} />
                        ) : null
                      }
                    />
                    {/* Consistent spacing for error messages */}
                    <Box height={20} />
                  </VStack>
                </Box>

                {/* Email Field */}
                <Box flex={1}>
                  <VStack spacing={2}>
                    <Text size="sm" weight="medium" colorTheme="foreground">
                      Email
                    </Text>
                    <Input
                      placeholder="user@example.com"
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      error={form.formState.errors.email?.message || (emailCheckData?.exists && "Email already exists")}
                      success={form.formState.touchedFields.email && !form.formState.errors.email && !!form.watch('email') && emailCheckData?.exists === false}
                      value={form.watch('email')}
                      onChangeText={(text) => {
                        form.setValue('email', text);
                        setHasInteractedWithEmail(true);
                        if (form.formState.touchedFields.email) {
                          form.trigger('email');
                        }
                      }}
                      onBlur={() => {
                        setHasInteractedWithEmail(true);
                        form.trigger('email');
                      }}
                      leftElement={
                        <IconSymbol name="envelope.fill" size={20} color={theme.mutedForeground} />
                      }
                      rightElement={
                        form.formState.touchedFields.email && form.watch('email') ? (
                          isCheckingEmail ? (
                            <Text size="xs" colorTheme="mutedForeground">Checking...</Text>
                          ) : emailCheckData ? (
                            <ValidationIcon 
                              status={
                                form.formState.errors.email ? 'error' : 
                                emailCheckData?.exists ? 'error' : 
                                'success'
                              } 
                            />
                          ) : null
                        ) : null
                      }
                    />
                    {/* Email validation message with consistent height */}
                    <Box height={20}>
                      {form.formState.touchedFields.email && !form.formState.errors.email && emailCheckData && (
                        <Text size="sm" colorTheme={emailCheckData.exists ? "destructive" : "success"}>
                          {emailCheckData.exists ? (
                            <>
                              Email already exists.{" "}
                              <TextLink 
                                href="/(auth)/login"
                                size="sm"
                                variant="primary"
                                style={{ display: 'inline' as any }}
                              >
                                Login to your account
                              </TextLink>
                            </>
                          ) : "Email is available"}
                        </Text>
                      )}
                    </Box>
                  </VStack>
                </Box>
              </HStack>
            </Box>
            
            {/* Row 2: Role Selection in 2x2 Grid */}
            <Box mb={3}>
              <Text size="sm" weight="medium" colorTheme="foreground" mb={2}>
                Select Your Role
              </Text>
              
              {/* Custom 2x2 Grid for Role Selection */}
              <VStack spacing={3}>
                {/* First Row */}
                <HStack spacing={3} flexDirection={isTabletOrDesktop ? "row" : "column"}>
                  {roleOptions.slice(0, 2).map((role) => {
                    const isSelected = selectedRole === role.value;
                    return (
                      <TouchableOpacity
                        key={role.value}
                        style={{ flex: 1 }}
                        onPress={() => {
                          setSelectedRole(role.value);
                          form.setValue('role', role.value);
                          if (role.value === 'guest') {
                            form.setValue('organizationCode', undefined);
                            form.setValue('organizationName', undefined);
                          } else if (role.value === 'user') {
                            form.setValue('organizationCode', '');
                            form.setValue('organizationName', undefined);
                          } else if (role.value === 'manager' || role.value === 'admin') {
                            form.setValue('organizationCode', undefined);
                            form.setValue('organizationName', '');
                          }
                          setTimeout(() => form.trigger(), 0);
                        }}
                        activeOpacity={0.7}
                      >
                        <Card 
                          borderWidth={2}
                          borderTheme="border"
                          bgTheme={isSelected ? 'accent' : 'card'}
                          style={{
                            minHeight: isTabletOrDesktop ? 120 : 100,
                            borderColor: isSelected ? theme.primary : theme.border,
                          }}
                        >
                          <CardContent p={4 as SpacingScale}>
                            <VStack spacing={2}>
                              <HStack justifyContent="space-between" alignItems="center">
                                <Text size="xl">{role.icon}</Text>
                                {isSelected && (
                                  <Box 
                                    width={20}
                                    height={20}
                                    bgTheme="primary"
                                    rounded={'full' as BorderRadius}
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Text size="xs" weight="bold" colorTheme="primaryForeground">✓</Text>
                                  </Box>
                                )}
                              </HStack>
                              <Text weight="semibold" size="sm" colorTheme="foreground">
                                {role.label}
                              </Text>
                              <Text size="xs" colorTheme="mutedForeground" numberOfLines={2}>
                                {role.description}
                              </Text>
                            </VStack>
                          </CardContent>
                        </Card>
                      </TouchableOpacity>
                    );
                  })}
                </HStack>

                {/* Second Row */}
                <HStack spacing={3} flexDirection={isTabletOrDesktop ? "row" : "column"}>
                  {roleOptions.slice(2, 4).map((role) => {
                    const isSelected = selectedRole === role.value;
                    return (
                      <TouchableOpacity
                        key={role.value}
                        style={{ flex: 1 }}
                        onPress={() => {
                          setSelectedRole(role.value);
                          form.setValue('role', role.value);
                          if (role.value === 'guest') {
                            form.setValue('organizationCode', undefined);
                            form.setValue('organizationName', undefined);
                          } else if (role.value === 'user') {
                            form.setValue('organizationCode', '');
                            form.setValue('organizationName', undefined);
                          } else if (role.value === 'manager' || role.value === 'admin') {
                            form.setValue('organizationCode', undefined);
                            form.setValue('organizationName', '');
                          }
                          setTimeout(() => form.trigger(), 0);
                        }}
                        activeOpacity={0.7}
                      >
                        <Card 
                          borderWidth={2}
                          borderTheme="border"
                          bgTheme={isSelected ? 'accent' : 'card'}
                          style={{
                            minHeight: isTabletOrDesktop ? 120 : 100,
                            borderColor: isSelected ? theme.primary : theme.border,
                          }}
                        >
                          <CardContent p={4 as SpacingScale}>
                            <VStack spacing={2}>
                              <HStack justifyContent="space-between" alignItems="center">
                                <Text size="xl">{role.icon}</Text>
                                {isSelected && (
                                  <Box 
                                    width={20}
                                    height={20}
                                    bgTheme="primary"
                                    rounded={'full' as BorderRadius}
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Text size="xs" weight="bold" colorTheme="primaryForeground">✓</Text>
                                  </Box>
                                )}
                              </HStack>
                              <Text weight="semibold" size="sm" colorTheme="foreground">
                                {role.label}
                              </Text>
                              <Text size="xs" colorTheme="mutedForeground" numberOfLines={2}>
                                {role.description}
                              </Text>
                            </VStack>
                          </CardContent>
                        </Card>
                      </TouchableOpacity>
                    );
                  })}
                </HStack>
              </VStack>
              
              {/* Organization Field directly below role */}
              <Box mt={3}>
                <OrganizationField
                  form={form}
                  role={selectedRole}
                />
              </Box>
            </Box>

            {/* Row 3: Password and Confirm Password */}
            <HStack spacing={3} mb={3} flexDirection={isTabletOrDesktop ? "row" : "column"}>
              {/* Password Field */}
              <Box flex={1}>
                <Text size="sm" weight="medium" colorTheme="foreground" mb={2}>
                  Password
                </Text>
                <Input
                  placeholder="••••••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  error={form.formState.errors.password?.message}
                  success={form.formState.touchedFields.password && !form.formState.errors.password && !!form.watch('password')}
                  value={form.watch('password')}
                  onChangeText={(text) => {
                    form.setValue('password', text);
                    if (form.formState.touchedFields.password) {
                      form.trigger('password');
                    }
                  }}
                  onBlur={() => form.trigger('password')}
                  leftElement={
                    <IconSymbol name="lock.fill" size={20} color={theme.mutedForeground} />
                  }
                  rightElement={
                    <Box flexDirection="row" alignItems="center" gap={2}>
                      {form.formState.touchedFields.password && form.watch('password') && (
                        <ValidationIcon status={form.formState.errors.password ? 'error' : 'success'} />
                      )}
                      <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                        <IconSymbol 
                          name={showPassword ? 'eye.slash.fill' : 'eye.fill' as any} 
                          size={20} 
                          color={theme.mutedForeground}
                        />
                      </Pressable>
                    </Box>
                  }
                />
              </Box>

              {/* Confirm Password */}
              <Box flex={1}>
                <Text size="sm" weight="medium" colorTheme="foreground" mb={2}>
                  Confirm Password
                </Text>
                <Input
                  placeholder="••••••••••••"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  error={form.formState.errors.confirmPassword?.message}
                  success={form.formState.touchedFields.confirmPassword && !form.formState.errors.confirmPassword && !!form.watch('confirmPassword')}
                  value={form.watch('confirmPassword')}
                  onChangeText={(text) => {
                    form.setValue('confirmPassword', text);
                    if (form.formState.touchedFields.confirmPassword) {
                      form.trigger('confirmPassword');
                    }
                  }}
                  onBlur={() => form.trigger('confirmPassword')}
                  leftElement={
                    <IconSymbol name="lock.shield.fill" size={20} color={theme.mutedForeground} />
                  }
                  rightElement={
                    <Box flexDirection="row" alignItems="center" gap={2}>
                      {form.formState.touchedFields.confirmPassword && form.watch('confirmPassword') && (
                        <ValidationIcon status={form.formState.errors.confirmPassword ? 'error' : 'success'} />
                      )}
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                        <IconSymbol 
                          name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill' as any} 
                          size={20} 
                          color={theme.mutedForeground}
                        />
                      </Pressable>
                    </Box>
                  }
                />
              </Box>
            </HStack>

            {/* Password strength indicators */}
            {form.watch('password') && (
              <Box mb={3}>
                <HStack flexWrap="wrap" spacing={1}>
                  <Box 
                    px={2} 
                    py={1} 
                    rounded="sm"
                    bgTheme={(form.watch('password')?.length >= 12) ? 'accent' : 'destructive'}
                    style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                  >
                    <Text size="xs" colorTheme={(form.watch('password')?.length >= 12) ? 'accent' : 'destructive'}>
                      {(form.watch('password')?.length >= 12) ? '✓' : '✗'} 12+ chars
                    </Text>
                  </Box>
                  <Box 
                    px={2} 
                    py={1} 
                    rounded="sm"
                    bgTheme={/[A-Z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                    style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                  >
                    <Text size="xs" colorTheme={/[A-Z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                      {/[A-Z]/.test(form.watch('password') || '') ? '✓' : '✗'} Uppercase
                    </Text>
                  </Box>
                  <Box 
                    px={2} 
                    py={1} 
                    rounded="sm"
                    bgTheme={/[a-z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                    style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                  >
                    <Text size="xs" colorTheme={/[a-z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                      {/[a-z]/.test(form.watch('password') || '') ? '✓' : '✗'} Lowercase
                    </Text>
                  </Box>
                  <Box 
                    px={2} 
                    py={1} 
                    rounded="sm"
                    bgTheme={/\d/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                    style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                  >
                    <Text size="xs" colorTheme={/\d/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                      {/\d/.test(form.watch('password') || '') ? '✓' : '✗'} Number
                    </Text>
                  </Box>
                  <Box 
                    px={2} 
                    py={1} 
                    rounded="sm"
                    bgTheme={/[@$!%*?&]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                    style={{ opacity: 0.2, marginBottom: 4 }}
                  >
                    <Text size="xs" colorTheme={/[@$!%*?&]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                      {/[@$!%*?&]/.test(form.watch('password') || '') ? '✓' : '✗'} Special
                    </Text>
                  </Box>
                </HStack>
              </Box>
            )}

            {/* Terms and Privacy */}
            <VStack spacing={3} mb={2}>
              <HStack spacing={3} alignItems="flex-start">
                <Checkbox
                  checked={form.watch('acceptTerms')}
                  onCheckedChange={(checked) => {
                    form.setValue('acceptTerms', checked);
                    form.trigger('acceptTerms');
                  }}
                  style={{ marginTop: 2 }}
                />
                <Box flex={1}>
                  <Text size="sm" lineHeight="relaxed">
                    I accept the{" "}
                    <Text size="sm" weight="medium" colorTheme="primary">Terms of Service</Text>
                  </Text>
                  {form.formState.errors.acceptTerms && (
                    <Text size="sm" colorTheme="destructive" mt={1}>
                      {form.formState.errors.acceptTerms.message}
                    </Text>
                  )}
                </Box>
              </HStack>

              <HStack spacing={3} alignItems="flex-start">
                <Checkbox
                  checked={form.watch('acceptPrivacy')}
                  onCheckedChange={(checked) => {
                    form.setValue('acceptPrivacy', checked);
                    form.trigger('acceptPrivacy');
                  }}
                  style={{ marginTop: 2 }}
                />
                <Box flex={1}>
                  <Text size="sm" lineHeight="relaxed">
                    I accept the{" "}
                    <Text size="sm" weight="medium" colorTheme="primary">Privacy Policy</Text>
                  </Text>
                  {form.formState.errors.acceptPrivacy && (
                    <Text size="sm" colorTheme="destructive" mt={1}>
                      {form.formState.errors.acceptPrivacy.message}
                    </Text>
                  )}
                </Box>
              </HStack>
            </VStack>

            {/* Submit Button */}
            <Button
              size="lg"
              fullWidth
              isLoading={signUpMutation.isPending}
              isDisabled={!hasValidValues || signUpMutation.isPending}
              onPress={() => form.handleSubmit(onSubmit)()}
            >
              {signUpMutation.isPending ? "Creating account..." : "Create account"}
            </Button>

            {/* Divider */}
            <Box position="relative" my={3}>
              <Box 
                height={1} 
                bgTheme="muted" 
                position="absolute" 
                top={10} 
                left={0} 
                right={0} 
              />
              <Box alignItems="center">
                <Box bgTheme="card" px={2}>
                  <Caption colorTheme="mutedForeground">Or continue with</Caption>
                </Box>
              </Box>
            </Box>

            {/* Social Login Buttons */}
            <HStack spacing={3} justifyContent="space-between">
              <Box flex={1}>
                <GoogleSignInButton 
                  size="md"
                  variant="outline"
                  fullWidth
                  iconOnly
                  text=""
                  style={{ height: 44 }}
                />
              </Box>
              <Box flex={1}>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onPress={() => handleSocialAuth('meta')}
                  style={{ height: 44 }}
                >
                  {SocialIcons.meta}
                </Button>
              </Box>
              <Box flex={1}>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onPress={() => handleSocialAuth('x')}
                  style={{ height: 44 }}
                >
                  {SocialIcons.x}
                </Button>
              </Box>
            </HStack>

            {/* Sign in link */}
            <Box alignItems="center" pb={0}>
              <HStack spacing={1}>
                <Caption>Already have an account?</Caption>
                <TextLink 
                  href="/(auth)/login"
                  size="sm"
                  weight="medium"
                  variant="primary"
                >
                  Login
                </TextLink>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </ScrollView>
    </Card>
  );

  const isMobile = screenWidth < 768;

  // Mobile layout - no card, full screen
  if (isMobile) {
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Box flex={1} bgTheme="background">
            <VStack spacing={6}>
              
              {/* Form content directly without card wrapper */}
              <Box px={6} pt={4} pb={6}>
                <VStack spacing={4}>
                  {/* Row 1: Name and Email - stacked on mobile */}
                  <VStack spacing={3}>
                    {/* Name Field */}
                    <VStack spacing={2}>
                      <Text size="sm" weight="medium" colorTheme="foreground">
                        Full Name
                      </Text>
                      <Input
                        placeholder="John Doe"
                        autoComplete="name"
                        error={form.formState.errors.name?.message}
                        success={form.formState.touchedFields.name && !form.formState.errors.name && !!form.watch('name')}
                        value={form.watch('name')}
                        onChangeText={(text) => {
                          form.setValue('name', text);
                          if (form.formState.touchedFields.name) {
                            form.trigger('name');
                          }
                        }}
                        onBlur={() => form.trigger('name')}
                        leftElement={
                          <IconSymbol name="person.fill" size={20} color={theme.mutedForeground} />
                        }
                        rightElement={
                          form.formState.touchedFields.name && form.watch('name') ? (
                            <ValidationIcon status={form.formState.errors.name ? 'error' : 'success'} />
                          ) : null
                        }
                      />
                    </VStack>

                    {/* Email Field */}
                    <VStack spacing={2}>
                      <Text size="sm" weight="medium" colorTheme="foreground">
                        Email
                      </Text>
                      <Input
                        placeholder="user@example.com"
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        error={form.formState.errors.email?.message || (emailCheckData?.exists && "Email already exists")}
                        success={form.formState.touchedFields.email && !form.formState.errors.email && !!form.watch('email') && emailCheckData?.exists === false}
                        value={form.watch('email')}
                        onChangeText={(text) => {
                          form.setValue('email', text);
                          setHasInteractedWithEmail(true);
                          if (form.formState.touchedFields.email) {
                            form.trigger('email');
                          }
                        }}
                        onBlur={() => {
                          setHasInteractedWithEmail(true);
                          form.trigger('email');
                        }}
                        leftElement={
                          <IconSymbol name="envelope.fill" size={20} color={theme.mutedForeground} />
                        }
                        rightElement={
                          form.formState.touchedFields.email && form.watch('email') ? (
                            isCheckingEmail ? (
                              <Text size="xs" colorTheme="mutedForeground">Checking...</Text>
                            ) : emailCheckData ? (
                              <ValidationIcon 
                                status={
                                  form.formState.errors.email ? 'error' : 
                                  emailCheckData?.exists ? 'error' : 
                                  'success'
                                } 
                              />
                            ) : null
                          ) : null
                        }
                      />
                      {/* Email validation message */}
                      {form.formState.touchedFields.email && !form.formState.errors.email && emailCheckData && (
                        <Text size="sm" colorTheme={emailCheckData.exists ? "destructive" : "success"}>
                          {emailCheckData.exists ? (
                            <>
                              Email already exists.{" "}
                              <TextLink 
                                href="/(auth)/login"
                                size="sm"
                                variant="primary"
                                style={{ display: 'inline' as any }}
                              >
                                Login to your account
                              </TextLink>
                            </>
                          ) : "Email is available"}
                        </Text>
                      )}
                    </VStack>
                  </VStack>
                  
                  {/* Role Selection */}
                  <Box>
                    <Text size="sm" weight="medium" colorTheme="foreground" mb={2}>
                      Select Your Role
                    </Text>
                    
                    {/* Mobile role grid - 2x2 */}
                    <VStack spacing={3}>
                      {[0, 2].map((startIdx) => (
                        <HStack key={startIdx} spacing={3}>
                          {roleOptions.slice(startIdx, startIdx + 2).map((role) => {
                            const isSelected = selectedRole === role.value;
                            return (
                              <TouchableOpacity
                                key={role.value}
                                style={{ flex: 1 }}
                                onPress={() => {
                                  setSelectedRole(role.value);
                                  form.setValue('role', role.value);
                                  if (role.value === 'guest') {
                                    form.setValue('organizationCode', undefined);
                                    form.setValue('organizationName', undefined);
                                  } else if (role.value === 'user') {
                                    form.setValue('organizationCode', '');
                                    form.setValue('organizationName', undefined);
                                  } else if (role.value === 'manager' || role.value === 'admin') {
                                    form.setValue('organizationCode', undefined);
                                    form.setValue('organizationName', '');
                                  }
                                  setTimeout(() => form.trigger(), 0);
                                }}
                                activeOpacity={0.7}
                              >
                                <Card 
                                  borderWidth={2}
                                  borderTheme="border"
                                  bgTheme={isSelected ? 'accent' : 'card'}
                                  style={{
                                    minHeight: 100,
                                    borderColor: isSelected ? theme.primary : theme.border,
                                  }}
                                >
                                  <CardContent p={3 as SpacingScale}>
                                    <VStack spacing={1}>
                                      <HStack justifyContent="space-between" alignItems="center">
                                        <Text size="lg">{role.icon}</Text>
                                        {isSelected && (
                                          <Box 
                                            width={16}
                                            height={16}
                                            bgTheme="primary"
                                            rounded={'full' as BorderRadius}
                                            alignItems="center"
                                            justifyContent="center"
                                          >
                                            <Text size="xs" weight="bold" colorTheme="primaryForeground">✓</Text>
                                          </Box>
                                        )}
                                      </HStack>
                                      <Text weight="semibold" size="xs" colorTheme="foreground">
                                        {role.label}
                                      </Text>
                                      <Text size="xs" colorTheme="mutedForeground" numberOfLines={2}>
                                        {role.description}
                                      </Text>
                                    </VStack>
                                  </CardContent>
                                </Card>
                              </TouchableOpacity>
                            );
                          })}
                        </HStack>
                      ))}
                    </VStack>
                    
                    {/* Organization Field */}
                    <Box mt={3}>
                      <OrganizationField
                        form={form}
                        role={selectedRole}
                      />
                    </Box>
                  </Box>

                  {/* Password fields - stacked on mobile */}
                  <VStack spacing={3}>
                    {/* Password Field */}
                    <Box>
                      <Text size="sm" weight="medium" colorTheme="foreground" mb={2}>
                        Password
                      </Text>
                      <Input
                        placeholder="••••••••••••"
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                        error={form.formState.errors.password?.message}
                        success={form.formState.touchedFields.password && !form.formState.errors.password && !!form.watch('password')}
                        value={form.watch('password')}
                        onChangeText={(text) => {
                          form.setValue('password', text);
                          if (form.formState.touchedFields.password) {
                            form.trigger('password');
                          }
                        }}
                        onBlur={() => form.trigger('password')}
                        leftElement={
                          <IconSymbol name="lock.fill" size={20} color={theme.mutedForeground} />
                        }
                        rightElement={
                          <Box flexDirection="row" alignItems="center" gap={2}>
                            {form.formState.touchedFields.password && form.watch('password') && (
                              <ValidationIcon status={form.formState.errors.password ? 'error' : 'success'} />
                            )}
                            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                              <IconSymbol 
                                name={showPassword ? 'eye.slash.fill' : 'eye.fill' as any} 
                                size={20} 
                                color={theme.mutedForeground}
                              />
                            </Pressable>
                          </Box>
                        }
                      />
                    </Box>

                    {/* Confirm Password */}
                    <Box>
                      <Text size="sm" weight="medium" colorTheme="foreground" mb={2}>
                        Confirm Password
                      </Text>
                      <Input
                        placeholder="••••••••••••"
                        secureTextEntry={!showConfirmPassword}
                        autoComplete="new-password"
                        error={form.formState.errors.confirmPassword?.message}
                        success={form.formState.touchedFields.confirmPassword && !form.formState.errors.confirmPassword && !!form.watch('confirmPassword')}
                        value={form.watch('confirmPassword')}
                        onChangeText={(text) => {
                          form.setValue('confirmPassword', text);
                          if (form.formState.touchedFields.confirmPassword) {
                            form.trigger('confirmPassword');
                          }
                        }}
                        onBlur={() => form.trigger('confirmPassword')}
                        leftElement={
                          <IconSymbol name="lock.shield.fill" size={20} color={theme.mutedForeground} />
                        }
                        rightElement={
                          <Box flexDirection="row" alignItems="center" gap={2}>
                            {form.formState.touchedFields.confirmPassword && form.watch('confirmPassword') && (
                              <ValidationIcon status={form.formState.errors.confirmPassword ? 'error' : 'success'} />
                            )}
                            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                              <IconSymbol 
                                name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill' as any} 
                                size={20} 
                                color={theme.mutedForeground}
                              />
                            </Pressable>
                          </Box>
                        }
                      />
                    </Box>
                  </VStack>

                  {/* Password strength indicators */}
                  {form.watch('password') && (
                    <Box>
                      <HStack flexWrap="wrap" spacing={1}>
                        <Box 
                          px={2} 
                          py={1} 
                          rounded="sm"
                          bgTheme={(form.watch('password')?.length >= 12) ? 'accent' : 'destructive'}
                          style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                        >
                          <Text size="xs" colorTheme={(form.watch('password')?.length >= 12) ? 'accent' : 'destructive'}>
                            {(form.watch('password')?.length >= 12) ? '✓' : '✗'} 12+ chars
                          </Text>
                        </Box>
                        <Box 
                          px={2} 
                          py={1} 
                          rounded="sm"
                          bgTheme={/[A-Z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                          style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                        >
                          <Text size="xs" colorTheme={/[A-Z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                            {/[A-Z]/.test(form.watch('password') || '') ? '✓' : '✗'} Uppercase
                          </Text>
                        </Box>
                        <Box 
                          px={2} 
                          py={1} 
                          rounded="sm"
                          bgTheme={/[a-z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                          style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                        >
                          <Text size="xs" colorTheme={/[a-z]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                            {/[a-z]/.test(form.watch('password') || '') ? '✓' : '✗'} Lowercase
                          </Text>
                        </Box>
                        <Box 
                          px={2} 
                          py={1} 
                          rounded="sm"
                          bgTheme={/\d/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                          style={{ opacity: 0.2, marginRight: 4, marginBottom: 4 }}
                        >
                          <Text size="xs" colorTheme={/\d/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                            {/\d/.test(form.watch('password') || '') ? '✓' : '✗'} Number
                          </Text>
                        </Box>
                        <Box 
                          px={2} 
                          py={1} 
                          rounded="sm"
                          bgTheme={/[@$!%*?&]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}
                          style={{ opacity: 0.2, marginBottom: 4 }}
                        >
                          <Text size="xs" colorTheme={/[@$!%*?&]/.test(form.watch('password') || '') ? 'accent' : 'destructive'}>
                            {/[@$!%*?&]/.test(form.watch('password') || '') ? '✓' : '✗'} Special
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  )}

                  {/* Terms and Privacy */}
                  <VStack spacing={3}>
                    <HStack spacing={3} alignItems="flex-start">
                      <Checkbox
                        checked={form.watch('acceptTerms')}
                        onCheckedChange={(checked) => {
                          form.setValue('acceptTerms', checked);
                          form.trigger('acceptTerms');
                        }}
                        style={{ marginTop: 2 }}
                      />
                      <Box flex={1}>
                        <Text size="sm" lineHeight="relaxed">
                          I accept the{" "}
                          <Text size="sm" weight="medium" colorTheme="primary">Terms of Service</Text>
                        </Text>
                        {form.formState.errors.acceptTerms && (
                          <Text size="sm" colorTheme="destructive" mt={1}>
                            {form.formState.errors.acceptTerms.message}
                          </Text>
                        )}
                      </Box>
                    </HStack>

                    <HStack spacing={3} alignItems="flex-start">
                      <Checkbox
                        checked={form.watch('acceptPrivacy')}
                        onCheckedChange={(checked) => {
                          form.setValue('acceptPrivacy', checked);
                          form.trigger('acceptPrivacy');
                        }}
                        style={{ marginTop: 2 }}
                      />
                      <Box flex={1}>
                        <Text size="sm" lineHeight="relaxed">
                          I accept the{" "}
                          <Text size="sm" weight="medium" colorTheme="primary">Privacy Policy</Text>
                        </Text>
                        {form.formState.errors.acceptPrivacy && (
                          <Text size="sm" colorTheme="destructive" mt={1}>
                            {form.formState.errors.acceptPrivacy.message}
                          </Text>
                        )}
                      </Box>
                    </HStack>
                  </VStack>

                  {/* Submit Button */}
                  <Button
                    size="lg"
                    fullWidth
                    isLoading={signUpMutation.isPending}
                    isDisabled={!hasValidValues || signUpMutation.isPending}
                    onPress={() => form.handleSubmit(onSubmit)()}
                  >
                    {signUpMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>

                  {/* Divider */}
                  <Box position="relative" my={3}>
                    <Box 
                      height={1} 
                      bgTheme="muted" 
                      position="absolute" 
                      top={10} 
                      left={0} 
                      right={0} 
                    />
                    <Box alignItems="center">
                      <Box bgTheme="background" px={2}>
                        <Caption colorTheme="mutedForeground">Or continue with</Caption>
                      </Box>
                    </Box>
                  </Box>

                  {/* Social Login Buttons */}
                  <HStack spacing={3} justifyContent="space-between">
                    <Box flex={1}>
                      <GoogleSignInButton 
                        size="md"
                        variant="outline"
                        fullWidth
                        iconOnly
                        text=""
                        style={{ height: 44 }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        onPress={() => handleSocialAuth('meta')}
                        style={{ height: 44 }}
                      >
                        {SocialIcons.meta}
                      </Button>
                    </Box>
                    <Box flex={1}>
                      <Button
                        variant="outline"
                        size="md"
                        fullWidth
                        onPress={() => handleSocialAuth('x')}
                        style={{ height: 44 }}
                      >
                        {SocialIcons.x}
                      </Button>
                    </Box>
                  </HStack>

                  {/* Sign in link */}
                  <Box alignItems="center">
                    <HStack spacing={1}>
                      <Caption>Already have an account?</Caption>
                      <TextLink 
                        href="/(auth)/login"
                        size="sm"
                        weight="medium"
                        variant="primary"
                      >
                        Sign in
                      </TextLink>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <ScrollView
        style={{ 
          flex: 1,
          backgroundColor: theme.muted,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: isTabletOrDesktop ? 40 : 20,
          minHeight: '100vh' as any,
        }}
        showsVerticalScrollIndicator={false}
      >
        {cardContent}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box 
        flex={1} 
        bgTheme="muted"
        justifyContent="center"
        alignItems="center"
      >
        {cardContent}
      </Box>
    </KeyboardAvoidingView>
  );
}