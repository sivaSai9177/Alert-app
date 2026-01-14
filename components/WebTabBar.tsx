import React from 'react';
import { Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Box, Text } from '@/components/universal';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { useAuth } from '@/hooks/useAuth';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface TabConfig {
  name: string;
  href: string;
  icon: string;
  label: string;
  requiresRole?: string;
  IconComponent?: React.ComponentType<any>;
}

const baseTabs: TabConfig[] = [
  { name: 'index', href: '/(home)', icon: 'house.fill', label: 'Home' },
  { name: 'explore', href: '/(home)/explore', icon: 'paperplane.fill', label: 'Explore' },
];

const roleTabs: TabConfig[] = [
  { 
    name: 'admin', 
    href: '/(home)/admin', 
    icon: 'shield-checkmark', 
    label: 'Admin',
    requiresRole: 'admin',
    IconComponent: Ionicons 
  },
  { 
    name: '_manager', 
    href: '/(home)/_manager', 
    icon: 'people', 
    label: 'Team',
    requiresRole: 'manager',
    IconComponent: Ionicons 
  },
];

const settingsTab: TabConfig = { 
  name: 'settings', 
  href: '/(home)/settings', 
  icon: 'gearshape.fill', 
  label: 'Settings' 
};

export function WebTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { user } = useAuth();
  const activeColor = theme.primary;
  const inactiveColor = theme.mutedForeground;
  const [hoveredTab, setHoveredTab] = React.useState<string | null>(null);

  // Build tabs based on user role
  const tabs = React.useMemo(() => {
    const userTabs = [...baseTabs];
    
    // Add role-specific tabs
    roleTabs.forEach(tab => {
      if (tab.requiresRole && user?.role === tab.requiresRole) {
        userTabs.push(tab);
      }
    });
    
    // Always add settings at the end
    userTabs.push(settingsTab);
    
    return userTabs;
  }, [user?.role]);

  const handleTabPress = (e: any, href: string) => {
    // Prevent default browser navigation
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Use haptic feedback on native
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Use replace for tab navigation to avoid history buildup
    if (pathname !== href) {
      router.replace(href as any);
    }
  };

  const isActive = (href: string, name: string) => {
    if (href === '/(home)' && (pathname === '/(home)' || pathname === '/(home)/index')) return true;
    if (pathname === href) return true;
    return false;
  };

  return (
    <Box 
      flexDirection="row"
      bgTheme="background"
      borderTopWidth={1}
      borderTheme="border"
      pb={3}
      pt={2}
      px={2}
      style={{
        ...(Platform.OS === 'web' && {
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }),
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href, tab.name);
        const isHovered = hoveredTab === tab.name;
        const color = active ? activeColor : (isHovered ? activeColor + 'CC' : inactiveColor);

        return (
          <Pressable
            key={tab.name}
            style={{ 
              flex: 1, 
              alignItems: 'center', 
              justifyContent: 'center',
              paddingVertical: spacing[2],
              paddingHorizontal: spacing[2],
              marginHorizontal: spacing[1],
              borderRadius: spacing[2],
              backgroundColor: active ? theme.primary + '15' : (isHovered ? theme.muted : 'transparent'),
              ...(Platform.OS === 'web' && {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }),
            }}
            onPress={(e) => handleTabPress(e, tab.href)}
            onPressIn={() => Platform.OS === 'web' && setHoveredTab(tab.name)}
            onPressOut={() => Platform.OS === 'web' && setHoveredTab(null)}
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoveredTab(tab.name),
              onMouseLeave: () => setHoveredTab(null),
            })}
          >
            <Box alignItems="center" position="relative">
              {tab.IconComponent ? (
                <tab.IconComponent
                  size={24}
                  name={tab.icon}
                  color={color}
                  style={Platform.OS === 'web' ? {
                    transition: 'color 0.2s ease',
                  } as any : undefined}
                />
              ) : (
                <IconSymbol 
                  size={28} 
                  name={tab.icon as any} 
                  color={color} 
                  style={Platform.OS === 'web' ? {
                    transition: 'color 0.2s ease',
                  } as any : undefined}
                />
              )}
              <Text 
                size="xs" 
                weight={active ? 'semibold' : 'normal'}
                style={{ 
                  marginTop: spacing[1], 
                  color,
                  ...(Platform.OS === 'web' && {
                    transition: 'all 0.2s ease',
                  } as any),
                }}
              >
                {tab.label}
              </Text>
              {active && (
                <Box
                  position="absolute"
                  bottom={-spacing[2]}
                  width="80%"
                  height={2}
                  bgTheme="primary"
                  rounded="full"
                  style={Platform.OS === 'web' ? {
                    transition: 'all 0.3s ease',
                  } as any : undefined}
                />
              )}
            </Box>
          </Pressable>
        );
      })}
    </Box>
  );
}