const path = require('path');

// Monkey-patch nested hermes-parser@0.25.1 instances with 0.34.0 functions.
// RN 0.81.4 source files use newer Hermes syntax (match, component, const type params)
// that 0.25.1 cannot parse. We replace the parse function in all nested copies.
const hermesParser034 = require(path.resolve(__dirname, '..', 'node_modules', 'hermes-parser'));

const nestedParsers = [
  path.resolve(__dirname, '..', 'node_modules', 'babel-preset-expo', 'node_modules', 'hermes-parser'),
  path.resolve(__dirname, '..', 'node_modules', '@react-native', 'babel-preset', 'node_modules', 'hermes-parser'),
];

nestedParsers.forEach(parserPath => {
  try {
    const nested = require(parserPath);
    Object.keys(hermesParser034).forEach(key => {
      nested[key] = hermesParser034[key];
    });
  } catch (_) {}
});

const reanimatedPlugin = path.resolve(__dirname, '..', 'node_modules', 'react-native-reanimated', 'plugin');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [reanimatedPlugin],
  };
};
