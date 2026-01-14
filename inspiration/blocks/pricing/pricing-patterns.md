# Pricing Table Patterns

## Pattern 1: Simple Pricing Cards
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        Simple, Transparent Pricing
      </Heading2>
      <Text size="lg" textAlign="center" colorTheme="mutedForeground">
        Choose the plan that works for you
      </Text>
    </VStack>
    
    <Grid cols={{ base: 1, md: 3 }} gap={8}>
      {/* Basic Plan */}
      <Card p={6}>
        <VStack spacing={6}>
          <VStack spacing={2}>
            <Text size="lg" weight="semibold">Basic</Text>
            <Text size="3xl" weight="bold">
              $0
              <Text as="span" size="sm" colorTheme="mutedForeground">
                /month
              </Text>
            </Text>
          </VStack>
          
          <VStack spacing={3} align="start" w="full">
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">20+ Components</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">2 Themes</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">Community Support</Text>
            </HStack>
          </VStack>
          
          <Button variant="outline" w="full">
            Get Started
          </Button>
        </VStack>
      </Card>
      
      {/* Pro Plan - Featured */}
      <Card p={6} borderColor="primary" borderWidth={2}>
        <Badge variant="secondary" position="absolute" top={-3} right={4}>
          Most Popular
        </Badge>
        <VStack spacing={6}>
          <VStack spacing={2}>
            <Text size="lg" weight="semibold">Pro</Text>
            <Text size="3xl" weight="bold">
              $29
              <Text as="span" size="sm" colorTheme="mutedForeground">
                /month
              </Text>
            </Text>
          </VStack>
          
          <VStack spacing={3} align="start" w="full">
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">48+ Components</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">5 Themes</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">Charts Library</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">Priority Support</Text>
            </HStack>
          </VStack>
          
          <Button w="full">Get Started</Button>
        </VStack>
      </Card>
      
      {/* Enterprise Plan */}
      <Card p={6}>
        <VStack spacing={6}>
          <VStack spacing={2}>
            <Text size="lg" weight="semibold">Enterprise</Text>
            <Text size="3xl" weight="bold">
              Custom
            </Text>
          </VStack>
          
          <VStack spacing={3} align="start" w="full">
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">Everything in Pro</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">Custom Components</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">Dedicated Support</Text>
            </HStack>
            <HStack spacing={2}>
              <CheckIcon size={16} color="green" />
              <Text size="sm">SLA Guarantee</Text>
            </HStack>
          </VStack>
          
          <Button variant="outline" w="full">
            Contact Sales
          </Button>
        </VStack>
      </Card>
    </Grid>
  </VStack>
</Container>
```

## Pattern 2: Pricing Toggle
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={6} align="center">
      <Heading2 size="3xl" textAlign="center">
        Pricing Plans
      </Heading2>
      
      {/* Billing Toggle */}
      <HStack spacing={4}>
        <Text colorTheme={!isYearly ? "foreground" : "mutedForeground"}>
          Monthly
        </Text>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Text colorTheme={isYearly ? "foreground" : "mutedForeground"}>
          Yearly
        </Text>
        <Badge variant="secondary">Save 20%</Badge>
      </HStack>
    </VStack>
    
    <Grid cols={{ base: 1, md: 3 }} gap={8}>
      {plans.map((plan) => (
        <Card key={plan.name} p={6}>
          <VStack spacing={6}>
            <Text size="lg" weight="semibold">{plan.name}</Text>
            <Text size="3xl" weight="bold">
              ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
              <Text as="span" size="sm" colorTheme="mutedForeground">
                /{isYearly ? 'year' : 'month'}
              </Text>
            </Text>
            {/* Features list */}
          </VStack>
        </Card>
      ))}
    </Grid>
  </VStack>
</Container>
```

