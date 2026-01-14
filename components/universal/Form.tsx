import React from 'react';
import {
  useForm,
  Controller,
  UseFormReturn,
  FieldValues,
  FieldPath,
  ControllerProps,
  RegisterOptions,
} from 'react-hook-form';
import { View, ViewStyle, TextStyle } from 'react-native';
import { Button, ButtonProps } from './Button';
import { VStack } from './Stack';
import { FormField } from './Label';
import { SpacingScale } from '@/lib/design-system';
import { useSpacing } from '@/contexts/SpacingContext';

// Form Context
interface FormContextValue<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
}

const FormContext = React.createContext<FormContextValue | null>(null);

export const useFormContext = <TFieldValues extends FieldValues = FieldValues>() => {
  const context = React.useContext(FormContext) as FormContextValue<TFieldValues>;
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context.form;
};

// Form Provider Component
export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  children: React.ReactNode;
  style?: ViewStyle;
  spacing?: SpacingScale;
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  style,
  spacing = 4,
}: FormProps<TFieldValues>) {
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <FormContext.Provider value={{ form }}>
      <View style={style}>
        <VStack spacing={spacing}>
          {children}
        </VStack>
      </View>
    </FormContext.Provider>
  );
}

// Form Field Wrapper
export interface FormItemProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  label?: string;
  hint?: string;
  required?: boolean;
  rules?: RegisterOptions<TFieldValues, TName>;
  children: (field: ControllerProps<TFieldValues, TName>['field']) => React.ReactNode;
  style?: ViewStyle;
}

export function FormItem<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  hint,
  required,
  rules,
  children,
  style,
}: FormItemProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  const error = form.formState.errors[name];

  return (
    <Controller
      control={form.control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormField
          label={label || ''}
          required={required}
          hint={hint}
          error={error?.message}
          style={style}
        >
          {children(field)}
        </FormField>
      )}
    />
  );
}

// Form Submit Button
export interface FormSubmitProps extends Omit<ButtonProps, 'onPress' | 'type'> {
  onPress?: () => void;
}

export const FormSubmit: React.FC<FormSubmitProps> = ({
  children = 'Submit',
  isLoading,
  isDisabled,
  onPress,
  ...props
}) => {
  const form = useFormContext();
  const { isSubmitting, isValid } = form.formState;

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    // The actual form submission is handled by the Form component
    form.handleSubmit(() => {})();
  };

  return (
    <Button
      type="submit"
      onPress={handlePress}
      isLoading={isLoading || isSubmitting}
      isDisabled={isDisabled || !isValid || isSubmitting}
      {...props}
    >
      {children}
    </Button>
  );
};

// Form Error Message
export interface FormErrorProps {
  name?: string;
  style?: TextStyle;
}

export const FormError: React.FC<FormErrorProps> = ({ name, style }) => {
  const form = useFormContext();
  const theme = useTheme();
  const error = name ? form.formState.errors[name] : form.formState.errors.root;

  const errorMessage = error?.message || (typeof error === 'string' ? error : null);
  
  if (!errorMessage) return null;

  return (
    <Text
      size="sm"
      style={{
        color: theme.destructive,
        ...style,
      }}
    >
      {errorMessage}
    </Text>
  );
};

// Form utilities and helpers
export { useForm, Controller } from 'react-hook-form';
export type { UseFormReturn, FieldValues, FieldPath, RegisterOptions } from 'react-hook-form';

// Pre-configured form field components
export const FormInput: React.FC<
  FormItemProps & { placeholder?: string; type?: string }
> = ({ name, label, rules, placeholder, type, ...props }) => {
  return (
    <FormItem name={name} label={label} rules={rules} {...props}>
      {(field) => (
        <Input
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          secureTextEntry={type === 'password'}
        />
      )}
    </FormItem>
  );
};

export const FormSelect: React.FC<
  FormItemProps & { options: any[]; placeholder?: string }
> = ({ name, label, rules, options, placeholder, ...props }) => {
  return (
    <FormItem name={name} label={label} rules={rules} {...props}>
      {(field) => (
        <Select
          value={field.value}
          onValueChange={field.onChange}
          options={options}
          placeholder={placeholder}
        />
      )}
    </FormItem>
  );
};

export const FormCheckbox: React.FC<
  FormItemProps & { checkboxLabel?: string }
> = ({ name, label, rules, checkboxLabel, ...props }) => {
  return (
    <FormItem name={name} label={label} rules={rules} {...props}>
      {(field) => (
        <HStack spacing={2} alignItems="center">
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
          />
          {checkboxLabel && (
            <Text size="sm">{checkboxLabel}</Text>
          )}
        </HStack>
      )}
    </FormItem>
  );
};

export const FormSwitch: React.FC<
  FormItemProps & { switchLabel?: string }
> = ({ name, label, rules, switchLabel, ...props }) => {
  return (
    <FormItem name={name} label={label} rules={rules} {...props}>
      {(field) => (
        <HStack spacing={2} alignItems="center" justifyContent="space-between">
          {switchLabel && (
            <Text size="sm">{switchLabel}</Text>
          )}
          <Switch
            value={field.value}
            onValueChange={field.onChange}
          />
        </HStack>
      )}
    </FormItem>
  );
};

// Import necessary components
import { Text } from './Text';
import { Input } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { Switch } from './Switch';
import { HStack } from './Stack';
import { useTheme } from '@/lib/theme/theme-provider';