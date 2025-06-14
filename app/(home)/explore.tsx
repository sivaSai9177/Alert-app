import React from "react";
import { 
  ScrollContainer, 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Heading1,
  SimpleBreadcrumb,
  Separator,
  SidebarTrigger
} from "@/components/universal";
import { ScrollView, Platform } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { log } from "@/lib/core/debug/logger";
import { SpacingScale } from '@/lib/design';

// Feature card component
const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  color,
  onPress 
}: { 
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}) => (
  <Box mb={4}>
    <Card>
      <CardHeader>
        <HStack gap={3 as SpacingScale} alignItems="center">
        <Box 
          width={48}
          height={48}
          bg={color + '20'}
          rounded="md"
          alignItems="center"
          justifyContent="center"
        >
          <Text size="2xl">{icon}</Text>
        </Box>
        <Box flex={1}>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </Box>
      </HStack>
    </CardHeader>
    <CardContent>
      <Button variant="outline" fullWidth onPress={onPress}>
        Learn More
      </Button>
    </CardContent>
    </Card>
  </Box>
);

export default function ExploreScreen() {
  const { user } = useAuth();

  const features = [
    {
      title: "Analytics Dashboard",
      description: "Track your performance with detailed analytics and insights",
      icon: "📊",
      color: "theme.primary",
      onPress: () => log.info("Analytics clicked", "EXPLORE"),
    },
    {
      title: "Team Collaboration",
      description: "Work together with your team in real-time",
      icon: "👥",
      color: "theme.success",
      onPress: () => log.info("Team clicked", "EXPLORE"),
    },
    {
      title: "Project Management",
      description: "Organize and track your projects efficiently",
      icon: "📋",
      color: "#8b5cf6",
      onPress: () => log.info("Projects clicked", "EXPLORE"),
    },
    {
      title: "Resource Library",
      description: "Access helpful resources and documentation",
      icon: "📚",
      color: "theme.warning",
      onPress: () => log.info("Resources clicked", "EXPLORE"),
    },
    {
      title: "Integrations",
      description: "Connect with your favorite tools and services",
      icon: "🔗",
      color: "theme.destructive",
      onPress: () => log.info("Integrations clicked", "EXPLORE"),
    },
    {
      title: "Settings & Preferences",
      description: "Customize your experience",
      icon: "⚙️",
      color: "#6b7280",
      onPress: () => log.info("Settings clicked", "EXPLORE"),
    },
  ];

  // Filter features based on role
  const getAvailableFeatures = () => {
    if (user?.role === 'admin') {
      return features; // Admins see all features
    } else if (user?.role === 'manager') {
      return features.filter(f => !f.title.includes('Settings')); // Example filtering
    } else {
      return features.filter(f => 
        !f.title.includes('Settings') && 
        !f.title.includes('Team')
      ); // Regular users see limited features
    }
  };

  const availableFeatures = getAvailableFeatures();

  return (
    <ScrollContainer safe>
      <VStack p={0} spacing={0}>
        {/* Header with Toggle and Breadcrumbs - Only on Web */}
        {Platform.OS === 'web' && (
          <Box px={4 as SpacingScale} py={3 as SpacingScale} borderBottomWidth={1} borderTheme="border">
            <HStack alignItems="center" spacing={2} mb={2}>
              <SidebarTrigger />
              <Separator orientation="vertical" style={{ height: 24 }} />
              <SimpleBreadcrumb
                items={[
                  { label: 'Explore', current: true }
                ]}
                showHome={true}
                homeLabel="Dashboard"
                homeHref="/(home)"
              />
            </HStack>
          </Box>
        )}

        <VStack p={4 as SpacingScale}>
          {/* Header */}
          <VStack mb={6}>
          <Heading1>
            Explore
          </Heading1>
          <Text size="base" colorTheme="mutedForeground" mt={1}>
            Discover features and capabilities
          </Text>
        </VStack>

        {/* Categories */}
        <Box mb={4}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {['All', 'Popular', 'New', 'Essential'].map((category) => (
              <Box 
                key={category}
                bgTheme={category === 'All' ? 'primary' : 'secondary'}
                px={4 as SpacingScale}
                py={2 as SpacingScale}
                rounded="full"
                mr={2}
              >
                <Text 
                  colorTheme={category === 'All' ? 'primaryForeground' : 'secondaryForeground'}
                  weight="semibold"
                >
                  {category}
                </Text>
              </Box>
            ))}
          </ScrollView>
        </Box>

        {/* Feature Cards */}
        {availableFeatures.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}

        {/* CTA Card */}
        <Card>
          <CardHeader>
            <CardTitle>Need Something Else?</CardTitle>
            <CardDescription>Can&apos;t find what you&apos;re looking for? Let us know!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" fullWidth>
              Request a Feature
            </Button>
          </CardContent>
        </Card>
        </VStack>
    </VStack>
    </ScrollContainer>
  );
}