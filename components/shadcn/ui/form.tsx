import * as React from "react";
import { View, Text } from "react-native";
import { Controller, ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/core/utils";

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
};

const FormItem = React.forwardRef<
  View,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  Text,
  React.ComponentProps<typeof Text>
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormDescription = React.forwardRef<
  Text,
  React.ComponentProps<typeof Text>
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  Text,
  React.ComponentProps<typeof Text>
>(({ className, children, ...props }, ref) => {
  return children ? (
    <Text
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </Text>
  ) : null;
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormField,
};