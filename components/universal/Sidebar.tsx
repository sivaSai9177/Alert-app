import React, { useState, useContext, createContext, useEffect } from 'react';
import {
  View,
  ViewStyle,
  Pressable,
  Platform,
  Dimensions,
  LayoutAnimation,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Box } from './Box';
import { VStack, HStack } from './Stack';
import { Text } from './Text';
import { Button } from './Button';
import { Separator } from './Separator';
import { ScrollContainer } from './ScrollContainer';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { Ionicons } from '@expo/vector-icons';
import { SpacingScale } from '@/lib/design-system';

// Sidebar Context
interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  openGroups: string[];
  toggleGroup: (groupId: string) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// Types
export interface SidebarNavItem {
  id: string;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  href?: string;
  badge?: string | number;
  items?: SidebarNavItem[];
  isActive?: boolean;
  onPress?: () => void;
}

export interface SidebarProps {
  children: React.ReactNode;
  collapsible?: 'icon' | 'none';
  defaultCollapsed?: boolean;
  style?: ViewStyle;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  style?: ViewStyle;
}

// Sidebar Provider
export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
  style,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(!defaultOpen);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isMobile = dimensions.width < 768;

  const toggleGroup = (groupId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        openGroups,
        toggleGroup,
        isMobile,
      }}
    >
      <View style={[{ flex: 1, flexDirection: 'row' }, style]}>
        {children}
      </View>
    </SidebarContext.Provider>
  );
};

// Main Sidebar Component
export const Sidebar: React.FC<SidebarProps> = ({
  children,
  collapsible = 'icon',
  defaultCollapsed = false,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { isCollapsed, isMobile } = useSidebar();

  const sidebarWidth = isCollapsed ? 60 : 280;

  if (isMobile) {
    return null; // Use drawer on mobile
  }

  return (
    <Box
      bgTheme="card"
      borderRightWidth={1}
      borderTheme="border"
      style={[
        {
          width: sidebarWidth,
          height: '100%',
          ...(Platform.OS === 'web' && {
            transition: 'width 0.2s ease',
          }),
        },
        style,
      ]}
    >
      {children}
    </Box>
  );
};

// Sidebar Header
export const SidebarHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { spacing } = useSpacing();
  return (
    <Box p={4 as SpacingScale} borderBottomWidth={1} borderTheme="border">
      {children}
    </Box>
  );
};

// Sidebar Content
export const SidebarContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ScrollContainer flex={1} showsVerticalScrollIndicator={false}>
      <VStack spacing={2} p={2 as SpacingScale}>
        {children}
      </VStack>
    </ScrollContainer>
  );
};

// Sidebar Footer
export const SidebarFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { spacing } = useSpacing();
  return (
    <Box p={4 as SpacingScale} borderTopWidth={1} borderTheme="border">
      {children}
    </Box>
  );
};

// Sidebar Rail (collapse button)
export const SidebarRail: React.FC = () => {
  const theme = useTheme();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <Box
      position="absolute"
      right={-12}
      top="50%"
      style={{ transform: [{ translateY: -12 }] }}
    >
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setIsCollapsed(!isCollapsed);
        }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: theme.background,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center',
          justifyContent: 'center',
          ...(Platform.OS === 'web' && {
            cursor: 'pointer',
          }),
        }}
      >
        <Ionicons
          name={isCollapsed ? 'chevron-forward' : 'chevron-back'}
          size={16}
          color={theme.foreground}
        />
      </Pressable>
    </Box>
  );
};

// Sidebar Trigger (for mobile/header)
export const SidebarTrigger: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const theme = useTheme();
  
  return (
    <Button variant="ghost" size="sm" onPress={onPress}>
      <Ionicons name="menu" size={20} color={theme.foreground} />
    </Button>
  );
};

// Sidebar Inset (main content area)
export const SidebarInset: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box flex={1} bgTheme="background">
      {children}
    </Box>
  );
};

// Nav Main Component
interface NavMainProps {
  items: SidebarNavItem[];
}

