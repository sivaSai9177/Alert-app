import { useSpacing } from "@/contexts/SpacingContext";
import { SpacingScale } from "@/lib/design-system";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useTheme } from "@/lib/theme/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Box } from "./Box";
import { Button } from "./Button";
import { Drawer } from "./Drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Separator } from "./Separator";
import { HStack, VStack } from "./Stack";
import { Text } from "./Text";
import { Tooltip } from "./Tooltip";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constants
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_WIDTH = 256; // 16rem
const SIDEBAR_WIDTH_MOBILE = 288; // 18rem
const SIDEBAR_WIDTH_ICON = 48; // 3rem
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// Types
type SidebarState = "expanded" | "collapsed";

interface SidebarContext07Props {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

// Context
const SidebarContext07 = createContext<SidebarContext07Props | null>(null);

export function useSidebar07() {
  const context = useContext(SidebarContext07);
  if (!context) {
    throw new Error("useSidebar07 must be used within a Sidebar07Provider.");
  }
  return context;
}

// Get device info
const getDeviceInfo = () => {
  const { width: screenWidth } = Dimensions.get("window");
  const isDesktop = Platform.OS === "web" && screenWidth >= 1024;
  const isTablet =
    Platform.OS === "web" && screenWidth >= 768 && screenWidth < 1024;
  const isMobileDevice = !isDesktop && !isTablet;
  return { isDesktop, isTablet, isMobileDevice, screenWidth };
};

// Provider Component
interface Sidebar07ProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Sidebar07Provider: React.FC<Sidebar07ProviderProps> = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  children,
  style,
}) => {
  const pathname = usePathname();
  
  // Track window dimensions for responsive behavior
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo());
    };
    
    const subscription = Dimensions.addEventListener('change', updateDeviceInfo);
    
    return () => {
      subscription?.remove();
    };
  }, []);
  
  const { isMobileDevice } = deviceInfo;

  // Use Zustand store
  const {
    isOpen,
    isMobileOpen,
    setOpen: setStoreOpen,
    setMobileOpen,
    toggleSidebar: toggleStoreSidebar,
    toggleMobileSidebar,
    setActiveItem,
  } = useSidebarStore();

  // Use store values or props
  const open = openProp ?? isOpen;
  const openMobile = isMobileOpen;

  // Update active item based on pathname
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname, setActiveItem]);

  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      }
      setStoreOpen(openState);
    },
    [setOpenProp, open, setStoreOpen]
  );

  const setOpenMobile = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(openMobile) : value;
      setMobileOpen(openState);
    },
    [openMobile, setMobileOpen]
  );

  // Helper to toggle the sidebar
  const toggleSidebar = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    return isMobileDevice ? toggleMobileSidebar() : toggleStoreSidebar();
  }, [isMobileDevice, toggleStoreSidebar, toggleMobileSidebar]);

  // Keyboard shortcut for web
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state: SidebarState = open ? "expanded" : "collapsed";

  const contextValue: SidebarContext07Props = {
    state,
    open,
    setOpen,
    isMobile: isMobileDevice,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext07.Provider value={contextValue}>
      <View style={[{ flex: 1, flexDirection: "row" }, style]}>{children}</View>
    </SidebarContext07.Provider>
  );
};

// Sidebar Component
interface Sidebar07Props {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Sidebar07: React.FC<Sidebar07Props> = ({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  children,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar07();
  
  // Track window dimensions for responsive behavior
  const [currentDeviceInfo, setCurrentDeviceInfo] = useState(getDeviceInfo());
  
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const updateDeviceInfo = () => {
      const newDeviceInfo = getDeviceInfo();
      setCurrentDeviceInfo(newDeviceInfo);
      
      // If switching from desktop to mobile, close the sidebar
      if (newDeviceInfo.isMobileDevice && !currentDeviceInfo.isMobileDevice && state === "expanded") {
        // The parent provider will handle the state change
      }
    };
    
    const subscription = Dimensions.addEventListener('change', updateDeviceInfo);
    
    return () => {
      subscription?.remove();
    };
  }, [currentDeviceInfo.isMobileDevice, state]);
  
  const shouldUseMobileLayout = isMobile || currentDeviceInfo.isMobileDevice;

