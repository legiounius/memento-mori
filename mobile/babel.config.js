const path = require('path');

const hermesPlugin = path.resolve(__dirname, '..', 'node_modules', 'babel-plugin-syntax-hermes-parser');
const reanimatedPlugin = path.resolve(__dirname, '..', 'node_modules', 'react-native-reanimated', 'plugin');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Index 0 runs LAST (Babel reverses preset order).
      // This overrides babel-preset-expo's nested hermes-parser@0.25.1
      // with our root hermes-parser@0.34.0 which supports match/component/enum syntax.
      () => ({ plugins: [hermesPlugin] }),
      'babel-preset-expo',
    ],
    plugins: [reanimatedPlugin],
  };
};
