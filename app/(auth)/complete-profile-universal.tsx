import React from "react";
import { Platform, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/trpc";
import { showErrorAlert, showSuccessAlert } from "@/lib/core/alert";
import { log } from "@/lib/core/logger";
import { useTheme } from "@/lib/theme/enhanced-theme-provider";
import { CompleteProfileInputSchema } from "@/lib/validations/server";
import { z } from "zod";

// Import all universal components
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Heading1,
  Button,
  Card,
  Badge,
  Progress,
  Alert,
  Avatar,
  Form,
  FormInput,
  FormSelect,
  FormSubmit,
  useForm,
  Select,
  Label,
  FormField,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  useToast,
} from "@/components/universal";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons } from "@expo/vector-icons";
import { SpacingScale } from "@/lib/design-system";
import { useSpacing } from "@/contexts/SpacingContext";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProfileCompletionData = z.infer<typeof CompleteProfileInputSchema>;

// Role options with better typing
interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full system access and user management',
    icon: 'shield-checkmark',
    color: 'destructive',
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Team and project management capabilities',
    icon: 'people',
    color: 'primary',
  },
  {
    value: 'user',
    label: 'User',
    description: 'Standard access to core features',
    icon: 'person',
    color: 'secondary',
  },
  {
    value: 'guest',
    label: 'Guest',
    description: 'Limited read-only access',
    icon: 'eye',
    color: 'muted',
  },
];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { user, updateUserData } = useAuth();
  const utils = api.useUtils();
  const { show: showToast } = useToast();
  
  const [screenWidth, setScreenWidth] = React.useState(SCREEN_WIDTH);
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 3;
  
  // Responsive breakpoints
  const isTabletOrDesktop = screenWidth >= 768;
  const isLargeScreen = screenWidth >= 1024;
  
  // Form setup with universal Form component
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
  
  // Watch form values
  const selectedRole = form.watch('role');
  
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
        
        showToast({
          title: "Profile Complete!",
          description: "Welcome to the app!",
          variant: "success",
        });
        
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
        }, 500);
      }
    },
    onError: (error) => {
      log.error('Profile completion failed', 'PROFILE_COMPLETION', error);
      showToast({
        title: "Profile Update Failed",
        description: error.message || "Please try again",
        variant: "error",
      });
    },
  });
  
  const onSubmit = async (data: ProfileCompletionData) => {
    log.info('Submitting profile completion', 'PROFILE_COMPLETION', { step: currentStep });
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeProfileMutation.mutateAsync(data);
    }
  };
  
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={6 as SpacingScale}>
            <VStack spacing={2 as SpacingScale}>
              <Text size="lg" weight="semibold">Personal Information</Text>
              <Text size="sm" colorTheme="mutedForeground">
                Let's start with your basic details
              </Text>
            </VStack>
            
            <FormInput
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              required
              rules={{
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              }}
            />
            
            <FormInput
              name="phoneNumber"
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              hint="Optional - for account recovery"
            />
            
            <FormField
              label="Bio"
              hint="Tell us a bit about yourself"
            >
              <Box
                borderWidth={1}
                borderTheme="border"
                rounded="md"
                p={3 as SpacingScale}
                bgTheme="card"
                minHeight={120}
              >
                <Input
                  placeholder="Your bio..."
                  multiline
                  numberOfLines={4}
                  value={form.watch('bio') || ''}
                  onChangeText={(text) => form.setValue('bio', text)}
                  style={{ minHeight: 100 }}
                />
              </Box>
            </FormField>
          </VStack>
        );
        
      case 2:
        return (
          <VStack spacing={6 as SpacingScale}>
            <VStack spacing={2 as SpacingScale}>
              <Text size="lg" weight="semibold">Select Your Role</Text>
              <Text size="sm" colorTheme="mutedForeground">
                Choose the role that best describes you
              </Text>
            </VStack>
            
            <ToggleGroup
              type="single"
              value={selectedRole}
              onValueChange={(value) => form.setValue('role', value as any)}
              orientation="vertical"
            >
              <VStack spacing={3 as SpacingScale}>
                {roleOptions.map((role) => (
                  <ToggleGroupItem key={role.value} value={role.value}>
                    <Card
                      borderWidth={2}
                      borderTheme={selectedRole === role.value ? "primary" : "border"}
                      bgTheme={selectedRole === role.value ? "accent" : "card"}
                      p={4 as SpacingScale}
                    >
                      <HStack spacing={3 as SpacingScale} alignItems="center">
                        <Avatar
                          size="md"
                          bgColorTheme={role.color as any}
                          fallbackIcon={role.icon}
                        />
                        <VStack spacing={1 as SpacingScale} flex={1}>
                          <HStack spacing={2 as SpacingScale} alignItems="center">
                            <Text weight="semibold">{role.label}</Text>
                            {selectedRole === role.value && (
                              <Badge variant="primary" size="xs">
                                Selected
                              </Badge>
                            )}
                          </HStack>
                          <Text size="sm" colorTheme="mutedForeground">
                            {role.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </Card>
                  </ToggleGroupItem>
                ))}
              </VStack>
            </ToggleGroup>
          </VStack>
        );
        
      case 3:
        return (
          <VStack spacing={6 as SpacingScale}>
            <VStack spacing={2 as SpacingScale}>
              <Text size="lg" weight="semibold">Professional Details</Text>
              <Text size="sm" colorTheme="mutedForeground">
                Help us personalize your experience
              </Text>
            </VStack>
            
            <FormInput
              name="organizationName"
              label="Organization"
              placeholder="Your company or organization"
              hint="Leave blank if not applicable"
            />
            
            <FormInput
              name="department"
              label="Department"
              placeholder="e.g., Engineering, Marketing"
            />
            
            <FormInput
              name="jobTitle"
              label="Job Title"
              placeholder="e.g., Software Engineer, Product Manager"
            />
            
            <Alert
              variant="info"
              title="Privacy Notice"
              description="Your information is securely stored and never shared without your consent."
              showIcon
            />
          </VStack>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <ProtectedRoute requireProfileCompletion={false}>
      <Container scroll safe>
        <LinearGradient
          colors={[theme.background, theme.muted + '20', theme.background]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 300,
          }}
        />
        
        <Box
          maxWidth={isLargeScreen ? 800 : isTabletOrDesktop ? 600 : '100%'}
          mx="auto"
          width="100%"
          p={4 as SpacingScale}
        >
          {/* Header */}
          <VStack spacing={6 as SpacingScale} alignItems="center" mb={8 as SpacingScale}>
            <Heading1 textAlign="center">Complete Your Profile</Heading1>
            
            {/* Progress Indicator */}
            <Box width="100%" maxWidth={400}>
              <Progress
                value={(currentStep / totalSteps) * 100}
                variant="primary"
                size="md"
              />
              <HStack justifyContent="space-between" mt={2 as SpacingScale}>
                <Text size="xs" colorTheme="mutedForeground">
                  Step {currentStep} of {totalSteps}
                </Text>
                <Text size="xs" colorTheme="mutedForeground">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </Text>
              </HStack>
            </Box>
          </VStack>
          
          {/* Form Content */}
          <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
            <Card p={6 as SpacingScale} spacing={6 as SpacingScale}>
              {getStepContent()}
              
              {/* Navigation Buttons */}
              <HStack spacing={3 as SpacingScale} mt={6 as SpacingScale}>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onPress={goBack}
                    leftIcon={<Ionicons name="arrow-back" size={20} />}
                  >
                    Back
                  </Button>
                )}
                
                <Box flex={1} />
                
                <FormSubmit
                  size="lg"
                  rightIcon={
                    currentStep === totalSteps ? (
                      <Ionicons name="checkmark" size={20} />
                    ) : (
                      <Ionicons name="arrow-forward" size={20} />
                    )
                  }
                >
                  {currentStep === totalSteps ? 'Complete Profile' : 'Continue'}
                </FormSubmit>
              </HStack>
            </Card>
          </Form>
          
          {/* Skip Option */}
          {currentStep === 1 && (
            <Box mt={4 as SpacingScale} alignItems="center">
              <Button
                variant="link"
                size="sm"
                onPress={() => router.replace('/(home)')}
              >
                Skip for now
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </ProtectedRoute>
  );
}

// Import Input separately to avoid circular dependency
import { Input } from "@/components/universal/Input";