  if (collapsible === "none") {
    return (
      <Box
        width={SIDEBAR_WIDTH}
        style={[
          {
            backgroundColor: theme.card,
            borderRightWidth: side === "left" ? StyleSheet.hairlineWidth : 0,
            borderLeftWidth: side === "right" ? StyleSheet.hairlineWidth : 0,
            borderColor: theme.border,
          },
          style,
        ]}
      >
        {children}
      </Box>
    );
  }

  if (shouldUseMobileLayout || Platform.OS !== "web") {
    // Use Drawer for mobile
    return (
      <Drawer
        visible={openMobile}
        onClose={() => setOpenMobile(false)}
        position="left"
        size="sm"
        swipeEnabled
        closeOnBackdrop
      >
        <View
          style={{
            height: "100%",
            backgroundColor: theme.card,
          }}
        >
          {children}
        </View>
      </Drawer>
    );
  }

  // Desktop sidebar
  const width =
    state === "collapsed" && collapsible === "icon"
      ? SIDEBAR_WIDTH_ICON
      : state === "collapsed" && collapsible === "offcanvas"
      ? 0
      : SIDEBAR_WIDTH;

  return (
    <View
      style={[
        {
          position: "relative",
          width,
          height: "100%",
          backgroundColor: theme.card,
          borderRightWidth: side === "left" ? StyleSheet.hairlineWidth : 0,
          borderLeftWidth: side === "right" ? StyleSheet.hairlineWidth : 0,
          borderColor: theme.border,
          ...(Platform.OS === "web" && {
            transition: "width 200ms ease",
          }),
          overflow: "hidden",
        },
        variant === "floating" && {
          margin: spacing[2],
          borderRadius: 12,
          borderWidth: StyleSheet.hairlineWidth,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          elevation: 4,
        },
        variant === "inset" && {
          position: "relative",
        },
        style,
      ]}
    >
      <View style={{ flex: 1, flexDirection: "column" }}>{children}</View>
    </View>
  );
};

// Sidebar Trigger
interface Sidebar07TriggerProps {
  onPress?: () => void;
  style?: ViewStyle;
}

export const Sidebar07Trigger: React.FC<Sidebar07TriggerProps> = ({
  onPress,
  style,
}) => {
  const theme = useTheme();
  
  // Try to get sidebar context, but don't throw if not available
  const context = useContext(SidebarContext07);
  
  // If no context (i.e., on mobile), don't render anything
  if (!context) {
    return null;
  }
  
  const { toggleSidebar } = context;

  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={() => {
        onPress?.();
        toggleSidebar();
      }}
      style={style}
    >
      <Ionicons name="menu" size={20} color={theme.foreground} />
    </Button>
  );
};

// Sidebar Rail (for desktop resize)
export const Sidebar07Rail: React.FC = () => {
  const theme = useTheme();
  const { toggleSidebar, state } = useSidebar07();

  if (Platform.OS !== "web") return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: -2,
        width: 4,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <Pressable
        onPress={toggleSidebar}
        style={({ pressed }) => ({
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 4,
          ...(Platform.OS === 'web' && {
            cursor: state === "collapsed" ? "e-resize" as any : "w-resize" as any,
          }),
          backgroundColor: pressed ? theme.muted : "transparent",
        })}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 1.5,
            width: 1,
            backgroundColor: theme.border,
          }}
        />
      </Pressable>
    </View>
  );
};

// Sidebar Inset (main content area)
interface Sidebar07InsetProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Sidebar07Inset: React.FC<Sidebar07InsetProps> = ({
  children,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();

  return (
    <Box flex={1} bgTheme="background" style={[style]}>
      {children}
    </Box>
  );
};

// Sidebar Header
export const Sidebar07Header: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { spacing } = useSpacing();
  const theme = useTheme();
  return (
    <View style={{ 
      padding: spacing[2], 
      gap: spacing[1],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    }}>
      {children}
    </View>
  );
};

// Sidebar Footer
export const Sidebar07Footer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { spacing } = useSpacing();
  const theme = useTheme();
  return (
    <View style={{ 
      padding: spacing[2], 
      gap: spacing[1],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    }}>
      {children}
    </View>
  );
};

// Sidebar Content
export const Sidebar07Content: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useSidebar07();

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <VStack flex={1}>{children}</VStack>
    </ScrollView>
  );
};

// Sidebar Group
interface Sidebar07GroupProps {
  children: React.ReactNode;
}

