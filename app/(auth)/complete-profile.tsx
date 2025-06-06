import React from "react";
import { Platform, Dimensions, KeyboardAvoidingView, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/trpc";
import { showErrorAlert, showSuccessAlert } from "@/lib/core/alert";
import { log } from "@/lib/core/logger";
import { useTheme } from "@/lib/theme/theme-provider";
import { CompleteProfileInputSchema } from "@/lib/validations/server";
import { z } from "zod";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ValidationIcon } from "@/components/ui/ValidationIcon";
import { Box } from "@/components/universal/Box";
import { Text, Heading1 } from "@/components/universal/Text";
import { VStack, HStack } from "@/components/universal/Stack";
import { Button } from "@/components/universal/Button";
import { Input } from "@/components/universal/Input";
import { Card } from "@/components/universal/Card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleSelector, UserRole, roleOptions } from "@/components/RoleSelector";
import { OrganizationField } from "@/components/OrganizationField";
import { SpacingScale, BorderRadius } from "@/lib/design-system";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProfileCompletionData = z.infer<typeof CompleteProfileInputSchema>;

export default function CompleteProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, updateUserData } = useAuth();
  const utils = api.useUtils();
  const [screenWidth, setScreenWidth] = React.useState(SCREEN_WIDTH);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(user?.role || 'user');
  const totalSteps = 3; // Personal Info with Bio, Role Selection, Professional Details
  
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
  const isLargeScreen = screenWidth >= 1024;
  const isMobile = screenWidth < 768;

  const form = useForm<ProfileCompletionData>({
    resolver: zodResolver(CompleteProfileInputSchema),
    mode: "onTouched",
    defaultValues: {
      name: user?.name || '',
      role: user?.role || 'user',
      organizationId: user?.organizationId || undefined,
      organizationCode: undefined,
      organizationName: undefined,
      acceptTerms: true,
      acceptPrivacy: true,
      phoneNumber: undefined,
      department: undefined,
      jobTitle: undefined,
      bio: undefined,
    },
  });

  React.useEffect(() => {
    form.setValue('role', selectedRole);
  }, [selectedRole]);

  // Profile completion mutation
  const completeProfileMutation = api.auth.completeProfile.useMutation({
    onSuccess: async (data) => {
      log.info('Profile completed successfully', 'PROFILE_COMPLETION', data);
      
      if (data && typeof data === 'object' && 'user' in data && data.user) {
        const userData = data.user as any;
        updateUserData({
          ...userData,
          needsProfileCompletion: false,
        });
        
        showSuccessAlert("Profile Complete", "Welcome to the app!");
        
        // Refresh session and navigate
        setTimeout(async () => {
          try {
            await utils.auth.getSession.invalidate();
            await utils.auth.getSession.fetch();
            router.replace('/(home)');
          } catch (error) {
            log.error('Error refreshing session', 'PROFILE_COMPLETION', error);
            router.replace('/(home)');
          }
        }, 100);
      }
    },
    onError: (error) => {
      log.error('Profile completion failed', 'PROFILE_COMPLETION', error);
      showErrorAlert("Error", error.message || "Failed to complete profile. Please try again.");
    },
  });

  const handleNext = async () => {
    // Validate current step fields
    let fieldsToValidate: (keyof ProfileCompletionData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['role'];
    } else if (currentStep === 3) {
      fieldsToValidate = [];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit on last step
        form.handleSubmit(onSubmit)();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ProfileCompletionData) => {
    log.debug('Submitting profile completion', 'PROFILE_COMPLETION', data);
    
    try {
      await completeProfileMutation.mutateAsync(data);
    } catch (error: any) {
      log.error('Profile completion error', 'PROFILE_COMPLETION', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={4}>
            <VStack spacing={2}>
              <Text size="lg" weight="semibold">Personal Information</Text>
              <Text size="sm" colorTheme="mutedForeground">
                Let&apos;s start with your basic information
              </Text>
            </VStack>
            
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.watch('name')}
              onChangeText={(text) => form.setValue('name', text)}
              error={form.formState.errors.name?.message}
              success={form.formState.touchedFields.name && !form.formState.errors.name && !!form.watch('name')}
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
            
            <Input
              label="Phone Number (Optional)"
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
              value={form.watch('phoneNumber') || ''}
              onChangeText={(text) => form.setValue('phoneNumber', text)}
              error={form.formState.errors.phoneNumber?.message}
              leftElement={
                <IconSymbol name="phone.fill" size={20} color={theme.mutedForeground} />
              }
            />
            
            <Box>
              <Text size="sm" weight="medium" colorTheme="foreground" mb={2}>
                Bio (Optional)
              </Text>
              <Box
                borderWidth={1}
                borderTheme="border"
                rounded="md"
                p={3}
                bgTheme="card"
                style={{ minHeight: 120 }}
                flexDirection="row"
                alignItems="flex-start"
              >
                <Box mr={2} mt={1}>
                  <IconSymbol name="doc.text.fill" size={20} color={theme.mutedForeground} />
                </Box>
                <TextInput
                  placeholder="Tell us a bit about yourself..."
                  placeholderTextColor={theme.mutedForeground}
                  multiline
                  numberOfLines={4}
                  value={form.watch('bio') || ''}
                  onChangeText={(text) => form.setValue('bio', text)}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: theme.foreground,
                    textAlignVertical: 'top' as any,
                    minHeight: 100,
                    padding: 0,
                    ...(Platform.OS === 'web' && {
                      outline: 'none',
                    } as any),
                  }}
                />
              </Box>
            </Box>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={4}>
            <VStack spacing={2}>
              <Text size="lg" weight="semibold">Select Your Role</Text>
              <Text size="sm" colorTheme="mutedForeground">
                Choose the role that best describes you
              </Text>
            </VStack>
            
            {/* Role Selection Grid */}
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
                        <VStack spacing={2} p={4 as SpacingScale}>
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
                        <VStack spacing={2} p={4 as SpacingScale}>
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
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </HStack>
            </VStack>
            
            {/* Organization Field */}
            <Box mt={3}>
              <OrganizationField
                form={form}
                role={selectedRole}
              />
            </Box>
          </VStack>
        );
        
      case 3:
        return (
          <VStack spacing={4}>
            <VStack spacing={2}>
              <Text size="lg" weight="semibold">Professional Details</Text>
              <Text size="sm" colorTheme="mutedForeground">
                Tell us more about your work
              </Text>
            </VStack>
            
            <Input
              label="Department (Optional)"
              placeholder="Engineering"
              value={form.watch('department') || ''}
              onChangeText={(text) => form.setValue('department', text)}
              leftElement={
                <IconSymbol name="building.2.fill" size={20} color={theme.mutedForeground} />
              }
            />
            
            <Input
              label="Job Title (Optional)"
              placeholder="Senior Developer"
              value={form.watch('jobTitle') || ''}
              onChangeText={(text) => form.setValue('jobTitle', text)}
              leftElement={
                <IconSymbol name="briefcase.fill" size={20} color={theme.mutedForeground} />
              }
            />
          </VStack>
        );
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const formContent = (
    <Box flex={1} position="relative" style={{ display: 'flex', flexDirection: 'column' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Box p={isMobile ? 4 : (isTabletOrDesktop ? 8 : 6)} pb={isMobile ? 24 : 32}>
          <VStack spacing={4}>
            {/* Header */}
            <VStack spacing={1} alignItems="center">
              <Heading1 style={{ fontSize: isTabletOrDesktop ? 32 : 28 }}>Complete Your Profile</Heading1>
              <Text size="sm" colorTheme="mutedForeground" style={{ textAlign: 'center' }}>
                Just a few more steps to get you started
              </Text>
            </VStack>

            {/* Progress Bar */}
            <Box>
              <HStack justifyContent="space-between" mb={2}>
                <Text size="sm" colorTheme="mutedForeground">
                  Step {currentStep} of {totalSteps}
                </Text>
                <Text size="sm" colorTheme="mutedForeground">
                  {Math.round(progressPercentage)}% Complete
                </Text>
              </HStack>
              <Box 
                height={4} 
                bgTheme="muted" 
                rounded="full"
                overflow="hidden"
              >
                <Box 
                  height={4} 
                  bgTheme="primary" 
                  style={{ 
                    width: `${progressPercentage}%`,
                    transition: 'width 0.3s ease',
                  } as any}
                />
              </Box>
            </Box>

            {/* Step Content */}
            {renderStepContent()}
          </VStack>
        </Box>
      </ScrollView>

      {/* Sticky Navigation Buttons */}
      <Box 
        position="absolute" 
        bottom={0} 
        left={0} 
        right={0} 
        p={isMobile ? 4 : (isTabletOrDesktop ? 8 : 6)}
        bgTheme="card"
        borderTopWidth={1}
        borderTheme="border"
        style={{
          ...(Platform.OS === 'web' && {
            position: 'sticky' as any,
          }),
        }}
      >
        <HStack spacing={3} style={{ width: '100%' }}>
          {currentStep > 1 && (
            <Box flex={1}>
              <Button
                variant="outline"
                fullWidth
                onPress={handlePrevious}
              >
                Previous
              </Button>
            </Box>
          )}
          <Box flex={1}>
            <Button
              fullWidth
              onPress={handleNext}
              isLoading={completeProfileMutation.isPending}
              isDisabled={completeProfileMutation.isPending}
            >
              {currentStep === totalSteps ? 'Complete Profile' : 'Next'}
            </Button>
          </Box>
        </HStack>
      </Box>
    </Box>
  );

  const imageColumn = (
    <LinearGradient
      colors={['#e8e9eb', '#f2f3f5', '#fafbfc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        position: 'relative',
        height: '100%',
        width: '100%',
      }}
    >
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        p={8}
      >
        <VStack spacing={6} alignItems="center">
          {/* Progress Emoji */}
          <Text style={{ fontSize: 80 }}>
            {currentStep === 1 ? '👤' : currentStep === 2 ? '🎯' : '💼'}
          </Text>
          
          {/* Minimal Text */}
          <VStack spacing={2} alignItems="center">
            <Text 
              size="3xl" 
              weight="bold" 
              style={{ color: theme.foreground }}
            >
              Almost There!
            </Text>
            <Text 
              size="lg" 
              style={{ 
                color: theme.mutedForeground,
                textAlign: 'center',
                maxWidth: 300,
              }}
            >
              Complete your profile to unlock all features and connect with your team
            </Text>
          </VStack>
        </VStack>
      </Box>
    </LinearGradient>
  );

  // Mobile layout - no card, full screen
  if (isMobile) {
    return (
      <ProtectedRoute>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1, backgroundColor: theme.background }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Box flex={1} bgTheme="background">
              {formContent}
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </ProtectedRoute>
    );
  }

  // Tablet/Desktop layout with card
  const cardContent = (
    <Card 
      shadow="xl"
      bgTheme="card"
      borderTheme="border"
      style={{
        width: isTabletOrDesktop ? '85%' : '100%',
        maxWidth: isTabletOrDesktop ? 1200 : 400,
        overflow: 'hidden',
        ...(Platform.OS === 'web' && {
          maxHeight: '90vh' as any,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }),
      }}
    >
      {isLargeScreen ? (
        <Box 
          flexDirection="row" 
          style={{ 
            minHeight: 600,
            width: '100%',
            display: 'flex' as any,
            height: '100%',
          }}
        >
          <Box flex={6} style={{ display: 'flex' as any }}>
            {formContent}
          </Box>
          <Box flex={4} style={{ display: 'flex' as any }}>
            {imageColumn}
          </Box>
        </Box>
      ) : (
        formContent
      )}
    </Card>
  );

  if (Platform.OS === 'web') {
    return (
      <ProtectedRoute>
        <Box 
          flex={1} 
          bgTheme="muted"
          justifyContent="center"
          alignItems="center"
          px={isTabletOrDesktop ? 6 : 4}
          style={Platform.OS === 'web' ? { 
            minHeight: '100vh' as any,
            width: '100%',
          } : {
            flex: 1,
            width: '100%',
          }}
        >
          {cardContent}
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Box 
            flex={1} 
            bgTheme="muted"
            justifyContent="center"
            alignItems="center"
            style={{ 
              flex: 1,
              width: '100%',
              paddingVertical: 20,
            }}
          >
            {cardContent}
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </ProtectedRoute>
  );
}