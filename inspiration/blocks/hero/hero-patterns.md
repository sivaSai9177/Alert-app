# Hero Section Patterns

## Pattern 1: Centered Hero with CTA
```tsx
<Container>
  <VStack spacing={8} align="center" py={16}>
    <Heading1 size="4xl" textAlign="center">
      Welcome to Our Platform
    </Heading1>
    <Text size="lg" textAlign="center" colorTheme="mutedForeground" maxW="2xl">
      Build amazing applications with our comprehensive design system
    </Text>
    <HStack spacing={4}>
      <Button size="lg" onPress={handleGetStarted}>
        Get Started
      </Button>
      <Button size="lg" variant="outline" onPress={handleLearnMore}>
        Learn More
      </Button>
    </HStack>
  </VStack>
</Container>
```

## Pattern 2: Split Hero with Image
```tsx
<Container>
  <Grid cols={{ base: 1, md: 2 }} gap={8} py={16}>
    <VStack spacing={6} justify="center">
      <Heading1 size="3xl">
        Build Faster with Universal Components
      </Heading1>
      <Text colorTheme="mutedForeground">
        Our design system provides everything you need to create beautiful, 
        accessible applications across all platforms.
      </Text>
      <HStack spacing={4}>
        <Button onPress={handleStart}>Start Building</Button>
        <Link href="/docs">Documentation →</Link>
      </HStack>
    </VStack>
    <Box>
      {/* Hero image or illustration */}
    </Box>
  </Grid>
</Container>
```

## Pattern 3: Hero with Stats
```tsx
<Container>
  <VStack spacing={12} py={16}>
    <VStack spacing={4} align="center">
      <Badge variant="secondary">New Release</Badge>
      <Heading1 size="4xl" textAlign="center">
        The Ultimate Design System
      </Heading1>
      <Text size="lg" textAlign="center" colorTheme="mutedForeground">
        48+ components, 6 chart types, 5 themes
      </Text>
    </VStack>
    
    <Grid cols={{ base: 1, sm: 3 }} gap={6}>
      <StatCard
        label="Components"
        value="48+"
        description="Cross-platform"
      />
      <StatCard
        label="Themes"
        value="5"
        description="Light & Dark"
      />
      <StatCard
        label="Bundle Size"
        value="-73MB"
        description="Optimized"
      />
    </Grid>
  </VStack>
</Container>
```

## Pattern 4: Hero with Form
```tsx
<Container>
  <VStack spacing={8} py={16} align="center">
    <VStack spacing={4} align="center" maxW="2xl">
      <Heading1 size="3xl" textAlign="center">
        Get Early Access
      </Heading1>
      <Text textAlign="center" colorTheme="mutedForeground">
        Join thousands of developers building with our design system
      </Text>
    </VStack>
    
    <Card p={6} maxW="md" w="full">
      <Form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
          />
          <Button type="submit" w="full">
            Request Access
          </Button>
        </VStack>
      </Form>
    </Card>
  </VStack>
</Container>
```

## Pattern 5: Video Hero
```tsx
<Box position="relative" h={{ base: 400, md: 600 }}>
  <Box
    position="absolute"
    inset={0}
    bg="black"
    opacity={0.5}
  />
  <Container position="relative" h="full">
    <VStack
      spacing={6}
      justify="center"
      align="center"
      h="full"
      color="white"
    >
      <Heading1 size="4xl" textAlign="center">
        See It In Action
      </Heading1>
      <Text size="lg" textAlign="center">
        Watch how our components work across platforms
      </Text>
      <Button
        size="lg"
        leftIcon={<PlayIcon />}
        onPress={handlePlayVideo}
      >
        Watch Demo
      </Button>
    </VStack>
  </Container>
</Box>
```