export const Sidebar07Group: React.FC<Sidebar07GroupProps> = ({ children }) => {
  const { spacing } = useSpacing();
  return (
    <View
      style={{ paddingHorizontal: spacing[2], paddingVertical: spacing[1] }}
    >
      {children}
    </View>
  );
};

// Sidebar Group Label
interface Sidebar07GroupLabelProps {
  children: React.ReactNode;
}

export const Sidebar07GroupLabel: React.FC<Sidebar07GroupLabelProps> = ({
  children,
}) => {
  const theme = useTheme();
  const { state } = useSidebar07();
  const { spacing } = useSpacing();

  return (
    <Box
      px={0}
      pb={1.5 as SpacingScale}
      style={{
        opacity: state === "collapsed" ? 0 : 1,
        marginTop: state === "collapsed" ? -32 : 0,
        height: state === "collapsed" ? 0 : "auto",
        overflow: "hidden",
      }}
    >
      <Text size="xs" weight="medium" colorTheme="mutedForeground">
        {children}
      </Text>
    </Box>
  );
};

// Sidebar Group Content
export const Sidebar07GroupContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <VStack spacing={0.5}>{children}</VStack>;
};

// Sidebar Menu
export const Sidebar07Menu: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <VStack spacing={0.5}>{children}</VStack>;
};

// Sidebar Menu Item
interface Sidebar07MenuItemProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Sidebar07MenuItem: React.FC<Sidebar07MenuItemProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[{ position: "relative" }, style]}>
      {children}
    </View>
  );
};

// Sidebar Menu Button
interface Sidebar07MenuButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  isActive?: boolean;
  tooltip?: string;
  onPress?: () => void;
  asChild?: boolean;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
  style?: ViewStyle;
}

export const Sidebar07MenuButton = React.forwardRef<View, Sidebar07MenuButtonProps>(({
  children,
  isActive = false,
  tooltip,
  onPress,
  asChild = false,
  size = "default",
  variant = "default",
  style,
  ...props
}, ref) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { state, isMobile } = useSidebar07();
  const [isHovered, setIsHovered] = useState(false);

  // Height based on size
  const heights = {
    sm: 32, // h-8
    default: 36, // h-9
    lg: 48, // h-12
  };

  const button = (
    <Pressable
      ref={ref}
      onPress={onPress}
      onPointerEnter={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onPointerLeave={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[2],
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[1.5],
          borderRadius: spacing[1.5],
          backgroundColor: pressed
            ? theme.accent
            : isActive
            ? theme.primary
            : isHovered
            ? theme.muted
            : 'transparent',
          overflow: "hidden",
          minHeight: heights[size],
          width: "100%",
          opacity: pressed ? 0.7 : 1,
          ...(Platform.OS === "web" && {
            transition: "all 0.2s ease",
            cursor: "pointer",
          }),
          ...(state === "collapsed" && {
            width: 40,
            paddingHorizontal: 0,
            paddingVertical: 0,
            justifyContent: "center",
            gap: 0,
          }),
          ...(size === "lg" &&
            state === "collapsed" && {
              padding: 0,
            }),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );

  if (!tooltip || state !== "collapsed" || isMobile) {
    return button;
  }

  return (
    <Tooltip content={tooltip} side="right">
      {button}
    </Tooltip>
  );
});

Sidebar07MenuButton.displayName = 'Sidebar07MenuButton';

// Sidebar Menu Badge
interface Sidebar07MenuBadgeProps {
  children: React.ReactNode;
}

export const Sidebar07MenuBadge: React.FC<Sidebar07MenuBadgeProps> = ({
  children,
}) => {
  const { state } = useSidebar07();

  if (state === "collapsed") return null;

  return (
    <Badge size="sm" variant="secondary" style={{ marginLeft: "auto" }}>
      {children}
    </Badge>
  );
};

// Sidebar Separator
export const Sidebar07Separator: React.FC = () => {
  return <Separator my={2 as SpacingScale} mx={2 as SpacingScale} />;
};

// Nav Main Component
interface NavMainItem {
  title: string;
  url?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

interface NavMain07Props {
  items: NavMainItem[];
}

// Collapsible Component for NavMain
interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const handleToggle = () => {
    const newOpen = !open;
    setUncontrolledOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <CollapsibleContext.Provider value={{ open, toggle: handleToggle }}>
      {children}
    </CollapsibleContext.Provider>
  );
};

const CollapsibleContext = createContext<{
  open: boolean;
  toggle: () => void;
}>({ open: false, toggle: () => {} });

const CollapsibleTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
}> = ({ children, asChild }) => {
  const { toggle } = useContext(CollapsibleContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onPress: () => {
        toggle();
        (children as any).props?.onPress?.();
      },
    });
  }

  return <Pressable onPress={toggle}>{children}</Pressable>;
};

const CollapsibleContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { open } = useContext(CollapsibleContext);

  if (!open) return null;

  return <>{children}</>;
};

// Sub Navigation Item Component
const SubNavItem: React.FC<{
  subItem: { title: string; url: string };
  isActive: boolean;
  onPress: () => void;
}> = ({ subItem, isActive, onPress }) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Pressable
      onPress={onPress}
      onPointerEnter={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onPointerLeave={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => ({
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1.5],
        borderRadius: 6,
        backgroundColor: 
          isActive ? theme.primary :
          pressed ? theme.accent :
          isHovered ? theme.muted :
          "transparent",
        marginBottom: spacing[0.5],
        ...(Platform.OS === "web" && {
          transition: "all 0.15s ease",
          cursor: "pointer",
        }),
      })}
    >
      <Text
        size="sm"
        style={{
          color: isActive
            ? theme.primaryForeground
            : theme.mutedForeground,
        }}
      >
        {subItem.title}
      </Text>
    </Pressable>
  );
};

export const NavMain07: React.FC<NavMain07Props> = ({ items }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { state } = useSidebar07();

  // Use Zustand store for state management
  const {
    expandedGroups,
    toggleGroup: toggleStoreGroup,
    setActiveItem,
  } = useSidebarStore();

  return (
    <Sidebar07Group>
      <Sidebar07GroupLabel>Navigation</Sidebar07GroupLabel>
      <Sidebar07GroupContent>
        <Sidebar07Menu>
          {items.map((item) => {
            const hasChildren = item.items && item.items.length > 0;
            // Check for exact match first
            let isActive = false;
            if (item.url) {
              // Special handling for home route
              if (item.url === '/(home)') {
                isActive = pathname === '/(home)' || pathname === '/(home)/index';
              } else {
                // For other routes, check exact match
                isActive = pathname === item.url;
              }
            } else {
              isActive = item.isActive || false;
            }

            return (
              <Collapsible
                key={item.title}
                defaultOpen={item.isActive}
                open={expandedGroups.includes(item.title)}
                onOpenChange={(open) => {
                  if (open !== expandedGroups.includes(item.title)) {
                    toggleStoreGroup(item.title);
                  }
                }}
              >
                <Sidebar07MenuItem>
                  <CollapsibleTrigger asChild>
                    <Sidebar07MenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      onPress={() => {
                        if (item.url && pathname !== item.url) {
                          router.replace(item.url as any);
                          setActiveItem(item.url);
                        } else if (hasChildren) {
                          toggleStoreGroup(item.title);
                        }
                      }}
                    >
                      <HStack flex={1} alignItems="center" spacing={2}>
                        {item.icon && (
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color={
                              isActive
                                ? theme.primaryForeground
                                : theme.foreground
                            }
                          />
                        )}
                        {state !== "collapsed" && (
                          <>
                            <Text
                              style={{
                                flex: 1,
                                color: isActive
                                  ? theme.primaryForeground
                                  : theme.foreground,
                              }}
                            >
                              {item.title}
                            </Text>
                            {hasChildren && (
                              <View
                                style={{
                                  transform: [
                                    {
                                      rotate: expandedGroups.includes(
                                        item.title
                                      )
                                        ? "90deg"
                                        : "0deg",
                                    },
                                  ],
                                  ...(Platform.OS === "web" && {
                                    transition: "transform 200ms",
                                  }),
                                }}
                              >
                                <Ionicons
                                  name="chevron-forward"
                                  size={16}
                                  color={theme.mutedForeground}
                                />
                              </View>
                            )}
                          </>
                        )}
                      </HStack>
                    </Sidebar07MenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    {state !== "collapsed" && hasChildren && (
                      <View
                        style={{
                          borderLeftWidth: StyleSheet.hairlineWidth,
                          borderLeftColor: theme.border,
                          marginLeft: spacing[3.5],
                          paddingLeft: spacing[2.5],
                          marginTop: spacing[0.5],
                        }}
                      >
                        {item.items!.map((subItem) => {
                          const subIsActive =
                            pathname === subItem.url ||
                            pathname.startsWith(subItem.url + "/");

                          return (
                            <SubNavItem
                              key={subItem.title}
                              subItem={subItem}
                              isActive={subIsActive}
                              onPress={() => {
                                if (pathname !== subItem.url) {
                                  router.replace(subItem.url as any);
                                  setActiveItem(subItem.url);
                                }
                              }}
                            />
                          );
                        })}
                      </View>
                    )}
                  </CollapsibleContent>
                </Sidebar07MenuItem>
              </Collapsible>
            );
          })}
        </Sidebar07Menu>
      </Sidebar07GroupContent>
    </Sidebar07Group>
  );
};

