const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Resolve "browser" field in package.json for libraries like jose
// that ship Node.js and browser builds separately
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'browser',
  'require',
  'import',
];

module.exports = withNativeWind(config, { input: './global.css' });
