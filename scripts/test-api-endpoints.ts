#!/usr/bin/env tsx

/**
 * Test API endpoints to verify connectivity
 * This helps debug connection issues in different environments
 */

import { getEnvironmentConfig, logEnvironment } from '../lib/core/env-config';
import { resolveApiUrl, checkApiHealth, resetApiResolver } from '../lib/core/api-resolver';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Test a single endpoint
async function testEndpoint(url: string, name: string): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    console.log(`\nTesting ${name}: ${colors.cyan}${url}${colors.reset}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${url}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.text();
      console.log(`${colors.green}✅ SUCCESS${colors.reset} (${responseTime}ms)`);
      
      // Try to parse as JSON and show details
      try {
        const json = JSON.parse(data);
        console.log(`   Status: ${json.status || 'ok'}`);
        if (json.timestamp) console.log(`   Timestamp: ${new Date(json.timestamp).toLocaleString()}`);
        if (json.environment) console.log(`   Environment: ${json.environment}`);
      } catch {
        console.log(`   Response: ${data.substring(0, 100)}`);
      }
      
      return true;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset} - HTTP ${response.status} (${responseTime}ms)`);
      return false;
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.log(`${colors.red}❌ ERROR${colors.reset} (${responseTime}ms)`);
    
    if (error.name === 'AbortError') {
      console.log('   Timeout after 5 seconds');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Connection refused - is the server running?');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   Host not found - check the URL');
    } else {
      console.log(`   ${error.message}`);
    }
    
    return false;
  }
}

// Test all configured endpoints
async function testAllEndpoints() {
  console.log(`${colors.bright}🔍 Testing API Endpoints${colors.reset}`);
  console.log('=' .repeat(50));
  
  // Get environment configuration
  const config = await getEnvironmentConfig();
  console.log(`\nEnvironment: ${colors.yellow}${config.name}${colors.reset}`);
  console.log(`Fallback Enabled: ${config.api.fallbackEnabled ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
  
  // Test each configured endpoint
  const results: Record<string, boolean> = {};
  
  for (const endpoint of config.api.endpoints) {
    const success = await testEndpoint(endpoint.url, `${endpoint.type} (priority ${endpoint.priority})`);
    results[endpoint.url] = success;
  }
  
  // Test the resolved endpoint
  console.log(`\n${colors.bright}Testing Resolved Endpoint${colors.reset}`);
  console.log('-' .repeat(50));
  
  try {
    const resolvedUrl = await resolveApiUrl({ forceRefresh: true });
    console.log(`\nResolved to: ${colors.cyan}${resolvedUrl}${colors.reset}`);
    
    const healthCheck = await checkApiHealth();
    console.log(`Health Check: ${healthCheck ? colors.green + '✅ Healthy' : colors.red + '❌ Unhealthy'}${colors.reset}`);
  } catch (error: any) {
    console.log(`${colors.red}Failed to resolve API URL: ${error.message}${colors.reset}`);
  }
  
  // Summary
  console.log(`\n${colors.bright}Summary${colors.reset}`);
  console.log('=' .repeat(50));
  
  const successCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`Tested: ${totalCount} endpoints`);
  console.log(`Success: ${colors.green}${successCount}${colors.reset}`);
  console.log(`Failed: ${colors.red}${totalCount - successCount}${colors.reset}`);
  
  if (successCount === 0) {
    console.log(`\n${colors.yellow}⚠️  No working endpoints found!${colors.reset}`);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure the API server is running (bun run dev)');
    console.log('2. Check your network connection');
    console.log('3. Verify firewall settings');
    console.log('4. Try using ngrok for a stable URL');
  } else if (successCount < totalCount) {
    console.log(`\n${colors.yellow}⚠️  Some endpoints are not accessible${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✅ All endpoints are working!${colors.reset}`);
  }
}

// Additional network diagnostics
async function runDiagnostics() {
  if (process.argv.includes('--diagnostics')) {
    console.log(`\n${colors.bright}Network Diagnostics${colors.reset}`);
    console.log('=' .repeat(50));
    
    // Show environment details
    await logEnvironment();
    
    // Platform-specific checks
    if (process.platform === 'darwin' || process.platform === 'linux') {
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);
      
      try {
        // Check if API port is listening
        const { stdout } = await execPromise('lsof -i :8081 | grep LISTEN || echo "Port 8081 not in use"');
        console.log('\nPort 8081 status:');
        console.log(stdout.trim());
      } catch (error) {
        console.log('Could not check port status');
      }
    }
  }
}

// Main execution
async function main() {
  try {
    // Clear any cached endpoints for fresh test
    if (process.argv.includes('--fresh')) {
      console.log('Clearing cached endpoints...\n');
      await resetApiResolver();
    }
    
    await testAllEndpoints();
    await runDiagnostics();
    
    console.log('\n');
  } catch (error: any) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Show help
if (process.argv.includes('--help')) {
  console.log('Usage: tsx test-api-endpoints.ts [options]');
  console.log('\nOptions:');
  console.log('  --fresh        Clear cached endpoints before testing');
  console.log('  --diagnostics  Run additional network diagnostics');
  console.log('  --help         Show this help message');
  process.exit(0);
}

// Run the script
main();