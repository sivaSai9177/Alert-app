import React, { useState, useCallback, useRef, useEffect, useOptimistic, useTransition } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/trpc';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { RoleSelector } from '@/components/RoleSelector';
import { CompleteProfileInputSchema } from '@/lib/validations/server';
import { z } from 'zod';
import { log } from '@/lib/core/logger';

const logger = log;

interface ProfileCompletionFlowProps {
  onComplete?: () => void;
  showSkip?: boolean;
}

// Use server validation schema for consistency
type ProfileCompletionData = z.infer<typeof CompleteProfileInputSchema>;

export function ProfileCompletionFlowEnhanced({ onComplete, showSkip = false }: ProfileCompletionFlowProps) {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const utils = api.useUtils();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isPending, startTransition] = useTransition();
  
  // Use refs to prevent infinite loops
  const isSubmittingRef = useRef(false);
  const hasCompletedRef = useRef(false);
  
  const [formData, setFormData] = useState<ProfileCompletionData>({
    name: user?.name || '',
    role: user?.role || 'user', // Use user's role if available, otherwise default to 'user' for form validation
    organizationId: user?.organizationId || undefined,
    organizationCode: undefined,
    organizationName: undefined,
    acceptTerms: true, // Set to true for OAuth users
    acceptPrivacy: true, // Set to true for OAuth users
    phoneNumber: undefined,
    department: undefined,
    jobTitle: undefined,
    bio: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use optimistic updates for profile completion status
  const [optimisticProfileComplete, setOptimisticProfileComplete] = useOptimistic(
    user?.needsProfileCompletion === false,
    (state, newValue: boolean) => newValue
  );

  // Stabilized mutation to prevent re-creation on every render
  const completeProfileMutation = api.auth.completeProfile.useMutation({
    onSuccess: useCallback((data: { success: true; user: any; organizationId?: string }) => {
      // Prevent duplicate executions
      if (hasCompletedRef.current) {
        logger.warn('Profile completion already processed, ignoring duplicate success', 'PROFILE_COMPLETION');
        return;
      }
      
      hasCompletedRef.current = true;
      logger.info('Profile completed successfully', 'PROFILE_COMPLETION', data);
      
      // Update auth state immediately without setTimeout to prevent timing issues
      if (data.user) {
        logger.info('Updating auth store with completed profile', 'PROFILE_COMPLETION', data.user);
        
        // Update only user data without affecting auth state
        updateUserData({
          ...data.user,
          needsProfileCompletion: false,
        } as any);
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
        
        // Refresh session to ensure authentication state is updated
        setTimeout(async () => {
          try {
            logger.info('Refreshing session after profile completion', 'PROFILE_COMPLETION');
            
            // Invalidate and refetch the session
            await utils.auth.getSession.invalidate();
            const updatedSession = await utils.auth.getSession.fetch();
            
            logger.info('Updated session data', 'PROFILE_COMPLETION', updatedSession);
            
            // Navigate to appropriate dashboard based on role
            const updatedUser = (updatedSession as any)?.user || data.user;
            if (updatedUser) {
              logger.info('Navigating after profile completion', 'PROFILE_COMPLETION', { role: updatedUser.role });
              
              // Check for healthcare roles
              const healthcareRoles = ['doctor', 'nurse', 'head_doctor'];
              const operatorRole = ['operator'];
              
              if (updatedUser.role && operatorRole.includes(updatedUser.role)) {
                router.replace('/(home)/operator-dashboard');
              } else if (updatedUser.role && healthcareRoles.includes(updatedUser.role)) {
                router.replace('/(home)/healthcare-dashboard');
              } else {
                router.replace('/(home)');
              }
            } else {
              // Fallback to home
              router.replace('/(home)');
            }
          } catch (error) {
            logger.error('Error refreshing session', 'PROFILE_COMPLETION', error);
            // Navigate anyway since the profile update was successful
            // Check for healthcare roles based on current form data
            const healthcareRoles = ['doctor', 'nurse', 'head_doctor'];
            const operatorRole = ['operator'];
            
            if (data.user?.role && operatorRole.includes(data.user.role)) {
              router.replace('/(home)/operator-dashboard');
            } else if (data.user?.role && healthcareRoles.includes(data.user.role)) {
              router.replace('/(home)/healthcare-dashboard');
            } else {
              router.replace('/(home)');
            }
          }
        }, 100);
      }
      
      // Show success message (non-blocking on web)
      if (Platform.OS === 'web') {
        // On web, use a simple notification instead of Alert
        log.info('Profile Complete! 🎉 Welcome! Your profile has been set up successfully.', 'COMPONENT');
      } else {
        // On mobile, show the alert after navigation
        setTimeout(() => {
          Alert.alert(
            'Profile Complete! 🎉',
            'Welcome! Your profile has been set up successfully. You now have access to all features.',
            [{ text: 'OK' }]
          );
        }, 100);
      }
    }, [updateUserData, router, onComplete, utils]),
    onError: useCallback((error) => {
      isSubmittingRef.current = false;
      hasCompletedRef.current = false;
      logger.error('Failed to update profile', 'PROFILE_COMPLETION', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }, []),
  });

  const handleSubmit = useCallback(async () => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || hasCompletedRef.current) {
      logger.warn('Profile completion already in progress or completed', 'PROFILE_COMPLETION');
      return;
    }
    
    isSubmittingRef.current = true;
    
    try {
      // Clean data before validation - convert empty strings to undefined
      const cleanedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value === '' || value === null) {
          // For optional fields, convert empty strings to undefined
          if (['organizationCode', 'organizationName', 'organizationId', 'phoneNumber', 'department', 'jobTitle', 'bio'].includes(key)) {
            acc[key] = undefined;
          } else {
            acc[key] = value; // Keep required fields as is
          }
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      // Validate cleaned data
      const validatedData = CompleteProfileInputSchema.parse(cleanedFormData);
      
      // Optimistically update the profile completion status
      startTransition(() => {
        setOptimisticProfileComplete(true);
      });
      
      logger.info('Submitting profile completion data', 'PROFILE_COMPLETION', { 
        fields: Object.keys(validatedData), 
        data: validatedData 
      });
      
      await completeProfileMutation.mutateAsync(validatedData);
    } catch (error) {
      isSubmittingRef.current = false;
      
      // Revert optimistic update on error
      startTransition(() => {
        setOptimisticProfileComplete(false);
      });
      
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        logger.warn('Validation errors', 'PROFILE_COMPLETION', fieldErrors);
      }
    }
  }, [formData, completeProfileMutation, setOptimisticProfileComplete]);

  const handleSkip = useCallback(() => {
    // Prevent navigation if already completed
    if (hasCompletedRef.current) {
      return;
    }
    
    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later from settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            logger.info('User skipped profile completion', 'PROFILE_COMPLETION');
            hasCompletedRef.current = true;
            // Navigate to appropriate dashboard based on current role
            const healthcareRoles = ['doctor', 'nurse', 'head_doctor'];
            const operatorRole = ['operator'];
            
            if (user?.role && operatorRole.includes(user.role)) {
              router.replace('/(home)/operator-dashboard');
            } else if (user?.role && healthcareRoles.includes(user.role)) {
              router.replace('/(home)/healthcare-dashboard');
            } else {
              router.replace('/(home)');
            }
          },
        },
      ]
    );
  }, [router]);

  const handleInputChange = useCallback((field: keyof ProfileCompletionData, value: string | boolean) => {
    // For optional string fields, convert empty strings to undefined
    let processedValue: any = value;
    if (typeof value === 'string' && value === '' && 
        ['organizationCode', 'organizationName', 'organizationId', 'phoneNumber', 'department', 'jobTitle', 'bio'].includes(field)) {
      processedValue = undefined;
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    setErrors(prev => {
      if (prev[field]) {
        const { [field]: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const toggleAcceptTerms = useCallback(() => {
    setFormData(prev => ({ ...prev, acceptTerms: !prev.acceptTerms as true }));
    setErrors(prev => {
      if (prev.acceptTerms) {
        const { acceptTerms: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const toggleAcceptPrivacy = useCallback(() => {
    setFormData(prev => ({ ...prev, acceptPrivacy: !prev.acceptPrivacy as true }));
    setErrors(prev => {
      if (prev.acceptPrivacy) {
        const { acceptPrivacy: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  // Reset refs when component unmounts
  useEffect(() => {
    return () => {
      isSubmittingRef.current = false;
      hasCompletedRef.current = false;
    };
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View className="space-y-4">
            <View className="space-y-2">
              <Text className="text-sm font-medium">Full Name *</Text>
              <Input
                placeholder="Enter your full name"
                value={formData.name || ''}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
              />
              {errors.name && (
                <Text className="text-destructive text-sm">{errors.name}</Text>
              )}
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium">Role *</Text>
              <RoleSelector
                selectedRole={formData.role}
                onRoleSelect={(role) => handleInputChange('role', role)}
              />
              {errors.role && (
                <Text className="text-destructive text-sm">{errors.role}</Text>
              )}
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium">Job Title (Optional)</Text>
              <Input
                placeholder="e.g. Software Engineer"
                value={formData.jobTitle || ''}
                onChangeText={(value) => handleInputChange('jobTitle', value)}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View className="space-y-4">
            {/* Show organization fields based on role */}
            {(formData.role === 'manager' || formData.role === 'admin') && (
              <View className="space-y-2">
                <Text className="text-sm font-medium">Organization Name *</Text>
                <Input
                  placeholder="Enter your organization name"
                  value={formData.organizationName || ''}
                  onChangeText={(value) => handleInputChange('organizationName', value)}
                />
                {errors.organizationName && (
                  <Text className="text-destructive text-sm">{errors.organizationName}</Text>
                )}
              </View>
            )}

            {formData.role === 'user' && (
              <View className="space-y-2">
                <Text className="text-sm font-medium">Organization Code (Optional)</Text>
                <Input
                  placeholder="Enter organization code (4-12 characters)"
                  value={formData.organizationCode || ''}
                  onChangeText={(value) => handleInputChange('organizationCode', value.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={12}
                />
                {errors.organizationCode && (
                  <Text className="text-destructive text-sm">{errors.organizationCode}</Text>
                )}
                <Text className="text-xs text-gray-500">
                  If you have an organization code, enter it here to join your organization
                </Text>
              </View>
            )}

            <View className="space-y-2">
              <Text className="text-sm font-medium">Department (Optional)</Text>
              <Input
                placeholder="e.g. Engineering, Marketing"
                value={formData.department || ''}
                onChangeText={(value) => handleInputChange('department', value)}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium">Phone Number (Optional)</Text>
              <Input
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber || ''}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
              />
              {errors.phoneNumber && (
                <Text className="text-destructive text-sm">{errors.phoneNumber}</Text>
              )}
            </View>
          </View>
        );

      case 3:
        return (
          <View className="space-y-4">
            <View className="space-y-2">
              <Text className="text-sm font-medium">Bio (Optional)</Text>
              <Input
                placeholder="Tell us a bit about yourself..."
                value={formData.bio || ''}
                onChangeText={(value) => handleInputChange('bio', value)}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
              {errors.bio && (
                <Text className="text-destructive text-sm">{errors.bio}</Text>
              )}
            </View>

            <View className="space-y-4">
              <Text className="text-sm font-medium">Terms and Privacy *</Text>
              
              <View className="flex-row items-start space-x-3">
                <Pressable
                  onPress={toggleAcceptTerms}
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: formData.acceptTerms ? '#2563eb' : '#d1d5db',
                    backgroundColor: formData.acceptTerms ? '#2563eb' : 'transparent',
                    borderRadius: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  }}
                >
                  {formData.acceptTerms && (
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                  )}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text className="text-sm">
                    I accept the{' '}
                    <Text style={{ color: '#2563eb' }}>Terms and Conditions</Text>
                  </Text>
                </View>
              </View>
              {errors.acceptTerms && (
                <Text className="text-destructive text-sm">{errors.acceptTerms}</Text>
              )}

              <View className="flex-row items-start space-x-3">
                <Pressable
                  onPress={toggleAcceptPrivacy}
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: formData.acceptPrivacy ? '#2563eb' : '#d1d5db',
                    backgroundColor: formData.acceptPrivacy ? '#2563eb' : 'transparent',
                    borderRadius: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  }}
                >
                  {formData.acceptPrivacy && (
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                  )}
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text className="text-sm">
                    I accept the{' '}
                    <Text style={{ color: '#2563eb' }}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>
              {errors.acceptPrivacy && (
                <Text className="text-destructive text-sm">{errors.acceptPrivacy}</Text>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                {user?.email ? `Welcome, ${user.email}!` : 'Welcome!'} Let&apos;s set up your profile.
              </CardDescription>
              
              {/* Progress indicator */}
              <View className="flex-row justify-center mt-4 space-x-2">
                {[1, 2, 3].map((step) => (
                  <View
                    key={step}
                    className={`h-2 w-16 rounded-full ${
                      step <= currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </View>
              <Text className="text-center text-sm text-muted-foreground mt-2">
                Step {currentStep} of {totalSteps}
              </Text>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {renderStep()}

              <View className="space-y-3 pt-6">
                <View className="flex-row space-x-3">
                  {currentStep > 1 && (
                    <View className="flex-1">
                      <PrimaryButton
                        title="Previous"
                        onPress={prevStep}
                        variant="outline"
                      />
                    </View>
                  )}
                  
                  <View className="flex-1">
                    {currentStep < totalSteps ? (
                      <PrimaryButton
                        title="Next"
                        onPress={nextStep}
                        variant="primary"
                      />
                    ) : (
                      <PrimaryButton
                        title="Complete Profile"
                        onPress={handleSubmit}
                        disabled={completeProfileMutation.isPending || isSubmittingRef.current || hasCompletedRef.current}
                        loading={completeProfileMutation.isPending || isSubmittingRef.current}
                        variant="primary"
                      />
                    )}
                  </View>
                </View>
                
                {showSkip && currentStep === 1 && (
                  <PrimaryButton
                    title="Skip for Now"
                    onPress={handleSkip}
                    disabled={completeProfileMutation.isPending || hasCompletedRef.current}
                    variant="ghost"
                  />
                )}
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}