'use dom';

import React from "react";
import { cn } from "@/lib/core/utils";

type UserRole = 'guest' | 'user' | 'manager' | 'admin';

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

export default function RoleSelector({ selectedRole, onRoleSelect, className }: RoleSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-foreground mb-2 block">
        What best describes your role?
      </label>
      
      {roleOptions.map((role) => (
        <button
          key={role.value}
          type="button"
          onClick={() => onRoleSelect(role.value)}
          className={cn(
            "w-full p-4 border-2 rounded-lg transition-colors text-left",
            "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
            selectedRole === role.value 
              ? "border-primary bg-primary/5" 
              : "border-border"
          )}
        >
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{role.icon}</span>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  {role.label}
                </h3>
                
                {selectedRole === role.value && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                {role.description}
              </p>
              
              {role.organizationFlow !== 'none' && (
                <p className="text-xs text-primary mt-2">
                  {role.organizationFlow === 'create' 
                    ? '• Will create organization workspace'
                    : '• Can join existing organization'
                  }
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}