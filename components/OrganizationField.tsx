import React from "react";
import { z } from 'zod';
import { Box, Text, Input } from "@/components/universal";
import { UseFormReturn } from "react-hook-form";
import { UserRole } from "./RoleSelector";
import { IconSymbol } from "./ui/IconSymbol";
import { useTheme } from "@/lib/theme/theme-provider";

interface OrganizationFieldProps {
  form: UseFormReturn<any>;
  role: UserRole;
}

export function OrganizationField({ form, role }: OrganizationFieldProps) {
  const theme = useTheme();
  
  if (role === 'guest') {
    return null; // No organization field for guests
  }

  if (role === 'user') {
    const organizationCode = form.watch('organizationCode');
    const error = form.formState.errors.organizationCode?.message;

    return (
      <Box>
        <Input
          label="Organization Code (Optional)"
          placeholder="ACME2024"
          autoCapitalize="characters"
          value={organizationCode || ''}
          onChangeText={(text) => form.setValue('organizationCode', text.toUpperCase())}
          error={error as string}
          hint="Enter your organization's code to join their workspace"
          leftElement={
            <IconSymbol 
              name="building.2.fill" 
              size={20} 
              color={theme.mutedForeground}
            />
          }
        />
        
        <Box 
          mt={2} 
          p={2} 
          bgTheme="muted"
          rounded="sm"
          borderWidth={1}
          borderTheme="border"
        >
          <Text size="sm" colorTheme="mutedForeground">
            💡 Don&apos;t have a code? No problem! You&apos;ll get your own personal workspace.
          </Text>
        </Box>
      </Box>
    );
  }

  if (role === 'manager' || role === 'admin') {
    const organizationName = form.watch('organizationName');
    const error = form.formState.errors.organizationName?.message;

    return (
      <Box>
        <Input
          label="Organization Name"
          placeholder="Acme Corporation"
          value={organizationName || ''}
          onChangeText={(text) => form.setValue('organizationName', text)}
          error={error as string}
          hint="This will create a new organization workspace"
          leftElement={
            <IconSymbol 
              name="building.fill" 
              size={20} 
              color={theme.mutedForeground}
            />
          }
        />
        
        <Box 
          mt={3} 
          p={3} 
          bgTheme="accent"
          rounded="md"
          borderWidth={1}
          borderTheme="border"
        >
          <Text size="sm" weight="medium" colorTheme="foreground" mb={1}>
            🎉 Creating New Organization
          </Text>
          <Text size="sm" colorTheme="mutedForeground" lineHeight="relaxed">
            • A unique organization code will be generated for your team
            {'\n'}• You&apos;ll be able to invite team members after signup
            {'\n'}• You&apos;ll have full administrative access
          </Text>
        </Box>
      </Box>
    );
  }

  return null;
}

// Validation schemas
export const organizationCodeSchema = z.string()
  .min(4, 'Organization code must be at least 4 characters')
  .max(12, 'Organization code too long')
  .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers')
  .optional();

export const organizationNameSchema = z.string()
  .min(2, 'Organization name must be at least 2 characters')
  .max(100, 'Organization name too long')
  .trim()
  .optional();