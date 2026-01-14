# 🚀 Expo Modern Starter Kit

A production-ready, full-stack starter template built with React Native, Expo, and modern technologies. The most comprehensive starter kit for building cross-platform apps with authentication, universal components, and enterprise features.

> **Version**: 2.0.0 | **Last Updated**: January 8, 2025

## ✨ What's New in v2.0

### 🤖 **Claude Code Integration**
- Single-agent development approach with Claude Code
- Comprehensive agent user guide and workflow documentation
- Optimized for AI-assisted development

### 🎨 **Universal Design System**
- 48+ cross-platform components working on iOS, Android, and Web
- 5 built-in themes (Default, Bubblegum, Ocean, Forest, Sunset)
- Complete charts library with 6 chart types
- Responsive spacing system (Compact, Medium, Large)

### ⚡ **Performance Optimizations**
- React 19 hooks throughout (useDeferredValue, useTransition, useOptimistic)
- Bundle size optimization (saved 73MB)
- Memoization strategies applied
- Platform-specific optimizations

### 📱 **Developer Experience**
- Expo Go as default mode (`bun start`)
- Clear environment separation (Docker for local, Neon for cloud)
- Comprehensive documentation with kebab-case naming
- Quick reference guide for common tasks

## 🎯 Key Features

### 🔐 **Complete Authentication System**
- ✅ Email/Password authentication with validation
- ✅ Google OAuth (iOS, Android, Web) 
- ✅ Role-based access control (Admin, Manager, User, Guest)
- ✅ Permission-based authorization with granular control
- ✅ Multi-session support and device management
- ✅ Profile completion flow with 3-step wizard
- ✅ Secure token storage (SecureStore for mobile, localStorage for web)
- ✅ Session persistence with auto-refresh

### 🏗️ **Modern Architecture**
- **Frontend**: React Native 0.79.3 + Expo SDK 53
- **State**: Zustand + TanStack Query
- **API**: tRPC with type-safe procedures
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth with OAuth support
- **Styling**: NativeWind (TailwindCSS)
- **Forms**: React Hook Form + Zod

### 🌐 **True Universal Components**
Not just "React Native + Web" but optimized for each platform:
- Platform-specific implementations where needed
- Consistent API across platforms
- Theme and dark mode support
- Accessibility built-in
- Performance optimized

### 🛡️ **Enterprise Ready**
- **TypeScript**: 100% type coverage
- **Testing**: 98%+ test coverage
- **Security**: Role-based auth, audit logging
- **Performance**: React 19 optimized
- **Monitoring**: Enhanced debug panel
- **Documentation**: 50+ comprehensive guides

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- iOS Simulator (Mac only) or Android Studio
- Docker (for local database)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd expo-modern-starter

# Install dependencies
bun install
# or npm install

# Copy environment file
cp .env.example .env.local
```

### Running the App

```bash
# Start in Expo Go mode (default)
bun start

# Platform specific
bun ios       # iOS Simulator
bun android   # Android Emulator  
bun web       # Web Browser

# With local database (Docker)
bun local

# With cloud database (Neon)
bun dev
```

### Database Setup

```bash
# Start local database
bun db:local:up

# Run migrations
bun db:push

# Open Drizzle Studio
bun db:studio
```

## 📁 Project Structure

```
expo-modern-starter/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, register)
│   ├── (home)/            # Protected screens
│   └── api/               # API endpoints
├── components/            
│   ├── universal/         # 48+ cross-platform components
│   └── shadcn/           # UI primitives
├── lib/                   # Core utilities
│   ├── auth/             # Authentication logic
│   ├── stores/           # Zustand stores
│   └── theme/            # Theme system
├── src/                   # Backend code
│   ├── db/               # Database schema
│   └── server/           # tRPC routers
└── docs/                  # Comprehensive documentation
```

## 🎨 Universal Components

The kit includes 48+ production-ready components:

### Layout
- Container, Box, Stack (VStack/HStack)
- Grid, ScrollContainer, Sidebar

### Forms
- Input, Select, Checkbox, Switch
- RadioGroup, Slider, DatePicker
- Form with validation

### Display
- Card, Badge, Avatar, Separator
- Alert, Toast, EmptyState
- Table, List, Timeline

### Navigation
- Tabs, Breadcrumb, NavigationMenu
- Drawer, Command, ContextMenu

### Feedback
- Button, Dialog, Popover
- Tooltip, Progress, Skeleton
- Loading states

### Charts
- LineChart, BarChart, AreaChart
- PieChart, RadarChart, RadialChart

## 🤖 Development with Claude Code

This starter kit is optimized for development with Claude Code. See the [Agent User Guide](docs/agent-user-guide.md) for:

- Common development tasks
- Effective prompts
- Best practices
- Troubleshooting

### Quick Example

```typescript
// Ask Claude Code:
"Create a new dashboard screen with:
- Stats cards showing user metrics
- Line chart for activity over time
- Recent transactions table
- Using universal components"
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Type checking
bun type-check

# Linting
bun lint

# Test coverage
bun test:coverage
```

## 📦 Building for Production

```bash
# Preview build (iOS)
bun preview:ios

# Preview build (Android)
bun preview:android

# EAS Build setup
bun eas:setup
```

## 📚 Documentation

- [Complete Documentation](docs/index.md)
- [Agent User Guide](docs/agent-user-guide.md)
- [Quick Reference](docs/quick-reference.md)
- [API Documentation](docs/api/database-schema.md)
- [Component Library](docs/design-system/universal-component-library.md)

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# API
EXPO_PUBLIC_API_URL=http://localhost:8081
```

### Theming

```typescript
// 5 built-in themes
import { useTheme } from '@/lib/theme';

const theme = useTheme();
// Access: theme.primary, theme.background, etc.
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Follow the code style guide
4. Write tests for new features
5. Update documentation
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Expo and React Native
- UI components adapted from shadcn/ui
- Authentication powered by Better Auth
- Database ORM by Drizzle

---

**Ready to build your next app?** This starter kit provides everything you need for a production-ready application. Start with `bun start` and build something amazing! 🚀