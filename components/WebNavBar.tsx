import React, { useState } from 'react';
import { Platform, Pressable, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';
import { Ionicons } from '@expo/vector-icons';
import {
  Box,
  HStack,
  VStack,
  Text,
  Container,
  Button,
  Badge,
  Avatar,
  Separator,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/universal';
import { ThemeSelector } from '@/components/ThemeSelector';
import { log } from '@/lib/core/logger';

interface NavItem {
  label: string;
  href: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
  requiresAuth?: boolean;
  requiresRole?: string;
}

interface WebNavBarProps {
  variant?: 'default' | 'minimal' | 'dashboard';
  showSearch?: boolean;
  showThemeSelector?: boolean;
  customLogo?: React.ReactNode;
}

export const WebNavBar: React.FC<WebNavBarProps> = ({
  variant = 'default',
  showSearch = true,
  showThemeSelector = true,
  customLogo,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // Check if we're on small screen
  const dimensions = Dimensions.get('window');
  const isMobile = dimensions.width < 768;

  // Navigation items
  const navItems: NavItem[] = [
    { label: 'Home', href: '/(home)', icon: 'home-outline' },
    { label: 'Explore', href: '/(home)/explore', icon: 'compass-outline' },
    { label: 'Components', href: '/(home)/demo-universal', icon: 'cube-outline' },
  ];

  // Add admin/manager items based on role
  if (user?.role === 'admin') {
    navItems.push({ 
      label: 'Admin', 
      href: '/(home)/admin', 
      icon: 'shield-checkmark-outline',
      requiresRole: 'admin',
      badge: 'NEW' 
    });
  }

  const handleNavigation = (href: string) => {
    log.info('Navigation triggered', 'WEB_NAV_BAR', { href, pathname });
    router.push(href as any);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    log.info('Logout triggered', 'WEB_NAV_BAR');
    await logout();
    router.replace('/(auth)/login' as any);
  };

  const handleCommand = (command: string) => {
    setCommandOpen(false);
    switch (command) {
      case 'home':
        handleNavigation('/(home)');
        break;
      case 'explore':
        handleNavigation('/(home)/explore');
        break;
      case 'components':
        handleNavigation('/(home)/demo-universal');
        break;
      case 'admin':
        if (user?.role === 'admin') {
          handleNavigation('/(home)/admin');
        }
        break;
      case 'settings':
        handleNavigation('/(home)/settings');
        break;
      case 'logout':
        handleLogout();
        break;
      case 'theme':
        // Open theme selector
        break;
    }
  };

  // Check if current route is active
  const isActive = (href: string) => {
    if (href === '/(home)' && pathname === '/(home)') return true;
    return pathname.startsWith(href);
  };

  // Desktop Navigation
  const desktopNav = (
    <Box
      bgTheme="background"
      borderBottomWidth={1}
      borderTheme="border"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        ...(Platform.OS === 'web' && {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundColor: theme.background + 'ee',
        }),
      }}
    >
      <Container>
        <HStack
          py={3}
          px={4}
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Left Section - Logo & Navigation */}
          <HStack spacing={8} alignItems="center" flex={1}>
            {/* Logo */}
            <Pressable onPress={() => handleNavigation('/(home)')}>
              {customLogo || (
                <HStack spacing={2} alignItems="center">
                  <Ionicons name="rocket" size={28} color={theme.primary} />
                  <Text size="xl" weight="bold">
                    MyExpo
                  </Text>
                </HStack>
              )}
            </Pressable>

            {/* Navigation Items - Desktop Only */}
            {!isMobile && (
              <HStack spacing={1} alignItems="center">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const hovered = isHovered === item.label;

                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => handleNavigation(item.href)}
                      onHoverIn={() => setIsHovered(item.label)}
                      onHoverOut={() => setIsHovered(null)}
                      style={{
                        paddingHorizontal: spacing[3],
                        paddingVertical: spacing[2],
                        borderRadius: spacing[2],
                        backgroundColor: active
                          ? theme.accent
                          : hovered
                          ? theme.muted
                          : 'transparent',
                        ...(Platform.OS === 'web' && {
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }),
                      }}
                    >
                      <HStack spacing={2} alignItems="center">
                        {item.icon && (
                          <Ionicons
                            name={item.icon}
                            size={18}
                            color={active ? theme.accentForeground : theme.foreground}
                          />
                        )}
                        <Text
                          size="sm"
                          weight={active ? 'medium' : 'normal'}
                          style={{
                            color: active ? theme.accentForeground : theme.foreground,
                          }}
                        >
                          {item.label}
                        </Text>
                        {item.badge && (
                          <Badge variant="secondary" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </HStack>
                    </Pressable>
                  );
                })}
              </HStack>
            )}
          </HStack>

          {/* Right Section - Actions */}
          <HStack spacing={2} alignItems="center">
            {/* Search - Desktop Only */}
            {showSearch && !isMobile && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => setCommandOpen(true)}
              >
                <HStack spacing={2} alignItems="center">
                  <Ionicons name="search" size={16} color={theme.mutedForeground} />
                  <Text size="sm" colorTheme="mutedForeground">
                    Search...
                  </Text>
                  <Badge variant="secondary" size="sm">
                    ⌘K
                  </Badge>
                </HStack>
              </Button>
            )}

            {/* Theme Selector */}
            {showThemeSelector && <ThemeSelector />}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <HStack spacing={2} alignItems="center">
                      <Avatar
                        name={user?.name || user?.email}
                        size="xs"
                      />
                      {!isMobile && (
                        <Text size="sm" weight="medium">
                          {user?.name || 'User'}
                        </Text>
                      )}
                    </HStack>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" minWidth={200}>
                  <DropdownMenuLabel>
                    <VStack spacing={1}>
                      <Text weight="medium">{user?.name || 'User'}</Text>
                      <Text size="xs" colorTheme="mutedForeground">
                        {user?.email}
                      </Text>
                    </VStack>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onPress={() => handleNavigation('/(home)/settings')}>
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="person-outline" size={16} />
                      <Text>Profile</Text>
                    </HStack>
                  </DropdownMenuItem>
                  <DropdownMenuItem onPress={() => handleNavigation('/(home)/settings')}>
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="settings-outline" size={16} />
                      <Text>Settings</Text>
                    </HStack>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onPress={() => handleNavigation('/(home)/admin')}>
                        <HStack spacing={2} alignItems="center">
                          <Ionicons name="shield-checkmark-outline" size={16} />
                          <Text>Admin Dashboard</Text>
                        </HStack>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onPress={handleLogout}>
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="log-out-outline" size={16} />
                      <Text>Logout</Text>
                    </HStack>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push('/(auth)/login' as any)}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onPress={() => router.push('/(auth)/register' as any)}
                >
                  Get Started
                </Button>
              </HStack>
            )}

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setMobileMenuOpen(true)}
              >
                <Ionicons name="menu" size={24} color={theme.foreground} />
              </Button>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );

  // Mobile Navigation Drawer
  const mobileNav = (
    <Drawer
      open={mobileMenuOpen}
      onOpenChange={setMobileMenuOpen}
      position="right"
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>

        <VStack spacing={4} p={4}>
          {/* User Info */}
          {isAuthenticated && (
            <>
              <HStack spacing={3} alignItems="center" p={3} bgTheme="muted" rounded="md">
                <Avatar name={user?.name || user?.email} size="md" />
                <VStack spacing={0} flex={1}>
                  <Text weight="medium">{user?.name || 'User'}</Text>
                  <Text size="sm" colorTheme="mutedForeground">
                    {user?.email}
                  </Text>
                </VStack>
              </HStack>
              <Separator />
            </>
          )}

          {/* Navigation Items */}
          <VStack spacing={1}>
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Button
                  key={item.label}
                  variant={active ? 'secondary' : 'ghost'}
                  fullWidth
                  justifyContent="flex-start"
                  onPress={() => handleNavigation(item.href)}
                >
                  <HStack spacing={3} alignItems="center" flex={1}>
                    {item.icon && (
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={active ? theme.primary : theme.foreground}
                      />
                    )}
                    <Text flex={1} weight={active ? 'medium' : 'normal'}>
                      {item.label}
                    </Text>
                    {item.badge && (
                      <Badge variant="secondary" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </HStack>
                </Button>
              );
            })}
          </VStack>

          <Separator />

          {/* Additional Actions */}
          <VStack spacing={1}>
            {showSearch && (
              <Button
                variant="ghost"
                fullWidth
                justifyContent="flex-start"
                onPress={() => {
                  setMobileMenuOpen(false);
                  setCommandOpen(true);
                }}
              >
                <HStack spacing={3} alignItems="center">
                  <Ionicons name="search" size={20} color={theme.foreground} />
                  <Text>Search</Text>
                </HStack>
              </Button>
            )}

            <Button
              variant="ghost"
              fullWidth
              justifyContent="flex-start"
              onPress={() => handleNavigation('/(home)/settings')}
            >
              <HStack spacing={3} alignItems="center">
                <Ionicons name="settings-outline" size={20} color={theme.foreground} />
                <Text>Settings</Text>
              </HStack>
            </Button>

            {isAuthenticated ? (
              <Button
                variant="ghost"
                fullWidth
                justifyContent="flex-start"
                onPress={handleLogout}
              >
                <HStack spacing={3} alignItems="center">
                  <Ionicons name="log-out-outline" size={20} color={theme.foreground} />
                  <Text>Logout</Text>
                </HStack>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  onPress={() => {
                    setMobileMenuOpen(false);
                    router.push('/(auth)/login' as any);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  onPress={() => {
                    setMobileMenuOpen(false);
                    router.push('/(auth)/register' as any);
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </VStack>
        </VStack>
      </DrawerContent>
    </Drawer>
  );

  // Command Palette
  const commandPalette = commandOpen && (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      style={{
        backgroundColor: `${theme.background}ee`,
        zIndex: 100,
      }}
      onTouchEnd={() => setCommandOpen(false)}
    >
      <Box
        position="absolute"
        top="20%"
        left="50%"
        style={{
          transform: [{ translateX: -200 }],
          width: 400,
          maxWidth: '90%',
        }}
      >
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => handleCommand('home')}>
                <Ionicons name="home-outline" size={16} />
                <Text ml={2}>Home</Text>
              </CommandItem>
              <CommandItem onSelect={() => handleCommand('explore')}>
                <Ionicons name="compass-outline" size={16} />
                <Text ml={2}>Explore</Text>
              </CommandItem>
              <CommandItem onSelect={() => handleCommand('components')}>
                <Ionicons name="cube-outline" size={16} />
                <Text ml={2}>Components</Text>
              </CommandItem>
              {user?.role === 'admin' && (
                <CommandItem onSelect={() => handleCommand('admin')}>
                  <Ionicons name="shield-checkmark-outline" size={16} />
                  <Text ml={2}>Admin Dashboard</Text>
                  <CommandShortcut>⌘A</CommandShortcut>
                </CommandItem>
              )}
            </CommandGroup>

            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => handleCommand('theme')}>
                <Ionicons name="color-palette-outline" size={16} />
                <Text ml={2}>Change Theme</Text>
                <CommandShortcut>⌘T</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleCommand('settings')}>
                <Ionicons name="settings-outline" size={16} />
                <Text ml={2}>Settings</Text>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              {isAuthenticated && (
                <CommandItem onSelect={() => handleCommand('logout')}>
                  <Ionicons name="log-out-outline" size={16} />
                  <Text ml={2}>Logout</Text>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </Box>
    </Box>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
      {commandPalette}
    </>
  );
};