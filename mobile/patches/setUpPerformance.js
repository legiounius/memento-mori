'use strict';

/**
 * Patched setUpPerformance.js
 *
 * Hermes (new architecture) defines `global.performance` as a non-writable
 * native property. The original file does `global.performance = new Performance()`
 * unconditionally when NativePerformance is available, throwing:
 *   "TypeError: property is not writable"
 *
 * Since Hermes already provides a fully-functional performance API natively,
 * we simply skip the re-assignment if the property already exists. If it doesn't
 * exist we fall back to the minimal shim from the original else-branch.
 */

if (!global.performance) {
  global.performance = {
    mark: function() {},
    measure: function() {},
    now: function() {
      var performanceNow = global.nativePerformanceNow || Date.now;
      return performanceNow();
    },
  };
}
