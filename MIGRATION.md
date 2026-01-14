# Migration Guide: v1.0.0 to v2.0.0

This guide helps you migrate from version 1.0.0 to 2.0.0 of the Expo Modern Starter Kit.

## 🚨 Breaking Changes

### 1. Project Name Change
The project has been renamed from `expo-fullstack-starter` to `expo-modern-starter`.

**Action Required:**
- Update your `package.json` if you've forked the project
- Update any CI/CD scripts that reference the old name

### 2. Development Approach
Switched from multi-agent to single-agent development with Claude Code.

**Action Required:**
- Remove references to multi-agent system
- Use Claude Code for all development tasks
- Read the new [Agent User Guide](docs/agent-user-guide.md)

### 3. Documentation File Names
All documentation files now use kebab-case instead of SCREAMING_CASE.

**Before:**
```
docs/AUTHENTICATION_GUIDE.md
docs/DESIGN_SYSTEM.md
```

**After:**
```
docs/authentication-guide.md
docs/design-system.md
```

**Action Required:**
- Update any documentation links in your code
- Update bookmarks or references to docs

### 4. Default Expo Go Mode
All start commands now use Expo Go by default.

**Before:**
```bash
bun start           # Development build
bun start --go      # Expo Go
```

**After:**
```bash
bun start           # Expo Go (default)
bun start:dev       # Development build
```

## ✨ New Features to Adopt

### 1. Universal Design System
Take advantage of 48+ cross-platform components:

```typescript
import { 
  Container, 
  VStack, 
  Button, 
  Card 
} from '@/components/universal';
```

### 2. Theme System
Use one of 5 built-in themes:

```typescript
import { useTheme } from '@/lib/theme';

const theme = useTheme();
// Direct access: theme.primary, theme.background
```

### 3. React 19 Performance
Apply new optimization hooks:

```typescript
import { useDeferredValue, useTransition } from 'react';

// For search inputs
const deferredQuery = useDeferredValue(searchQuery);

// For heavy updates
const [isPending, startTransition] = useTransition();
```

### 4. Charts Library
Use the new chart components:

```typescript
import { LineChart, BarChart } from '@/components/universal/charts';
```

## 📝 Step-by-Step Migration

### Step 1: Update Dependencies
```bash
# Update package.json version
sed -i '' 's/"version": "1.0.0"/"version": "2.0.0"/' package.json

# Install any new dependencies
bun install
```

### Step 2: Update Import Paths
```typescript
// Old
import { Button } from '@/components/Button';

// New
import { Button } from '@/components/universal';
```

### Step 3: Update Theme Usage
```typescript
// Old
const theme = useTheme();
const color = theme.colors.primary;

// New
const theme = useTheme();
const color = theme.primary; // Direct access
```

### Step 4: Update Scripts
```json
// package.json scripts
{
  "scripts": {
    // Old
    "start": "expo start",
    "start:expo": "expo start --go",
    
    // New
    "start": "EXPO_GO=1 expo start --host lan --go",
    "start:dev": "expo start --host lan"
  }
}
```

### Step 5: Clean Up Old Files
```bash
# Remove old multi-agent files
rm -rf docker-compose.agents.yml
rm -rf docker/Dockerfile.agent
rm -rf docker/Dockerfile.hub

# Remove old scripts
rm -rf scripts/agents/
```

## 🔧 Configuration Updates

### Environment Variables
No changes required. All existing environment variables work as before.

### Database Configuration
- `bun local` - Uses Docker PostgreSQL
- `bun dev` - Uses Neon Cloud
- No migration needed for existing databases

### Authentication
All auth flows remain the same. OAuth configuration is unchanged.

## 🧪 Testing Your Migration

1. **Run Tests**
   ```bash
   bun test
   ```

2. **Test Expo Go Mode**
   ```bash
   bun start
   # Should launch in Expo Go
   ```

3. **Test Components**
   ```bash
   bun run storybook
   # If you have Storybook setup
   ```

4. **Test Build**
   ```bash
   bun preview:ios
   bun preview:android
   ```

## 🚑 Troubleshooting

### Issue: Documentation links broken
**Solution**: Update all doc links to use kebab-case

### Issue: Components not found
**Solution**: Import from `@/components/universal`

### Issue: Theme colors undefined
**Solution**: Access theme properties directly, not through `.colors`

### Issue: Expo Go not working
**Solution**: Make sure you're using `bun start` (not `bun start:dev`)

## 📚 Resources

- [Agent User Guide](docs/agent-user-guide.md)
- [Quick Reference](docs/quick-reference.md)
- [Universal Components](docs/design-system/universal-component-library.md)
- [Theme System](docs/design-system/spacing-theme-system.md)

## 💬 Getting Help

If you encounter issues during migration:

1. Check the [CHANGELOG.md](CHANGELOG.md) for detailed changes
2. Review the updated [README.md](README.md)
3. Search existing issues on GitHub
4. Create a new issue with migration details

---

**Remember**: The core functionality remains the same. This update primarily improves developer experience, performance, and documentation.