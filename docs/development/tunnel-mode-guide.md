# Tunnel Mode Guide

## Understanding Expo Tunnel Mode

When you run `bun start:tunnel`, Expo creates a secure tunnel to your local development server. This allows access from anywhere without network configuration.

### Default Behavior

1. **Start with tunnel**: `bun start:tunnel`
2. **Default mode**: Opens in development build mode
3. **Switch to Expo Go**: Press `s` in terminal
4. **Web access**: 
   - Press `w` opens tunnel URL (https://[id].exp.direct)
   - For localhost: Open browser manually to http://localhost:8081

### Proper Usage Patterns

#### For Mobile Development (iOS/Android)
```bash
# Start tunnel
bun start:tunnel

# Press 's' to switch to Expo Go
# Use the exp:// URL in Expo Go app
```

#### For Web Development
```bash
# Option 1: Regular web (localhost) - RECOMMENDED
bun web

# Option 2: If already running tunnel mode
bun start:tunnel
# Don't press 'w' (it opens tunnel URL)
# Instead, in another terminal:
bun web:open
# Or manually open: http://localhost:8081

# Option 3: Web with tunnel (for sharing)
bun web:tunnel
```

### Quick Web Access in Tunnel Mode

When running `bun start:tunnel`, pressing 'w' opens the tunnel URL which may cause issues. Instead:

1. **Open new terminal tab**
2. **Run**: `bun web:open`
3. **Or manually open**: `http://localhost:8081`

This ensures web always uses localhost, avoiding Reanimated and other tunnel-specific issues.

### Important Notes

1. **Tunnel URL vs Localhost**:
   - Tunnel URL (https://[id].exp.direct) - For mobile and sharing
   - Localhost (http://localhost:8081) - For local web development

2. **Reanimated on Web**:
   - Animations are disabled on web (expected behavior)
   - Some warnings may appear but are suppressed

3. **Authentication**:
   - In tunnel mode, auth tokens may not persist between reloads
   - This is normal behavior for security reasons

### Troubleshooting

#### "Cannot read properties of undefined" on Web
- Don't use the tunnel URL for web development
- Use http://localhost:8081 instead
- Or run `bun web` for proper web setup

#### Reanimated Errors
- These are expected on web
- Animations will be disabled automatically
- Errors are suppressed in console

#### Auth Errors
- "Invalid email or password" is shown in UI
- Console errors are suppressed to avoid duplication

### Best Practices

1. **Mobile Testing**: Use `bun start:tunnel` with Expo Go
2. **Web Development**: Use `bun web` for localhost
3. **Web Sharing**: Use `bun web:tunnel` for shareable URL
4. **Clear Cache**: Add `--clear` flag if issues persist

### Quick Reference

```bash
# Mobile development with tunnel
bun start:tunnel
# Press 's' for Expo Go mode
# Use exp:// URL in Expo Go app

# Web development (local)
bun web
# Opens http://localhost:8081

# Web development (shareable)
bun web:tunnel
# Opens https://[id].exp.direct

# Clear cache if needed
bun start:tunnel --clear
```