// Nav User Component
interface NavUser07Props {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const NavUser07: React.FC<NavUser07Props> = ({ user }) => {
  const theme = useTheme();
  const { state } = useSidebar07();
  const router = useRouter();
  const { spacing } = useSpacing();
  const [isHoveredCollapsed, setIsHoveredCollapsed] = useState(false);
  const [isHoveredExpanded, setIsHoveredExpanded] = useState(false);

  if (state === "collapsed") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Pressable
            {...(Platform.OS === 'web' && {
              onHoverIn: () => setIsHoveredCollapsed(true),
              onHoverOut: () => setIsHoveredCollapsed(false),
            } as any)}
            style={({ pressed }) => ({
              padding: spacing[2],
              alignItems: "center",
              justifyContent: "center",
              borderRadius: spacing[1.5],
              backgroundColor: pressed || isHoveredCollapsed ? theme.accent : "transparent",
              opacity: pressed ? 0.8 : 1,
              ...(Platform.OS === "web" && {
                transition: "all 0.15s ease",
                cursor: "pointer",
              }),
            })}
          >
            <Avatar
              name={user.name}
              size="sm"
              source={user.avatar ? { uri: user.avatar } : undefined}
            />
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Box p={2 as SpacingScale}>
            <Text weight="medium">{user.name}</Text>
            <Text size="xs" colorTheme="mutedForeground">
              {user.email}
            </Text>
          </Box>
          <DropdownMenuSeparator />
          <DropdownMenuItem onPress={() => router.replace("/(home)/settings")}>
            <HStack spacing={2} alignItems="center">
              <Ionicons
                name="person-outline"
                size={16}
                color={theme.foreground}
              />
              <Text>Account</Text>
            </HStack>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPress={() => {
              // Add logout logic here
              const { logout } = useAuthStore.getState();
              logout();
              router.replace("/(auth)/login");
            }}
          >
            <HStack spacing={2} alignItems="center">
              <Ionicons
                name="log-out-outline"
                size={16}
                color={theme.foreground}
              />
              <Text>Log out</Text>
            </HStack>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          {...(Platform.OS === 'web' && {
            onHoverIn: () => setIsHoveredExpanded(true),
            onHoverOut: () => setIsHoveredExpanded(false),
          } as any)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[2],
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[2],
            borderRadius: 6,
            backgroundColor: pressed || isHoveredExpanded ? theme.accent : "transparent",
            opacity: pressed ? 0.8 : 1,
            width: '100%',
            minHeight: 48,
            ...(Platform.OS === "web" && {
              transition: "all 0.15s ease",
              cursor: "pointer",
            }),
          })}
        >
          <HStack flex={1} alignItems="center" spacing={2}>
            <Avatar
              name={user.name}
              size="sm"
              source={user.avatar ? { uri: user.avatar } : undefined}
            />
            <VStack spacing={0} flex={1}>
              <Text size="sm" weight="medium" numberOfLines={1}>
                {user.name}
              </Text>
              <Text size="xs" colorTheme="mutedForeground" numberOfLines={1}>
                {user.email}
              </Text>
            </VStack>
            <Ionicons name="chevron-up" size={16} color={theme.mutedForeground} />
          </HStack>
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" minWidth={200}>
        <Box p={2 as SpacingScale}>
          <Text weight="medium">{user.name}</Text>
          <Text size="xs" colorTheme="mutedForeground">
            {user.email}
          </Text>
        </Box>
        <DropdownMenuSeparator />
        <DropdownMenuItem onPress={() => router.replace("/(home)/settings")}>
          <HStack spacing={2} alignItems="center">
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={theme.foreground}
            />
            <Text>Upgrade to Pro</Text>
          </HStack>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onPress={() => router.replace("/(home)/settings")}>
          <HStack spacing={2} alignItems="center">
            <Ionicons
              name="person-outline"
              size={16}
              color={theme.foreground}
            />
            <Text>Account</Text>
          </HStack>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => {}}>
          <HStack spacing={2} alignItems="center">
            <Ionicons
              name="person-add-outline"
              size={16}
              color={theme.foreground}
            />
            <Text>Invite users</Text>
          </HStack>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onPress={() => {
            // Add logout logic here
            const { logout } = useAuthStore.getState();
            logout();
            router.replace("/(auth)/login");
          }}
        >
          <HStack spacing={2} alignItems="center">
            <Ionicons name="log-out-outline" size={16} color={theme.foreground} />
            <Text>Log out</Text>
          </HStack>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Organization/Team Switcher Component
