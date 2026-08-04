const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.maxWorkers = 1;

// react-native-maps has no web implementation and imports native-only RN internals,
// which crashes the web bundle outright. Expo Router's file-based route registry
// eagerly bundles every route file (including coverage-map.tsx, which the .web.tsx
// override doesn't stop Metro from also including) regardless of platform, so the
// package itself is redirected to an empty stub specifically for web builds.
const { resolveRequest: defaultResolveRequest } = config.resolver;
config.resolver.resolveRequest = (context, moduleName, platform, ...rest) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'utils/emptyReactNativeMaps.web.js'),
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform, ...rest);
  }
  return context.resolveRequest(context, moduleName, platform, ...rest);
};

// Block test/docs/example folders inside node_modules — Metro would otherwise
// parse them even though they're never imported, wasting RAM on first start.
config.resolver.blockList = [
  /node_modules\/.*\/__tests__\/.*/,
  /node_modules\/.*\/__mocks__\/.*/,
  /node_modules\/.*\/__(fixtures|snapshots)__\/.*/,
  /node_modules\/.*\/tests?\/.*/,
  /node_modules\/.*\/docs?\/.*/,
  /node_modules\/.*\/examples?\/.*/,
  /node_modules\/.*\/website\/.*/,
  /node_modules\/.*\/flow-typed\/.*/,
  /node_modules\/.*\/jest\/.*/,
];

module.exports = config;
