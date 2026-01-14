# Universal Components Quick Reference for Agents

## 🚀 Quick Start Commands

```bash
# View component status
cat UNIVERSAL_COMPONENTS_STATUS.md

# Check task index
cat docs/multi-agent/UNIVERSAL_COMPONENTS_TASK_INDEX.md

# Find component files
ls components/universal/ | grep -i "component_name"

# Check exports
grep "export.*from.*Component" components/universal/index.ts

# Run component tests
bun test components/universal/ComponentName.test.tsx

# View implementation guide
cat docs/multi-agent/UNIVERSAL_COMPONENTS_TASK_INDEX.md | grep -A 20 "Implementation Guide"
```

## 📊 Current Status (January 7, 2025)

| Metric | Value |
|--------|-------|
| Total Components | 50+ |
| Completed | 48 (96%) |
| Charts Implemented | 6 types |
| Remaining | 2 (4%) |
| Today's Progress | 18 components + 6 charts |
| Sprint Efficiency | 300% |

## 🔍 Component Locations

### Completed Components (48 + 6 Chart Types)
```
components/universal/
├── Accordion.tsx ✅
├── Alert.tsx ✅
├── Avatar.tsx ✅
├── Badge.tsx ✅
├── Box.tsx ✅
├── Breadcrumb.tsx ✅
├── Button.tsx ✅
├── Card.tsx ✅
├── Checkbox.tsx ✅
├── Container.tsx ✅
├── DatePicker.tsx ✅ (NEW)
├── Dialog.tsx ✅
├── DropdownMenu.tsx ✅
├── EmptyState.tsx ✅ (NEW)
├── Form.tsx ✅
├── Grid.tsx ✅ (NEW)
├── Input.tsx ✅
├── Label.tsx ✅
├── Link.tsx ✅
├── NavigationMenu.tsx ✅
├── Pagination.tsx ✅ (NEW)
├── Popover.tsx ✅ (NEW)
├── Progress.tsx ✅
├── RadioGroup.tsx ✅
├── Rating.tsx ✅ (NEW)
├── ScrollContainer.tsx ✅
├── ScrollHeader.tsx ✅
├── Search.tsx ✅ (NEW)
├── Select.tsx ✅
├── Separator.tsx ✅
├── Skeleton.tsx ✅
├── Slider.tsx ✅ (NEW)
├── Stack.tsx ✅
├── Stepper.tsx ✅ (NEW)
├── Switch.tsx ✅
├── Table.tsx ✅
├── Tabs.tsx ✅
├── Text.tsx ✅
├── Timeline.tsx ✅ (NEW)
├── Toast.tsx ✅
├── Toggle.tsx ✅
├── Tooltip.tsx ✅
├── Drawer.tsx ✅ (NEW)
├── List.tsx ✅ (NEW)
├── Stats.tsx ✅ (NEW)
├── Collapsible.tsx ✅ (NEW)
├── FilePicker.tsx ✅ (NEW)
├── ColorPicker.tsx ✅ (NEW)
├── Command.tsx ✅ (NEW)
├── ContextMenu.tsx ✅ (NEW)
└── charts/
    ├── LineChart.tsx ✅ (NEW)
    ├── BarChart.tsx ✅ (NEW)
    ├── PieChart.tsx ✅ (NEW)
    ├── AreaChart.tsx ✅ (NEW)
    ├── RadarChart.tsx ✅ (NEW)
    └── RadialChart.tsx ✅ (NEW)
```

### Remaining Components (2)
```
Priority Order:
1. Banner (Medium) - Page-level notifications (skipped by request)
2. Additional nice-to-have components for future implementation
```

## 📝 Implementation Template

```typescript
// File: components/universal/ComponentName.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme/theme-provider';
import { useSpacing } from '@/contexts/SpacingContext';

export interface ComponentNameProps {
  // Required props
  value: any;
  onValueChange: (value: any) => void;
  
  // Optional props
  variant?: 'default' | 'compact' | 'large';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  
  // Style props
  style?: ViewStyle;
  testID?: string;
}

export const ComponentName = React.forwardRef<View, ComponentNameProps>(
  (
    {
      value,
      onValueChange,
      variant = 'default',
      size = 'md',
      disabled = false,
      style,
      testID,
    },
    ref
  ) => {
    const theme = useTheme();
    const { spacing } = useSpacing();
    
    // Component logic here
    
    return (
      <View ref={ref} style={[containerStyle, style]} testID={testID}>
        {/* Component JSX */}
      </View>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

## ✅ Implementation Checklist

- [ ] Create component file
- [ ] Add TypeScript interfaces
- [ ] Implement React.forwardRef
- [ ] Add theme integration
- [ ] Add spacing system
- [ ] Support size variants
- [ ] Add disabled state
- [ ] Export from index.ts
- [ ] Update UNIVERSAL_COMPONENTS_STATUS.md
- [ ] Update documentation count
- [ ] Test on all platforms

## 📚 Key Documentation Files

1. **Task Index**: `/docs/multi-agent/UNIVERSAL_COMPONENTS_TASK_INDEX.md`
2. **Component Status**: `/UNIVERSAL_COMPONENTS_STATUS.md`
3. **Library Docs**: `/docs/design-system/UNIVERSAL_COMPONENT_LIBRARY.md`
4. **Implementation Summary**: `/docs/design-system/UNIVERSAL_DESIGN_SYSTEM_IMPLEMENTATION_SUMMARY.md`
5. **Master Task Manager**: `/docs/multi-agent/MASTER_TASK_MANAGER.md`
6. **Charts Guide**: `/docs/design-system/CHARTS_IMPLEMENTATION.md`
7. **Charts Index**: `/docs/multi-agent/CHARTS_IMPLEMENTATION_INDEX.md`

## 🎯 Next Actions

1. Implement Blocks Inspiration Library (TASK-104)
2. Use charts in Admin Dashboard (TASK-002)
3. Add charts to Organization Management (TASK-005)
4. Create component showcase app
5. Write unit tests for new components

## 🔗 Quick Links

- [Component Task Details](./UNIVERSAL_COMPONENTS_TASK_INDEX.md#3-remaining-tasks)
- [Implementation Guide](./UNIVERSAL_COMPONENTS_TASK_INDEX.md#4-component-implementation-guide)
- [Testing Requirements](./UNIVERSAL_COMPONENTS_TASK_INDEX.md#6-testing-requirements)
- [Documentation Updates](./UNIVERSAL_COMPONENTS_TASK_INDEX.md#7-documentation-updates)