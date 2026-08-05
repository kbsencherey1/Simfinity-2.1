const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.maxWorkers = 1;

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
