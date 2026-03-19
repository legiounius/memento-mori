const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.assetExts = [...(config.resolver.assetExts || []), 'csv'];

// Force all nested hermes-parser@0.25.1 instances to use 0.34.0 via require.cache
config.transformer.babelTransformerPath = require.resolve('./customBabelTransformer');

// Build a lookup: componentName -> compiled JS path for react-native-screens fabric components.
// These TypeScript spec files use CodegenTypes which is undefined in RN 0.81.4, causing
// "Unknown prop type" errors. The pre-compiled lib/commonjs/fabric/*.js files are plain JS
// with no TypeScript types and work fine.
const fabricRoot = path.resolve(workspaceRoot, 'node_modules/react-native-screens/lib/commonjs/fabric');
const rnScreensNativeComponents = {};
function indexFabricDir(dir, prefix) {
  try {
    fs.readdirSync(dir).forEach(f => {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        indexFabricDir(full, prefix + f + '/');
      } else if (f.endsWith('NativeComponent.js') && !f.endsWith('.map')) {
        const name = f.replace('.js', '');
        rnScreensNativeComponents[name] = full;
      }
    });
  } catch (_) {}
}
indexFabricDir(fabricRoot, '');

// Redirect Hermes-syntax files and react-native-screens fabric TypeScript specs
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('virtualview/VirtualView')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'patches/VirtualView.js'),
    };
  }
  if (moduleName.endsWith('ViewConfigIgnore')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'patches/ViewConfigIgnore.js'),
    };
  }

  // Redirect react-native-gesture-handler TypeScript/native-enforcing specs to JS patches.
  // NativeRNGestureHandlerModule uses getEnforcing() which throws when the native binary
  // doesn't have the module. Our patch uses get() + a no-op shim so the app can launch.
  // We match on moduleName alone (not the package prefix) because internal imports use
  // relative paths like "./specs/NativeRNGestureHandlerModule" which don't contain the
  // package name.
  const ghOrigin = context.originModulePath || '';
  const isFromGH = ghOrigin.includes('react-native-gesture-handler') ||
                   moduleName.includes('react-native-gesture-handler');
  if (moduleName.endsWith('NativeRNGestureHandlerModule')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'patches/NativeRNGestureHandlerModule.js'),
    };
  }
  if (isFromGH && moduleName.endsWith('RNGestureHandlerButtonNativeComponent')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'patches/RNGestureHandlerButtonNativeComponent.js'),
    };
  }
  if (isFromGH && moduleName.endsWith('RNGestureHandlerRootViewNativeComponent')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'patches/RNGestureHandlerRootViewNativeComponent.js'),
    };
  }

  // Redirect react-native-screens TypeScript fabric NativeComponent specs
  // to their pre-compiled lib/commonjs/fabric/*.js equivalents.
  // We use the lookup table as the guard (not originModulePath) so it only
  // matches react-native-screens components regardless of who imports them.
  if (moduleName.endsWith('NativeComponent')) {
    const componentName = moduleName.split('/').pop();
    if (rnScreensNativeComponents[componentName]) {
      return {
        type: 'sourceFile',
        filePath: rnScreensNativeComponents[componentName],
      };
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
