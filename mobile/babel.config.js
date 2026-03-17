const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      path.resolve(__dirname, '..', 'node_modules', 'babel-plugin-syntax-hermes-parser'),
      path.resolve(__dirname, '..', 'node_modules', 'react-native-reanimated', 'plugin'),
    ],
  };
};
