#!/usr/bin/env node

/**
 * Automatically detect and update local IP address in environment files
 * This is useful when your local IP changes (e.g., different networks)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          name: name,
          address: iface.address,
          netmask: iface.netmask
        });
      }
    }
  }
  
  // Prefer common interface names
  const preferred = ['en0', 'eth0', 'wlan0', 'Wi-Fi'];
  for (const pref of preferred) {
    const found = addresses.find(a => a.name.toLowerCase().includes(pref.toLowerCase()));
    if (found) return found.address;
  }
  
  // Return first available
  return addresses.length > 0 ? addresses[0].address : 'localhost';
}

// Update IP in file content
function updateIPInContent(content, newIP) {
  // Pattern to match IP addresses in API URLs
  const patterns = [
    // Match http://IP:PORT patterns
    /(EXPO_PUBLIC_API_URL(?:_LOCAL)?=http:\/\/)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)/g,
    // Match standalone IP addresses in API context
    /(API.*=.*?)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g,
  ];
  
  let updated = content;
  let changeCount = 0;
  
  for (const pattern of patterns) {
    updated = updated.replace(pattern, (match, prefix, oldIP, suffix = '') => {
      if (oldIP !== newIP && oldIP !== 'localhost' && oldIP !== '127.0.0.1') {
        changeCount++;
// TODO: Replace with structured logging - console.log(`  Updating: ${oldIP} → ${newIP}`);
        return prefix + newIP + suffix;
      }
      return match;
    });
  }
  
  // Also update localhost references if requested
  if (process.argv.includes('--replace-localhost')) {
    updated = updated.replace(
      /(EXPO_PUBLIC_API_URL(?:_LOCAL)?=http:\/\/)(localhost|127\.0\.0\.1)(:\d+)/g,
      (match, prefix, host, port) => {
        changeCount++;
// TODO: Replace with structured logging - console.log(`  Updating: ${host} → ${newIP}`);
        return prefix + newIP + port;
      }
    );
  }
  
  return { content: updated, changes: changeCount };
}

// Update a single file
function updateFile(filePath, newIP) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
// TODO: Replace with structured logging - console.log(`\nChecking ${path.basename(filePath)}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const { content: updated, changes } = updateIPInContent(content, newIP);
  
  if (changes > 0) {
    fs.writeFileSync(filePath, updated);
// TODO: Replace with structured logging - console.log(`  ✓ Updated ${changes} IP reference(s)`);
    return true;
  } else {
// TODO: Replace with structured logging - console.log('  No changes needed');
    return false;
  }
}

// Main function
function main() {
  const localIP = getLocalIP();
// TODO: Replace with structured logging - console.log(`Local IP Address: ${localIP}`);
  
  if (localIP === 'localhost') {
// TODO: Replace with structured logging - console.log('\nWarning: Could not detect a network IP address');
// TODO: Replace with structured logging - console.log('Make sure you are connected to a network');
    return;
  }
  
  // Files to update
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.preview',
    '.env.ngrok',
  ];
  
  const rootDir = path.join(__dirname, '..');
  let updatedCount = 0;
  
  // Update environment files
  for (const file of envFiles) {
    const filePath = path.join(rootDir, file);
    if (updateFile(filePath, localIP)) {
      updatedCount++;
    }
  }
  
  // Also check for IP in other config files if requested
  if (process.argv.includes('--all')) {
    const configFiles = [
      'app.json',
      'eas.json',
    ];
    
    for (const file of configFiles) {
      const filePath = path.join(rootDir, file);
      if (updateFile(filePath, localIP)) {
        updatedCount++;
      }
    }
  }
  
  // Summary
// TODO: Replace with structured logging - console.log(`\n✅ Updated ${updatedCount} file(s) with IP: ${localIP}`);
  
  // Additional instructions
  if (updatedCount > 0) {
// TODO: Replace with structured logging - console.log('\nNext steps:');
// TODO: Replace with structured logging - console.log('1. Restart your Expo development server');
// TODO: Replace with structured logging - console.log('2. Clear the app cache on your device');
// TODO: Replace with structured logging - console.log('3. Reload the app');
    
    if (process.platform === 'darwin') {
// TODO: Replace with structured logging - console.log(`\nYour IP on this network: ${localIP}`);
// TODO: Replace with structured logging - console.log('Make sure your device is on the same network!');
    }
  }
}

// Show help
if (process.argv.includes('--help')) {
// TODO: Replace with structured logging - console.log('Usage: node update-ip-address.js [options]');
// TODO: Replace with structured logging - console.log('\nOptions:');
// TODO: Replace with structured logging - console.log('  --replace-localhost  Also replace localhost/127.0.0.1 with network IP');
// TODO: Replace with structured logging - console.log('  --all               Check all config files, not just .env files');
// TODO: Replace with structured logging - console.log('  --help              Show this help message');
  process.exit(0);
}

// Run the script
main();