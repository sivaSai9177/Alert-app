#!/usr/bin/env tsx

/**
 * Comprehensive Health Check Script
 * Tests authentication system components and generates a health report
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface HealthCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const checks: HealthCheck[] = [];

function addCheck(name: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  checks.push({ name, status, message, details });
}

async function runHealthChecks() {
// TODO: Replace with structured logging - console.log('🏥 Running Authentication App Health Check');
// TODO: Replace with structured logging - console.log('==========================================\n');

  // 1. Check project structure
// TODO: Replace with structured logging - console.log('📁 Checking Project Structure...');
  const requiredFiles = [
    'package.json',
    'app.json',
    'lib/auth/auth.ts',
    'lib/stores/auth-store.ts',
    'src/server/trpc.ts',
    'src/server/routers/auth.ts',
    'components/GoogleSignInButton.tsx',
    'app/(auth)/login.tsx',
    'app/(home)/index.tsx'
  ];

  requiredFiles.forEach(file => {
    if (existsSync(join(process.cwd(), file))) {
      addCheck(`File: ${file}`, 'PASS', 'Required file exists');
    } else {
      addCheck(`File: ${file}`, 'FAIL', 'Required file missing');
    }
  });

  // 2. Check package.json for required dependencies
// TODO: Replace with structured logging - console.log('📦 Checking Dependencies...');
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const requiredDeps = [
      'better-auth',
      '@better-auth/expo', 
      '@trpc/server',
      '@trpc/client',
      '@tanstack/react-query',
      'zustand',
      'zod',
      'drizzle-orm',
      'expo',
      'react-native'
    ];

    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    requiredDeps.forEach(dep => {
      if (allDeps[dep]) {
        addCheck(`Dependency: ${dep}`, 'PASS', `Version: ${allDeps[dep]}`);
      } else {
        addCheck(`Dependency: ${dep}`, 'FAIL', 'Required dependency missing');
      }
    });

  } catch (error) {
    addCheck('Package.json', 'FAIL', 'Could not read package.json', error);
  }

  // 3. Check environment configuration
// TODO: Replace with structured logging - console.log('🔧 Checking Environment Configuration...');
  const envVars = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  envVars.forEach(envVar => {
    if (process.env[envVar]) {
      addCheck(`Environment: ${envVar}`, 'PASS', 'Environment variable set');
    } else {
      addCheck(`Environment: ${envVar}`, 'WARN', 'Environment variable not set');
    }
  });

  // 4. Check configuration files
// TODO: Replace with structured logging - console.log('⚙️  Checking Configuration Files...');
  const configFiles = [
    'tsconfig.json',
    'tailwind.config.ts', 
    'jest.config.js',
    'drizzle.config.ts',
    'eas.json'
  ];

  configFiles.forEach(file => {
    if (existsSync(file)) {
      addCheck(`Config: ${file}`, 'PASS', 'Configuration file exists');
    } else {
      addCheck(`Config: ${file}`, 'WARN', 'Configuration file missing');
    }
  });

  // 5. Check .gitignore for security
// TODO: Replace with structured logging - console.log('🔒 Checking Security Configuration...');
  try {
    const gitignore = readFileSync('.gitignore', 'utf-8');
    const securityPatterns = [
      '*.log',
      '.env',
      '.env.local',
      'ios/',
      'android/',
      'node_modules/',
      'credentials/'
    ];

    securityPatterns.forEach(pattern => {
      if (gitignore.includes(pattern)) {
        addCheck(`Security: ${pattern}`, 'PASS', 'Pattern found in .gitignore');
      } else {
        addCheck(`Security: ${pattern}`, 'FAIL', 'Security pattern missing from .gitignore');
      }
    });

  } catch (error) {
    addCheck('Security: .gitignore', 'FAIL', 'Could not read .gitignore file');
  }

  // Generate Report
// TODO: Replace with structured logging - console.log('\n📊 Health Check Results');
// TODO: Replace with structured logging - console.log('========================');

  const passCount = checks.filter(c => c.status === 'PASS').length;
  const failCount = checks.filter(c => c.status === 'FAIL').length;
  const warnCount = checks.filter(c => c.status === 'WARN').length;

// TODO: Replace with structured logging - console.log(`✅ PASS: ${passCount}`);
// TODO: Replace with structured logging - console.log(`❌ FAIL: ${failCount}`);
// TODO: Replace with structured logging - console.log(`⚠️  WARN: ${warnCount}`);
// TODO: Replace with structured logging - console.log(`📈 Total: ${checks.length}`);

  const healthScore = Math.round((passCount / checks.length) * 100);
// TODO: Replace with structured logging - console.log(`🏥 Health Score: ${healthScore}%`);

  if (healthScore >= 90) {
// TODO: Replace with structured logging - console.log('🎉 Excellent! Your app is in great health.');
  } else if (healthScore >= 75) {
// TODO: Replace with structured logging - console.log('👍 Good! Your app is mostly healthy with minor issues.');
  } else if (healthScore >= 60) {
// TODO: Replace with structured logging - console.log('⚠️  Fair! Your app has some issues that should be addressed.');
  } else {
// TODO: Replace with structured logging - console.log('🚨 Poor! Your app has significant issues that need immediate attention.');
  }

  // Show detailed results
// TODO: Replace with structured logging - console.log('\n📋 Detailed Results');
// TODO: Replace with structured logging - console.log('===================');
  
  checks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
// TODO: Replace with structured logging - console.log(`${icon} ${check.name}: ${check.message}`);
    if (check.details) {
// TODO: Replace with structured logging - console.log(`   Details: ${JSON.stringify(check.details, null, 2)}`);
    }
  });

// TODO: Replace with structured logging - console.log('\n🚀 Next Steps');
// TODO: Replace with structured logging - console.log('=============');
  
  const failures = checks.filter(c => c.status === 'FAIL');
  if (failures.length > 0) {
// TODO: Replace with structured logging - console.log('❌ Critical Issues to Fix:');
    failures.forEach(failure => {
// TODO: Replace with structured logging - console.log(`   - ${failure.name}: ${failure.message}`);
    });
  }

  const warnings = checks.filter(c => c.status === 'WARN');
  if (warnings.length > 0) {
// TODO: Replace with structured logging - console.log('\n⚠️  Warnings to Consider:');
    warnings.forEach(warning => {
// TODO: Replace with structured logging - console.log(`   - ${warning.name}: ${warning.message}`);
    });
  }

  if (failures.length === 0 && warnings.length === 0) {
// TODO: Replace with structured logging - console.log('🎉 No issues found! Your authentication app is ready for production.');
  }

// TODO: Replace with structured logging - console.log('\n📚 Additional Checks to Run:');
// TODO: Replace with structured logging - console.log('   - bun run test (Jest test suite)');
// TODO: Replace with structured logging - console.log('   - bun run lint (Code quality)');
// TODO: Replace with structured logging - console.log('   - bun run start (Manual testing)');

  return { healthScore, passCount, failCount, warnCount, checks };
}

// Run the health check
runHealthChecks().catch(console.error);