# Navigation Patterns

## Pattern 1: Top Navigation Bar
```tsx
<Box borderBottomWidth={1} borderColor="border">
  <Container>
    <HStack py={4} justify="space-between" align="center">
      {/* Logo */}
      <HStack spacing={8} align="center">
        <Text size="xl" weight="bold">Logo</Text>
        
        {/* Desktop Navigation */}
        <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
          <Link href="/">Home</Link>
          <Link href="/components">Components</Link>
          <Link href="/docs">Documentation</Link>
          <Link href="/pricing">Pricing</Link>
        </HStack>
      </HStack>
      
      {/* Actions */}
      <HStack spacing={4}>
        <ThemeSelector />
        <Button variant="ghost" size="sm">Sign In</Button>
        <Button size="sm">Get Started</Button>
        
        {/* Mobile Menu */}
        <Button
          variant="ghost"
          size="sm"
          display={{ base: 'flex', md: 'none' }}
          onPress={toggleMobileMenu}
        >
          <MenuIcon />
        </Button>
      </HStack>
    </HStack>
  </Container>
</Box>
```

## Pattern 2: Sidebar Navigation
```tsx
<Box w={240} h="full" borderRightWidth={1} borderColor="border">
  <VStack spacing={1} p={4}>
    {/* Logo */}
    <Box py={4} px={2}>
      <Text size="xl" weight="bold">Dashboard</Text>
    </Box>
    
    {/* Navigation Groups */}
    <VStack spacing={6} w="full">
      <VStack spacing={1} w="full">
        <Text size="xs" colorTheme="mutedForeground" px={2} py={1}>
          MAIN
        </Text>
        <NavItem href="/dashboard" icon={<HomeIcon />}>
          Home
        </NavItem>
        <NavItem href="/analytics" icon={<ChartIcon />}>
          Analytics
        </NavItem>
        <NavItem href="/reports" icon={<FileIcon />}>
          Reports
        </NavItem>
      </VStack>
      
      <VStack spacing={1} w="full">
        <Text size="xs" colorTheme="mutedForeground" px={2} py={1}>
          SETTINGS
        </Text>
        <NavItem href="/profile" icon={<UserIcon />}>
          Profile
        </NavItem>
        <NavItem href="/settings" icon={<SettingsIcon />}>
          Settings
        </NavItem>
      </VStack>
    </VStack>
  </VStack>
</Box>
```

## Pattern 3: Tab Navigation
```tsx
<Tabs defaultValue="overview" w="full">
  <Box borderBottomWidth={1} borderColor="border">
    <Container>
      <TabsList h={12} bg="transparent" border="none">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">
          Notifications
          <Badge ml={2} variant="secondary">3</Badge>
        </TabsTrigger>
      </TabsList>
    </Container>
  </Box>
  
  <Container py={6}>
    <TabsContent value="overview">
      {/* Overview content */}
    </TabsContent>
    <TabsContent value="analytics">
      {/* Analytics content */}
    </TabsContent>
    {/* Other contents */}
  </Container>
</Tabs>
```

## Pattern 4: Breadcrumb Navigation
```tsx
<Breadcrumb separator="/">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage>Button</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Pattern 5: Mobile Navigation Drawer
```tsx
<Drawer
  open={mobileMenuOpen}
  onOpenChange={setMobileMenuOpen}
  position="left"
>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Menu</DrawerTitle>
      <DrawerClose />
    </DrawerHeader>
    
    <VStack spacing={1} p={4}>
      <NavItem href="/" onPress={() => setMobileMenuOpen(false)}>
        Home
      </NavItem>
      <NavItem href="/components" onPress={() => setMobileMenuOpen(false)}>
        Components
      </NavItem>
      <NavItem href="/docs" onPress={() => setMobileMenuOpen(false)}>
        Documentation
      </NavItem>
      <Separator my={4} />
      <NavItem href="/settings" onPress={() => setMobileMenuOpen(false)}>
        Settings
      </NavItem>
    </VStack>
  </DrawerContent>
</Drawer>
```

## Pattern 6: Command Palette Navigation
```tsx
<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    
    <CommandGroup heading="Pages">
      <CommandItem onSelect={() => navigate('/')}>
        <HomeIcon size={16} />
        <span>Home</span>
      </CommandItem>
      <CommandItem onSelect={() => navigate('/components')}>
        <ComponentIcon size={16} />
        <span>Components</span>
      </CommandItem>
    </CommandGroup>
    
    <CommandGroup heading="Actions">
      <CommandItem onSelect={handleNewProject}>
        <PlusIcon size={16} />
        <span>New Project</span>
        <CommandShortcut>⌘N</CommandShortcut>
      </CommandItem>
      <CommandItem onSelect={handleSettings}>
        <SettingsIcon size={16} />
        <span>Settings</span>
        <CommandShortcut>⌘,</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

## Pattern 7: Stepper Navigation
```tsx
<Stepper activeStep={currentStep} orientation="horizontal">
  <Step>
    <StepIndicator>
      <StepStatus
        complete={<CheckIcon />}
        incomplete={<StepNumber />}
        active={<StepNumber />}
      />
    </StepIndicator>
    <Box>
      <StepTitle>Account Details</StepTitle>
      <StepDescription>Enter your information</StepDescription>
    </Box>
    <StepSeparator />
  </Step>
  
  <Step>
    <StepIndicator>
      <StepStatus
        complete={<CheckIcon />}
        incomplete={<StepNumber />}
        active={<StepNumber />}
      />
    </StepIndicator>
    <Box>
      <StepTitle>Profile Setup</StepTitle>
      <StepDescription>Customize your profile</StepDescription>
    </Box>
    <StepSeparator />
  </Step>
  
  <Step>
    <StepIndicator>
      <StepStatus
        complete={<CheckIcon />}
        incomplete={<StepNumber />}
        active={<StepNumber />}
      />
    </StepIndicator>
    <Box>
      <StepTitle>Confirmation</StepTitle>
      <StepDescription>Review and confirm</StepDescription>
    </Box>
  </Step>
</Stepper>
```