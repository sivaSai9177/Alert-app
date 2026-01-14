import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Container,
  VStack,
  HStack,
  Text,
  Heading1,
  Heading2,
  Card,
  Button,
  Badge,
  Separator,
  Box,
} from '@/components/universal';
import { Sidebar07Trigger } from '@/components/universal/Sidebar07';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSidebarStore } from '@/lib/stores/sidebar-store';

export default function SidebarTestScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { 
    isOpen, 
    activeItem, 
    expandedGroups, 
    activeTeam,
    toggleSidebar,
    toggleGroup,
  } = useSidebarStore();

  return (
    <Container scroll>
      <VStack p={4} spacing={4}>
        {/* Header with trigger */}
        <HStack alignItems="center" spacing={2}>
          <Sidebar07Trigger />
          <Separator orientation="vertical" style={{ height: 24 }} />
          <HStack spacing={1} flex={1}>
            <Text colorTheme="mutedForeground">Home</Text>
            <Text colorTheme="mutedForeground">/</Text>
            <Text>Sidebar Test</Text>
          </HStack>
        </HStack>

        <VStack spacing={6}>
          <VStack spacing={2}>
            <Heading1>Sidebar Test Page</Heading1>
            <Text colorTheme="mutedForeground">
              Testing the sidebar-07 implementation with all features
            </Text>
          </VStack>

          {/* Current State */}
          <Card>
            <VStack p={4} spacing={3}>
              <Heading2>Current Sidebar State</Heading2>
              
              <HStack spacing={2} alignItems="center">
                <Text weight="medium">Sidebar Open:</Text>
                <Badge variant={isOpen ? 'default' : 'secondary'}>
                  {isOpen ? 'Open' : 'Collapsed'}
                </Badge>
              </HStack>

              <HStack spacing={2} alignItems="center">
                <Text weight="medium">Active Item:</Text>
                <Badge variant="outline">
                  {activeItem || 'None'}
                </Badge>
              </HStack>

              <HStack spacing={2} alignItems="center">
                <Text weight="medium">Active Team:</Text>
                <Badge variant="outline">
                  {activeTeam || 'Acme Inc'}
                </Badge>
              </HStack>

              <VStack spacing={1}>
                <Text weight="medium">Expanded Groups:</Text>
                {expandedGroups.length > 0 ? (
                  expandedGroups.map((group) => (
                    <Badge key={group} variant="secondary" size="sm">
                      {group}
                    </Badge>
                  ))
                ) : (
                  <Text size="sm" colorTheme="mutedForeground">None</Text>
                )}
              </VStack>
            </VStack>
          </Card>

          {/* Actions */}
          <Card>
            <VStack p={4} spacing={3}>
              <Heading2>Test Actions</Heading2>
              
              <Button onPress={toggleSidebar}>
                Toggle Sidebar
              </Button>

              <Button 
                variant="outline"
                onPress={() => toggleGroup('Platform')}
              >
                Toggle Platform Group
              </Button>

              <Button 
                variant="secondary"
                onPress={() => router.push('/(home)')}
              >
                Go to Home
              </Button>
            </VStack>
          </Card>

          {/* Feature Checklist */}
          <Card>
            <VStack p={4} spacing={3}>
              <Heading2>Feature Checklist</Heading2>
              
              <VStack spacing={2}>
                {[
                  'Collapsible sidebar with icon-only mode',
                  'Smooth width transitions',
                  'SidebarRail for toggle control',
                  'Persistent state with Zustand',
                  'Mobile drawer support',
                  'Keyboard shortcuts (Cmd/Ctrl + B)',
                  'Collapsible menu groups',
                  'Active state tracking',
                  'Sub-menu items with indentation',
                  'Tooltips in collapsed state',
                  'Team switcher with dropdown',
                  'User profile with dropdown menu',
                  'Project actions (hover menu)',
                  'Loading states with skeleton',
                ].map((feature, index) => (
                  <HStack key={index} spacing={2} alignItems="center">
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color={theme.success} 
                    />
                    <Text size="sm">{feature}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Card>

          {/* Instructions */}
          <Card>
            <VStack p={4} spacing={3}>
              <Heading2>Instructions</Heading2>
              
              <VStack spacing={2}>
                <Text>• Click the menu icon in the header to toggle the sidebar</Text>
                <Text>• Use Cmd/Ctrl + B to toggle sidebar (desktop only)</Text>
                <Text>• Click on navigation items to see active state</Text>
                <Text>• Click on group headers to expand/collapse</Text>
                <Text>• Try the team switcher dropdown</Text>
                <Text>• Hover over projects to see action menu (desktop)</Text>
                <Text>• Click on user profile for dropdown menu</Text>
                <Text>• Resize window to see responsive behavior</Text>
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </VStack>
    </Container>
  );
}