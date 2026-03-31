const path = require('path');

const rootNodeModules = path.resolve(__dirname, '../node_modules');

// Only link the packages our minimal app actually uses natively.
// Keeping this list small prevents version-mismatch pod install failures.
const nativePackages = [
  'expo-modules-core',
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
