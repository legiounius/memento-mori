'use strict';

/**
 * Patched setUpTimers.js — guards the direct global assignments that crash
 * under Hermes when the global is non-writable (both old and new arch).
 *
 * Only change from the original: wrap `global.RN$enableMicrotasksInReact = true`
 * in a try/catch. All other logic (polyfillGlobal calls) is unchanged.
 */

const {polyfillGlobal} = require('react-native/Libraries/Utilities/PolyfillFunctions');

if (__DEV__) {
  if (typeof global.Promise !== 'function') {
    console.error('Promise should exist before setting up timers.');
  }
}

// In bridgeless mode, timers are host functions installed from cpp.
if (global.RN$Bridgeless === true) {
  // Guard: Hermes may define this as non-writable; use defineProperty with fallback.
  try {
    var descriptor = Object.getOwnPropertyDescriptor(global, 'RN$enableMicrotasksInReact');
    if (descriptor && !descriptor.writable && descriptor.configurable) {
      Object.defineProperty(global, 'RN$enableMicrotasksInReact', {
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable !== false,
        value: true,
      });
    } else {
      global.RN$enableMicrotasksInReact = true;
    }
  } catch (_) {}

  polyfillGlobal(
    'queueMicrotask',
    () =>
      require('react-native/src/private/webapis/microtasks/specs/NativeMicrotasks')
        .default.queueMicrotask,
  );

  // We shim the immediate APIs via `queueMicrotask` to maintain the backward
  // compatibility.
  polyfillGlobal(
    'setImmediate',
    () => require('react-native/Libraries/Core/Timers/immediateShim').setImmediate,
  );
  polyfillGlobal(
    'clearImmediate',
    () => require('react-native/Libraries/Core/Timers/immediateShim').clearImmediate,
  );

  polyfillGlobal(
    'requestIdleCallback',
    () =>
      require('react-native/src/private/webapis/idlecallbacks/specs/NativeIdleCallbacks')
        .default.requestIdleCallback,
  );

  polyfillGlobal(
    'cancelIdleCallback',
    () =>
      require('react-native/src/private/webapis/idlecallbacks/specs/NativeIdleCallbacks')
        .default.cancelIdleCallback,
  );
} else {
  const defineLazyTimer = (name) => {
    polyfillGlobal(name, () => require('react-native/Libraries/Core/Timers/JSTimers').default[name]);
  };
  defineLazyTimer('setTimeout');
  defineLazyTimer('clearTimeout');
  defineLazyTimer('setInterval');
  defineLazyTimer('clearInterval');
  defineLazyTimer('requestAnimationFrame');
  defineLazyTimer('cancelAnimationFrame');
  defineLazyTimer('requestIdleCallback');
  defineLazyTimer('cancelIdleCallback');

  polyfillGlobal(
    'queueMicrotask',
    () => require('react-native/Libraries/Core/Timers/queueMicrotask.js').default,
  );

  polyfillGlobal(
    'setImmediate',
    () => require('react-native/Libraries/Core/Timers/JSTimers').default.queueReactNativeMicrotask,
  );
  polyfillGlobal(
    'clearImmediate',
    () => require('react-native/Libraries/Core/Timers/JSTimers').default.clearReactNativeMicrotask,
  );
}
