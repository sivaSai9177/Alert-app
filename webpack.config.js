const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Customize the config before returning it.
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  
  // Mock react-native-reanimated for web
  config.resolve.alias['react-native-reanimated'] = require.resolve('./lib/core/reanimated-mock.js');
  
  return config;
};