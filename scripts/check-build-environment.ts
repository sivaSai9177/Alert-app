#!/usr/bin/env bun

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

console.log(chalk.blue.bold('\n🔍 Checking Build Environment for OAuth and EAS\n'));

// Check function
function checkEnvVariable(envFile: string, variable: string, required: boolean = true): boolean {
  try {
    const content = readFileSync(envFile, 'utf-8');
    const hasVariable = content.includes(`${variable}=`) && !content.includes(`${variable}=your-`);
    
    if (hasVariable) {
      console.log(chalk.green(`✅ ${variable} is set in ${envFile}`));
      return true;
    } else if (required) {
      console.log(chalk.red(`❌ ${variable} is NOT set or has placeholder value in ${envFile}`));
      return false;
    } else {
      console.log(chalk.yellow(`⚠️  ${variable} is optional and not set in ${envFile}`));
      return true;
    }
  } catch (error) {
    if (required) {
      console.log(chalk.red(`❌ Error checking ${variable} in ${envFile}`));
    }
    return !required;
  }
}

// Check files
async function checkEnvironment() {
  let allChecksPass = true;
  
  // 1. Check main .env file
  console.log(chalk.cyan('\n📄 Checking .env file:'));
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    console.log(chalk.red('❌ .env file not found! Copy .env.example to .env'));
    allChecksPass = false;
  } else {
    // Required variables for OAuth
    allChecksPass = checkEnvVariable(envPath, 'DATABASE_URL') && allChecksPass;
    allChecksPass = checkEnvVariable(envPath, 'BETTER_AUTH_SECRET') && allChecksPass;
    allChecksPass = checkEnvVariable(envPath, 'BETTER_AUTH_BASE_URL') && allChecksPass;
    allChecksPass = checkEnvVariable(envPath, 'GOOGLE_CLIENT_ID') && allChecksPass;
    allChecksPass = checkEnvVariable(envPath, 'GOOGLE_CLIENT_SECRET') && allChecksPass;
    
    // Optional but recommended
    checkEnvVariable(envPath, 'LOCAL_IP', false);
    checkEnvVariable(envPath, 'EXPO_PUBLIC_API_URL', false);
    checkEnvVariable(envPath, 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID', false);
  }
  
  // 2. Check preview environment
  console.log(chalk.cyan('\n📄 Checking .env.preview file:'));
  const previewPath = join(process.cwd(), '.env.preview');
  if (!existsSync(previewPath)) {
    console.log(chalk.yellow('⚠️  .env.preview file not found - will use defaults from eas.json'));
  } else {
    checkEnvVariable(previewPath, 'EXPO_PUBLIC_API_URL', false);
    checkEnvVariable(previewPath, 'EXPO_PUBLIC_ENVIRONMENT', false);
  }
  
  // 3. Check eas.json
  console.log(chalk.cyan('\n📄 Checking eas.json:'));
  const easPath = join(process.cwd(), 'eas.json');
  if (!existsSync(easPath)) {
    console.log(chalk.red('❌ eas.json file not found!'));
    allChecksPass = false;
  } else {
    const easConfig = JSON.parse(readFileSync(easPath, 'utf-8'));
    
    // Check preview build config
    if (easConfig.build?.preview) {
      console.log(chalk.green('✅ Preview build configuration found'));
      
      // Check API URL
      const apiUrl = easConfig.build.preview.env?.EXPO_PUBLIC_API_URL;
      if (apiUrl && apiUrl !== 'http://localhost:8081') {
        console.log(chalk.yellow(`⚠️  Preview API URL is set to: ${apiUrl}`));
        console.log(chalk.yellow('   Make sure this is accessible from your test devices'));
      }
    } else {
      console.log(chalk.red('❌ Preview build configuration not found in eas.json'));
      allChecksPass = false;
    }
  }
  
  // 4. Check app.json
  console.log(chalk.cyan('\n📄 Checking app.json:'));
  const appPath = join(process.cwd(), 'app.json');
  if (!existsSync(appPath)) {
    console.log(chalk.red('❌ app.json file not found!'));
    allChecksPass = false;
  } else {
    const appConfig = JSON.parse(readFileSync(appPath, 'utf-8'));
    
    // Check OAuth scheme
    const scheme = appConfig.expo?.scheme;
    if (scheme) {
      console.log(chalk.green(`✅ App scheme configured: ${scheme}`));
    } else {
      console.log(chalk.red('❌ App scheme not configured in app.json'));
      allChecksPass = false;
    }
    
    // Check bundle identifiers
    const iosBundleId = appConfig.expo?.ios?.bundleIdentifier;
    const androidPackage = appConfig.expo?.android?.package;
    
    if (iosBundleId) {
      console.log(chalk.green(`✅ iOS bundle identifier: ${iosBundleId}`));
    } else {
      console.log(chalk.red('❌ iOS bundle identifier not set'));
      allChecksPass = false;
    }
    
    if (androidPackage) {
      console.log(chalk.green(`✅ Android package: ${androidPackage}`));
    } else {
      console.log(chalk.red('❌ Android package not set'));
      allChecksPass = false;
    }
    
    // Check EAS project ID
    const projectId = appConfig.expo?.extra?.eas?.projectId;
    if (projectId) {
      console.log(chalk.green(`✅ EAS project ID: ${projectId}`));
    } else {
      console.log(chalk.red('❌ EAS project ID not set'));
      allChecksPass = false;
    }
  }
  
  // 5. OAuth-specific checks
  console.log(chalk.cyan('\n🔐 OAuth Configuration:'));
  
  // Check if Google credentials are properly set
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    
    // Check for web client ID consistency
    const googleClientIdMatch = envContent.match(/GOOGLE_CLIENT_ID=(.+)/);
    const expoPublicGoogleMatch = envContent.match(/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=(.+)/);
    
    if (googleClientIdMatch && expoPublicGoogleMatch) {
      if (googleClientIdMatch[1] === expoPublicGoogleMatch[1]) {
        console.log(chalk.green('✅ Google Client IDs match'));
      } else {
        console.log(chalk.yellow('⚠️  GOOGLE_CLIENT_ID and EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID do not match'));
      }
    }
    
    // Check for localhost in Better Auth URL
    const betterAuthUrlMatch = envContent.match(/BETTER_AUTH_BASE_URL=(.+)/);
    if (betterAuthUrlMatch && betterAuthUrlMatch[1].includes('localhost')) {
      console.log(chalk.green('✅ Better Auth URL uses localhost (correct for OAuth)'));
    } else if (betterAuthUrlMatch && betterAuthUrlMatch[1].includes('192.168')) {
      console.log(chalk.yellow('⚠️  Better Auth URL uses private IP - OAuth might fail'));
      console.log(chalk.yellow('   Google OAuth doesn\'t accept private IPs. Use localhost instead.'));
    }
  }
  
  // Summary
  console.log(chalk.cyan('\n📊 Summary:'));
  if (allChecksPass) {
    console.log(chalk.green.bold('✅ All required checks passed! Ready for EAS build.'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('1. Run: bun run preview:build:ios');
    console.log('2. Run: bun run preview:build:android');
  } else {
    console.log(chalk.red.bold('❌ Some checks failed. Please fix the issues above before building.'));
    console.log(chalk.cyan('\nCommon fixes:'));
    console.log('1. Copy .env.example to .env and fill in your credentials');
    console.log('2. Get Google OAuth credentials from Google Console');
    console.log('3. Make sure BETTER_AUTH_BASE_URL uses localhost, not private IP');
    console.log('4. Run: eas whoami (to ensure you\'re logged in)');
  }
  
  // Additional warnings
  console.log(chalk.cyan('\n⚠️  Important Notes:'));
  console.log('- For OAuth to work, Better Auth URLs must use localhost, not private IPs');
  console.log('- The preview build will use the API URL from eas.json');
  console.log('- Make sure your backend is running when testing OAuth');
  console.log('- Google OAuth redirect URIs must be configured in Google Console');
  
  process.exit(allChecksPass ? 0 : 1);
}

// Run the check
checkEnvironment().catch(console.error);