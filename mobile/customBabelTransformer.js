'use strict';

/**
 * Custom Metro babel transformer that forces all nested hermes-parser@0.25.1
 * instances to use hermes-parser@0.34.0 from root node_modules.
 *
 * React Native 0.81.4 source files use newer Hermes/Flow syntax (const type
 * params, component declarations) that 0.25.1 cannot parse. The fix
 * pre-populates Node's require.cache at each nested package's resolved path
 * so their lazy require('hermes-parser') calls return 0.34.0.
 */

const path = require('path');
const root = path.resolve(__dirname, '..', 'node_modules');

// Load hermes-parser 0.34.0 from root
const hermesParser034 = require(path.join(root, 'hermes-parser'));

// All nested hermes-parser@0.25.1 main-file paths (resolved by npm from lockfile)
const nestedMainFiles = [
  path.join(root, 'babel-preset-expo/node_modules/hermes-parser/dist/index.js'),
  path.join(root, '@react-native/babel-preset/node_modules/hermes-parser/dist/index.js'),
  path.join(root, 'metro-babel-transformer/node_modules/hermes-parser/dist/index.js'),
];

// Pre-populate require.cache so any lazy require('hermes-parser') inside these
// packages returns 0.34.0 instead of their bundled 0.25.1
for (const filePath of nestedMainFiles) {
  require.cache[filePath] = {
    id: filePath,
    filename: filePath,
    loaded: true,
    exports: hermesParser034,
    parent: module,
    children: [],
    paths: [],
  };
}

// Re-export Expo's real babel transformer unchanged
module.exports = require('@expo/metro-config/build/babel-transformer');
