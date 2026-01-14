# 📦 Installation Guide

## Prerequisites

- Node.js 18+ or Bun
- iOS Simulator (Mac only) or Android Studio
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/my-expo.git
cd my-expo
```

### 2. Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL=your_postgres_url

# Auth
BETTER_AUTH_SECRET=your_secret_key

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Database Setup
```bash
# Push schema to database
bun run db:push

# Optional: Open Drizzle Studio
bun run db:studio
```

### 5. Start Development
```bash
# Web
bun run web

# iOS
bun run ios

# Android
bun run android
```

## Platform-Specific Setup

### iOS Development
1. Install Xcode from App Store
2. Install iOS Simulator
3. Run `bun run ios`

### Android Development
1. Install Android Studio
2. Create AVD (Android Virtual Device)
3. Run `bun run android`

### Web Development
No additional setup required. Run `bun run web`.

## Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
# Clear cache
npx expo start --clear
```

**iOS build failures:**
```bash
# Reset pods
cd ios && pod install
```

**Android build failures:**
```bash
# Clean build
cd android && ./gradlew clean
```

## Next Steps

- [Environment Configuration](./environment-setup.md)
- [Quick Start Guide](./quick-start.md)
- [Project Structure](../architecture/project-structure.md)