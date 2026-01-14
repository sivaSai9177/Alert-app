# 🚀 Quick Start Guide

Get your app running in 5 minutes!

## 1. Install and Setup

```bash
# Clone and install
git clone https://github.com/yourusername/my-expo.git
cd my-expo
bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Setup database
bun run db:push
```

## 2. Start Development

### Web Development
```bash
bun run web
# Open http://localhost:8081
```

### Mobile Development
```bash
# iOS (Mac only)
bun run ios

# Android
bun run android
```

## 3. Default Credentials

For development, you can use:
- Email: `test@example.com`
- Password: `password123`

Or create a new account via the signup flow.

## 4. Key Features to Try

### Authentication
1. **Sign Up**: Create a new account
2. **Login**: Use email/password or Google OAuth
3. **Profile**: Complete your profile (3-step wizard)
4. **Logout**: Test session management

### Universal Design System
- Toggle dark/light mode in Settings
- Try different spacing densities
- Test responsive layouts

### Role-Based Access
- Admin: Full access to all features
- Manager: Limited admin capabilities
- User: Standard features
- Guest: Read-only access

## 5. Development Workflow

### Making Changes
1. Edit components in `components/universal/`
2. Modify screens in `app/`
3. Add API endpoints in `src/server/routers/`

### Hot Reload
- Save any file to see changes instantly
- No need to restart the dev server

### Type Safety
- TypeScript will catch errors
- tRPC provides end-to-end type safety

## 6. Common Commands

```bash
# Linting
bun run lint

# Type checking
bunx tsc --noEmit

# Run tests
bun run test

# Build for production
bun run build
```

## 7. Next Steps

### For Developers
- Read [Architecture Overview](../architecture/overview.md)
- Explore [Component Library](../design-system/components.md)
- Learn [tRPC Patterns](../features/api-integration.md)

### For Multi-Agent Development
- Review [Multi-Agent Workflow](../../MULTI_AGENT_WORKFLOW_SYSTEM.md)
- Create your first [PRD](../../projects/PRD_TEMPLATE.md)
- Start with `Manager, help me understand the codebase`

## Need Help?

- Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
- Review [FAQ](../troubleshooting/faq.md)
- Read [Documentation Index](../../INDEX.md)