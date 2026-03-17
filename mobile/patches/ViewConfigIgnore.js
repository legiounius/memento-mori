'use strict';

/**
 * Patched: removed const from type parameter and all relative imports.
 * Original: react-native/Libraries/NativeComponent/ViewConfigIgnore.js
 */

const ignoredViewConfigProps = new WeakSet();

export function DynamicallyInjectedByGestureHandler(object) {
  ignoredViewConfigProps.add(object);
  return object;
}

export function ConditionallyIgnoredEventHandlers(value) {
  if (
    typeof global !== 'undefined' &&
    global.__reactNativePlatformOS === 'ios'
  ) {
    return value;
  }
  // Use require to avoid module-level import resolution issues
  try {
    const Platform = require('react-native').Platform;
    if (Platform.OS === 'ios') {
      return value;
    }
  } catch (_) {
    return value;
  }
  return undefined;
}

export function isIgnored(value) {
  if (typeof value === 'object' && value != null) {
    return ignoredViewConfigProps.has(value);
  }
  return false;
}
