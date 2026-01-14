const os = require('os');

// Get local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

module.exports = ({ config }) => {
  // Force Expo Go mode when EXPO_GO environment variable is set
  if (process.env.EXPO_GO === '1' || process.env.EXPO_USE_DEV_CLIENT === 'false') {
    // Remove dev client from build settings
    if (config.build) {
      delete config.build.development;
    }
    
    // Ensure scheme is set for Expo Go
    config.scheme = config.scheme || 'exp';
  }
  
  // Dynamic API URL configuration
  const localIp = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || getLocalIp();
  
  // Add extra configuration for runtime access
  config.extra = {
    ...config.extra,
    // Store the detected IP for runtime access
    detectedIp: localIp,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || `http://${localIp}:8081`,
    // Flag to indicate iOS physical device mode
    iosPhysicalDevice: process.env.IOS_PHYSICAL_DEVICE === 'true',
  };
  
  console.log('[Expo Config] Detected IP:', localIp);
  console.log('[Expo Config] API URL:', config.extra.apiUrl);
  
  return config;
};