# Feature Section Patterns

## Pattern 1: Grid Features with Icons
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        Why Choose Our Platform
      </Heading2>
      <Text size="lg" textAlign="center" colorTheme="mutedForeground">
        Everything you need to build modern applications
      </Text>
    </VStack>
    
    <Grid cols={{ base: 1, md: 3 }} gap={8}>
      <Card p={6}>
        <VStack spacing={4}>
          <Box p={3} bg="primary" borderRadius="lg">
            <ComponentIcon size={24} color="white" />
          </Box>
          <Heading3>48+ Components</Heading3>
          <Text colorTheme="mutedForeground">
            Pre-built, accessible components for every use case
          </Text>
        </VStack>
      </Card>
      
      <Card p={6}>
        <VStack spacing={4}>
          <Box p={3} bg="secondary" borderRadius="lg">
            <ThemeIcon size={24} color="white" />
          </Box>
          <Heading3>5 Themes</Heading3>
          <Text colorTheme="mutedForeground">
            Beautiful themes with dark mode support
          </Text>
        </VStack>
      </Card>
      
      <Card p={6}>
        <VStack spacing={4}>
          <Box p={3} bg="accent" borderRadius="lg">
            <ChartIcon size={24} color="white" />
          </Box>
          <Heading3>Charts Library</Heading3>
          <Text colorTheme="mutedForeground">
            6 chart types with full theme integration
          </Text>
        </VStack>
      </Card>
    </Grid>
  </VStack>
</Container>
```

## Pattern 2: Alternating Features
```tsx
<Container py={16}>
  <VStack spacing={16}>
    {/* Feature 1 */}
    <Grid cols={{ base: 1, md: 2 }} gap={8} align="center">
      <VStack spacing={4}>
        <Badge variant="secondary">Design System</Badge>
        <Heading2 size="2xl">Universal Components</Heading2>
        <Text colorTheme="mutedForeground">
          Build once, deploy everywhere. Our components work seamlessly 
          across iOS, Android, and Web platforms.
        </Text>
        <Button variant="outline" onPress={handleLearnMore}>
          Explore Components →
        </Button>
      </VStack>
      <Box>
        {/* Feature illustration */}
      </Box>
    </Grid>
    
    {/* Feature 2 - Reversed */}
    <Grid cols={{ base: 1, md: 2 }} gap={8} align="center">
      <Box order={{ base: 2, md: 1 }}>
        {/* Feature illustration */}
      </Box>
      <VStack spacing={4} order={{ base: 1, md: 2 }}>
        <Badge variant="secondary">Theming</Badge>
        <Heading2 size="2xl">Dynamic Themes</Heading2>
        <Text colorTheme="mutedForeground">
          Switch between 5 beautiful themes instantly. Full dark mode 
          support with persistent preferences.
        </Text>
        <Button variant="outline" onPress={handleThemes}>
          View Themes →
        </Button>
      </VStack>
    </Grid>
  </VStack>
</Container>
```

## Pattern 3: Feature Tabs
```tsx
<Container py={16}>
  <VStack spacing={8}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        Powerful Features
      </Heading2>
    </VStack>
    
    <Tabs defaultValue="components" w="full">
      <TabsList justify="center">
        <TabsTrigger value="components">Components</TabsTrigger>
        <TabsTrigger value="themes">Themes</TabsTrigger>
        <TabsTrigger value="charts">Charts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="components">
        <Card p={8}>
          <Grid cols={{ base: 1, md: 2 }} gap={8}>
            <VStack spacing={4}>
              <Heading3>48+ Components</Heading3>
              <Text colorTheme="mutedForeground">
                Everything from basic buttons to complex data tables
              </Text>
              <List>
                <ListItem>✓ Form components</ListItem>
                <ListItem>✓ Layout components</ListItem>
                <ListItem>✓ Data display</ListItem>
                <ListItem>✓ Navigation</ListItem>
              </List>
            </VStack>
            <Box>{/* Component preview */}</Box>
          </Grid>
        </Card>
      </TabsContent>
      
      {/* Other tab contents */}
    </Tabs>
  </VStack>
</Container>
```

## Pattern 4: Feature Comparison
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        Compare Editions
      </Heading2>
    </VStack>
    
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Feature</TableHead>
          <TableHead>Basic</TableHead>
          <TableHead>Pro</TableHead>
          <TableHead>Enterprise</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Components</TableCell>
          <TableCell>20+</TableCell>
          <TableCell>48+</TableCell>
          <TableCell>48+ & Custom</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Themes</TableCell>
          <TableCell>2</TableCell>
          <TableCell>5</TableCell>
          <TableCell>Unlimited</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Charts</TableCell>
          <TableCell>-</TableCell>
          <TableCell>6 types</TableCell>
          <TableCell>All types</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </VStack>
</Container>
```

## Pattern 5: Feature Timeline
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        Our Journey
      </Heading2>
    </VStack>
    
    <Timeline>
      <TimelineItem
        date="Jan 2025"
        title="Universal Components"
        description="Launched with 48+ cross-platform components"
        icon={<ComponentIcon />}
      />
      <TimelineItem
        date="Jan 2025"
        title="Multi-Theme Support"
        description="Added 5 themes with dark mode"
        icon={<ThemeIcon />}
      />
      <TimelineItem
        date="Jan 2025"
        title="Charts Library"
        description="Integrated 6 chart types"
        icon={<ChartIcon />}
        isLast
      />
    </Timeline>
  </VStack>
</Container>
```