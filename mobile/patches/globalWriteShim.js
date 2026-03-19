'use strict';

/**
 * Global write shim — runs as a Metro polyfill before any React Native
 * initialization code. Makes known non-writable Hermes globals safely
 * assignable so that RN's setUp*.js files don't crash with
 * "TypeError: property is not writable".
 *
 * Execution order matters: patch Object.defineProperty first, then use
 * it to re-open the known non-writable native Hermes globals.
 */

// 1. Patch Object.defineProperty to silently absorb TypeErrors caused by
//    non-configurable properties. Must come first since step 2 uses it.
var _origDefineProperty = Object.defineProperty;
Object.defineProperty = function patchedDefineProperty(obj, prop, descriptor) {
  try {
    return _origDefineProperty.call(Object, obj, prop, descriptor);
  } catch (e) {
    if (e instanceof TypeError) {
      // Property is non-configurable — we can't change it. Return the object
      // unchanged so callers don't crash.
      return obj;
    }
    throw e;
  }
};

// 2. Make known Hermes-native non-writable globals writable so that RN's
//    setUp* chain can safely assign to them.
var knownGlobals = [
  'performance',
  'PerformanceObserver',
  'MutationObserver',
  'IntersectionObserver',
  'RN$enableMicrotasksInReact',
  '__fetchSegment',
  'navigator',
];

knownGlobals.forEach(function(name) {
  try {
    var descriptor = Object.getOwnPropertyDescriptor(global, name);
    if (descriptor && descriptor.writable === false) {
      Object.defineProperty(global, name, {
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable !== false,
        value: descriptor.value,
      });
    }
  } catch (_) {}
});
