# Footer Patterns

## Pattern 1: Simple Footer
```tsx
<Box borderTopWidth={1} borderColor="border" mt="auto">
  <Container py={8}>
    <VStack spacing={4} align="center">
      <Text colorTheme="mutedForeground">
        © 2025 Your Company. All rights reserved.
      </Text>
      <HStack spacing={4}>
        <Link href="/privacy">Privacy Policy</Link>
        <Text colorTheme="mutedForeground">·</Text>
        <Link href="/terms">Terms of Service</Link>
      </HStack>
    </VStack>
  </Container>
</Box>
```

## Pattern 2: Multi-Column Footer
```tsx
<Box bg="muted" borderTopWidth={1} borderColor="border">
  <Container py={12}>
    <Grid cols={{ base: 1, sm: 2, md: 4 }} gap={8}>
      {/* Company Info */}
      <VStack spacing={4} align="start">
        <Text size="lg" weight="bold">YourBrand</Text>
        <Text colorTheme="mutedForeground" size="sm">
          Building the future of design systems
        </Text>
        <HStack spacing={3}>
          <Link href="https://twitter.com">
            <TwitterIcon size={20} />
          </Link>
          <Link href="https://github.com">
            <GithubIcon size={20} />
          </Link>
          <Link href="https://linkedin.com">
            <LinkedInIcon size={20} />
          </Link>
        </HStack>
      </VStack>
      
      {/* Product */}
      <VStack spacing={3} align="start">
        <Text weight="semibold">Product</Text>
        <VStack spacing={2} align="start">
          <Link href="/features" size="sm">Features</Link>
          <Link href="/pricing" size="sm">Pricing</Link>
          <Link href="/changelog" size="sm">Changelog</Link>
          <Link href="/roadmap" size="sm">Roadmap</Link>
        </VStack>
      </VStack>
      
      {/* Resources */}
      <VStack spacing={3} align="start">
        <Text weight="semibold">Resources</Text>
        <VStack spacing={2} align="start">
          <Link href="/docs" size="sm">Documentation</Link>
          <Link href="/guides" size="sm">Guides</Link>
          <Link href="/blog" size="sm">Blog</Link>
          <Link href="/community" size="sm">Community</Link>
        </VStack>
      </VStack>
      
      {/* Company */}
      <VStack spacing={3} align="start">
        <Text weight="semibold">Company</Text>
        <VStack spacing={2} align="start">
          <Link href="/about" size="sm">About</Link>
          <Link href="/careers" size="sm">Careers</Link>
          <Link href="/contact" size="sm">Contact</Link>
          <Link href="/legal" size="sm">Legal</Link>
        </VStack>
      </VStack>
    </Grid>
    
    <Separator my={8} />
    
    <HStack justify="space-between" flexWrap="wrap" gap={4}>
      <Text size="sm" colorTheme="mutedForeground">
        © 2025 YourBrand. All rights reserved.
      </Text>
      <HStack spacing={4}>
        <Link href="/privacy" size="sm">Privacy</Link>
        <Link href="/terms" size="sm">Terms</Link>
        <Link href="/cookies" size="sm">Cookies</Link>
      </HStack>
    </HStack>
  </Container>
</Box>
```

## Pattern 3: Newsletter Footer
```tsx
<Box bg="card" borderTopWidth={1} borderColor="border">
  <Container py={12}>
    <Grid cols={{ base: 1, md: 2 }} gap={8} align="center">
      <VStack spacing={4} align={{ base: 'center', md: 'start' }}>
        <Heading3>Stay Updated</Heading3>
        <Text colorTheme="mutedForeground">
          Get the latest updates on new components and features
        </Text>
      </VStack>
      
      <Form onSubmit={handleSubscribe}>
        <HStack spacing={2}>
          <Input
            type="email"
            placeholder="Enter your email"
            required
          />
          <Button type="submit">Subscribe</Button>
        </HStack>
      </Form>
    </Grid>
    
    <Separator my={8} />
    
    <Grid cols={{ base: 1, sm: 3 }} gap={6}>
      <VStack spacing={2} align={{ base: 'center', sm: 'start' }}>
        <Text weight="semibold">Product</Text>
        <Link href="/components" size="sm">Components</Link>
        <Link href="/themes" size="sm">Themes</Link>
        <Link href="/charts" size="sm">Charts</Link>
      </VStack>
      
      <VStack spacing={2} align={{ base: 'center', sm: 'start' }}>
        <Text weight="semibold">Support</Text>
        <Link href="/docs" size="sm">Documentation</Link>
        <Link href="/discord" size="sm">Discord</Link>
        <Link href="/github" size="sm">GitHub</Link>
      </VStack>
      
      <VStack spacing={2} align={{ base: 'center', sm: 'start' }}>
        <Text weight="semibold">Legal</Text>
        <Link href="/privacy" size="sm">Privacy</Link>
        <Link href="/terms" size="sm">Terms</Link>
        <Link href="/license" size="sm">License</Link>
      </VStack>
    </Grid>
  </Container>
</Box>
```

## Pattern 4: Minimal Footer
```tsx
<Container py={8}>
  <HStack justify="space-between" flexWrap="wrap" gap={4}>
    <Text size="sm" colorTheme="mutedForeground">
      Built with ❤️ using Universal Design System
    </Text>
    <HStack spacing={6}>
      <Link href="/github" size="sm">
        <GithubIcon size={16} />
      </Link>
      <Link href="/twitter" size="sm">
        <TwitterIcon size={16} />
      </Link>
      <SpacingDensitySelector />
      <ThemeSelector />
    </HStack>
  </HStack>
</Container>
```

## Pattern 5: Footer with Stats
```tsx
<Box bg="background" borderTopWidth={1} borderColor="border">
  <Container py={12}>
    {/* Stats Section */}
    <Grid cols={{ base: 2, md: 4 }} gap={6} mb={12}>
      <VStack align="center">
        <Text size="3xl" weight="bold">48+</Text>
        <Text size="sm" colorTheme="mutedForeground">Components</Text>
      </VStack>
      <VStack align="center">
        <Text size="3xl" weight="bold">5</Text>
        <Text size="sm" colorTheme="mutedForeground">Themes</Text>
      </VStack>
      <VStack align="center">
        <Text size="3xl" weight="bold">6</Text>
        <Text size="sm" colorTheme="mutedForeground">Chart Types</Text>
      </VStack>
      <VStack align="center">
        <Text size="3xl" weight="bold">100%</Text>
        <Text size="sm" colorTheme="mutedForeground">Cross-Platform</Text>
      </VStack>
    </Grid>
    
    <Separator mb={8} />
    
    {/* Footer Links */}
    <Grid cols={{ base: 2, md: 4 }} gap={6}>
      {/* Links sections... */}
    </Grid>
    
    <Separator my={8} />
    
    {/* Copyright */}
    <HStack justify="space-between">
      <Text size="sm" colorTheme="mutedForeground">
        © 2025 Universal Design System
      </Text>
      <HStack spacing={3}>
        <Badge variant="outline">v1.0.0</Badge>
        <Link href="/changelog" size="sm">Changelog</Link>
      </HStack>
    </HStack>
  </Container>
</Box>
```