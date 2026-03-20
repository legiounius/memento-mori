'use strict';

/**
 * Global write shim — runs as a Metro polyfill before any React Native
 * initialization code.
 *
 * Hermes pre-defines certain globals as non-writable native properties.
 * React Native's setUp* chain writes to them directly (or via polyfillGlobal →
 * defineLazyObjectProperty → Object.defineProperty), crashing with:
 *   "TypeError: property is not writable"
 *
 * This shim re-opens those globals as writable+configurable BEFORE setUp*
 * runs, using Object.defineProperty while the properties are still
 * configurable (Hermes defines them configurable even when non-writable).
 *
 * NOTE: We do NOT override Object.defineProperty itself — that caused silent
 * swallowing of real errors ("App entry not found").
 */

var knownHermesNonWritableGlobals = [
  // Web Performance API — Hermes provides native implementation
  'performance',
  'PerformanceObserver',
  'PerformanceEntry',
  'PerformanceMark',
  'PerformanceMeasure',
  // Microtasks — Hermes bridgeless mode pre-installs these
  'queueMicrotask',
  'RN$enableMicrotasksInReact',
  // Other Hermes-provided APIs that RN may try to overwrite
  'WeakRef',
  'FinalizationRegistry',
  'URL',
  'URLSearchParams',
  'Blob',
  'FormData',
  'AbortController',
  'AbortSignal',
  'TextDecoder',
  'TextEncoder',
  'fetch',
  'Headers',
  'Request',
  'Response',
];

knownHermesNonWritableGlobals.forEach(function(name) {
  try {
    var descriptor = Object.getOwnPropertyDescriptor(global, name);
    if (descriptor && descriptor.writable === false && descriptor.configurable) {
      Object.defineProperty(global, name, {
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable !== false,
        value: descriptor.value,
      });
    }
  } catch (_) {}
});