interface Organization {
  name: string;
  logo?: React.ComponentType<{ size?: number; color?: string }>;
  plan?: string;
}

interface TeamSwitcher07Props {
  teams: Organization[];
  activeTeam?: string;
}

export const TeamSwitcher07: React.FC<TeamSwitcher07Props> = ({
  teams,
  activeTeam,
}) => {
  const theme = useTheme();
  const { state } = useSidebar07();
  const { activeTeam: storeActiveTeam, setActiveTeam } = useSidebarStore();

  // Use store active team or prop or default to first team
  const selectedTeam = storeActiveTeam || activeTeam || teams[0]?.name;
  const currentTeam = teams.find((t) => t.name === selectedTeam) || teams[0];

  if (!currentTeam) {
    return null;
  }

  return (
    <Sidebar07Menu>
      <Sidebar07MenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Sidebar07MenuButton
              size="lg"
              isActive={false}
              tooltip={state === "collapsed" ? currentTeam.name : undefined}
            >
              <HStack flex={1} alignItems="center" spacing={2} style={{ width: '100%' }}>
                {/* Organization Logo */}
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    aspectRatio: 1,
                  }}
                  rounded="lg"
                  bgTheme="primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  {currentTeam.logo ? (
                    <currentTeam.logo size={16} color={theme.primaryForeground} />
                  ) : (
                    <Text
                      size="sm"
                      weight="bold"
                      style={{ color: theme.primaryForeground }}
                    >
                      {currentTeam.name.charAt(0)}
                    </Text>
                  )}
                </Box>

                {/* Organization Info */}
                {state !== "collapsed" && (
                  <>
                    <VStack spacing={0} flex={1} alignItems="flex-start">
                      <Text size="sm" weight="medium" numberOfLines={1}>
                        {currentTeam.name}
                      </Text>
                      <Text
                        size="xs"
                        colorTheme="mutedForeground"
                        numberOfLines={1}
                      >
                        {currentTeam.plan || "Free"}
                      </Text>
                    </VStack>
                    <Ionicons
                      name="chevron-expand"
                      size={16}
                      color={theme.mutedForeground}
                    />
                  </>
                )}
              </HStack>
            </Sidebar07MenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align={state === "collapsed" ? "start" : "end"}
            sideOffset={4}
            minWidth={224} // min-w-56
          >
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>

            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onPress={() => {
                  setActiveTeam(team.name);
                }}
              >
                <HStack spacing={2} alignItems="center" p={0.5}>
                  <Box
                    style={{
                      width: 24,
                      height: 24,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: theme.border,
                    }}
                    rounded="md"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {team.logo ? (
                      <team.logo size={14} color={theme.foreground} />
                    ) : (
                      <Text
                        size="xs"
                        weight="medium"
                        style={{ color: theme.foreground }}
                      >
                        {team.name.charAt(0)}
                      </Text>
                    )}
                  </Box>
                  <Text size="sm" style={{ flex: 1 }}>
                    {team.name}
                  </Text>
                  {Platform.OS === "web" && (
                    <Text size="xs" colorTheme="mutedForeground">
                      ⌘{index + 1}
                    </Text>
                  )}
                </HStack>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem onPress={() => {}}>
              <HStack spacing={2} alignItems="center" p={0.5}>
                <Box
                  style={{
                    width: 24,
                    height: 24,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: theme.border,
                    backgroundColor: "transparent",
                  }}
                  rounded="md"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="add" size={16} color={theme.foreground} />
                </Box>
                <Text weight="medium" colorTheme="mutedForeground">
                  Add organization
                </Text>
              </HStack>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Sidebar07MenuItem>
    </Sidebar07Menu>
  );
};

