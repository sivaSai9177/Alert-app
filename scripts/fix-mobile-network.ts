#!/usr/bin/env bun

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

async function getLocalIP(): Promise<string> {
  try {
    // Try to get WiFi IP first (en0 on macOS)
    const { stdout: wifiIP } = await execAsync('ipconfig getifaddr en0 2>/dev/null');
    if (wifiIP.trim()) return wifiIP.trim();
    
    // Fallback to parsing ifconfig
    const { stdout } = await execAsync('ifconfig en0 | grep "inet " | awk \'{print $2}\'');
    return stdout.trim() || '127.0.0.1';
  } catch (error) {
    console.error('Failed to get local IP:', error);
    return '127.0.0.1';
  }
}

async function getCurrentExpoHost(): Promise<string | null> {
  try {
    // Check if Expo is running
    const { stdout } = await execAsync('lsof -i :8081 | grep LISTEN | head -1');
    if (!stdout) {
      console.warn('⚠️  Expo doesn\'t seem to be running on port 8081');
      return null;
    }
    
    // Try to get Expo's reported host
    const { stdout: expoInfo } = await execAsync('curl -s http://localhost:8081/');
    if (expoInfo.includes('Expo')) {
      console.log('✅ Expo is running on port 8081');
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function updateEnvFile(ip: string) {
  const envPath = join(process.cwd(), '.env');
  const envLocalPath = join(process.cwd(), '.env.local');
  
  // Update .env file
  try {
    let envContent = readFileSync(envPath, 'utf-8');
    const oldUrlMatch = envContent.match(/EXPO_PUBLIC_API_URL=(.+)/);
    
    if (oldUrlMatch) {
      const oldUrl = oldUrlMatch[1];
      const newUrl = `http://${ip}:8081`;
      
      if (oldUrl !== newUrl) {
        envContent = envContent.replace(
          /EXPO_PUBLIC_API_URL=.+/,
          `EXPO_PUBLIC_API_URL=${newUrl}`
        );
        writeFileSync(envPath, envContent);
        console.log(`✅ Updated .env: ${oldUrl} → ${newUrl}`);
      } else {
        console.log(`✅ .env already has correct IP: ${newUrl}`);
      }
    }
  } catch (error) {
    console.error('Failed to update .env:', error);
  }
  
  // Check if .env.local exists and update it too
  try {
    if (readFileSync(envLocalPath, 'utf-8')) {
      let envContent = readFileSync(envLocalPath, 'utf-8');
      const oldUrlMatch = envContent.match(/EXPO_PUBLIC_API_URL=(.+)/);
      
      if (oldUrlMatch) {
        const oldUrl = oldUrlMatch[1];
        const newUrl = `http://${ip}:8081`;
        
        if (oldUrl !== newUrl) {
          envContent = envContent.replace(
            /EXPO_PUBLIC_API_URL=.+/,
            `EXPO_PUBLIC_API_URL=${newUrl}`
          );
          writeFileSync(envLocalPath, envContent);
          console.log(`✅ Updated .env.local: ${oldUrl} → ${newUrl}`);
        }
      }
    }
  } catch (error) {
    // .env.local might not exist, that's ok
  }
}

async function testAPIConnection(ip: string) {
  console.log(`\n🧪 Testing API connection to http://${ip}:8081...`);
  
  try {
    const { stdout, stderr } = await execAsync(
      `curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://${ip}:8081/api/trpc/auth.getSession?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`
    );
    
    if (stdout === '200') {
      console.log('✅ API is accessible!');
      return true;
    } else {
      console.error(`❌ API returned status: ${stdout}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 iOS Simulator Network Fix\n');
  
  // Get local IP
  const localIP = await getLocalIP();
  console.log(`📍 Your local IP: ${localIP}`);
  
  // Check if Expo is running
  await getCurrentExpoHost();
  
  // Update environment files
  await updateEnvFile(localIP);
  
  // Test API connection
  const isWorking = await testAPIConnection(localIP);
  
  if (isWorking) {
    console.log('\n✅ Everything looks good!');
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your Expo development server: bun run ios');
    console.log('2. If using iOS Simulator, you may need to:');
    console.log('   - Reset the simulator: Device → Erase All Content and Settings');
    console.log('   - Or just reload the app: Cmd+R in the simulator');
  } else {
    console.log('\n⚠️  API connection failed. Please check:');
    console.log('1. Is Expo running? (bun run ios)');
    console.log('2. Is your firewall blocking port 8081?');
    console.log('3. Are you on the same network?');
    console.log('\n💡 Try running: bun run ios --clear');
  }
  
  // Show dynamic configuration info
  console.log('\n📝 Note: The app tries to detect the API URL in this order:');
  console.log('1. EXPO_PUBLIC_API_URL environment variable');
  console.log('2. Dynamic detection from Expo\'s hostUri');
  console.log('3. Fallback to localhost:8081');
  console.log('\nThe dynamic detection should work, but setting EXPO_PUBLIC_API_URL is more reliable.');
}

main().catch(console.error);