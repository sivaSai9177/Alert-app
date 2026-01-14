#!/usr/bin/env bun
/**
 * iOS Expo Go Connectivity Diagnostic Tool
 * Helps diagnose and fix connectivity issues with physical iOS devices
 */

import { networkInterfaces } from 'os';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

console.log('🔍 iOS Expo Go Connectivity Diagnostic Tool\n');

// Get local network IP addresses
function getLocalIPs() {
  const nets = networkInterfaces();
  const ips: string[] = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
        console.log(`📡 Found network interface: ${name} - ${net.address}`);
      }
    }
  }
  
  return ips;
}

// Check if Expo is running
async function checkExpoServer(ip: string, port: number = 8081) {
  try {
    const response = await fetch(`http://${ip}:${port}/`);
    if (response.ok) {
      console.log(`✅ Expo server is accessible at http://${ip}:${port}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Cannot reach Expo server at http://${ip}:${port}`);
  }
  return false;
}

// Check API endpoints
async function checkAPIEndpoints(baseUrl: string) {
  const endpoints = [
    '/api/health',
    '/api/auth/get-session',
    '/api/trpc/auth.getSession'
  ];
  
  console.log(`\n🔍 Checking API endpoints at ${baseUrl}:`);
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`  ${endpoint}: ${response.ok ? '✅' : '❌'} (${response.status})`);
    } catch (error) {
      console.log(`  ${endpoint}: ❌ (unreachable)`);
    }
  }
}

// Main diagnostic function
async function diagnose() {
  console.log('1️⃣  Detecting network configuration...\n');
  const ips = getLocalIPs();
  
  if (ips.length === 0) {
    console.error('❌ No network interfaces found! Check your network connection.');
    return;
  }
  
  const primaryIP = ips.find(ip => ip.startsWith('192.168.') || ip.startsWith('10.')) || ips[0];
  console.log(`\n🌟 Primary IP address: ${primaryIP}`);
  
  console.log('\n2️⃣  Checking Expo server accessibility...\n');
  
  // Check localhost
  await checkExpoServer('localhost');
  
  // Check primary IP
  if (primaryIP !== 'localhost') {
    await checkExpoServer(primaryIP);
  }
  
  console.log('\n3️⃣  Checking API routes...');
  await checkAPIEndpoints(`http://${primaryIP}:8081`);
  
  console.log('\n4️⃣  iOS Device Connection Instructions:\n');
  console.log('To connect your iOS device to this Expo development server:\n');
  console.log(`1. Make sure your iPhone is on the same WiFi network as this computer`);
  console.log(`2. Open Expo Go app on your iPhone`);
  console.log(`3. Tap "Enter URL manually"`);
  console.log(`4. Enter: exp://${primaryIP}:8081\n`);
  
  console.log('Alternative URLs to try:');
  for (const ip of ips) {
    console.log(`   exp://${ip}:8081`);
  }
  
  console.log('\n5️⃣  Environment Variables for Better Connectivity:\n');
  console.log('Add these to your .env.local file:');
  console.log(`EXPO_PUBLIC_API_URL=http://${primaryIP}:8081`);
  console.log(`REACT_NATIVE_PACKAGER_HOSTNAME=${primaryIP}`);
  
  console.log('\n6️⃣  Start Command for iOS Physical Device:\n');
  console.log(`REACT_NATIVE_PACKAGER_HOSTNAME=${primaryIP} npx expo start --host ${primaryIP} --lan`);
  
  console.log('\n✨ For automatic setup, run: bun run ios:device');
}

// Run diagnostics
diagnose().catch(console.error);