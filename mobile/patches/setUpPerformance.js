'use strict';

/**
 * Patched setUpPerformance.js
 *
 * Hermes (new architecture) defines `global.performance` as a non-writable
 * native property. React Native's original file does `global.performance = ...`
 * unconditionally, which throws "TypeError: property is not writable" at startup.
 *
 * This patch wraps the assignment in a try-catch so the app initializes safely
 * whether or not Hermes already owns `performance`.
 */

var path = require('path');
var rnRoot = path.resolve(__dirname, '..', '..', 'node_modules', 'react-native');

var Performance = require(path.join(rnRoot, 'src/private/webapis/performance/Performance')).default;
var NativePerformance = require(path.join(rnRoot, 'src/private/webapis/performance/specs/NativePerformance')).default;

function safeSetPerformance(value) {
  try {
    global.performance = value;
  } catch (_) {
    try {
      Object.defineProperty(global, 'performance', {
        value: value,
        configurable: true,
        writable: true,
      });
    } catch (_2) {
      // Hermes already has a native performance implementation — that's fine.
    }
  }
}

if (NativePerformance) {
  safeSetPerformance(new Performance());
} else {
  if (!global.performance) {
    safeSetPerformance({
      mark: function() {},
      measure: function() {},
      now: function() {
        var performanceNow = global.nativePerformanceNow || Date.now;
        return performanceNow();
      },
    });
  }
}
