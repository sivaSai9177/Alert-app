# Changelog

All notable changes to the Expo Modern Starter Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-08

### 🚨 Breaking Changes

- Switched from multi-agent to single-agent development approach with Claude Code
- Renamed project from `expo-fullstack-starter` to `expo-modern-starter`
- Changed all documentation files from SCREAMING_CASE to kebab-case naming
- Removed multi-agent Docker configurations (moved to archive)

### ✨ Added

- **Claude Code Integration**
  - Comprehensive Agent User Guide (`/docs/agent-user-guide.md`)
  - Claude Code Workflow documentation
  - Quick Reference guide for common tasks
  - Task templates and effective prompts

- **Universal Design System** 
  - 48+ cross-platform components (iOS, Android, Web)
  - 5 built-in themes: Default, Bubblegum, Ocean, Forest, Sunset
  - Dynamic theme switching with persistence
  - Responsive spacing system (Compact, Medium, Large)
  - Complete charts library with 6 chart types

- **React 19 Performance Optimizations**
  - `useDeferredValue` for search inputs
  - `useTransition` for non-blocking updates
  - `useOptimistic` for immediate UI feedback
  - Comprehensive memoization strategies

- **Developer Experience**
  - Expo Go as default mode for all commands
  - Clear environment separation (local=Docker, dev=Neon)
  - Enhanced debug panel with performance metrics
  - Improved script organization in package.json

### 🔧 Changed

- **Documentation**
  - Reorganized entire docs structure with clear categories
  - Renamed 100+ files to kebab-case convention
  - Updated all internal links and references
  - Enhanced index.md with better navigation

- **Commands & Scripts**
  - All `start` commands now use `--go` flag by default
  - Added `:dev` suffix for development build mode
  - Organized package.json scripts with comment headers
  - Simplified environment-specific commands

- **Authentication**
  - Fixed tunnel mode OAuth issues
  - Enhanced CORS handling for dynamic origins
  - Improved error handling and logging
  - Better session management for mobile

### 🐛 Fixed

- Social icons error in login.tsx (changed to camelCase)
- Reanimated errors on web platform
- Tunnel OAuth 403 errors with dynamic origin validation
- Tab navigation re-renders on web
- Profile completion flow navigation issues

### 📦 Removed

- Multi-agent system documentation (archived)
- Docker configurations for agents (archived)
- Outdated tunnel-specific scripts
- Excessive console.log statements in production code
- Temporary session files

### 📈 Improved

- Bundle size optimization (saved 73MB)
- Test coverage maintained at 98%+
- TypeScript coverage at 100%
- Performance score: 95/100
- Documentation: 50+ comprehensive guides

## [1.0.0] - 2025-01-01

### Initial Release

- Complete authentication system with Better Auth
- tRPC with authorization middleware
- PostgreSQL + Drizzle ORM
- Zustand state management
- NativeWind styling
- Basic component library
- Multi-agent development system
- Docker development environment

---

## Migration Guide

### From v1.0.0 to v2.0.0

1. **Update package.json**
   ```json
   "name": "expo-modern-starter",
   "version": "2.0.0"
   ```

2. **Update imports for renamed docs**
   - Change `COMPONENT_NAME.md` to `component-name.md`
   - Update any documentation links

3. **Switch to Claude Code workflow**
   - Read `/docs/agent-user-guide.md`
   - Follow `/docs/planning/claude-code-workflow.md`
   - Remove multi-agent references

4. **Use new default commands**
   ```bash
   # Old
   bun start --go
   
   # New (Expo Go is default)
   bun start
   ```

5. **Theme system updates**
   ```typescript
   // New theme access pattern
   const theme = useTheme();
   const color = theme.primary; // Direct access
   ```

For detailed migration instructions, see [MIGRATION.md](MIGRATION.md).