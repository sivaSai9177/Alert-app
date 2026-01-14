import React, { useState } from 'react';
import { View, Pressable, ViewStyle, ScrollView } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  content?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  optional?: boolean;
  disabled?: boolean;
  error?: boolean;
  completed?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  activeStep: number;
  onStepChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'compact' | 'dots';
  showStepNumbers?: boolean;
  showNavigation?: boolean;
  navigationPosition?: 'bottom' | 'top' | 'both';
  allowStepClick?: boolean;
  linear?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  navigationStyle?: ViewStyle;
  testID?: string;
}

export const Stepper = React.forwardRef<View, StepperProps>(
  (
    {
      steps,
      activeStep,
      onStepChange,
      orientation = 'horizontal',
      variant = 'default',
      showStepNumbers = true,
      showNavigation = true,
      navigationPosition = 'bottom',
      allowStepClick = true,
      linear = true,
      style,
      contentStyle,
      navigationStyle,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();

    const canNavigateToStep = (stepIndex: number) => {
      if (!linear) return true;
      if (stepIndex <= activeStep) return true;
      
      // Check if all previous steps are completed
      for (let i = 0; i < stepIndex; i++) {
        if (!steps[i].completed && i !== activeStep) return false;
      }
      
      return true;
    };

    const handleStepClick = (stepIndex: number) => {
      if (
        allowStepClick &&
        onStepChange &&
        !steps[stepIndex].disabled &&
        canNavigateToStep(stepIndex)
      ) {
        onStepChange(stepIndex);
      }
    };

    const handleNext = () => {
      if (onStepChange && activeStep < steps.length - 1) {
        onStepChange(activeStep + 1);
      }
    };

    const handlePrevious = () => {
      if (onStepChange && activeStep > 0) {
        onStepChange(activeStep - 1);
      }
    };

    const getStepStatus = (stepIndex: number, step: StepperStep) => {
      if (step.error) return 'error';
      if (step.completed || stepIndex < activeStep) return 'completed';
      if (stepIndex === activeStep) return 'active';
      return 'pending';
    };

    const getStepColor = (status: string) => {
      switch (status) {
        case 'completed':
          return theme.success || theme.primary;
        case 'active':
          return theme.primary;
        case 'error':
          return theme.destructive;
        default:
          return theme.mutedForeground;
      }
    };

    const renderStepIcon = (step: StepperStep, stepIndex: number, status: string) => {
      const iconSize = variant === 'compact' ? 24 : 32;
      const iconColor = getStepColor(status);

      const iconContainerStyle: ViewStyle = {
        width: iconSize,
        height: iconSize,
        borderRadius: variant === 'dots' ? iconSize / 2 : 8,
        backgroundColor: status === 'active' ? iconColor : theme.background,
        borderWidth: 2,
        borderColor: iconColor,
        alignItems: 'center',
        justifyContent: 'center',
      };

      if (variant === 'dots') {
        return (
          <View
            style={[
              iconContainerStyle,
              {
                width: status === 'active' ? 12 : 8,
                height: status === 'active' ? 12 : 8,
                backgroundColor: iconColor,
                borderWidth: 0,
              },
            ]}
          />
        );
      }

      let iconContent: React.ReactNode;

      if (status === 'completed') {
        iconContent = (
          <Ionicons
            name="checkmark"
            size={iconSize * 0.6}
            color={theme.background}
          />
        );
      } else if (status === 'error') {
        iconContent = (
          <Ionicons
            name="close"
            size={iconSize * 0.6}
            color={theme.background}
          />
        );
      } else if (step.icon) {
        iconContent = (
          <Ionicons
            name={step.icon}
            size={iconSize * 0.6}
            color={status === 'active' ? theme.background : iconColor}
          />
        );
      } else if (showStepNumbers) {
        iconContent = (
          <Text
            size="sm"
            weight="semibold"
            style={{ color: status === 'active' ? theme.background : iconColor }}
          >
            {stepIndex + 1}
          </Text>
        );
      }

      return <View style={iconContainerStyle}>{iconContent}</View>;
    };

    const renderConnector = (status: string, isLast: boolean) => {
      if (isLast) return null;

      const connectorStyle: ViewStyle = {
        flex: 1,
        height: 2,
        backgroundColor: status === 'completed' ? getStepColor(status) : theme.border,
        marginHorizontal: spacing(2),
      };

      if (orientation === 'vertical') {
        connectorStyle.width = 2;
        connectorStyle.height = 40;
        connectorStyle.marginHorizontal = 0;
        connectorStyle.marginVertical = spacing(1);
      }

      return <View style={connectorStyle} />;
    };

    const renderStep = (step: StepperStep, stepIndex: number) => {
      const status = getStepStatus(stepIndex, step);
      const isLast = stepIndex === steps.length - 1;
      const canClick = allowStepClick && !step.disabled && canNavigateToStep(stepIndex);

      const stepContainerStyle: ViewStyle = {
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        flex: orientation === 'horizontal' ? 1 : undefined,
      };

      const labelContainerStyle: ViewStyle = {
        alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
        marginTop: orientation === 'horizontal' ? spacing(2) : 0,
        marginLeft: orientation === 'vertical' ? spacing(3) : 0,
      };

      return (
        <View key={step.id} style={stepContainerStyle}>
          <Pressable
            onPress={() => handleStepClick(stepIndex)}
            disabled={!canClick}
            style={{
              flexDirection: orientation === 'horizontal' ? 'column' : 'row',
              alignItems: 'center',
              opacity: step.disabled ? 0.5 : 1,
            }}
          >
            {renderStepIcon(step, stepIndex, status)}
            
            {variant !== 'dots' && (
              <View style={labelContainerStyle}>
                <Text
                  size={variant === 'compact' ? 'sm' : 'md'}
                  weight={status === 'active' ? 'semibold' : 'medium'}
                  colorTheme={status === 'active' ? 'foreground' : 'mutedForeground'}
                  style={{ textAlign: orientation === 'horizontal' ? 'center' : 'left' }}
                >
                  {step.title}
                </Text>
                {step.description && variant !== 'compact' && (
                  <Text
                    size="xs"
                    colorTheme="mutedForeground"
                    style={{
                      textAlign: orientation === 'horizontal' ? 'center' : 'left',
                      marginTop: spacing(0.5),
                    }}
                  >
                    {step.description}
                  </Text>
                )}
                {step.optional && (
                  <Text
                    size="xs"
                    colorTheme="mutedForeground"
                    style={{
                      textAlign: orientation === 'horizontal' ? 'center' : 'left',
                      fontStyle: 'italic',
                    }}
                  >
                    Optional
                  </Text>
                )}
              </View>
            )}
          </Pressable>
          
          {orientation === 'horizontal' && renderConnector(status, isLast)}
        </View>
      );
    };

    const renderNavigation = () => {
      if (!showNavigation) return null;

      const isFirstStep = activeStep === 0;
      const isLastStep = activeStep === steps.length - 1;
      const currentStep = steps[activeStep];

      const navigationContainerStyle: ViewStyle = {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing(3),
        ...navigationStyle,
      };

      return (
        <View style={navigationContainerStyle}>
          <Button
            variant="outline"
            size="sm"
            onPress={handlePrevious}
            disabled={isFirstStep}
            leftIcon={<Ionicons name="arrow-back" size={16} />}
          >
            Previous
          </Button>

          <Text size="sm" colorTheme="mutedForeground">
            Step {activeStep + 1} of {steps.length}
          </Text>

          <Button
            variant="solid"
            size="sm"
            onPress={handleNext}
            disabled={isLastStep || currentStep.disabled}
            rightIcon={<Ionicons name="arrow-forward" size={16} />}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </View>
      );
    };

    const containerStyle: ViewStyle = {
      ...style,
    };

    const stepperContainerStyle: ViewStyle = {
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      alignItems: orientation === 'horizontal' ? 'flex-start' : 'stretch',
      paddingVertical: spacing(2),
    };

    const currentStepContent = steps[activeStep]?.content;

    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        {showNavigation && navigationPosition === 'top' && renderNavigation()}
        
        <ScrollView
          horizontal={orientation === 'horizontal'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={stepperContainerStyle}
        >
          {steps.map((step, index) => renderStep(step, index))}
        </ScrollView>

        {currentStepContent && (
          <View style={[{ marginTop: spacing(4) }, contentStyle]}>
            {currentStepContent}
          </View>
        )}

        {showNavigation && navigationPosition !== 'top' && renderNavigation()}
      </View>
    );
  }
);

Stepper.displayName = 'Stepper';

// Stepper Context for complex forms
interface StepperContextValue {
  activeStep: number;
  steps: StepperStep[];
  setActiveStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (stepId: string) => void;
  setStepError: (stepId: string, error: boolean) => void;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

export const useStepperContext = () => {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error('useStepperContext must be used within StepperProvider');
  }
  return context;
};

export interface StepperProviderProps {
  children: React.ReactNode;
  initialStep?: number;
  steps: StepperStep[];
}

export const StepperProvider: React.FC<StepperProviderProps> = ({
  children,
  initialStep = 0,
  steps: initialSteps,
}) => {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [steps, setSteps] = useState(initialSteps);

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const previousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const completeStep = (stepId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true, error: false } : step
      )
    );
  };

  const setStepError = (stepId: string, error: boolean) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, error, completed: false } : step
      )
    );
  };

  const value: StepperContextValue = {
    activeStep,
    steps,
    setActiveStep,
    nextStep,
    previousStep,
    completeStep,
    setStepError,
  };

  return (
    <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
  );
};