## Pattern 3: Comparison Table
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <Heading2 size="3xl" textAlign="center">
      Compare Plans
    </Heading2>
    
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Features</TableHead>
          <TableHead textAlign="center">Basic</TableHead>
          <TableHead textAlign="center">Pro</TableHead>
          <TableHead textAlign="center">Enterprise</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Components</TableCell>
          <TableCell textAlign="center">20+</TableCell>
          <TableCell textAlign="center">48+</TableCell>
          <TableCell textAlign="center">Unlimited</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Themes</TableCell>
          <TableCell textAlign="center">2</TableCell>
          <TableCell textAlign="center">5</TableCell>
          <TableCell textAlign="center">Custom</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Charts</TableCell>
          <TableCell textAlign="center">
            <XIcon size={16} color="red" />
          </TableCell>
          <TableCell textAlign="center">
            <CheckIcon size={16} color="green" />
          </TableCell>
          <TableCell textAlign="center">
            <CheckIcon size={16} color="green" />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Support</TableCell>
          <TableCell textAlign="center">Community</TableCell>
          <TableCell textAlign="center">Priority</TableCell>
          <TableCell textAlign="center">Dedicated</TableCell>
        </TableRow>
        <TableRow>
          <TableCell></TableCell>
          <TableCell textAlign="center">
            <Button size="sm" variant="outline">Choose</Button>
          </TableCell>
          <TableCell textAlign="center">
            <Button size="sm">Choose</Button>
          </TableCell>
          <TableCell textAlign="center">
            <Button size="sm" variant="outline">Contact</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </VStack>
</Container>
```

## Pattern 4: Feature-Based Pricing
```tsx
<Container py={16}>
  <VStack spacing={12}>
    <VStack spacing={4} align="center">
      <Heading2 size="3xl" textAlign="center">
        Pay for What You Need
      </Heading2>
      <Text size="lg" textAlign="center" colorTheme="mutedForeground">
        Start with essentials, add features as you grow
      </Text>
    </VStack>
    
    <Card p={8} maxW="2xl" mx="auto">
      <VStack spacing={6}>
        {/* Base Package */}
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing={1}>
            <Text weight="semibold">Base Package</Text>
            <Text size="sm" colorTheme="mutedForeground">
              Core components and features
            </Text>
          </VStack>
          <Text size="xl" weight="bold">$19/mo</Text>
        </HStack>
        
        <Separator />
        
        {/* Add-ons */}
        <VStack spacing={4} w="full">
          <Text weight="semibold" alignSelf="start">Add-ons</Text>
          
          <HStack justify="space-between" w="full">
            <HStack spacing={3}>
              <Checkbox />
              <VStack align="start" spacing={0}>
                <Text>Charts Library</Text>
                <Text size="sm" colorTheme="mutedForeground">
                  6 chart types with animations
                </Text>
              </VStack>
            </HStack>
            <Text weight="semibold">+$10/mo</Text>
          </HStack>
          
          <HStack justify="space-between" w="full">
            <HStack spacing={3}>
              <Checkbox />
              <VStack align="start" spacing={0}>
                <Text>Premium Themes</Text>
                <Text size="sm" colorTheme="mutedForeground">
                  3 additional themes
                </Text>
              </VStack>
            </HStack>
            <Text weight="semibold">+$5/mo</Text>
          </HStack>
          
          <HStack justify="space-between" w="full">
            <HStack spacing={3}>
              <Checkbox />
              <VStack align="start" spacing={0}>
                <Text>Priority Support</Text>
                <Text size="sm" colorTheme="mutedForeground">
                  24/7 dedicated support
                </Text>
              </VStack>
            </HStack>
            <Text weight="semibold">+$15/mo</Text>
          </HStack>
        </VStack>
        
        <Separator />
        
        {/* Total */}
        <HStack justify="space-between" w="full">
          <Text size="lg" weight="semibold">Total</Text>
          <Text size="2xl" weight="bold">$19/mo</Text>
        </HStack>
        
        <Button w="full" size="lg">
          Start Free Trial
        </Button>
      </VStack>
    </Card>
  </VStack>
</Container>
```