// NavProjects Component
interface Project {
  name: string;
  url: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface NavProjects07Props {
  projects: Project[];
}

export const NavProjects07: React.FC<NavProjects07Props> = ({ projects }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { state, isMobile } = useSidebar07();
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Hide entirely when collapsed
  if (state === "collapsed") {
    return null;
  }

  const handleMouseEnter = (projectName: string) => {
    if (Platform.OS === "web" && !isMobile) {
      setHoveredProject(projectName);
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === "web" && !isMobile) {
      setHoveredProject(null);
    }
  };

  return (
    <Sidebar07Group>
      <Sidebar07GroupLabel>Projects</Sidebar07GroupLabel>
      <Sidebar07GroupContent>
        <Sidebar07Menu>
          {projects.map((project) => {
            const isActive =
              pathname === project.url ||
              pathname.startsWith(project.url + "/");
            const isHovered = hoveredProject === project.name;

            return (
              <Sidebar07MenuItem key={project.name}>
                <View
                  style={{ position: "relative" }}
                  {...(Platform.OS === "web"
                    ? {
                        onMouseEnter: () => handleMouseEnter(project.name),
                        onMouseLeave: handleMouseLeave,
                      }
                    : {})}
                >
                  <Sidebar07MenuButton
                    isActive={isActive}
                    onPress={() => router.replace(project.url as any)}
                  >
                    <Ionicons
                      name={project.icon}
                      size={20}
                      color={
                        isActive ? theme.primaryForeground : theme.foreground
                      }
                    />
                    <Text
                      style={{
                        flex: 1,
                        color: isActive
                          ? theme.primaryForeground
                          : theme.foreground,
                      }}
                    >
                      {project.name}
                    </Text>
                  </Sidebar07MenuButton>

                  {/* Menu Action - visible on hover (web) or always (mobile) */}
                  {(isHovered || isMobile) && (
                    <View
                      style={{
                        position: "absolute",
                        right: spacing[1],
                        top: "50%",
                        transform: [{ translateY: -10 }],
                      }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Pressable
                            style={({ pressed, hovered }: any) => ({
                              width: 20,
                              height: 20,
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 4,
                              backgroundColor:
                                pressed || hovered
                                  ? theme.accent
                                  : "transparent",
                              opacity: pressed ? 0.8 : 1,
                              ...(Platform.OS === "web" && {
                                transition: "all 0.15s ease",
                                cursor: "pointer",
                              }),
                            })}
                          >
                            <Ionicons
                              name="ellipsis-horizontal"
                              size={16}
                              color={theme.mutedForeground}
                            />
                          </Pressable>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" minWidth={192}>
                          <DropdownMenuItem
                            onPress={() => router.replace(project.url as any)}
                          >
                            <HStack spacing={2} alignItems="center">
                              <Ionicons
                                name="folder-outline"
                                size={16}
                                color={theme.foreground}
                              />
                              <Text>View Project</Text>
                            </HStack>
                          </DropdownMenuItem>
                          <DropdownMenuItem onPress={() => {}}>
                            <HStack spacing={2} alignItems="center">
                              <Ionicons
                                name="share-outline"
                                size={16}
                                color={theme.foreground}
                              />
                              <Text>Share Project</Text>
                            </HStack>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onPress={() => {}}>
                            <HStack spacing={2} alignItems="center">
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color={theme.destructive}
                              />
                              <Text style={{ color: theme.destructive }}>
                                Delete Project
                              </Text>
                            </HStack>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </View>
                  )}
                </View>
              </Sidebar07MenuItem>
            );
          })}

          {/* More button */}
          <Sidebar07MenuItem>
            <Sidebar07MenuButton onPress={() => {}}>
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={theme.mutedForeground}
              />
              <Text style={{ color: theme.mutedForeground }}>More</Text>
            </Sidebar07MenuButton>
          </Sidebar07MenuItem>
        </Sidebar07Menu>
      </Sidebar07GroupContent>
    </Sidebar07Group>
  );
};

// Sidebar Input
interface Sidebar07InputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: ViewStyle;
}

export const Sidebar07Input: React.FC<Sidebar07InputProps> = ({
  placeholder,
  value,
  onChangeText,
  style,
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={[
        {
          height: 32,
          backgroundColor: theme.background,
          borderColor: theme.border,
          paddingHorizontal: spacing[3],
          fontSize: 14,
        },
        style,
      ]}
    />
  );
};

// Sidebar Menu Action
interface Sidebar07MenuActionProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  showOnHover?: boolean;
  style?: ViewStyle;
}

