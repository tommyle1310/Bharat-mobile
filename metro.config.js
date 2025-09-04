const path = require("path");  
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("jpg", "jpeg", "png", "webp");

config.watchFolders = [
  path.resolve(__dirname, "assets/data-files"), 
]


module.exports = mergeConfig(getDefaultConfig(__dirname), config);
