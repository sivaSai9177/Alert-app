import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { Box, Text, Card, CardContent } from "@/components/universal";
import { useTheme } from "@/lib/theme/theme-provider";
import { BorderRadius, SpacingScale } from "@/lib/design-system";

export type UserRole = 'guest' | 'user' | 'manager' | 'admin';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  organizationFlow: 'none' | 'optional' | 'create';
  icon: string;
}

interface RoleSelectorProps {
  selectedRole?: UserRole;
  onRoleSelect: (role: UserRole) => void;
  className?: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'guest',
    label: 'Guest',
    description: 'Browse and explore features',
    organizationFlow: 'none',
    icon: '👋'
  },
  {
    value: 'user',
    label: 'Individual User',
    description: 'Personal workspace and features',
    organizationFlow: 'optional',
    icon: '👤'
  },
  {
    value: 'manager',
    label: 'Team Manager',
    description: 'Manage team members and projects',
    organizationFlow: 'create',
    icon: '👥'
  },
  {
    value: 'admin',
    label: 'Organization Admin',
    description: 'Full organization management',
    organizationFlow: 'create',
    icon: '⚙️'
  }
];

export function RoleSelector({ selectedRole, onRoleSelect, className }: RoleSelectorProps) {
  const theme = useTheme();
  
  // Use DOM component on web for better accessibility and performance
  if (Platform.OS === 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DOMRoleSelector = require('./RoleSelector.dom').default;
    return <DOMRoleSelector selectedRole={selectedRole} onRoleSelect={onRoleSelect} className={className} />;
  }

  // Native implementation for mobile
  return (
    <Box gap={3 as SpacingScale}>
      <Text size="sm" weight="medium" colorTheme="foreground" mb={2 as SpacingScale}>
        What best describes your role?
      </Text>
      
      {roleOptions.map((role) => {
        const isSelected = selectedRole === role.value;
        
        return (
          <TouchableOpacity
            key={role.value}
            onPress={() => onRoleSelect(role.value)}
            activeOpacity={0.7}
          >
            <Card 
              borderWidth={2}
              borderColor={isSelected ? theme.primary : theme.border}
              bg={isSelected ? theme.primary + '10' : 'transparent'}
            >
              <CardContent p={4 as SpacingScale}>
                <Box flexDirection="row" alignItems="flex-start" gap={3 as SpacingScale}>
                  <Text size="2xl">{role.icon}</Text>
                  
                  <Box flex={1}>
                    <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                      <Text weight="semibold" colorTheme="foreground">
                        {role.label}
                      </Text>
                      
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
                    </Box>
                    
                    <Text size="sm" colorTheme="mutedForeground" mt={1 as SpacingScale}>
                      {role.description}
                    </Text>
                    
                    {role.organizationFlow !== 'none' && (
                      <Text size="xs" colorTheme="primary" mt={2 as SpacingScale}>
                        {role.organizationFlow === 'create' 
                          ? '• Will create organization workspace'
                          : '• Can join existing organization'
                        }
                      </Text>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </TouchableOpacity>
        );
      })}
    </Box>
  );
}

export { roleOptions };
export type { RoleOption };