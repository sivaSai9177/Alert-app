#!/usr/bin/env bun
/**
 * Script to migrate package.json scripts to industry standards
 * Creates backup and provides migration mapping
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = join(process.cwd(), 'package.json');

console.log('📦 Migrating package.json scripts to industry standards...\n');

// Read current package.json
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const currentScripts = packageJson.scripts || {};

// Backup current scripts
const backupScripts = { ...currentScripts };

// Define standard script structure
const standardScripts = {
  // Primary development commands
  "dev": "npx expo start --go",
  "dev:local": "APP_ENV=local npx expo start --go",
  "dev:staging": "APP_ENV=staging npx expo start --go",
  "dev:tunnel": "npx expo start --tunnel --go",
  
  // Build commands
  "build": "eas build --platform all --profile production",
  "build:preview": "eas build --platform all --profile preview", 
  "build:ios": "eas build --platform ios --profile production",
  "build:android": "eas build --platform android --profile production",
  "build:web": "npx expo export --platform web",
  
  // Start commands (production mode)
  "start": "NODE_ENV=production npx expo start --go",
  "start:local": "NODE_ENV=production APP_ENV=local npx expo start --go",
  "start:staging": "NODE_ENV=production APP_ENV=staging npx expo start --go",
  "start:production": "NODE_ENV=production APP_ENV=production npx expo start --no-dev --minify",
  
  // Platform-specific
  "ios": "npx expo start --ios",
  "ios:device": "./scripts/start-expo-ios-device.sh",
  "ios:diagnose": "bun scripts/fix-ios-expo-go-connectivity.ts",
  "android": "npx expo start --android",
  "android:device": "npx expo start --android --host lan",
  "web": "npx expo start --web",
  
  // Testing
  "test": "jest",
  "test:unit": "jest __tests__/unit",
  "test:integration": "jest __tests__/integration",
  "test:e2e": "jest __tests__/e2e",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  
  // Code quality
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
  "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
  "typecheck": "tsc --noEmit",
  
  // Database
  "db:generate": "drizzle-kit generate:pg",
  "db:migrate": "bun scripts/db-migrate.ts",
  "db:push": "drizzle-kit push:pg",
  "db:studio": "drizzle-kit studio",
  "db:seed": "bun scripts/setup-demo-users.ts",
  "db:reset": "./scripts/db-reset.sh",
  "db:start": "docker-compose -f docker-compose.local.yml up -d postgres-local",
  "db:stop": "docker-compose -f docker-compose.local.yml down",
  
  // Healthcare specific
  "healthcare": "./scripts/start-with-healthcare.sh",
  "healthcare:setup": "bun scripts/setup-healthcare-local.ts",
  "healthcare:demo": "bun scripts/setup-healthcare-demo.ts",
  
  // Utilities
  "clean": "rm -rf .expo dist node_modules/.cache",
  "clean:cache": "npx expo start --clear",
  "clean:modules": "rm -rf node_modules && bun install",
  "prebuild": "npx expo prebuild --clean",
  
  // CI/CD
  "ci": "bun run lint && bun run typecheck && bun run test",
  "ci:lint": "bun run lint",
  "ci:test": "bun run test",
  "ci:build": "bun run build:preview",
  
  // Keep some existing custom scripts
  ...Object.keys(currentScripts).reduce((acc, key) => {
    // Preserve custom scripts that don't conflict
    if (key.startsWith('setup-') || key.startsWith('fix-') || key.startsWith('check-')) {
      acc[key] = currentScripts[key];
    }
    return acc;
  }, {} as Record<string, string>)
};

// Create aliases for backward compatibility
const aliases = {
  "local:healthcare": "bun run healthcare",
  "expo:go": "bun run dev",
  "expo:go:local": "bun run dev:local",
  "start:tunnel": "bun run dev:tunnel",
  "db:local:up": "bun run db:start",
  "db:local:down": "bun run db:stop"
};

// Merge all scripts
const finalScripts = {
  ...standardScripts,
  ...aliases,
  "_backup_scripts": backupScripts
};

// Update package.json
packageJson.scripts = finalScripts;

// Write updated package.json
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Scripts migrated successfully!\n');

// Print migration summary
console.log('📋 Migration Summary:\n');
console.log('Old Command → New Command');
console.log('-------------------------');
Object.entries(aliases).forEach(([old, newCmd]) => {
  console.log(`${old.padEnd(25)} → ${newCmd.replace('bun run ', '')}`);
});

console.log('\n💡 Tips:');
console.log('- Use "bun dev" for development (replaces "bun start")');
console.log('- Use "bun build" for production builds');
console.log('- Use "bun test" to run tests');
console.log('- Use "bun lint" for code quality checks');
console.log('- Original scripts backed up in "_backup_scripts"');

console.log('\n📚 See SCRIPTS_GUIDE_V2.md for complete documentation');