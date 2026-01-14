import React, { useState } from 'react';
import {
  View,
  Pressable,
  Platform,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Box } from './Box';
import { HStack, VStack } from './Stack';
import { Text } from './Text';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Separator } from './Separator';
import { Ionicons } from '@expo/vector-icons';
import { SpacingScale } from '@/lib/design-system';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './DropdownMenu';

// Types
export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
  requiresRole?: string[];
  children?: NavItem[];
}

export interface NavbarProps {
  variant?: 'tabs' | 'sidebar' | 'header';
  items: NavItem[];
  user?: {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  };
  logo?: React.ReactNode;
  onItemPress?: (item: NavItem) => void;
}

// Get device info
const { width: screenWidth } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && screenWidth >= 1024;
const isTablet = Platform.OS === 'web' && screenWidth >= 768 && screenWidth < 1024;
const isMobile = !isDesktop && !isTablet;

// WebTabBar variant for web
const WebTabBarVariant: React.FC<NavbarProps> = ({ items, user, onItemPress }) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { spacing } = useSpacing();

  const handleNavigation = (item: NavItem) => {
    if (onItemPress) {
      onItemPress(item);
    } else {
      router.push(item.href as any);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <Box
      style={{
        height: 64,
        backgroundColor: theme.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.border,
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.05)',
        elevation: 3,
      }}
    >
      <HStack flex={1} px={4 as SpacingScale} alignItems="center" justifyContent="space-between">
        {/* Left side - Navigation */}
        <HStack spacing={2} alignItems="center" flex={1}>
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Pressable
                key={item.id}
                onPress={() => handleNavigation(item)}
                style={({ pressed }) => ({
                  paddingHorizontal: spacing[3],
                  paddingVertical: spacing[2],
                  borderRadius: 8,
                  backgroundColor: pressed 
                    ? theme.accent 
                    : active 
                    ? theme.accent 
                    : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <HStack spacing={2} alignItems="center">
                  {item.icon && (
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={active ? theme.accentForeground : theme.mutedForeground}
                    />
                  )}
                  <Text
                    size="sm"
                    weight={active ? 'medium' : 'normal'}
                    color={active ? theme.accentForeground : theme.foreground}
                  >
                    {item.title}
                  </Text>
                  {item.badge && (
                    <Badge size="sm" variant="secondary">
                      {item.badge}
                    </Badge>
                  )}
                </HStack>
              </Pressable>
            );
          })}
        </HStack>

        {/* Right side - User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <HStack spacing={2} alignItems="center">
                  <Avatar 
                    source={user.image ? { uri: user.image } : undefined}
                    name={user.name || user.email}
                    size="sm"
                  />
                  <Text size="sm" weight="medium">
                    {user.name || 'User'}
                  </Text>
                </HStack>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Box p={2 as SpacingScale}>
                <Text weight="medium">{user.name}</Text>
                <Text size="xs" colorTheme="mutedForeground">{user.email}</Text>
              </Box>
              <DropdownMenuSeparator />
              <DropdownMenuItem onPress={() => router.push('/(home)/settings')}>
                <HStack spacing={2} alignItems="center">
                  <Ionicons name="settings-outline" size={16} />
                  <Text>Settings</Text>
                </HStack>
              </DropdownMenuItem>
              <DropdownMenuItem onPress={() => router.push('/(home)')}>
                <HStack spacing={2} alignItems="center">
                  <Ionicons name="home-outline" size={16} />
                  <Text>Home</Text>
                </HStack>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </HStack>
    </Box>
  );
};

// Sidebar variant (sidebar-07 pattern)
const SidebarVariant: React.FC<NavbarProps & { isOpen?: boolean; onToggle?: () => void }> = ({ 
  items, 
  user, 
  logo,
  isOpen = true,
  onToggle,
  onItemPress 
}) => {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { spacing, componentSpacing } = useSpacing();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const handleNavigation = (item: NavItem) => {
    if (item.children) {
      setExpandedGroups(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (onItemPress) {
      onItemPress(item);
    } else {
      router.push(item.href as any);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.id);

    return (
      <View key={item.id}>
        <Pressable
          onPress={() => handleNavigation(item)}
          style={({ pressed }) => ({
            paddingHorizontal: spacing[3] + (level * spacing[4]),
            paddingVertical: spacing[2],
            borderRadius: 8,
            backgroundColor: pressed 
              ? theme.accent 
              : active 
              ? theme.accent 
              : 'transparent',
            opacity: pressed ? 0.8 : 1,
            marginVertical: 2,
          })}
        >
          <HStack alignItems="center" justifyContent="space-between">
            <HStack spacing={3} alignItems="center" flex={1}>
              {item.icon && (
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={active ? theme.accentForeground : theme.mutedForeground}
                />
              )}
              {isOpen && (
                <Text
                  size="sm"
                  weight={active ? 'medium' : 'normal'}
                  color={active ? theme.accentForeground : theme.foreground}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              )}
              {item.badge && isOpen && (
                <Badge size="sm" variant="secondary" ml="auto">
                  {item.badge}
                </Badge>
              )}
            </HStack>
            {hasChildren && isOpen && (
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={theme.mutedForeground}
              />
            )}
          </HStack>
        </Pressable>
        
        {hasChildren && isExpanded && isOpen && (
          <VStack>
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </VStack>
        )}
      </View>
    );
  };

  return (
    <Box
      width={isOpen ? 240 : 60}
      bgTheme="card"
      borderRightWidth={1}
      borderTheme="border"
      style={{
        transition: 'width 0.2s ease',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box p={3 as SpacingScale} borderBottomWidth={1} borderTheme="border">
        <HStack justifyContent="space-between" alignItems="center">
          {isOpen ? (
            logo || <Text weight="semibold" size="lg">App Name</Text>
          ) : (
            <Ionicons name="apps" size={24} color={theme.primary} />
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onPress={onToggle}
            >
              <Ionicons 
                name={isOpen ? 'chevron-back' : 'chevron-forward'} 
                size={20} 
                color={theme.foreground} 
              />
            </Button>
          )}
        </HStack>
      </Box>

      {/* Navigation Items */}
      <ScrollView style={{ flex: 1 }}>
        <VStack p={2 as SpacingScale}>
          {items.map(item => renderNavItem(item))}
        </VStack>
      </ScrollView>

      {/* Footer with user info */}
      {user && (
        <Box p={3 as SpacingScale} borderTopWidth={1} borderTheme="border">
          <HStack spacing={2} alignItems="center">
            <Avatar 
              source={user.image ? { uri: user.image } : undefined}
              name={user.name || user.email}
              size="sm"
            />
            {isOpen && (
              <VStack flex={1} spacing={0}>
                <Text size="sm" weight="medium" numberOfLines={1}>
                  {user.name || 'User'}
                </Text>
                <Text size="xs" colorTheme="mutedForeground" numberOfLines={1}>
                  {user.email}
                </Text>
              </VStack>
            )}
          </HStack>
        </Box>
      )}
    </Box>
  );
};

// Main Navbar component
export const Navbar: React.FC<NavbarProps> = (props) => {
  const { variant = 'tabs', ...rest } = props;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Use tabs for mobile, specified variant for web/tablet
  const actualVariant = Platform.OS !== 'web' || isMobile ? 'tabs' : variant;

  switch (actualVariant) {
    case 'sidebar':
      return (
        <SidebarVariant 
          {...rest} 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      );
    case 'tabs':
    case 'header':
    default:
      return <WebTabBarVariant {...rest} />;
  }
};

// Export variants for direct use
export const NavbarTabs = WebTabBarVariant;
export const NavbarSidebar = SidebarVariant;