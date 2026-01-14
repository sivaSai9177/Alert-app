const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Ensure projectRoot is set
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

// Add web-specific optimizations
if (process.env.PLATFORM === 'web') {
  config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
}

// Override server settings for web
// Removed host setting as it's not a valid option

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Enable minification
  config.transformer.minifierConfig = {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
    compress: {
      drop_console: true,
      reduce_funcs: false,
    },
  };
  
  // Optimize bundle
  config.transformer.optimizationSizeLimit = 250000; // 250KB
}

module.exports = withNativeWind(config, { input: './app/global.css' });