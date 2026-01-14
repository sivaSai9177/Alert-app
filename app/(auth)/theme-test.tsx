import React from 'react';
import { useRouter } from 'expo-router';
import {
  Container,
  VStack,
  HStack,
  Box,
  Text,
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
  Caption,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  Alert,
  Badge,
  Progress,
  Separator,
  Switch,
  Checkbox,
  Select,
  Avatar,
  AvatarGroup,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Tooltip,
} from '@/components/universal';
import { ThemeSelector } from '@/components/ThemeSelector';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SpacingDensitySelector } from '@/components/SpacingDensitySelector';
import { useThemeContext } from '@/lib/theme/enhanced-theme-provider';
import { Ionicons } from '@expo/vector-icons';

export default function ThemeTestScreen() {
  const router = useRouter();
  const { themeId, colorScheme } = useThemeContext();
  const [switchValue, setSwitchValue] = React.useState(false);
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState('option1');
  const [toggleValue, setToggleValue] = React.useState('left');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <Container scroll safe>
      <VStack p={4} spacing={6}>
        {/* Header */}
        <VStack spacing={2}>
          <Heading1>Theme Testing</Heading1>
          <Paragraph colorTheme="mutedForeground">
            Current theme: {themeId} ({colorScheme} mode)
          </Paragraph>
        </VStack>

        {/* Theme Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>
              Configure the appearance of the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={4}>
              <DarkModeToggle />
              <Separator my={2} />
              <ThemeSelector />
              <Separator my={2} />
              <SpacingDensitySelector />
            </VStack>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <VStack spacing={3}>
              <Heading1>Heading 1</Heading1>
              <Heading2>Heading 2</Heading2>
              <Heading3>Heading3</Heading3>
              <Paragraph>
                This is a paragraph with normal text. It demonstrates the default text styling and line height.
              </Paragraph>
              <Caption>This is a caption with muted color</Caption>
              <Text colorTheme="primary">Primary colored text</Text>
              <Text colorTheme="secondary">Secondary colored text</Text>
              <Text colorTheme="destructive">Destructive colored text</Text>
              <Text colorTheme="success">Success colored text</Text>
            </VStack>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent>
            <VStack spacing={3}>
              <HStack spacing={2} flexWrap="wrap">
                <Button variant="solid" colorScheme="primary">Primary</Button>
                <Button variant="solid" colorScheme="secondary">Secondary</Button>
                <Button variant="solid" colorScheme="destructive">Destructive</Button>
              </HStack>
              <HStack spacing={2} flexWrap="wrap">
                <Button variant="outline" colorScheme="primary">Outline</Button>
                <Button variant="ghost" colorScheme="primary">Ghost</Button>
                <Button variant="link" colorScheme="primary">Link</Button>
              </HStack>
              <HStack spacing={2} flexWrap="wrap">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </HStack>
              <Button fullWidth leftIcon={<Ionicons name="save" size={16} />}>
                Full Width with Icon
              </Button>
            </VStack>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <VStack spacing={4}>
              <Box>
                <Label>Text Input</Label>
                <Input placeholder="Enter some text..." />
              </Box>
              
              <Box>
                <Label>Select</Label>
                <Select
                  value={selectValue}
                  onValueChange={setSelectValue}
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3' },
                  ]}
                  placeholder="Select an option"
                />
              </Box>

              <HStack spacing={4} alignItems="center">
                <Label>Switch</Label>
                <Switch value={switchValue} onValueChange={setSwitchValue} />
              </HStack>

              <HStack spacing={4} alignItems="center">
                <Checkbox checked={checkboxValue} onCheckedChange={setCheckboxValue} />
                <Label>Checkbox option</Label>
              </HStack>

              <Box>
                <Label mb={2}>Toggle Group</Label>
                <ToggleGroup value={toggleValue} onValueChange={setToggleValue}>
                  <ToggleGroupItem value="left">Left</ToggleGroupItem>
                  <ToggleGroupItem value="center">Center</ToggleGroupItem>
                  <ToggleGroupItem value="right">Right</ToggleGroupItem>
                </ToggleGroup>
              </Box>
            </VStack>
          </CardContent>
        </Card>

        {/* Feedback Components */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Components</CardTitle>
          </CardHeader>
          <CardContent>
            <VStack spacing={4}>
              <Alert variant="default" title="Default Alert" description="This is a default alert message" />
              <Alert variant="info" title="Info Alert" description="This is an informational message" showIcon />
              <Alert variant="success" title="Success!" description="Operation completed successfully" showIcon />
              <Alert variant="warning" title="Warning" description="Please review before proceeding" showIcon />
              <Alert variant="error" title="Error" description="Something went wrong" showIcon />

              <HStack spacing={2} flexWrap="wrap">
                <Badge>Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
              </HStack>

              <Box>
                <Text mb={2}>Progress Bar</Text>
                <Progress value={65} showValue />
              </Box>
            </VStack>
          </CardContent>
        </Card>

        {/* Data Display */}
        <Card>
          <CardHeader>
            <CardTitle>Data Display</CardTitle>
          </CardHeader>
          <CardContent>
            <VStack spacing={4}>
              <HStack spacing={4} alignItems="center">
                <Avatar name="John Doe" size="sm" />
                <Avatar name="Jane Smith" size="md" bgColorTheme="primary" />
                <Avatar name="Bob Johnson" size="lg" bgColorTheme="secondary" />
              </HStack>

              <Box>
                <Text mb={2}>Avatar Group</Text>
                <AvatarGroup max={3}>
                  <Avatar name="User 1" />
                  <Avatar name="User 2" />
                  <Avatar name="User 3" />
                  <Avatar name="User 4" />
                  <Avatar name="User 5" />
                </AvatarGroup>
              </Box>

              <Box>
                <Text mb={2}>Loading Skeleton</Text>
                <VStack spacing={2}>
                  <Skeleton variant="text" lines={3} />
                  <HStack spacing={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                      <Skeleton variant="rectangular" height={40} />
                    </Box>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </CardContent>
        </Card>

        {/* Overlays */}
        <Card>
          <CardHeader>
            <CardTitle>Overlays</CardTitle>
          </CardHeader>
          <CardContent>
            <VStack spacing={4}>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                      This is a dialog description. It provides additional context about the dialog content.
                    </DialogDescription>
                  </DialogHeader>
                  <VStack spacing={4} py={4}>
                    <Text>Dialog content goes here...</Text>
                  </VStack>
                  <DialogFooter>
                    <Button variant="outline" onPress={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onPress={() => setDialogOpen(false)}>
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Open Dropdown
                    <Ionicons name="chevron-down" size={16} style={{ marginLeft: 8 }} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                    <Ionicons name="pencil" size={16} />
                    <Text>Edit</Text>
                  </DropdownMenuItem>
                    <Ionicons name="copy" size={16} />
                    <Text>Duplicate</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                    <Ionicons name="trash" size={16} />
                    <Text>Delete</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip content="This is a helpful tooltip">
                <Button variant="outline">
                  Hover for Tooltip
                  <Ionicons name="information-circle-outline" size={16} style={{ marginLeft: 8 }} />
                </Button>
              </Tooltip>
            </VStack>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardFooter>
            <Button
              variant="outline"
              fullWidth
              onPress={() => router.back()}
              leftIcon={<Ionicons name="arrow-back" size={16} />}
            >
              Back to App
            </Button>
          </CardFooter>
        </Card>
      </VStack>
    </Container>
  );
}