export const Sidebar07MenuAction: React.FC<Sidebar07MenuActionProps> = ({
  children,
  showOnHover = false,
  style,
  ...props
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { state } = useSidebar07();
  const [isHovered, setIsHovered] = useState(false);
  
  if (state === "collapsed") return null;
  
  return (
    <Pressable
      onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
      style={[
        {
          position: "absolute",
          right: spacing[1],
          top: 6,
          width: 20,
          height: 20,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: spacing[1],
          backgroundColor: isHovered ? theme.accent : "transparent",
          ...(Platform.OS === "web" && {
            transition: "all 0.15s ease",
            cursor: "pointer",
          }),
          ...(showOnHover && !isHovered && {
            opacity: 0,
          }),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

// Sidebar Menu Skeleton
interface Sidebar07MenuSkeletonProps {
  showIcon?: boolean;
  style?: ViewStyle;
}

export const Sidebar07MenuSkeleton: React.FC<Sidebar07MenuSkeletonProps> = ({
  showIcon = false,
  style,
}) => {
  const { spacing } = useSpacing();
  const width = useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []);
  
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          height: 32,
          paddingHorizontal: spacing[2],
          gap: spacing[2],
          borderRadius: spacing[1.5],
        },
        style,
      ]}
    >
      {showIcon && <Skeleton width={16} height={16} borderRadius={4} />}
      <Skeleton width={width} height={16} borderRadius={4} />
    </View>
  );
};

// Sidebar Menu Sub
interface Sidebar07MenuSubProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Sidebar07MenuSub: React.FC<Sidebar07MenuSubProps> = ({
  children,
  style,
}) => {
  const { spacing } = useSpacing();
  const theme = useTheme();
  const { state } = useSidebar07();
  
  if (state === "collapsed") return null;
  
  return (
    <View
      style={[
        {
          marginLeft: spacing[3.5],
          paddingLeft: spacing[2.5],
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderLeftColor: theme.border,
          gap: spacing[1],
          marginTop: spacing[0.5],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Sidebar Menu Sub Item
export const Sidebar07MenuSubItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Sidebar Menu Sub Button
interface Sidebar07MenuSubButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  isActive?: boolean;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export const Sidebar07MenuSubButton: React.FC<Sidebar07MenuSubButtonProps> = ({
  children,
  isActive = false,
  size = "md",
  style,
  ...props
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[2],
          height: 28,
          paddingHorizontal: spacing[2],
          borderRadius: spacing[1.5],
          backgroundColor: isActive
            ? theme.accent
            : isPressed || isHovered
            ? theme.accent
            : "transparent",
          ...(Platform.OS === "web" && {
            transition: "all 0.15s ease",
            cursor: "pointer",
          }),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

// Sidebar Group Action
interface Sidebar07GroupActionProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Sidebar07GroupAction: React.FC<Sidebar07GroupActionProps> = ({
  children,
  style,
  ...props
}) => {
  const theme = useTheme();
  const { spacing } = useSpacing();
  const { state } = useSidebar07();
  const [isHovered, setIsHovered] = useState(false);
  
  if (state === "collapsed") return null;
  
  return (
    <Pressable
      onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
      style={[
        {
          position: "absolute",
          right: spacing[3],
          top: spacing[3.5],
          width: 20,
          height: 20,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: spacing[1],
          backgroundColor: isHovered ? theme.accent : "transparent",
          ...(Platform.OS === "web" && {
            transition: "all 0.15s ease",
            cursor: "pointer",
          }),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};
