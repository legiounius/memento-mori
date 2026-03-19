const path = require('path');

const rootNodeModules = path.resolve(__dirname, '../node_modules');

const nativePackages = [
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-svg',
  '@react-navigation/native',
  '@react-navigation/bottom-tabs',
  '@react-navigation/native-stack',
  'expo-asset',
  'expo-file-system',
  'expo-font',
  'expo-keep-awake',
  'expo-modules-core',
  'expo-print',
  'expo-splash-screen',
  'expo-status-bar',
];

const dependencies = {};
for (const pkg of nativePackages) {
  const pkgPath = path.join(rootNodeModules, pkg);
  try {
    require.resolve(path.join(pkgPath, 'package.json'));
    dependencies[pkg] = { root: pkgPath };
  } catch (_) {}
}

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies,
};
