# Testimonial Patterns

## Pattern 1: Simple Testimonial Cards
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        What Our Users Say
      </Heading2>
      <Text size="lg" textAlign="center" colorTheme="mutedForeground">
        Join thousands of developers building with our design system
      </Text>
    </VStack>
    
    <Grid cols={{ base: 1, md: 3 }} gap={8}>
      <Card p={6}>
        <VStack spacing={4}>
          <Rating value={5} readonly />
          <Text>
            "The Universal Design System has transformed how we build apps. 
            Components work flawlessly across all platforms."
          </Text>
          <HStack spacing={3} w="full">
            <Avatar name="Sarah Chen" size="sm" />
            <VStack align="start" spacing={0}>
              <Text weight="semibold" size="sm">Sarah Chen</Text>
              <Text size="xs" colorTheme="mutedForeground">
                CTO at TechStart
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>
      
      <Card p={6}>
        <VStack spacing={4}>
          <Rating value={5} readonly />
          <Text>
            "The theme system is incredible. Our users love being able to 
            switch between different looks instantly."
          </Text>
          <HStack spacing={3} w="full">
            <Avatar name="Alex Rivera" size="sm" />
            <VStack align="start" spacing={0}>
              <Text weight="semibold" size="sm">Alex Rivera</Text>
              <Text size="xs" colorTheme="mutedForeground">
                Lead Developer at AppCo
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>
      
      <Card p={6}>
        <VStack spacing={4}>
          <Rating value={5} readonly />
          <Text>
            "48+ components that just work. We shipped our MVP in half the 
            time we expected."
          </Text>
          <HStack spacing={3} w="full">
            <Avatar name="Jordan Kim" size="sm" />
            <VStack align="start" spacing={0}>
              <Text weight="semibold" size="sm">Jordan Kim</Text>
              <Text size="xs" colorTheme="mutedForeground">
                Founder at StartupXYZ
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>
    </Grid>
  </VStack>
</Container>
```

## Pattern 2: Featured Testimonial
```tsx
<Container py={16}>
  <Card p={12} maxW="4xl" mx="auto">
    <VStack spacing={6} align="center">
      <Text size="4xl" colorTheme="primary">"</Text>
      <Text size="xl" textAlign="center" weight="medium">
        The Universal Design System is the most comprehensive solution I've 
        used. From basic components to complex charts, everything is 
        thoughtfully designed and works perfectly across iOS, Android, and Web.
      </Text>
      <HStack spacing={4}>
        <Avatar name="Maria González" size="lg" />
        <VStack align="start">
          <Text weight="bold" size="lg">Maria González</Text>
          <Text colorTheme="mutedForeground">
            VP of Engineering at Enterprise Corp
          </Text>
        </VStack>
      </HStack>
      <Rating value={5} readonly size="lg" />
    </VStack>
  </Card>
</Container>
```

## Pattern 3: Testimonial Slider
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <Heading2 size="3xl" textAlign="center">
      Trusted by Developers Worldwide
    </Heading2>
    
    <Box position="relative">
      <ScrollContainer horizontal showsHorizontalScrollIndicator={false}>
        <HStack spacing={6} px={4}>
          {testimonials.map((testimonial, index) => (
            <Card key={index} p={6} minW={300} maxW={350}>
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Avatar name={testimonial.name} size="sm" />
                  <Rating value={testimonial.rating} readonly size="sm" />
                </HStack>
                <Text>{testimonial.content}</Text>
                <VStack align="start" w="full">
                  <Text weight="semibold" size="sm">
                    {testimonial.name}
                  </Text>
                  <Text size="xs" colorTheme="mutedForeground">
                    {testimonial.role}
                  </Text>
                </VStack>
              </VStack>
            </Card>
          ))}
        </HStack>
      </ScrollContainer>
      
      {/* Navigation dots */}
      <HStack justify="center" mt={6} spacing={2}>
        {[...Array(Math.ceil(testimonials.length / 3))].map((_, i) => (
          <Box
            key={i}
            w={2}
            h={2}
            borderRadius="full"
            bg={currentSlide === i ? "primary" : "border"}
          />
        ))}
      </HStack>
    </Box>
  </VStack>
</Container>
```

## Pattern 4: Testimonial with Stats
```tsx
<Container py={16}>
  <Grid cols={{ base: 1, md: 2 }} gap={12} align="center">
    <VStack spacing={8}>
      <VStack spacing={4} align="start">
        <Heading2 size="2xl">
          Loved by developers and designers
        </Heading2>
        <Text colorTheme="mutedForeground">
          See why teams choose our Universal Design System for their projects
        </Text>
      </VStack>
      
      {/* Stats */}
      <Grid cols={2} gap={6} w="full">
        <VStack align="start">
          <Text size="3xl" weight="bold">10k+</Text>
          <Text size="sm" colorTheme="mutedForeground">Active Users</Text>
        </VStack>
        <VStack align="start">
          <Text size="3xl" weight="bold">4.9/5</Text>
          <Text size="sm" colorTheme="mutedForeground">Average Rating</Text>
        </VStack>
        <VStack align="start">
          <Text size="3xl" weight="bold">500+</Text>
          <Text size="sm" colorTheme="mutedForeground">Companies</Text>
        </VStack>
        <VStack align="start">
          <Text size="3xl" weight="bold">98%</Text>
          <Text size="sm" colorTheme="mutedForeground">Satisfaction</Text>
        </VStack>
      </Grid>
    </VStack>
    
    <VStack spacing={6}>
      <Card p={6}>
        <VStack spacing={4}>
          <Text size="lg">
            "We migrated our entire app to the Universal Design System in just 
            2 weeks. The consistency across platforms is amazing."
          </Text>
          <HStack spacing={3} w="full">
            <Avatar name="David Park" />
            <VStack align="start">
              <Text weight="semibold">David Park</Text>
              <Text size="sm" colorTheme="mutedForeground">
                Mobile Lead at FinTech Pro
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Card>
      
      <HStack spacing={4}>
        <Button variant="outline">Read More Stories</Button>
        <Link href="/case-studies">View Case Studies →</Link>
      </HStack>
    </VStack>
  </Grid>
</Container>
```

## Pattern 5: Video Testimonials
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        See What They're Building
      </Heading2>
    </VStack>
    
    <Grid cols={{ base: 1, md: 2 }} gap={8}>
      {videoTestimonials.map((video, index) => (
        <Card key={index} overflow="hidden">
          <Box position="relative" aspectRatio={16/9} bg="muted">
            {/* Video thumbnail */}
            <Box position="absolute" inset={0}>
              {/* Play button overlay */}
              <VStack justify="center" align="center" h="full">
                <Button
                  size="lg"
                  variant="ghost"
                  onPress={() => playVideo(video.url)}
                >
                  <PlayIcon size={48} />
                </Button>
              </VStack>
            </Box>
          </Box>
          <VStack p={4} spacing={3} align="start">
            <Text weight="semibold">{video.title}</Text>
            <HStack spacing={2}>
              <Avatar name={video.author} size="xs" />
              <Text size="sm" colorTheme="mutedForeground">
                {video.author} · {video.company}
              </Text>
            </HStack>
          </VStack>
        </Card>
      ))}
    </Grid>
  </VStack>
</Container>
```