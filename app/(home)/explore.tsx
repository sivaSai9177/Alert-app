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
  Heading2
} from "@/components/universal";
import { ScrollView } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { log } from "@/lib/core/logger";
import { useTheme } from "@/lib/theme/theme-provider";

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
  <Card mb={4}>
    <CardHeader>
      <HStack gap={3} alignItems="center">
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
);

export default function ExploreScreen() {
  const { user } = useAuth();
  const theme = useTheme();

  const features = [
    {
      title: "Analytics Dashboard",
      description: "Track your performance with detailed analytics and insights",
      icon: "📊",
      color: "#3b82f6",
      onPress: () => log.info("Analytics clicked", "EXPLORE"),
    },
    {
      title: "Team Collaboration",
      description: "Work together with your team in real-time",
      icon: "👥",
      color: "#10b981",
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
      color: "#f59e0b",
      onPress: () => log.info("Resources clicked", "EXPLORE"),
    },
    {
      title: "Integrations",
      description: "Connect with your favorite tools and services",
      icon: "🔗",
      color: "#ef4444",
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
    <ScrollContainer safe headerTitle="Explore">
      <VStack p={4}>
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
                px={4}
                py={2}
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
            <CardDescription>Can't find what you're looking for? Let us know!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="solid" colorScheme="primary" fullWidth>
              Request a Feature
            </Button>
          </CardContent>
        </Card>
      </VStack>
    </ScrollContainer>
  );
}