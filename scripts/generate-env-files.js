#!/usr/bin/env node

/**
 * Generate environment files for different scenarios
 * Usage: node generate-env-files.js [scenario]
 * Scenarios: local, ngrok, production, staging
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get command line argument
const scenario = process.argv[2] || 'local';

// Base configuration that's common to all scenarios
const baseConfig = {
  // Authentication
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'your-secret-key-here',
  
  // Google OAuth (copy from existing .env if available)
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  
  // Feature flags
  EXPO_PUBLIC_ENABLE_EMAIL_VERIFICATION: 'false',
  EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: 'true',
  EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH: 'false',
  
  // App configuration
  EXPO_PUBLIC_APP_SCHEME: 'my-expo',
  EXPO_PUBLIC_SESSION_TIMEOUT: '604800000', // 7 days
};

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Scenario configurations
const scenarios = {
  local: {
    EXPO_PUBLIC_ENVIRONMENT: 'local',
    EXPO_PUBLIC_DEBUG_MODE: 'true',
    EXPO_PUBLIC_API_FALLBACK_ENABLED: 'true',
    EXPO_PUBLIC_API_URL: '',
    EXPO_PUBLIC_API_URL_LOCAL: 'http://localhost:8081',
    EXPO_PUBLIC_API_URL_NGROK: '',
    EXPO_PUBLIC_API_URL_PRODUCTION: '',
    LOCAL_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/myexpo',
    PREVIEW_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/myexpo_preview',
    EXPO_PUBLIC_LOG_LEVEL: 'debug',
    EXPO_PUBLIC_ENABLE_DEVTOOLS: 'true',
  },
  
  ngrok: {
    EXPO_PUBLIC_ENVIRONMENT: 'local',
    EXPO_PUBLIC_DEBUG_MODE: 'true',
    EXPO_PUBLIC_API_FALLBACK_ENABLED: 'true',
    EXPO_PUBLIC_API_URL: '',
    EXPO_PUBLIC_API_URL_LOCAL: `http://${getLocalIP()}:8081`,
    EXPO_PUBLIC_API_URL_NGROK: 'https://your-subdomain.ngrok.io',
    EXPO_PUBLIC_API_URL_PRODUCTION: '',
    LOCAL_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/myexpo',
    PREVIEW_DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/myexpo_preview',
    EXPO_PUBLIC_LOG_LEVEL: 'debug',
    EXPO_PUBLIC_ENABLE_DEVTOOLS: 'true',
  },
  
  staging: {
    EXPO_PUBLIC_ENVIRONMENT: 'staging',
    EXPO_PUBLIC_DEBUG_MODE: 'false',
    EXPO_PUBLIC_API_FALLBACK_ENABLED: 'true',
    EXPO_PUBLIC_API_URL: '',
    EXPO_PUBLIC_API_URL_LOCAL: '',
    EXPO_PUBLIC_API_URL_NGROK: '',
    EXPO_PUBLIC_API_URL_PRODUCTION: 'https://staging-api.myexpo.com',
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '',
    NEON_DATABASE_POOL_URL: process.env.NEON_DATABASE_POOL_URL || '',
    EXPO_PUBLIC_LOG_LEVEL: 'info',
    EXPO_PUBLIC_ENABLE_DEVTOOLS: 'false',
  },
  
  production: {
    EXPO_PUBLIC_ENVIRONMENT: 'production',
    EXPO_PUBLIC_DEBUG_MODE: 'false',
    EXPO_PUBLIC_API_FALLBACK_ENABLED: 'false',
    EXPO_PUBLIC_API_URL: 'https://api.myexpo.com',
    EXPO_PUBLIC_API_URL_LOCAL: '',
    EXPO_PUBLIC_API_URL_NGROK: '',
    EXPO_PUBLIC_API_URL_PRODUCTION: 'https://api.myexpo.com',
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '',
    NEON_DATABASE_POOL_URL: process.env.NEON_DATABASE_POOL_URL || '',
    EXPO_PUBLIC_LOG_LEVEL: 'error',
    EXPO_PUBLIC_ENABLE_DEVTOOLS: 'false',
  },
};

// Generate .env content
function generateEnvContent(config) {
  const lines = [];
  
  // Add header
  lines.push('# Auto-generated environment file');
  lines.push(`# Generated for: ${scenario}`);
  lines.push(`# Generated at: ${new Date().toISOString()}`);
  lines.push('');
  
  // Group related variables
  const groups = {
    'ENVIRONMENT SETTINGS': ['EXPO_PUBLIC_ENVIRONMENT', 'EXPO_PUBLIC_DEBUG_MODE'],
    'API CONFIGURATION': [
      'EXPO_PUBLIC_API_URL',
      'EXPO_PUBLIC_API_URL_LOCAL',
      'EXPO_PUBLIC_API_URL_NGROK',
      'EXPO_PUBLIC_API_URL_PRODUCTION',
      'EXPO_PUBLIC_API_URL_STAGING',
      'EXPO_PUBLIC_API_FALLBACK_ENABLED'
    ],
    'DATABASE': ['LOCAL_DATABASE_URL', 'PREVIEW_DATABASE_URL', 'NEON_DATABASE_URL', 'NEON_DATABASE_POOL_URL'],
    'AUTHENTICATION': ['BETTER_AUTH_SECRET', 'EXPO_PUBLIC_SESSION_TIMEOUT'],
    'GOOGLE OAUTH': [
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
      'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
      'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'
    ],
    'FEATURE FLAGS': [
      'EXPO_PUBLIC_ENABLE_EMAIL_VERIFICATION',
      'EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS',
      'EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH'
    ],
    'DEVELOPMENT': ['EXPO_PUBLIC_LOG_LEVEL', 'EXPO_PUBLIC_ENABLE_DEVTOOLS'],
    'APP CONFIG': ['EXPO_PUBLIC_APP_SCHEME'],
  };
  
  // Write grouped variables
  for (const [groupName, keys] of Object.entries(groups)) {
    const groupVars = keys.filter(key => config[key] !== undefined);
    if (groupVars.length > 0) {
      lines.push(`# ${groupName}`);
      for (const key of groupVars) {
        lines.push(`${key}=${config[key]}`);
      }
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

// Main function
function main() {
  if (!scenarios[scenario]) {
    console.error(`Unknown scenario: ${scenario}`);
    console.log('Available scenarios: local, ngrok, staging, production');
    process.exit(1);
  }
  
  // Merge base config with scenario config
  const config = { ...baseConfig, ...scenarios[scenario] };
  
  // Read existing .env.local if it exists to preserve custom values
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('Reading existing .env.local to preserve custom values...');
    const existing = fs.readFileSync(envPath, 'utf8');
    const lines = existing.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        
        // Preserve OAuth credentials and secrets
        if (key && value && (
          key.includes('SECRET') ||
          key.includes('GOOGLE') ||
          key.includes('NEON_DATABASE')
        )) {
          config[key] = value;
        }
      }
    }
  }
  
  // Special handling for ngrok scenario
  if (scenario === 'ngrok') {
    console.log(`\nLocal IP detected: ${getLocalIP()}`);
    console.log('\nIMPORTANT: Update EXPO_PUBLIC_API_URL_NGROK with your actual ngrok URL');
    console.log('Run: ngrok http 8081');
    console.log('Then update the URL in .env.local\n');
  }
  
  // Generate content
  const content = generateEnvContent(config);
  
  // Write to file
  const outputPath = path.join(__dirname, '..', `.env.${scenario}`);
  fs.writeFileSync(outputPath, content);
  console.log(`Generated ${outputPath}`);
  
  // Also update .env.local if requested
  if (process.argv.includes('--update-local')) {
    fs.writeFileSync(envPath, content);
    console.log('Updated .env.local');
  }
}

// Run the script
main();