export const NavMain: React.FC<NavMainProps> = ({ items }) => {
  const router = useRouter();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { isCollapsed, openGroups, toggleGroup } = useSidebar();

  const handlePress = (item: SidebarNavItem) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.href) {
      router.push(item.href as any);
    } else if (item.items) {
      toggleGroup(item.id);
    }
  };

  const renderNavItem = (item: SidebarNavItem, level = 0) => {
    const isOpen = openGroups.includes(item.id);
    const hasChildren = item.items && item.items.length > 0;

    const itemContent = (
      <Pressable
        onPress={() => handlePress(item)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[2],
          marginLeft: level * spacing[4],
          borderRadius: spacing[2],
          backgroundColor: item.isActive
            ? theme.accent
            : pressed
            ? theme.muted
            : 'transparent',
          ...(Platform.OS === 'web' && {
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }),
        })}
      >
        {item.icon && (
          <Ionicons
            name={item.icon}
            size={20}
            color={item.isActive ? theme.accentForeground : theme.foreground}
            style={{ marginRight: isCollapsed ? 0 : spacing[3] }}
          />
        )}
        {!isCollapsed && (
          <>
            <Box flex={1}>
              <Text
                size="sm"
                weight={item.isActive ? 'medium' : 'normal'}
                style={{
                  color: item.isActive ? theme.accentForeground : theme.foreground,
                }}
              >
                {item.title}
              </Text>
            </Box>
            {item.badge && (
              <Badge variant="secondary" size="sm">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <Ionicons
                name={isOpen ? 'chevron-down' : 'chevron-forward'}
                size={16}
                color={theme.mutedForeground}
              />
            )}
          </>
        )}
      </Pressable>
    );

    return (
      <View key={item.id}>
        {isCollapsed && item.icon ? (
          <Tooltip content={item.title}>
            {itemContent}
          </Tooltip>
        ) : (
          itemContent
        )}
        {!isCollapsed && hasChildren && isOpen && (
          <VStack spacing={1} mt={1 as SpacingScale}>
            {item.items!.map(subItem => renderNavItem(subItem, level + 1))}
          </VStack>
        )}
      </View>
    );
  };

  return (
    <VStack spacing={1}>
      {items.map(item => renderNavItem(item))}
    </VStack>
  );
};

// Nav User Component
interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const NavUser: React.FC<NavUserProps> = ({ user }) => {
  const { spacing } = useSpacing();
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  if (isCollapsed) {
    return (
      <Tooltip content={user.name}>
        <Pressable
          onPress={() => router.push('/(home)/settings' as any)}
          style={{
            padding: spacing[2],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Avatar name={user.name} size="sm" source={user.avatar ? { uri: user.avatar } : undefined} />
        </Pressable>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="ghost"
      fullWidth
      onPress={() => router.push('/(home)/settings' as any)}
    >
      <HStack spacing={3} alignItems="center" flex={1}>
        <Avatar name={user.name} size="sm" source={user.avatar ? { uri: user.avatar } : undefined} />
        <VStack spacing={0} flex={1}>
          <Text size="sm" weight="medium" numberOfLines={1}>
            {user.name}
          </Text>
          <Text size="xs" colorTheme="mutedForeground" numberOfLines={1}>
            {user.email}
          </Text>
        </VStack>
      </HStack>
    </Button>
  );
};

// Team Switcher Component
interface Team {
  name: string;
  logo?: React.ReactNode;
  plan?: string;
}

interface TeamSwitcherProps {
  teams: Team[];
  activeTeam?: string;
  onTeamChange?: (team: string) => void;
}

export const TeamSwitcher: React.FC<TeamSwitcherProps> = ({
  teams,
  activeTeam,
}) => {
  const theme = useTheme();
  const { isCollapsed } = useSidebar();
  const selectedTeam = activeTeam || teams[0]?.name;

  const currentTeam = teams.find(t => t.name === selectedTeam) || teams[0];

  if (isCollapsed) {
    return (
      <Tooltip content={currentTeam.name}>
        <Box p={2 as SpacingScale} alignItems="center">
          <Box
            style={{ width: 32, height: 32 }}
            rounded="md"
            bgTheme="primary"
            alignItems="center"
            justifyContent="center"
          >
            <Text size="sm" weight="bold" style={{ color: theme.primaryForeground }}>
              {currentTeam.name.charAt(0)}
            </Text>
          </Box>
        </Box>
      </Tooltip>
    );
  }

  return (
    <VStack spacing={2}>
      <HStack spacing={3} alignItems="center">
        <Box
          style={{ width: 32, height: 32 }}
          rounded="md"
          bgTheme="primary"
          alignItems="center"
          justifyContent="center"
        >
          <Text size="sm" weight="bold" style={{ color: theme.primaryForeground }}>
            {currentTeam.name.charAt(0)}
          </Text>
        </Box>
        <VStack spacing={0} flex={1}>
          <Text size="sm" weight="medium">
            {currentTeam.name}
          </Text>
          {currentTeam.plan && (
            <Text size="xs" colorTheme="mutedForeground">
              {currentTeam.plan}
            </Text>
          )}
        </VStack>
      </HStack>
    </VStack>
  );
};