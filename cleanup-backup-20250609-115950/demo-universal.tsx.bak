import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Container, VStack, HStack, Box, Text, Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, AlertDialog, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/universal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';

export default function DemoUniversalScreen() {
  const theme = useTheme();
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  
  // Dropdown states
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack spacing={8} p={4}>
          <VStack spacing={2}>
            <Text size="2xl" weight="bold">Universal Components Demo</Text>
            <Text colorTheme="mutedForeground">
              Dialog and DropdownMenu components that work across all platforms
            </Text>
          </VStack>
          
          {/* Dialog Demo */}
          <VStack spacing={4}>
            <Text size="lg" weight="semibold">Dialog Examples</Text>
            
            <HStack spacing={3}>
              {/* Basic Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Welcome to Universal Components</DialogTitle>
                    <DialogDescription>
                      This dialog works seamlessly across iOS, Android, and Web platforms.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <VStack spacing={3} py={4}>
                    <Text>
                      The Dialog component provides a modal overlay with smooth animations
                      and proper keyboard handling on all platforms.
                    </Text>
                    <Box bgTheme="muted" p={3} rounded="md">
                      <Text size="sm" colorTheme="mutedForeground">
                        Current theme: {theme.name || 'Default'}
                      </Text>
                    </Box>
                  </VStack>
                  
                  <DialogFooter>
                    <Button variant="ghost" onPress={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onPress={() => setDialogOpen(false)}>
                      Got it!
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Alert Dialog */}
              <Button
                variant="destructive"
                onPress={() => setAlertOpen(true)}
              >
                Delete Item
              </Button>
            </HStack>
            
            <AlertDialog
              open={alertOpen}
              onOpenChange={setAlertOpen}
              title="Are you absolutely sure?"
              description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
              confirmText="Delete Account"
              cancelText="Cancel"
// TODO: Replace with structured logging - onConfirm={() => console.log('Account deleted')}
              destructive
            />
          </VStack>
          
          {/* DropdownMenu Demo */}
          <VStack spacing={4}>
            <Text size="lg" weight="semibold">DropdownMenu Examples</Text>
            
            <HStack spacing={3} flexWrap="wrap">
              {/* Basic Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <HStack spacing={2} alignItems="center">
                      <Text>Options</Text>
                      <Ionicons name="chevron-down" size={16} />
                    </HStack>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    icon={<Ionicons name="person-outline" size={16} />}
// TODO: Replace with structured logging - onPress={() => console.log('Profile')}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    icon={<Ionicons name="card-outline" size={16} />}
// TODO: Replace with structured logging - onPress={() => console.log('Billing')}
                  >
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    icon={<Ionicons name="settings-outline" size={16} />}
// TODO: Replace with structured logging - onPress={() => console.log('Settings')}
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    icon={<Ionicons name="log-out-outline" size={16} />}
// TODO: Replace with structured logging - onPress={() => console.log('Logout')}
                    destructive
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Checkbox Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="notifications-outline" size={16} />
                      <Text>Preferences</Text>
                    </HStack>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  >
                    Enable Notifications
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sound}
                    onCheckedChange={setSound}
                  >
                    Sound Effects
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Radio Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <HStack spacing={2} alignItems="center">
                      <Ionicons name="funnel-outline" size={16} />
                      <Text>Sort By</Text>
                    </HStack>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem value="name">
                      Name
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="date">
                      Date Modified
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size">
                      File Size
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="type">
                      File Type
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </HStack>
          </VStack>
          
          {/* Features */}
          <VStack spacing={4}>
            <Text size="lg" weight="semibold">Key Features</Text>
            
            <VStack spacing={3}>
              <HStack spacing={3}>
                <Ionicons name="phone-portrait-outline" size={24} color={theme.primary} />
                <VStack flex={1}>
                  <Text weight="medium">Cross-Platform</Text>
                  <Text size="sm" colorTheme="mutedForeground">
                    Works seamlessly on iOS, Android, and Web
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing={3}>
                <Ionicons name="color-palette-outline" size={24} color={theme.primary} />
                <VStack flex={1}>
                  <Text weight="medium">Theme Support</Text>
                  <Text size="sm" colorTheme="mutedForeground">
                    Automatically adapts to your selected theme
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing={3}>
                <Ionicons name="accessibility-outline" size={24} color={theme.primary} />
                <VStack flex={1}>
                  <Text weight="medium">Accessible</Text>
                  <Text size="sm" colorTheme="mutedForeground">
                    Proper keyboard navigation and screen reader support
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing={3}>
                <Ionicons name="rocket-outline" size={24} color={theme.primary} />
                <VStack flex={1}>
                  <Text weight="medium">Performant</Text>
                  <Text size="sm" colorTheme="mutedForeground">
                    Optimized animations and lazy rendering
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </Container>
  );
}