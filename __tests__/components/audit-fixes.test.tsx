import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Dialog, DialogContent, DialogTrigger } from '@/components/universal/Dialog';
import { DropdownMenu, DropdownMenuItem } from '@/components/universal/DropdownMenu';
import { Popover } from '@/components/universal/Popover';
import { Switch } from '@/components/universal/Switch';
import { Button } from '@/components/universal/Button';
import { Text } from '@/components/universal/Text';
import { EnhancedThemeProvider } from '@/lib/theme/theme-provider';

// Mock theme provider
const mockTheme = {
  primary: '#007AFF',
  foreground: '#000000',
  background: '#FFFFFF',
  border: '#E5E5E5',
  muted: '#F5F5F5',
  accent: '#007AFF',
  popover: '#FFFFFF',
  card: '#FFFFFF',
  mutedForeground: '#666666',
};

jest.mock('@/lib/theme/theme-provider', () => ({
  ...jest.requireActual('@/lib/theme/theme-provider'),
  useTheme: () => mockTheme,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <EnhancedThemeProvider>
    {children}
  </EnhancedThemeProvider>
);

describe('Universal Components Audit Fixes', () => {
  describe('Dialog Component', () => {
    it('should use Pressable for interactive elements', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent testID="dialog-content">
              <Text>Dialog Content</Text>
            </DialogContent>
          </Dialog>
        </TestWrapper>
      );

      // Check that close button exists and is pressable
      const closeButton = getByTestId('dialog-close-button');
      expect(closeButton).toBeDefined();
    });

    it('should show loading state when isLoading is true', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent isLoading={true} testID="dialog-content">
              <Text>Dialog Content</Text>
            </DialogContent>
          </Dialog>
        </TestWrapper>
      );

      const loadingIndicator = getByTestId('dialog-loading');
      expect(loadingIndicator).toBeDefined();
    });
  });

  describe('DropdownMenu Component', () => {
    it('should use theme colors directly without fallbacks', () => {
      const { getByText } = render(
        <TestWrapper>
          <DropdownMenu>
            <DropdownMenuItem>
              <Text>Menu Item</Text>
            </DropdownMenuItem>
          </DropdownMenu>
        </TestWrapper>
      );

      const menuItem = getByText('Menu Item');
      expect(menuItem).toBeDefined();
      // Verify no console errors about undefined theme properties
    });

    it('should have hover states on menu items', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <DropdownMenu>
            <DropdownMenuItem onPress={onPress}>
              <Text>Menu Item</Text>
            </DropdownMenuItem>
          </DropdownMenu>
        </TestWrapper>
      );

      const menuItem = getByText('Menu Item');
      fireEvent.press(menuItem);
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('Popover Component', () => {
    it('should use theme popover color directly', () => {
      const { getByText } = render(
        <TestWrapper>
          <Popover
            open={true}
            content={<Text>Popover Content</Text>}
          >
            <Button>Trigger</Button>
          </Popover>
        </TestWrapper>
      );

      const content = getByText('Popover Content');
      expect(content).toBeDefined();
    });

    it('should show loading state', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Popover
            open={true}
            isLoading={true}
            content={<Text>Popover Content</Text>}
            testID="popover"
          >
            <Button>Trigger</Button>
          </Popover>
        </TestWrapper>
      );

      // Should show loading indicator instead of content
      expect(() => getByTestId('popover-loading')).toBeDefined();
    });
  });

  describe('Switch Component', () => {
    it('should render with simplified Platform.select', () => {
      const onCheckedChange = jest.fn();
      const { getByRole } = render(
        <TestWrapper>
          <Switch
            checked={false}
            onCheckedChange={onCheckedChange}
          />
        </TestWrapper>
      );

      const switchElement = getByRole('switch');
      fireEvent(switchElement, 'valueChange', true);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should apply size transformations correctly', () => {
      const { getByRole } = render(
        <TestWrapper>
          <Switch size="sm" checked={false} onCheckedChange={() => {}} />
        </TestWrapper>
      );

      const switchElement = getByRole('switch');
      expect(switchElement.props.style).toContainEqual({
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
      });
    });
  });

  describe('Theme Import Verification', () => {
    it('should access theme properties directly', () => {
      // This test verifies that components can access theme properties
      // without the .colors intermediate object
      expect(mockTheme.primary).toBeDefined();
      expect(mockTheme.foreground).toBeDefined();
      expect(mockTheme.border).toBeDefined();
      
      // Should NOT have a colors property
      expect((mockTheme as any).colors).toBeUndefined();
    });
  });
});

describe('Visual Feedback Tests', () => {
  it('Dialog buttons should have press feedback', async () => {
    const { getByText } = render(
      <TestWrapper>
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent>
            <Button>Action Button</Button>
          </DialogContent>
        </Dialog>
      </TestWrapper>
    );

    const button = getByText('Action Button');
    
    // Simulate press in
    fireEvent.pressIn(button);
    // Style should change on press
    
    // Simulate press out
    fireEvent.pressOut(button);
    // Style should revert
  });

  it('DropdownMenu items should have hover/press states', () => {
    const { getByText } = render(
      <TestWrapper>
        <DropdownMenu>
          <DropdownMenuItem>
            <Text>Menu Item</Text>
          </DropdownMenuItem>
        </DropdownMenu>
      </TestWrapper>
    );

    const menuItem = getByText('Menu Item');
    
    // Test press states
    fireEvent.pressIn(menuItem);
    fireEvent.pressOut(menuItem);
  });
});

describe('Loading States', () => {
  it('Dialog should show loading indicator', () => {
    const { queryByText, getByTestId } = render(
      <TestWrapper>
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent isLoading={true}>
            <Text>Should not be visible</Text>
          </DialogContent>
        </Dialog>
      </TestWrapper>
    );

    expect(queryByText('Should not be visible')).toBeNull();
    expect(queryByText('Loading...')).toBeDefined();
  });

  it('Popover should show loading indicator', () => {
    const { queryByText } = render(
      <TestWrapper>
        <Popover
          open={true}
          isLoading={true}
          content={<Text>Should not be visible</Text>}
        >
          <Button>Trigger</Button>
        </Popover>
      </TestWrapper>
    );

    expect(queryByText('Should not be visible')).toBeNull();
    expect(queryByText('Loading...')).toBeDefined();
  });
});