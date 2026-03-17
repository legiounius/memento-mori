const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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
// patching. RN 0.81.4 source uses newer Hermes syntax (const type params, component
// declarations) that 0.25.1 cannot parse.
config.transformer.babelTransformerPath = require.resolve('./customBabelTransformer');

// Redirect Hermes-syntax files to patched standard-JS versions
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('virtualview/VirtualView')) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'patches/VirtualView.js'),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
